import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ChatWidget from '../src/ui/reusables/ChatWidget/ChatWidget.jsx';

afterEach(cleanup);

const ok = reply => vi.fn().mockResolvedValue(reply);
const panel = () => document.querySelector('.cw-panel');
const input = () => document.querySelector('.cw-form input');
const ask = text => {
  fireEvent.change(input(), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
};

describe('ChatWidget open state', () => {
  it('starts closed and opens from the launcher', () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} />);
    expect(panel().hidden).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    expect(panel().hidden).toBe(false);
    expect(document.querySelector('.cw-launcher').getAttribute('aria-expanded')).toBe('true');
  });

  it('can start open', () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} defaultOpen />);
    expect(panel().hidden).toBe(false);
  });

  it('is controlled when `open` is given', () => {
    const onOpenChange = vi.fn();
    render(<ChatWidget onSend={ok({ reply: 'x' })} open={false} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(panel().hidden).toBe(true);
  });

  it('closes with Escape', () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} defaultOpen />);
    fireEvent.keyDown(input(), { key: 'Escape' });
    expect(panel().hidden).toBe(true);
  });

  it('ignores other keys', () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} defaultOpen />);
    fireEvent.keyDown(input(), { key: 'a' });
    expect(panel().hidden).toBe(false);
  });

  it('closes with the close button and returns focus to the launcher', async () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} defaultOpen />);
    fireEvent.click(document.querySelector('.cw-close'));
    expect(panel().hidden).toBe(true);
    await waitFor(() => expect(document.activeElement).toBe(document.querySelector('.cw-launcher')));
  });
});

describe('ChatWidget content comes from props', () => {
  it('shows the host title, subtitle, welcome message, suggestions and placeholder', () => {
    render(
      <ChatWidget onSend={ok({ reply: 'x' })} defaultOpen title="Acme Help" subtitle="Ask us" welcomeMessage="Welcome to Acme"
        suggestions={['Track my order']} placeholder="Ask Acme" />,
    );
    expect(screen.getByRole('heading', { name: 'Acme Help' })).toBeTruthy();
    expect(screen.getByText('Ask us')).toBeTruthy();
    expect(screen.getByText('Welcome to Acme')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Track my order' })).toBeTruthy();
    expect(input().placeholder).toBe('Ask Acme');
  });

  it('has no app-specific wording by default', () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} defaultOpen />);
    expect(document.body.textContent).not.toMatch(/Dubai|UAE|police|service/i);
  });

  it('starts with an empty conversation when there is no welcome message', () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} defaultOpen />);
    expect(document.querySelectorAll('.cw-message')).toHaveLength(0);
    expect(document.querySelector('.cw-log').textContent).toBe('');
  });

  it('still shows starter suggestions when there is no welcome message, and only until the first reply', async () => {
    const onSend = ok({ reply: 'answer' });
    render(<ChatWidget onSend={onSend} defaultOpen suggestions={['Try this']} />);
    expect(document.querySelectorAll('.cw-message')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Try this' }));
    expect(await screen.findByText('answer')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Try this' })).toBeNull();
  });

  it('shows the first reply and the question when the conversation started empty', async () => {
    render(<ChatWidget onSend={ok({ reply: 'first answer' })} defaultOpen />);
    ask('hello');
    expect(await screen.findByText('first answer')).toBeTruthy();
    expect(document.querySelectorAll('.cw-message')).toHaveLength(2);
  });

  it('lets the host replace any label', () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} defaultOpen labels={{ send: 'Enviar', clear: 'Borrar', openLauncher: 'Abrir chat' }} />);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Borrar' })).toBeTruthy();
  });

  it('adds the host class name', () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} className="acme" />);
    expect(document.querySelector('.cw-widget').classList.contains('acme')).toBe(true);
  });
});

