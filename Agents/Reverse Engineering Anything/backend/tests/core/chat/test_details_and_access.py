"""Tests for core/service_details.py and core/access.py."""

from pathlib import Path

import pytest

from ecrime_demo.core.chat.access import load_access
from ecrime_demo.core.chat.service_details import parse_fees_duration, summarize_description
from ecrime_demo.models.chat_schemas import AccessLevel


def test_parse_fees_duration_success() -> None:
    """Parse fees duration success."""
    snapshot = "- heading\n    - text: Fees Free of Charge Duration Instant\n    - paragraph: x"
    assert parse_fees_duration(snapshot) == ("Free of Charge", "Instant")


@pytest.mark.parametrize("snapshot", [None, "", "no fees here"])
def test_parse_fees_duration_missing(snapshot: str | None) -> None:
    """Parse fees duration missing."""
    assert parse_fees_duration(snapshot) is None


def test_summarize_description_first_line_only() -> None:
    """Summarize description first line only."""
    assert summarize_description({"description": "First line.\n\u2022 bullet two"}) == "First line."


def test_summarize_description_shortens_long_text() -> None:
    """Summarize description shortens long text."""
    result = summarize_description({"description": "word " * 200})
    assert len(result) <= 240 and result.endswith("…")


def test_summarize_description_missing() -> None:
    """Summarize description missing."""
    assert summarize_description({}) == "" and summarize_description({"description": None}) == ""


def test_load_access_real_file_is_consistent(catalog: dict) -> None:
    """Load access real file is consistent."""
    access = load_access()
    ids = {s["id"] for g in catalog["groups"] for s in g["services"]}
    assert set(access.uaePassRequired) <= ids and set(access.guestAvailable) <= ids
    assert not set(access.uaePassRequired) & set(access.guestAvailable)


def test_load_access_missing_file(tmp_path: Path) -> None:
    """Load access missing file."""
    with pytest.raises(FileNotFoundError):
        load_access(tmp_path / "missing.json")


def test_access_level_lookup(access) -> None:  # noqa: ANN001
    """Access level lookup."""
    assert access.level("reporting-e-crime") is AccessLevel.UAE_PASS_REQUIRED
    assert access.level("document-verification") is AccessLevel.GUEST_AVAILABLE
    assert access.level("anything-else") is AccessLevel.UNKNOWN
