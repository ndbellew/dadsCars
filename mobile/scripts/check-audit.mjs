import { spawnSync } from 'node:child_process';

export const APPROVED_ADVISORY = 'GHSA-mrhx-c7xc-m3w5';
export const EXPIRES = '2026-11-27';
const ALLOWED_PACKAGES = new Set(['zod', '@expo/cli', 'expo']);
const APPROVED_URL = `https://github.com/advisories/${APPROVED_ADVISORY}`;

export function evaluateAuditReport(report, now = new Date()) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error('Invalid audit evaluation date');
  }
  if (now.getTime() > Date.parse(`${EXPIRES}T23:59:59.999Z`)) {
    return {
      blocked: true,
      messages: [`Security exception expired: ${EXPIRES}`],
    };
  }
  if (
    !report ||
    typeof report !== 'object' ||
    Array.isArray(report) ||
    !report.vulnerabilities ||
    typeof report.vulnerabilities !== 'object' ||
    Array.isArray(report.vulnerabilities)
  ) {
    throw new Error(
      'Malformed npm audit report: vulnerabilities must be an object',
    );
  }

  const vulnerabilities = report.vulnerabilities;
  const validSeverities = new Set([
    'info',
    'low',
    'moderate',
    'high',
    'critical',
  ]);
  for (const [name, vulnerability] of Object.entries(vulnerabilities)) {
    if (
      !name ||
      !vulnerability ||
      typeof vulnerability !== 'object' ||
      Array.isArray(vulnerability) ||
      !validSeverities.has(vulnerability.severity) ||
      !Array.isArray(vulnerability.via)
    ) {
      throw new Error(`Malformed npm audit vulnerability entry: ${name}`);
    }
  }

  function collect(name, path = new Set()) {
    if (path.has(name)) return [];
    const entry = vulnerabilities[name];
    if (!entry)
      throw new Error(`Unknown npm audit dependency reference: ${name}`);
    const nextPath = new Set(path).add(name);
    return entry.via.flatMap((item) => {
      if (typeof item === 'string') return collect(item, nextPath);
      if (
        !item ||
        typeof item !== 'object' ||
        Array.isArray(item) ||
        typeof item.name !== 'string' ||
        typeof item.url !== 'string' ||
        !validSeverities.has(item.severity)
      ) {
        throw new Error(`Malformed npm audit advisory reference under ${name}`);
      }
      return [item];
    });
  }

  // Validate the complete graph, including low/moderate nodes, before judging severities.
  for (const name of Object.keys(vulnerabilities)) collect(name);

  let blocked = false;
  const messages = [];
  for (const [name, vulnerability] of Object.entries(vulnerabilities)) {
    if (['low', 'moderate'].includes(vulnerability.severity)) {
      messages.push(`Audit finding: ${name} (${vulnerability.severity})`);
      continue;
    }
    if (!['high', 'critical'].includes(vulnerability.severity)) continue;
    const advisories = collect(name).filter((item) =>
      ['high', 'critical'].includes(item.severity),
    );
    const approved =
      ALLOWED_PACKAGES.has(name) &&
      advisories.length > 0 &&
      advisories.every(
        (item) => item.name === 'zod' && item.url === APPROVED_URL,
      );
    if (approved)
      messages.push(
        `Approved temporary exception: ${name} — ${APPROVED_ADVISORY}`,
      );
    else {
      messages.push(
        `Blocking vulnerability: ${name} (${vulnerability.severity})`,
      );
      blocked = true;
    }
  }
  return { blocked, messages };
}

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  const result = spawnSync('npm', ['audit', '--json'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.error || ![0, 1].includes(result.status)) {
    console.error(
      'npm audit failed unexpectedly',
      result.error ?? result.stderr,
    );
    process.exit(1);
  }
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    console.error('Unable to parse npm audit JSON');
    process.exit(1);
  }
  try {
    const outcome = evaluateAuditReport(report);
    for (const message of outcome.messages) console.log(message);
    process.exit(outcome.blocked ? 1 : 0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
