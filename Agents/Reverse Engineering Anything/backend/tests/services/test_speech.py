"""Tests for speech-to-text: WhisperTranscriber, SpeechService and POST /v1/speech/transcribe (no model, no network)."""

import io
import wave
from unittest.mock import MagicMock

import av
import httpx
import numpy as np
import pytest

from ecrime_demo.main import create_app
from ecrime_demo.repositories.whisper_transcriber import Transcript, WhisperTranscriber
from ecrime_demo.services import dependencies
from ecrime_demo.services.speech_service import SpeechService
from ecrime_demo.settings import Settings
from ecrime_demo.utils.exceptions.exceptions import (
    AudioInvalidError,
    AudioTooLargeError,
    AudioTooLongError,
    SpeechUnavailableError,
    UnsupportedLanguageError,
)

RATE = 16000


def wav_bytes(seconds: float = 1.0, rate: int = RATE) -> bytes:
    """A mono 16-bit WAV file of a quiet tone."""
    samples = (np.sin(np.linspace(0, 440 * seconds, int(rate * seconds))) * 3000).astype(np.int16)
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(rate)
        out.writeframes(samples.tobytes())
    return buffer.getvalue()


def webm_bytes(seconds: float = 1.0) -> bytes:
    """A WebM/Opus recording, like the browser's MediaRecorder makes."""
    samples = (np.sin(np.linspace(0, 440 * seconds, int(48000 * seconds))) * 3000).astype(np.int16)
    buffer = io.BytesIO()
    out = av.open(buffer, "w", format="webm")
    stream = out.add_stream("libopus", rate=48000)
    stream.layout = "mono"
    resampler = av.AudioResampler(format="fltp", layout="mono", rate=48000)
    frame = av.AudioFrame.from_ndarray(samples.reshape(1, -1), format="s16", layout="mono")
    frame.sample_rate = 48000
    for piece in [*resampler.resample(frame), *resampler.resample(None)]:
        for packet in stream.encode(piece):
            out.mux(packet)
    for packet in stream.encode(None):
        out.mux(packet)
    out.close()
    return buffer.getvalue()


def fake_whisper(text: str = " Hello there ", language: str = "en", probability: float = 0.987654) -> MagicMock:
    """A stand-in for faster-whisper's WhisperModel."""
    model = MagicMock()
    model.supported_languages = ["en", "ar", "ta"]
    segment = MagicMock(text=text)
    model.transcribe.return_value = ([segment], MagicMock(language=language, language_probability=probability))
    return model


def transcriber(model: MagicMock | None = None, **settings: object) -> WhisperTranscriber:
    """A WhisperTranscriber with a fake model."""
    return WhisperTranscriber(
        Settings(stt_preload=False, **settings), model=model if model is not None else fake_whisper()
    )


# ---------------------------------------------------------------- WhisperTranscriber


def test_decode_reads_wav_and_webm_to_16khz_mono() -> None:
    """Decode reads wav and webm to 16khz mono."""
    for data in (wav_bytes(1.0), webm_bytes(1.0), wav_bytes(1.0, rate=44100)):
        audio = WhisperTranscriber.decode(data)
        assert audio.dtype == np.float32 and abs(len(audio) / RATE - 1.0) < 0.1


@pytest.mark.parametrize("data", [b"", b"x", b"not audio" * 100, b"RIFF\x24\x00\x00\x00WAVEfmt ", bytes(2000)])
def test_decode_rejects_unreadable_audio(data: bytes) -> None:
    """Decode rejects unreadable audio."""
    with pytest.raises(AudioInvalidError):
        WhisperTranscriber.decode(data)


def test_transcribe_returns_trimmed_text_language_and_timings() -> None:
    """Transcribe returns trimmed text language and timings."""
    result = transcriber().transcribe(np.zeros(RATE * 2, dtype=np.float32))
    assert result.text == "Hello there" and result.language == "en" and result.language_probability == 0.988
    assert result.duration_seconds == 2.0 and result.processing_ms >= 0


def test_transcribe_joins_segments_and_passes_the_language_to_the_model() -> None:
    """Transcribe joins segments and passes the language to the model."""
    model = fake_whisper()
    model.transcribe.return_value = (
        [MagicMock(text=" one "), MagicMock(text="two ")],
        MagicMock(language="ar", language_probability=1.0),
    )
    result = transcriber(model).transcribe(np.zeros(RATE, dtype=np.float32), language="ar")
    assert result.text == "one two"
    assert model.transcribe.call_args.kwargs == {"language": "ar", "vad_filter": True}


