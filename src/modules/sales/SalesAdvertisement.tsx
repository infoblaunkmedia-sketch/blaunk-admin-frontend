import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionCard } from '../../shared/components/SectionCard';
import { EmptyState } from '../../shared/components/EmptyState';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { DataTableWrapper, ListTableSearchInput } from '../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../shared/components/StatusBadge';
import type { DsaSlider, SliderStatus } from '../marketing/marketing.types';
import { deleteDsaSlider, fetchDsaSliders } from '../marketing/marketing.service';
import {
  COUNTRIES,
  MEDIA_TABS,
  PLAN_MONTHS,
  SECTIONS,
  STATUSES,
  addMonths,
  toAbsoluteMediaUrl,
} from '../marketing/mediaAds/constants';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

function uploadSourceLabel(source?: string) {
  if (source === 'vendor_direct') return 'Vendor Direct';
  if (source === 'admin_3p') return 'Admin 3P DSA';
  return '—';
}

function getErrorMessage(error: unknown, fallback: string) {
  const raw = error instanceof Error ? error.message : '';
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as { message?: string };
    return parsed?.message || raw;
  } catch {
    return raw;
  }
}

export const SalesAdvertisement: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = React.useState<DsaSlider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tableSearch, setTableSearch] = React.useState('');
  const [mediaTabFilter, setMediaTabFilter] = React.useState('');
  const [sectionFilter, setSectionFilter] = React.useState('');
  const [countryFilter, setCountryFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<SliderStatus | ''>('');
  const [confirmDelete, setConfirmDelete] = React.useState<DsaSlider | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchDsaSliders(
        mediaTabFilter ? { mediaTab: mediaTabFilter } : undefined,
      );
      setRecords(list);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to load advertisements'));
    } finally {
      setLoading(false);
    }
  }, [mediaTabFilter]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = records.filter((r) => {
    if (sectionFilter && r.section !== sectionFilter) return false;
    if (countryFilter && r.country !== countryFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDsaSlider(confirmDelete.id);
      toast.success('Advertisement deleted');
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Delete failed'));
    }
  };

  const columns: TableColumn<DsaSlider>[] = [
    {
      name: 'Image',
      width: '88px',
      cell: (r) => (
        <img
          src={toAbsoluteMediaUrl(r.imageUrl)}
          alt={r.plan}
          className="h-12 w-16 rounded object-cover bg-slate-100"
        />
      ),
    },
    { name: 'Media Tab', selector: (r) => r.mediaTab || '-', sortable: true, grow: 1 },
    { name: 'Section', selector: (r) => r.section, sortable: true },
    { name: 'Country', selector: (r) => r.country, sortable: true },
    { name: 'Plan', selector: (r) => r.plan, sortable: true, grow: 1.2 },
    { name: 'DSA', selector: (r) => r.dsaCode || '-', sortable: true },
    {
      name: 'Upload Source',
      selector: (r) => uploadSourceLabel(r.uploadSource),
      sortable: true,
      width: '130px',
    },
    {
      name: 'DSA Code',
      selector: (r) => (r.uploadSource === 'admin_3p' ? r.uploadedByDsaCode || '' : ''),
      sortable: true,
      width: '110px',
    },
    { name: 'Category', selector: (r) => r.category || '-', sortable: true },
    { name: 'Match Code', selector: (r) => r.matchCode || '-', sortable: true },
    {
      name: 'Amount',
      selector: (r) => Number(r.toPay || 0).toFixed(2),
      sortable: true,
      right: true,
    },
    {
      name: 'Upload',
      selector: (r) => (r.uploadDate || r.createdAt || '').slice(0, 10) || '-',
      sortable: true,
    },
    {
      name: 'Expiry',
      selector: (r) =>
        (r.expiryDate ||
          addMonths(String(r.uploadDate || r.createdAt || new Date()), PLAN_MONTHS[r.plan] || 2)).slice(0, 10),
      sortable: true,
    },
    {
      name: 'Status',
      cell: (r) => <StatusBadge status={r.status} />,
      sortable: true,
    },
    {
      name: 'Actions',
      width: '160px',
      cell: (r) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/channel-partners/dsa', { state: { editSlider: r } })}
            className="rounded border border-primary px-2 py-1 text-xs font-semibold text-primary"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(r)}
            className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-600"
          >
            Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="Sales Advertisement" subtitle="All DSA media advertisements across tabs and sections." />

      <SectionCard title="Filters">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Media Tab</label>
            <select className={inputClass} value={mediaTabFilter} onChange={(e) => setMediaTabFilter(e.target.value)}>
              <option value="">All Media Tabs</option>
              {MEDIA_TABS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Section</label>
            <select className={inputClass} value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
              <option value="">All Sections</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Country</label>
            <select className={inputClass} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="">All Countries</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
            <select
              className={inputClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SliderStatus | '')}
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setSectionFilter('');
              setCountryFilter('');
              setStatusFilter('');
              setTableSearch('');
            }}
            className="h-9 rounded border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
          <ListTableSearchInput value={tableSearch} onChange={setTableSearch} />
        </div>
      </SectionCard>

      <SectionCard title="Advertisement List" className="mt-4">
        {!loading && filtered.length === 0 ? (
          <EmptyState message="No advertisements found for selected filters." />
        ) : (
          <DataTableWrapper
            columns={columns}
            data={filtered}
            loading={loading}
            hideSearchInput
            filterText={tableSearch}
            onFilterTextChange={setTableSearch}
          />
        )}
      </SectionCard>

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete Advertisement"
          message={`Delete ${confirmDelete.plan} (${confirmDelete.mediaTab})?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      ) : null}
    </ErrorBoundary>
  );
};
