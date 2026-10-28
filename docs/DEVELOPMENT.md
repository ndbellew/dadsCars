# Development

Requires Docker Compose, Python 3.12+, Node/npm, and Expo Go for device testing. Copy `.env.example` to repo-root `.env` for Compose, then copy it to `mobile/.env` for Expo and replace `EXPO_PUBLIC_API_BASE_URL` with the host LAN IP visible to the phone; ensure firewall allows TCP 5000. Run `docker compose up --build -d`, then apply schema with `docker compose exec backend flask --app dad.py db upgrade` and seed via `docker compose exec backend python seed.py`. Stop with `docker compose down`; persistent DB volume remains. `docker compose down -v` removes local DB data.

For schema changes, configure `FLASK_APP=dad.py`, then `flask db migrate -m "description"` and `flask db upgrade`; inspect generated migration before applying. Current seed uses create_all as a development convenience.
