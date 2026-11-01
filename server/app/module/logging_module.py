"""Logging module for the Qwen3-TTS API.

When this module is imported, `setup_logging()` is called automatically
to configure a common logger for the entire service. The resulting
logger is exposed as the module-level `logger` for direct import:

    from app.module.logging_module import logger

Use `setup_logging()` again to reconfigure if needed.
"""

import logging
from pathlib import Path

LOG_DIR = "logs"
LOG_FILE = Path(LOG_DIR) / "app.log"

# ---------------------------------------------------------------------------
# Automatic setup on import – ensures a common logger is always available
# ---------------------------------------------------------------------------

# Configure a basic file handler the first time the module is loaded.
# This avoids "no handler" warnings and gives every importer a working
# logger without having to remember to call setup_logging().
_log_file = LOG_FILE
_log_file.parent.mkdir(parents=True, exist_ok=True)

_default_formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
_file_handler = logging.FileHandler(_log_file)
_file_handler.setLevel(logging.INFO)
_file_handler.setFormatter(_default_formatter)

_logger = logging.getLogger("tts_api")
_logger.setLevel(logging.INFO)
# Only add the handler if none are present (prevents duplicates on hot-reload)
if not _logger.handlers:
    _logger.addHandler(_file_handler)
_logger.propagate = False  # avoid double-logging via root logger


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

logger = _logger  # module-level logger for direct import


def setup_logging(
    log_dir: str = "logs",
    level: int = logging.INFO,
    format_str: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
) -> logging.Logger:
    """Re‑configure the module‑level logger.

    Call this explicitly if you need a different log directory, level,
    or format after the module has already been imported.
    """
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)

    # Remove any existing handlers so we start fresh
    for h in logger.handlers[:]:
        logger.removeHandler(h)
        h.close()

    handler = logging.FileHandler(log_path / "app.log")
    handler.setLevel(level)
    formatter = logging.Formatter(format_str)
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(level)

    return logger
