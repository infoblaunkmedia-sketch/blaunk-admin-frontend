import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { ModulePermission } from '../../../shared/types/auth.types';
import { PRESET_ROLES, type PresetRole, type PermissionsMap } from '../settings.types';
import {
  fetchEmployeeOptions,
  fetchRightsForEmployee,
  fetchUserAdminInfo,
  generateTempPassword,
  saveRightsForEmployee,
  setUserStatus,
  type EmployeeOption,
  type UserAdminInfo,
} from '../settings.service';
import { useAuthStore } from '../../../auth/authStore';

const ALL_MODULES: { key: ModulePermission; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'cms', label: 'CMS' },
  { key: 'people', label: 'People' },
  { key: 'channelPartners', label: 'Channel Partners' },
  { key: 'finance', label: 'Finance' },
  { key: 'platform', label: 'Platform' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'customers', label: 'Customers' },
  { key: 'reports', label: 'Reports' },
  { key: 'corporate', label: 'Corporate' },
  { key: 'settings', label: 'Settings' },
];

const ROLE_LABELS: Record<PresetRole, string> = {
  superAdmin: 'Super Admin',
  hrManager: 'HR Manager',
  financeManager: 'Finance Manager',
  operations: 'Operations',
};

const inputClass =
  'h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export const UserRights: React.FC = () => {
  const [kind, setKind] = React.useState<'employee' | '3pc'>('employee');
  const [employees, setEmployees] = React.useState<EmployeeOption[]>([]);
  const [selected, setSelected] = React.useState<string>('');
  const [permissionsMap, setPermissionsMap] = React.useState<PermissionsMap>({});
  const [userInfo, setUserInfo] = React.useState<UserAdminInfo | null>(null);
  const [pw, setPw] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = React.useState(false);
  const [loadingSelection, setLoadingSelection] = React.useState(false);
  const [statusSaving, setStatusSaving] = React.useState(false);
  const [pwSaving, setPwSaving] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<null | {
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'primary';
    run: () => Promise<void>;
  }>(null);
  const currentUser = useAuthStore((s) => s.user);
  const loginAction = useAuthStore((s) => s.login);
  const currentToken = useAuthStore((s) => s.token);

  React.useEffect(() => {
    setSelected('');
    setPermissionsMap({});
    setUserInfo(null);
    setPw(null);
    setLoadingOptions(true);
    fetchEmployeeOptions(kind)
      .then((list) => setEmployees(list))
      .catch(() => {
        setEmployees([]);
        toast.error(`Failed to load ${kind === 'employee' ? 'employees' : '3P credentials'}`);
      })
      .finally(() => setLoadingOptions(false));
  }, [kind]);

  const getPerms = (code: string): ModulePermission[] =>
    permissionsMap[code] ?? [];

  const toggle = (code: string, mod: ModulePermission) => {
    const current = getPerms(code);
    const next = current.includes(mod)
      ? current.filter((m) => m !== mod)
      : [...current, mod];
    setPermissionsMap((prev) => ({ ...prev, [code]: next }));
  };

  const applyPreset = (code: string, role: PresetRole) => {
    setPermissionsMap((prev) => ({ ...prev, [code]: [...PRESET_ROLES[role]] }));
  };

  const selectAll = (code: string, checked: boolean) => {
    setPermissionsMap((prev) => ({
      ...prev,
      [code]: checked ? ALL_MODULES.map((m) => m.key) : [],
    }));
  };

  const handleSave = async (code: string) => {
    setSaving(code);
    try {
      await saveRightsForEmployee(code, getPerms(code), kind);
      // If editing the currently logged-in user, update their live session
      if (currentUser && currentUser.code === code && currentToken) {
        loginAction(currentToken, { ...currentUser, permissions: getPerms(code) });
      }
      toast.success(`Permissions saved for ${code}`);
    } catch {
      toast.error('Failed to save permissions');
    } finally {
      setSaving(null);
    }
  };

  const runConfirmedAction = async () => {
    if (!confirmAction) return;
    try {
      await confirmAction.run();
      setConfirmAction(null);
    } catch {
      // handled by action-specific toasts
    }
  };

  const code = selected.trim().toUpperCase();
  const codes = code ? [code] : [];

  return (
    <ErrorBoundary>
      <PageHeader
        title="User Rights"
        subtitle="Assign module-level permissions per employee."
      />

      <SectionCard
        title={kind === 'employee' ? 'Employees' : '3P Credentials'}
        className="mb-5"
        actions={null}
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setKind('employee')}
              className={[
                'h-8 rounded-md px-3 text-xs font-bold transition',
                kind === 'employee' ? 'bg-primary text-white shadow-sm' : 'text-slate-700 hover:bg-white',
              ].join(' ')}
            >
              Employees
            </button>
            <button
              type="button"
              onClick={() => setKind('3pc')}
              className={[
                'h-8 rounded-md px-3 text-xs font-bold transition',
                kind === '3pc' ? 'bg-primary text-white shadow-sm' : 'text-slate-700 hover:bg-white',
              ].join(' ')}
            >
              3P Credentials
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {/* <label cAssign module-level permissions per employee. */}
            <select
              className={inputClass}
              value={selected}
              onChange={async (e) => {
                const selectedCode = e.target.value.trim().toUpperCase();
                setSelected(selectedCode);
                setUserInfo(null);
                setPw(null);
                if (!selectedCode) return;
                setLoadingSelection(true);
                try {
                  const sections = await fetchRightsForEmployee(selectedCode, kind);
                  setPermissionsMap((prev) => ({ ...prev, [selectedCode]: sections as ModulePermission[] }));
                  try {
                    const info = await fetchUserAdminInfo(selectedCode, kind);
                    setUserInfo(info);
                  } catch (err) {
                    const msg = err instanceof Error ? err.message.toLowerCase() : '';
                    if (!msg.includes('not found')) {
                      toast.error('Failed to load account access details.');
                    }
                  }
                } catch {
                  setPermissionsMap((prev) => ({ ...prev, [selectedCode]: [] }));
                  setUserInfo(null);
                  toast.error('Failed to load rights.');
                } finally {
                  setLoadingSelection(false);
                }
              }}
              disabled={loadingOptions}
            >
              <option value="">
                {kind === 'employee' ? 'Select employee…' : 'Select 3PC…'}
              </option>
              {employees.map((e2) => (
                <option key={e2.code} value={e2.code}>
                  {e2.code} — {e2.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      {codes.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {kind === 'employee' ? 'Select an employee to manage rights.' : 'Select a 3PC to manage rights.'}
        </p>
      ) : (
        <div className="space-y-5">
          <SectionCard
            title="Account access"
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Login status</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={statusSaving || loadingSelection || userInfo?.status === 'Active'}
                      onClick={() => {
                        if (!code) return;
                        setConfirmAction({
                          title: 'Enable Login',
                          message: `Enable login for ${code}?`,
                          confirmLabel: 'Enable',
                          variant: 'primary',
                          run: async () => {
                            setStatusSaving(true);
                            try {
                              await setUserStatus(code, kind, 'Active');
                              const nextInfo = await fetchUserAdminInfo(code, kind);
                              setUserInfo(nextInfo);
                              toast.success('Login enabled successfully.');
                            } catch (err) {
                              const msg = err instanceof Error ? err.message : 'Failed to enable login';
                              toast.error(msg);
                              throw err;
                            } finally {
                              setStatusSaving(false);
                            }
                          },
                        });
                      }}
                      className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Enable
                    </button>
                    <button
                      type="button"
                      disabled={statusSaving || loadingSelection || userInfo?.status === 'Disabled'}
                      onClick={() => {
                        if (!code) return;
                        setConfirmAction({
                          title: 'Disable Login',
                          message: `Disable login for ${code}?`,
                          confirmLabel: 'Disable',
                          variant: 'danger',
                          run: async () => {
                            setStatusSaving(true);
                            try {
                              await setUserStatus(code, kind, 'Disabled');
                              const nextInfo = await fetchUserAdminInfo(code, kind);
                              setUserInfo(nextInfo);
                              toast.success('Login disabled successfully.');
                            } catch (err) {
                              const msg = err instanceof Error ? err.message : 'Failed to disable login';
                              toast.error(msg);
                              throw err;
                            } finally {
                              setStatusSaving(false);
                            }
                          },
                        });
                      }}
                      className="h-9 rounded-lg border border-red-300 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      Disable
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Temporary password</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!code) return;
                      const isRegenerate = !!userInfo?.passwordIssuedAt;
                      setConfirmAction({
                        title: isRegenerate ? 'Regenerate Password' : 'Generate Temporary Password',
                        message: isRegenerate
                          ? `Regenerate temporary password for ${code}? The previous temporary password will stop working.`
                          : `Generate temporary password for ${code}?`,
                        confirmLabel: isRegenerate ? 'Regenerate' : 'Generate',
                        variant: 'primary',
                        run: async () => {
                          setPwSaving(true);
                          try {
                            const temp = await generateTempPassword(code, kind);
                            setPw(temp);
                            const nextInfo = await fetchUserAdminInfo(code, kind);
                            setUserInfo(nextInfo);
                            toast.success(isRegenerate ? 'Password regenerated successfully.' : 'Temporary password generated successfully.');
                          } catch (err) {
                            const msg = err instanceof Error ? err.message : 'Failed to generate password';
                            toast.error(msg);
                            throw err;
                          } finally {
                            setPwSaving(false);
                          }
                        },
                      });
                    }}
                    className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                    disabled={pwSaving || loadingSelection}
                  >
                    {pwSaving ? 'Generating…' : userInfo?.passwordIssuedAt ? 'Regenerate Password' : 'Generate Password'}
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                {userInfo?.passwordIssuedAt ? (
                  <p>
                    Issued: {new Date(userInfo.passwordIssuedAt).toLocaleString()}
                    {userInfo.passwordIssuedBy ? ` by ${userInfo.passwordIssuedBy}` : ''}
                  </p>
                ) : (
                  <p>No password issued yet.</p>
                )}
              </div>
            </div>

            {pw ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold text-amber-900">
                  Copy this password now. For security, it won’t be shown again unless you regenerate it.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <code className="rounded bg-white px-3 py-2 font-mono text-sm text-slate-900">
                    {pw}
                  </code>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(pw);
                        toast.success('Copied');
                      } catch {
                        toast.error('Copy failed');
                      }
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => setPw(null)}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Hide
                  </button>
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Rights">
            {codes.map((code) => {
              const perms = getPerms(code);
              const allChecked = perms.length === ALL_MODULES.length;
              return (
                <div key={code} className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <p className="font-bold text-primary">
                      {code} — {(employees.find((x) => x.code === code)?.name ?? '')}
                    </p>
                    {currentUser?.code === code && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        You
                      </span>
                    )}
                  </div>
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <select
                      className="h-8 rounded border border-slate-300 px-2 text-xs"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) applyPreset(code, e.target.value as PresetRole);
                      }}
                    >
                      <option value="">Apply preset…</option>
                      {(Object.keys(ROLE_LABELS) as PresetRole[]).map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(e) => selectAll(code, e.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                      Select all rights
                    </label>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {ALL_MODULES.map((m) => (
                      <label key={m.key} className="inline-flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={perms.includes(m.key)}
                          onChange={() => toggle(code, m.key)}
                          className="h-4 w-4 accent-primary"
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={saving === code}
                      onClick={() => handleSave(code)}
                      className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
                    >
                      {saving === code ? 'Saving…' : 'Save Rights'}
                    </button>
                  </div>
                </div>
              );
            })}
          </SectionCard>
        </div>
      )}
      {confirmAction ? (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          variant={confirmAction.variant}
          loading={statusSaving || pwSaving}
          onConfirm={runConfirmedAction}
          onCancel={() => setConfirmAction(null)}
        />
      ) : null}
    </ErrorBoundary>
  );
};
