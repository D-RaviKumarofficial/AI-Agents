"""Speech-to-text with faster-whisper (free, runs on this machine, no AWS). Based on the Speech Studio project."""

import threading
import time
from dataclasses import dataclass
from typing import Any

import av
import numpy as np
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

from ecrime_demo.settings import STT_SAMPLE_RATE, Settings
from ecrime_demo.utils.exceptions.exceptions import (
    AudioInvalidError,
    SpeechUnavailableError,
    UnsupportedLanguageError,
)
from ecrime_demo.utils.logger import logger


@dataclass(frozen=True, slots=True)
class Transcript:
    """What the speech model recognised."""

    text: str
    language: str
    language_probability: float
    duration_seconds: float
    processing_ms: int


class WhisperTranscriber:
    """Turns a recording into text. The model is loaded once, on first use, and then kept in memory."""

    def __init__(self, settings: Settings, model: Any | None = None) -> None:
        """Remember the settings. Nothing is loaded here, so starting the server never needs the model files."""
        self._name = settings.stt_model
        self._device = settings.stt_device
        self._compute_type = settings.stt_compute_type
        self._cpu_threads = settings.stt_cpu_threads
        self._model = model
        self._load_lock = threading.Lock()

    @property
    def model_name(self) -> str:
        """The configured Whisper model size."""
        return self._name

    @property
    def loaded(self) -> bool:
        """True once the model is in memory."""
        return self._model is not None

    def load(self) -> None:
        """Load the model if it is not loaded yet. Safe to call from several threads."""
        if self._model is not None:
            return
        with self._load_lock:
            if self._model is not None:
                return
            started = time.perf_counter()
            try:
                self._model = WhisperModel(
                    self._name, device=self._device, compute_type=self._compute_type, cpu_threads=self._cpu_threads
                )
            except Exception as error:
                logger.error(f"Speech model failed to load: {type(error).__name__}")
                raise SpeechUnavailableError(type(error).__name__) from error
            logger.info(f"Speech model '{self._name}' loaded in {time.perf_counter() - started:.1f}s")

    @staticmethod
    def decode(data: bytes) -> np.ndarray:
        """Decode a recording (webm, ogg, mp4, wav, mp3, flac...) to 16 kHz mono floats."""
        import io

        try:
            return decode_audio(io.BytesIO(data), sampling_rate=STT_SAMPLE_RATE)
        except (av.error.FFmpegError, EOFError, ValueError, OSError) as error:
            raise AudioInvalidError("The recording could not be read. Please record again.") from error

    def transcribe(self, audio: np.ndarray, language: str | None = None) -> Transcript:
        """Recognise speech in decoded audio. `language` is a code such as "en", "ar" or "ta"; None detects it.

        Blocking and CPU-heavy: call it from a worker thread. Raises UnsupportedLanguageError for an unknown code
        and SpeechUnavailableError if recognition fails.
        """
        self.load()
        model = self._model
        if language is not None and language not in model.supported_languages:
            raise UnsupportedLanguageError(language)
        started = time.perf_counter()
        try:
            segments, info = model.transcribe(audio, language=language, vad_filter=True)
            text = " ".join(segment.text.strip() for segment in segments).strip()
        except Exception as error:
            logger.error(f"Transcription failed: {type(error).__name__}")
            raise SpeechUnavailableError(type(error).__name__) from error
        elapsed_ms = round((time.perf_counter() - started) * 1000)
        logger.info(f"Transcribed {len(audio) / STT_SAMPLE_RATE:.1f}s of audio in {elapsed_ms} ms")
        return Transcript(
            text=text,
            language=info.language,
            language_probability=round(float(info.language_probability), 3),
            duration_seconds=round(len(audio) / STT_SAMPLE_RATE, 2),
            processing_ms=elapsed_ms,
        )
