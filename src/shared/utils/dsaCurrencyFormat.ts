import { findCountryByCurrency, type CountryRecord } from '../services/countries.service';

function normalizeCurrencyCode(currency: string): string {
  const c = String(currency || '').trim();
  if (c === '$' || c.toUpperCase() === 'USD') return 'USD';
  if (c === 'Rs.' || c === 'Rs' || c.toUpperCase() === 'INR') return 'INR';
  return c.toUpperCase();
}

/** Format pay-in by currency code (INR, AED, etc.) with optional country metadata. */
export function formatDsaPayinAmount(
  amount: number | string,
  currency: string,
  countries?: CountryRecord[],
): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  const formatted = n.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const code = normalizeCurrencyCode(currency);
  if (countries?.length) {
    const row = findCountryByCurrency(countries, code);
    if (row?.icon?.trim()) return `${row.icon.trim()}${formatted}`;
  }
  if (code === 'USD') return `$${formatted}`;
  if (code === 'INR') return `₹${formatted}`;
  if (code) return `${code} ${formatted}`;
  return formatted;
}

/** INR fields (Currency-INR, Limit, Available Balance). */
export function formatInrAmount(amount: number | string): string {
  const raw = String(amount ?? '').trim();
  if (!raw) return '';
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return `₹${n.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function normalizeStoredCurrency(currency: string): string {
  return normalizeCurrencyCode(currency);
}
