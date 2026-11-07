"""Tests for services/chat_service.py with a fake language model."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from ecrime_demo.core.chat.assistant import ChatbotEngine
from ecrime_demo.models.chat_schemas import AnswerSource, ChatRequest, ChatTurn
from ecrime_demo.services.chat_service import ChatService
from ecrime_demo.services.dependencies import get_chat_service
from ecrime_demo.utils.exceptions.exceptions import ModelUnavailableError


def fake_model(reply: str = "model answer", enabled: bool = True) -> MagicMock:
    """A model that returns `reply` (or fails when `reply` is an exception)."""
    model = MagicMock(enabled=enabled)
    model.generate = AsyncMock(side_effect=reply) if isinstance(reply, Exception) else AsyncMock(return_value=reply)
    return model


def request(message: str, history: list[ChatTurn] | None = None) -> ChatRequest:
    """Build a chat request."""
    return ChatRequest(message=message, history=history or [])


async def test_model_answer_is_returned_with_matching_services(engine: ChatbotEngine) -> None:
    """Model answer is returned with matching services."""
    model = fake_model("It needs UAE PASS.")
    result = await ChatService(engine, model).reply(request("does reporting e-crime need uae pass"))
    assert result.reply == "It needs UAE PASS." and result.source is AnswerSource.MODEL
    assert result.services[0].name == "Reporting E-Crime"


async def test_model_receives_only_catalog_facts_and_the_question(engine: ChatbotEngine) -> None:
    """Model receives only catalog facts and the question."""
    model = fake_model()
    await ChatService(engine, model).reply(request("fees for document verification"))
    system, messages = model.generate.await_args.args
    assert "Answer ONLY from the FACTS" in system
    turn = messages[-1]["text"]
    assert turn.startswith("FACTS:") and "Document Verification" in turn and "QUESTION:" in turn
    assert "free of charge" in turn and "fees for document verification" in turn


async def test_unknown_fee_is_not_given_to_the_model(engine: ChatbotEngine) -> None:
    """Unknown fee is not given to the model."""
    model = fake_model()
    await ChatService(engine, model).reply(request("fee for night work permit"))
    turn = model.generate.await_args.args[1][-1]["text"]
    assert "Night Work Permit" in turn and '"fees"' not in turn and '"processing_time"' not in turn


async def test_unverified_access_is_marked_unknown(engine: ChatbotEngine) -> None:
    """Unverified access is marked unknown."""
    model = fake_model()
    await ChatService(engine, model).reply(request("night work permit uae pass"))
    assert "unknown (not verified)" in model.generate.await_args.args[1][-1]["text"]


async def test_emergency_never_reaches_the_model(engine: ChatbotEngine) -> None:
    """Emergency never reaches the model."""
    model = fake_model()
    result = await ChatService(engine, model).reply(request("there is a fire"))
    model.generate.assert_not_awaited()
    assert "999" in result.reply and result.source is AnswerSource.SAFETY


async def test_history_is_sent_and_made_valid_for_the_api(engine: ChatbotEngine) -> None:
    """History is sent and made valid for the API."""
    model = fake_model()
    history = [
        ChatTurn(role="assistant", text="welcome"),
        ChatTurn(role="user", text="first"),
        ChatTurn(role="user", text="first again"),
        ChatTurn(role="assistant", text="answer"),
        ChatTurn(role="user", text="dangling"),
    ]
    await ChatService(engine, model).reply(request("night work permit", history))
    messages = model.generate.await_args.args[1]
    assert [m["role"] for m in messages] == ["user", "assistant", "user"]
    assert messages[0]["text"] == "first again" and messages[-1]["text"].startswith("FACTS:")


async def test_only_recent_history_is_sent(engine: ChatbotEngine) -> None:
    """Only recent history is sent."""
    model = fake_model()
    history = [ChatTurn(role="user" if i % 2 == 0 else "assistant", text=f"t{i}") for i in range(20)]
    await ChatService(engine, model).reply(request("night work permit", history))
    assert len(model.generate.await_args.args[1]) <= 7


def test_alternating_edge_cases() -> None:
    """Alternating edge cases."""
    assert ChatService._alternating([]) == []
    assert ChatService._alternating([{"role": "assistant", "text": "a"}]) == []
    assert ChatService._alternating([{"role": "user", "text": "u"}]) == []


def test_get_chat_service_reuses_engine_and_model() -> None:
    """Get chat service reuses engine and model."""
    first, second = get_chat_service(), get_chat_service()
    assert first._engine is second._engine and first._model is second._model


async def test_model_answer_has_no_canned_chips_or_intent(engine: ChatbotEngine) -> None:
    """Model answer has no canned chips or intent."""
    result = await ChatService(engine, fake_model("ok")).reply(request("night work permit"))
    assert set(result.model_dump()) == {"reply", "services", "source"}


async def test_message_with_no_matching_service_still_goes_to_the_model(engine: ChatbotEngine) -> None:
    """Message with no matching service still goes to the model."""
    model = fake_model("Hello!")
    result = await ChatService(engine, model).reply(request("hi"))
    assert result.reply == "Hello!" and result.services == [] and result.source is AnswerSource.MODEL
    model.generate.assert_awaited_once()


@pytest.mark.parametrize("error", [ModelUnavailableError("ThrottlingException"), ModelUnavailableError("Timeout")])
async def test_model_failure_is_an_error_not_a_canned_answer(engine: ChatbotEngine, error: Exception) -> None:
    """Model failure is an error not a canned answer."""
    with pytest.raises(ModelUnavailableError):
        await ChatService(engine, fake_model(error)).reply(request("does reporting e-crime need uae pass"))


@pytest.mark.parametrize("model", [None, "disabled"])
async def test_no_model_is_an_error_not_a_canned_answer(engine: ChatbotEngine, model: str | None) -> None:
    """No model is an error not a canned answer."""
    chosen = fake_model(enabled=False) if model else None
    with pytest.raises(ModelUnavailableError) as raised:
        await ChatService(engine, chosen).reply(request("hello"))
    assert "NoModelConfigured" in str(raised.value)
    if chosen:
        chosen.generate.assert_not_awaited()
