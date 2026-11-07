"""Global exception handlers producing the standard error body."""

from typing import Any
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from ecrime_demo.utils.exceptions import error_codes
from ecrime_demo.utils.exceptions.error_responses import ErrorResponse
from ecrime_demo.utils.exceptions.exceptions import EcrimeDemoError
from ecrime_demo.utils.logger import logger


def _trace_id(request: Request) -> str:
    """Return the request's X-Trace-Id header, or a new id if it is absent."""
    return request.headers.get("x-trace-id") or uuid4().hex


def _respond(
    status_code: int, code: str, message: str, trace_id: str, details: dict[str, Any] | None = None
) -> JSONResponse:
    """Build the standard JSON error response."""
    body = ErrorResponse(error_code=code, message=message, trace_id=trace_id, details=details or {})
    return JSONResponse(status_code=status_code, content=body.model_dump())


def register_exception_handlers(app: FastAPI) -> None:
    """Attach handlers for domain, validation and unexpected errors."""

    @app.exception_handler(EcrimeDemoError)
    async def domain_error(request: Request, error: EcrimeDemoError) -> JSONResponse:
        """Return the error's own status code and body for domain errors."""
        trace_id = _trace_id(request)
        logger.warning(f"{request.url.path} {error.error_code}: {error.message}", extra={"trace_id": trace_id})
        return _respond(error.status_code, error.error_code, error.message, trace_id, error.details)

    @app.exception_handler(RequestValidationError)
    async def request_error(request: Request, error: RequestValidationError) -> JSONResponse:
        """Return a 422 listing each invalid request field."""
        trace_id = _trace_id(request)
        fields = {".".join(str(p) for p in e["loc"][1:]) or "body": e["msg"] for e in error.errors()}
        logger.warning(f"{request.url.path} {error_codes.REQUEST_INVALID}", extra={"trace_id": trace_id})
        details = {"field_errors": fields}
        return _respond(422, error_codes.REQUEST_INVALID, "Request validation failed", trace_id, details)

    @app.exception_handler(Exception)
    async def unexpected_error(request: Request, error: Exception) -> JSONResponse:
        """Log the stack trace and return a generic 500 without internal details."""
        trace_id = _trace_id(request)
        logger.exception(
            f"{request.url.path} {error_codes.INTERNAL_ERROR}: {type(error).__name__}", extra={"trace_id": trace_id}
        )
        return _respond(500, error_codes.INTERNAL_ERROR, "Internal server error", trace_id)
