import { useCallback, useRef, useState } from 'react';
import {
  DEFAULT_MAX_HISTORY,
  DEFAULT_MAX_MESSAGE_LENGTH,
  addMessage,
  applyPiece,
  cleanInput,
  createWelcome,
  fromResponse,
  isStream,
} from '../../../helpers/chatHelpers.mjs';

/**
 * ViewModel for the chat widget: conversation state and sending.
 * `onSend(text, history)` is supplied by the host app (`history` is the earlier `{ role, text }` turns, which the
 * host may ignore). It resolves to `{ reply, items?, suggestions? }`, or returns an async iterable of pieces
 * (strings, or `{ text?, items?, suggestions? }`) that is shown as it arrives;
 * if it rejects, `unavailableMessage` is shown. Messages are kept in memory only.
 * `welcomeMessage` and `suggestions` are read when the conversation starts and when it is cleared.
 * With no `welcomeMessage` the conversation starts empty.
 */
export function useChatWidget({
  onSend,
  welcomeMessage,
  suggestions = [],
  unavailableMessage,
  maxMessageLength = DEFAULT_MAX_MESSAGE_LENGTH,
  maxHistory = DEFAULT_MAX_HISTORY,
}) {
  const nextId = useRef(1);
  const busyRef = useRef(false);
  const historyRef = useRef([]);
  const [messages, setMessages] = useState(() => createWelcome(0, welcomeMessage, suggestions));
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  historyRef.current = messages.map(m => ({ role: m.role, text: m.text })).filter(m => m.text);

  const send = useCallback(async text => {
    const message = cleanInput(text, maxMessageLength);
    if (!message || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    setInput('');
    setMessages(history => addMessage(history, { id: nextId.current++, role: 'user', text: message, items: [], suggestions: [] }, maxHistory));
    try {
      const response = await onSend(message, historyRef.current);
      if (isStream(response)) {
        await readStream(response);
      } else {
        setMessages(history => addMessage(history, fromResponse(nextId.current++, response), maxHistory));
      }
    } catch {
      setError(unavailableMessage);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [onSend, unavailableMessage, maxMessageLength, maxHistory]);

  /** Show a streaming reply: start the assistant's message on the first piece, then grow it. */
  async function readStream(pieces) {
    const id = nextId.current++;
    let started = false;
    for await (const piece of pieces) {
      // Capture now: React runs the updater later, after `started` has already changed.
      const isFirst = !started;
      started = true;
      setMessages(history => {
        if (isFirst) return addMessage(history, applyPiece({ id, role: 'assistant', text: '', items: [], suggestions: [] }, piece), maxHistory);
        return history.map(m => (m.id === id ? applyPiece(m, piece) : m));
      });
    }
    if (!started) throw new Error('empty reply');
  }

  const submit = useCallback(event => {
    event.preventDefault();
    send(input);
  }, [input, send]);

  const clear = useCallback(() => {
    setMessages(createWelcome(nextId.current++, welcomeMessage, suggestions));
    setError('');
    setInput('');
  }, [welcomeMessage, suggestions]);

  return { messages, input, setInput, busy, error, send, submit, clear, starterSuggestions: messages.length ? [] : suggestions };
}
