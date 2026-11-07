import { useEffect, useId, useRef, useState } from 'react';
import { DEFAULT_LABELS, DEFAULT_PLACEHOLDER, DEFAULT_TITLE } from '../../../helpers/chatLabels.mjs';
import { DEFAULT_MAX_MESSAGE_LENGTH, activeSuggestions, safeHref } from '../../../helpers/chatHelpers.mjs';
import { DEFAULT_VOICE_MAX_SECONDS, appendText, formatDuration, isVoiceSupported } from '../../../helpers/voice.mjs';
import { useChatWidget } from './ChatWidget.vm.js';
import { useVoiceInput } from './useVoiceInput.js';

/**
 * Floating chat widget: a launcher button and a panel. It knows nothing about your app.
 *
 * Required: `onSend(text, history)` -> Promise<{ reply, items?, suggestions? }>, or an async iterable of text pieces to
 * show the reply as it is written (reject / throw to show an error).
 * Open state: pass `open` + `onOpenChange` to control it, or omit both to let the widget manage itself.
 * Voice: pass `onTranscribe(blob)` -> Promise<string> to show a microphone button. The widget records, calls it with the
 * audio, and puts the returned text in the message box for the user to check and send. No `onTranscribe`, no button.
 * Optional: `title`, `subtitle`, `welcomeMessage` (none by default), `suggestions`, `placeholder`, `labels`, `maxMessageLength`,
 * `maxHistory`, `onItemAction(actionId, item)`, `renderBadge(item)`, `className`, `launcherIcon`.
 *
 * Reply items: `{ id, title, badge?, actions?: [{ id, label, ariaLabel? }], href?, linkLabel? }`.
 * The widget stays mounted while closed, so the conversation survives closing the panel.
 */
