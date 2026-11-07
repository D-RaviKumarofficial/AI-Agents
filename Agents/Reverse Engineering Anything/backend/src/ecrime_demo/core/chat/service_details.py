"""Read facts about a service out of the captured catalog entry."""

import re
from typing import Any

from ecrime_demo.core.chat.text import shorten
from ecrime_demo.settings import MAX_DESCRIPTION_LENGTH

_FEES_AND_DURATION = re.compile(r"Fees\s+(?P<fees>.+?)\s+Duration\s+(?P<duration>[^\n]+)")


def parse_fees_duration(snapshot: str | None) -> tuple[str, str] | None:
    """Return (fees, duration) from a captured information panel, or None if it has neither."""
    if not snapshot:
        return None
    found = _FEES_AND_DURATION.search(snapshot)
    if found is None:
        return None
    return found.group("fees").strip(), found.group("duration").strip()


def summarize_description(service: dict[str, Any]) -> str:
    """Return the first line of the service description, shortened for chat."""
    description = (service.get("description") or "").strip()
    first_line = description.split("\n", 1)[0].strip()
    return shorten(first_line, MAX_DESCRIPTION_LENGTH)
