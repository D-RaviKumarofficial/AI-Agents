"""Maintenance operations for the demo sandbox."""

from ecrime_demo.repositories.report_repository import ReportRepository
from ecrime_demo.repositories.submission_repository import SubmissionRepository


class SandboxService:
    """Clears all simulated data."""

    def __init__(self, reports: ReportRepository, submissions: SubmissionRepository) -> None:
        """Store the repositories whose data is cleared on reset."""
        self._reports = reports
        self._submissions = submissions

    async def reset(self) -> None:
        """Delete every stored report and submission."""
        await self._reports.delete_all()
        await self._submissions.delete_all()
