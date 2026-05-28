export type CountryOption = {
  name: string;
  iso2: string;
};

const COUNTRY_OPTIONS: CountryOption[] = [
  { name: 'India', iso2: 'IN' },
  { name: 'Bahrain', iso2: 'BH' },
  { name: 'Bangladesh', iso2: 'BD' },
  { name: 'Bhutan', iso2: 'BT' },
  { name: 'Indonesia', iso2: 'ID' },
  { name: 'Jordan', iso2: 'JO' },
  { name: 'Malaysia', iso2: 'MY' },
  { name: 'Maldives', iso2: 'MV' },
  { name: 'Nepal', iso2: 'NP' },
  { name: 'Philippines', iso2: 'PH' },
  { name: 'Singapore', iso2: 'SG' },
  { name: 'Sri Lanka', iso2: 'LK' },
  { name: 'Thailand', iso2: 'TH' },
  { name: 'UAE-Dubai', iso2: 'AE' },
  { name: 'Vietnam', iso2: 'VN' },
  { name: 'Qatar', iso2: 'QA' },
];

export function fetchCountries(): Promise<CountryOption[]> {
  return Promise.resolve(COUNTRY_OPTIONS);
}

/** Map legacy 2-letter codes stored in DB to display names when possible. */
export function countryNameFromCode(
  code: string,
  countries: CountryOption[],
): string | undefined {
  const normalized = String(code || '').trim().toUpperCase();
  if (normalized.length !== 2) return undefined;
  return countries.find((c) => c.iso2 === normalized)?.name;
}
