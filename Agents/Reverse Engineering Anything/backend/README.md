# Backend (FastAPI + SQLite)

Synthetic backend for the reconstructed services demo. **Nothing is sent to Dubai Police or any
authority.** Reports and service requests are stored in a local SQLite file.

## Requirements

- Python 3.12 or newer
- [uv](https://docs.astral.sh/uv/) (installs the right Python and the dependencies)

## Run

```bash
cd backend
uv sync                                                                   # first time only
uv run uvicorn ecrime_demo.main:app --app-dir src --host 127.0.0.1 --port 8000
```

- API docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health and http://127.0.0.1:8000/ready
- Database: `database/ecrime_demo.db`, created on first start and git-ignored. Delete it to start fresh
  (stop the server first).

Add `--reload` while developing to restart on code changes.

## Configuration

Optional. Copy `.env.example` to `.env` to change a setting. Defaults work for local use.

| Variable | Default | Purpose |
|----------|---------|---------|
| `ECRIME_DATABASE_URL` | `sqlite+aiosqlite:///<backend>/database/ecrime_demo.db` | Where data is stored |
| `ECRIME_CORS_ORIGINS` | `["http://127.0.0.1:5173","http://localhost:5173"]` | Browser origins allowed to call the API directly |
| `ECRIME_MODEL_ID` | empty (chat returns 503) | Bedrock model ID / inference profile ARN for `/v1/chat` |
| `ECRIME_STT_MODEL` | `base` | Whisper size for speech-to-text: `tiny`, `base`, `small`, `medium`, `large-v3` |
| `ECRIME_STT_PRELOAD` | `true` | Load the speech model in the background at startup |
| `ECRIME_STT_DEVICE`, `ECRIME_STT_COMPUTE_TYPE` | `cpu`, `int8` | `cuda` and `float16` for an NVIDIA GPU |
| `ECRIME_STT_MAX_AUDIO_BYTES`, `ECRIME_STT_MAX_AUDIO_SECONDS` | 10 MB, 60 | Recording limits |
| `AWS_REGION` | `us-east-1` | Region of the model |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` | none | AWS credentials (read by boto3) |
| `ECRIME_MODEL_MAX_TOKENS`, `ECRIME_MODEL_TIMEOUT_SECONDS` | `600`, `20` | Reply length cap and call timeout |

## API

All paths below are under `/v1`. Errors always use one body: `{ error_code, message, trace_id, details }`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` , `/health`, `/ready` | Info, liveness, readiness (also checks the database) |
| GET | `/v1/catalog` | The captured service catalog (22 groups, 60 services) |
| POST / GET | `/v1/reports` | Create / list simulated E-Crime reports (`limit`, `offset`) |
| POST / GET | `/v1/submissions` | Create / list simulated service requests |
| POST | `/v1/reset` | Delete all simulated reports and requests |
| POST | `/v1/speech/transcribe` | Turn a recording (the microphone) into text. Runs on this machine, no AWS |
| POST | `/v1/chat` | Ask the services assistant a question (whole answer in one response) |
| POST | `/v1/chat/stream` | Same question, answer streamed as it is written (Server-Sent Events). The website uses this one |

The OpenAPI spec is in `api/openapi.json`. Each table holds at most 200 records.

### The assistant (`POST /v1/chat` and `POST /v1/chat/stream`)

Body: `{ "message": "does reporting e-crime need uae pass?", "history": [{ "role": "user", "text": "..." }] }`
(`message` 1 to 500 characters; `history` optional, up to 20 earlier turns).

How an answer is made:

1. **Emergency** wording (fire, attacked, 999...) always gets one fixed reply telling the user to call 999 (`source: "safety"`).
   The model is never asked, because a safety answer must not depend on a model or on credentials.
2. For everything else, **the Bedrock model writes the whole reply through the Converse API**
   (`repositories/bedrock_model.py`). There are no built-in answers, greetings or suggested questions.
3. To keep it accurate, the matcher finds the services the question is about and their facts (description, fees, sign-in
   status, form tabs) go into the prompt. The model is told to answer *only* from those and to say "I don't have that
   information" otherwise.
4. **There is no rule-based fallback.** If no model is configured, or the call fails (expired token, throttling, timeout),
   `/v1/chat` returns **503** `MODEL_UNAVAILABLE`. The website shows its "assistant is unavailable" message.

`/v1/chat` returns `{ reply, services, source }`: `source` is `"model"` or `"safety"`, and `services` lists the services the
question matched (the website shows them as cards with buttons). There is no `intent` and no `suggestions` field.

**Streaming (`/v1/chat/stream`)** takes the same body and uses Bedrock's `ConverseStream`, so the first words reach the
browser after about 0.9 seconds instead of after the whole answer (about 1 to 3 seconds). It answers with
`text/event-stream`: lines of `data: <json>` separated by a blank line, in this order:

```
data: {"type":"delta","text":"Hi"}                          one or more, the next piece of the reply
data: {"type":"delta","text":"! How can I help?"}
data: {"type":"done","services":[...],"source":"model"}     the reply is complete; carries the service cards
data: {"type":"error","error_code":"MODEL_UNAVAILABLE","message":"..."}   instead of done, if it broke off part-way
```

If there is no model, or it fails before saying anything, the stream never starts and you get a normal **503** instead.
Emergency wording streams the fixed 999 reply as a single `delta`. If the browser closes the connection, reading from AWS stops.

Messages are never stored. Logs record only error codes, never messages or credentials.

**Setup:** copy `.env.example` to `.env` and set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`
(only for temporary credentials), `AWS_REGION` and `ECRIME_MODEL_ID`. Restart the server after changing them.
Temporary credentials expire; when they do, `/v1/chat` returns 503 until you refresh them and restart
(the log shows `Bedrock call failed: ExpiredTokenException`).

**Limits:** a model can still make mistakes, so the website labels its answers as AI-written. What it knows about UAE PASS
comes from `resources/access.json` (19 services confirmed to need it, 5 confirmed to open without it, checked
2026-11-06). For the other 36 it is told "unknown" and should say so.

## Speech-to-text (`POST /v1/speech/transcribe`)

Turns a voice recording into text, using [faster-whisper](https://github.com/SYSTRAN/faster-whisper) on this machine
(the same engine as the `T-S and S-T Model` Speech Studio project). **It needs no AWS and no internet once the model is
downloaded.** The chat widget's microphone button uses it.

```bash
curl -X POST "http://127.0.0.1:8000/v1/speech/transcribe?language=en"      -H "Content-Type: audio/wav" --data-binary @recording.wav
# {"text":"Hello, how are you?","language":"en","languageProbability":0.951,"durationSeconds":1.7,"processingMs":1835}
```

- **Request:** the audio file itself as the body (not a form), with its real `Content-Type`: `audio/webm`, `audio/ogg`,
  `audio/mp4`, `audio/wav`, `audio/mpeg` or `audio/flac` (a `;codecs=opus` suffix is fine). Browsers record WebM/Opus
  (Chrome, Edge), Ogg/Opus (Firefox) or MP4/AAC (Safari); all three work.
- **`language`** (optional query): `en`, `ar`, `ta`... any of the 99 Whisper codes. Leave it out to detect the language.
  Telling it the language is faster (about 1 s instead of 2 s for a short clip) and more accurate.
- **Response:** `{ text, language, languageProbability, durationSeconds, processingMs }`. Silence gives `text: ""`.
- **Errors** (same body as everywhere: `{ error_code, message, trace_id, details }`): **413** `AUDIO_TOO_LARGE` (over 10 MB),
  **415** `UNSUPPORTED_AUDIO_TYPE`, **422** `AUDIO_INVALID` (empty, unreadable or under 0.2 s), `AUDIO_TOO_LONG` (over 60 s) or
  `UNSUPPORTED_LANGUAGE`, **503** `SPEECH_UNAVAILABLE` (the model could not load).
- **Privacy:** audio is decoded in memory and discarded. It is not written to disk, stored, or logged, and nothing is sent
  to AWS or anywhere else. The size limit is enforced while reading, so an oversized upload is cut off early.
- **Speed:** the model loads in the background when the server starts (`ECRIME_STT_PRELOAD`), about 2 seconds with the
  `base` model, so the first recording is not slow. A 2-second clip then takes about 1 to 2 seconds on this CPU.
  Only one recording is transcribed at a time, because parallel runs on a CPU just slow each other down.
- **First run needs internet** to download the model from Hugging Face (`base` is about 150 MB), then it is cached.
  Models: `tiny`, `base`, `small`, `medium`, `large-v3` via `ECRIME_STT_MODEL`. Bigger is more accurate and slower:
  on the test machine `small` took about 6 s for the same 2-second clip, `base` about 2 s.
- **Accuracy:** `base` is good for clear English. For Arabic and Tamil use `small` or `medium`, and pass `language`.

## Structure (`src/ecrime_demo/`)

Routes → Services → Repositories → SQLite (SQLAlchemy async ORM).

| Folder | Contents |
|--------|----------|
| `routes/` | `default.py` (info, health, ready), `v1.py` |
| `services/` | Business logic, and `dependencies.py` (FastAPI dependency injection) |
| `repositories/` | Database access, the catalog reader, engine and session setup, `bedrock_model.py` (the only AWS code), `whisper_transcriber.py` (speech model) |
| `models/` | ORM models (`database.py`) and Pydantic schemas (`schemas.py`, `chat_schemas.py`) |
| `core/` | `validation.py` (report and form rules) and `chat/` (finding the facts for the model, the prompt, the emergency reply) |
| `utils/` | JSON logger, and `exceptions/` (codes, exceptions, handlers, responses) |
| `resources/` | `catalog.json` and `access.json`: static data captured from the official site |

## Test and lint

```bash
uv run pytest --cov=ecrime_demo --cov-report=term-missing     # about 197 tests, 99% coverage (no network, the model is faked)
uv run ruff check src tests
uv run ruff format src tests
```

## Troubleshooting

- **Port 8000 already in use**: stop the other server, or use `--port 8001` and start the frontend with
  `BACKEND_URL=http://127.0.0.1:8001`.
- **`uv` not found**: install it from https://docs.astral.sh/uv/getting-started/installation/.
- **The catalog is out of date**: `catalog.json` is a snapshot taken on 2026-11-04. It is not synced with the live site.
