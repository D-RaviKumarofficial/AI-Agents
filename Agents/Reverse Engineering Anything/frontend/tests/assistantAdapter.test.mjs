import assert from 'node:assert/strict';
import test from 'node:test';
import { ASSISTANT_COPY, accessLabel, toChatReply } from '../src/lib/assistantAdapter.mjs';

test('accessLabel describes every access level in words', () => {
  assert.equal(accessLabel('uae_pass_required'), 'Needs UAE PASS');
  assert.equal(accessLabel('guest_available'), 'Guest access to first step');
  assert.equal(accessLabel('unknown'), 'Sign-in not verified');
});

test('accessLabel falls back for unexpected values', () => {
  assert.equal(accessLabel('something-new'), 'Sign-in not verified');
  assert.equal(accessLabel(undefined), 'Sign-in not verified');
});

test('toChatReply maps services to widget items with view and start actions', () => {
  const reply = toChatReply({
    reply: 'Found',
    services: [{ id: 'night-work-permit', name: 'Night Work Permit', access: 'unknown', officialUrl: 'https://www.dubaipolice.gov.ae/x' }],
  });
  assert.equal(reply.reply, 'Found');
  assert.equal(reply.items.length, 1);
  assert.deepEqual(reply.items[0].actions.map(a => a.id), ['view', 'start']);
  assert.equal(reply.items[0].title, 'Night Work Permit');
  assert.equal(reply.items[0].badge, 'Sign-in not verified');
  assert.equal(reply.items[0].href, 'https://www.dubaipolice.gov.ae/x');
});

test('toChatReply tolerates a reply with no services or link', () => {
  assert.deepEqual(toChatReply({ reply: 'Hi' }), { reply: 'Hi', items: [] });
  assert.equal(toChatReply({ reply: 'x', services: [{ id: 'a', name: 'A', access: 'unknown', officialUrl: null }] }).items[0].href, undefined);
});

test('the assistant has no built-in welcome message', () => {
  assert.equal(ASSISTANT_COPY.welcome, undefined);
  assert.match(ASSISTANT_COPY.subtitle, /AI-written/);
});

test('the assistant has no built-in suggested questions', () => {
  assert.equal(ASSISTANT_COPY.suggestions, undefined);
  assert.equal('suggestions' in toChatReply({ reply: 'x', suggestions: ['a'] }), false);
});
