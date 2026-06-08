import { api } from './apiService';

export type CountryRecord = {
  id: string;
  country: string;
  currencyCode: string;
  currencyName: string;
  icon: string;
  rateToInr?: number;
  isActive: boolean;
  sortOrder?: number;
};

export type CountryInput = {
  country: string;
  currencyCode: string;
  currencyName: string;
  icon?: string;
  isActive?: boolean;
};

let cache: CountryRecord[] | null = null;
let cacheAll: CountryRecord[] | null = null;

export async function fetchActiveCountries(): Promise<CountryRecord[]> {
  if (cache) return cache;
  const res = await api.get<{ records: CountryRecord[] }>('/api/countries');
  cache = res.records || [];
  return cache;
}

export async function fetchAllCountries(): Promise<CountryRecord[]> {
  if (cacheAll) return cacheAll;
  const res = await api.get<{ records: CountryRecord[] }>('/api/countries?all=1');
  cacheAll = res.records || [];
  return cacheAll;
}

export function clearCountriesCache(): void {
  cache = null;
  cacheAll = null;
}

export async function createCountry(payload: CountryInput): Promise<CountryRecord> {
  const res = await api.post<{ record: CountryRecord }>('/api/countries', payload);
  clearCountriesCache();
  return res.record;
}

export async function updateCountry(
  id: string,
  payload: Partial<CountryInput>,
): Promise<CountryRecord> {
  const res = await api.patch<{ record: CountryRecord }>(`/api/countries/${encodeURIComponent(id)}`, payload);
  clearCountriesCache();
  return res.record;
}

export async function deleteCountry(id: string): Promise<void> {
  await api.delete(`/api/countries/${encodeURIComponent(id)}`);
  clearCountriesCache();
}

export function countryNamesFrom(records: CountryRecord[]): string[] {
  return records.filter((r) => r.isActive).map((r) => r.country);
}

export function findCountryByCurrency(
  records: CountryRecord[],
  currencyCode: string,
): CountryRecord | undefined {
  const code = String(currencyCode || '').trim().toUpperCase();
  return records.find((r) => r.currencyCode.toUpperCase() === code);
}

export function formatCurrencyAmount(
  amount: number | string,
  currencyCode: string,
  records: CountryRecord[],
): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  const formatted = n.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const row = findCountryByCurrency(records, currencyCode);
  const icon = row?.icon?.trim();
  if (icon) return `${icon}${formatted}`;
  const code = String(currencyCode || '').trim().toUpperCase();
  if (code) return `${code} ${formatted}`;
  return formatted;
}
