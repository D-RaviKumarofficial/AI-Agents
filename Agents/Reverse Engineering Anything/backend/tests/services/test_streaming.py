"""Tests for streaming: BedrockModel.stream, ChatService.stream and POST /v1/chat/stream. No network."""

import asyncio
import json
import time
from collections.abc import AsyncIterator, Iterator
from unittest.mock import MagicMock

import httpx
import pytest
from botocore.exceptions import ClientError

from ecrime_demo.core.chat.assistant import ChatbotEngine
from ecrime_demo.main import create_app
from ecrime_demo.models.chat_schemas import (
    AnswerSource,
    ChatDelta,
    ChatDone,
    ChatRequest,
    ChatStreamError,
)
from ecrime_demo.repositories.bedrock_model import BedrockModel
from ecrime_demo.services import dependencies
from ecrime_demo.services.chat_service import ChatService
from ecrime_demo.settings import Settings
from ecrime_demo.utils.exceptions.exceptions import ModelUnavailableError

USER_Q = [{"role": "user", "text": "q"}]


def text_event(text: str) -> dict:
    """A ConverseStream text event."""
    return {"contentBlockDelta": {"delta": {"text": text}, "contentBlockIndex": 0}}


def stream_client(events: list | Iterator) -> MagicMock:
    """A fake bedrock-runtime client whose converse_stream yields `events`."""
    client = MagicMock()
    client.converse_stream.return_value = {"stream": events}
    return client


def bedrock(client: MagicMock) -> BedrockModel:
    """A BedrockModel with a fake client."""
    return BedrockModel(Settings(model_id="model-1"), client=client)


async def collect(pieces: AsyncIterator[str]) -> list[str]:
    """Read every piece."""
    return [piece async for piece in pieces]


# ---------------------------------------------------------------- BedrockModel.stream


async def test_bedrock_stream_yields_text_pieces_in_order_and_ignores_other_events() -> None:
    """Bedrock stream yields text pieces in order and ignores other events."""
    events = [{"messageStart": {"role": "assistant"}}, text_event("Hel"), {"contentBlockStop": {}}, text_event("lo"),
              {"messageStop": {"stopReason": "end_turn"}}, {"metadata": {"usage": {}}}]  # fmt: skip
    client = stream_client(events)
    assert await collect(bedrock(client).stream("sys", USER_Q)) == ["Hel", "lo"]
    kwargs = client.converse_stream.call_args.kwargs
    assert kwargs["modelId"] == "model-1" and kwargs["system"] == [{"text": "sys"}]
    assert kwargs["messages"] == [{"role": "user", "content": [{"text": "q"}]}]


async def test_bedrock_stream_without_model_id_never_calls_aws() -> None:
    """Bedrock stream without model id never calls aws."""
    client = stream_client([text_event("x")])
    disabled = BedrockModel(Settings(model_id=""), client=client)
    with pytest.raises(ModelUnavailableError) as raised:
        await collect(disabled.stream("s", USER_Q))
    assert "NoModelConfigured" in str(raised.value)
    client.converse_stream.assert_not_called()


async def test_bedrock_stream_aws_error_when_starting_becomes_model_unavailable() -> None:
    """Bedrock stream aws error when starting becomes model unavailable."""
    client = MagicMock()
    client.converse_stream.side_effect = ClientError(
        {"Error": {"Code": "ExpiredTokenException", "Message": "secret"}}, "x"
    )
    with pytest.raises(ModelUnavailableError) as raised:
        await collect(bedrock(client).stream("s", USER_Q))
    assert "ExpiredTokenException" in str(raised.value) and "secret" not in str(raised.value)


async def test_bedrock_stream_error_part_way_is_raised_after_the_pieces_already_sent() -> None:
    """Bedrock stream error part way is raised after the pieces already sent."""

    def events() -> Iterator[dict]:
        yield text_event("Hello ")
        raise ClientError({"Error": {"Code": "ThrottlingException", "Message": "m"}}, "x")

    received: list[str] = []
    with pytest.raises(ModelUnavailableError) as raised:
        async for piece in bedrock(stream_client(events())).stream("s", USER_Q):
            received.append(piece)
    assert received == ["Hello "] and "ThrottlingException" in str(raised.value)


