"""Business logic for simulated service submissions."""

from ecrime_demo.core.validation import service_fields, validate_submission_values
from ecrime_demo.models.database import SubmissionRecord
from ecrime_demo.models.schemas import SubmissionCreate, SubmissionList, SubmissionOut
from ecrime_demo.repositories.catalog_repository import CatalogRepository
from ecrime_demo.repositories.submission_repository import SubmissionRepository
from ecrime_demo.settings import MAX_STORED_RECORDS, SUBMISSION_REFERENCE_PREFIX, SUBMISSION_STATUS
from ecrime_demo.utils.exceptions.exceptions import (
    CapacityReachedError,
    ServiceNotFoundError,
    SubmissionValidationError,
)


def to_submission_out(record: SubmissionRecord) -> SubmissionOut:
    """Map a database record to its API model."""
    return SubmissionOut(
        id=record.public_id,
        reference=f"{SUBMISSION_REFERENCE_PREFIX}-{record.id:06d}",
        serviceId=record.service_id,
        serviceName=record.service_name,
        variant=record.variant,
        values=record.values,
        status=record.status,
        createdAt=record.created_at.isoformat(),
    )


class SubmissionService:
    """Creates and lists simulated service requests."""

    def __init__(self, repository: SubmissionRepository, catalog: CatalogRepository) -> None:
        """Store the submission repository and the service catalog."""
        self._repository = repository
        self._catalog = catalog

    async def create(self, payload: SubmissionCreate) -> SubmissionOut:
        """Validate against the catalog and store a submission."""
        service = self._catalog.find_service(payload.serviceId)
        if service is None:
            raise ServiceNotFoundError(payload.serviceId)
        fields = service_fields(service, payload.variant)
        if fields is None:
            raise SubmissionValidationError({"variant": "Choose a known lookup tab."})
        errors, clean = validate_submission_values(fields, payload.values, payload.demoOnly, payload.consent)
        if errors:
            raise SubmissionValidationError(errors)
        if await self._repository.count() >= MAX_STORED_RECORDS:
            raise CapacityReachedError("submissions", MAX_STORED_RECORDS)
        variant = payload.variant if service.get("variants") else None
        record = await self._repository.add(service["id"], service["name"], variant, clean, SUBMISSION_STATUS)
        return to_submission_out(record)

    async def list(self, limit: int, offset: int) -> SubmissionList:
        """Return a page of submissions."""
        records = await self._repository.list(limit, offset)
        return SubmissionList(
            submissions=[to_submission_out(r) for r in records],
            total=await self._repository.count(),
            limit=limit,
            offset=offset,
        )
