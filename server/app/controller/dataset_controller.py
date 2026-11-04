from fastapi import APIRouter

from app.service.dataset_service import DatasetService

dataset_routes = APIRouter(prefix="/api/dataset", tags=["dataset"])


@dataset_routes.get("/characters")
def get_characters():
    """Returns all character names together with their refs in a single response."""
    names = DatasetService.get_character_names()
    characters = []
    for name in names:
        refs = DatasetService.get_available_labels_for_name(name)
        characters.append({"name": name, "refs": refs})
    return {"characters": characters}
