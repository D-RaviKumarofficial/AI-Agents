"""Rank catalog services against a user's message."""

from dataclasses import dataclass
from typing import Any

from ecrime_demo.core.chat.text import normalize, tokenize
from ecrime_demo.settings import (
    DESCRIPTION_WEIGHT,
    GROUP_WEIGHT,
    MAX_SERVICE_RESULTS,
    MIN_MATCH_SCORE,
    NAME_WEIGHT,
    PHRASE_BONUS,
    RELATIVE_CUTOFF,
    WEAK_NAME_WEIGHT,
    WEAK_NAME_WORDS,
)


@dataclass(frozen=True, slots=True)
class ServiceMatch:
    """A service that matched a query, with its group and score."""

    service: dict[str, Any]
    group: dict[str, Any]
    score: float
    exact: bool = False


@dataclass(frozen=True, slots=True)
class _Entry:
    service: dict[str, Any]
    group: dict[str, Any]
    name_phrase: str
    name_tokens: frozenset[str]
    name_words: frozenset[str]
    group_tokens: frozenset[str]
    description_tokens: frozenset[str]


class ServiceMatcher:
    """Scores services by shared words in their name, group and description."""

    def __init__(self, catalog: dict[str, Any]) -> None:
        """Index every service in the catalog."""
        self._entries = [
            _Entry(
                service=service,
                group=group,
                name_phrase=normalize(service["name"]),
                name_tokens=frozenset(tokenize(service["name"])),
                name_words=frozenset(normalize(service["name"]).split()),
                group_tokens=frozenset(tokenize(group["name"])),
                description_tokens=frozenset(tokenize(service.get("description", ""))),
            )
            for group in catalog["groups"]
            for service in group["services"]
        ]

    def search(self, query: str, limit: int = MAX_SERVICE_RESULTS) -> list[ServiceMatch]:
        """Return up to limit services that match, best first. An empty list means no confident match."""
        tokens = set(tokenize(query))
        padded_query = f" {normalize(query)} "
        weak_words = set(padded_query.split()) & WEAK_NAME_WORDS
        scored: list[ServiceMatch] = []
        for entry in self._entries:
            score = sum(
                NAME_WEIGHT * (token in entry.name_tokens)
                + GROUP_WEIGHT * (token in entry.group_tokens)
                + DESCRIPTION_WEIGHT * (token in entry.description_tokens)
                for token in tokens
            )
            score += WEAK_NAME_WEIGHT * len(weak_words & entry.name_words)
            exact = bool(entry.name_phrase) and f" {entry.name_phrase} " in padded_query
            if exact:
                score += PHRASE_BONUS
            if score >= MIN_MATCH_SCORE:
                scored.append(ServiceMatch(entry.service, entry.group, score, exact))
        scored.sort(key=lambda match: (-match.score, match.service["name"]))
        if not scored:
            return []
        cutoff = scored[0].score * RELATIVE_CUTOFF
        return [match for match in scored if match.score >= cutoff][:limit]

    def find(self, service_id: str) -> ServiceMatch | None:
        """Return the service with the given id, or None."""
        for entry in self._entries:
            if entry.service["id"] == service_id:
                return ServiceMatch(entry.service, entry.group, 0.0)
        return None
