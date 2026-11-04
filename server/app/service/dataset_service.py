import json
import os
from pathlib import Path
from typing import ClassVar

from app.module.logging_module import logger


class DatasetService:
    """Singleton dataset service using class-level state."""

    JSONL_PATH: ClassVar[str] = str(
        Path(__file__).resolve().parents[3] / "my_dataset" / "train.jsonl"
    )

    @classmethod
    def get_character_names(cls) -> list[str]:
        return cls._get_available_names(cls.JSONL_PATH)

    @classmethod
    def _get_available_names(cls, jsonl_path: str) -> list[str]:
        names = set()
        if os.path.exists(jsonl_path):
            with open(jsonl_path, "r") as f:
                for line in f:
                    entry = json.loads(line)
                    if "name" in entry:
                        names.add(entry["name"])
        logger.info("Loaded %d character names from %s", len(names), jsonl_path)
        return sorted(names)

    @classmethod
    def get_available_labels_for_name(cls, name: str) -> list[str]:
        return cls._get_available_labels_for_name(cls.JSONL_PATH, name)

    @classmethod
    def _get_available_labels_for_name(cls, jsonl_path: str, name: str) -> list[str]:
        labels = set()
        if os.path.exists(jsonl_path):
            with open(jsonl_path, "r") as f:
                for line in f:
                    entry = json.loads(line)
                    if entry.get("name") == name and "label" in entry:
                        labels.add(entry["label"])
        return sorted(labels)

    @classmethod
    def get_reference(cls, name: str, label: str) -> dict:
        """Returns the dataset entry for a speaker name and label."""
        if os.path.exists(cls.JSONL_PATH):
            with open(cls.JSONL_PATH, "r") as f:
                for line in f:
                    entry = json.loads(line)
                    if entry.get("name") == name and entry.get("label") == label:
                        return entry
        raise ValueError(f"No reference found for name '{name}' and label '{label}'")

    @classmethod
    def get_reference_audio_path(cls, name: str, label: str) -> Path:
        """Returns the absolute path to a speaker's reference audio file."""
        entry = cls.get_reference(name, label)
        return Path(cls.JSONL_PATH).parent / entry["audio"]
