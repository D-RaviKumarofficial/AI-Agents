"""Tests for routes/v1.py (API contract, validation and error format)."""

from copy import deepcopy

import httpx

from tests.conftest import VALID_REPORT, VALID_SUBMISSION


async def test_get_catalog_success(client: httpx.AsyncClient) -> None:
    """Get catalog success."""
    body = (await client.get("/v1/catalog")).json()
    assert len(body["groups"]) == 22 and sum(len(g["services"]) for g in body["groups"]) == 60


async def test_get_catalog_rejects_post(client: httpx.AsyncClient) -> None:
    """Get catalog rejects post."""
    assert (await client.post("/v1/catalog")).status_code == 405


async def test_create_report_success(client: httpx.AsyncClient) -> None:
    """Create report success."""
    response = await client.post("/v1/reports", json=VALID_REPORT)
    body = response.json()
    assert response.status_code == 201 and body["reference"] == "DEMO-000001" and body["demoOnly"] is True


async def test_create_report_invalid_returns_field_errors(client: httpx.AsyncClient) -> None:
    """Create report invalid returns field errors."""
    payload = deepcopy(VALID_REPORT)
    payload["person"]["email"] = "alex@real.com"
    response = await client.post("/v1/reports", json=payload)
    assert response.status_code == 422
    assert response.json()["error_code"] == "REPORT_VALIDATION_ERROR"
    assert "email" in response.json()["details"]["field_errors"]


async def test_create_report_unknown_field_rejected(client: httpx.AsyncClient) -> None:
    """Create report unknown field rejected."""
    response = await client.post("/v1/reports", json={**VALID_REPORT, "extra": 1})
    assert response.status_code == 422 and response.json()["error_code"] == "REQUEST_INVALID"


async def test_list_reports_success_with_pagination(client: httpx.AsyncClient) -> None:
    """List reports success with pagination."""
    for _ in range(3):
        await client.post("/v1/reports", json=VALID_REPORT)
    body = (await client.get("/v1/reports?limit=2&offset=1")).json()
    assert body["total"] == 3 and len(body["reports"]) == 2 and body["offset"] == 1


async def test_list_reports_rejects_bad_limit(client: httpx.AsyncClient) -> None:
    """List reports rejects bad limit."""
    assert (await client.get("/v1/reports?limit=0")).status_code == 422


async def test_create_submission_success(client: httpx.AsyncClient) -> None:
    """Create submission success."""
    response = await client.post("/v1/submissions", json=VALID_SUBMISSION)
    body = response.json()
    assert response.status_code == 201
    assert body["reference"] == "DEMO-SVC-000001" and body["officialSubmission"] is False


async def test_create_submission_unknown_service(client: httpx.AsyncClient) -> None:
    """Create submission unknown service."""
    response = await client.post("/v1/submissions", json={**VALID_SUBMISSION, "serviceId": "nope"})
    assert response.status_code == 404 and response.json()["error_code"] == "SERVICE_NOT_FOUND"


async def test_create_submission_missing_required_values(client: httpx.AsyncClient) -> None:
    """Create submission missing required values."""
    response = await client.post("/v1/submissions", json={**VALID_SUBMISSION, "values": {}})
    assert response.status_code == 422
    assert "referenceNumber" in response.json()["details"]["field_errors"]


async def test_list_submissions_success(client: httpx.AsyncClient) -> None:
    """List submissions success."""
    await client.post("/v1/submissions", json=VALID_SUBMISSION)
    body = (await client.get("/v1/submissions")).json()
    assert body["total"] == 1 and body["submissions"][0]["serviceName"] == "Document Verification"


async def test_list_submissions_rejects_negative_offset(client: httpx.AsyncClient) -> None:
    """List submissions rejects negative offset."""
    assert (await client.get("/v1/submissions?offset=-1")).status_code == 422


