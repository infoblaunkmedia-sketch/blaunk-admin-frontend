/** Format ISO date (YYYY-MM-DD) or datetime string as dd/mm/yyyy. */
export function formatDateDDMMYYYY(iso: string): string {
  const s = String(iso || '').trim();
  if (!s) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  return s;
}

/** Auto-insert slashes while typing dd/mm/yyyy (digits only, max 8). */
export function sanitizeDDMMYYYY(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function isValidDDMMYYYY(raw: string): boolean {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(raw || '').trim());
  if (!m) return false;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return false;
  const d = new Date(yyyy, mm - 1, dd);
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
}

/** Normalize stored issuance/insurance date for dd/mm/yyyy display. */
export function toDisplayDDMMYYYY(raw: string): string {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  return formatDateDDMMYYYY(s) || s;
}

/** Format datetime as dd/mm/yyyy HH:mm (24h). */
export function formatDateTimeDDMMYYYY(iso: string): string {
  const s = String(iso || '').trim();
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return formatDateDDMMYYYY(s);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

/** Shorthand for table/detail display. */
export const formatDisplayDate = formatDateDDMMYYYY;

/** Normalize stored date for HTML `type="date"` (YYYY-MM-DD). */
export function toDateInputValue(raw: string): string {
  const s = String(raw || '').trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dm = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (dm) return `${dm[3]}-${dm[2]}-${dm[1]}`;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
  return '';
}