def test_transcribe_silence_gives_empty_text_not_an_error() -> None:
    """Transcribe silence gives empty text not an error."""
    model = fake_whisper()
    model.transcribe.return_value = ([], MagicMock(language="en", language_probability=0.33))
    assert transcriber(model).transcribe(np.zeros(RATE, dtype=np.float32)).text == ""


def test_transcribe_rejects_a_language_the_model_does_not_know() -> None:
    """Transcribe rejects a language the model does not know."""
    with pytest.raises(UnsupportedLanguageError):
        transcriber().transcribe(np.zeros(RATE, dtype=np.float32), language="xx")


def test_transcribe_model_failure_becomes_speech_unavailable_without_details() -> None:
    """Transcribe model failure becomes speech unavailable without details."""
    model = fake_whisper()
    model.transcribe.side_effect = RuntimeError("secret internals")
    with pytest.raises(SpeechUnavailableError) as raised:
        transcriber(model).transcribe(np.zeros(RATE, dtype=np.float32))
    assert "RuntimeError" in str(raised.value) and "secret" not in str(raised.value)


def test_load_is_lazy_and_happens_once(monkeypatch: pytest.MonkeyPatch) -> None:
    """Load is lazy and happens once."""
    factory = MagicMock(return_value=fake_whisper())
    monkeypatch.setattr("ecrime_demo.repositories.whisper_transcriber.WhisperModel", factory)
    holder = WhisperTranscriber(Settings(stt_model="base", stt_cpu_threads=2))
    assert holder.loaded is False and holder.model_name == "base"
    factory.assert_not_called()
    holder.load()
    holder.load()
    holder.transcribe(np.zeros(RATE, dtype=np.float32))
    factory.assert_called_once_with("base", device="cpu", compute_type="int8", cpu_threads=2)
    assert holder.loaded is True


def test_load_failure_is_speech_unavailable_and_can_be_retried(monkeypatch: pytest.MonkeyPatch) -> None:
    """Load failure is speech unavailable and can be retried."""
    factory = MagicMock(side_effect=[OSError("no files"), fake_whisper()])
    monkeypatch.setattr("ecrime_demo.repositories.whisper_transcriber.WhisperModel", factory)
    holder = WhisperTranscriber(Settings())
    with pytest.raises(SpeechUnavailableError) as raised:
        holder.load()
    assert "OSError" in str(raised.value) and holder.loaded is False
    holder.load()
    assert holder.loaded is True


# ---------------------------------------------------------------- SpeechService


def service(model: MagicMock | None = None, **settings: object) -> SpeechService:
    """A SpeechService over a fake model."""
    config = Settings(stt_preload=False, **settings)
    return SpeechService(WhisperTranscriber(config, model=model if model is not None else fake_whisper()), config)


async def test_service_transcribes_a_recording() -> None:
    """Service transcribes a recording."""
    result = await service().transcribe(webm_bytes(1.0), "en")
    assert (
        result.text == "Hello there"
        and result.language == "en"
        and result.durationSeconds == pytest.approx(1.0, abs=0.1)
    )


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        (None, None),
        ("", None),
        ("  ", None),
        ("auto", None),
        ("AUTO", None),
        ("EN ", "en"),
        ("ta", "ta"),
        ("fil", "fil"),
    ],
)
def test_clean_language_normalises(raw: str | None, expected: str | None) -> None:
    """Clean language normalises."""
    assert SpeechService.clean_language(raw) == expected


@pytest.mark.parametrize("raw", ["e", "english", "e n", "../etc", "en;rm", "1a", "<script>"])
def test_clean_language_rejects_malformed_codes(raw: str) -> None:
    """Clean language rejects malformed codes."""
    with pytest.raises(UnsupportedLanguageError):
        SpeechService.clean_language(raw)


async def test_service_passes_the_cleaned_language_to_the_model() -> None:
    """Service passes the cleaned language to the model."""
    model = fake_whisper()
    await service(model).transcribe(wav_bytes(), "EN")
    assert model.transcribe.call_args.kwargs["language"] == "en"
    await service(model).transcribe(wav_bytes(), None)
    assert model.transcribe.call_args.kwargs["language"] is None


async def test_service_rejects_empty_unreadable_and_too_short_audio_before_using_the_model() -> None:
    """Service rejects empty unreadable and too short audio before using the model."""
    model = fake_whisper()
    holder = service(model)
    for data, text in [(b"", "empty"), (b"garbage" * 50, "could not be read"), (wav_bytes(0.05), "too short")]:
        with pytest.raises(AudioInvalidError) as raised:
            await holder.transcribe(data)
        assert text in str(raised.value)
    model.transcribe.assert_not_called()


