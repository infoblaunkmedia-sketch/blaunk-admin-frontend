import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { CommissionConfig } from '../platform.types';
import { fetchCommission, saveCommission } from '../platform.service';
import { onNumericInputKeyDown } from '../../../shared/utils/numericInput';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const PORTAL_FIELDS: { key: keyof CommissionConfig; label: string }[] = [
  { key: 'tour', label: 'Tour' },
  { key: 'cake', label: 'Cake' },
  { key: 'store', label: 'Store' },
  { key: 'boutique', label: 'Boutique' },
  { key: 'bgt', label: 'BGT' },
  { key: 'hotel', label: 'Hotel' },
];

function displayPortalValue(config: CommissionConfig, key: keyof CommissionConfig): string {
  const n = config[key];
  return n > 0 ? String(n) : '';
}

export const Commission: React.FC = () => {
  const [config, setConfig] = React.useState<CommissionConfig>({
    tour: 0, cake: 0, store: 0, boutique: 0, bgt: 0, hotel: 0, gstRate: 0, bgtRate: 0,
  });
  const [editingPortal, setEditingPortal] = React.useState(false);
  const [editingRates, setEditingRates] = React.useState(false);
  const [savingPortal, setSavingPortal] = React.useState(false);
  const [savingRates, setSavingRates] = React.useState(false);

  React.useEffect(() => {
    fetchCommission().then((loaded) => {
      setConfig({
        tour: 0, cake: 0, store: 0, boutique: 0, bgt: 0, hotel: 0, gstRate: 0, bgtRate: 0,
        ...loaded,
      });
    });
  }, []);

  const set = <K extends keyof CommissionConfig>(k: K, v: string) =>
    setConfig((p) => ({ ...p, [k]: parseFloat(v) || 0 }));

  const handleSavePortal = async () => {
    setSavingPortal(true);
    try {
      await saveCommission(config);
      setEditingPortal(false);
      toast.success('Portal fee rates saved');
    } catch { toast.error('Save failed'); }
    finally { setSavingPortal(false); }
  };

  const handleSaveRates = async () => {
    setSavingRates(true);
    try {
      await saveCommission(config);
      setEditingRates(false);
      toast.success('Commission rates saved');
    } catch { toast.error('Save failed'); }
    finally { setSavingRates(false); }
  };

  const EditToggle: React.FC<{ editing: boolean; saving: boolean; onEdit: () => void; onSave: () => void; onCancel: () => void }> =
    ({ editing, saving, onEdit, onSave, onCancel }) =>
      editing ? (
        <div className="flex gap-2">
          <button type="button" disabled={saving} onClick={onSave}
            className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={onCancel}
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" onClick={onEdit}
          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          Edit
        </button>
      );

  return (
    <ErrorBoundary>
      <PageHeader title="Commission" subtitle="Configure portal fees and GST/BGT commission rates." />

      <SectionCard
        title="Portal Fee per Product Category"
        className="mb-5"
        actions={
          <EditToggle
            editing={editingPortal} saving={savingPortal}
            onEdit={() => setEditingPortal(true)}
            onSave={handleSavePortal}
            onCancel={() => { setEditingPortal(false); fetchCommission().then(setConfig); }}
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PORTAL_FIELDS.map(({ key, label }) => (
            <FormField key={key} label={label}>
              {editingPortal ? (
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  className={inputClass}
                  placeholder="Enter..."
                  value={displayPortalValue(config, key)}
                  onKeyDown={onNumericInputKeyDown}
                  onChange={(e) => set(key, e.target.value)}
                />
              ) : (
                <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                  {displayPortalValue(config, key) || '—'}
                </div>
              )}
            </FormField>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="GST / BGT Commission Rates"
        actions={
          <EditToggle
            editing={editingRates} saving={savingRates}
            onEdit={() => setEditingRates(true)}
            onSave={handleSaveRates}
            onCancel={() => { setEditingRates(false); fetchCommission().then(setConfig); }}
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="GST Rate (%)">
            {editingRates ? (
              <input type="number" min={0} max={100} step="0.01" className={inputClass}
                value={config.gstRate || ''} onKeyDown={onNumericInputKeyDown} onChange={(e) => set('gstRate', e.target.value)} />
            ) : (
              <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                {config.gstRate}%
              </div>
            )}
          </FormField>
          <FormField label="BGT Commission Rate (%)">
            {editingRates ? (
              <input type="number" min={0} max={100} step="0.01" className={inputClass}
                value={config.bgtRate || ''} onKeyDown={onNumericInputKeyDown} onChange={(e) => set('bgtRate', e.target.value)} />
            ) : (
              <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                {config.bgtRate}%
              </div>
            )}
          </FormField>
        </div>
      </SectionCard>
    </ErrorBoundary>
  );
};
