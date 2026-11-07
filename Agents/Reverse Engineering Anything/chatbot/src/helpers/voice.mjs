// Pure helpers for the microphone button (no React, so they are unit-testable).

export const DEFAULT_VOICE_MAX_SECONDS = 60;

// Most browsers record WebM/Opus; Firefox prefers Ogg/Opus; Safari records MP4/AAC. The first one supported wins.
const PREFERRED_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];

/** True if this browser can record from a microphone (needs MediaRecorder and getUserMedia, on https or localhost). */
export function isVoiceSupported(win = globalThis) {
  return Boolean(win?.MediaRecorder && win?.navigator?.mediaDevices?.getUserMedia);
}

/** The best recording format this browser supports, or '' to let the browser choose. */
export function pickMimeType(Recorder = globalThis.MediaRecorder) {
  if (!Recorder || typeof Recorder.isTypeSupported !== 'function') return '';
  return PREFERRED_TYPES.find(type => Recorder.isTypeSupported(type)) ?? '';
}

/** Which message to show for a failed microphone request: 'denied', 'notFound', 'busy' or 'failed'. */
export function micErrorKind(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return 'denied';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'notFound';
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'busy';
    default:
      return 'failed';
  }
}

/** Seconds as m:ss, for the recording timer. Bad input shows 0:00. */
export function formatDuration(seconds) {
  const whole = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/** Add dictated text after what the user already typed, cut to `max` characters. */
export function appendText(current, addition, max) {
  const joined = [String(current ?? '').trim(), String(addition ?? '').trim()].filter(Boolean).join(' ');
  return joined.slice(0, max);
}
