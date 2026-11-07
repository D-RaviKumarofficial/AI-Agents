import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MAX_HISTORY,
  DEFAULT_MAX_MESSAGE_LENGTH,
  activeSuggestions,
  addMessage,
  cleanInput,
  createWelcome,
  fromResponse,
  isStream,
  applyPiece,
  safeHref,
} from '../src/helpers/chatHelpers.mjs';

describe('cleanInput', () => {
  it('trims whitespace', () => expect(cleanInput('  hi  ')).toBe('hi'));
  it('returns empty for blank or missing input', () => {
    expect(cleanInput('   ')).toBe('');
    expect(cleanInput(undefined)).toBe('');
    expect(cleanInput(null)).toBe('');
  });
  it('cuts to the default maximum', () => expect(cleanInput('x'.repeat(900)).length).toBe(DEFAULT_MAX_MESSAGE_LENGTH));
  it('cuts to a custom maximum', () => expect(cleanInput('abcdef', 3)).toBe('abc'));
});

describe('addMessage', () => {
  it('appends without mutating the original', () => {
    const original = [{ id: 1 }];
    expect(addMessage(original, { id: 2 })).toEqual([{ id: 1 }, { id: 2 }]);
    expect(original).toEqual([{ id: 1 }]);
  });
  it('keeps only the most recent messages', () => {
    let history = [];
    for (let id = 0; id < DEFAULT_MAX_HISTORY + 5; id++) history = addMessage(history, { id });
    expect(history).toHaveLength(DEFAULT_MAX_HISTORY);
    expect(history.at(-1).id).toBe(DEFAULT_MAX_HISTORY + 4);
  });
  it('honours a custom limit', () => expect(addMessage([{ id: 1 }, { id: 2 }], { id: 3 }, 2)).toEqual([{ id: 2 }, { id: 3 }]));
});

describe('createWelcome', () => {
  it('returns one welcome message with the text and suggestions it is given', () => {
    expect(createWelcome(0, 'Hi', ['a'])).toEqual([{ id: 0, role: 'assistant', text: 'Hi', items: [], suggestions: ['a'] }]);
  });
  it('defaults to no suggestions', () => expect(createWelcome(0, 'Hi')[0].suggestions).toEqual([]));
  it.each([undefined, null, ''])('returns no messages when the text is %s', text => expect(createWelcome(0, text, ['a'])).toEqual([]));
});

describe('fromResponse', () => {
  it('maps a reply to a message', () => {
    expect(fromResponse(7, { reply: 'Hi', items: [{ id: 'a' }], suggestions: ['Next?'] }))
      .toEqual({ id: 7, role: 'assistant', text: 'Hi', items: [{ id: 'a' }], suggestions: ['Next?'] });
  });
  it('tolerates missing, null or wrongly typed fields', () => {
    expect(fromResponse(1, { reply: 'Hi' })).toMatchObject({ items: [], suggestions: [] });
    expect(fromResponse(1, null)).toMatchObject({ text: '', items: [], suggestions: [] });
    expect(fromResponse(1, { reply: 'x', items: 'no', suggestions: 5 })).toMatchObject({ items: [], suggestions: [] });
  });
});

describe('activeSuggestions', () => {
  it('uses only the latest assistant message', () => {
    expect(activeSuggestions([{ role: 'assistant', suggestions: ['old'] }, { role: 'user' }, { role: 'assistant', suggestions: ['new'] }])).toEqual(['new']);
  });
  it('is empty while waiting for an answer or with no messages', () => {
    expect(activeSuggestions([{ role: 'assistant', suggestions: ['old'] }, { role: 'user' }])).toEqual([]);
    expect(activeSuggestions([])).toEqual([]);
  });
});

describe('safeHref', () => {
  it('allows http and https', () => {
    expect(safeHref('https://example.test/a')).toBe('https://example.test/a');
    expect(safeHref('http://example.test/')).toBe('http://example.test/');
  });
  it.each(['javascript:alert(1)', 'data:text/html,<b>x</b>', 'vbscript:x', 'file:///etc/passwd', '/relative', '', 'not a url'])(
    'rejects %s', value => expect(safeHref(value)).toBeNull());
  it('rejects non-strings that are not URLs', () => {
    expect(safeHref(undefined)).toBeNull();
    expect(safeHref(null)).toBeNull();
  });
});

describe('isStream', () => {
  it('is true for async generators and async iterables', () => {
    async function* gen() {}
    expect(isStream(gen())).toBe(true);
    expect(isStream({ [Symbol.asyncIterator]: () => ({}) })).toBe(true);
  });
  it.each([null, undefined, 'text', 5, { reply: 'x' }, [1, 2], (function* () {})()])('is false for %s', value => expect(isStream(value)).toBe(false));
});

describe('applyPiece', () => {
  const base = { id: 1, role: 'assistant', text: 'Hi', items: [], suggestions: [] };
  it('appends a string to the text without mutating the message', () => {
    expect(applyPiece(base, ' there').text).toBe('Hi there');
    expect(base.text).toBe('Hi');
  });
  it('appends text from an object piece and sets items and suggestions', () => {
    const next = applyPiece(base, { text: '!', items: [{ id: 'a' }], suggestions: ['s'] });
    expect(next).toMatchObject({ text: 'Hi!', items: [{ id: 'a' }], suggestions: ['s'] });
  });
  it('keeps items and suggestions when a piece has none, and ignores a wrong type', () => {
    const withItems = { ...base, items: [{ id: 'a' }] };
    expect(applyPiece(withItems, { text: '.' }).items).toEqual([{ id: 'a' }]);
    expect(applyPiece(withItems, { items: 'bad' }).items).toEqual([{ id: 'a' }]);
  });
  it('tolerates an empty piece', () => {
    expect(applyPiece(base, {}).text).toBe('Hi');
    expect(applyPiece(base, null).text).toBe('Hi');
  });
});
