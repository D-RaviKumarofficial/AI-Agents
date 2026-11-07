"""Tests for core/matching.py."""

from typing import Any

import pytest

from ecrime_demo.core.chat.matching import ServiceMatcher


@pytest.fixture(scope="module")
def matcher(catalog: dict[str, Any]) -> ServiceMatcher:
    """A matcher over the real catalog."""
    return ServiceMatcher(catalog)


def names(matches: list) -> list[str]:
    """Return the service names of the matches."""
    return [m.service["name"] for m in matches]


def test_search_exact_name_ranks_first(matcher: ServiceMatcher) -> None:
    """Search exact name ranks first."""
    result = matcher.search("night work permit")
    assert names(result)[0] == "Night Work Permit" and result[0].exact


def test_search_plain_language(matcher: ServiceMatcher) -> None:
    """Search plain language."""
    assert names(matcher.search("I lost my wallet"))[0] == "Report Lost Item"


def test_search_respects_limit(matcher: ServiceMatcher) -> None:
    """Search respects limit."""
    assert len(matcher.search("certificate", limit=2)) <= 2


def test_search_returns_best_first(matcher: ServiceMatcher) -> None:
    """Search returns best first."""
    scores = [m.score for m in matcher.search("certificate")]
    assert scores == sorted(scores, reverse=True)


@pytest.mark.parametrize("query", ["", "xyzzy plugh", "the of and", "???"])
def test_search_no_confident_match(matcher: ServiceMatcher, query: str) -> None:
    """Search no confident match."""
    assert matcher.search(query) == []


def test_search_ignores_fee_and_uae_pass_words(matcher: ServiceMatcher) -> None:
    """Search ignores fee and uae pass words."""
    assert matcher.search("uae pass fee") == []


def test_find_known_service(matcher: ServiceMatcher) -> None:
    """Find known service."""
    found = matcher.find("document-verification")
    assert found is not None and found.group["id"] == "inquiries-and-follow-up"


def test_find_unknown_service(matcher: ServiceMatcher) -> None:
    """Find unknown service."""
    assert matcher.find("nope") is None
