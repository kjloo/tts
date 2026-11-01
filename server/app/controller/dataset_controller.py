from fastapi import APIRouter

from app.service.dataset_service import DatasetService

dataset_routes = APIRouter(prefix="/api/dataset", tags=["dataset"])


@dataset_routes.get("/characters")
def get_characters():
    characters = DatasetService.get_character_names()
    return {"characters": characters}
