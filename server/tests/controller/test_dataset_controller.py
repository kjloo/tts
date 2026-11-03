"""Unit tests for the dataset API routes."""

from fastapi.testclient import TestClient

from app.main import app


def test_get_characters_combined():
    """Test the /api/dataset/characters endpoint returns names with refs."""
    client = TestClient(app)
    response = client.get("/api/dataset/characters")

    assert response.status_code == 200
    data = response.json()
    assert "characters" in data
    # Check that each entry has name and refs
    for char in data["characters"]:
        assert "name" in char
        assert "refs" in char
        assert isinstance(char["refs"], list)
