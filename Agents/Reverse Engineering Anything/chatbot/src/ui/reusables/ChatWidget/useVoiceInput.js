import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_VOICE_MAX_SECONDS, micErrorKind, pickMimeType } from '../../../helpers/voice.mjs';

/**
 * ViewModel for the microphone button: record, turn the recording into text, hand the text back.
 *
 * `onTranscribe(blob)` is supplied by the host app and resolves to the recognised text. `onText(text)` receives it.
 * The state is 'idle', 'recording' or 'transcribing'; `error` is '' or one of 'denied', 'notFound', 'busy', 'failed',
 * 'empty' (nothing recorded) or 'nothingHeard' (no speech found). The microphone is released as soon as recording
 * stops, when `cancel()` is called, and when the component unmounts. Audio is never kept after it is sent.
 */
export function useVoiceInput({ onTranscribe, onText, maxSeconds = DEFAULT_VOICE_MAX_SECONDS }) {
  const [state, setState] = useState('idle');
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const discardRef = useRef(false);
  const startingRef = useRef(false);   // set the instant the button is pressed, before the permission prompt answers
  const aliveRef = useRef(true);
  const callbacks = useRef({ onTranscribe, onText });
  callbacks.current = { onTranscribe, onText };

  const releaseMicrophone = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }, []);

  const finish = useCallback(async (chunks, type) => {
    const blob = new Blob(chunks, { type: type || 'audio/webm' });
    if (!blob.size) {
      if (aliveRef.current) { setError('empty'); setState('idle'); }
      return;
    }
    if (aliveRef.current) setState('transcribing');
    try {
      const text = String((await callbacks.current.onTranscribe(blob)) ?? '').trim();
      if (!aliveRef.current) return;
      if (text) callbacks.current.onText(text);
      else setError('nothingHeard');
    } catch {
      if (aliveRef.current) setError('failed');
    } finally {
      if (aliveRef.current) setState('idle');
    }
  }, []);

  const start = useCallback(async () => {
    if (startingRef.current || recorderRef.current || state !== 'idle') return;
    startingRef.current = true;
    setError('');
    discardRef.current = false;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (failure) {
      startingRef.current = false;
      if (aliveRef.current) setError(micErrorKind(failure));
      return;
    }
    startingRef.current = false;
    if (!aliveRef.current) { stream.getTracks().forEach(track => track.stop()); return; }
    streamRef.current = stream;
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks = [];
    recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
    recorder.onerror = () => { discardRef.current = true; releaseMicrophone(); recorderRef.current = null; setError('failed'); setState('idle'); };
    recorder.onstop = () => {
      releaseMicrophone();
      recorderRef.current = null;
      if (discardRef.current) { if (aliveRef.current) setState('idle'); return; }
      finish(chunks, recorder.mimeType || mimeType);
    };
    recorderRef.current = recorder;
    recorder.start();
    setSeconds(0);
    setState('recording');
    const startedAt = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      setSeconds(elapsed);
      if (elapsed >= maxSeconds && recorderRef.current?.state === 'recording') recorderRef.current.stop();
    }, 250);
  }, [state, maxSeconds, finish, releaseMicrophone]);

  /** Stop recording and transcribe what was said. */
  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  /** Stop recording and throw the audio away. */
  const cancel = useCallback(() => {
    discardRef.current = true;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    else releaseMicrophone();
  }, [releaseMicrophone]);

  const clearError = useCallback(() => setError(''), []);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      discardRef.current = true;
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      releaseMicrophone();
    };
  }, [releaseMicrophone]);

  return { state, seconds, error, start, stop, cancel, clearError };
}
