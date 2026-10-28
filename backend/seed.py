from app import create_app, db
from app.models import VehicleModel

app = create_app()
SAMPLES = [
    ("Toyota", "Camry", 2024, "Sedan", "Hybrid", "I4", "FWD", "Automatic", 5, 4, 51, 28900),
    ("Honda", "CR-V", 2023, "SUV", "Hybrid", "I4", "AWD", "Automatic", 5, 4, 37, 33350),
    ("Ford", "Mustang", 2022, "Coupe", "Gasoline", "V8", "RWD", "Manual", 4, 2, 19, 39900),
]
with app.app_context():
    db.create_all()
    for make, model, year, body, power, engine, drive, trans, seats, doors, mpg, price in SAMPLES:
        if not db.session.query(VehicleModel).filter_by(make=make, model=model, year=year).first():
            db.session.add(
                VehicleModel(
                    make=make,
                    model=model,
                    year=year,
                    body_style=body,
                    powertrain=power,
                    engine=engine,
                    drivetrain=drive,
                    transmission=trans,
                    seats=seats,
                    doors=doors,
                    combined_mpg=mpg,
                    msrp=price,
                )
            )
    db.session.commit()
