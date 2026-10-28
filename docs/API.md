# API v1

Machine-readable OpenAPI 3.1 contract: [`openapi.yaml`](openapi.yaml).

Base `/api/v1`. `GET /health` returns `{status: ok}`. `GET /vehicles` lists model specs; `GET /vehicles/{id}` returns one or 404. `POST /vehicles/search` accepts JSON filters: body_style, powertrain, engine, drivetrain, transmission, seats (minimum), doors, min_mpg, max_price, min_year, max_year, max_mileage. Unknown fields and invalid numeric values yield 400. Response has `exact_matches` and `alternatives`; mismatches report expected/actual and `reason`=`mismatch` or `unknown`. OpenAPI is not yet generated; this document is the API contract for the prototype.
