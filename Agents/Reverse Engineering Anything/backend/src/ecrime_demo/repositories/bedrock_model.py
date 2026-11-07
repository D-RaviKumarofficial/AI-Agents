"""Amazon Bedrock Converse API client. This is the only module that talks to AWS."""

import asyncio
import os
import threading
from collections.abc import AsyncIterator, Mapping, Sequence
from pathlib import Path
from typing import Any

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import dotenv_values

from ecrime_demo.settings import MODEL_TEMPERATURE, Settings
from ecrime_demo.utils.exceptions.exceptions import ModelUnavailableError
from ecrime_demo.utils.logger import logger

_AWS_ENV_NAMES = ("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN", "AWS_REGION")


def load_aws_env(env_file: Path) -> None:
    """Export AWS_* values from the env file so boto3 can see them. Real environment variables win."""
    if not env_file.is_file():
        return
    for name, value in dotenv_values(env_file).items():
        if name in _AWS_ENV_NAMES and value and name not in os.environ:
            os.environ[name] = value


def _unavailable(error: Exception) -> ModelUnavailableError:
    """Turn an AWS or parsing error into ModelUnavailableError, logging and exposing only an error code."""
    if isinstance(error, ClientError):
        code = error.response.get("Error", {}).get("Code", "ClientError")
    else:
        code = type(error).__name__
    logger.error(f"Bedrock call failed: {code}")
    return ModelUnavailableError(code)


class BedrockModel:
    """Calls one Bedrock model through the Converse API."""

    def __init__(self, settings: Settings, client: Any | None = None) -> None:
        """Remember the model settings. The client is created lazily so startup never needs the network."""
        self._model_id = settings.model_id
        self._max_tokens = settings.model_max_tokens
        self._region = settings.aws_region
        self._timeout = settings.model_timeout_seconds
        self._client = client

    @property
    def enabled(self) -> bool:
        """True when a model id is configured."""
        return bool(self._model_id)

    def _get_client(self) -> Any:  # noqa: ANN401
        """Create the bedrock-runtime client on first use."""
        if self._client is None:
            config = Config(
                connect_timeout=5, read_timeout=self._timeout, retries={"max_attempts": 1, "mode": "standard"}
            )
            self._client = boto3.client("bedrock-runtime", region_name=self._region, config=config)
        return self._client

    def _request(self, system: str, messages: Sequence[Mapping[str, str]]) -> dict[str, Any]:
        """Keyword arguments shared by converse and converse_stream."""
        return {
            "modelId": self._model_id,
            "system": [{"text": system}],
            "messages": [{"role": m["role"], "content": [{"text": m["text"]}]} for m in messages],
            "inferenceConfig": {"maxTokens": self._max_tokens, "temperature": MODEL_TEMPERATURE},
        }

    def _converse(self, system: str, messages: Sequence[Mapping[str, str]]) -> str:
        """Blocking Converse call. Returns the model's text."""
        try:
            response = self._get_client().converse(**self._request(system, messages))
            parts = response["output"]["message"]["content"]
            text = "".join(part.get("text", "") for part in parts).strip()
        except (ClientError, BotoCoreError, KeyError, TypeError) as error:
            raise _unavailable(error) from error
        if not text:
            raise ModelUnavailableError("EmptyResponse")
        return text

    async def generate(self, system: str, messages: Sequence[Mapping[str, str]]) -> str:
        """Ask the model without blocking the event loop. Raises ModelUnavailableError on any failure."""
        if not self.enabled:
            raise ModelUnavailableError("NoModelConfigured")
        return await asyncio.to_thread(self._converse, system, messages)

    def _pump_stream(
        self,
        system: str,
        messages: Sequence[Mapping[str, str]],
        loop: asyncio.AbstractEventLoop,
        queue: "asyncio.Queue[tuple[str, Any]]",
        stop: threading.Event,
    ) -> None:
        """Worker thread: read ConverseStream events and hand each text piece to the event loop."""
        stream = None

        def put(item: tuple[str, Any]) -> None:
            """Hand an item to the event loop; ignore it if the loop has already shut down."""
            try:
                loop.call_soon_threadsafe(queue.put_nowait, item)
            except RuntimeError:
                stop.set()

        try:
            response = self._get_client().converse_stream(**self._request(system, messages))
            stream = response["stream"]
            for event in stream:
                if stop.is_set():
                    return
                text = event.get("contentBlockDelta", {}).get("delta", {}).get("text")
                if text:
                    put(("delta", text))
            put(("end", None))
        except (ClientError, BotoCoreError, KeyError, TypeError, AttributeError) as error:
            put(("error", _unavailable(error)))
        finally:
            if stream is not None and hasattr(stream, "close"):
                stream.close()

    async def stream(self, system: str, messages: Sequence[Mapping[str, str]]) -> AsyncIterator[str]:
        """Yield the model's reply in pieces as they arrive (ConverseStream).

        Raises ModelUnavailableError on any failure, also part-way through. Stops reading from AWS if the
        caller stops iterating (for example when the browser disconnects).
        """
        if not self.enabled:
            raise ModelUnavailableError("NoModelConfigured")
        loop = asyncio.get_running_loop()
        queue: asyncio.Queue[tuple[str, Any]] = asyncio.Queue()
        stop = threading.Event()
        worker = loop.run_in_executor(None, self._pump_stream, system, messages, loop, queue, stop)
        received = False
        try:
            while True:
                kind, value = await queue.get()
                if kind == "delta":
                    received = True
                    yield value
                elif kind == "error":
                    raise value
                else:
                    break
            if not received:
                raise ModelUnavailableError("EmptyResponse")
        finally:
            stop.set()
            worker.cancel()
