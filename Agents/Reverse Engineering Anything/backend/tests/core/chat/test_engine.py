"""Tests for core/chat/assistant.py (retrieval and the emergency answer) and core/chat/intents.py."""

import pytest

from ecrime_demo.core.chat.assistant import ChatbotEngine
from ecrime_demo.core.chat.intents import is_emergency
from ecrime_demo.models.chat_schemas import AccessLevel, AnswerSource, ChatRequest
from ecrime_demo.settings import MAX_MESSAGE_LENGTH


@pytest.mark.parametrize(
    "message",
    ["there is a fire", "call 999", "someone attacked me", "i am in danger", "my phone caught fire", "EMERGENCY"],
)
def test_is_emergency_recognises_emergency_wording(message: str) -> None:
    """Is emergency recognises emergency wording."""
    assert is_emergency(message) is True


@pytest.mark.parametrize(
    "message", ["", "hello", "I need an urgent police clearance certificate", "fees for document verification"]
)
def test_is_emergency_ignores_ordinary_messages(message: str) -> None:
    """Is emergency ignores ordinary messages."""
    assert is_emergency(message) is False


def test_engine_emergency_gives_999_and_says_site_cannot_help(engine: ChatbotEngine) -> None:
    """Engine emergency gives 999 and says site cannot help."""
    result = engine.emergency()
    assert "999" in result.reply and "cannot send help" in result.reply
    assert result.source is AnswerSource.SAFETY and result.services == []


def test_engine_has_no_canned_answers_or_suggestions(engine: ChatbotEngine) -> None:
    """Engine has no canned answers or suggestions."""
    assert not hasattr(engine, "reply")
    assert "suggestions" not in engine.emergency().model_dump()
    assert "intent" not in engine.emergency().model_dump()


def test_retrieve_finds_the_named_service_with_facts(engine: ChatbotEngine) -> None:
    """Retrieve finds the named service with facts."""
    facts, refs = engine.retrieve("fees for document verification")
    assert refs[0].name == "Document Verification" and refs[0].access is AccessLevel.GUEST_AVAILABLE
    assert facts[0]["name"] == "Document Verification" and facts[0]["fees"] == "free of charge"
    assert facts[0]["processing_time"] == "Instant"


def test_retrieve_plain_language(engine: ChatbotEngine) -> None:
    """Retrieve plain language."""
    assert engine.retrieve("I lost my wallet")[1][0].name == "Report Lost Item"


def test_retrieve_returns_nothing_when_no_service_matches(engine: ChatbotEngine) -> None:
    """Retrieve returns nothing when no service matches."""
    assert engine.retrieve("xyzzy plugh") == ([], [])


def test_retrieve_marks_unverified_access_as_unknown(engine: ChatbotEngine) -> None:
    """Retrieve marks unverified access as unknown."""
    facts, refs = engine.retrieve("night work permit")
    assert refs[0].access is AccessLevel.UNKNOWN and "unknown" in facts[0]["access"]
    assert "fees" not in facts[0]


def test_retrieve_exact_name_beats_similar_service(engine: ChatbotEngine) -> None:
    """Retrieve exact name beats similar service."""
    _, refs = engine.retrieve("bounce cheque report for banks")
    assert refs[0].name == "Bounce Cheque Report for Banks"


def test_retrieve_two_named_services_returns_both(engine: ChatbotEngine) -> None:
    """Retrieve two named services returns both."""
    _, refs = engine.retrieve("police clearance certificate or traffic clearance certificate")
    assert {r.name for r in refs} == {"Police Clearance Certificate", "Traffic Clearance Certificate"}


def test_retrieve_official_url_only_for_official_domain(engine: ChatbotEngine) -> None:
    """Retrieve official url only for official domain."""
    url = engine.retrieve("night work permit")[1][0].officialUrl
    assert url is not None and url.startswith("https://www.dubaipolice.gov.ae/")


def test_narrow_keeps_only_services_named_in_full(engine: ChatbotEngine) -> None:
    """Narrow keeps only services named in full."""
    from ecrime_demo.core.chat.matching import ServiceMatch

    full_a, full_b, partial = (
        ServiceMatch({}, {}, 5.0, True),
        ServiceMatch({}, {}, 4.0, True),
        ServiceMatch({}, {}, 3.0),
    )
    assert engine._narrow([full_a, partial, full_b]) == [full_a, full_b]
    assert engine._narrow([full_a, partial]) == [full_a, partial]


def test_facts_block_lists_categories_and_sign_in_coverage(engine: ChatbotEngine) -> None:
    """Facts block lists categories and sign in coverage."""
    block = engine.facts_block([])
    assert "Traffic Services" in block and "were not verified" in block and "call_centre" in block


@pytest.mark.parametrize("bad", ["", "   ", "x" * (MAX_MESSAGE_LENGTH + 1)])
def test_request_rejects_empty_and_oversized(bad: str) -> None:
    """Request rejects empty and oversized."""
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        ChatRequest(message=bad)


def test_request_strips_whitespace_and_rejects_extra() -> None:
    """Request strips whitespace and rejects extra."""
    from pydantic import ValidationError

    assert ChatRequest(message="  hi  ").message == "hi"
    with pytest.raises(ValidationError):
        ChatRequest(message="hi", extra=1)  # type: ignore[call-arg]
