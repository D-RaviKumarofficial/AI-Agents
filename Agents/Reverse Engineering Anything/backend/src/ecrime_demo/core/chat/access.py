"""Load the observed sign-in requirements."""

from functools import lru_cache
from pathlib import Path

from ecrime_demo.models.chat_schemas import AccessData
from ecrime_demo.settings import ACCESS_PATH


@lru_cache
def load_access(path: Path = ACCESS_PATH) -> AccessData:
    """Read and cache the access data file. Raises FileNotFoundError if it is missing."""
    return AccessData.model_validate_json(path.read_text(encoding="utf-8"))
