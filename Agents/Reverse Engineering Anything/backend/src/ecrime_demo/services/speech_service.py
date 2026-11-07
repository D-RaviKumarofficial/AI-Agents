"""Business logic for speech-to-text: validate a recording, then transcribe it."""

import asyncio
import re

from ecrime_demo.models.chat_schemas import TranscriptionOut
from ecrime_demo.repositories.whisper_transcriber import WhisperTranscriber
from ecrime_demo.settings import STT_MIN_AUDIO_SECONDS, STT_SAMPLE_RATE, Settings
from ecrime_demo.utils.exceptions.exceptions import (
    AudioInvalidError,
    AudioTooLargeError,
    AudioTooLongError,
    UnsupportedLanguageError,
)

_LANGUAGE_CODE = re.compile(r"^[a-z]{2,3}$")


class SpeechService:
    """Checks a recording and returns the text in it. Audio is never written to disk or kept."""

    def __init__(self, transcriber: WhisperTranscriber, settings: Settings) -> None:
        """Store the transcriber and the limits."""
        self._transcriber = transcriber
        self._max_bytes = settings.stt_max_audio_bytes
        self._max_seconds = settings.stt_max_audio_seconds
        self._one_at_a_time = asyncio.Semaphore(1)

    @property
    def max_bytes(self) -> int:
        """The largest recording accepted, in bytes."""
        return self._max_bytes

    @staticmethod
    def clean_language(language: str | None) -> str | None:
        """Normalise a language code ("EN " becomes "en"; blank or "auto" means detect). Raises if malformed."""
        value = (language or "").strip().lower()
        if value in ("", "auto"):
            return None
        if not _LANGUAGE_CODE.match(value):
            raise UnsupportedLanguageError(value[:12])
        return value

    async def transcribe(self, data: bytes, language: str | None = None) -> TranscriptionOut:
        """Return the text recognised in `data`.

        Raises AudioTooLargeError, AudioInvalidError (empty, unreadable or too short), AudioTooLongError,
        UnsupportedLanguageError or SpeechUnavailableError.
        """
        code = self.clean_language(language)
        if not data:
            raise AudioInvalidError("The recording is empty. Please record again.")
        if len(data) > self._max_bytes:
            raise AudioTooLargeError(self._max_bytes)
        audio = await asyncio.to_thread(self._transcriber.decode, data)
        seconds = len(audio) / STT_SAMPLE_RATE
        if seconds < STT_MIN_AUDIO_SECONDS:
            raise AudioInvalidError("The recording is too short. Hold the microphone button while you speak.")
        if seconds > self._max_seconds:
            raise AudioTooLongError(self._max_seconds)
        async with self._one_at_a_time:
            result = await asyncio.to_thread(self._transcriber.transcribe, audio, code)
        return TranscriptionOut(
            text=result.text,
            language=result.language,
            languageProbability=result.language_probability,
            durationSeconds=result.duration_seconds,
            processingMs=result.processing_ms,
        )
