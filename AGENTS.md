# Qwen3-TTS Project Agents Guide

## Overview
Open-source text-to-speech generation tool optimized for Apple Silicon (MLX) using Qwen3 models. Supports voice cloning and voice design with MP3 output.

## Project Setup

### `make setup`
Installs system-level `ffmpeg` (via Homebrew if available) and all Python dependencies from `requirements.txt`.

```bash
make setup
```

### Manual dependencies
```bash
brew install ffmpeg   # system encoding
/opt/homebrew/bin/python3 -m pip install -r requirements.txt  # Python packages
```

## Running the Project

### Interactive CLI (recommended)
```bash
make interactive
```

### Voice Cloning Mode
```bash
make clone NAME="SpeakerName" REF="label" TEXT="phrase to say"
```

### Voice Design Mode
```bash
make design INST="voice description" TEXT="phrase to say"
```

### Playback last generated track
```bash
make last
```

### Cache cleanup
```bash
make clean
```

## Development / Server

### Start FastAPI server
```bash
make server/run
```
Runs `uvicorn app.main:app` on `0.0.0.0:8000` with auto-reload.

### Lint code
```bash
make server/lint
```

### Format code
```bash
make server/format
```

## Notes
- All Makefile targets are defined in the project `Makefile`.
- The server listens on port 8000 by default.
- Output MP3 files are saved under `output/`.