@pytest.mark.parametrize("events", [[], [{"messageStart": {}}, {"messageStop": {}}], [text_event("")]])
async def test_bedrock_stream_with_no_text_is_empty_response(events: list) -> None:
    """Bedrock stream with no text is empty response."""
    with pytest.raises(ModelUnavailableError) as raised:
        await collect(bedrock(stream_client(events)).stream("s", USER_Q))
    assert "EmptyResponse" in str(raised.value)


async def test_bedrock_stream_missing_stream_key_is_model_unavailable() -> None:
    """Bedrock stream missing stream key is model unavailable."""
    client = MagicMock()
    client.converse_stream.return_value = {}
    with pytest.raises(ModelUnavailableError):
        await collect(bedrock(client).stream("s", USER_Q))


async def test_bedrock_stream_stops_reading_when_the_consumer_stops() -> None:
    """Bedrock stream stops reading when the consumer stops."""
    consumed = 0

    class Slow:
        closed = False

        def __iter__(self) -> Iterator[dict]:
            nonlocal consumed
            for index in range(300):
                consumed += 1
                time.sleep(0.01)
                yield text_event(f"p{index} ")

        def close(self) -> None:
            Slow.closed = True

    pieces = bedrock(stream_client(Slow())).stream("s", USER_Q)
    async for _ in pieces:
        break
    await pieces.aclose()
    await asyncio.sleep(0.4)
    assert consumed < 150 and Slow.closed is True


async def test_bedrock_stream_delivers_pieces_before_the_model_has_finished() -> None:
    """Bedrock stream delivers pieces before the model has finished."""
    started = time.perf_counter()

    def events() -> Iterator[dict]:
        yield text_event("first ")
        time.sleep(0.4)
        yield text_event("second")

    seen: list[float] = []
    async for _ in bedrock(stream_client(events())).stream("s", USER_Q):
        seen.append(time.perf_counter() - started)
    assert len(seen) == 2 and seen[0] < 0.25 and seen[1] >= 0.35


# ---------------------------------------------------------------- ChatService.stream


def streaming_model(pieces: list[str], fail_with: str | None = None, enabled: bool = True) -> MagicMock:
    """A model whose stream yields `pieces`, then optionally fails."""
    model = MagicMock(enabled=enabled)

    async def run(system: str, messages: list) -> AsyncIterator[str]:
        for piece in pieces:
            yield piece
        if fail_with:
            raise ModelUnavailableError(fail_with)

    model.stream = MagicMock(side_effect=run)
    return model


def req(message: str) -> ChatRequest:
    """A chat request."""
    return ChatRequest(message=message)


async def events_of(service: ChatService, message: str) -> list:
    """Every event the service streams for a message."""
    return [event async for event in service.stream(req(message))]


async def test_service_stream_sends_deltas_then_done_with_services(engine: ChatbotEngine) -> None:
    """Service stream sends deltas then done with services."""
    events = await events_of(ChatService(engine, streaming_model(["It ", "needs UAE PASS."])), "reporting e-crime")
    assert [type(e) for e in events] == [ChatDelta, ChatDelta, ChatDone]
    assert "".join(e.text for e in events[:2]) == "It needs UAE PASS."
    assert events[-1].source is AnswerSource.MODEL and events[-1].services[0].name == "Reporting E-Crime"


async def test_service_stream_sends_the_facts_to_the_model(engine: ChatbotEngine) -> None:
    """Service stream sends the facts to the model."""
    model = streaming_model(["ok"])
    await events_of(ChatService(engine, model), "fees for document verification")
    system, messages = model.stream.call_args.args
    assert "Answer ONLY from the FACTS" in system and "free of charge" in messages[-1]["text"]


async def test_service_stream_emergency_is_one_fixed_reply_and_never_reaches_the_model(engine: ChatbotEngine) -> None:
    """Service stream emergency is one fixed reply and never reaches the model."""
    model = streaming_model(["no"])
    events = await events_of(ChatService(engine, model), "there is a fire")
    model.stream.assert_not_called()
    assert [type(e) for e in events] == [ChatDelta, ChatDone]
    assert "999" in events[0].text and events[1].source is AnswerSource.SAFETY


@pytest.mark.parametrize("model", [None, "disabled"])
async def test_service_stream_without_a_model_raises_before_any_event(engine: ChatbotEngine, model: str | None) -> None:
    """Service stream without a model raises before any event."""
    chosen = streaming_model(["x"], enabled=False) if model else None
    with pytest.raises(ModelUnavailableError) as raised:
        await anext(ChatService(engine, chosen).stream(req("hello")))
    assert "NoModelConfigured" in str(raised.value)


