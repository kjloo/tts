import os
import json
from pathlib import Path
from mlx_audio.tts.utils import load_model

def get_unique_path(directory, mode="clone", name=None, lang=None, base_filename=None, suffix=".mp3"):
    directory = Path(directory)
    directory.mkdir(exist_ok=True)
    
    if not base_filename or base_filename.strip() in ["", "output.wav", "output.mp3"]:
        speaker = name if (mode == "clone" and name) else "Design"
        language = lang if lang else "Auto"
        stem = f"{speaker}_{language}"
    else:
        stem = Path(base_filename).stem
    
    counter = 1
    while True:
        formatted_name = f"{stem}_{counter:02d}{suffix}"
        new_path = directory / formatted_name
        if not new_path.exists():
            return new_path
        counter += 1

def get_available_names(jsonl_path):
    """Returns a sorted list of all unique names in the dataset."""
    names = set()
    if os.path.exists(jsonl_path):
        with open(jsonl_path, 'r') as f:
            for line in f:
                entry = json.loads(line)
                if 'name' in entry: names.add(entry['name'])
    return sorted(list(names))

def get_available_labels_for_name(jsonl_path, name):
    """Returns labels specifically associated with the chosen name."""
    labels = set()
    if os.path.exists(jsonl_path):
        with open(jsonl_path, 'r') as f:
            for line in f:
                entry = json.loads(line)
                if entry.get('name') == name and 'label' in entry:
                    labels.add(entry['label'])
    return sorted(list(labels))

def load_reference_from_jsonl(jsonl_path, name, label):
    with open(jsonl_path, 'r') as f:
        for line in f:
            entry = json.loads(line)
            if entry.get("name") == name and entry.get("label") == label:
                return entry
    raise ValueError(f"❌ No match found for Name: '{name}' with Label: '{label}'")

def setup_tts_model(model_id):
    print(f"DEBUG: Loading {model_id}...")
    return load_model(model_id, fix_mistral_regex=True)
