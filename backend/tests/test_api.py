from app import create_app, db
from app.models import VehicleModel


def test_health_and_search():
    app = create_app(
        {"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite://", "SECRET_KEY": "test"}
    )
    with app.app_context():
        db.create_all()
        db.session.add(VehicleModel(make="Honda", model="CR-V", year=2023, body_style="SUV"))
        db.session.commit()
    client = app.test_client()
    assert client.get("/api/v1/health").json["status"] == "ok"
    assert client.get("/").status_code == 200
    assert len(client.post("/api/v1/vehicles/search", json={}).json["exact_matches"]) == 1
    assert client.post("/api/v1/vehicles/search", json={"bad": 1}).status_code == 400
