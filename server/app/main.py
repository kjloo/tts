from app.module.app_module import app, register_all_blueprints

register_all_blueprints(app)


# Load MLX model at startup (lazy loading handled in controller, but pre-warm here)
# The model is loaded on first request to avoid blocking server startup
@app.on_event("startup")
async def startup_event():
    # Initialize any required resources
    pass
