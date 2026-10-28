from typing import Any

FILTER_FIELDS = {
    "body_style": "body_style",
    "powertrain": "powertrain",
    "engine": "engine",
    "drivetrain": "drivetrain",
    "transmission": "transmission",
    "seats": "seats",
    "doors": "doors",
    "min_mpg": "combined_mpg",
    "max_price": "msrp",
    "min_year": "year",
    "max_year": "year",
    "max_mileage": "mileage",
}


def match_vehicles(
    vehicles: list[dict[str, Any]], filters: dict[str, Any]
) -> dict[str, list[dict[str, Any]]]:
    selected = {
        k: v
        for k, v in filters.items()
        if v is not None and v != "" and k in FILTER_FIELDS
    }
    exact: list[dict[str, Any]] = []
    alternatives: list[dict[str, Any]] = []
    for vehicle in vehicles:
        mismatches = []
        for key, wanted in selected.items():
            field = FILTER_FIELDS[key]
            actual = vehicle.get(field)
            if actual is None:
                mismatches.append(
                    {
                        "requirement": key,
                        "expected": wanted,
                        "actual": None,
                        "reason": "unknown",
                    }
                )
                continue
            ok = (
                actual >= wanted
                if key in ("seats", "min_mpg", "min_year")
                else actual <= wanted
                if key in ("max_price", "max_year", "max_mileage")
                else actual == wanted
            )
            if not ok:
                mismatches.append(
                    {
                        "requirement": key,
                        "expected": wanted,
                        "actual": actual,
                        "reason": "mismatch",
                    }
                )
        result = {**vehicle, "matched": not mismatches, "mismatches": mismatches}
        (exact if not mismatches else alternatives).append(result)
    alternatives.sort(
        key=lambda x: (
            len(x["mismatches"]),
            x.get("make", ""),
            x.get("model", ""),
            x.get("year", 0),
        )
    )
    return {"exact_matches": exact, "alternatives": alternatives}
