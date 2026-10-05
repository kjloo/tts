from gevent import monkey

monkey.patch_all()

from app.module.app_module import app, register_all_blueprints

register_all_blueprints(app)
