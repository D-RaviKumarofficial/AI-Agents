import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSse, readEvents } from '../src/lib/sse.mjs';
import { toItems, toPieces } from '../src/lib/assistantAdapter.mjs';

const collect = async iterable => {
  const out = [];
  for await (const x of iterable) out.push(x);
  return out;
};
const encode = text => new TextEncoder().encode(text);
const responseOf = chunks => ({
  body: new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encode(chunk));
      controller.close();
    },
  }),
});

test('parseSse returns complete events and keeps the unfinished remainder', () => {
  const { events, rest } = parseSse('data: {"type":"delta","text":"Hi"}\n\ndata: {"type":"do');
  assert.deepEqual(events, [{ type: 'delta', text: 'Hi' }]);
  assert.equal(rest, 'data: {"type":"do');
});

test('parseSse handles several events and CRLF, and ignores comments and malformed data', () => {
  const { events, rest } = parseSse(': ping\r\n\r\ndata: {"a":1}\r\n\r\ndata: not json\n\ndata: {"b":2}\n\n');
  assert.deepEqual(events, [{ a: 1 }, { b: 2 }]);
  assert.equal(rest, '');
});

test('parseSse on an empty buffer returns nothing', () => {
  assert.deepEqual(parseSse(''), { events: [], rest: '' });
});

test('readEvents reassembles an event split across network chunks, even in the middle of a character', async () => {
  const text = 'data: {"type":"delta","text":"héllo"}\n\n';
  const bytes = encode(text);
  const split = bytes.indexOf(0xc3) + 1; // between the two bytes of é
  const response = {
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(bytes.slice(0, split));
        controller.enqueue(bytes.slice(split));
        controller.close();
      },
    }),
  };
  assert.deepEqual(await collect(readEvents(response)), [{ type: 'delta', text: 'héllo' }]);
});

test('readEvents yields events in order and flushes a last event that has no blank line after it', async () => {
  const events = await collect(readEvents(responseOf(['data: {"n":1}\n\ndata: {"n":2}\n\n', 'data: {"n":3}'])));
  assert.deepEqual(events, [{ n: 1 }, { n: 2 }, { n: 3 }]);
});

test('readEvents on an empty body yields nothing', async () => {
  assert.deepEqual(await collect(readEvents(responseOf([]))), []);
});

test('toPieces turns deltas into text and done into cards', async () => {
  async function* events() {
    yield { type: 'delta', text: 'It ' };
    yield { type: 'delta', text: 'needs UAE PASS.' };
    yield { type: 'done', source: 'model', services: [{ id: 'a', name: 'A', access: 'uae_pass_required', officialUrl: 'https://x.test/a' }] };
  }
  const pieces = await collect(toPieces(events()));
  assert.equal(pieces[0], 'It ');
  assert.equal(pieces[1], 'needs UAE PASS.');
  assert.deepEqual(pieces[2].items.map(i => [i.id, i.title, i.badge]), [['a', 'A', 'Needs UAE PASS']]);
});

test('toPieces throws when the answer breaks off, after the text already shown', async () => {
  async function* events() {
    yield { type: 'delta', text: 'Half' };
    yield { type: 'error', message: 'The assistant stopped answering.' };
  }
  const seen = [];
  await assert.rejects(async () => {
    for await (const piece of toPieces(events())) seen.push(piece);
  }, /stopped answering/);
  assert.deepEqual(seen, ['Half']);
});

test('toPieces ignores unknown events and handles an empty stream', async () => {
  async function* ping() {
    yield { type: 'ping' };
  }
  async function* none() {}
  assert.deepEqual(await collect(toPieces(ping())), []);
  assert.deepEqual(await collect(toPieces(none())), []);
});

test('toItems gives each service a view and a start button, and tolerates missing input', () => {
  assert.deepEqual(toItems(), []);
  const [item] = toItems([{ id: 'x', name: 'X', access: 'unknown' }]);
  assert.deepEqual(item.actions.map(a => a.id), ['view', 'start']);
  assert.equal(item.href, undefined);
});
