# Mobile dependency audit

Baseline checked 2026-10-27 after a clean SDK 58 install. Resolved core versions: Expo `58.0.20`, Expo Router `58.0.27`, Expo Dev Client `58.0.16`, React Native `0.88.0`. `npm ci` reports 14 findings in its install summary (11 low, 3 high); `npm audit --json` reports 8 affected package nodes (5 low, 3 high). There are no moderate findings after removing the unused direct `query-string` dependency.

## High severity: temporary approved Zod advisory

- **GHSA-mrhx-c7xc-m3w5 — Zod array-validation memory exhaustion.** Chain: `expo@58.0.20` → `@expo/cli@58.1.16` → `zod@3.25.76`. Expo CLI declares Zod `^3.25.76`; the advisory affects releases below `4.6.6`. The three high package nodes (`zod`, `@expo/cli`, `expo`) all refer to this one underlying advisory.
- **Exposure:** this Zod dependency is in Expo CLI/config tooling, not imported by app code or shipped in the Android bundle. The risk is local/CI build-process availability if attacker-controlled input reaches the affected array validator.
- **Fix status:** no compatible Zod 3.x patch is available in the current graph. A Zod 4 override is outside Expo CLI's declared v3 range; we removed it rather than keeping an unsupported major override. npm's forced recommendation downgrades Expo from SDK 58, so do not apply it.
- **CI exception:** `mobile/scripts/check-audit.mjs` temporarily allows only GHSA-mrhx-c7xc-m3w5 through **2026-11-27** and only for `zod`, `@expo/cli`, and `expo`. It blocks other high/critical findings and fails after expiry. Remove this exception as soon as an SDK-compatible Expo CLI/Zod fix is available.

## Low severity

- **GHSA-gcqx-w48m-w2h4 — deepmerge prototype poisoning.** Chain: `expo@58.0.20` → Expo config/CLI packages → `deepmerge@4.3.1`. This affects build/config tooling rather than app runtime; the advisory lists no patched deepmerge release. Track an upstream Expo dependency update; don't override the merger outside its declared range.

## Removed moderate finding

The prior SDK 57 app had a direct, unused `query-string@7.1.3` dependency that brought in vulnerable `decode-uri-component@0.2.2`. No app source imported it, and Expo Router 58 does not depend on it. We removed the unneeded direct package; npm audit now reports no moderate issue for that path.

## Verification

The SDK 58 dependency set passes clean install, entry resolution, Expo dependency check, TypeScript, 3 app tests plus 6 audit-checker tests (approved advisory, unrelated and mixed findings, expiry, malformed/unknown data, and low/moderate visibility), ESLint, Prettier, the audit gate, and Android JS bundle export. The checker validates npm’s full transitive `via` graph and fails closed on malformed/unknown references. `npx expo prebuild --platform android --no-install` also generated the native Android project successfully. A Gradle/device build was not run because this environment has no Android SDK. See `docs/DEVELOPMENT.md` for local and EAS development-build instructions.

Advisories: [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).
