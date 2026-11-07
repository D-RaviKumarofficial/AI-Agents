"""Shared fixtures: an isolated SQLite database and ASGI client per test."""

import json
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any

import httpx
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from ecrime_demo.core.chat.assistant import ChatbotEngine
from ecrime_demo.main import create_app
from ecrime_demo.models.chat_schemas import AccessData
from ecrime_demo.models.database import Base
from ecrime_demo.repositories.database import create_engine, create_session_factory
from ecrime_demo.services import dependencies
from ecrime_demo.settings import CATALOG_PATH, Settings, get_settings

VALID_REPORT: dict[str, Any] = {
    "demoOnly": True,
    "consent": True,
    "person": {
        "fullName": "Alex Morgan",
        "email": "alex@example.test",
        "phone": "+971 50 000 0000",
        "residency": "Resident",
    },
    "incident": {
        "category": "Online fraud",
        "date": "2026-10-01",
        "platform": "Marketplace",
        "description": "A seller asked for payment and never delivered the item.",
        "amount": "250",
    },
    "evidence": [{"name": "chat.txt", "size": 128, "type": "text/plain"}],
}
VALID_SUBMISSION: dict[str, Any] = {
    "serviceId": "document-verification",
    "values": {"referenceNumber": "DEMO-1", "securityCode": "123"},
    "demoOnly": True,
    "consent": True,
}


@pytest.fixture(autouse=True)
def no_real_model(monkeypatch: pytest.MonkeyPatch) -> None:
    """Tests never call AWS: ignore any real model id or credentials from the environment or backend/.env."""
    monkeypatch.setenv("ECRIME_MODEL_ID", "")
    monkeypatch.setenv("ECRIME_STT_PRELOAD", "false")
    for name in ("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN"):
        monkeypatch.delenv(name, raising=False)
    dependencies._bedrock_model.cache_clear()
    dependencies.get_transcriber.cache_clear()
    dependencies.get_speech_service.cache_clear()
    get_settings.cache_clear()


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    """Settings pointing at a throwaway SQLite file, with the model switched off."""
    return Settings(database_url=f"sqlite+aiosqlite:///{(tmp_path / 'test.db').as_posix()}", model_id="")


@pytest.fixture
async def client(settings: Settings) -> AsyncIterator[httpx.AsyncClient]:
    """ASGI client with the app lifespan running against an isolated database."""
    app = create_app(settings)
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as http:
            yield http


@pytest.fixture
async def session(settings: Settings) -> AsyncIterator[AsyncSession]:
    """Database session on an isolated SQLite file with tables created."""
    engine = create_engine(settings)
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    async with create_session_factory(engine)() as db_session:
        yield db_session
    await engine.dispose()


@pytest.fixture(scope="session")
def catalog() -> dict:
    """The captured service catalog."""
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def access() -> AccessData:
    """Access data with two required, one guest service."""
    return AccessData(
        observedAt="2026-11-06",
        source="https://example.test",
        note="test",
        uaePassRequired=["reporting-e-crime", "road-closure-permit"],
        guestAvailable=["document-verification"],
    )


@pytest.fixture(scope="session")
def engine(catalog: dict, access: AccessData) -> ChatbotEngine:
    """A chatbot engine over the real catalog."""
    return ChatbotEngine(catalog, access)
