"""Unit tests for the generate API routes."""

from unittest.mock import MagicMock

import soundfile as sf
from fastapi.testclient import TestClient

from app.controller import generate_routes
from app.main import app


def test_generate_missing_fields():
    """Test /api/generate/ returns 400 without required fields."""
    client = TestClient(app)
    response = client.post("/api/generate/", json={})
    assert response.status_code == 400


def test_generate_passes_filename_to_unique_path(monkeypatch, tmp_path):
    """The user-provided filename is forwarded so it can be prefixed/indexed."""
    model = MagicMock()
    model.sample_rate = 24000
    model.generate_voice_design.return_value = [MagicMock(audio=[0.0, 0.1])]
    app.state.tts_model = model
    app.state.sample_rate = 24000

    captured = {}

    def fake_unique_path(directory, mode, name, lang, base_filename, suffix):
        captured.update(
            directory=directory,
            mode=mode,
            name=name,
            lang=lang,
            base_filename=base_filename,
            suffix=suffix,
        )
        return tmp_path / "Fiora_hello_01.mp3"

    monkeypatch.setattr(generate_routes, "get_unique_path", fake_unique_path)
    monkeypatch.setattr(sf, "write", lambda *args, **kwargs: None)

    client = TestClient(app)
    response = client.post(
        "/api/generate/",
        json={
            "text": "Hello world",
            "lang": "English",
            "name": "Fiora",
            "ref": "aggressive",
            "filename": "hello",
        },
    )

    assert response.status_code == 200
    assert captured["base_filename"] == "hello"
    assert captured["name"] == "Fiora"
    assert response.json() == {
        "filepath": "/api/output/Fiora_hello_01.mp3",
        "filename": "Fiora_hello_01.mp3",
    }