async def test_service_stream_failing_before_any_text_raises(engine: ChatbotEngine) -> None:
    """Service stream failing before any text raises."""
    with pytest.raises(ModelUnavailableError):
        await anext(ChatService(engine, streaming_model([], fail_with="ThrottlingException")).stream(req("hello")))


async def test_service_stream_empty_model_output_raises(engine: ChatbotEngine) -> None:
    """Service stream empty model output raises."""
    with pytest.raises(ModelUnavailableError) as raised:
        await anext(ChatService(engine, streaming_model([])).stream(req("hello")))
    assert "EmptyResponse" in str(raised.value)


async def test_service_stream_failing_part_way_ends_with_an_error_event_and_no_done(engine: ChatbotEngine) -> None:
    """Service stream failing part way ends with an error event and no done."""
    events = await events_of(
        ChatService(engine, streaming_model(["Half ", "an"], fail_with="Timeout")), "night work permit"
    )
    assert [type(e) for e in events] == [ChatDelta, ChatDelta, ChatStreamError]
    assert events[-1].error_code == "MODEL_UNAVAILABLE" and "Timeout" not in events[-1].message


# ---------------------------------------------------------------- POST /v1/chat/stream


def parse_sse(body: str) -> list[dict]:
    """The JSON events in a Server-Sent Events body."""
    return [json.loads(block[6:]) for block in body.split("\n\n") if block.startswith("data: ")]


async def streamed_client(settings: Settings, monkeypatch: pytest.MonkeyPatch, model: MagicMock | None):  # noqa: ANN201
    """An app whose chat model is `model` (or none)."""
    monkeypatch.setattr(dependencies, "_bedrock_model", lambda: model)
    app = create_app(settings)
    return app


async def test_route_streams_server_sent_events(settings: Settings, monkeypatch: pytest.MonkeyPatch) -> None:
    """Route streams server sent events."""
    app = await streamed_client(settings, monkeypatch, streaming_model(["Hi ", "there"]))
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t") as http:
            response = await http.post("/v1/chat/stream", json={"message": "night work permit"})
    events = parse_sse(response.text)
    assert response.status_code == 200 and response.headers["content-type"].startswith("text/event-stream")
    assert response.headers["cache-control"] == "no-cache"
    assert [e["type"] for e in events] == ["delta", "delta", "done"]
    assert "".join(e["text"] for e in events[:2]) == "Hi there"
    assert events[-1]["source"] == "model" and events[-1]["services"][0]["id"] == "night-work-permit"


async def test_route_without_a_model_is_503_before_the_stream_starts(client: httpx.AsyncClient) -> None:
    """Route without a model is 503 before the stream starts."""
    response = await client.post("/v1/chat/stream", json={"message": "hello"})
    assert response.status_code == 503 and response.json()["error_code"] == "MODEL_UNAVAILABLE"
    assert not response.headers["content-type"].startswith("text/event-stream")


async def test_route_emergency_streams_the_fixed_reply_without_a_model(client: httpx.AsyncClient) -> None:
    """Route emergency streams the fixed reply without a model."""
    response = await client.post("/v1/chat/stream", json={"message": "there is a fire"})
    events = parse_sse(response.text)
    assert response.status_code == 200 and "999" in events[0]["text"] and events[-1]["source"] == "safety"


async def test_route_reports_a_mid_stream_failure_as_an_error_event(
    settings: Settings, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Route reports a mid stream failure as an error event."""
    app = await streamed_client(settings, monkeypatch, streaming_model(["Start"], fail_with="Timeout"))
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t") as http:
            response = await http.post("/v1/chat/stream", json={"message": "hello"})
    assert response.status_code == 200
    assert [e["type"] for e in parse_sse(response.text)] == ["delta", "error"]


@pytest.mark.parametrize(
    "body",
    [
        {"message": ""},
        {"message": "x" * 501},
        {"message": "hi", "role": "admin"},
        {"message": "hi", "history": [{"role": "bot", "text": "x"}]},
    ],
)
async def test_route_rejects_invalid_requests(client: httpx.AsyncClient, body: dict) -> None:
    """Route rejects invalid requests."""
    assert (await client.post("/v1/chat/stream", json=body)).status_code == 422


async def test_route_rejects_get(client: httpx.AsyncClient) -> None:
    """Route rejects get."""
    assert (await client.get("/v1/chat/stream")).status_code == 405
