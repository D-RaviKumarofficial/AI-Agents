"""Business logic for simulated E-Crime reports."""

from ecrime_demo.core.validation import validate_report
from ecrime_demo.models.database import ReportRecord
from ecrime_demo.models.schemas import (
    EvidenceFile,
    ReportCreate,
    ReportIncidentIn,
    ReportList,
    ReportOut,
    ReportPersonIn,
)
from ecrime_demo.repositories.report_repository import ReportRepository
from ecrime_demo.settings import MAX_STORED_RECORDS, REPORT_REFERENCE_PREFIX, REPORT_STATUS
from ecrime_demo.utils.exceptions.exceptions import CapacityReachedError, ReportValidationError


def to_report_out(record: ReportRecord) -> ReportOut:
    """Map a database record to its API model."""
    return ReportOut(
        id=record.public_id,
        reference=f"{REPORT_REFERENCE_PREFIX}-{record.id:06d}",
        status=record.status,
        createdAt=record.created_at.isoformat(),
        person=ReportPersonIn(**record.person),
        incident=ReportIncidentIn(**record.incident),
        evidence=[EvidenceFile(**item) for item in record.evidence],
    )


class ReportService:
    """Creates, lists and clears simulated reports."""

    def __init__(self, repository: ReportRepository) -> None:
        """Store the report repository."""
        self._repository = repository

    async def create(self, payload: ReportCreate) -> ReportOut:
        """Validate and store a report."""
        errors = validate_report(payload)
        if errors:
            raise ReportValidationError(errors)
        if await self._repository.count() >= MAX_STORED_RECORDS:
            raise CapacityReachedError("reports", MAX_STORED_RECORDS)
        clean = payload.model_dump()
        person = {key: str(value).strip() for key, value in clean["person"].items()}
        incident = {key: str(value).strip() for key, value in clean["incident"].items()}
        record = await self._repository.add(person, incident, clean["evidence"], REPORT_STATUS)
        return to_report_out(record)

    async def list(self, limit: int, offset: int) -> ReportList:
        """Return a page of reports."""
        records = await self._repository.list(limit, offset)
        return ReportList(
            reports=[to_report_out(r) for r in records],
            total=await self._repository.count(),
            limit=limit,
            offset=offset,
        )
