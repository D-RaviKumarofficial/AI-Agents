"""Recognise emergency wording. Those messages always get the fixed 999 answer instead of the model."""

import re

_EMERGENCY = re.compile(
    r"\b(999|sos|emergenc\w*|danger\w*|fire|attacked|assault(ed)?|kidnap\w*|injured|bleeding|in trouble)\b",
    re.IGNORECASE,
)


def is_emergency(message: str) -> bool:
    """True if the message contains emergency wording."""
    return _EMERGENCY.search(message) is not None
