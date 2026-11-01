from fastapi import APIRouter

from app.service import dataset_service

dataset_routes = APIRouter(prefix="/api/dataset", tags=["dataset"])


@dataset_routes.get("/characters")
def get_characters():
    characters = dataset_service.get_character_names()
    return {"characters": characters}