describe('ChatWidget conversation', () => {
  it('sends the trimmed text, shows both messages and clears the box', async () => {
    const onSend = ok({ reply: 'Hello back' });
    render(<ChatWidget onSend={onSend} defaultOpen />);
    ask('  hello  ');
    expect(await screen.findByText('Hello back')).toBeTruthy();
    expect(onSend).toHaveBeenCalledWith('hello', []);
    expect(screen.getByText('hello')).toBeTruthy();
    expect(input().value).toBe('');
  });

  it('does not send blank text and keeps Send disabled', () => {
    const onSend = ok({ reply: 'x' });
    render(<ChatWidget onSend={onSend} defaultOpen />);
    expect(screen.getByRole('button', { name: 'Send' }).disabled).toBe(true);
    fireEvent.change(input(), { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: 'Send' }).disabled).toBe(true);
    fireEvent.submit(document.querySelector('.cw-form'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('limits the input length', () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} defaultOpen maxMessageLength={20} />);
    expect(input().maxLength).toBe(20);
  });

  it('sends a suggestion when clicked and then shows the reply’s suggestions instead', async () => {
    const onSend = ok({ reply: 'Fees are free', suggestions: ['Anything else?'] });
    render(<ChatWidget onSend={onSend} defaultOpen suggestions={['What are the fees?']} />);
    fireEvent.click(screen.getByRole('button', { name: 'What are the fees?' }));
    expect(await screen.findByText('Fees are free')).toBeTruthy();
    expect(onSend).toHaveBeenCalledWith('What are the fees?', expect.any(Array));
    expect(screen.getByRole('button', { name: 'Anything else?' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'What are the fees?' })).toBeNull();
  });

  it('ignores a second send while waiting and shows a typing status', async () => {
    let resolve;
    const onSend = vi.fn(() => new Promise(r => { resolve = r; }));
    render(<ChatWidget onSend={onSend} defaultOpen />);
    ask('first');
    expect((await screen.findByRole('status')).textContent).toMatch(/typing/);
    expect(input().disabled).toBe(true);
    fireEvent.submit(document.querySelector('.cw-form'));
    expect(onSend).toHaveBeenCalledTimes(1);
    resolve({ reply: 'done' });
    expect(await screen.findByText('done')).toBeTruthy();
    expect(input().disabled).toBe(false);
  });

  it('shows an accessible error when sending fails, then recovers', async () => {
    const onSend = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce({ reply: 'back' });
    render(<ChatWidget onSend={onSend} defaultOpen />);
    ask('hi');
    expect((await screen.findByRole('alert')).textContent).toMatch(/unavailable/);
    expect(input().disabled).toBe(false);
    ask('again');
    expect(await screen.findByText('back')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('uses the host’s own unavailable message', async () => {
    render(<ChatWidget onSend={vi.fn().mockRejectedValue(new Error('x'))} defaultOpen labels={{ unavailable: 'Try later' }} />);
    ask('hi');
    expect((await screen.findByRole('alert')).textContent).toBe('Try later');
  });

  it('clear returns to the welcome message', async () => {
    render(<ChatWidget onSend={ok({ reply: 'reply' })} defaultOpen welcomeMessage="Welcome" />);
    ask('hi');
    await screen.findByText('reply');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.queryByText('reply')).toBeNull();
    expect(screen.getByText('Welcome')).toBeTruthy();
  });

  it('clear leaves an empty conversation when there is no welcome message', async () => {
    render(<ChatWidget onSend={ok({ reply: 'reply' })} defaultOpen />);
    ask('hi');
    await screen.findByText('reply');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(document.querySelectorAll('.cw-message')).toHaveLength(0);
  });

  it('keeps the conversation while closed', async () => {
    render(<ChatWidget onSend={ok({ reply: 'kept' })} defaultOpen />);
    ask('hi');
    await screen.findByText('kept');
    fireEvent.click(document.querySelector('.cw-close'));
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    expect(screen.getByText('kept')).toBeTruthy();
  });

  it('keeps only the most recent maxHistory messages', async () => {
    render(<ChatWidget onSend={ok({ reply: 'r' })} defaultOpen maxHistory={3} welcomeMessage="welcome" />);
    ask('one');
    await screen.findByText('r');
    ask('two');
    await waitFor(() => expect(screen.getAllByText('r')).toHaveLength(2));
    expect(document.querySelectorAll('.cw-message')).toHaveLength(3);
    expect(screen.queryByText('welcome')).toBeNull();
  });
});

describe('ChatWidget reply items', () => {
  const reply = {
    reply: 'Found one',
    items: [
      {
        id: 'a', title: 'Item A', badge: 'New',
        actions: [{ id: 'view', label: 'View' }, { id: 'go', label: 'Go', ariaLabel: 'Go now' }],
        href: 'https://example.test/a', linkLabel: 'Open page',
      },
    ],
  };

  it('renders title, badge, actions and an external link', async () => {
    render(<ChatWidget onSend={ok(reply)} defaultOpen />);
    ask('find');
    expect(await screen.findByText('Item A')).toBeTruthy();
    expect(screen.getByText('New')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View: Item A' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Go now' })).toBeTruthy();
    const link = screen.getByRole('link', { name: /Open page/ });
    expect(link.getAttribute('href')).toBe('https://example.test/a');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('calls onItemAction with the action id and the item', async () => {
    const onItemAction = vi.fn();
    render(<ChatWidget onSend={ok(reply)} defaultOpen onItemAction={onItemAction} />);
    ask('find');
    fireEvent.click(await screen.findByRole('button', { name: 'View: Item A' }));
    expect(onItemAction).toHaveBeenCalledWith('view', reply.items[0]);
  });

  it('does not fail when onItemAction is missing', async () => {
    render(<ChatWidget onSend={ok(reply)} defaultOpen />);
    ask('find');
    fireEvent.click(await screen.findByRole('button', { name: 'View: Item A' }));
  });

  it('never renders an unsafe link', async () => {
    render(<ChatWidget onSend={ok({ reply: 'x', items: [{ id: 'a', title: 'Bad', href: 'javascript:alert(1)' }] })} defaultOpen />);
    ask('find');
    await screen.findByText('Bad');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('lets the host render the badge', async () => {
    render(<ChatWidget onSend={ok(reply)} defaultOpen renderBadge={item => <em>custom {item.badge}</em>} />);
    ask('find');
    expect(await screen.findByText('custom New')).toBeTruthy();
  });

  it('renders reply text as text, never as HTML', async () => {
    render(<ChatWidget onSend={ok({ reply: '<img src=x onerror=alert(1)>' })} defaultOpen />);
    ask('hi');
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeTruthy();
    expect(document.querySelector('.cw-log img')).toBeNull();
  });
});

describe('ChatWidget accessibility', () => {
  it('exposes a labelled dialog, a live log and a labelled input', () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} defaultOpen title="Help" />);
    expect(screen.getByRole('dialog', { name: 'Help' })).toBeTruthy();
    expect(screen.getByRole('log', { name: 'Conversation' })).toBeTruthy();
    expect(screen.getByLabelText('Type your message')).toBeTruthy();
  });

  it('links the launcher to the panel it controls', () => {
    render(<ChatWidget onSend={ok({ reply: 'x' })} />);
    const launcher = document.querySelector('.cw-launcher');
    expect(launcher.getAttribute('aria-controls')).toBe(panel().id);
    expect(launcher.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('ChatWidget history', () => {
  it('sends an empty history for the very first question when there is no welcome message', async () => {
    const onSend = vi.fn().mockResolvedValue({ reply: 'a' });
    render(<ChatWidget onSend={onSend} defaultOpen />);
    ask('q1');
    await screen.findByText('a');
    expect(onSend).toHaveBeenCalledWith('q1', []);
  });

  it('passes the earlier turns to onSend as a second argument', async () => {
    const onSend = vi.fn().mockResolvedValue({ reply: 'first answer' });
    render(<ChatWidget onSend={onSend} defaultOpen welcomeMessage="Welcome" />);
    ask('first');
    await screen.findByText('first answer');
    onSend.mockResolvedValue({ reply: 'second answer' });
    ask('second');
    await screen.findByText('second answer');
    expect(onSend).toHaveBeenNthCalledWith(1, 'first', [{ role: 'assistant', text: 'Welcome' }]);
    expect(onSend).toHaveBeenNthCalledWith(2, 'second', [
      { role: 'assistant', text: 'Welcome' },
      { role: 'user', text: 'first' },
      { role: 'assistant', text: 'first answer' },
    ]);
  });
});

describe('ChatWidget streaming replies', () => {
  /** A stream whose pieces the test releases one at a time. */
  function controlledStream() {
    const waiting = [];
    const queue = [];
    let ended = false;
    let failure = null;
    const wake = () => waiting.splice(0).forEach(resolve => resolve());
    return {
      push: piece => { queue.push(piece); wake(); },
      end: () => { ended = true; wake(); },
      fail: error => { failure = error; wake(); },
      iterator: {
        async *[Symbol.asyncIterator]() {
          for (;;) {
            if (queue.length) { yield queue.shift(); continue; }
            if (failure) throw failure;
            if (ended) return;
            await new Promise(resolve => waiting.push(resolve));
          }
        },
      },
    };
  }

  it('shows the text as pieces arrive, before the reply has finished', async () => {
    const stream = controlledStream();
    const onSend = vi.fn(() => stream.iterator);
    render(<ChatWidget onSend={onSend} defaultOpen />);
    ask('hello');
    expect(await screen.findByRole('status')).toBeTruthy();           // "typing" until the first piece
    stream.push('Hel');
    expect(await screen.findByText('Hel')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();                  // first text is visible: no more "typing"
    expect(input().disabled).toBe(true);                              // still answering
    stream.push('lo!');
    expect(await screen.findByText('Hello!')).toBeTruthy();
    expect(document.querySelectorAll('.cw-message--assistant')).toHaveLength(1);   // one growing message, not many
    stream.end();
    await waitFor(() => expect(input().disabled).toBe(false));
    expect(screen.getByText('Hello!')).toBeTruthy();
  });

  it('adds cards and suggestions from a later piece', async () => {
    const stream = controlledStream();
    render(<ChatWidget onSend={() => stream.iterator} defaultOpen />);
    ask('find');
    stream.push('Found it');
    stream.push({ items: [{ id: 'a', title: 'Item A', actions: [{ id: 'go', label: 'Go' }] }], suggestions: ['More?'] });
    stream.end();
    expect(await screen.findByText('Item A')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Go: Item A' })).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'More?' })).toBeTruthy();
  });

  it('keeps the text already shown and reports the error when a stream fails part-way', async () => {
    const stream = controlledStream();
    render(<ChatWidget onSend={() => stream.iterator} defaultOpen />);
    ask('hello');
    stream.push('Half an ans');
    expect(await screen.findByText('Half an ans')).toBeTruthy();
    stream.fail(new Error('dropped'));
    expect((await screen.findByRole('alert')).textContent).toMatch(/unavailable/);
    expect(screen.getByText('Half an ans')).toBeTruthy();
    expect(input().disabled).toBe(false);
  });

  it('reports an error when the stream ends without any text', async () => {
    const stream = controlledStream();
    render(<ChatWidget onSend={() => stream.iterator} defaultOpen />);
    ask('hello');
    stream.end();
    expect((await screen.findByRole('alert')).textContent).toMatch(/unavailable/);
    expect(document.querySelectorAll('.cw-message--assistant')).toHaveLength(0);
  });

  it('reports an error when a stream cannot start, then works again', async () => {
    const onSend = vi.fn().mockRejectedValueOnce(new Error('503')).mockImplementationOnce(() => (async function* () { yield 'back'; })());
    render(<ChatWidget onSend={onSend} defaultOpen />);
    ask('one');
    expect((await screen.findByRole('alert')).textContent).toMatch(/unavailable/);
    ask('two');
    expect(await screen.findByText('back')).toBeTruthy();
  });

  it('sends the finished streamed answer as history on the next question', async () => {
    const onSend = vi.fn()
      .mockImplementationOnce(() => (async function* () { yield 'Part '; yield 'one'; })())
      .mockResolvedValueOnce({ reply: 'two' });
    render(<ChatWidget onSend={onSend} defaultOpen />);
    ask('q1');
    await screen.findByText('Part one');
    await waitFor(() => expect(input().disabled).toBe(false));
    ask('q2');
    await screen.findByText('two');
    expect(onSend).toHaveBeenNthCalledWith(2, 'q2', [{ role: 'user', text: 'q1' }, { role: 'assistant', text: 'Part one' }]);
  });
});
