import json
import os


def get_character_names() -> list[str]:
    jsonl_path = "/Users/kaleb/Documents/Code/tts/my_dataset/train.jsonl"
    return _get_available_names(jsonl_path)


def _get_available_names(jsonl_path: str) -> list[str]:
    """Returns a sorted list of all unique names in the dataset."""
    names = set()
    if os.path.exists(jsonl_path):
        with open(jsonl_path, "r") as f:
            for line in f:
                entry = json.loads(line)
                if "name" in entry:
                    names.add(entry["name"])
    return sorted(names)


def _get_available_labels_for_name(jsonl_path: str, name: str) -> list[str]:
    """Returns labels specifically associated with the chosen name."""
    labels = set()
    if os.path.exists(jsonl_path):
        with open(jsonl_path, "r") as f:
            for line in f:
                entry = json.loads(line)
                if entry.get("name") == name and "label" in entry:
                    labels.add(entry["label"])
    return sorted(labels)
