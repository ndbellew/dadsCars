import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateAuditReport,
  APPROVED_ADVISORY,
  EXPIRES,
} from './check-audit.mjs';

const advisory = {
  name: 'zod',
  url: `https://github.com/advisories/${APPROVED_ADVISORY}`,
  severity: 'high',
};
const approvedReport = () => ({
  vulnerabilities: {
    zod: { severity: 'high', via: [advisory] },
    '@expo/cli': { severity: 'high', via: ['zod'] },
    expo: { severity: 'high', via: ['@expo/cli'] },
  },
});
const beforeExpiry = new Date('2026-11-27T23:59:59Z');

test('allows only the exact approved advisory through transitive via references', () => {
  assert.equal(
    evaluateAuditReport(approvedReport(), beforeExpiry).blocked,
    false,
  );
});

test('blocks unrelated high advisories, including on Expo and Zod', () => {
  const report = approvedReport();
  report.vulnerabilities.zod.via.push({
    name: 'zod',
    url: 'https://github.com/advisories/GHSA-new-zod',
    severity: 'high',
  });
  assert.equal(evaluateAuditReport(report, beforeExpiry).blocked, true);
  const expoOnly = {
    vulnerabilities: {
      expo: {
        severity: 'high',
        via: [
          {
            name: 'expo',
            url: 'https://github.com/advisories/GHSA-new-expo',
            severity: 'high',
          },
        ],
      },
    },
  };
  assert.equal(evaluateAuditReport(expoOnly, beforeExpiry).blocked, true);
});

test('blocks mixed approved and unrelated findings', () => {
  const report = approvedReport();
  report.vulnerabilities['@expo/cli'].via.push({
    name: 'other',
    url: 'https://github.com/advisories/GHSA-other',
    severity: 'critical',
  });
  assert.equal(evaluateAuditReport(report, beforeExpiry).blocked, true);
});

test('fails closed after the exception expiry', () => {
  const result = evaluateAuditReport(
    approvedReport(),
    new Date('2026-11-28T00:00:00Z'),
  );
  assert.equal(result.blocked, true);
  assert.match(result.messages[0], new RegExp(EXPIRES));
});

test('fails closed on malformed reports and unknown transitive references', () => {
  assert.throws(
    () => evaluateAuditReport({ vulnerabilities: [] }, beforeExpiry),
    /Malformed/,
  );
  assert.throws(
    () =>
      evaluateAuditReport(
        { vulnerabilities: { expo: { severity: 'high', via: ['missing'] } } },
        beforeExpiry,
      ),
    /Unknown/,
  );
  assert.throws(
    () =>
      evaluateAuditReport(
        { vulnerabilities: { expo: { severity: 'high', via: [null] } } },
        beforeExpiry,
      ),
    /Malformed/,
  );
});

test('keeps low and moderate findings visible without failing the high gate', () => {
  const result = evaluateAuditReport(
    {
      vulnerabilities: {
        old: {
          severity: 'low',
          via: [
            { name: 'x', url: 'https://example.test/low', severity: 'low' },
          ],
        },
        another: {
          severity: 'moderate',
          via: [
            {
              name: 'y',
              url: 'https://example.test/moderate',
              severity: 'moderate',
            },
          ],
        },
      },
    },
    beforeExpiry,
  );
  assert.equal(result.blocked, false);
  assert.deepEqual(result.messages, [
    'Audit finding: old (low)',
    'Audit finding: another (moderate)',
  ]);
});
