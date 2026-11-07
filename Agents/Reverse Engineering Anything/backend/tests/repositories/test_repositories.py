"""Tests for the repositories (real SQLite in a temp dir)."""

from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from ecrime_demo.repositories.catalog_repository import CatalogRepository
from ecrime_demo.repositories.report_repository import ReportRepository
from ecrime_demo.repositories.submission_repository import SubmissionRepository


async def test_report_repository_add_list_count_delete(session: AsyncSession) -> None:
    """Report repository add list count delete."""
    repo = ReportRepository(session)
    first = await repo.add({"fullName": "A"}, {"category": "x"}, [], "Demo received")
    await repo.add({"fullName": "B"}, {"category": "y"}, [], "Demo received")
    assert first.id == 1 and await repo.count() == 2
    assert [r.id for r in await repo.list(limit=1, offset=1)] == [2]
    await repo.delete_all()
    assert await repo.count() == 0


async def test_report_repository_empty_list(session: AsyncSession) -> None:
    """Report repository empty list."""
    assert await ReportRepository(session).list(limit=10, offset=0) == []


async def test_submission_repository_add_list_count_delete(session: AsyncSession) -> None:
    """Submission repository add list count delete."""
    repo = SubmissionRepository(session)
    record = await repo.add("svc", "Service", None, {"a": "1"}, "Local simulation completed")
    assert record.id == 1 and await repo.count() == 1
    assert (await repo.list(limit=10, offset=0))[0].values == {"a": "1"}
    await repo.delete_all()
    assert await repo.count() == 0


async def test_submission_repository_offset_past_end(session: AsyncSession) -> None:
    """Submission repository offset past end."""
    assert await SubmissionRepository(session).list(limit=10, offset=50) == []


def test_catalog_repository_find_service_success() -> None:
    """Catalog repository find service success."""
    assert CatalogRepository().find_service("document-verification")["name"] == "Document Verification"


def test_catalog_repository_find_service_unknown() -> None:
    """Catalog repository find service unknown."""
    assert CatalogRepository().find_service("nope") is None


def test_catalog_repository_reads_custom_path(tmp_path: Path) -> None:
    """Catalog repository reads custom path."""
    path = tmp_path / "c.json"
    path.write_text('{"groups": [{"services": [{"id": "s1"}]}]}', encoding="utf-8")
    repo = CatalogRepository(path)
    assert repo.find_service("s1") == {"id": "s1"} and repo.find_service("s2") is None