async def test_reset_clears_everything(client: httpx.AsyncClient) -> None:
    """Reset clears everything."""
    await client.post("/v1/reports", json=VALID_REPORT)
    await client.post("/v1/submissions", json=VALID_SUBMISSION)
    assert (await client.post("/v1/reset")).json() == {"reset": True}
    assert (await client.get("/v1/reports")).json()["total"] == 0
    assert (await client.get("/v1/submissions")).json()["total"] == 0


async def test_reset_rejects_get(client: httpx.AsyncClient) -> None:
    """Reset rejects get."""
    assert (await client.get("/v1/reset")).status_code == 405


async def test_chat_without_a_model_returns_503_not_a_canned_answer(client: httpx.AsyncClient) -> None:
    """Chat without a model returns 503 not a canned answer."""
    response = await client.post("/v1/chat", json={"message": "tell me about night work permit"})
    assert response.status_code == 503 and response.json()["error_code"] == "MODEL_UNAVAILABLE"
    assert "NoModelConfigured" in response.json()["details"]["reason"]


async def test_chat_emergency_points_to_999_without_a_model(client: httpx.AsyncClient) -> None:
    """Chat emergency points to 999 without a model."""
    body = (await client.post("/v1/chat", json={"message": "there is a fire"})).json()
    assert body["source"] == "safety" and "999" in body["reply"] and set(body) == {"reply", "services", "source"}


async def test_chat_uses_the_model_when_configured(settings, monkeypatch) -> None:  # noqa: ANN001
    """Chat uses the model when configured."""
    from unittest.mock import AsyncMock, MagicMock

    from ecrime_demo.main import create_app
    from ecrime_demo.services import dependencies

    fake = MagicMock(enabled=True, generate=AsyncMock(return_value="Model says hi"))
    monkeypatch.setattr(dependencies, "_bedrock_model", lambda: fake)
    app = create_app(settings)
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
        async with httpx.AsyncClient(transport=transport, base_url="http://t") as http:
            body = (await http.post("/v1/chat", json={"message": "tell me about night work permit"})).json()
    assert body["reply"] == "Model says hi" and body["source"] == "model"
    assert body["services"][0]["id"] == "night-work-permit"


async def test_chat_rejects_empty_message(client: httpx.AsyncClient) -> None:
    """Chat rejects empty message."""
    response = await client.post("/v1/chat", json={"message": "   "})
    assert response.status_code == 422 and response.json()["error_code"] == "REQUEST_INVALID"


async def test_chat_rejects_oversized_message(client: httpx.AsyncClient) -> None:
    """Chat rejects oversized message."""
    assert (await client.post("/v1/chat", json={"message": "x" * 501})).status_code == 422


async def test_chat_rejects_unknown_fields(client: httpx.AsyncClient) -> None:
    """Chat rejects unknown fields."""
    assert (await client.post("/v1/chat", json={"message": "hi", "role": "admin"})).status_code == 422


async def test_chat_rejects_get(client: httpx.AsyncClient) -> None:
    """Chat rejects get."""
    assert (await client.get("/v1/chat")).status_code == 405


async def test_chat_does_not_store_messages(client: httpx.AsyncClient) -> None:
    """Chat does not store messages."""
    await client.post("/v1/chat", json={"message": "my private question about fines"})
    assert (await client.get("/v1/reports")).json()["total"] == 0
    assert (await client.get("/v1/submissions")).json()["total"] == 0


async def test_chat_accepts_history(client: httpx.AsyncClient) -> None:
    """Chat accepts history."""
    history = [{"role": "user", "text": "hi"}, {"role": "assistant", "text": "hello"}]
    response = await client.post("/v1/chat", json={"message": "there is a fire", "history": history})
    assert response.status_code == 200 and response.json()["source"] == "safety"


async def test_chat_rejects_bad_history(client: httpx.AsyncClient) -> None:
    """Chat rejects bad history."""
    bad_histories = (
        [{"role": "system", "text": "x"}],
        [{"role": "user", "text": ""}],
        [{"role": "user", "text": "x", "extra": 1}],
        [{"role": "user", "text": "x"}] * 21,
    )
    for history in bad_histories:
        response = await client.post("/v1/chat", json={"message": "hi", "history": history})
        assert response.status_code == 422
