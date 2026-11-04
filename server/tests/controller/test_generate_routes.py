"""Unit tests for the generate API routes."""

from unittest.mock import MagicMock

import soundfile as sf
from fastapi.testclient import TestClient

from app.controller import generate_routes
from app.main import app


def _fake_model(method_name):
    model = MagicMock()
    model.sample_rate = 24000
    getattr(model, method_name).return_value = [MagicMock(audio=[0.0, 0.1])]
    return model


def test_generate_missing_fields():
    """Test /api/generate/ returns 400 without required fields."""
    client = TestClient(app)
    response = client.post("/api/generate/", json={})
    assert response.status_code == 400


def test_generate_mode_uses_voice_design_settings(monkeypatch, tmp_path):
    """Generate mode uses a voice description plus the sampling settings."""
    model = _fake_model("generate_voice_design")
    app.state.tts_models = {"generate": model}

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
        return tmp_path / "Design_hello_01.mp3"

    monkeypatch.setattr(generate_routes, "get_unique_path", fake_unique_path)
    monkeypatch.setattr(sf, "write", lambda *args, **kwargs: None)

    client = TestClient(app)
    response = client.post(
        "/api/generate/",
        json={
            "mode": "generate",
            "text": "Hello world",
            "lang": "English",
            "filename": "hello",
            "instruct": "A calm voice",
            "temperature": 0.8,
            "top_k": 40,
            "top_p": 0.95,
            "repetition_penalty": 1.1,
            "max_tokens": 1024,
        },
    )

    assert response.status_code == 200
    model.generate_voice_design.assert_called_once_with(
        text="Hello world",
        language="English",
        instruct="A calm voice",
        temperature=0.8,
        top_k=40,
        top_p=0.95,
        repetition_penalty=1.1,
        max_tokens=1024,
    )
    assert captured["mode"] == "voice_design"
    assert captured["name"] == "Design"
    assert captured["base_filename"] == "hello"
    assert response.json() == {
        "filepath": "/api/output/Design_hello_01.mp3",
        "filename": "Design_hello_01.mp3",
        "mode": "generate",
    }


def test_clone_mode_uses_dataset_reference(monkeypatch, tmp_path):
    """Clone mode passes the dataset reference audio and transcript to the model."""
    model = _fake_model("generate")
    app.state.tts_models = {"clone": model}

    reference_audio = tmp_path / "reference.wav"

    class FakeDatasetService:
        @staticmethod
        def get_reference(name, label):
            return {"name": name, "label": label, "text": "Reference transcript."}

        @staticmethod
        def get_reference_audio_path(name, label):
            return reference_audio

    captured = {}

    def fake_unique_path(directory, mode, name, lang, base_filename, suffix):
        captured.update(mode=mode, name=name, base_filename=base_filename)
        return tmp_path / "Fiora_hello_01.mp3"

    monkeypatch.setattr(generate_routes, "DatasetService", FakeDatasetService)
    monkeypatch.setattr(generate_routes, "get_unique_path", fake_unique_path)
    monkeypatch.setattr(sf, "write", lambda *args, **kwargs: None)

    client = TestClient(app)
    response = client.post(
        "/api/generate/",
        json={
            "mode": "clone",
            "text": "Hello world",
            "lang": "English",
            "filename": "hello",
            "name": "Fiora",
            "ref": "aggressive",
        },
    )

    assert response.status_code == 200
    model.generate.assert_called_once_with(
        text="Hello world",
        ref_audio=str(reference_audio),
        ref_text="Reference transcript.",
        lang_code="English",
    )
    assert captured["mode"] == "clone"
    assert captured["name"] == "Fiora"
    assert captured["base_filename"] == "hello"
    assert response.json()["filename"] == "Fiora_hello_01.mp3"
    assert response.json()["mode"] == "clone"


def test_invalid_mode_is_rejected():
    """An unsupported mode returns a 400."""
    client = TestClient(app)
    response = client.post(
        "/api/generate/",
        json={"mode": "other", "text": "Hello", "lang": "English"},
    )
    assert response.status_code == 400
