# Mobile dependency audit

Audit baseline checked on 2026-10-27 from `mobile` using the committed lockfile after a clean `npm ci --include=dev`. Expo SDK and React Native versions remain aligned at Expo `57.0.31`, Expo Router `57.0.29`, and React Native `0.86.3`.

On this lockfile, `npm ci` prints an install summary of 18 findings (12 low, 3 moderate, 3 high); `npm audit --audit-level=high` reports 11 affected package nodes (5 low, 3 moderate, 3 high). The three high nodes are `zod`, `@expo/cli`, and `expo`, all arising from one Zod advisory in the dependency chain. Use the audit report nodes below for the actual dependency paths. A non-forced `npm audit fix` was attempted; no compatible update resolved the high issue. The high-severity CI gate remains enabled and correctly fails until that upstream issue is fixed.

## High severity

- **GHSA-mrhx-c7xc-m3w5 (Zod array-validation resource exhaustion).** Dependency chain: direct app dependency `expo@57.0.31` → `@expo/cli@57.0.32` → `zod@3.25.76`. The CLI declares `zod: ^3.25.76`; the advisory marks versions below `4.6.6` affected, with `4.6.6` as the patched release. The affected package is in Expo CLI/config tooling, not imported by app code or shipped in the Android bundle. Exposure is during local/CI Expo config/build operations if attacker-controlled data reaches an unbounded Zod array validator; the reported impact is process memory exhaustion.
  - **Remediation status:** no compatible Zod 3.x patch is available in the current graph. npm's forced-fix suggestion selects an older Expo major than the installed SDK 57; rejected. A Zod 4.6.6 override was trialed; Expo dependency validation, type checking, tests, lint, and Android export passed. It is still outside Expo CLI's declared `^3.25.76` range, so it was removed rather than shipping an unsupported major override.
  - **Next safe option:** wait for an Expo SDK-compatible CLI release that permits/pins patched Zod, then update within the supported SDK dependency set and rerun this checklist. If considering a newer SDK, first verify its Expo Go/device support and run the full native compatibility checks. Do not use `npm audit fix --force` or downgrade Expo to clear this finding.

## Moderate severity

- **GHSA-vcc3-ghjq-m6fr (malformed percent-encoding CPU denial of service).** Chain: `expo-router@57.0.29` → `query-string@7.1.3` → `decode-uri-component@0.2.2` (affected through 0.4.2; patched release 0.5.0). Expo Router parses URL/query/path input, so a crafted deep link or route URL could make the app's URL-processing path spend excessive CPU and become unresponsive. This is an availability issue, not data disclosure or code execution.
  - **Remediation status:** npm proposes `query-string@10.0.0` or `expo-router@58.0.27`, both major updates relative to this SDK 57 app. Keep the current SDK-compatible versions; do not force or override across the router dependency boundary.
  - **Next safe option:** adopt an Expo-supported router/decoder patch when available, or schedule a coordinated Expo SDK + Router upgrade after device/Expo Go compatibility is confirmed. The advisory's input-size limit workaround is an option only if we later add an app-owned URL ingress guard; there is no such guard today.

## Low severity

- **GHSA-gcqx-w48m-w2h4 (deepmerge prototype poisoning).** Chain: `expo@57.0.31` → `@expo/config@57.0.10` → `deepmerge@4.3.1`. Audit also reports Expo CLI, Metro/prebuild config, and local build-cache packages as affected dependents. This is Expo config/build tooling, not app runtime. Exploitation requires a malicious source object to reach merge processing; the advisory currently lists **no patched deepmerge version**.
  - **Next safe option:** track the upstream Expo/deepmerge remediation and update the SDK-compatible dependency when released. Do not replace the merger with an out-of-range override without compatibility tests.

The other low-severity package entries in the audit are dependent Expo config/CLI packages affected through this same `deepmerge` chain; they are not separate underlying issues.

## CI and verification

`.github/workflows/mobile.yml` continues to run `npm audit --audit-level=high`, so the workflow remains red for the unresolved high Zod advisory. Moderate/low findings do not fail that threshold but are not silently accepted; this file records their paths and follow-up. No audit exceptions or force-fixes were added.

Verified on this lockfile: clean `npm ci` succeeds; TypeScript, tests (3 passed), ESLint, Prettier, `npx expo install --check`, and Android JS bundle export pass. Full `npm audit` remains nonzero; do not describe security CI as green.

Advisories: [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr), [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).
