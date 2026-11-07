import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChatWidget from '../src/ui/reusables/ChatWidget/ChatWidget.jsx';

/** A stand-in for the browser's MediaRecorder that the test controls. */
class FakeRecorder {
  static instances = [];
  static isTypeSupported = type => type === 'audio/webm;codecs=opus';
  constructor(stream, options) {
    this.stream = stream;
    this.mimeType = options?.mimeType ?? '';
    this.state = 'inactive';
    FakeRecorder.instances.push(this);
  }
  start() { this.state = 'recording'; }
  stop() {
    if (this.state !== 'recording') return;
    this.state = 'inactive';
    if (FakeRecorder.data) this.ondataavailable?.({ data: FakeRecorder.data });
    this.onstop?.();
  }
}

let tracks;
let getUserMedia;
const mic = () => document.querySelector('.cw-mic');
const input = () => document.querySelector('.cw-form input');
const sendButton = () => document.querySelector('.cw-send');
const audio = () => new Blob([new Uint8Array(2048)], { type: 'audio/webm' });

function install({ withMic = true, grant = true, error } = {}) {
  tracks = [{ stop: vi.fn() }];
  getUserMedia = vi.fn(async () => {
    if (!grant) throw Object.assign(new Error('blocked'), { name: error ?? 'NotAllowedError' });
    return { getTracks: () => tracks };
  });
  FakeRecorder.instances = [];
  FakeRecorder.data = audio();
  if (withMic) {
    vi.stubGlobal('MediaRecorder', FakeRecorder);
    Object.defineProperty(globalThis.navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true });
  } else {
    vi.stubGlobal('MediaRecorder', undefined);
    Object.defineProperty(globalThis.navigator, 'mediaDevices', { value: undefined, configurable: true });
  }
}

const widget = (props = {}) =>
  render(<ChatWidget onSend={vi.fn().mockResolvedValue({ reply: 'ok' })} onTranscribe={vi.fn().mockResolvedValue('hello there')} defaultOpen {...props} />);
const press = async () => { await act(async () => { fireEvent.click(mic()); }); };

beforeEach(() => install());
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('microphone button visibility', () => {
  it('is shown when the host passes onTranscribe and the browser can record', () => {
    widget();
    expect(mic()).toBeTruthy();
    expect(mic().getAttribute('aria-label')).toBe('Speak your message');
  });
  it('is not shown without onTranscribe', () => {
    render(<ChatWidget onSend={vi.fn()} defaultOpen />);
    expect(mic()).toBeNull();
  });
  it('is not shown when the browser cannot record', () => {
    install({ withMic: false });
    widget();
    expect(mic()).toBeNull();
  });
  it('does not ask for the microphone until it is pressed', () => {
    widget();
    expect(getUserMedia).not.toHaveBeenCalled();
  });
});

describe('recording and transcribing', () => {
  it('records, sends the audio to onTranscribe, and puts the text in the box without sending it', async () => {
    const onTranscribe = vi.fn().mockResolvedValue('where is my order');
    const onSend = vi.fn().mockResolvedValue({ reply: 'x' });
    widget({ onTranscribe, onSend });
    await press();
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(FakeRecorder.instances[0].mimeType).toBe('audio/webm;codecs=opus');
    expect(mic().getAttribute('aria-label')).toBe('Stop recording');
    expect(mic().getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('status').textContent).toMatch(/Recording 0:00/);
    await press();
    await waitFor(() => expect(input().value).toBe('where is my order'));
    const blob = onTranscribe.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(2048);
    expect(onSend).not.toHaveBeenCalled();                    // the user checks the text, then presses Send
    expect(document.activeElement).toBe(input());
  });

  it('adds the dictated text after what was already typed', async () => {
    widget();
    fireEvent.change(input(), { target: { value: 'Hello' } });
    await press();
    await press();
    await waitFor(() => expect(input().value).toBe('Hello hello there'));
  });

  it('cuts dictated text to the message length limit', async () => {
    widget({ maxMessageLength: 8, onTranscribe: vi.fn().mockResolvedValue('a very long sentence') });
    await press();
    await press();
    await waitFor(() => expect(input().value).toBe('a very l'));
  });

  it('shows "turning your voice into text" while waiting, and blocks typing and sending meanwhile', async () => {
    let resolve;
    widget({ onTranscribe: () => new Promise(r => { resolve = r; }) });
    await press();
    await press();
    expect((await screen.findByRole('status')).textContent).toMatch(/Turning your voice into text/);
    expect(mic().disabled).toBe(true);
    expect(sendButton().disabled).toBe(true);
    expect(input().disabled).toBe(true);
    await act(async () => resolve('done'));
    await waitFor(() => expect(input().value).toBe('done'));
    expect(mic().disabled).toBe(false);
    expect(input().disabled).toBe(false);
  });

  it('releases the microphone as soon as recording stops', async () => {
    widget();
    await press();
    expect(tracks[0].stop).not.toHaveBeenCalled();
    await press();
    expect(tracks[0].stop).toHaveBeenCalledTimes(1);
  });

  it('shows the timer while recording', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    widget();
    await press();
    await act(async () => { vi.advanceTimersByTime(3200); });
    expect(screen.getByRole('status').textContent).toMatch(/Recording 0:03/);
  });

  it('stops by itself at the maximum length and still transcribes', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    const onTranscribe = vi.fn().mockResolvedValue('long speech');
    widget({ onTranscribe, voiceMaxSeconds: 5 });
    await press();
    await act(async () => { vi.advanceTimersByTime(5500); });
    expect(FakeRecorder.instances[0].state).toBe('inactive');
    expect(tracks[0].stop).toHaveBeenCalled();
    await waitFor(() => expect(onTranscribe).toHaveBeenCalledTimes(1));
  });

  it('can be used again after a recording', async () => {
    const onTranscribe = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');
    widget({ onTranscribe });
    await press(); await press();
    await waitFor(() => expect(input().value).toBe('first'));
    await press(); await press();
    await waitFor(() => expect(input().value).toBe('first second'));
    expect(getUserMedia).toHaveBeenCalledTimes(2);
  });
});

