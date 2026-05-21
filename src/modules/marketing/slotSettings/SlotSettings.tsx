import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { MediaSlotTabConfig } from '../marketing.types';
import { onIntegerInputKeyDown } from '../../../shared/utils/numericInput';
import { fetchMediaSlotConfigs, saveMediaSlotConfigs } from '../marketing.service';

const inputClass =
  'h-9 w-full max-w-[120px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-right outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export const SlotSettings: React.FC = () => {
  const [rows, setRows] = React.useState<MediaSlotTabConfig[]>([]);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const configs = await fetchMediaSlotConfigs();
      setRows(configs);
    } catch {
      toast.error('Failed to load slot settings');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateRow = (idx: number, maxSlots: string) => {
    const n = parseInt(maxSlots, 10);
    setRows((r) =>
      r.map((row, i) => (i === idx ? { ...row, maxSlots: Number.isFinite(n) ? n : row.maxSlots } : row)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveMediaSlotConfigs(rows);
      setRows(saved);
      setEditing(false);
      toast.success('Slot limits saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ErrorBoundary>
      <PageHeader
        title="Slot Settings"
        subtitle="Set the maximum number of live ad slots per media tab. Limits apply per section and country in Media Ads."
      />

      <SectionCard
        title="Max slots by media tab"
        actions={
          editing ? (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  void refresh();
                }}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Edit
            </button>
          )
        }
      >
        {loading ? (
          <p className="text-sm text-slate-600">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-4 py-2.5 text-left font-bold">Media tab</th>
                  <th className="px-4 py-2.5 text-right font-bold">Max slots</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.mediaTab} className={i % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                    <td className="border-b border-slate-100 px-4 py-2.5 font-bold text-primary">{row.mediaTab}</td>
                    <td className="border-b border-slate-100 px-4 py-2 text-right">
                      {editing ? (
                        <input
                          type="number"
                          min={1}
                          max={500}
                          className={inputClass}
                          value={row.maxSlots}
                          onKeyDown={onIntegerInputKeyDown}
                          onChange={(e) => updateRow(i, e.target.value)}
                        />
                      ) : (
                        row.maxSlots
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </ErrorBoundary>
  );
};
