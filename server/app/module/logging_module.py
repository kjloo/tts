"""Logging module for the Qwen3-TTS API."""

import logging
from pathlib import Path

# Expose the module-level logger for direct import
logger = logging.getLogger("tts_api")


def setup_logging(
    log_dir: str = "logs",
    level: int = logging.INFO,
    format_str: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
) -> logging.Logger:
    """Configure and return a logger instance."""
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)

    logger = logging.getLogger("tts_api")
    logger.setLevel(level)

    # Avoid duplicate handlers
    if logger.handlers:
        return logger

    handler = logging.FileHandler(log_path / "app.log")
    handler.setLevel(level)
    formatter = logging.Formatter(format_str)
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger


# Removed get_logger function; use module-level logger directly
