"""Request and response models for the services assistant."""

from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from ecrime_demo.settings import MAX_HISTORY_TURNS, MAX_MESSAGE_LENGTH, MAX_TURN_LENGTH


class AccessLevel(StrEnum):
    """What was observed about signing in to a service's initial form."""

    UAE_PASS_REQUIRED = "uae_pass_required"
    GUEST_AVAILABLE = "guest_available"
    UNKNOWN = "unknown"


class ServiceRef(BaseModel):
    """A service that a reply refers to."""

    id: str
    name: str
    groupId: str
    groupName: str
    access: AccessLevel
    officialUrl: str | None = None


class ChatTurn(BaseModel):
    """One earlier message in the conversation, sent by the browser so the model keeps context."""

    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "assistant"]
    text: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=MAX_TURN_LENGTH)]


class ChatRequest(BaseModel):
    """A user message, with optional earlier turns."""

    model_config = ConfigDict(extra="forbid")

    message: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=MAX_MESSAGE_LENGTH)]
    history: Annotated[list[ChatTurn], Field(max_length=MAX_HISTORY_TURNS)] = []


class AnswerSource(StrEnum):
    """Where an answer came from: the language model, or the fixed emergency (safety) reply."""

    MODEL = "model"
    SAFETY = "safety"


class ChatResponse(BaseModel):
    """The assistant's answer and the services it is about."""

    reply: str
    services: list[ServiceRef] = []
    source: AnswerSource


class ChatDelta(BaseModel):
    """Stream event: the next piece of the reply text."""

    type: Literal["delta"] = "delta"
    text: str


class ChatDone(BaseModel):
    """Stream event: the reply is complete. Carries the services it is about."""

    type: Literal["done"] = "done"
    services: list[ServiceRef] = []
    source: AnswerSource


class ChatStreamError(BaseModel):
    """Stream event: the reply failed part-way. The text already sent is incomplete."""

    type: Literal["error"] = "error"
    error_code: str
    message: str


ChatStreamEvent = ChatDelta | ChatDone | ChatStreamError


class AccessData(BaseModel):
    """Observed sign-in requirements, captured from the official site."""

    model_config = ConfigDict(frozen=True)

    observedAt: str
    source: str
    note: str
    uaePassRequired: list[str]
    guestAvailable: list[str]

    def level(self, service_id: str) -> AccessLevel:
        """Return the observed access level for a service id."""
        if service_id in self.uaePassRequired:
            return AccessLevel.UAE_PASS_REQUIRED
        if service_id in self.guestAvailable:
            return AccessLevel.GUEST_AVAILABLE
        return AccessLevel.UNKNOWN


class TranscriptionOut(BaseModel):
    """The text recognised in a recording."""

    text: str
    language: str
    languageProbability: float
    durationSeconds: float
    processingMs: int