async def test_service_enforces_the_size_and_duration_limits() -> None:
    """Service enforces the size and duration limits."""
    with pytest.raises(AudioTooLargeError):
        await service(stt_max_audio_bytes=2048).transcribe(wav_bytes(1.0))
    with pytest.raises(AudioTooLongError):
        await service(stt_max_audio_seconds=0.5).transcribe(wav_bytes(1.0))


async def test_service_exposes_its_size_limit() -> None:
    """Service exposes its size limit."""
    assert service(stt_max_audio_bytes=4096).max_bytes == 4096


async def test_service_runs_one_transcription_at_a_time() -> None:
    """Service runs one transcription at a time."""
    import asyncio
    import threading
    import time

    running = peak = 0
    guard = threading.Lock()

    def slow(*args: object, **kwargs: object) -> tuple[list, MagicMock]:
        nonlocal running, peak
        with guard:
            running += 1
            peak = max(peak, running)
        time.sleep(0.15)
        with guard:
            running -= 1
        return [MagicMock(text="ok")], MagicMock(language="en", language_probability=1.0)

    model = fake_whisper()
    model.transcribe.side_effect = slow
    holder = service(model)
    await asyncio.gather(*(holder.transcribe(wav_bytes()) for _ in range(3)))
    assert peak == 1


# ---------------------------------------------------------------- POST /v1/speech/transcribe


async def with_transcriber(settings: Settings, monkeypatch: pytest.MonkeyPatch, model: MagicMock):  # noqa: ANN201
    """An app whose speech model is the fake `model` (the route gets it through FastAPI's dependency override)."""
    config = settings.model_copy(update={"stt_preload": False})
    holder = WhisperTranscriber(config, model=model)
    monkeypatch.setattr(dependencies, "get_transcriber", lambda: holder)
    app = create_app(config)
    speech = SpeechService(holder, config)
    app.dependency_overrides[dependencies.get_speech_service] = lambda: speech
    return app


async def post(app, body: bytes, content_type: str | None = "audio/webm", query: str = "") -> httpx.Response:  # noqa: ANN001
    """POST a recording to the endpoint of `app`."""
    headers = {"Content-Type": content_type} if content_type else {}
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
        async with httpx.AsyncClient(transport=transport, base_url="http://t") as http:
            return await http.post(f"/v1/speech/transcribe{query}", content=body, headers=headers)


async def test_route_returns_the_transcript(settings: Settings, monkeypatch: pytest.MonkeyPatch) -> None:
    """Route returns the transcript."""
    app = await with_transcriber(settings, monkeypatch, fake_whisper("Hello, how are you?"))
    response = await post(app, webm_bytes(1.0), "audio/webm;codecs=opus", "?language=en")
    body = response.json()
    assert response.status_code == 200 and body["text"] == "Hello, how are you?" and body["language"] == "en"
    assert set(body) == {"text", "language", "languageProbability", "durationSeconds", "processingMs"}


@pytest.mark.parametrize(
    "content_type",
    [
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
        "audio/wav",
        "audio/mpeg",
        "audio/flac",
        "video/webm",
        "application/octet-stream",
    ],
)
async def test_route_accepts_the_audio_types_browsers_send(
    settings: Settings, monkeypatch: pytest.MonkeyPatch, content_type: str
) -> None:
    """Route accepts the audio types browsers send."""
    app = await with_transcriber(settings, monkeypatch, fake_whisper())
    assert (await post(app, wav_bytes(), content_type)).status_code == 200


@pytest.mark.parametrize("content_type", ["application/json", "text/plain", "multipart/form-data", None])
async def test_route_rejects_non_audio_content_types_with_415(
    settings: Settings, monkeypatch: pytest.MonkeyPatch, content_type: str | None
) -> None:
    """Route rejects non audio content types with 415."""
    app = await with_transcriber(settings, monkeypatch, fake_whisper())
    response = await post(app, b"{}", content_type)
    assert response.status_code == 415 and response.json()["error_code"] == "UNSUPPORTED_AUDIO_TYPE"


@pytest.mark.parametrize(
    ("body", "code"),
    [(b"", "AUDIO_INVALID"), (b"garbage" * 100, "AUDIO_INVALID"), (wav_bytes(0.05), "AUDIO_INVALID")],
)
async def test_route_rejects_bad_recordings_with_422(
    settings: Settings, monkeypatch: pytest.MonkeyPatch, body: bytes, code: str
) -> None:
    """Route rejects bad recordings with 422."""
    app = await with_transcriber(settings, monkeypatch, fake_whisper())
    response = await post(app, body, "audio/wav")
    assert response.status_code == 422 and response.json()["error_code"] == code


