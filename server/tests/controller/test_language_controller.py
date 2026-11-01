"""Unit tests for the language API routes."""

from fastapi.testclient import TestClient

from app.main import app


def test_get_supported_languages():
    """Test the /api/languages/ endpoint returns all supported languages."""
    client = TestClient(app)
    response = client.get("/api/languages/")

    assert response.status_code == 200
    data = response.json()
    assert "languages" in data
    assert data["languages"] == [
        "English",
        "Chinese",
        "Japanese",
        "Korean",
        "German",
        "French",
        "Spanish",
        "Italian",
    ]
