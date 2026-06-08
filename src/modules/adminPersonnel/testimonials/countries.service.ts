import { fetchActiveCountries } from '../../../shared/services/countries.service';

export type CountryOption = {
  name: string;
  iso2: string;
};

export async function fetchCountries(): Promise<CountryOption[]> {
  const rows = await fetchActiveCountries();
  return rows.map((r) => ({
    name: r.country,
    iso2: r.currencyCode,
  }));
}

/** Map legacy 2-letter codes stored in DB to display names when possible. */
export function countryNameFromCode(
  code: string,
  countries: CountryOption[],
): string | undefined {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) return undefined;
  const byCurrency = countries.find((c) => c.iso2.toUpperCase() === normalized);
  if (byCurrency) return byCurrency.name;
  if (normalized.length !== 2) return undefined;
  return countries.find((c) => c.iso2.slice(0, 2) === normalized)?.name;
}
