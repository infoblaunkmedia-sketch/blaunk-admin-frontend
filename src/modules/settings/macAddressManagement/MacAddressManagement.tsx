import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { DataTableWrapper, LIST_FILTER_FIELD_CLASS } from '../../../shared/components/DataTableWrapper';
import { RowActionsMenu } from '../../../shared/components/RowActionsMenu';
import { useAuthStore } from '../../../auth/authStore';
import { fetchEmployees } from '../../people/people.service';
import { fetchThirdPartyCredentials } from '../../people/thirdPartyCredentials/thirdPartyCredentials.service';
import {
  createMacDevice,
  deleteMacDevice,
  fetchMacDevices,
  patchMacDevice,
  type MacDeviceEntry,
} from './macDevice.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const SYSTEM_OPTIONS = ['Desktop', 'Laptop', 'Ipad', 'IPhone', 'Mac Book', 'Android'] as const;

type SubjectTab = 'employee' | '3pc';
type SubjectOption = { code: string; name: string };

type MacFormState = {
  macAddress: string;
  computerBrand: string;
  systemType: (typeof SYSTEM_OPTIONS)[number] | '';
};

const emptyForm = (): MacFormState => ({
  macAddress: '',
  computerBrand: '',
  systemType: '',
});

export const MacAddressManagement: React.FC = () => {
  const currentUser = useAuthStore((s) => s.user);
  const [tab, setTab] = React.useState<SubjectTab>('employee');
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([]);
  const [selectedCode, setSelectedCode] = React.useState('');
  const [entries, setEntries] = React.useState<MacDeviceEntry[]>([]);
  const [form, setForm] = React.useState(emptyForm());
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [loadingSubjects, setLoadingSubjects] = React.useState(true);
  const [loadingEntries, setLoadingEntries] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSubjects(true);
      try {
        if (tab === 'employee') {
          const rows = await fetchEmployees();
          if (!cancelled) {
            setSubjects(
              rows
                .filter((e) => e.employeeCode)
                .map((e) => ({
                  code: e.employeeCode,
                  name: e.fullName || e.employeeCode,
                }))
                .sort((a, b) => a.code.localeCompare(b.code)),
            );
          }
        } else {
          const rows = await fetchThirdPartyCredentials();
          if (!cancelled) {
            setSubjects(
              rows
                .filter((r) => r.threePEmplCode)
                .map((r) => ({
                  code: r.threePEmplCode,
                  name: r.name || r.threePEmplCode,
                }))
                .sort((a, b) => a.code.localeCompare(b.code)),
            );
          }
        }
      } catch (e) {
        if (!cancelled) {
          setSubjects([]);
          toast.error(e instanceof Error ? e.message : 'Failed to load subjects');
        }
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  React.useEffect(() => {
    if (!subjects.length) {
      setSelectedCode('');
      return;
    }
    setSelectedCode((prev) => (prev && subjects.some((s) => s.code === prev) ? prev : subjects[0].code));
  }, [subjects]);

  const reloadEntries = React.useCallback(async () => {
    if (!selectedCode) {
      setEntries([]);
      return;
    }
    setLoadingEntries(true);
    try {
      const rows = await fetchMacDevices({ linkedType: tab, linkedCode: selectedCode });
      setEntries(rows);
    } catch (e) {
      setEntries([]);
      toast.error(e instanceof Error ? e.message : 'Failed to load MAC devices');
    } finally {
      setLoadingEntries(false);
    }
  }, [tab, selectedCode]);

  React.useEffect(() => {
    void reloadEntries();
  }, [reloadEntries]);

  const selectedName = subjects.find((s) => s.code === selectedCode)?.name || '';

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm());
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (entry: MacDeviceEntry) => {
    setEditId(entry.id);
    setForm({
      macAddress: entry.macAddress,
      computerBrand: entry.computerBrand,
      systemType: (entry.systemType as MacFormState['systemType']) || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.macAddress.trim()) {
      toast.error('MAC address is required');
      return;
    }
    if (!selectedCode && !editId) {
      toast.error('Select an employee or 3P credential first');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await patchMacDevice(editId, {
          macAddress: form.macAddress.trim(),
          computerBrand: form.computerBrand.trim(),
          systemType: form.systemType,
        });
        toast.success('MAC address updated');
      } else {
        await createMacDevice({
          macAddress: form.macAddress.trim(),
          computerBrand: form.computerBrand.trim(),
          systemType: form.systemType,
          linkedType: tab,
          linkedCode: selectedCode,
          linkedName: selectedName,
          status: 'Active',
        });
        toast.success('MAC address saved');
      }
      closeForm();
      await reloadEntries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save MAC address');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (entry: MacDeviceEntry) => {
    const next: MacDeviceEntry['status'] = entry.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await patchMacDevice(entry.id, { status: next });
      await reloadEntries();
      toast.success(next === 'Active' ? 'MAC enabled' : 'MAC disabled');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMacDevice(confirmDelete);
      setConfirmDelete(null);
      await reloadEntries();
      toast.success('MAC removed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const columns: TableColumn<MacDeviceEntry>[] = [
    {
      name: 'MAC Address',
      selector: (r) => r.macAddress,
      sortable: true,
      grow: 2,
      cell: (r) => <span className="font-mono text-sm font-semibold text-slate-900">{r.macAddress}</span>,
    },
    {
      name: 'Brand',
      selector: (r) => r.computerBrand,
      sortable: true,
      grow: 1,
      format: (r) => r.computerBrand || '—',
    },
    {
      name: 'System',
      selector: (r) => r.systemType,
      sortable: true,
      width: '110px',
      format: (r) => r.systemType || '—',
    },
    {
      name: 'Status',
      cell: (r) => <StatusBadge status={r.status} />,
      width: '95px',
    },
    {
      name: 'Actions',
      cell: (r) => (
        <RowActionsMenu
          onEdit={() => openEdit(r)}
          onToggle={() => toggleStatus(r)}
          toggleLabel={r.status === 'Active' ? 'Disable' : 'Enable'}
          onDelete={() => setConfirmDelete(r.id)}
        />
      ),
      width: '100px',
      ignoreRowClick: true,
    },
    {
      name: 'Approved',
      selector: (r) => r.approvedBy,
      width: '100px',
      format: (r) => r.approvedBy || currentUser?.code || '—',
    },
  ];

  const subjectToolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-white p-0.5">
        {(
          [
            { key: 'employee' as const, label: 'Employees' },
            { key: '3pc' as const, label: '3P Credentials' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              tab === t.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <select
        className={`${LIST_FILTER_FIELD_CLASS} w-52 shrink-0 sm:w-56`}
        value={selectedCode}
        disabled={loadingSubjects || !subjects.length}
        aria-label="Employee or 3P credential"
        onChange={(e) => setSelectedCode(e.target.value)}
      >
        {loadingSubjects ? <option value="">Loading…</option> : null}
        {!loadingSubjects && !subjects.length ? <option value="">No records</option> : null}
        {subjects.map((s) => (
          <option key={s.code} value={s.code}>
            {s.code} — {s.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <ErrorBoundary>
      <PageHeader
        title="MAC Address"
        subtitle="Register and approve device MAC addresses for employees and 3P credentials."
        toolbarLeft={subjectToolbar}
        actions={[{ label: '+ Add', onClick: openAdd }]}
      />

      {showForm ? (
        <SectionCard title={editId ? 'Edit MAC Address' : 'Add MAC Address'} className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="MAC Address" required>
              <input
                className={inputClass}
                placeholder="enter MAC address"
                value={form.macAddress}
                onChange={(e) => setForm((f) => ({ ...f, macAddress: e.target.value }))}
              />
            </FormField>
            <FormField label="Computer Brand Name">
              <input
                className={inputClass}
                placeholder="Brand name"
                value={form.computerBrand}
                onChange={(e) => setForm((f) => ({ ...f, computerBrand: e.target.value }))}
              />
            </FormField>
            <FormField label="System">
              <select
                className={inputClass}
                value={form.systemType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    systemType: e.target.value as MacFormState['systemType'],
                  }))
                }
              >
                <option value="">Select…</option>
                {SYSTEM_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (!editId && !selectedCode)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? 'Saving…' : editId ? 'Update MAC' : 'Save MAC'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </SectionCard>
      ) : null}

      <DataTableWrapper
        columns={columns}
        data={entries}
        loading={loadingEntries}
        searchable={false}
      />

      {confirmDelete ? (
        <ConfirmDialog
          title="Remove MAC Address"
          message="Are you sure you want to remove this MAC address?"
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      ) : null}
    </ErrorBoundary>
  );
};
