import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { CaptchaEntry } from '../settings.types';
import { fetchCaptchaEntries, saveCaptchaEntry } from '../settings.service';
import { useAuthStore } from '../../../auth/authStore';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export const Security: React.FC = () => {
  const [captchaEntries, setCaptchaEntries] = React.useState<CaptchaEntry[]>([]);
  const [editing, setEditing] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);

  React.useEffect(() => {
    fetchCaptchaEntries().then(setCaptchaEntries);
  }, []);

  const handleEdit = (mod: string, val: string) => {
    setEditing((prev) => ({ ...prev, [mod]: val }));
  };

  const handleSave = async (entry: CaptchaEntry) => {
    setSaving(entry.module);
    try {
      const updated: CaptchaEntry = {
        ...entry,
        code: editing[entry.module] ?? entry.code,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.code ?? 'system',
      };
      await saveCaptchaEntry(updated);
      setCaptchaEntries((prev) =>
        prev.map((e) => (e.module === entry.module ? updated : e)),
      );
      setEditing((prev) => {
        const next = { ...prev };
        delete next[entry.module];
        return next;
      });
      toast.success(`Captcha updated for "${entry.module}"`);
    } catch {
      toast.error('Failed to save captcha');
    } finally {
      setSaving(null);
    }
  };

  return (
    <ErrorBoundary>
      <PageHeader title="Security" subtitle="Manage captcha codes and access passcodes." />

      <SectionCard title="Captcha Management" className="mb-5">
        <p className="mb-4 text-xs text-slate-500">
          The login screen reads the captcha code from this table. Leave blank to disable captcha for a module.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                {['Module', 'Captcha Code', 'Last Updated', 'Updated By', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {captchaEntries.map((entry, i) => {
                const currentVal = editing[entry.module] ?? entry.code;
                return (
                  <tr key={entry.module} className={i % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                    <td className="border-b border-slate-100 px-4 py-2.5 font-semibold text-slate-800">
                      {entry.module}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-2">
                      <input
                        className={inputClass}
                        value={currentVal}
                        onChange={(e) => handleEdit(entry.module, e.target.value)}
                        placeholder="Enter captcha code"
                      />
                    </td>
                    <td className="border-b border-slate-100 px-4 py-2.5 text-xs text-slate-500">
                      {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : '—'}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-2.5 text-xs text-slate-500">
                      {entry.updatedBy || '—'}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-2">
                      <button
                        type="button"
                        disabled={saving === entry.module}
                        onClick={() => handleSave(entry)}
                        className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-60"
                      >
                        {saving === entry.module ? '…' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Passcode Management">
        <p className="mb-4 text-xs text-slate-500">
          Access passcodes for sensitive operations. These must be entered before performing the protected action.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {['Delete Record', 'Approve Payout', 'Export MIS'].map((op) => (
            <div key={op} className="flex flex-col gap-1.5 rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{op}</p>
              <input
                type="password"
                className={inputClass}
                placeholder="Set passcode"
              />
              <button
                type="button"
                className="mt-1 h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-dark"
              >
                Update
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </ErrorBoundary>
  );
};
