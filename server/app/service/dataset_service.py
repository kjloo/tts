import json
import os
from typing import ClassVar

from app.module.logging_module import logger


class DatasetService:
    """Singleton dataset service using class-level state."""

    JSONL_PATH: ClassVar[str] = "/Users/kaleb/Documents/Code/tts/my_dataset/train.jsonl"

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
    def _get_available_labels_for_name(cls, jsonl_path: str, name: str) -> list[str]:
        labels = set()
        if os.path.exists(jsonl_path):
            with open(jsonl_path, "r") as f:
                for line in f:
                    entry = json.loads(line)
                    if entry.get("name") == name and "label" in entry:
                        labels.add(entry["label"])
        return sorted(labels)
