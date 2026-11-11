// Translates between this app's /v1/chat API and the generic chat widget.

const ACCESS_LABELS = {
  uae_pass_required: 'Needs UAE PASS',
  guest_available: 'Guest access to first step',
  unknown: 'Sign-in not verified',
};

export const ASSISTANT_COPY = {
  title: 'Services Assistant',
  placeholder: 'Ask about a service, fees or UAE PASS',
  labels: { openLauncher: 'Open services assistant', closeLauncher: 'Close services assistant', close: 'Close assistant' },
};

/** Text label for a service's observed sign-in requirement (never colour alone). */
export function accessLabel(access) {
  return ACCESS_LABELS[access] ?? ACCESS_LABELS.unknown;
}

/** Cards for the services a reply is about: a sign-in badge plus "View details" and "Start service" buttons. */
export function toItems(services = []) {
  return services.map(service => ({
    id: service.id,
    title: service.name,
    badge: accessLabel(service.access),
    actions: [
      { id: 'view', label: 'View details', ariaLabel: `View details: ${service.name}` },
      { id: 'start', label: 'Start service', ariaLabel: `Start service: ${service.name}` },
    ],
    href: service.officialUrl ?? undefined,
    linkLabel: 'Official page',
  }));
}

/** Convert one whole /v1/chat response into the widget's `{ reply, items }` shape. */
export function toChatReply(response) {
  return { reply: response.reply, items: toItems(response.services) };
}

/**
 * Convert the /v1/chat/stream events into the widget's pieces: each `delta` becomes text, `done` adds the cards.
 * An `error` event (the answer broke off part-way) throws, so the chat shows its "unavailable" message.
 */
export async function* toPieces(events) {
  for await (const event of events) {
    if (event.type === 'delta') yield event.text;
    else if (event.type === 'done') yield { items: toItems(event.services) };
    else if (event.type === 'error') throw new Error(event.message ?? 'The answer stopped');
  }
}
