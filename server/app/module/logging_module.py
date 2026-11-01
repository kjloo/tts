"""Logging module for the Qwen3-TTS API.

On import, `configure_logger()` runs once and exposes the configured
`logger` for direct import:

    from app.module.logging_module import logger

Call `configure_logger()` again to reconfigure.
"""

import logging
from pathlib import Path


def configure_logger(
    log_dir: str = "logs",
    level: int = logging.INFO,
    format_str: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
) -> logging.Logger:
    """Configure and return the shared logger."""
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger("tts_api")
    logger.setLevel(level)
    logger.propagate = False

    # Remove existing handlers
    for h in logger.handlers[:]:
        logger.removeHandler(h)
        h.close()

    handler = logging.FileHandler(log_path / "app.log")
    handler.setLevel(level)
    handler.setFormatter(logging.Formatter(format_str))
    logger.addHandler(handler)

    return logger


# Configure once on import
logger = configure_logger()
