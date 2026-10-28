import { expect, test } from '@jest/globals';
import { matchVehicles } from '../services/matching';
import type { Vehicle } from '../types/vehicle';
const car: Vehicle = {
  id: 1,
  make: 'A',
  model: 'B',
  year: 2020,
  body_style: 'SUV',
  seats: 5,
};
test('empty filters match all and exact filter separates alternatives', () => {
  expect(matchVehicles([car], {}).exact_matches).toHaveLength(1);
  const r = matchVehicles([car], { body_style: 'Sedan' });
  expect(r.alternatives[0].mismatches?.[0].reason).toBe('mismatch');
});
test('unknown fields and no vehicles are explicit', () => {
  expect(
    matchVehicles([{ ...car, body_style: null }], { body_style: 'SUV' })
      .alternatives[0].mismatches?.[0].reason,
  ).toBe('unknown');
  expect(matchVehicles([], { seats: 2 }).exact_matches).toEqual([]);
});
test('alternatives are ordered by mismatch count and selected filters are evaluated', () => {
  const out = matchVehicles(
    [
      { ...car, body_style: 'Sedan', seats: 5 },
      { ...car, body_style: 'Sedan', seats: 2 },
    ],
    { body_style: 'SUV', seats: 5 },
  );
  expect(out.alternatives[0].mismatches).toHaveLength(1);
  expect(out.alternatives[1].mismatches).toHaveLength(2);
});
