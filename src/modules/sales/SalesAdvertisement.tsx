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
import { ImagePreviewDialog } from '../../shared/components/ImagePreview';
import { formatDateDDMMYYYY } from '../../shared/utils/dateFormat';
import type { DsaSlider } from '../marketing/marketing.types';
import { deleteDsaSlider, fetchDsaSliders } from '../marketing/marketing.service';
import {
  PLAN_MONTHS,
  addMonths,
  planOptionLabel,
  toAbsoluteMediaUrl,
} from '../marketing/mediaAds/constants';
import { fetchThirdPartyCredentials } from '../people/thirdPartyCredentials/thirdPartyCredentials.service';
import {
  BANNER_CMS_PAGES,
  dsaPlacementSlotOptions,
  pageLabel,
  placementImageCrop,
  slotLabel,
  type BannerCmsPage,
  type BannerCmsSlot,
} from '../../shared/placements/cmsBannerPlacements';

const compactFilterClass =
  'h-8 w-32 min-w-[7.5rem] shrink-0 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-36';

const compactSearchClass =
  '!h-8 !w-40 !min-w-[9rem] !px-2.5 !text-xs sm:!w-44';

function sliderEmployeeCode(record: DsaSlider): string {
  return String(record.uploadedByDsaCode || record.dsaCode || '').trim().toUpperCase();
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
  const [pageFilter, setPageFilter] = React.useState('');
  const [slotFilter, setSlotFilter] = React.useState('');
  const [employeeFilter, setEmployeeFilter] = React.useState('');
  const [employeeNameByCode, setEmployeeNameByCode] = React.useState<Map<string, string>>(new Map());
  const [confirmDelete, setConfirmDelete] = React.useState<DsaSlider | null>(null);
  const [previewRecord, setPreviewRecord] = React.useState<DsaSlider | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchDsaSliders();
      setRecords(list);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to load advertisements'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    let cancelled = false;
    const loadEmployees = async () => {
      try {
        const rows = await fetchThirdPartyCredentials();
        if (cancelled) return;
        const map = new Map<string, string>();
        for (const row of rows) {
          const code = String(row.threePEmplCode || '').trim().toUpperCase();
          if (code) map.set(code, row.name || code);
        }
        setEmployeeNameByCode(map);
      } catch {
        if (!cancelled) setEmployeeNameByCode(new Map());
      }
    };
    void loadEmployees();
    return () => {
      cancelled = true;
    };
  }, []);

  const employeeFilterOptions = React.useMemo(() => {
    const codes = new Set<string>();
    for (const row of records) {
      const code = sliderEmployeeCode(row);
      if (code) codes.add(code);
    }
    return Array.from(codes)
      .sort()
      .map((code) => ({
        code,
        label: employeeNameByCode.get(code) ? `${employeeNameByCode.get(code)} (${code})` : code,
      }));
  }, [records, employeeNameByCode]);

  const slotFilterOptions = pageFilter
    ? dsaPlacementSlotOptions(pageFilter as BannerCmsPage)
    : [];

  const employeeLabel = React.useCallback(
    (record: DsaSlider) => {
      const code = sliderEmployeeCode(record);
      if (!code) return '—';
      const name = employeeNameByCode.get(code);
      return name ? `${name} (${code})` : code;
    },
    [employeeNameByCode],
  );

  const filtered = records.filter((r) => {
    if (pageFilter && r.cmsPage !== pageFilter) return false;
    if (slotFilter && r.cmsPosition !== slotFilter) return false;
    if (employeeFilter && sliderEmployeeCode(r) !== employeeFilter) return false;
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

  const previewCrop = previewRecord
    ? placementImageCrop(previewRecord.cmsPage as BannerCmsPage, previewRecord.cmsPosition as BannerCmsSlot)
    : null;

  const columns: TableColumn<DsaSlider>[] = [
    {
      name: 'Image',
      width: '88px',
      minWidth: '88px',
      grow: 0,
      cell: (r) => {
        const crop = placementImageCrop(r.cmsPage as BannerCmsPage, r.cmsPosition as BannerCmsSlot);
        const src = toAbsoluteMediaUrl(r.imageUrl);
        return (
          <button
            type="button"
            title={`Preview — ${crop.label} (${crop.aspectLabel})`}
            aria-label={`Preview image for ${planOptionLabel(r.plan)}`}
            className="my-1 block w-20 overflow-hidden rounded border border-slate-200 bg-slate-50 transition hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{ aspectRatio: crop.aspect }}
            onClick={() => setPreviewRecord(r)}
          >
            <img src={src} alt={r.plan} className="h-full w-full object-cover" />
          </button>
        );
      },
      ignoreRowClick: true,
    },
    {
      name: 'Page · Slot',
      selector: (r) =>
        `${pageLabel(r.cmsPage as BannerCmsPage)} · ${slotLabel(r.cmsPage as BannerCmsPage, r.cmsPosition as BannerCmsSlot)}`,
      sortable: true,
      width: '220px',
      minWidth: '220px',
      grow: 0,
      wrap: true,
    },
    {
      name: 'Employee',
      selector: (r) => employeeLabel(r),
      sortable: true,
      sortField: 'dsaCode',
      width: '200px',
      minWidth: '200px',
      grow: 0,
      wrap: true,
    },
    {
      name: 'Plan',
      selector: (r) => planOptionLabel(r.plan || ''),
      sortable: true,
      sortField: 'plan',
      width: '170px',
      minWidth: '170px',
      grow: 0,
      wrap: true,
    },
    {
      name: 'Plan Charge',
      selector: (r) => Number(r.planCharge || 0).toFixed(2),
      sortable: true,
      right: true,
      minWidth: '108px',
      width: '108px',
      grow: 0,
    },
    {
      name: 'Luxury Fees',
      selector: (r) => Number(r.luxuryFees || 0).toFixed(2),
      sortable: true,
      right: true,
      minWidth: '108px',
      width: '108px',
      grow: 0,
    },
    {
      name: 'Discount',
      selector: (r) => Number(r.discount || 0).toFixed(2),
      sortable: true,
      right: true,
      minWidth: '96px',
      width: '96px',
      grow: 0,
    },
    {
      name: 'To Pay',
      selector: (r) => Number(r.toPay || 0).toFixed(2),
      sortable: true,
      right: true,
      minWidth: '96px',
      width: '96px',
      grow: 0,
    },
    {
      name: 'Upload Date',
      selector: (r) => r.uploadDate || r.createdAt || '',
      format: (r) => formatDateDDMMYYYY(String(r.uploadDate || r.createdAt || '')) || '-',
      sortable: true,
      minWidth: '112px',
      width: '112px',
      grow: 0,
    },
    {
      name: 'Expiry Date',
      selector: (r) =>
        r.expiryDate ||
        addMonths(String(r.uploadDate || r.createdAt || new Date()), PLAN_MONTHS[r.plan] || 2),
      format: (r) => {
        const raw =
          r.expiryDate ||
          addMonths(String(r.uploadDate || r.createdAt || new Date()), PLAN_MONTHS[r.plan] || 2);
        return formatDateDDMMYYYY(String(raw)) || '-';
      },
      sortable: true,
      minWidth: '112px',
      width: '112px',
      grow: 0,
    },
    {
      name: 'Actions',
      minWidth: '148px',
      width: '148px',
      grow: 0,
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
      <PageHeader
        title="Sales Advertisement"
        subtitle="All DSA media advertisements across tabs and sections."
        className="mb-4"
        toolbarLeft={
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={compactFilterClass}
              value={pageFilter}
              onChange={(e) => {
                setPageFilter(e.target.value);
                setSlotFilter('');
              }}
              aria-label="Filter by page"
            >
              <option value="">All Pages</option>
              {BANNER_CMS_PAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              className={compactFilterClass}
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              aria-label="Filter by slot or position"
              disabled={!pageFilter}
            >
              <option value="">{pageFilter ? 'All Slots' : 'Select page first'}</option>
              {slotFilterOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              className={compactFilterClass}
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              aria-label="Filter by employee"
            >
              <option value="">All Employees</option>
              {employeeFilterOptions.map((emp) => (
                <option key={emp.code} value={emp.code}>
                  {emp.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setPageFilter('');
                setSlotFilter('');
                setEmployeeFilter('');
                setTableSearch('');
              }}
              className="h-8 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        }
      />

      <SectionCard
        title="Advertisement List"
        contentClassName="p-0"
        actions={
          <ListTableSearchInput
            value={tableSearch}
            onChange={setTableSearch}
            className={compactSearchClass}
            placeholder="Search list…"
          />
        }
      >
        {!loading && filtered.length === 0 ? (
          <div className="m-5">
            <EmptyState message="No advertisements found for selected filters." />
          </div>
        ) : (
          <DataTableWrapper
            columns={columns}
            data={filtered}
            loading={loading}
            hideSearchInput
            responsive={false}
            horizontalScroll
            filterText={tableSearch}
            onFilterTextChange={setTableSearch}
            className="min-w-full rounded-none border-0 pr-1 shadow-none"
          />
        )}
      </SectionCard>

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete Advertisement"
          message={`Delete ${confirmDelete.plan} (${pageLabel(confirmDelete.cmsPage as BannerCmsPage)} · ${slotLabel(confirmDelete.cmsPage as BannerCmsPage, confirmDelete.cmsPosition as BannerCmsSlot)})?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      ) : null}

      {previewRecord && previewCrop ? (
        <ImagePreviewDialog
          open
          src={toAbsoluteMediaUrl(previewRecord.imageUrl)}
          alt={planOptionLabel(previewRecord.plan)}
          title={`${previewCrop.label} · ${previewCrop.aspectLabel} · ${previewRecord.country || '—'}`}
          aspectRatio={previewCrop.aspect}
          onClose={() => setPreviewRecord(null)}
        />
      ) : null}
    </ErrorBoundary>
  );
};
