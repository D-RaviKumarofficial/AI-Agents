"""Speech-to-text endpoint: a recording in, the text in it out."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request

from ecrime_demo.models.chat_schemas import TranscriptionOut
from ecrime_demo.services.dependencies import get_speech_service
from ecrime_demo.services.speech_service import SpeechService
from ecrime_demo.settings import API_PREFIX, STT_ALLOWED_CONTENT_TYPES
from ecrime_demo.utils.exceptions.error_responses import ErrorResponse
from ecrime_demo.utils.exceptions.exceptions import AudioTooLargeError, UnsupportedAudioTypeError

router = APIRouter(prefix=API_PREFIX, tags=["speech"])


async def _read_audio(request: Request, limit: int) -> bytes:
    """Read the request body, refusing it as soon as it passes `limit` bytes (before it is all in memory)."""
    declared = request.headers.get("content-length", "")
    if declared.isdigit() and int(declared) > limit:
        raise AudioTooLargeError(limit)
    chunks: list[bytes] = []
    size = 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > limit:
            raise AudioTooLargeError(limit)
        chunks.append(chunk)
    return b"".join(chunks)


@router.post(
    "/speech/transcribe",
    response_model=TranscriptionOut,
    summary="Turn a recording into text",
    responses={
        413: {
            "model": ErrorResponse,
            "description": "The recording is larger than the limit (10 MB by default). `AUDIO_TOO_LARGE`",
        },
        415: {"model": ErrorResponse, "description": "The request is not declared as audio. `UNSUPPORTED_AUDIO_TYPE`"},
        422: {
            "model": ErrorResponse,
            "description": "Empty, unreadable, too short or too long recording (`AUDIO_INVALID`, `AUDIO_TOO_LONG`), "
            "or an unknown `language` (`UNSUPPORTED_LANGUAGE`).",
        },
        503: {
            "model": ErrorResponse,
            "description": "The speech model could not be loaded or failed. `SPEECH_UNAVAILABLE`",
        },
    },
    openapi_extra={
        "requestBody": {
            "required": True,
            "description": "The audio file itself (the raw bytes), for example a browser recording.",
            "content": {
                content_type: {"schema": {"type": "string", "format": "binary"}}
                for content_type in ("audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/flac")
            },
        }
    },
)
async def transcribe(
    request: Request,
    language: Annotated[
        str | None,
        Query(max_length=12, description="Language code such as en, ar or ta. Leave out to detect it."),
    ] = None,
    service: SpeechService = Depends(get_speech_service),
) -> TranscriptionOut:
    """Recognise the speech in a recording (webm, ogg, mp4/m4a, wav, mp3 or flac) with faster-whisper.

    Send the audio file as the request body with its `Content-Type`. Runs on this machine: no AWS, nothing is stored.
    Returns 413 if the file is too large, 415 for a non-audio type, 422 if it is empty, too short, too long or cannot be
    read, and 503 if the speech model is unavailable.
    """
    content_type = request.headers.get("content-type", "").split(";")[0].strip().lower()
    if content_type not in STT_ALLOWED_CONTENT_TYPES:
        raise UnsupportedAudioTypeError(content_type or "none")
    data = await _read_audio(request, service.max_bytes)
    return await service.transcribe(data, language)
