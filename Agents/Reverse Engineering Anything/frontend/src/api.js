import { readEvents } from './lib/sse.mjs';
// API client for the FastAPI backend (see ../backend). All data is synthetic and
// stored in the backend's SQLite database; nothing is sent to any authority.

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1';

async function request(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

async function readJson(response) {
  return response.json().catch(() => ({}));
}

/** Throw a readable error for read endpoints. */
async function getJson(path) {
  const response = await request(path);
  const body = await readJson(response);
  if (!response.ok) throw new Error(body.message ?? `Request failed (${response.status})`);
  return body;
}

/**
 * Create endpoints resolve with `{ ok, json() }` so the views can show field errors.
 * The backend's standard error body is mapped to `{ errors, error }`.
 */
async function postJson(path, data) {
  let response;
  try {
    response = await request(path, { method: 'POST', body: JSON.stringify(data) });
  } catch {
    return { ok: false, json: async () => ({ error: 'Service unavailable. Please try again.' }) };
  }
  const body = await readJson(response);
  if (response.ok) return { ok: true, json: async () => body };
  return { ok: false, json: async () => ({ errors: body.details?.field_errors, error: body.message }) };
}

export const api = {
  icons: () => fetch('/assets/icons.json').then(r => (r.ok ? r.json() : {})).catch(() => ({})),
  catalog: () => getJson('/catalog'),
  reports: () => getJson('/reports?limit=200'),
  submissions: () => getJson('/submissions?limit=200'),
  createReport: data => postJson('/reports', data),
  createSubmission: data => postJson('/submissions', data),
  /** Ask the services assistant. Rejects if the request fails. */
  chat: async (message, history = []) => {
    const response = await request('/chat', { method: 'POST', body: JSON.stringify({ message, history }) });
    const body = await readJson(response);
    if (!response.ok) throw new Error(body.message ?? `Request failed (${response.status})`);
    return body;
  },
  /**
   * Ask the services assistant and read the answer as it is written.
   * Yields the backend's events: `{ type: 'delta', text }`, then `{ type: 'done', services, source }`
   * (or `{ type: 'error' }`). Throws if the request is rejected, for example with 503 when the model is unavailable.
   */
  chatStream: async function* (message, history = []) {
    const response = await request('/chat/stream', { method: 'POST', body: JSON.stringify({ message, history }) });
    if (!response.ok) throw new Error((await readJson(response)).message ?? `Request failed (${response.status})`);
    yield* readEvents(response);
  },
  /**
   * Turn a recording into text with the backend's speech model. `language` is optional ("en", "ar", "ta"...).
   * Resolves to `{ text, language, ... }`; rejects with a readable message if the recording is rejected.
   */
  transcribe: async (blob, language) => {
    const query = language ? `?language=${encodeURIComponent(language)}` : '';
    const response = await fetch(`${API_BASE}/speech/transcribe${query}`, {
      method: 'POST',
      headers: { 'Content-Type': blob.type || 'application/octet-stream' },
      body: blob,
    });
    const body = await readJson(response);
    if (!response.ok) throw new Error(body.message ?? `Request failed (${response.status})`);
    return body;
  },
  reset: async () => {
    const response = await request('/reset', { method: 'POST' });
    if (!response.ok) throw new Error('Reset failed');
    return readJson(response);
  },
};
