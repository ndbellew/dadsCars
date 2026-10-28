from flask import Blueprint, jsonify, request
from sqlalchemy import select
from app import db
from app.models import VehicleModel
from app.services.matching import match_vehicles

api = Blueprint("api", __name__)


def as_dict(v, mileage=None):
    return {
        "id": v.id,
        "make": v.make,
        "model": v.model,
        "year": v.year,
        "body_style": v.body_style,
        "powertrain": v.powertrain,
        "engine": v.engine,
        "drivetrain": v.drivetrain,
        "transmission": v.transmission,
        "seats": v.seats,
        "doors": v.doors,
        "combined_mpg": v.combined_mpg,
        "msrp": v.msrp,
        "trim_name": v.trim_name,
        "mileage": mileage,
    }


@api.get("/health")
def health():
    return jsonify({"status": "ok"})


@api.get("/vehicles")
def vehicles():
    rows = db.session.execute(select(VehicleModel)).scalars().all()
    return jsonify([as_dict(v) for v in rows])


@api.get("/vehicles/<int:vehicle_id>")
def vehicle_detail(vehicle_id):
    v = db.session.get(VehicleModel, vehicle_id)
    if v is None:
        return jsonify({"error": "not_found"}), 404
    return jsonify(as_dict(v))


@api.post("/vehicles/search")
def search():
    filters = request.get_json(silent=True)
    if not isinstance(filters, dict):
        return jsonify(
            {"error": "invalid_request", "message": "Expected a JSON object."}
        ), 400
    allowed = {
        "body_style",
        "powertrain",
        "engine",
        "drivetrain",
        "transmission",
        "seats",
        "doors",
        "min_mpg",
        "max_price",
        "min_year",
        "max_year",
        "max_mileage",
    }
    if unknown := set(filters) - allowed:
        return jsonify({"error": "invalid_filters", "fields": sorted(unknown)}), 400
    for key, value in filters.items():
        if (
            value is not None
            and key in allowed
            and key
            not in {"body_style", "powertrain", "engine", "drivetrain", "transmission"}
            and (isinstance(value, bool) or not isinstance(value, int) or value < 0)
        ):
            return jsonify({"error": "invalid_filter", "field": key}), 400
    rows = db.session.execute(select(VehicleModel)).scalars().all()
    data = [as_dict(v) for v in rows]
    result = match_vehicles(data, filters)
    return jsonify(result)
