"""FastAPI application factory."""

import asyncio
import contextlib
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ecrime_demo.repositories.bedrock_model import load_aws_env
from ecrime_demo.repositories.database import create_engine, create_session_factory, init_database
from ecrime_demo.routes import default, speech, v1
from ecrime_demo.services.dependencies import get_transcriber
from ecrime_demo.settings import BACKEND_ROOT, Settings, get_settings
from ecrime_demo.utils.exceptions.handlers import register_exception_handlers
from ecrime_demo.utils.logger import logger


async def _preload_speech_model() -> None:
    """Load the speech model off the event loop; a failure only means it will be tried again on first use."""
    try:
        await asyncio.to_thread(get_transcriber().load)
    except Exception:  # noqa: BLE001
        logger.warning("Speech model preload failed; it will be retried on first use")


def create_app(settings: Settings | None = None) -> FastAPI:
    """Build the application with the given (or default) settings."""
    settings = settings or get_settings()
    load_aws_env(BACKEND_ROOT / ".env")

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        """Create the database engine on startup and dispose of it on shutdown."""
        engine = create_engine(settings)
        app.state.engine = engine
        app.state.session_factory = create_session_factory(engine)
        await init_database(engine)
        logger.info("Database ready")
        warmup = None
        if settings.stt_preload:
            # Load the speech model in the background so the first recording is not slow. Failures are logged.
            warmup = asyncio.create_task(_preload_speech_model())
        yield
        if warmup is not None:
            warmup.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await warmup
        await engine.dispose()

    app = FastAPI(
        title="eCrime Demo API",
        description="Synthetic backend for the reconstructed services demo. No data reaches any authority.",
        version="1.0.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "X-Trace-Id"],
    )
    register_exception_handlers(app)
    app.include_router(default.router)
    app.include_router(v1.router)
    app.include_router(speech.router)
    return app


app = create_app()
