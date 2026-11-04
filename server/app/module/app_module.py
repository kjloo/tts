from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

OUTPUT_DIR = Path(__file__).resolve().parents[2] / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Initialize FastAPI app
app: FastAPI = FastAPI(
    title="Qwen3-TTS API",
    description="API for Qwen3-TTS Audio Generation Tool",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


# Routes
def register_all_blueprints(app: FastAPI):
    from app.controller.dataset_controller import dataset_routes
    from app.controller.generate_routes import generate_routes  # New generate routes
    from app.controller.language_controller import language_routes

    routers = [
        dataset_routes,
        language_routes,
        generate_routes,  # Add generate routes
    ]
    # Register all routers
    for router in routers:
        app.include_router(router)

    # Serve generated MP3s so the client can play and download them.
    app.mount("/api/output", StaticFiles(directory=OUTPUT_DIR), name="output")


register_all_blueprints(app)
