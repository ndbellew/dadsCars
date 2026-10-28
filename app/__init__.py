from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()
migrate = Migrate()


def create_app(config_object=Config):
    app = Flask(__name__)
    if isinstance(config_object, dict):
        app.config.update(config_object)
    else:
        app.config.from_object(config_object)
    db.init_app(app)
    migrate.init_app(app, db)
    from app.api import api
    from app.routes import legacy

    app.register_blueprint(api, url_prefix="/api/v1")
    app.register_blueprint(legacy)
    from app import models  # noqa: F401

    return app
