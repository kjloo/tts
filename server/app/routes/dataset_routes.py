from flask import Blueprint, Response, jsonify

from app.service import dataset_service

dataset_routes = Blueprint("dataset_routes", __name__)


@dataset_routes.route("/api/dataset/characters", methods=["GET"])
def get_characters() -> Response:
    characters = dataset_service.get_character_names()
    return jsonify({"characters": characters}), 200
