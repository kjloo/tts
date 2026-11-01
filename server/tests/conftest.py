import pytest
from fastapi.testclient import TestClient
from starlette.testclient import WSGITransport

from app.main import app


@pytest.fixture(scope="session")
def fastapi_app():
    """Fixture providing the FastAPI app instance."""
    return app


@pytest.fixture
def client():
    """Fixture providing a TestClient for the FastAPI app."""
    return TestClient(transport=WSGITransport(app=app))
