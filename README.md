# Qwen3-TTS Audio Generation Tool

A lightweight Python tool optimized for Apple Silicon (MLX) that generates text-to-speech audio using Alibaba's `Qwen3-TTS-12Hz` models. It supports both **voice cloning** (from local datasets) and **voice design** (via prompt descriptions). To maximize disk space efficiency, all outputs are compressed and saved directly as `.mp3` files.

## Features

- **Voice Cloning Mode:** Instantly mimics specific speakers using local reference files.
- **Voice Design Mode:** Generates new custom voices entirely from text-based descriptive instructions.
- **Space-Saving MP3 Output:** Directly converts raw numpy audio structures into compressed MP3 tracks.
- **Interactive Prompts:** Falls back to interactive CLI menus if arguments are omitted.
- **Apple Silicon Native:** Uses `mlx-audio` to run model weights efficiently on Mac unified memory.
- **Automated Environments:** Integrates seamlessly with `direnv` via `.envrc` for isolated project sandboxing.

---

## Repository Structure

- `run_tts.py`: The primary engine script containing parsing logic and model inference.
- `utils.py`: Helper functions handling path incrementing, jsonl dataset parsing, and model initialization.
- `Makefile`: Shortcut automation for installation, execution pipelines, and audio playback.
- `requirements.txt`: Python package dependencies list.
- `.envrc`: Automated environment loading script (manages python binary routing).

---

## Prerequisites

- macOS with Apple Silicon (M1/M2/M3/M4 chips recommended).
- [Homebrew](https://brew.sh/) installed (for automatic `ffmpeg` integration).
- [direnv](https://direnv.net/) installed and hooked into your shell.

---

## Quick Start

### 1. Project Initialization

Allow `direnv` to process your `.envrc` workspace rules, then run the setup automation to fetch system encoding tools (`ffmpeg`) and internal Python dependencies:

```bash
direnv allow
make setup
```

### 2. Configure Your Dataset (For Cloning Mode Only)

To use the voice clone features, set up your folder environment like this:

```text
my_dataset/
├── train.jsonl
└── audio/
    ├── speaker1_sample.wav
    └── speaker2_sample.wav
```

Your `train.jsonl` lines must look like this:

```json
{"name": "Fiora", "label": "aggressive", "text": "The transcript of the reference audio.", "audio": "audio/speaker1_sample.wav"}
```

---

## How to Run

### Interactive Selection (Recommended)

Launch the script cleanly without arguments to pick your modes, available voices, and languages directly from dynamic command-line lists:

```bash
make interactive
```

### Voice Cloning Mode

Explicitly trigger a run using a predefined speaker and context label from your dataset:

```bash
make clone NAME="Fiora" REF="aggressive" TEXT="Target phrase to say."
```

### Voice Design Mode

Instruct the model to synthesize an entirely artificial voice based on descriptions:

```bash
make design INST="A fast-talking woman with a sharp Scottish accent" TEXT="Target phrase to say."
```

### Playback & Cleanup

- **Play Last Track:** Run `make last` to playback your most recently generated MP3 file via native terminal audio.
- **Clear Caches:** Run `make clean` to scrub local `__pycache__` directories from your workplace.
