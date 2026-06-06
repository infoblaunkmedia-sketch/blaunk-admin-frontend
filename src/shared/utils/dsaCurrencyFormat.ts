/** Format pay-in by DSA-selected currency (Rs. / $ or INR / USD). */
export function formatDsaPayinAmount(
  amount: number | string,
  currency: string,
): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  const formatted = n.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const c = String(currency || '').trim();
  if (c === '$' || c.toUpperCase() === 'USD') return `$${formatted}`;
  if (c === 'Rs.' || c.toUpperCase() === 'INR') return `₹${formatted}`;
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
