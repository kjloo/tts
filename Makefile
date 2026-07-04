PYTHON = python
PIP = pip

# Default Variables (all empty to trigger interactivity/smart-naming)
NAME = 
REF = 
LANG = 
TEXT = 
OUT = 
INST = 

.PHONY: setup clone design interactive clean last

# Installs system-level ffmpeg (via Homebrew) and Python dependencies
setup:
	@echo "Checking system dependencies..."
	@if command -v brew >/dev/null 2>&1; then \
		echo "Installing ffmpeg via Homebrew..."; \
		brew install ffmpeg; \
	else \
		echo "⚠️ Homebrew not found. Please ensure 'ffmpeg' is installed manually for MP3 compression."; \
	fi
	@echo "Installing Python packages..."
	$(PIP) install -r requirements.txt
	@echo "✨ Setup complete!"

# Chained to run 'last' automatically after the python command
clone:
	$(PYTHON) run_tts.py --mode clone --name "$(NAME)" --ref "$(REF)" --lang "$(LANG)" --text "$(TEXT)" --out "$(OUT)"
	@$(MAKE) last

# Chained to run 'last' automatically after the python command
design:
	$(PYTHON) run_tts.py --mode design --instruct "$(INST)" --lang "$(LANG)" --text "$(TEXT)" --out "$(OUT)"
	@$(MAKE) last

interactive:
	$(PYTHON) run_tts.py
	@$(MAKE) last

# Finds the most recently modified .mp3 file in the output folder and plays it
last:
	@ls -t output/*.mp3 2>/dev/null | head -1 | xargs afplay || echo "No output file found to play."

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "Caches cleared."
