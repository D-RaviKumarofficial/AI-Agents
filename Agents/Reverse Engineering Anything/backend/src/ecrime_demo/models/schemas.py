"""Pydantic request/response models."""

from typing import Literal

from pydantic import BaseModel, ConfigDict


class ReportPersonIn(BaseModel):
    """Reporter contact details (synthetic)."""

    model_config = ConfigDict(extra="forbid")

    fullName: str = ""
    email: str = ""
    phone: str = ""
    residency: str = ""


class ReportIncidentIn(BaseModel):
    """Incident description (synthetic)."""

    model_config = ConfigDict(extra="forbid")

    category: str = ""
    date: str = ""
    platform: str = ""
    description: str = ""
    amount: str = ""


class EvidenceFile(BaseModel):
    """Evidence file metadata only. File contents are never uploaded."""

    model_config = ConfigDict(extra="forbid")

    name: str
    size: int
    type: str


class ReportCreate(BaseModel):
    """Body for creating a simulated report."""

    model_config = ConfigDict(extra="forbid")

    demoOnly: bool = False
    person: ReportPersonIn
    incident: ReportIncidentIn
    evidence: list[EvidenceFile] = []
    consent: bool = False


class ReportOut(BaseModel):
    """A stored simulated report."""

    id: str
    reference: str
    status: str
    createdAt: str
    demoOnly: Literal[True] = True
    consent: Literal[True] = True
    person: ReportPersonIn
    incident: ReportIncidentIn
    evidence: list[EvidenceFile]


class ReportList(BaseModel):
    """Paginated reports."""

    reports: list[ReportOut]
    total: int
    limit: int
    offset: int


class SubmissionCreate(BaseModel):
    """Body for creating a simulated service request."""

    model_config = ConfigDict(extra="forbid")

    serviceId: str
    variant: str | None = None
    values: dict[str, str] = {}
    demoOnly: bool = False
    consent: bool = False


class SubmissionOut(BaseModel):
    """A stored simulated service request."""

    id: str
    reference: str
    serviceId: str
    serviceName: str
    variant: str | None
    values: dict[str, str]
    status: str
    createdAt: str
    demoOnly: Literal[True] = True
    consent: Literal[True] = True
    officialSubmission: Literal[False] = False


class SubmissionList(BaseModel):
    """Paginated submissions."""

    submissions: list[SubmissionOut]
    total: int
    limit: int
    offset: int


class ResetOut(BaseModel):
    """Result of clearing all simulated data."""

    reset: bool


class HealthOut(BaseModel):
    """Liveness/readiness response."""

    status: str
    storage: str = "sqlite"
    demoOnly: bool = True
