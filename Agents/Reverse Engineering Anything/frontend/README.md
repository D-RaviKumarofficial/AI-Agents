# Frontend (React + Vite)

React reconstruction of the Dubai Police services pages, for agent testing. It reads from the
FastAPI backend in `../backend` and includes the reusable chat widget from `../chatbot`.
Everything is a local simulation; nothing is sent to Dubai Police.

## Requirements

- Node.js 20 or newer and npm
- The backend running on port 8000 (see `../backend/README.md`)

## Run

```bash
cd frontend
npm install
npm run dev          # http://127.0.0.1:5173/app/services
```

`npm run dev` and `npm run build` first build the chat widget in `../chatbot` automatically, so you do
not need to build it by hand. Vite proxies `/api/*` to `http://127.0.0.1:8000`. To use another backend
address: `BACKEND_URL=http://127.0.0.1:8001 npm run dev`.

## Commands

| Command | Does |
|---------|------|
| `npm run dev` | Dev server with hot reload on port 5173 |
| `npm run build` | Production files in `dist/` |
| `npm run preview` | Serve `dist/` locally (the `/api` proxy is not included) |
| `npm test` | 10 unit tests (catalog, filters, assistant adapter) |

## Pages

| URL | Page |
|-----|------|
| `/app/home` | Home |
| `/app/services` | Service directory (22 groups, search, audience filters) |
| `/app/services/ecrime` | Reporting E-Crime wizard |
| `/app/services/demo/<service-id>` | A service request form |
| `/app/dashboard`, `/app/home/contactus` | Dashboard, Contact |

## The chat assistant

The round button at the bottom right (and the header **Assistant** button) opens the services assistant.

- `src/components/ServicesAssistant.jsx` places the reusable widget and gives it this app's title, subtitle and the card buttons ("View details", "Start service"). It sets no welcome message and no suggested questions.
- `src/lib/assistantAdapter.mjs` converts the backend's `POST /v1/chat` answer into the widget's format.
- The answer is written by an Amazon Bedrock model in the backend (there is no rule-based fallback), and it is streamed:
  the text appears as it is written, using `POST /v1/chat/stream` (`src/lib/sse.mjs` reads the events, `toPieces` in
  `assistantAdapter.mjs` turns them into widget pieces). The widget sends the earlier turns so follow-up questions work.
- **Microphone:** the chat has a microphone button. It records, sends the audio to `POST /v1/speech/transcribe` (`api.transcribe` in `src/api.js`)
  and puts the recognised text in the message box for you to check and send. Needs the backend running; the browser asks for
  microphone permission (works on `localhost` or `https`).
- The widget itself is the package in `../chatbot` (`rea-chat-widget`, linked in `package.json` as `file:../chatbot`).

## Service catalog

`src/data/catalog.json` is a copy of the backend's `resources/catalog.json` (a test checks they match). It is the
service directory captured on **2026-11-04** from https://www.dubaipolice.gov.ae/app/services/. The pages read it
through `GET /v1/catalog`. It is a snapshot, not a live sync, and most service forms were not visible without
signing in, so those use a generic simulated form.

## Structure (`src/`)

| Path | Contents |
|------|----------|
| `App.jsx`, `main.jsx` | App shell, sidebar, routing, styles import |
| `api.js` | The only place that calls the backend |
| `components/` | Catalog, dialogs, buttons, `ServicesAssistant.jsx` |
| `views/` | Home, Dashboard, Contact, Directory, ServiceForm, Ecrime |
| `lib/` | Filtering, validation and adapter helpers |
| `styles/` | Reference theme, layout, hover effects |
| `data/catalog.json` | The captured catalog |

## Troubleshooting

- **Blank cards or "Service catalog unavailable"**: the backend is not running. Start it first.
- **`Failed to resolve entry for package "rea-chat-widget"`**: the widget is not built. Run `npm run build:widget`.
- **Port 5173 in use**: stop the other dev server.
