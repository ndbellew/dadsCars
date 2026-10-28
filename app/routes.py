import sqlalchemy as sa
from flask import Blueprint, render_template

from app import db
from app.models import VehicleModel

legacy = Blueprint("legacy", __name__)


@legacy.get("/")
@legacy.get("/index")
def index():
    cars = db.session.execute(sa.select(VehicleModel)).scalars().all()
    return render_template("index.html", title="Home", cars=cars)
