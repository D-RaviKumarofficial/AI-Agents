import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/api.js', import.meta.url), 'utf8');
const assistant = readFileSync(new URL('../src/components/ServicesAssistant.jsx', import.meta.url), 'utf8');

test('api.transcribe posts the recording as raw audio to the speech endpoint, with its own content type', () => {
  assert.match(source, /transcribe: async \(blob, language\)/);
  assert.match(source, /\/speech\/transcribe/);
  assert.match(source, /'Content-Type': blob\.type \|\| 'application\/octet-stream'/);
  assert.match(source, /body: blob/);
});

test('api.transcribe encodes the optional language and surfaces the backend message on failure', () => {
  assert.match(source, /encodeURIComponent\(language\)/);
  assert.match(source, /if \(!response\.ok\) throw new Error\(body\.message/);
});

test('the services assistant hands the widget a transcribe function that returns just the text', () => {
  assert.match(assistant, /onTranscribe=\{async blob => \(await api\.transcribe\(blob\)\)\.text\}/);
});
