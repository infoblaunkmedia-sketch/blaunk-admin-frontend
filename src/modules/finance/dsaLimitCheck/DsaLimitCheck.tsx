import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { fetchDsaLimitUsage, type DsaLimitUsageRow } from '../finance.service';

export const DsaLimitCheck: React.FC = () => {
  const [rows, setRows] = React.useState<DsaLimitUsageRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchDsaLimitUsage(search.trim() || undefined)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e) => {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Failed to load usage');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search]);

  const columns = [
    { name: 'DSA Code', selector: (r: DsaLimitUsageRow) => r.dsaCode, sortable: true },
    { name: 'DSA Name', selector: (r: DsaLimitUsageRow) => r.dsaName || '-', sortable: true },
    { name: 'Max Slots', selector: (r: DsaLimitUsageRow) => (r.maxSlots > 0 ? r.maxSlots : '—'), sortable: true },
    { name: 'Active Uploads', selector: (r: DsaLimitUsageRow) => r.activeUploads, sortable: true },
    {
      name: 'Remaining Slots',
      selector: (r: DsaLimitUsageRow) => (r.remainingSlots == null ? '—' : r.remainingSlots),
      sortable: true,
    },
    { name: 'Expired', selector: (r: DsaLimitUsageRow) => r.expiredUploads, sortable: true },
    { name: 'Total', selector: (r: DsaLimitUsageRow) => r.totalUploads, sortable: true },
  ];

  return (
    <ErrorBoundary>
      <PageHeader
        title="DSA Limit Check"
        subtitle="Upload usage per DSA — active ads vs configured slot limit."
        beforeActions={<ListTableSearchInput value={search} onChange={setSearch} placeholder="Search DSA code…" />}
      />
      <SectionCard title="">
        <DataTableWrapper
          columns={columns}
          data={rows}
          progressPending={loading}
          noDataComponent="No DSA upload records found."
        />
      </SectionCard>
    </ErrorBoundary>
  );
};