async def test_route_rejects_an_unknown_language_with_422(settings: Settings, monkeypatch: pytest.MonkeyPatch) -> None:
    """Route rejects an unknown language with 422."""
    app = await with_transcriber(settings, monkeypatch, fake_whisper())
    for query in ("?language=xx", "?language=../etc"):
        response = await post(app, wav_bytes(), "audio/wav", query)
        assert response.status_code == 422 and response.json()["error_code"] == "UNSUPPORTED_LANGUAGE"


async def test_route_rejects_a_too_long_language_value(settings: Settings, monkeypatch: pytest.MonkeyPatch) -> None:
    """Route rejects a too long language value."""
    app = await with_transcriber(settings, monkeypatch, fake_whisper())
    assert (await post(app, wav_bytes(), "audio/wav", "?language=" + "a" * 40)).status_code == 422


async def test_route_rejects_oversized_uploads_with_413_before_reading_them_all(
    settings: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Route rejects oversized uploads with 413 before reading them all."""
    small = settings.model_copy(update={"stt_max_audio_bytes": 2048})
    app = await with_transcriber(small, monkeypatch, fake_whisper())
    response = await post(app, b"\0" * 5000, "audio/wav")
    assert response.status_code == 413 and response.json()["error_code"] == "AUDIO_TOO_LARGE"


async def test_route_oversize_check_works_without_a_content_length_header(
    settings: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Route oversize check works without a content length header."""
    small = settings.model_copy(update={"stt_max_audio_bytes": 2048})
    app = await with_transcriber(small, monkeypatch, fake_whisper())

    async def chunks():  # noqa: ANN202
        for _ in range(10):
            yield b"\0" * 1000

    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
        async with httpx.AsyncClient(transport=transport, base_url="http://t") as http:
            response = await http.post("/v1/speech/transcribe", content=chunks(), headers={"Content-Type": "audio/wav"})
    assert response.status_code == 413


async def test_route_model_failure_is_503_without_leaking_details(
    settings: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Route model failure is 503 without leaking details."""
    model = fake_whisper()
    model.transcribe.side_effect = RuntimeError("secret internals")
    response = await post(await with_transcriber(settings, monkeypatch, model), wav_bytes(), "audio/wav")
    assert (
        response.status_code == 503
        and response.json()["error_code"] == "SPEECH_UNAVAILABLE"
        and "secret" not in response.text
    )


async def test_route_rejects_get(client: httpx.AsyncClient) -> None:
    """Route rejects get."""
    assert (await client.get("/v1/speech/transcribe")).status_code == 405


async def test_route_stores_nothing(settings: Settings, monkeypatch: pytest.MonkeyPatch) -> None:
    """Route stores nothing."""
    app = await with_transcriber(settings, monkeypatch, fake_whisper("private words"))
    await post(app, wav_bytes(), "audio/wav")
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://t") as http:
            assert (await http.get("/v1/reports")).json()["total"] == 0
            assert (await http.get("/v1/submissions")).json()["total"] == 0


# ---------------------------------------------------------------- startup preload


async def test_startup_preloads_the_model_in_the_background_when_enabled(
    settings: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Startup preloads the model in the background when enabled."""
    import asyncio

    holder = MagicMock()
    monkeypatch.setattr("ecrime_demo.main.get_transcriber", lambda: holder)
    app = create_app(settings.model_copy(update={"stt_preload": True}))
    async with app.router.lifespan_context(app):
        await asyncio.sleep(0.1)
    holder.load.assert_called_once()


async def test_startup_does_not_load_the_model_when_preload_is_off_and_survives_a_failed_preload(
    settings: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Startup does not load the model when preload is off and survives a failed preload."""
    import asyncio

    holder = MagicMock()
    holder.load.side_effect = SpeechUnavailableError("OSError")
    monkeypatch.setattr("ecrime_demo.main.get_transcriber", lambda: holder)
    off = create_app(settings.model_copy(update={"stt_preload": False}))
    async with off.router.lifespan_context(off):
        await asyncio.sleep(0.05)
    holder.load.assert_not_called()
    on = create_app(settings.model_copy(update={"stt_preload": True}))
    async with on.router.lifespan_context(on):
        await asyncio.sleep(0.1)
    holder.load.assert_called_once()


def test_transcript_is_immutable() -> None:
    """Transcript is immutable."""
    item = Transcript("a", "en", 1.0, 1.0, 5)
    with pytest.raises(AttributeError):
        item.text = "b"  # type: ignore[misc]
