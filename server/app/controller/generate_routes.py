from fastapi import APIRouter, HTTPException, Request

from app.utils import get_unique_path

generate_routes = APIRouter(prefix="/api/generate", tags=["generate"])


@generate_routes.post("/")
async def generate_speech(request: Request, payload: dict):
    """
    Generate MP3 from text using MLX model.
    Expected payload:
    {
        "text": "Hello world",
        "lang": "English",
        "name": "SpeakerName",
        "ref": "label"
    }
    """
    text = payload.get("text")
    lang = payload.get("lang")
    name = payload.get("name")
    ref = payload.get("ref")

    if not all([text, lang, name, ref]):
        raise HTTPException(400, "Missing required fields: text, lang, name, ref")

    # Load model on first request (lazy loading)
    app = request.app
    if not hasattr(app.state, "tts_model"):
        from mlx_audio.tts.utils import load_model

        model = load_model(
            "mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-bf16", fix_mistral_regex=True
        )
        app.state.tts_model = model
        app.state.sample_rate = getattr(model, "sample_rate", 24000)

    model = app.state.tts_model

    # Generate audio
    try:
        results = list(
            model.generate_voice_design(
                text=text,
                language=lang,
                instruct=ref,  # Note: In this API, ref is used as voice design instruction
            )
        )
    except Exception as e:  # noqa: BLE001
        raise HTTPException(500, f"Generation failed: {e!s}")

    if not results:
        raise HTTPException(500, "No audio generated")

    # Save as MP3
    out_path = get_unique_path(
        "output",
        "voice_design",  # Fixed mode for generate endpoint
        name,
        lang,
        None,  # No base filename specified
        suffix=".mp3",
    )

    import numpy as np
    import soundfile as sf

    audio_data = np.array(results[0].audio)
    sr = app.state.sample_rate

    sf.write(str(out_path), audio_data, sr, format="MP3")

    return {"filepath": str(out_path)}
