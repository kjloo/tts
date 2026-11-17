import json
import os
from pathlib import Path
from typing import ClassVar

from app.module.logging_module import logger


class DatasetService:
    """Singleton dataset service using class-level state.

    Parsed entries are cached in-process and invalidated whenever the
    underlying ``train.jsonl`` file changes (detected via mtime). This keeps
    the ``/api/dataset/characters`` endpoint O(1) per request instead of
    re-reading the whole JSONL once per speaker, and avoids writing to the log
    file on every request (which would otherwise trip uvicorn's reloader).
    """

    JSONL_PATH: ClassVar[str] = str(
        Path(__file__).resolve().parents[3] / "my_dataset" / "train.jsonl"
    )

    _cache_mtime: ClassVar[float | None] = None
    _cache_entries: ClassVar[list[dict]] = []

    @classmethod
    def _load_entries(cls, jsonl_path: str) -> list[dict]:
        """Return parsed JSONL entries, re-reading only when the file changed."""
        if not os.path.exists(jsonl_path):
            cls._cache_mtime = None
            cls._cache_entries = []
            return cls._cache_entries

        mtime = os.path.getmtime(jsonl_path)
        if cls._cache_mtime != mtime:
            entries = []
            with open(jsonl_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        entries.append(json.loads(line))
            cls._cache_entries = entries
            cls._cache_mtime = mtime
            logger.debug("Loaded %d dataset entries from %s", len(entries), jsonl_path)
        return cls._cache_entries

    @classmethod
    def get_character_names(cls) -> list[str]:
        entries = cls._load_entries(cls.JSONL_PATH)
        return sorted({e["name"] for e in entries if "name" in e})

    @classmethod
    def get_available_labels_for_name(cls, name: str) -> list[str]:
        entries = cls._load_entries(cls.JSONL_PATH)
        return sorted(
            {e["label"] for e in entries if e.get("name") == name and "label" in e}
        )

    @classmethod
    def get_reference(cls, name: str, label: str) -> dict:
        """Returns the dataset entry for a speaker name and label."""
        entries = cls._load_entries(cls.JSONL_PATH)
        for entry in entries:
            if entry.get("name") == name and entry.get("label") == label:
                return entry
        raise ValueError(f"No reference found for name '{name}' and label '{label}'")

    @classmethod
    def get_reference_audio_path(cls, name: str, label: str) -> Path:
        """Returns the absolute path to a speaker's reference audio file."""
        entry = cls.get_reference(name, label)
        return Path(cls.JSONL_PATH).parent / entry["audio"]

    @classmethod
    def _get_available_names(cls, jsonl_path: str) -> list[str]:
        """Backwards-compatible helper (see ``get_character_names``)."""
        entries = cls._load_entries(jsonl_path)
        return sorted({e["name"] for e in entries if "name" in e})

    @classmethod
    def _get_available_labels_for_name(cls, jsonl_path: str, name: str) -> list[str]:
        """Backwards-compatible helper (see ``get_available_labels_for_name``)."""
        entries = cls._load_entries(jsonl_path)
        return sorted(
            {e["label"] for e in entries if e.get("name") == name and "label" in e}
        )
