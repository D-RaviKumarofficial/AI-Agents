"""Standardized error response models."""

from typing import Any

from pydantic import BaseModel, ConfigDict


class ErrorResponse(BaseModel):
    """Standard error body returned by all failing endpoints."""

    model_config = ConfigDict(extra="forbid")

    error_code: str
    message: str
    trace_id: str
    details: dict[str, Any] = {}
