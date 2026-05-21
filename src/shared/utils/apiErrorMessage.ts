/**
 * Turn API error bodies into a single user-facing string.
 * Handles JSON `{ "message": "..." }` / `{ "error": "..." }` and plain text.
 */
export function parseApiErrorBody(text: string, status = 0): string {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) {
    return status ? `Something went wrong (${status}). Please try again.` : 'Something went wrong. Please try again.';
  }
  try {
    const parsed = JSON.parse(trimmed) as { message?: unknown; error?: unknown };
    const msg = parsed.message;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
    const err = parsed.error;
    if (typeof err === 'string' && err.trim()) return err.trim();
  } catch {
    /* not JSON */
  }
  return trimmed;
}
