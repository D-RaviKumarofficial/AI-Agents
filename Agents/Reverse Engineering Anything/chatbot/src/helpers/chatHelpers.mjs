// Pure helpers for the chat widget (no React, so they are unit-testable).

export const DEFAULT_MAX_MESSAGE_LENGTH = 500;
export const DEFAULT_MAX_HISTORY = 40;

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/** Trim a draft and cut it to `max` characters. */
export function cleanInput(text, max = DEFAULT_MAX_MESSAGE_LENGTH) {
  return String(text ?? '').trim().slice(0, max);
}

/** Append a message, keeping only the most recent `limit` messages. Does not mutate `history`. */
export function addMessage(history, message, limit = DEFAULT_MAX_HISTORY) {
  return [...history, message].slice(-limit);
}

/** The opening messages of a conversation: one welcome message, or none if `text` is empty. */
export function createWelcome(id, text, suggestions = []) {
  return text ? [{ id, role: 'assistant', text, items: [], suggestions }] : [];
}

/** Convert the host's reply (`{ reply, items?, suggestions? }`) to a chat message. */
export function fromResponse(id, response) {
  return {
    id,
    role: 'assistant',
    text: String(response?.reply ?? ''),
    items: Array.isArray(response?.items) ? response.items : [],
    suggestions: Array.isArray(response?.suggestions) ? response.suggestions : [],
  };
}

/** True if `value` is an async iterable (such as an async generator), i.e. a streaming reply. */
export function isStream(value) {
  return value != null && typeof value[Symbol.asyncIterator] === 'function';
}

/** A streaming reply's pieces. A piece is a string (more text) or an object `{ text?, items?, suggestions? }`. */
export function applyPiece(message, piece) {
  if (typeof piece === 'string') return { ...message, text: message.text + piece };
  const next = { ...message, text: message.text + String(piece?.text ?? '') };
  if (Array.isArray(piece?.items)) next.items = piece.items;
  if (Array.isArray(piece?.suggestions)) next.suggestions = piece.suggestions;
  return next;
}

/** The suggestions to show: only those on the latest assistant message. */
export function activeSuggestions(messages) {
  const last = messages.at(-1);
  return last?.role === 'assistant' ? last.suggestions : [];
}

/** Return `href` only if it is an http(s) URL, so a reply can never inject a `javascript:` link. */
export function safeHref(href) {
  try {
    const url = new URL(String(href));
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
