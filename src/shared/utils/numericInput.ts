import type { KeyboardEvent } from 'react';

export type NumericInputKeyOptions = {
  /** Allow a single decimal point (default true). Use false for integers, quantities, mobile, etc. */
  allowDecimal?: boolean;
};

const NAV_KEYS = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'Escape',
  'Enter',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]);

/**
 * Blocks alphabetic keys and scientific-notation keys (e, E, +) on numeric fields.
 * Use on <input type="number"> or text inputs with inputMode numeric/decimal.
 */
export function onNumericInputKeyDown(
  e: KeyboardEvent<HTMLInputElement>,
  opts: NumericInputKeyOptions = {},
): void {
  const allowDecimal = opts.allowDecimal !== false;

  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (NAV_KEYS.has(e.key)) return;

  if (/^[0-9]$/.test(e.key)) return;

  if (allowDecimal && e.key === '.') {
    const el = e.currentTarget;
    const v = el.value;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const merged = `${v.slice(0, start)}.${v.slice(end)}`;
    if ((merged.match(/\./g) || []).length > 1) e.preventDefault();
    return;
  }

  if (e.key.length === 1) {
    e.preventDefault();
  }
}

/** Whole numbers only (no decimal point). */
export function onIntegerInputKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
  onNumericInputKeyDown(e, { allowDecimal: false });
}
