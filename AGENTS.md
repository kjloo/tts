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

## Development / Client

### Install client dependencies
```bash
make client/setup
```

### Run client dev server
```bash
make client/run
```
Runs the Vite dev server (Vite on `http://localhost:5173`, proxied to server `localhost:8000`).

### Build client for production
```bash
make client/build
```

### Run client tests
```bash
make client/test
```
Runs Vitest under `client/`. Client unit tests live alongside source in `client/src/api/__tests__/` (and similar).

### Clean client
```bash
make client/clean
```

## Notes
- All Makefile targets are defined in the project `Makefile`.
- The server listens on port 8000 by default.
- Output MP3 files are saved under `output/`.

## Testing
- Run `make test` (or `pytest` under `server/`) to verify all unit tests pass before committing.
- Each controller has its own test file in `server/tests/controller/` (e.g., `test_language_controller.py`).
- Run `make client/test` (or `npm test` under `client/`) to verify client unit tests pass.
- **Development requires that both server and client tests pass before committing.**
- Lint (`make server/lint`) and format (`make server/format`) also run as part of the test gate.

## Workflow Constraints
- **Do not auto-commit or auto-push changes** unless explicitly instructed by the user.
- Stage changes with `git add` and present the diff for review before committing.
- Wait for explicit approval before running `git commit` or `git push`.