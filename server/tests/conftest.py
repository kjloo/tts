import sys
from unittest.mock import MagicMock

# Mock mlx_audio before any server imports try to load libmlx.so
mock_mlx = MagicMock()
mock_mlx.core = MagicMock()
mock_mlx.core.asarray = lambda x: x
sys.modules["mlx_audio"] = mock_mlx
sys.modules["mlx_audio.tts"] = mock_mlx.tts
sys.modules["mlx_audio.tts.utils"] = mock_mlx.tts.utils

# Provide load_model for app/utils.py
mock_mlx.tts.utils.load_model = lambda *args, **kwargs: MagicMock()
