# CI/CD and releases

GitHub-hosted workflows are configured for mobile/backend checks plus Gitleaks. CI status has not been observed on GitHub from this environment. Local `npm audit --audit-level=high` currently reports three high-severity issues in the Expo SDK 57 transitive toolchain; safe `npm audit fix` cannot resolve them without a breaking SDK/dependency change, so Mobile CI is expected to fail the audit gate until reviewed upstream fixes land. Python `pip-audit` reports no known vulnerabilities. Pin actions to reviewed immutable SHAs before adopting for production. Dependabot proposes pip/npm/action updates. No deploy or publish job exists.

Recommend protecting `main`: require PRs, passing mobile/backend/security checks, up-to-date branch, and disallow direct pushes. Owner must configure repository settings; not enabled here.

Release baseline `v0.1.0`; tag reviewed commits, generate changelog from curated PRs, validate builds, and require explicit approval before EAS Android/iOS artifacts or backend image publish. Future RamNode deploy needs provisioned secrets, environment protection/approval, rollback and health verification. None are configured.
