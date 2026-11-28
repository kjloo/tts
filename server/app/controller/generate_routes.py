from typing import Any

import numpy as np
import soundfile as sf
from fastapi import APIRouter, HTTPException, Request

from app.service.dataset_service import DatasetService
from app.utils import get_unique_path

generate_routes = APIRouter(prefix="/api/generate", tags=["generate"])

MODEL_IDS = {
    "clone": "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-8bit",
    "generate": "mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-bf16",
}

SAMPLING_KEYS = (
    "temperature",
    "top_k",
    "top_p",
    "repetition_penalty",
    "max_tokens",
)

MIN_AUDIO_DURATION = 2.0  # seconds — guard against clipped/under-generated output
MAX_AUDIO_DURATION = 60.0  # seconds — cap to prevent unbounded memory use


def _get_model(app: Any, mode: str):
    """Load and cache the model for a generation mode."""
    models = getattr(app.state, "tts_models", None)
    if models is None:
        models = {}
        app.state.tts_models = models

    if mode not in models:
        from mlx_audio.tts.utils import load_model

        models[mode] = load_model(MODEL_IDS[mode], fix_mistral_regex=True)

    return models[mode]


def _sampling_options(payload: dict) -> dict:
    """Collect optional Qwen sampling settings from the request payload."""
    options = {}
    for key in SAMPLING_KEYS:
        value = payload.get(key)
        if value is not None and value != "":
            options[key] = (
                int(value) if key in ("top_k", "max_tokens") else float(value)
            )
    return options


@generate_routes.post("/")
async def generate_speech(request: Request, payload: dict):
    """
    Generate MP3 from text using an MLX Qwen3-TTS model.

    Two modes are supported:

    - ``clone``: Clone a dataset voice using its reference audio and transcript.
    - ``generate``: Create a new voice from a natural-language description.

    Expected payload:
    {
        "mode": "clone" | "generate",
        "text": "Hello world",
        "lang": "English",
        "filename": "my_audio_file",
        "name": "SpeakerName",     // clone only
        "ref": "label",            // clone only
        "instruct": "A calm ...",  // generate only
        "temperature": 0.9,        // generate (optional)
        "top_k": 50,               // generate (optional)
        "top_p": 1.0,              // generate (optional)
        "repetition_penalty": 1.05, // generate (optional)
        "max_tokens": 2048,        // generate (optional)
        "min_audio_duration": 2.0  // optional, seconds (pads short outputs)
    }

    The filename is optional. When provided, it is indexed starting at _01
    (e.g. Fiora_hello_01.mp3) and prefixed with the speaker name in clone mode.
    """
    text = payload.get("text")
    lang = payload.get("lang")
    name = payload.get("name")
    ref = payload.get("ref")
    filename = payload.get("filename") or payload.get("out")
    instruct = payload.get("instruct")
    min_audio_duration = payload.get("min_audio_duration") or MIN_AUDIO_DURATION
    # Clamp to [MIN_AUDIO_DURATION, MAX_AUDIO_DURATION] to prevent unbounded padding
    min_audio_duration = max(
        MIN_AUDIO_DURATION, min(float(min_audio_duration), MAX_AUDIO_DURATION)
    )

    mode = payload.get("mode")
    if mode is None:
        # Backwards compatibility for older clients that sent name/ref only.
        mode = "clone" if name and ref else "generate"

    if mode not in MODEL_IDS:
        raise HTTPException(400, "Invalid mode: expected 'clone' or 'generate'")
    if not text or not lang:
        raise HTTPException(400, "Missing required fields: text, lang")
    if mode == "clone" and not all([name, ref]):
        raise HTTPException(400, "Clone mode requires: name, ref")
    if mode == "generate" and not instruct:
        raise HTTPException(400, "Generate mode requires: instruct")

    # Load the matching model on first use (lazy loading, cached per mode).
    model = _get_model(request.app, mode)

    sampling = _sampling_options(payload)
    ref_entry = None
    ref_audio_path = None

    if mode == "clone":
        try:
            ref_entry = DatasetService.get_reference(name, ref)
            ref_audio_path = DatasetService.get_reference_audio_path(name, ref)
        except (ValueError, KeyError) as e:
            raise HTTPException(400, str(e)) from e

    # Generate audio
    try:
        if mode == "clone":
            results = list(
                model.generate(
                    text=text,
                    ref_audio=str(ref_audio_path),
                    ref_text=ref_entry["text"],
                    lang_code=lang,
                    **sampling,
                )
            )
        else:
            results = list(
                model.generate_voice_design(
                    text=text,
                    language=lang,
                    instruct=instruct,
                    **sampling,
                )
            )
    except Exception as e:
        raise HTTPException(500, f"Generation failed: {e!s}") from e

    if not results:
        raise HTTPException(500, "No audio generated")

    # Post-process audio to guard against clipping / under-generation on short inputs
    audio_data = np.array(results[0].audio)
    sr = getattr(model, "sample_rate", 24000)
    if len(audio_data) / sr < min_audio_duration:
        # Pad with silence to meet minimum duration
        samples_to_add = int((min_audio_duration - len(audio_data) / sr) * sr)
        if samples_to_add > 0:
            silence = np.zeros(samples_to_add, dtype=audio_data.dtype)
            audio_data = np.concatenate([audio_data, silence])

    # Save as MP3. The filename is always indexed and prefixed by speaker name.
    file_speaker = name if mode == "clone" else (name or "Design")
    out_path = get_unique_path(
        "output",
        "clone" if mode == "clone" else "voice_design",
        file_speaker,
        lang,
        filename,
        suffix=".mp3",
    )

    sf.write(str(out_path), audio_data, sr, format="MP3")

    return {
        "filepath": f"/api/output/{out_path.name}",
        "filename": out_path.name,
        "mode": mode,
    }
