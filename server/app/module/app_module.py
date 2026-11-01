from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


# Routes
def register_all_blueprints(app: FastAPI):
    from app.routes.dataset_routes import dataset_routes
    from app.routes.language_routes import language_routes

    routers = [
        dataset_routes,
        language_routes,
    ]
    # Register all routers
    for router in routers:
        app.include_router(router)
