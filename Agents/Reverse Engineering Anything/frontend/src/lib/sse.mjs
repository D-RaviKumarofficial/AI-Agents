// Reads Server-Sent Events from a streamed fetch response.

/** Split `buffer` into complete events and the unfinished remainder. Each event is `data: <json>`. */
export function parseSse(buffer) {
  const blocks = buffer.replaceAll('\r\n', '\n').split('\n\n');
  const rest = blocks.pop() ?? '';
  const events = [];
  for (const block of blocks) {
    const data = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
    if (!data) continue;
    try { events.push(JSON.parse(data)); } catch { /* ignore a malformed event */ }
  }
  return { events, rest };
}

/** Yield every JSON event from a fetch `Response` with a streamed body, as they arrive. */
export async function* readEvents(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSse(buffer);
      buffer = parsed.rest;
      yield* parsed.events;
    }
    buffer += decoder.decode();
    yield* parseSse(`${buffer}\n\n`).events;
  } finally {
    reader.cancel().catch(() => {});
  }
}
