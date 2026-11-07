"""Tests for the global exception handlers."""

import httpx
from fastapi import FastAPI

from ecrime_demo.utils.exceptions.exceptions import EcrimeDemoError
from ecrime_demo.utils.exceptions.handlers import register_exception_handlers


def build_app() -> FastAPI:
    """Build an app with the handlers and routes that raise each error kind."""
    app = FastAPI()
    register_exception_handlers(app)

    @app.get("/domain")
    async def domain() -> None:
        """Raise a domain error."""
        raise EcrimeDemoError("custom failure", {"k": "v"})

    @app.get("/crash")
    async def crash() -> None:
        """Raise an unexpected error."""
        raise RuntimeError("secret internals")

    @app.get("/typed/{number}")
    async def typed(number: int) -> int:
        """Return the integer path parameter."""
        return number

    return app


async def get(path: str, headers: dict[str, str] | None = None) -> httpx.Response:
    """Send a GET request to the test app and return the response."""
    transport = httpx.ASGITransport(app=build_app(), raise_app_exceptions=False)
    async with httpx.AsyncClient(transport=transport, base_url="http://t") as http:
        return await http.get(path, headers=headers)


async def test_domain_error_uses_standard_body() -> None:
    """Domain error uses standard body."""
    response = await get("/domain")
    assert response.status_code == 500
    assert response.json()["message"] == "custom failure" and response.json()["details"] == {"k": "v"}


async def test_trace_id_is_echoed_from_header() -> None:
    """Trace id is echoed from header."""
    assert (await get("/domain", {"X-Trace-Id": "abc123"})).json()["trace_id"] == "abc123"


async def test_unexpected_error_hides_internals() -> None:
    """Unexpected error hides internals."""
    response = await get("/crash")
    assert response.status_code == 500 and "secret" not in response.text
    assert response.json()["error_code"] == "INTERNAL_ERROR"


async def test_request_validation_error_lists_fields() -> None:
    """Request validation error lists fields."""
    response = await get("/typed/abc")
    assert response.status_code == 422 and response.json()["error_code"] == "REQUEST_INVALID"


async def test_valid_request_unaffected() -> None:
    """Valid request unaffected."""
    assert (await get("/typed/5")).json() == 5
