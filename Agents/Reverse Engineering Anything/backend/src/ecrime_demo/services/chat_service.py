"""Business logic for the services assistant: the language model writes every answer."""

from collections.abc import AsyncIterator

from ecrime_demo.core.chat.assistant import ChatbotEngine
from ecrime_demo.core.chat.prompt import SYSTEM_PROMPT, build_user_turn
from ecrime_demo.models.chat_schemas import (
    AnswerSource,
    ChatDelta,
    ChatDone,
    ChatRequest,
    ChatResponse,
    ChatStreamError,
    ChatStreamEvent,
    ServiceRef,
)
from ecrime_demo.repositories.bedrock_model import BedrockModel
from ecrime_demo.settings import MODEL_HISTORY_TURNS
from ecrime_demo.utils.exceptions.exceptions import ModelUnavailableError


class ChatService:
    """Answers one message at a time. Messages are never stored or logged."""

    def __init__(self, engine: ChatbotEngine, model: BedrockModel | None = None) -> None:
        """Store the retrieval engine and the language model."""
        self._engine = engine
        self._model = model

    def _prepare(self, request: ChatRequest) -> tuple[list[dict[str, str]], list[ServiceRef]]:
        """Build the model's messages and the services the question is about. Raises if there is no model."""
        if self._model is None or not self._model.enabled:
            raise ModelUnavailableError("NoModelConfigured")
        facts, services = self._engine.retrieve(request.message)
        history = [{"role": t.role, "text": t.text} for t in request.history[-MODEL_HISTORY_TURNS:]]
        turn = build_user_turn(request.message, self._engine.facts_block(facts))
        return [*self._alternating(history), {"role": "user", "text": turn}], services

    async def reply(self, request: ChatRequest) -> ChatResponse:
        """Return the model's whole answer to a message.

        The one exception is emergency wording, which always gets the fixed 999 answer.
        Raises ModelUnavailableError (HTTP 503) if there is no model or the call fails: there is no other fallback.
        """
        if self._engine.is_emergency(request.message):
            return self._engine.emergency()
        messages, services = self._prepare(request)
        text = await self._model.generate(SYSTEM_PROMPT, messages)  # type: ignore[union-attr]
        return ChatResponse(reply=text, services=services, source=AnswerSource.MODEL)

    async def stream(self, request: ChatRequest) -> AsyncIterator[ChatStreamEvent]:
        """Yield the answer as it is written: `delta` pieces, then `done` (or `error` if it fails part-way).

        Raises ModelUnavailableError before the first event if there is no model (so the caller can return 503).
        Emergency wording is sent as one complete delta and never reaches the model.
        """
        if self._engine.is_emergency(request.message):
            emergency = self._engine.emergency()
            yield ChatDelta(text=emergency.reply)
            yield ChatDone(services=[], source=emergency.source)
            return
        messages, services = self._prepare(request)
        pieces = self._model.stream(SYSTEM_PROMPT, messages)  # type: ignore[union-attr]
        first = await anext(pieces, None)  # a failure before any text raises here, before any event is sent
        if first is None:
            raise ModelUnavailableError("EmptyResponse")
        yield ChatDelta(text=first)
        try:
            async for text in pieces:
                yield ChatDelta(text=text)
        except ModelUnavailableError as error:
            yield ChatStreamError(error_code=error.error_code, message="The assistant stopped answering.")
            return
        yield ChatDone(services=services, source=AnswerSource.MODEL)

    @staticmethod
    def _alternating(history: list[dict[str, str]]) -> list[dict[str, str]]:
        """Make history start with a user turn and alternate roles, as the Converse API requires."""
        cleaned: list[dict[str, str]] = []
        for turn in history:
            if cleaned and cleaned[-1]["role"] == turn["role"]:
                cleaned[-1] = turn
            elif cleaned or turn["role"] == "user":
                cleaned.append(turn)
        if cleaned and cleaned[-1]["role"] == "user":
            cleaned.pop()
        return cleaned
