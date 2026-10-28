import { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  Pressable,
  View,
  StyleSheet,
} from 'react-native';
import { matchVehicles } from '../services/matching';
import type { Filters, MatchResults, Vehicle } from '../types/vehicle';
import { searchVehicles } from '../services/api';
const vehicles: Vehicle[] = [
  {
    id: 1,
    make: 'Toyota',
    model: 'Camry Hybrid',
    year: 2024,
    body_style: 'Sedan',
    powertrain: 'Hybrid',
    engine: 'I4',
    drivetrain: 'FWD',
    transmission: 'Automatic',
    seats: 5,
    doors: 4,
    combined_mpg: 51,
    msrp: 28900,
    mileage: 0,
  },
  {
    id: 2,
    make: 'Honda',
    model: 'CR-V Hybrid',
    year: 2023,
    body_style: 'SUV',
    powertrain: 'Hybrid',
    engine: 'I4',
    drivetrain: 'AWD',
    transmission: 'Automatic',
    seats: 5,
    doors: 4,
    combined_mpg: 37,
    msrp: 33350,
    mileage: 10000,
  },
  {
    id: 3,
    make: 'Ford',
    model: 'Mustang GT',
    year: 2022,
    body_style: 'Coupe',
    powertrain: 'Gasoline',
    engine: 'V8',
    drivetrain: 'RWD',
    transmission: 'Manual',
    seats: 4,
    doors: 2,
    combined_mpg: 19,
    msrp: 39900,
    mileage: 18000,
  },
];
const choices: Record<string, string[]> = {
  body_style: [
    'Any',
    'Sedan',
    'SUV',
    'Truck',
    'Coupe',
    'Hatchback',
    'Wagon',
    'Van',
  ],
  powertrain: ['Any', 'Gasoline', 'Diesel', 'Hybrid', 'PHEV', 'EV'],
  engine: ['Any', 'I3', 'I4', 'I6', 'V6', 'V8'],
  drivetrain: ['Any', 'FWD', 'RWD', 'AWD', '4WD'],
  transmission: ['Any', 'Automatic', 'Manual'],
};
export default function Home() {
  const [filters, setFilters] = useState<Filters>({});
  const [searched, setSearched] = useState(false);
  const [remote, setRemote] = useState<MatchResults | null>(null);
  const result = useMemo(() => matchVehicles(vehicles, filters), [filters]);
  useEffect(() => {
    if (!searched) {
      setRemote(null);
      return;
    }
    let active = true;
    setRemote(null);
    searchVehicles(filters)
      .then((results) => {
        if (active) setRemote(results);
      })
      .catch(() => {
        if (active) setRemote(null);
      });
    return () => {
      active = false;
    };
  }, [filters, searched]);
  const shown = remote ?? result;
  const set = (k: keyof Filters, v: string) =>
    setFilters((old) => ({ ...old, [k]: v === 'Any' ? undefined : v }));
  const numeric = (k: keyof Filters, label: string) => (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType="number-pad"
        placeholder="Any"
        style={s.input}
        onChangeText={(v) =>
          setFilters((old) => ({ ...old, [k]: v ? Number(v) : undefined }))
        }
      />
    </View>
  );
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.title}>Find your next car</Text>
      <Text style={s.sub}>
        Choose what matters. We’ll show exact matches first.
      </Text>
      {Object.entries(choices).map(([key, vals]) => (
        <View style={s.field} key={key}>
          <Text style={s.label}>{key.replace('_', ' ')}</Text>
          <ScrollView horizontal>
            {vals.map((v) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={key + ' ' + v}
                key={v}
                style={[
                  s.chip,
                  ((filters as Record<string, unknown>)[key] ?? 'Any') === v &&
                    s.active,
                ]}
                onPress={() => set(key as keyof Filters, v)}
              >
                <Text>{v}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ))}
      {numeric('seats', 'Minimum seats')}
      {numeric('doors', 'Doors')}
      {numeric('min_mpg', 'Minimum combined MPG')}
      {numeric('max_price', 'Maximum price ($)')}
      {numeric('min_year', 'Model year from')}
      {numeric('max_year', 'Model year to')}
      {numeric('max_mileage', 'Maximum mileage')}
      <Pressable style={s.button} onPress={() => setSearched(true)}>
        <Text style={s.buttonText}>Find My Car</Text>
      </Pressable>
      {searched && (
        <>
          <Results title="Exact matches" items={shown.exact_matches} />
          <Results title="Close alternatives" items={shown.alternatives} />
        </>
      )}
    </ScrollView>
  );
}
function Results({ title, items }: { title: string; items: Vehicle[] }) {
  return (
    <View>
      <Text style={s.section}>
        {title} ({items.length})
      </Text>
      {items.length === 0 ? (
        <Text style={s.sub}>No vehicles here.</Text>
      ) : (
        items.map((v) => (
          <View style={s.card} key={v.id}>
            <Text style={s.car}>
              {v.year} {v.make} {v.model}
            </Text>
            <Text>
              {v.body_style ?? 'Body unknown'} ·{' '}
              {v.powertrain ?? 'Powertrain unknown'} ·{' '}
              {v.combined_mpg ?? 'MPG unknown'} MPG
            </Text>
            <Text>
              {v.mismatches
                ?.map((m) =>
                  m.reason === 'unknown'
                    ? m.requirement + ': data unavailable'
                    : m.requirement +
                      ': expected ' +
                      m.expected +
                      ', got ' +
                      m.actual,
                )
                .join(' · ')}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
const s = StyleSheet.create({
  page: { padding: 20, gap: 12, backgroundColor: '#f6f7f9' },
  title: { fontSize: 28, fontWeight: '700' },
  sub: { color: '#5b6470' },
  field: { marginVertical: 5, gap: 6 },
  label: { fontWeight: '600', textTransform: 'capitalize' },
  chip: {
    borderWidth: 1,
    borderColor: '#aab2bd',
    padding: 9,
    borderRadius: 18,
    marginRight: 7,
    backgroundColor: 'white',
  },
  active: { backgroundColor: '#cfe7ff', borderColor: '#1466a8' },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccd2da',
  },
  button: {
    backgroundColor: '#123e61',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '700' },
  section: { fontSize: 20, fontWeight: '700', marginTop: 15 },
  card: {
    padding: 14,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 5,
    gap: 5,
  },
  car: { fontWeight: '700', fontSize: 17 },
});
