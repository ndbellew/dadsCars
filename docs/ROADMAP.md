# Roadmap

Phase 2 priorities: database-backed listing search with validated listing filters and useful seed fixtures; generated OpenAPI contract; reliable migration baseline; connect mobile search service to actual UI; improve accessibility/device verification; expand matcher boundary/property tests. Later phases may explore curated data ingestion, pricing/reliability research, reviews/community only after source, privacy, moderation, and legal decisions.

Current limitations: configurator uses local mock data as an offline fallback and calls the configurable backend after search; backend search currently has model-level records and may report mileage as unknown until listings are seeded and incorporated; sample data is tiny; API schema docs are hand-authored; no physical-device or remote CI run is claimed.
