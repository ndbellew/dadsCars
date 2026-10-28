# Architecture

One repository, independent `mobile/` Expo client and Flask backend. Mobile routes/components call a small API service; deterministic matching is also isolated in `services/matching.ts` for offline mock data. Backend uses an app factory, API blueprint, SQLAlchemy models, and service-level matcher. `VehicleModel` describes year/make/model/trim specifications; `VehicleListing` represents an individual used-car listing.

PostgreSQL is the Compose persistence target; SQLite default supports easy local tests. Flask-Migrate is wired and an initial schema migration is committed; further production migration review remains required. Sample catalog rows are illustrative only. Preserve the existing single repository; consider splitting only when independent ownership/release cadence warrants it.
