"""Tests for core/text.py."""

import pytest

from ecrime_demo.core.chat.text import normalize, shorten, stem, tokenize


@pytest.mark.parametrize(
    ("word", "expected"),
    [("services", "service"), ("policies", "policy"), ("reporting", "report"), ("class", "class"), ("is", "is")],
)
def test_stem_reduces_endings(word: str, expected: str) -> None:
    """Stem reduces endings."""
    assert stem(word) == expected


def test_tokenize_drops_stopwords_and_stems() -> None:
    """Tokenize drops stopwords and stems."""
    assert tokenize("How do I pay the traffic fines?") == ["pay", "traffic", "fine"]


def test_tokenize_empty_and_symbols() -> None:
    """Tokenize empty and symbols."""
    assert tokenize("") == [] and tokenize("?!  ...") == []


def test_tokenize_ignores_question_words() -> None:
    """Tokenize ignores question words."""
    assert "uae" not in tokenize("does it need uae pass") and "need" not in tokenize("does it need uae pass")


def test_normalize_collapses_punctuation() -> None:
    """Normalize collapses punctuation."""
    assert normalize("  Fast-Track!!  Now ") == "fast track now"


def test_normalize_empty() -> None:
    """Normalize empty."""
    assert normalize("") == ""


def test_shorten_keeps_short_text() -> None:
    """Shorten keeps short text."""
    assert shorten("short text", 50) == "short text"


def test_shorten_cuts_at_word_boundary() -> None:
    """Shorten cuts at word boundary."""
    result = shorten("one two three four five", 14)
    assert result == "one two three…" and len(result) <= 14
