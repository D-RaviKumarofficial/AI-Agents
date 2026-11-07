"""Service info and health endpoints."""

from fastapi import APIRouter, Request
from sqlalchemy import text

from ecrime_demo.models.schemas import HealthOut
from ecrime_demo.utils.exceptions.exceptions import NotReadyError

router = APIRouter(tags=["default"])


@router.get("/", summary="Service information")
async def info() -> dict[str, str | bool]:
    """Describe this service."""
    return {"name": "ecrime-demo", "version": "1.0.0", "demoOnly": True, "docs": "/docs"}


@router.get("/health", response_model=HealthOut, summary="Liveness")
async def health() -> HealthOut:
    """Report that the process is running."""
    return HealthOut(status="ok")


@router.get("/ready", response_model=HealthOut, summary="Readiness")
async def ready(request: Request) -> HealthOut:
    """Verify that the database is reachable."""
    try:
        async with request.app.state.engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
    except Exception as error:
        raise NotReadyError(type(error).__name__) from error
    return HealthOut(status="ready")
