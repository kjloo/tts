# Qwen3-TTS Project Specification

## Overview
The Qwen3-TTS project is an open-source text-to-speech generation tool optimized for Apple Silicon (MLX) that uses Qwen3 models. It provides both voice cloning (from local datasets) and voice design (via prompt descriptions) capabilities, with MP3 output for space efficiency.

## Architecture
- **Backend**: FastAPI server (Python) handling API routes and service logic.
- **Services**: Singleton classes (`DatasetService`, `LanguageService`) for domain logic.
- **CLI**: `run_tts.py` script for local execution with interactive prompts.
- **API**: RESTful endpoints for dataset and language information.

## API Specification
See `server/SPEC.md` for detailed API documentation.

## Contributing
Run `make setup` to install dependencies, then `make interactive` to test the CLI.

## License
MIT License.