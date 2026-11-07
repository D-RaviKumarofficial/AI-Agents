"""Tokenising helpers shared by the matcher and the intent detector."""

import re

STOPWORDS = frozenset(
    {
        # grammar
        "a", "an", "the", "of", "to", "for", "in", "on", "at", "by", "with", "from", "and", "or", "is", "are", "am",
        "be", "i", "me", "my", "we", "you", "your", "it", "its", "this", "that", "do", "does", "did", "can", "could",
        "would", "should", "will", "how", "what", "which", "who", "where", "when", "why", "any", "some", "there",
        "have", "has", "about", "like", "all",
        # request filler
        "please", "tell", "show", "give", "want", "need", "get", "know", "find", "looking", "available", "list", "help",
        # words that describe the question, not the service
        "service", "dubai", "police", "uae", "pass", "uaepass", "sign", "login", "log", "guest", "fee", "cost", "price",
        "charge", "duration", "long", "much", "apply", "start", "require", "contact", "phone", "call", "email", "mail",
        "address", "hotline",
    }
)  # fmt: skip
_WORD = re.compile(r"[a-z0-9]+")
MIN_TOKEN_LENGTH = 2


def stem(token: str) -> str:
    """Reduce a lowercase word to a rough stem by removing plural and -ing endings."""
    if len(token) > 4 and token.endswith("ies"):
        return token[:-3] + "y"
    if len(token) > 5 and token.endswith("ing"):
        return token[:-3]
    if len(token) > 3 and token.endswith("s") and not token.endswith("ss"):
        return token[:-1]
    return token


def tokenize(text: str) -> list[str]:
    """Return stemmed tokens without stopwords or one-character words, in order."""
    tokens: list[str] = []
    for word in _WORD.findall(text.lower()):
        root = stem(word)
        if len(root) < MIN_TOKEN_LENGTH or word in STOPWORDS or root in STOPWORDS:
            continue
        tokens.append(root)
    return tokens


def normalize(text: str) -> str:
    """Lowercase text and collapse everything except letters and digits into single spaces."""
    return " ".join(_WORD.findall(text.lower()))


def shorten(text: str, limit: int) -> str:
    """Cut text to at most limit characters at a word boundary, adding an ellipsis when cut."""
    if len(text) <= limit:
        return text
    window = text[: limit - 1]
    if text[limit - 1] != " ":
        window = window.rsplit(" ", 1)[0]
    return f"{window.rstrip(' ,;:.')}…"
