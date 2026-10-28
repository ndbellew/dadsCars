import type { Filters, MatchResults, Vehicle } from '../types/vehicle';
const fields: Record<string, keyof Vehicle> = {
  body_style: 'body_style',
  powertrain: 'powertrain',
  engine: 'engine',
  drivetrain: 'drivetrain',
  transmission: 'transmission',
  seats: 'seats',
  doors: 'doors',
  min_mpg: 'combined_mpg',
  max_price: 'msrp',
  min_year: 'year',
  max_year: 'year',
  max_mileage: 'mileage',
};
export function matchVehicles(
  vehicles: Vehicle[],
  filters: Filters,
): MatchResults {
  const chosen = Object.entries(filters).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  const exact: Vehicle[] = [],
    alternatives: Vehicle[] = [];
  for (const vehicle of vehicles) {
    const mismatches = [] as NonNullable<Vehicle['mismatches']>;
    for (const [key, wanted] of chosen) {
      const actual = vehicle[fields[key]];
      if (actual === null || actual === undefined) {
        mismatches.push({
          requirement: key,
          expected: wanted,
          actual: null,
          reason: 'unknown',
        });
        continue;
      }
      const ok =
        key === 'seats' || key === 'min_mpg' || key === 'min_year'
          ? Number(actual) >= Number(wanted)
          : key === 'max_price' || key === 'max_year' || key === 'max_mileage'
            ? Number(actual) <= Number(wanted)
            : actual === wanted;
      if (!ok)
        mismatches.push({
          requirement: key,
          expected: wanted,
          actual,
          reason: 'mismatch',
        });
    }
    const result = { ...vehicle, mismatches };
    (mismatches.length ? alternatives : exact).push(result);
  }
  alternatives.sort(
    (a, b) => (a.mismatches?.length ?? 0) - (b.mismatches?.length ?? 0),
  );
  return { exact_matches: exact, alternatives };
}
