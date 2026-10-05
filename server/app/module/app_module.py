from flask import Flask

# Initialize Flask app
app: Flask = Flask()


# Routes
def register_all_blueprints(app: Flask):
    from app.routes.dataset_routes import dataset_routes

    blueprints = [
        dataset_routes,
    ]
    # Register all blueprints
    for blueprint in blueprints:
        app.register_blueprint(blueprint)
