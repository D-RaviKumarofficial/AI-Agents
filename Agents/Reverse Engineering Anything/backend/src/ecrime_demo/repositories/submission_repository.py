"""Data access for simulated service submissions."""

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ecrime_demo.models.database import SubmissionRecord


class SubmissionRepository:
    """SQLAlchemy persistence for service submissions."""

    def __init__(self, session: AsyncSession) -> None:
        """Bind the repository to a database session."""
        self._session = session

    async def count(self) -> int:
        """Return the number of stored submissions."""
        return (await self._session.scalar(select(func.count()).select_from(SubmissionRecord))) or 0

    async def add(
        self, service_id: str, service_name: str, variant: str | None, values: dict[str, str], status: str
    ) -> SubmissionRecord:
        """Insert and return a new submission."""
        record = SubmissionRecord(
            service_id=service_id, service_name=service_name, variant=variant, values=values, status=status
        )
        self._session.add(record)
        await self._session.flush()
        return record

    async def list(self, limit: int, offset: int) -> list[SubmissionRecord]:
        """Return a page of submissions, oldest first."""
        result = await self._session.scalars(
            select(SubmissionRecord).order_by(SubmissionRecord.id).limit(limit).offset(offset)
        )
        return list(result)

    async def delete_all(self) -> None:
        """Remove all submissions."""
        await self._session.execute(delete(SubmissionRecord))
