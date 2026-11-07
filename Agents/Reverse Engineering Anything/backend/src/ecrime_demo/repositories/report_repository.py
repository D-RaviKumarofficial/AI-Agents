"""Data access for simulated reports."""

from typing import Any

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ecrime_demo.models.database import ReportRecord


class ReportRepository:
    """SQLAlchemy persistence for reports."""

    def __init__(self, session: AsyncSession) -> None:
        """Bind the repository to a database session."""
        self._session = session

    async def count(self) -> int:
        """Return the number of stored reports."""
        return (await self._session.scalar(select(func.count()).select_from(ReportRecord))) or 0

    async def add(
        self, person: dict[str, Any], incident: dict[str, Any], evidence: list[dict[str, Any]], status: str
    ) -> ReportRecord:
        """Insert and return a new report."""
        record = ReportRecord(person=person, incident=incident, evidence=evidence, status=status)
        self._session.add(record)
        await self._session.flush()
        return record

    async def list(self, limit: int, offset: int) -> list[ReportRecord]:
        """Return a page of reports, oldest first."""
        result = await self._session.scalars(select(ReportRecord).order_by(ReportRecord.id).limit(limit).offset(offset))
        return list(result)

    async def delete_all(self) -> None:
        """Remove all reports."""
        await self._session.execute(delete(ReportRecord))