describe('microphone problems', () => {
  it.each([
    ['NotAllowedError', /Microphone access is blocked/],
    ['NotFoundError', /No microphone was found/],
    ['NotReadableError', /used by another app/],
    ['SomethingElse', /could not be turned into text/],
  ])('%s shows a clear message and the button keeps working', async (name, message) => {
    install({ grant: false, error: name });
    widget();
    await press();
    expect((await screen.findByRole('alert')).textContent).toMatch(message);
    expect(mic().disabled).toBe(false);
    expect(FakeRecorder.instances).toHaveLength(0);
  });

  it('clears the message on the next attempt', async () => {
    install({ grant: false });
    widget();
    await press();
    await screen.findByRole('alert');
    getUserMedia.mockResolvedValueOnce({ getTracks: () => tracks });
    await press();
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('reports a transcription failure, keeps what was typed, and lets the user try again', async () => {
    const onTranscribe = vi.fn().mockRejectedValueOnce(new Error('503')).mockResolvedValueOnce('worked');
    widget({ onTranscribe });
    fireEvent.change(input(), { target: { value: 'typed' } });
    await press(); await press();
    expect((await screen.findByRole('alert')).textContent).toMatch(/could not be turned into text/);
    expect(input().value).toBe('typed');
    expect(mic().disabled).toBe(false);
    await press(); await press();
    await waitFor(() => expect(input().value).toBe('typed worked'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it.each(['', '   ', null, undefined])('says no speech was heard when the text is %j', async text => {
    widget({ onTranscribe: vi.fn().mockResolvedValue(text) });
    await press(); await press();
    expect((await screen.findByRole('alert')).textContent).toMatch(/No speech was heard/);
    expect(input().value).toBe('');
  });

  it('says nothing was recorded when the recording is empty, without calling onTranscribe', async () => {
    FakeRecorder.data = null;
    const onTranscribe = vi.fn();
    widget({ onTranscribe });
    await press(); await press();
    expect((await screen.findByRole('alert')).textContent).toMatch(/Nothing was recorded/);
    expect(onTranscribe).not.toHaveBeenCalled();
  });

  it('uses the host labels for the microphone text', async () => {
    install({ grant: false });
    widget({ labels: { micStart: 'Hablar', micDenied: 'Micrófono bloqueado' } });
    expect(mic().getAttribute('aria-label')).toBe('Hablar');
    await press();
    expect((await screen.findByRole('alert')).textContent).toBe('Micrófono bloqueado');
  });
});

describe('cleaning up', () => {
  it('releases the microphone and sends nothing when the panel is closed while recording', async () => {
    const onTranscribe = vi.fn();
    widget({ onTranscribe });
    await press();
    fireEvent.click(document.querySelector('.cw-close'));
    expect(tracks[0].stop).toHaveBeenCalled();
    expect(FakeRecorder.instances[0].state).toBe('inactive');
    expect(onTranscribe).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    expect(mic().getAttribute('aria-label')).toBe('Speak your message');   // idle again, not stuck "recording"
  });

  it('releases the microphone and sends nothing when the widget is removed while recording', async () => {
    const onTranscribe = vi.fn();
    const { unmount } = widget({ onTranscribe });
    await press();
    unmount();
    expect(tracks[0].stop).toHaveBeenCalled();
    expect(onTranscribe).not.toHaveBeenCalled();
  });

  it('ignores a transcript that arrives after the widget was removed', async () => {
    let resolve;
    const { unmount } = widget({ onTranscribe: () => new Promise(r => { resolve = r; }) });
    await press(); await press();
    unmount();
    await act(async () => resolve('late'));          // must not throw or warn about state updates
  });

  it('does not start a second recording when pressed twice quickly', async () => {
    widget();
    await act(async () => { fireEvent.click(mic()); fireEvent.click(mic()); });
    expect(FakeRecorder.instances).toHaveLength(1);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });
});

describe('accessibility', () => {
  it('is a labelled button that announces its pressed state', () => {
    widget();
    expect(mic().tagName).toBe('BUTTON');
    expect(mic().getAttribute('type')).toBe('button');
    expect(mic().getAttribute('aria-pressed')).toBe('false');
  });
  it('is disabled while the assistant is answering', async () => {
    let finish;
    const onSend = vi.fn(() => new Promise(r => { finish = r; }));
    widget({ onSend });
    fireEvent.change(input(), { target: { value: 'hi' } });
    fireEvent.click(sendButton());
    await waitFor(() => expect(mic().disabled).toBe(true));
    await act(async () => finish({ reply: 'done' }));
    await waitFor(() => expect(mic().disabled).toBe(false));
  });
});
