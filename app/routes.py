import requests
import sqlalchemy as sa
from flask import render_template

from app import app as api, db
from app.models import Cars



@api.route('/')
@api.route('/index')
def index():
    cars = db.session.execute(sa.select(Cars)).scalars().all()
    return render_template('index.html', title='Home', cars=cars)
