"""Tests for repositories/bedrock_model.py. No network: the AWS client is a fake."""

import os
from pathlib import Path
from unittest.mock import MagicMock

import pytest
from botocore.exceptions import ClientError, EndpointConnectionError

from ecrime_demo.repositories.bedrock_model import BedrockModel, load_aws_env
from ecrime_demo.settings import Settings
from ecrime_demo.utils.exceptions.exceptions import ModelUnavailableError

USER_Q = [{"role": "user", "text": "q"}]


def model(client: MagicMock | None = None, model_id: str = "model-1") -> BedrockModel:
    """A BedrockModel with a fake client."""
    return BedrockModel(Settings(model_id=model_id), client=client or MagicMock())


def reply(text: str) -> dict:
    """A Converse response containing `text`."""
    return {"output": {"message": {"content": [{"text": text}]}}}


async def test_generate_calls_converse_with_expected_arguments() -> None:
    """Generate calls converse with expected arguments."""
    client = MagicMock()
    client.converse.return_value = reply("  hi there  ")
    text = await model(client).generate("system prompt", [{"role": "user", "text": "hello"}])
    assert text == "hi there"
    kwargs = client.converse.call_args.kwargs
    assert kwargs["modelId"] == "model-1" and kwargs["system"] == [{"text": "system prompt"}]
    assert kwargs["messages"] == [{"role": "user", "content": [{"text": "hello"}]}]
    assert kwargs["inferenceConfig"]["maxTokens"] == 600 and kwargs["inferenceConfig"]["temperature"] == 0.2


async def test_generate_joins_multiple_text_parts() -> None:
    """Generate joins multiple text parts."""
    client = MagicMock()
    client.converse.return_value = {"output": {"message": {"content": [{"text": "a"}, {"toolUse": {}}, {"text": "b"}]}}}
    assert await model(client).generate("s", USER_Q) == "ab"


@pytest.mark.parametrize("code", ["ExpiredTokenException", "ThrottlingException", "AccessDeniedException"])
async def test_aws_errors_become_model_unavailable_with_only_the_code(code: str) -> None:
    """Aws errors become model unavailable with only the code."""
    client = MagicMock()
    client.converse.side_effect = ClientError({"Error": {"Code": code, "Message": "secret details"}}, "Converse")
    with pytest.raises(ModelUnavailableError) as raised:
        await model(client).generate("s", USER_Q)
    assert code in str(raised.value) and "secret details" not in str(raised.value)


async def test_network_errors_become_model_unavailable() -> None:
    """Network errors become model unavailable."""
    client = MagicMock()
    client.converse.side_effect = EndpointConnectionError(endpoint_url="https://x")
    with pytest.raises(ModelUnavailableError):
        await model(client).generate("s", USER_Q)


@pytest.mark.parametrize("response", [{}, {"output": {}}, reply(""), reply("   ")])
async def test_unusable_responses_become_model_unavailable(response: dict) -> None:
    """Unusable responses become model unavailable."""
    client = MagicMock()
    client.converse.return_value = response
    with pytest.raises(ModelUnavailableError):
        await model(client).generate("s", USER_Q)


async def test_no_model_id_means_disabled_and_never_calls_aws() -> None:
    """No model id means disabled and never calls aws."""
    client = MagicMock()
    disabled = model(client, model_id="")
    assert disabled.enabled is False
    with pytest.raises(ModelUnavailableError):
        await disabled.generate("s", USER_Q)
    client.converse.assert_not_called()


def test_client_is_created_lazily_with_region_and_timeout(monkeypatch: pytest.MonkeyPatch) -> None:
    """Client is created lazily with region and timeout."""
    created = MagicMock()
    factory = MagicMock(return_value=created)
    monkeypatch.setattr("ecrime_demo.repositories.bedrock_model.boto3.client", factory)
    bedrock = BedrockModel(Settings(model_id="m", aws_region="us-west-2", model_timeout_seconds=7))
    factory.assert_not_called()
    assert bedrock._get_client() is created and bedrock._get_client() is created
    factory.assert_called_once()
    assert factory.call_args.args == ("bedrock-runtime",) and factory.call_args.kwargs["region_name"] == "us-west-2"
    assert factory.call_args.kwargs["config"].read_timeout == 7


def test_load_aws_env_exports_only_aws_names_and_keeps_real_environment(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Load aws env exports only aws names and keeps real environment."""
    env = tmp_path / ".env"
    env.write_text("AWS_ACCESS_KEY_ID=file-key\nAWS_SECRET_ACCESS_KEY=file-secret\nOTHER=nope\nAWS_REGION=\n")
    monkeypatch.delenv("AWS_ACCESS_KEY_ID", raising=False)
    monkeypatch.delenv("OTHER", raising=False)
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "real-secret")
    load_aws_env(env)
    assert os.environ["AWS_ACCESS_KEY_ID"] == "file-key"
    assert os.environ["AWS_SECRET_ACCESS_KEY"] == "real-secret"
    assert "OTHER" not in os.environ
    monkeypatch.delenv("AWS_ACCESS_KEY_ID")


def test_load_aws_env_ignores_a_missing_file(tmp_path: Path) -> None:
    """Load aws env ignores a missing file."""
    load_aws_env(tmp_path / "missing.env")
