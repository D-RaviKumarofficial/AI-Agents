"""Pure validation logic ported from the frontend report.mjs / services.mjs rules."""

import json
import re
from datetime import UTC, date, datetime
from typing import Any

from ecrime_demo.models.schemas import EvidenceFile, ReportCreate
from ecrime_demo.settings import ALLOWED_FILE_TYPES, MAX_EVIDENCE_FILES, MAX_FILE_BYTES

INCIDENT_CATEGORIES = (
    "Online fraud",
    "Account compromise",
    "Online harassment",
    "Identity misuse",
    "Other cyber incident",
)
RESIDENCY_TYPES = ("Resident", "Visitor", "Citizen")
TEST_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.test$")
PHONE = re.compile(r"^\+?[\d\s()-]{7,25}$")
DEMO_ID = re.compile(r"^DEMO[-_A-Za-z0-9]*$")
AMOUNT = re.compile(r"^\d+(\.\d{1,2})?$")
MOCK_FIELDS: list[dict[str, Any]] = [
    {"id": "fullName", "label": "Full name", "type": "text", "required": True},
    {"id": "email", "label": "Email address (.test)", "type": "email", "required": True},
    {"id": "subject", "label": "Request subject", "type": "text", "required": True},
    {"id": "details", "label": "Request details", "type": "textarea", "required": True},
]


def _valid_file(file: EvidenceFile) -> bool:
    """Return True if the evidence file metadata is within the size, name and type limits."""
    return 0 <= file.size <= MAX_FILE_BYTES and len(file.name) <= 200 and file.type in ALLOWED_FILE_TYPES


def _valid_date(value: str) -> bool:
    """Return True for an ISO YYYY-MM-DD date that is not in the future."""
    try:
        parsed = date.fromisoformat(value)
    except ValueError:
        return False
    return len(value) == 10 and parsed <= datetime.now(UTC).date()


def validate_report(report: ReportCreate) -> dict[str, str]:
    """Return field errors for a report (empty dict means valid)."""
    errors: dict[str, str] = {}
    person, incident = report.person, report.incident
    if not report.demoOnly:
        errors["demoOnly"] = "Confirm the details entered are for testing purposes."
    if not 2 <= len(person.fullName.strip()) <= 100:
        errors["fullName"] = "Enter your full name (2-100 characters)."
    if not TEST_EMAIL.match(person.email) or len(person.email) > 200:
        errors["email"] = "Use an email ending in .test."
    if not PHONE.match(person.phone):
        errors["phone"] = "Enter a valid phone number (7-25 characters)."
    if person.residency not in RESIDENCY_TYPES:
        errors["residency"] = "Choose a residency type."
    if incident.category not in INCIDENT_CATEGORIES:
        errors["category"] = "Choose an incident category."
    if not _valid_date(incident.date):
        errors["date"] = "Choose a valid date that is not in the future."
    if not 2 <= len(incident.platform.strip()) <= 150:
        errors["platform"] = "Enter a platform (2-150 characters)."
    if not 20 <= len(incident.description.strip()) <= 3000:
        errors["description"] = "Describe the incident in 20-3000 characters."
    if incident.amount and (not AMOUNT.match(incident.amount) or float(incident.amount) > 10_000_000):
        errors["amount"] = "Enter a nonnegative amount up to 10,000,000."
    if len(report.evidence) > MAX_EVIDENCE_FILES or not all(_valid_file(f) for f in report.evidence):
        errors["evidence"] = "Use up to five TXT, PNG, JPG or PDF files, each at most 5 MB."
    if not report.consent:
        errors["consent"] = "Confirm this report is not submitted to any authority."
    return errors


def service_fields(service: dict[str, Any], variant: str | None) -> list[dict[str, Any]] | None:
    """Return the fields for a service/variant, or None if the variant is unknown."""
    if service.get("variants"):
        match = next((v for v in service["variants"] if v["id"] == variant), None)
        return match["fields"] if match else None
    return service.get("fields") or MOCK_FIELDS


def _field_error(field: dict[str, Any], value: str) -> str | None:
    """Return an error message for a non-empty or oversized field value, or None if it is valid."""
    label, kind = field["label"], field["type"]
    if len(value) > 3000:
        return f"{label} exceeds 3000 characters."
    if not value:
        return None
    if kind == "number" and not re.fullmatch(r"\d{1,20}", value):
        return f"Use a nonnegative test number for {label}."
    if field.get("syntheticId") and not DEMO_ID.match(value):
        return "Use a test ID starting with DEMO; never enter a real identity number."
    if kind == "checkbox" and value != "yes":
        return f"Confirm {label}."
    if kind == "email" and not TEST_EMAIL.match(value):
        return "Use an email ending in .test."
    if kind == "select" and field.get("options") and value not in field["options"]:
        return f"Choose a known {label}."
    if kind == "file":
        return _file_error(value)
    return None


def _file_error(value: str) -> str | None:
    """Return an error message if the JSON file metadata is invalid, otherwise None."""
    message = "Select a file of up to 5 MB (TXT, PNG, JPG or PDF)."
    try:
        meta = json.loads(value)
        valid = (
            isinstance(meta, dict)
            and set(meta) <= {"name", "size", "type"}
            and isinstance(meta.get("name"), str)
            and len(meta["name"]) <= 200
            and isinstance(meta.get("size"), int)
            and 0 <= meta["size"] <= MAX_FILE_BYTES
            and meta.get("type") in ALLOWED_FILE_TYPES
        )
    except json.JSONDecodeError:
        return message
    return None if valid else message


def validate_submission_values(
    fields: list[dict[str, Any]], values: dict[str, str], demo_only: bool, consent: bool
) -> tuple[dict[str, str], dict[str, str]]:
    """Validate submitted values. Returns (errors, cleaned_values)."""
    errors: dict[str, str] = {}
    clean: dict[str, str] = {}
    if not demo_only:
        errors["demoOnly"] = "Confirm the details entered are for testing purposes."
    if not consent:
        errors["consent"] = "Confirm this request is not submitted to any authority."
    for field in fields:
        raw = field.get("value") if field.get("disabled") else values.get(field["id"])
        if not isinstance(raw, str):
            if field.get("required"):
                errors[field["id"]] = f"Enter {field['label']}."
            continue
        value = raw.strip()
        if field.get("required") and not value:
            errors[field["id"]] = f"Enter {field['label']}."
        elif (message := _field_error(field, value)) is not None:
            errors[field["id"]] = message
        clean[field["id"]] = value
    return errors, clean
