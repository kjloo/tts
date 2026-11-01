from fastapi import APIRouter

from app.service.language_service import LanguageService

language_routes = APIRouter(prefix="/api/languages", tags=["languages"])


@language_routes.get("/")
def get_supported_languages() -> dict[str, list[str]]:
    return {"languages": LanguageService.get_supported_languages()}
