"""Custom exceptions for the eCrime demo backend."""

from typing import Any

from ecrime_demo.utils.exceptions import error_codes


class EcrimeDemoError(Exception):
    """Base exception carrying a centralized error code and HTTP status."""

    status_code: int = 500
    error_code: str = error_codes.INTERNAL_ERROR

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        """Store the message and optional details."""
        self.message = message
        self.details = details or {}
        super().__init__(message)


class ServiceNotFoundError(EcrimeDemoError):
    """Raised when a service id is not in the captured catalog."""

    status_code = 404
    error_code = error_codes.SERVICE_NOT_FOUND

    def __init__(self, service_id: str) -> None:
        """Build the error for an unknown service id."""
        super().__init__(f"Service not found: {service_id}", {"service_id": service_id})


class SubmissionValidationError(EcrimeDemoError):
    """Raised when a service submission fails catalog-driven validation."""

    status_code = 422
    error_code = error_codes.VALIDATION_ERROR

    def __init__(self, field_errors: dict[str, str]) -> None:
        """Build the error from per-field validation messages."""
        super().__init__("Submission validation failed", {"field_errors": field_errors})


class ReportValidationError(EcrimeDemoError):
    """Raised when a report fails validation."""

    status_code = 422
    error_code = error_codes.REPORT_VALIDATION_ERROR

    def __init__(self, field_errors: dict[str, str]) -> None:
        """Build the error from per-field validation messages."""
        super().__init__("Report validation failed", {"field_errors": field_errors})


class CapacityReachedError(EcrimeDemoError):
    """Raised when the demo store is full."""

    status_code = 409
    error_code = error_codes.CAPACITY_REACHED

    def __init__(self, kind: str, limit: int) -> None:
        """Build the error for a full table, naming the record kind and limit."""
        super().__init__(f"Demo capacity reached for {kind} (limit {limit}). Reset the sandbox.", {"limit": limit})


class NotReadyError(EcrimeDemoError):
    """Raised when a dependency check fails."""

    status_code = 503
    error_code = error_codes.NOT_READY

    def __init__(self, detail: str) -> None:
        """Build the error for a failed readiness check."""
        super().__init__(f"Service not ready: {detail}")


class ModelUnavailableError(EcrimeDemoError):
    """Raised when the language model cannot be reached or returns nothing usable."""

    status_code = 503
    error_code = error_codes.MODEL_UNAVAILABLE

    def __init__(self, reason: str) -> None:
        """Build the error. The reason is an error code, never a credential or a message."""
        super().__init__(f"Model unavailable: {reason}", {"reason": reason})


class AudioInvalidError(EcrimeDemoError):
    """Raised when uploaded audio is empty, too short, or cannot be decoded."""

    status_code = 422
    error_code = error_codes.AUDIO_INVALID

    def __init__(self, reason: str) -> None:
        """Build the error. `reason` is a short, user-safe sentence."""
        super().__init__(reason)


class AudioTooLargeError(EcrimeDemoError):
    """Raised when the uploaded audio file is bigger than the limit."""

    status_code = 413
    error_code = error_codes.AUDIO_TOO_LARGE

    def __init__(self, limit_bytes: int) -> None:
        """Build the error from the size limit."""
        super().__init__(
            f"The recording is too large. The limit is {limit_bytes // (1024 * 1024)} MB.", {"limit_bytes": limit_bytes}
        )


class AudioTooLongError(EcrimeDemoError):
    """Raised when the recording is longer than the limit."""

    status_code = 422
    error_code = error_codes.AUDIO_TOO_LONG

    def __init__(self, limit_seconds: float) -> None:
        """Build the error from the duration limit."""
        super().__init__(
            f"The recording is too long. The limit is {limit_seconds:.0f} seconds.", {"limit_seconds": limit_seconds}
        )


class UnsupportedLanguageError(EcrimeDemoError):
    """Raised when the requested language code is not one the speech model knows."""

    status_code = 422
    error_code = error_codes.UNSUPPORTED_LANGUAGE

    def __init__(self, language: str) -> None:
        """Build the error from the rejected code."""
        super().__init__(f"Unsupported language code: {language}", {"language": language})


class SpeechUnavailableError(EcrimeDemoError):
    """Raised when the speech-to-text model cannot be loaded or fails unexpectedly."""

    status_code = 503
    error_code = error_codes.SPEECH_UNAVAILABLE

    def __init__(self, reason: str) -> None:
        """Build the error. `reason` is an error type name, never audio content."""
        super().__init__(f"Speech-to-text unavailable: {reason}", {"reason": reason})


class UnsupportedAudioTypeError(EcrimeDemoError):
    """Raised when the request is not declared as audio."""

    status_code = 415
    error_code = error_codes.UNSUPPORTED_AUDIO_TYPE

    def __init__(self, content_type: str) -> None:
        """Build the error from the rejected Content-Type."""
        super().__init__(f"Send the recording as audio, not {content_type[:60]}.", {"content_type": content_type[:60]})
