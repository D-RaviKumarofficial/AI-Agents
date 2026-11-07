# Reverse Engineering Anything: Dubai Police services demo

A local reconstruction of the Dubai Police services pages, built for testing. It is **unofficial**.
All data is synthetic, and nothing you do here is sent to Dubai Police or any authority.

| Folder | What it is | Details |
|--------|------------|---------|
| [`backend/`](backend/README.md) | FastAPI + SQLite API: catalog, simulated reports and requests, assistant answers | Python 3.12+, `uv` |
| [`frontend/`](frontend/README.md) | React + Vite web app (the pages you see in the browser) | Node 20+ |
| [`chatbot/`](chatbot/README.md) | Reusable chat widget (UI only, works in any React app) | Node 20+ |

How they fit together:

```
Browser ── frontend (port 5173) ── /api/* proxy ──> backend (port 8000) ── SQLite file
              │
              └─ imports the chat widget from chatbot/ (built into chatbot/dist)
```

## What you need

| Tool | Version | Check with | Install |
|------|---------|------------|---------|
| Node.js + npm | 20 or newer | `node --version` | https://nodejs.org |
| uv | any recent | `uv --version` | https://docs.astral.sh/uv/getting-started/installation/ |

`uv` downloads the right Python (3.12+) for you if it is missing.

## Run everything locally

Open **two terminals** in this folder.

**Terminal 1: backend**

```bash
cd backend
uv sync                                                                   # first time only
uv run uvicorn ecrime_demo.main:app --app-dir src --host 127.0.0.1 --port 8000
```

**Terminal 2: frontend**

```bash
cd frontend
npm install                                                               # first time only
npm run dev
```

Then open **http://127.0.0.1:5173/app/services**.

Start the backend first. The first `npm run dev` also builds the chat widget, so it takes a few extra seconds.

### Quick check that it works

1. The services page shows 22 service cards.
2. Click the round button at the bottom right and ask "Which services need UAE PASS?".
3. Open http://127.0.0.1:8000/docs to see and try the API.

## Voice input

The chat has a microphone button. Press it, speak, press it again, and your words appear in the message box. The speech
model (faster-whisper) runs **inside the backend on your machine**, so it needs no AWS and works offline. The first
start downloads about 150 MB from Hugging Face. Allow the microphone when the browser asks (works on `localhost`).

## Try the chat widget on its own

```bash
cd chatbot
npm install
npm run demo
```

This opens a bare page with a pretend pet-shop backend. It shows the widget needs nothing from this project.

## Test everything

```bash
cd backend  && uv run pytest              # about 285 tests
cd frontend && npm test                   # 24 tests
cd chatbot  && npm install && npm test    # 145 tests
```

## Ports and settings

| What | Default | Change it |
|------|---------|-----------|
| Backend | 8000 | `--port` on the `uvicorn` command, then start the frontend with `BACKEND_URL=http://127.0.0.1:<port>` |
| Frontend | 5173 | `server.port` in `frontend/vite.config.js` |
| Database | `backend/database/ecrime_demo.db` | `ECRIME_DATABASE_URL` (see `backend/.env.example`) |

## Reset to a clean state

Stop the servers, then delete `backend/database/ecrime_demo.db`. It is recreated on the next start.
Or click **Clear data** in the E-Crime wizard, or call `POST /v1/reset`.

## Common problems

| Problem | Fix |
|---------|-----|
| Cards are empty or "Service catalog unavailable" | The backend is not running, or is on another port |
| `Failed to resolve entry for package "rea-chat-widget"` | In `frontend`, run `npm run build:widget` |
| `Address already in use` | Another program uses the port. Stop it or pick another port (see above) |
| `uv: command not found` | Install uv (link above), then open a new terminal |
| Page looks stale after an update | Hard refresh: Ctrl + Shift + R |

## Things to know

- **The catalog is a snapshot** taken from the official site on 2026-11-04. It is not live.
- **Most official forms need UAE PASS**, so their real fields were not visible. Those services use a generic simulated form.
- **The assistant is written entirely by an Amazon Bedrock model** when `backend/.env` has AWS credentials and `ECRIME_MODEL_ID` (see `backend/README.md`).
  It is told to answer only from the saved snapshot, but a model can still be wrong, so the chat says its answers are AI-written.
  There are no built-in answers or suggested questions: without credentials, or if the call fails, the chat reports that the
  assistant is unavailable. The one fixed reply is "call 999" for emergency wording. Its UAE PASS knowledge covers only what was
  checked on 2026-11-06 (the first form step of 24 of the 60 services).
- **Not production software.** There is no sign-in, no real payments and no real submissions.
