"""Version 1 API routes."""

from collections.abc import AsyncIterator
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse

from ecrime_demo.models.chat_schemas import ChatRequest, ChatResponse, ChatStreamEvent
from ecrime_demo.models.schemas import (
    ReportCreate,
    ReportList,
    ReportOut,
    ResetOut,
    SubmissionCreate,
    SubmissionList,
    SubmissionOut,
)
from ecrime_demo.repositories.catalog_repository import CatalogRepository
from ecrime_demo.services.chat_service import ChatService
from ecrime_demo.services.dependencies import (
    get_catalog_repository,
    get_chat_service,
    get_report_service,
    get_sandbox_service,
    get_submission_service,
)
from ecrime_demo.services.report_service import ReportService
from ecrime_demo.services.sandbox_service import SandboxService
from ecrime_demo.services.submission_service import SubmissionService
from ecrime_demo.settings import API_PREFIX, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE

router = APIRouter(prefix=API_PREFIX, tags=["v1"])

Limit = Annotated[int, Query(ge=1, le=MAX_PAGE_SIZE)]
Offset = Annotated[int, Query(ge=0)]


@router.get("/catalog", summary="Captured service catalog")
async def get_catalog(catalog: CatalogRepository = Depends(get_catalog_repository)) -> dict[str, Any]:
    """Return the static catalog captured from the reference site."""
    return catalog.get_catalog()


@router.post("/reports", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
async def create_report(payload: ReportCreate, service: ReportService = Depends(get_report_service)) -> ReportOut:
    """Store a simulated E-Crime report. Nothing is sent to any authority."""
    return await service.create(payload)


@router.get("/reports", response_model=ReportList)
async def list_reports(
    limit: Limit = DEFAULT_PAGE_SIZE, offset: Offset = 0, service: ReportService = Depends(get_report_service)
) -> ReportList:
    """List stored simulated reports."""
    return await service.list(limit, offset)


@router.post("/submissions", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
async def create_submission(
    payload: SubmissionCreate, service: SubmissionService = Depends(get_submission_service)
) -> SubmissionOut:
    """Store a simulated service request. Nothing is sent to any authority."""
    return await service.create(payload)


@router.get("/submissions", response_model=SubmissionList)
async def list_submissions(
    limit: Limit = DEFAULT_PAGE_SIZE, offset: Offset = 0, service: SubmissionService = Depends(get_submission_service)
) -> SubmissionList:
    """List stored simulated service requests."""
    return await service.list(limit, offset)


@router.post("/reset", response_model=ResetOut)
async def reset(service: SandboxService = Depends(get_sandbox_service)) -> ResetOut:
    """Delete all simulated reports and submissions."""
    await service.reset()
    return ResetOut(reset=True)


@router.post("/chat", response_model=ChatResponse, summary="Ask the services assistant")
async def chat(payload: ChatRequest, service: ChatService = Depends(get_chat_service)) -> ChatResponse:
    """Answer a question about services with the language model. 503 if it is unavailable. Nothing is stored."""
    return await service.reply(payload)


def _sse(event: ChatStreamEvent) -> str:
    """Format one stream event as a Server-Sent Events message."""
    return f"data: {event.model_dump_json()}\n\n"


async def _event_stream(first: ChatStreamEvent, rest: AsyncIterator[ChatStreamEvent]) -> AsyncIterator[str]:
    """Send the already-read first event, then the rest."""
    yield _sse(first)
    async for event in rest:
        yield _sse(event)


@router.post("/chat/stream", summary="Ask the services assistant, streamed word by word")
async def chat_stream(payload: ChatRequest, service: ChatService = Depends(get_chat_service)) -> StreamingResponse:
    """Same as `/chat`, but the answer arrives as Server-Sent Events: `delta` pieces, then `done` (or `error`).

    A missing model is reported as a normal 503 before the stream starts. Nothing is stored.
    """
    events = service.stream(payload)
    first = await anext(events)  # raises ModelUnavailableError (503) before any byte is sent
    return StreamingResponse(
        _event_stream(first, events),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
