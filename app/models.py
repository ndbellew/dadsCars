from app import db


class VehicleModel(db.Model):
    __tablename__ = "vehicle_models"
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String(80), nullable=False, index=True)
    model = db.Column(db.String(120), nullable=False, index=True)
    year = db.Column(db.Integer, nullable=False, index=True)
    body_style = db.Column(db.String(30))
    powertrain = db.Column(db.String(20))
    engine = db.Column(db.String(12))
    drivetrain = db.Column(db.String(10))
    transmission = db.Column(db.String(20))
    seats = db.Column(db.Integer)
    doors = db.Column(db.Integer)
    combined_mpg = db.Column(db.Float)
    msrp = db.Column(db.Integer)
    trim_name = db.Column(db.String(100))


class VehicleListing(db.Model):
    __tablename__ = "vehicle_listings"
    id = db.Column(db.Integer, primary_key=True)
    vehicle_model_id = db.Column(
        db.Integer, db.ForeignKey("vehicle_models.id"), nullable=False, index=True
    )
    mileage = db.Column(db.Integer)
    asking_price = db.Column(db.Integer)
    model = db.relationship(VehicleModel, backref="listings")
