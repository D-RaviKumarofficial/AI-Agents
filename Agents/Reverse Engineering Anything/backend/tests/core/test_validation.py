"""Tests for core/validation.py."""

from copy import deepcopy

import pytest

from ecrime_demo.core.validation import (
    MOCK_FIELDS,
    service_fields,
    validate_report,
    validate_submission_values,
)
from ecrime_demo.models.schemas import ReportCreate
from tests.conftest import VALID_REPORT


def report(**changes: object) -> ReportCreate:
    """Build a valid report, overriding fields with 'section__key' keyword arguments."""
    data = deepcopy(VALID_REPORT)
    for path, value in changes.items():
        section, _, key = path.partition("__")
        if key:
            data[section][key] = value
        else:
            data[section] = value
    return ReportCreate(**data)


def test_validate_report_success() -> None:
    """Validate report success."""
    assert validate_report(report()) == {}


@pytest.mark.parametrize(
    ("change", "field"),
    [
        ({"demoOnly": False}, "demoOnly"),
        ({"consent": False}, "consent"),
        ({"person__fullName": "A"}, "fullName"),
        ({"person__email": "a@real.com"}, "email"),
        ({"person__phone": "abc"}, "phone"),
        ({"person__residency": "Tourist"}, "residency"),
        ({"incident__category": "Spam"}, "category"),
        ({"incident__date": "2999-01-01"}, "date"),
        ({"incident__date": "not-a-date"}, "date"),
        ({"incident__platform": "x"}, "platform"),
        ({"incident__description": "too short"}, "description"),
        ({"incident__amount": "-5"}, "amount"),
        ({"incident__amount": "99999999"}, "amount"),
        ({"evidence": [{"name": "a.exe", "size": 1, "type": "application/x-msdownload"}]}, "evidence"),
        ({"evidence": [{"name": "a.txt", "size": 6 * 1024 * 1024, "type": "text/plain"}]}, "evidence"),
        ({"evidence": [{"name": "a.txt", "size": 1, "type": "text/plain"}] * 6}, "evidence"),
    ],
)
def test_validate_report_rejects_invalid(change: dict[str, object], field: str) -> None:
    """Validate report rejects invalid."""
    assert field in validate_report(report(**change))


def test_validate_report_allows_blank_amount() -> None:
    """Validate report allows blank amount."""
    assert validate_report(report(incident__amount="")) == {}


def test_service_fields_uses_observed_fields() -> None:
    """Service fields uses observed fields."""
    service = {"fields": [{"id": "a", "label": "A", "type": "text"}]}
    assert service_fields(service, None) == service["fields"]


def test_service_fields_falls_back_to_mock_fields() -> None:
    """Service fields falls back to mock fields."""
    assert service_fields({"fields": []}, None) == MOCK_FIELDS


def test_service_fields_variants() -> None:
    """Service fields variants."""
    service = {"variants": [{"id": "v1", "fields": [{"id": "x"}]}]}
    assert service_fields(service, "v1") == [{"id": "x"}]
    assert service_fields(service, "missing") is None


def field(kind: str, **extra: object) -> dict[str, object]:
    """Build a required field definition of the given type."""
    return {"id": "f", "label": "Field", "type": kind, "required": True, **extra}


def run(f: dict[str, object], value: str | None, demo: bool = True, consent: bool = True) -> dict[str, str]:
    """Validate one field value and return only the error map."""
    values = {} if value is None else {"f": value}
    return validate_submission_values([f], values, demo, consent)[0]


def test_submission_values_success_and_trimmed() -> None:
    """Submission values success and trimmed."""
    errors, clean = validate_submission_values([field("text")], {"f": "  hi  "}, True, True)
    assert errors == {} and clean == {"f": "hi"}


@pytest.mark.parametrize(
    ("kind", "value", "extra"),
    [
        ("text", "", {}),
        ("text", "x" * 3001, {}),
        ("number", "12a", {}),
        ("text", "REAL-1", {"syntheticId": True}),
        ("checkbox", "no", {}),
        ("email", "a@real.com", {}),
        ("select", "Z", {"options": ["A", "B"]}),
        ("file", "not json", {}),
        ("file", '{"name":"a.exe","size":1,"type":"application/x-msdownload"}', {}),
        ("file", '{"name":"a.txt","size":1,"type":"text/plain","extra":1}', {}),
    ],
)
def test_submission_values_rejects_invalid(kind: str, value: str, extra: dict[str, object]) -> None:
    """Submission values rejects invalid."""
    assert "f" in run(field(kind, **extra), value)


@pytest.mark.parametrize(
    ("kind", "value", "extra"),
    [
        ("number", "123", {}),
        ("text", "DEMO-1", {"syntheticId": True}),
        ("checkbox", "yes", {}),
        ("email", "a@example.test", {}),
        ("select", "A", {"options": ["A"]}),
        ("file", '{"name":"a.txt","size":1,"type":"text/plain"}', {}),
    ],
)
def test_submission_values_accepts_valid(kind: str, value: str, extra: dict[str, object]) -> None:
    """Submission values accepts valid."""
    assert run(field(kind, **extra), value) == {}


def test_submission_values_missing_required() -> None:
    """Submission values missing required."""
    assert "f" in run(field("text"), None)


def test_submission_values_missing_optional_is_ok() -> None:
    """Submission values missing optional is ok."""
    assert run(field("text", required=False), None) == {}


def test_submission_values_requires_confirmations() -> None:
    """Submission values requires confirmations."""
    errors = run(field("text"), "ok", demo=False, consent=False)
    assert {"demoOnly", "consent"} <= set(errors)


def test_submission_values_disabled_field_uses_fixed_value() -> None:
    """Submission values disabled field uses fixed value."""
    errors, clean = validate_submission_values([field("text", disabled=True, value="Fixed")], {}, True, True)
    assert errors == {} and clean == {"f": "Fixed"}
