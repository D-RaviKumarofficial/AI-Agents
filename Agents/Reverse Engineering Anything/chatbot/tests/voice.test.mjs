import { describe, expect, it } from 'vitest';
import { appendText, formatDuration, isVoiceSupported, micErrorKind, pickMimeType } from '../src/helpers/voice.mjs';

describe('isVoiceSupported', () => {
  const full = { MediaRecorder: class {}, navigator: { mediaDevices: { getUserMedia: () => {} } } };
  it('is true when MediaRecorder and getUserMedia exist', () => expect(isVoiceSupported(full)).toBe(true));
  it.each([
    ['no MediaRecorder', { navigator: full.navigator }],
    ['no getUserMedia', { MediaRecorder: class {}, navigator: { mediaDevices: {} } }],
    ['no mediaDevices (http page)', { MediaRecorder: class {}, navigator: {} }],
    ['empty', {}],
    ['null', null],
  ])('is false with %s', (_label, win) => expect(isVoiceSupported(win)).toBe(false));
});

describe('pickMimeType', () => {
  const recorder = supported => ({ isTypeSupported: type => supported.includes(type) });
  it('prefers webm with opus', () => expect(pickMimeType(recorder(['audio/webm;codecs=opus', 'audio/mp4']))).toBe('audio/webm;codecs=opus'));
  it('falls back to ogg for Firefox', () => expect(pickMimeType(recorder(['audio/ogg;codecs=opus']))).toBe('audio/ogg;codecs=opus'));
  it('falls back to mp4 for Safari', () => expect(pickMimeType(recorder(['audio/mp4']))).toBe('audio/mp4'));
  it('lets the browser choose when nothing matches', () => expect(pickMimeType(recorder([]))).toBe(''));
  it('is empty without a recorder or without isTypeSupported', () => {
    expect(pickMimeType(undefined)).toBe('');
    expect(pickMimeType({})).toBe('');
  });
});

describe('micErrorKind', () => {
  it.each([
    ['NotAllowedError', 'denied'], ['PermissionDeniedError', 'denied'], ['SecurityError', 'denied'],
    ['NotFoundError', 'notFound'], ['DevicesNotFoundError', 'notFound'], ['OverconstrainedError', 'notFound'],
    ['NotReadableError', 'busy'], ['TrackStartError', 'busy'], ['AbortError', 'busy'],
    ['TypeError', 'failed'], ['', 'failed'],
  ])('%s -> %s', (name, kind) => expect(micErrorKind({ name })).toBe(kind));
  it('treats a missing error as a general failure', () => {
    expect(micErrorKind(undefined)).toBe('failed');
    expect(micErrorKind(null)).toBe('failed');
  });
});

describe('formatDuration', () => {
  it.each([[0, '0:00'], [5.9, '0:05'], [59, '0:59'], [60, '1:00'], [125, '2:05'], [-3, '0:00'], [NaN, '0:00'], [undefined, '0:00'], [Infinity, '0:00']])(
    '%s -> %s', (seconds, text) => expect(formatDuration(seconds)).toBe(text));
});

describe('appendText', () => {
  it('adds dictated text after what was typed, with one space', () => expect(appendText('Hello', 'world', 100)).toBe('Hello world'));
  it('trims both parts', () => expect(appendText('  Hello  ', '  world  ', 100)).toBe('Hello world'));
  it('uses just the new text when the box was empty', () => expect(appendText('', 'world', 100)).toBe('world'));
  it('keeps what was typed when nothing was heard', () => expect(appendText('Hello', '', 100)).toBe('Hello'));
  it('cuts to the maximum length', () => expect(appendText('Hello', 'wonderful world', 12)).toBe('Hello wonder'));
  it('tolerates missing values', () => expect(appendText(undefined, null, 10)).toBe(''));
});
