"""Dependency injection configuration for FastAPI."""

from collections.abc import AsyncIterator
from functools import lru_cache

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ecrime_demo.core.chat.access import load_access
from ecrime_demo.core.chat.assistant import ChatbotEngine
from ecrime_demo.repositories.bedrock_model import BedrockModel
from ecrime_demo.repositories.catalog_repository import CatalogRepository
from ecrime_demo.repositories.report_repository import ReportRepository
from ecrime_demo.repositories.submission_repository import SubmissionRepository
from ecrime_demo.repositories.whisper_transcriber import WhisperTranscriber
from ecrime_demo.services.chat_service import ChatService
from ecrime_demo.services.report_service import ReportService
from ecrime_demo.services.sandbox_service import SandboxService
from ecrime_demo.services.speech_service import SpeechService
from ecrime_demo.services.submission_service import SubmissionService
from ecrime_demo.settings import get_settings


async def get_session(request: Request) -> AsyncIterator[AsyncSession]:
    """Yield a session, committing on success and rolling back on error."""
    async with request.app.state.session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


def get_catalog_repository() -> CatalogRepository:
    """Provide the catalog repository."""
    return CatalogRepository()


def get_report_service(session: AsyncSession = Depends(get_session)) -> ReportService:
    """Provide the report service."""
    return ReportService(ReportRepository(session))


def get_submission_service(
    session: AsyncSession = Depends(get_session),
    catalog: CatalogRepository = Depends(get_catalog_repository),
) -> SubmissionService:
    """Provide the submission service."""
    return SubmissionService(SubmissionRepository(session), catalog)


def get_sandbox_service(session: AsyncSession = Depends(get_session)) -> SandboxService:
    """Provide the sandbox maintenance service."""
    return SandboxService(ReportRepository(session), SubmissionRepository(session))


@lru_cache
def _chatbot_engine() -> ChatbotEngine:
    """Build the chatbot engine once from the captured catalog and observed access data."""
    return ChatbotEngine(CatalogRepository().get_catalog(), load_access())


@lru_cache
def _bedrock_model() -> BedrockModel:
    """Build the model client once. It is created lazily, so this never touches the network."""
    return BedrockModel(get_settings())


def get_chat_service() -> ChatService:
    """Provide the chat service."""
    return ChatService(_chatbot_engine(), _bedrock_model())


@lru_cache
def get_transcriber() -> WhisperTranscriber:
    """Build the speech model holder once. The model itself loads on first use (or at startup, if preloading)."""
    return WhisperTranscriber(get_settings())


@lru_cache
def get_speech_service() -> SpeechService:
    """Provide the speech service. One instance, so only one transcription runs at a time."""
    return SpeechService(get_transcriber(), get_settings())
