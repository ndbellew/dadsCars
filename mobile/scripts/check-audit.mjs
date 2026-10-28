
import { spawnSync } from 'node:child_process';

const APPROVED_ADVISORY = 'GHSA-mrhx-c7xc-m3w5';
const EXPIRES = '2026-11-27';
const allowedPackages = new Set(['zod', '@expo/cli', 'expo']);

if (new Date() > new Date(`${EXPIRES}T23:59:59Z`)) {
  console.error(`Security exception expired: ${EXPIRES}`);
  process.exit(1);
}

const result = spawnSync('npm', ['audit', '--json'], {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

if (result.error || ![0, 1].includes(result.status)) {
  console.error('npm audit failed unexpectedly', result.error ?? result.stderr);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error('Unable to parse npm audit JSON');
  process.exit(1);
}

if (!report.vulnerabilities || typeof report.vulnerabilities !== 'object') {
  console.error('Invalid npm audit report');
  process.exit(1);
}

let blocked = false;

for (const [name, vulnerability] of Object.entries(report.vulnerabilities)) {
  if (!['high', 'critical'].includes(vulnerability.severity)) continue;

  const advisories = vulnerability.via.filter(
    (item) => typeof item === 'object' && item !== null
  );

  const approved =
    allowedPackages.has(name) &&
    advisories.length > 0 &&
    advisories.every((item) => item.name === 'zod' &&
      item.url === `https://github.com/advisories/${APPROVED_ADVISORY}`);

  if (approved) {
    console.warn(`Approved temporary exception: ${name}`);
  } else {
    console.error(`Blocking vulnerability: ${name} (${vulnerability.severity})`);
    blocked = true;
  }
}

process.exit(blocked ? 1 : 0);