export default function ChatWidget({
  onSend,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  title = DEFAULT_TITLE,
  subtitle,
  welcomeMessage = '',
  suggestions = [],
  placeholder = DEFAULT_PLACEHOLDER,
  labels: labelOverrides,
  maxMessageLength = DEFAULT_MAX_MESSAGE_LENGTH,
  maxHistory,
  onTranscribe,
  voiceMaxSeconds = DEFAULT_VOICE_MAX_SECONDS,
  onItemAction,
  renderBadge,
  launcherIcon,
  className = '',
}) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const controlled = openProp !== undefined;
  const [openState, setOpenState] = useState(defaultOpen);
  const open = controlled ? openProp : openState;
  const setOpen = value => { if (!controlled) setOpenState(value); onOpenChange?.(value); };

  const { messages, input, setInput, busy, error, send, submit, clear, starterSuggestions } = useChatWidget({
    onSend,
    welcomeMessage,
    suggestions,
    unavailableMessage: labels.unavailable,
    maxMessageLength,
    maxHistory,
  });
  const ids = { input: useId(), panel: useId(), title: useId() };
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const wasOpen = useRef(open);
  const voiceEnabled = typeof onTranscribe === 'function' && isVoiceSupported();
  const voice = useVoiceInput({
    onTranscribe,
    maxSeconds: voiceMaxSeconds,
    onText: text => { setInput(current => appendText(current, text, maxMessageLength)); inputRef.current?.focus(); },
  });
  const voiceBusy = voice.state !== 'idle';
  const voiceErrorText = {
    denied: labels.micDenied, notFound: labels.micNotFound, busy: labels.micBusy, failed: labels.micFailed,
    empty: labels.micEmpty, nothingHeard: labels.micNothingHeard,
  }[voice.error];
  const visibleSuggestions = busy ? [] : [...starterSuggestions, ...activeSuggestions(messages)];

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) launcherRef.current?.focus();
    if (!open) voice.cancel();   // never keep the microphone on while the panel is closed
    wasOpen.current = open;
  }, [open]);  // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [messages, busy, error]);

  const onKeyDown = event => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); } };

  return (
    <div className={`cw-widget ${className}`.trim()} data-open={open}>
      <section id={ids.panel} className="cw-panel" role="dialog" aria-modal="false" aria-labelledby={ids.title} hidden={!open} onKeyDown={onKeyDown}>
        <header className="cw-header">
          <div>
            <h2 id={ids.title}>{title}</h2>
            {subtitle && <p className="cw-subtitle">{subtitle}</p>}
          </div>
          <div className="cw-header-actions">
            <button type="button" className="cw-clear" onClick={clear}>{labels.clear}</button>
            <button type="button" className="cw-close" aria-label={labels.close} onClick={() => setOpen(false)}>×</button>
          </div>
        </header>

        <div className="cw-log" ref={logRef} role="log" aria-label={labels.conversation} aria-live="polite">
          {messages.map(message => (
            <div key={message.id} className={`cw-message cw-message--${message.role}`}>
              <span className="cw-sr-only">{message.role === 'user' ? labels.you : labels.assistant}</span>
              <p className="cw-bubble">{message.text}</p>
              {message.items.length > 0 && (
                <ul className="cw-items">
                  {message.items.map(item => {
                    const href = item.href ? safeHref(item.href) : null;
                    return (
                      <li key={item.id} className="cw-item">
                        <strong>{item.title}</strong>
                        {item.badge && <span className="cw-badge">{renderBadge ? renderBadge(item) : item.badge}</span>}
                        <span className="cw-item-actions">
                          {(item.actions ?? []).map(action => (
                            <button key={action.id} type="button" aria-label={action.ariaLabel ?? `${action.label}: ${item.title}`}
                              onClick={() => onItemAction?.(action.id, item)}>{action.label}</button>
                          ))}
                          {href && (
                            <a href={href} target="_blank" rel="noopener noreferrer">
                              {item.linkLabel ?? href}<span className="cw-sr-only"> {labels.opensInNewTab}</span>
                            </a>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
          {busy && messages.at(-1)?.role !== 'assistant' && <p className="cw-status" role="status">{labels.typing}</p>}
          {error && <p className="cw-error" role="alert">{error}</p>}
        </div>

        {visibleSuggestions.length > 0 && (
          <div className="cw-suggestions" role="group" aria-label={labels.suggestions}>
            {visibleSuggestions.map(text => (
              <button key={text} type="button" disabled={busy} onClick={() => send(text)}>{text}</button>
            ))}
          </div>
        )}

        {voiceEnabled && voice.state === 'recording' && (
          <p className="cw-voice-status cw-voice-status--recording" role="status">
            <span className="cw-rec-dot" aria-hidden="true" />{labels.recording} {formatDuration(voice.seconds)}. {labels.recordingHint}
          </p>
        )}
        {voiceEnabled && voice.state === 'transcribing' && <p className="cw-voice-status" role="status">{labels.transcribing}</p>}
        {voiceEnabled && voiceErrorText && <p className="cw-voice-status cw-voice-status--error" role="alert">{voiceErrorText}</p>}

        <form className="cw-form" onSubmit={submit}>
          <label htmlFor={ids.input} className="cw-sr-only">{labels.inputLabel}</label>
          <input id={ids.input} ref={inputRef} value={input} maxLength={maxMessageLength} autoComplete="off" disabled={busy || voiceBusy}
            placeholder={placeholder} onChange={event => setInput(event.target.value)} />
          {voiceEnabled && (
            <button type="button" className={`cw-mic${voice.state === 'recording' ? ' cw-mic--recording' : ''}`}
              aria-label={voice.state === 'recording' ? labels.micStop : labels.micStart} aria-pressed={voice.state === 'recording'}
              disabled={busy || voice.state === 'transcribing'} onClick={voice.state === 'recording' ? voice.stop : voice.start}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                {voice.state === 'recording'
                  ? <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                  : <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></>}
              </svg>
            </button>
          )}
          <button type="submit" className="cw-send" disabled={busy || voiceBusy || !input.trim()}>{labels.send}</button>
        </form>
      </section>

      <button ref={launcherRef} type="button" className="cw-launcher" aria-expanded={open} aria-controls={ids.panel}
        aria-label={open ? labels.closeLauncher : labels.openLauncher} onClick={() => setOpen(!open)}>
        {launcherIcon ?? (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12zM9 11h6M9 14h4" />}
          </svg>
        )}
      </button>
    </div>
  );
}
