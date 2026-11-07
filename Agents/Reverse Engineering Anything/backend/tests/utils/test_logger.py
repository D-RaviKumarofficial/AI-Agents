"""Tests for utils/logger.py."""

import json
import logging
import sys

from ecrime_demo.utils.logger import JsonFormatter, logger


def test_json_formatter_includes_required_fields() -> None:
    """Json formatter includes required fields."""
    record = logging.LogRecord("n", logging.INFO, "file.py", 1, "hello", None, None)
    record.trace_id = "t1"
    payload = json.loads(JsonFormatter().format(record))
    assert payload["message"] == "hello" and payload["trace_id"] == "t1" and payload["level"] == "INFO"


def test_json_formatter_includes_exception() -> None:
    """Json formatter includes exception."""
    try:
        raise ValueError("boom")
    except ValueError:
        record = logging.LogRecord("n", logging.ERROR, "f.py", 1, "failed", None, sys.exc_info())
    assert "ValueError" in json.loads(JsonFormatter().format(record))["exception"]


def test_json_formatter_trace_id_defaults_to_none() -> None:
    """Json formatter trace id defaults to none."""
    record = logging.LogRecord("n", logging.INFO, "f.py", 1, "m", None, None)
    assert json.loads(JsonFormatter().format(record))["trace_id"] is None


def test_logger_registers_json_handler_once() -> None:
    """Logger registers json handler once."""
    from ecrime_demo.utils.logger import _build_logger

    before = [h for h in logger.handlers if isinstance(h.formatter, JsonFormatter)]
    _build_logger()
    after = [h for h in logger.handlers if isinstance(h.formatter, JsonFormatter)]
    assert len(before) == 1 and len(after) == 1 and logger.propagate is False
