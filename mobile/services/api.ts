import type { Filters, MatchResults } from '../types/vehicle';
const base =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';
export async function searchVehicles(filters: Filters): Promise<MatchResults> {
  const response = await fetch(base + '/vehicles/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });
  if (!response.ok)
    throw new Error('Vehicle search failed (' + response.status + ')');
  return response.json() as Promise<MatchResults>;
}
