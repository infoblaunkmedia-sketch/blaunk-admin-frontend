const DEFAULT_AGENT_BASE =
  (import.meta.env.VITE_MAC_AGENT_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://127.0.0.1:9247';

/** Format MAC for display/storage (AA-BB-CC-DD-EE-FF). */
export function formatMacDisplay(raw: string): string {
  const hex = String(raw || '')
    .replace(/[^0-9a-f]/gi, '')
    .toUpperCase();
  if (hex.length !== 12 && hex.length !== 16) return String(raw || '').trim();
  return (hex.match(/.{1,2}/g) || []).join('-');
}

/**
 * Reads this PC's MAC via the local BLAUNK MAC agent (admin/mac-agent).
 * Browsers cannot access hardware MAC directly — the agent must be running on the machine.
 */
export async function getDeviceMacAddress(): Promise<string> {
  try {
    const res = await fetch(`${DEFAULT_AGENT_BASE}/mac`, {
      method: 'GET',
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return '';
    const data = (await res.json()) as { macAddress?: string };
    const mac = String(data.macAddress || '').trim();
    return mac ? formatMacDisplay(mac) : '';
  } catch {
    return '';
  }
}
