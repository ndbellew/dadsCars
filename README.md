# DadsCars v0.1.0

Mobile-first vehicle research prototype by Blue Brother Software. Phase 1 includes a deterministic configurator, sample records, and Flask REST API; no scraping, production deployment, authentication, or releases.

## Quick start
- Backend: `docker compose up --build -d`; then `docker compose exec backend flask --app dad.py db upgrade && docker compose exec backend python seed.py` (development seed). API health: `http://localhost:5000/api/v1/health`.
- Mobile: copy `.env.example` to `mobile/.env`, set `EXPO_PUBLIC_API_BASE_URL` to your computer’s LAN IP plus `:5000/api/v1`, then run `cd mobile && npm ci && npx expo start`. Expo Go requires a compatible installed Expo Go/SDK version (prototype targets SDK 57).
- Tests: `python -m pip install -r backend/requirements.txt -r backend/requirements-dev.txt && pytest backend/tests`; mobile commands in `mobile/package.json`.

See [development](docs/DEVELOPMENT.md), [architecture](docs/ARCHITECTURE.md), [API](docs/API.md), [CI/CD](docs/CI-CD.md), and [roadmap](docs/ROADMAP.md). Legacy Flask template files are retained, but the new API is the supported backend surface.
