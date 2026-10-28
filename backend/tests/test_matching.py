from app.services.matching import match_vehicles


def sample(**kw):
    return {
        "id": 1,
        "make": "Test",
        "model": "Car",
        "year": 2022,
        "body_style": "SUV",
        "powertrain": "Hybrid",
        "engine": "I4",
        "drivetrain": "AWD",
        "transmission": "Automatic",
        "seats": 5,
        "doors": 4,
        "combined_mpg": 35,
        "msrp": 30000,
        "mileage": 10000,
        **kw,
    }


def test_empty_filters_are_all_exact():
    out = match_vehicles([sample()], {})
    assert len(out["exact_matches"]) == 1 and not out["alternatives"]


def test_exact_before_alternative_and_mismatch_explained():
    out = match_vehicles([sample(msrp=50000), sample()], {"max_price": 40000})
    assert out["exact_matches"][0]["msrp"] == 30000
    assert out["alternatives"][0]["mismatches"][0]["requirement"] == "max_price"


def test_unknown_attribute_is_explicit():
    out = match_vehicles([sample(combined_mpg=None)], {"min_mpg": 30})
    assert out["alternatives"][0]["mismatches"][0]["reason"] == "unknown"


def test_no_results():
    out = match_vehicles([], {"body_style": "SUV"})
    assert out == {"exact_matches": [], "alternatives": []}
