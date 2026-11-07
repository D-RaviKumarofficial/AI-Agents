"""Read-only access to the captured service catalog."""

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from ecrime_demo.settings import CATALOG_PATH


@lru_cache
def _load_catalog(path: Path) -> dict[str, Any]:
    """Read and cache the catalog JSON file."""
    return json.loads(path.read_text(encoding="utf-8"))


class CatalogRepository:
    """Serves the static catalog captured on 2026-11-04."""

    def __init__(self, path: Path = CATALOG_PATH) -> None:
        """Store the path of the catalog file."""
        self._path = path

    def get_catalog(self) -> dict[str, Any]:
        """Return the full catalog."""
        return _load_catalog(self._path)

    def find_service(self, service_id: str) -> dict[str, Any] | None:
        """Return a service by id, or None."""
        services = (s for g in self.get_catalog()["groups"] for s in g["services"])
        return next((s for s in services if s["id"] == service_id), None)
