import os
import json
import threading
from pathlib import Path

import numpy as np
import soundfile as sf

CLONE_MODEL_ID = "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-8bit"
DESIGN_MODEL_ID = "mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-bf16"

JSONL_PATH = "my_dataset/train.jsonl"

LANGUAGES = [
    "English",
    "Chinese",
    "Japanese",
    "Korean",
    "German",
    "French",
    "Spanish",
    "Italian",
]

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
        formatted_name = f"{name}_{stem}_{counter:02d}{suffix}"
        new_path = directory / formatted_name
        try:
            # Atomically reserve the path so concurrent callers cannot pick the
            # same filename and overwrite each other's output.
            fd = os.open(str(new_path), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.close(fd)
            return new_path
        except FileExistsError:
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

_MODEL_CACHE = {}
_MODEL_LOCK = threading.Lock()

def setup_tts_model(model_id):
    from mlx_audio.tts.utils import load_model

    # Cache models per-process so the persistent server does not reload
    # the multi-GB model on every request.
    with _MODEL_LOCK:
        model = _MODEL_CACHE.get(model_id)
        if model is None:
            print(f"DEBUG: Loading {model_id}...")
            model = load_model(model_id, fix_mistral_regex=True)
            _MODEL_CACHE[model_id] = model
        return model

def save_audio(model, results, mode, name, lang, out):
    out_param = out if (out and out.strip()) else None
    out_path = get_unique_path("output", mode, name, lang, out_param, suffix=".mp3")

    audio_data = np.array(results[0].audio)
    sr = getattr(model, "sample_rate", 24000)

    # soundfile natively compresses the raw data arrays to MP3 on modern systems
    sf.write(str(out_path), audio_data, sr, format='MP3')
    return out_path

def generate_clone(text, lang, name, ref, out=None, jsonl_path=JSONL_PATH):
    """Clones the reference voice and returns the path of the saved MP3."""
    ref_entry = load_reference_from_jsonl(jsonl_path, name, ref)
    audio_path = os.path.join("my_dataset", ref_entry["audio"])

    model = setup_tts_model(CLONE_MODEL_ID)
    results = list(model.generate(
        text=text,
        ref_audio=audio_path,
        ref_text=ref_entry["text"],
        language=lang
    ))
    if not results:
        raise RuntimeError("Generation yielded no results.")

    return save_audio(model, results, "clone", name, lang, out)
