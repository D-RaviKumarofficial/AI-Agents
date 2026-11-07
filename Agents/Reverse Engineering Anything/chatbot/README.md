# Chat widget (reusable React component)

A floating chat widget you can drop into **any React app**. It has no backend code and no built-in
wording about any product. Your app supplies one function, `onSend`, and the widget does the rest:
the launcher button, the panel, the conversation, suggestions, cards with buttons, errors, and
keyboard and screen-reader support.

The conversation lives in memory only. Nothing is saved or sent anywhere except through your `onSend`.

- React 18 or 19 (peer dependency). No other runtime dependencies.
- Build output: about 8 kB of JS and 6 kB of CSS.

## Quick start

```jsx
import { ChatWidget } from 'rea-chat-widget';
import 'rea-chat-widget/style.css';

async function onSend(text) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text }),
  });
  if (!response.ok) throw new Error('failed');      // the widget shows its "unavailable" message
  const data = await response.json();
  return { reply: data.answer };
}

export default function App() {
  return <ChatWidget onSend={onSend} title="Help" welcomeMessage="Hi! How can I help?" />;   // welcomeMessage is optional
}
```

## Install it in another app

The package is not published to npm. From this repository:

```bash
cd chatbot
npm install
npm run build                      # creates dist/
```

Then in your app, either:

- add `"rea-chat-widget": "file:../path/to/chatbot"` to `dependencies` and run `npm install`, or
- run `npm pack` here and `npm install ./rea-chat-widget-1.0.0.tgz` there.

## What `onSend` must return

`onSend(text, history)` is called with the user's trimmed message and the earlier turns (`[{ role: 'user' | 'assistant', text }]`,
which you can ignore), and must return (or resolve to):

```js
{
  reply: 'Text shown in the bubble',          // required. Shown as plain text, never as HTML.
  suggestions: ['Quick reply 1', '...'],      // optional. Buttons the user can click to send.
  items: [                                    // optional. Cards under the reply.
    {
      id: 'order-1042',                       // required, unique in the reply
      title: 'Order #1042',                   // required
      badge: 'Shipped',                       // optional label (text, so it is not colour-only)
      actions: [{ id: 'track', label: 'Track', ariaLabel: 'Track order 1042' }],
      href: 'https://example.com/orders/1042',  // optional; only http(s) links are rendered
      linkLabel: 'Order page',
    },
  ],
}
```

If `onSend` throws or rejects, the widget shows `labels.unavailable` and lets the user try again.

### Microphone (voice input)

Pass `onTranscribe` and the widget shows a **microphone button** next to the message box:

```jsx
<ChatWidget onSend={onSend} onTranscribe={async blob => {
  const response = await fetch('/api/speech/transcribe', { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
  return (await response.json()).text;           // resolve to the recognised text; throw if it failed
}} />
```

Press it to start recording, press again to stop. The widget calls `onTranscribe(blob)` with the recording (a `Blob`,
usually WebM/Opus; Safari gives MP4) and puts the returned text in the message box. **It does not send it**: the user can
read and fix it first, then press Send. Text already typed is kept, and the dictated text goes after it.

- No `onTranscribe`, or a browser without `MediaRecorder`, or a page that is not `https://` or `localhost`: no button
  (nothing breaks). Voice never starts without a button press, and the browser asks for permission the first time.
- While recording it shows a pulsing red dot and a timer, and stops by itself at `voiceMaxSeconds` (default 60).
- The microphone is switched off as soon as recording stops, when the panel is closed, and when the widget is removed.
  Closing the panel mid-recording throws the recording away. The widget never keeps the audio.
- Clear messages for: permission blocked, no microphone, microphone in use, nothing recorded, no speech heard, and a failed
  transcription. Override any of them with `labels` (`micStart`, `micStop`, `recording`, `recordingHint`, `transcribing`,
  `micDenied`, `micNotFound`, `micBusy`, `micFailed`, `micEmpty`, `micNothingHeard`).
- Accessible: a real button with `aria-label` and `aria-pressed`, a live status line, and errors in an `alert`.

### Streaming the reply

To show the reply as it is written, return an **async iterable** (for example an `async function*`) instead of an object.
Each piece is either a string (more text) or `{ text?, items?, suggestions? }`:

```jsx
async function* onSend(text) {
  const response = await fetch('/api/chat/stream', { method: 'POST', body: JSON.stringify({ message: text }) });
  for await (const chunk of readYourStream(response)) yield chunk;       // strings appear as they arrive
  yield { items: [{ id: 'a', title: 'Related item' }] };                  // cards / suggestions can come last
}
```

