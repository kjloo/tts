"""Unit tests for the generate API routes."""

from fastapi.testclient import TestClient

from app.main import app


def test_generate_missing_fields():
    """Test /api/generate/ returns 400 without required fields."""
    client = TestClient(app)
    response = client.post("/api/generate/", json={})
    assert response.status_code == 400
