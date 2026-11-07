"""Tests for routes/default.py."""

from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest

from ecrime_demo.main import create_app
from ecrime_demo.settings import Settings


async def test_info_success(client: httpx.AsyncClient) -> None:
    """Info success."""
    body = (await client.get("/")).json()
    assert body["name"] == "ecrime-demo" and body["demoOnly"] is True


async def test_info_unknown_route_returns_standard_error(client: httpx.AsyncClient) -> None:
    """Info unknown route returns standard error."""
    response = await client.get("/nope")
    assert response.status_code == 404


async def test_health_success(client: httpx.AsyncClient) -> None:
    """Health success."""
    assert (await client.get("/health")).json()["status"] == "ok"


async def test_health_rejects_post(client: httpx.AsyncClient) -> None:
    """Health rejects post."""
    assert (await client.post("/health")).status_code == 405


async def test_ready_success(client: httpx.AsyncClient) -> None:
    """Ready success."""
    assert (await client.get("/ready")).json()["status"] == "ready"


async def test_ready_fails_when_database_unreachable(settings: Settings) -> None:
    """Ready fails when database unreachable."""
    app = create_app(settings)
    async with app.router.lifespan_context(app):
        broken = MagicMock()
        broken.connect.side_effect = RuntimeError("down")
        app.state.engine = broken
        transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
        async with httpx.AsyncClient(transport=transport, base_url="http://t") as http:
            response = await http.get("/ready")
    assert response.status_code == 503 and response.json()["error_code"] == "NOT_READY"


@pytest.mark.parametrize("path", ["/health", "/ready"])
async def test_probe_responses_are_demo_only(client: httpx.AsyncClient, path: str) -> None:
    """Probe responses are demo only."""
    assert (await client.get(path)).json()["demoOnly"] is True


_ = AsyncMock