The assistant's message is created on the first piece and grows with each one; the "typing" line disappears once text is
visible. If the iterable throws part-way, the text already shown stays and the error message appears under it.
If it ends without any text, that counts as an error.

## Props

| Prop | Default | Purpose |
|------|---------|---------|
| `onSend(text, history)` | **required** | Returns the reply, or an async iterable of pieces (see above) |
| `open`, `onOpenChange(open)` | uncontrolled | Control the open state from your app |
| `defaultOpen` | `false` | Start open when uncontrolled |
| `title` / `subtitle` | `'Assistant'` / none | Panel heading and a line under it |
| `welcomeMessage` | none | First message (also after Clear). With none, the conversation starts empty |
| `suggestions` | `[]` | Starter buttons, shown until the first reply |
| `placeholder` | `'Type your message'` | Input placeholder |
| `labels` | English | Override any text: `send`, `clear`, `close`, `openLauncher`, `closeLauncher`, `typing`, `unavailable`, `you`, `assistant`, `conversation`, `suggestions`, `inputLabel`, `opensInNewTab`. Use it to translate. |
| `maxMessageLength` | `500` | Longest message the user can type |
| `maxHistory` | `40` | Messages kept in memory |
| `onTranscribe(blob)` | none | Async function returning the text in a recording. Gives the widget a microphone button |
| `voiceMaxSeconds` | `60` | Longest recording before it stops by itself |
| `onItemAction(actionId, item)` | none | A card button was clicked |
| `renderBadge(item)` | shows `item.badge` | Custom badge content |
| `launcherIcon` | chat bubble icon | Your own icon (a React node) |
| `className` | none | Extra class on the widget root |

## Styling

All classes start with `cw-`, so they cannot clash with your CSS. Change the look with CSS variables:

```css
.cw-widget {
  --cw-primary: #7a1fa2;        /* launcher, send button, your bubbles */
  --cw-primary-hover: #5d1779;
  --cw-font: 'Inter', sans-serif;
  --cw-radius: 12px;
  --cw-right: 16px;
  --cw-bottom: 16px;
}
```

Other variables: `--cw-on-primary`, `--cw-surface`, `--cw-surface-alt`, `--cw-border`, `--cw-text`,
`--cw-text-muted`, `--cw-accent`, `--cw-accent-hover`, `--cw-on-accent`, `--cw-danger-*`, `--cw-focus`,
`--cw-heading-font`, `--cw-z`, `--cw-panel-width`, `--cw-panel-height`.
If you change colours, keep text contrast at 4.5:1 or better.
The defaults meet WCAG AA, but your own colours are your responsibility.

## Accessibility

- The panel is a labelled `dialog`; the conversation is a live `log`; the input has a label.
- Escape closes the panel and focus returns to the launcher button.
- Everything works with the keyboard. Focus rings are visible. Motion is removed for users who prefer reduced motion.
- Card badges are text. External links open in a new tab with `rel="noopener noreferrer"` and say so to screen readers.

## Safety

- Reply text is rendered as text. HTML in a reply is shown literally, never run.
- Links are only rendered when they are `http:` or `https:`. `javascript:` and `data:` links are dropped.

## Try it without any app

```bash
npm run demo        # opens http://127.0.0.1:5173/demo/ with a fake pet-shop backend
```

`demo/main.jsx` is a complete example of using the widget in a bare page.

## Develop

```bash
npm test            # 145 tests (Vitest + Testing Library)
npm run build       # dist/chat-widget.js and dist/chat-widget.css
```

```
src/
  chat-widget.js                       package entry (exports ChatWidget, DEFAULT_LABELS, safeHref)
  ui/reusables/ChatWidget/
    ChatWidget.jsx                     view
    ChatWidget.vm.js                   view-model (state, sending)
  helpers/chatHelpers.mjs              pure helpers
  helpers/voice.mjs                    microphone helpers (format choice, error kinds, timer)
  ui/reusables/ChatWidget/useVoiceInput.js   recording logic
  helpers/chatLabels.mjs               default wording
  styles/chatWidget.css                styles
tests/  demo/
```

## Limits

- It is a front-end component only. You provide the answers.
- It does not render Markdown, images, or file uploads, and it does not stream replies.
- One conversation per widget. It is not saved across page reloads.
