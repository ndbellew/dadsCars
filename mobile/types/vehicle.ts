export type Filters = {
  body_style?: string;
  powertrain?: string;
  engine?: string;
  drivetrain?: string;
  transmission?: string;
  seats?: number;
  doors?: number;
  min_mpg?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  max_mileage?: number;
};
export type Vehicle = {
  id: number;
  make: string;
  model: string;
  year: number;
  body_style?: string | null;
  powertrain?: string | null;
  engine?: string | null;
  drivetrain?: string | null;
  transmission?: string | null;
  seats?: number | null;
  doors?: number | null;
  combined_mpg?: number | null;
  msrp?: number | null;
  mileage?: number | null;
  mismatches?: {
    requirement: string;
    expected: unknown;
    actual: unknown;
    reason: string;
  }[];
};
export type MatchResults = {
  exact_matches: Vehicle[];
  alternatives: Vehicle[];
};
