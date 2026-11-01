from fastapi import APIRouter

from app.service.language_service import SUPPORTED_LANGUAGES

language_routes = APIRouter(prefix="/api/languages", tags=["languages"])


@language_routes.get("/")
def get_supported_languages() -> dict[str, list[str]]:
    return {"languages": SUPPORTED_LANGUAGES}
