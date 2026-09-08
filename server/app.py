from pathlib import Path
from urllib.parse import quote

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

import utils

OUTPUT_DIR = Path("output")

app = FastAPI(title="Qwen3-TTS UI")

# The Vite dev server runs on its own origin during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CloneRequest(BaseModel):
    text: str
    lang: str
    name: str
    ref: str
    out: str | None = None

class CloneResponse(BaseModel):
    filename: str
    url: str

@app.get("/api/options")
def get_options():
    names = utils.get_available_names(utils.JSONL_PATH)
    return {
        "languages": utils.LANGUAGES,
        "names": names,
        "refs": {name: utils.get_available_labels_for_name(utils.JSONL_PATH, name) for name in names},
    }

@app.post("/api/clone", response_model=CloneResponse)
def clone(request: CloneRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text is required.")

    try:
        out_path = utils.generate_clone(
            request.text,
            request.lang,
            request.name,
            request.ref,
            request.out,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error))

    filename = Path(out_path).name
    # Encode the path segment so reserved characters (#, ?, %, spaces, ...) in
    # speaker or output names do not corrupt the URL.
    return CloneResponse(filename=filename, url=f"/api/audio/{quote(filename)}")

@app.get("/api/audio/{filename}")
def get_audio(filename: str):
    audio_path = OUTPUT_DIR / Path(filename).name
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail=f"No audio named '{filename}'.")
    return FileResponse(audio_path, media_type="audio/mpeg")
