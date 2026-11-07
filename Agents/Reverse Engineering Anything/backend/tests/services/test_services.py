"""Tests for the service layer with mocked repositories."""

from copy import deepcopy
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from ecrime_demo.models.database import ReportRecord, SubmissionRecord
from ecrime_demo.models.schemas import ReportCreate, SubmissionCreate
from ecrime_demo.services.report_service import ReportService, to_report_out
from ecrime_demo.services.sandbox_service import SandboxService
from ecrime_demo.services.submission_service import SubmissionService, to_submission_out
from ecrime_demo.settings import MAX_STORED_RECORDS
from ecrime_demo.utils.exceptions.exceptions import (
    CapacityReachedError,
    ReportValidationError,
    ServiceNotFoundError,
    SubmissionValidationError,
)
from tests.conftest import VALID_REPORT

NOW = datetime(2026, 11, 6, tzinfo=UTC)
TEXT_SERVICE = {"id": "s", "name": "S", "fields": [{"id": "a", "label": "A", "type": "text", "required": True}]}
VARIANT_SERVICE = {"id": "s", "name": "S", "variants": [{"id": "v", "fields": []}]}


def report_record() -> ReportRecord:
    """Build a stored report record with id 7."""
    data = deepcopy(VALID_REPORT)
    return ReportRecord(
        id=7,
        public_id="abc",
        person=data["person"],
        incident=data["incident"],
        evidence=data["evidence"],
        status="Demo received",
        created_at=NOW,
    )


def submission_record() -> SubmissionRecord:
    """Build a stored submission record with id 3."""
    return SubmissionRecord(
        id=3,
        public_id="xyz",
        service_id="s",
        service_name="S",
        variant=None,
        values={"a": "1"},
        status="Local simulation completed",
        created_at=NOW,
    )


def submission_service(count: int = 0, service: dict | None = TEXT_SERVICE) -> tuple[SubmissionService, MagicMock]:
    """Build a SubmissionService with mocked repository and catalog."""
    repo = MagicMock(count=AsyncMock(return_value=count), add=AsyncMock(return_value=submission_record()))
    catalog = MagicMock()
    catalog.find_service.return_value = service
    return SubmissionService(repo, catalog), repo


def body(**changes: object) -> SubmissionCreate:
    """Build a valid submission request, overriding the given fields."""
    base = {"serviceId": "s", "values": {"a": "1"}, "demoOnly": True, "consent": True}
    return SubmissionCreate(**{**base, **changes})


def test_to_report_out_formats_reference() -> None:
    """To report out formats reference."""
    assert to_report_out(report_record()).reference == "DEMO-000007"


def test_to_report_out_rejects_corrupt_record() -> None:
    """To report out rejects corrupt record."""
    record = report_record()
    record.person = {"unexpected": "x"}
    with pytest.raises(ValueError):
        to_report_out(record)


def test_to_submission_out_formats_reference() -> None:
    """To submission out formats reference."""
    assert to_submission_out(submission_record()).reference == "DEMO-SVC-000003"


def test_to_submission_out_marks_not_official() -> None:
    """To submission out marks not official."""
    assert to_submission_out(submission_record()).officialSubmission is False


async def test_report_service_create_success() -> None:
    """Report service create success."""
    repo = MagicMock(count=AsyncMock(return_value=0), add=AsyncMock(return_value=report_record()))
    result = await ReportService(repo).create(ReportCreate(**VALID_REPORT))
    assert result.reference == "DEMO-000007"
    repo.add.assert_awaited_once()


async def test_report_service_create_invalid_does_not_store() -> None:
    """Report service create invalid does not store."""
    repo = MagicMock(count=AsyncMock(return_value=0), add=AsyncMock())
    with pytest.raises(ReportValidationError):
        await ReportService(repo).create(ReportCreate(**{**VALID_REPORT, "consent": False}))
    repo.add.assert_not_awaited()


async def test_report_service_create_at_capacity() -> None:
    """Report service create at capacity."""
    repo = MagicMock(count=AsyncMock(return_value=MAX_STORED_RECORDS), add=AsyncMock())
    with pytest.raises(CapacityReachedError):
        await ReportService(repo).create(ReportCreate(**VALID_REPORT))
    repo.add.assert_not_awaited()


async def test_report_service_list_success() -> None:
    """Report service list success."""
    repo = MagicMock(list=AsyncMock(return_value=[report_record()]), count=AsyncMock(return_value=1))
    result = await ReportService(repo).list(10, 0)
    assert result.total == 1 and result.reports[0].id == "abc"


async def test_report_service_list_empty() -> None:
    """Report service list empty."""
    repo = MagicMock(list=AsyncMock(return_value=[]), count=AsyncMock(return_value=0))
    assert (await ReportService(repo).list(10, 0)).reports == []


async def test_submission_service_create_success() -> None:
    """Submission service create success."""
    service, repo = submission_service()
    assert (await service.create(body())).reference == "DEMO-SVC-000003"
    repo.add.assert_awaited_once()


async def test_submission_service_create_unknown_service() -> None:
    """Submission service create unknown service."""
    service, repo = submission_service(service=None)
    with pytest.raises(ServiceNotFoundError):
        await service.create(body())
    repo.add.assert_not_awaited()


async def test_submission_service_create_invalid_values() -> None:
    """Submission service create invalid values."""
    service, repo = submission_service()
    with pytest.raises(SubmissionValidationError):
        await service.create(body(values={}))
    repo.add.assert_not_awaited()


async def test_submission_service_create_unknown_variant() -> None:
    """Submission service create unknown variant."""
    service, repo = submission_service(service=VARIANT_SERVICE)
    with pytest.raises(SubmissionValidationError):
        await service.create(body(variant="zzz"))
    repo.add.assert_not_awaited()


async def test_submission_service_create_keeps_known_variant() -> None:
    """Submission service create keeps known variant."""
    service, repo = submission_service(service=VARIANT_SERVICE)
    await service.create(body(variant="v"))
    assert repo.add.await_args.args[2] == "v"


async def test_submission_service_create_drops_variant_for_plain_service() -> None:
    """Submission service create drops variant for plain service."""
    service, repo = submission_service()
    await service.create(body(variant="ignored"))
    assert repo.add.await_args.args[2] is None


async def test_submission_service_create_at_capacity() -> None:
    """Submission service create at capacity."""
    service, repo = submission_service(count=MAX_STORED_RECORDS)
    with pytest.raises(CapacityReachedError):
        await service.create(body())
    repo.add.assert_not_awaited()


async def test_submission_service_list_success() -> None:
    """Submission service list success."""
    service, repo = submission_service(count=1)
    repo.list = AsyncMock(return_value=[submission_record()])
    assert (await service.list(10, 0)).total == 1


async def test_submission_service_list_empty() -> None:
    """Submission service list empty."""
    service, repo = submission_service(count=0)
    repo.list = AsyncMock(return_value=[])
    assert (await service.list(10, 0)).submissions == []


async def test_sandbox_service_reset_clears_both() -> None:
    """Sandbox service reset clears both."""
    reports, submissions = MagicMock(delete_all=AsyncMock()), MagicMock(delete_all=AsyncMock())
    await SandboxService(reports, submissions).reset()
    reports.delete_all.assert_awaited_once()
    submissions.delete_all.assert_awaited_once()


async def test_sandbox_service_reset_propagates_failure() -> None:
    """Sandbox service reset propagates failure."""
    reports = MagicMock(delete_all=AsyncMock(side_effect=RuntimeError("db")))
    submissions = MagicMock(delete_all=AsyncMock())
    with pytest.raises(RuntimeError):
        await SandboxService(reports, submissions).reset()
    submissions.delete_all.assert_not_awaited()
