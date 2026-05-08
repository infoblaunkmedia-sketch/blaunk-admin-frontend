import React from 'react';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { Input } from '../components/Input';
import { GenerateButton } from '../components/GenerateButton';
import ReportFilters from '../components/ReportFilters';
import { Select } from '../components/Select';

const TABS = ['B2B - Payment', 'MIS', 'Upload'] as const;

/** One B2B row: identity columns + editable finance columns (horizontal scroll). */
type B2BRow = {
  id: string;
  selected: boolean;
  date: string;
  orderId: string;
  country: string;
  buyerName: string;
  payinTxsId: string;
  currency: string;
  payinValue: string;
  statusPayin: string;
  sellerPayin: string;
  sellerName: string;
  invoiceNo: string;
  invoiceDate: string;
  eWayNo: string;
  invoiceValue: string;
  deliveryStatus: string;
  orderStatus: string;
  portalFees: string;
  penalty: string;
  govtLevies: string;
  charges: string;
  tdsTcsCol: string;
  valueNett: string;
  datePayBank: string;
  txsNo: string;
  statusPayBank: string;
  statusTdsTcs2: string;
  empId: string;
  remarks: string;
};

const emptyEditableRow = (id: string): B2BRow => ({
  id,
  selected: false,
  date: '15-04-2026',
  orderId: '123123',
  country: 'India',
  buyerName: 'C & D Retail LLP',
  payinTxsId: 'TXQ1241A',
  currency: 'Rs',
  payinValue: '10000.00',
  statusPayin: 'Pending',
  sellerPayin: '',
  sellerName: 'Pratham Jain',
  invoiceNo: '',
  invoiceDate: '',
  eWayNo: '',
  invoiceValue: '',
  deliveryStatus: 'Pending',
  orderStatus: 'Payin',
  portalFees: '250.00',
  penalty: '',
  govtLevies: '',
  charges: '',
  tdsTcsCol: '',
  valueNett: '',
  datePayBank: '',
  txsNo: '',
  statusPayBank: 'Pending',
  statusTdsTcs2: 'Pending',
  empId: 'QWE123',
  remarks: 'Pending',
});

const SAMPLE_ROWS: B2BRow[] = [emptyEditableRow('1')];

/** New row for “+ Add row” — mostly blank, ready to fill in */
const newBlankRow = (): B2BRow => {
  const d = new Date();
  const dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  const id = `b2b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    selected: false,
    date: dateStr,
    orderId: '',
    country: '',
    buyerName: '',
    payinTxsId: '',
    currency: 'Rs',
    payinValue: '',
    statusPayin: 'Pending',
    sellerPayin: '',
    sellerName: '',
    invoiceNo: '',
    invoiceDate: '',
    eWayNo: '',
    invoiceValue: '',
    deliveryStatus: 'Pending',
    orderStatus: 'Payin',
    portalFees: '',
    penalty: '',
    govtLevies: '',
    charges: '',
    tdsTcsCol: '',
    valueNett: '',
    datePayBank: '',
    txsNo: '',
    statusPayBank: 'Pending',
    statusTdsTcs2: 'Pending',
    empId: '',
    remarks: 'Pending',
  };
};

const filterInputClass =
  'h-10 w-full min-w-[8rem] rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

/** Header: readable size, generous padding so labels are not clipped at scroll edges */
const thClass =
  'whitespace-nowrap border-b border-white/25 px-5 py-3 text-left text-[13px] font-bold leading-snug tracking-wide text-white sm:px-6 sm:text-sm';

const thCheck = `${thClass} w-14 min-w-[3.5rem] max-w-[4rem] px-3 text-center sm:px-4`;

/** Default data column width — keeps “Currency”, amounts, and headers legible */
const thData = `${thClass} min-w-[8.5rem]`;

const cellClass =
  'border-b border-slate-200 px-5 py-3 align-middle text-sm leading-normal text-slate-900 first:pl-6 last:pr-6 sm:px-6';

const cellCheck = `${cellClass} w-14 min-w-[3.5rem] max-w-[4rem] px-3 text-center sm:px-4`;

const cellInputClass =
  'box-border h-10 w-full min-w-[8rem] rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-600 disabled:opacity-90';

const cellSelectClass = `${cellInputClass} cursor-pointer pr-9`;

const checkboxClass =
  'h-[18px] w-[18px] shrink-0 cursor-pointer rounded-none border-2 border-slate-500 bg-white accent-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1';

const STATUS_OPTIONS = ['Pending', 'Completed', 'Failed', 'Payin', 'Payout'] as const;
const FINANCE_MIS_REPORT_OPTIONS = [
  'Dashboard B2B',
  'Invoice BGT',
  'Invoice Subscription',
  'MIS - Subscription',
  'B2B PayLedger',
  'Order Book',
] as const;

export const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]>('B2B - Payment');
  const [orderIdSearch, setOrderIdSearch] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [rows, setRows] = React.useState<B2BRow[]>(SAMPLE_ROWS);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [misFromDate, setMisFromDate] = React.useState('');
  const [misToDate, setMisToDate] = React.useState('');
  const [misDepartment, setMisDepartment] = React.useState('');
  const [misData, setMisData] = React.useState('All');
  const [misReport, setMisReport] = React.useState('');
  const [uploadEditing, setUploadEditing] = React.useState(false);
  const [uploadType, setUploadType] = React.useState('B2B Pay Ledger');
  const [uploadMode, setUploadMode] = React.useState('New');
  const [uploadCode, setUploadCode] = React.useState('25/001');
  const [uploadFileName, setUploadFileName] = React.useState('No file chosen');
  const misReportOptions = React.useMemo(() => {
    if (misDepartment === 'customer-care') return ['Penalty'];
    if (misDepartment === 'finance') return [...FINANCE_MIS_REPORT_OPTIONS];
    return [];
  }, [misDepartment]);

  React.useEffect(() => {
    if (!misReportOptions.includes(misReport)) {
      setMisReport('');
    }
  }, [misDepartment, misReport, misReportOptions]);

  const toggleUploadEdit = () => {
    if (uploadEditing) {
      setUploadEditing(false);
      return;
    }
    setUploadEditing(true);
  };

  const updateRow = (id: string, patch: Partial<B2BRow>) => {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const toggleRow = (id: string) => {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, selected: !row.selected } : row)));
  };

  const handleSaveFilters = () => {
    // Hook API when available
  };

  const addRow = () => {
    setRows((prev) => {
      const next = [...prev, newBlankRow()];
      const lastPage = Math.max(0, Math.ceil(next.length / pageSize) - 1);
      requestAnimationFrame(() => setPageIndex(lastPage));
      return next;
    });
  };

  const filteredRows = rows.filter((r) => {
    if (orderIdSearch.trim() && !r.orderId.includes(orderIdSearch.trim())) return false;
    return true;
  });

  const total = filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(pageIndex, Math.max(0, pageCount - 1));
  const pageStart = safePage * pageSize;
  const pagedRows = filteredRows.slice(pageStart, pageStart + pageSize);
  const start = total === 0 ? 0 : pageStart + 1;
  const end = total === 0 ? 0 : Math.min(pageStart + pagedRows.length, total);

  React.useEffect(() => {
    setPageIndex((p) => Math.min(p, Math.max(0, pageCount - 1)));
  }, [pageCount, total, pageSize]);

  const goFirst = () => setPageIndex(0);
  const goPrev = () => setPageIndex((p) => Math.max(0, p - 1));
  const goNext = () => setPageIndex((p) => Math.min(pageCount - 1, p + 1));
  const goLast = () => setPageIndex(Math.max(0, pageCount - 1));

  const atFirst = safePage <= 0;
  const atLast = safePage >= pageCount - 1 || total === 0;

  return (
    <div className="mx-auto flex max-w-[100rem] flex-col gap-4">
      <Tabs
        tabs={TABS.map(t => ({ id: t, label: t }))}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id)}
      />

      {activeTab === 'B2B - Payment' ? (
        <>
          <h1 className="text-2xl font-bold text-primary">B2B - Payment</h1>

          <section className="rounded-xl border border-slate-200 bg-white shadow-card">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 lg:gap-6">
              <div className="min-w-0 flex-1 sm:max-w-xs">
                <Input
                  label="Order ID"
                  placeholder="Search by Order ID"
                  value={orderIdSearch}
                  onChange={(e) => setOrderIdSearch(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="w-full min-w-[10rem] sm:w-auto sm:max-w-[11rem]">
                <Input
                  label="From"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="w-full min-w-[10rem] sm:w-auto sm:max-w-[11rem]">
                <Input
                  label="To"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <div className="w-full min-w-[10rem] sm:w-auto sm:max-w-[12rem]">
                <label className="mb-1 block text-xs font-bold text-slate-700">Type</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={filterInputClass}>
                  <option value="">Select Type</option>
                  <option value="payin">Pay-in</option>
                  <option value="payout">Pay-out</option>
                </select>
              </div>
              <div className="w-full min-w-[10rem] sm:w-auto sm:max-w-[12rem]">
                <label className="mb-1 block text-xs font-bold text-slate-700">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterInputClass}>
                  <option value="">Select Status</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-full justify-end sm:ml-auto sm:w-auto">
                <Button onClick={handleSaveFilters}>
                  Save
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-b border-slate-100 px-4 py-2">
              <Button variant="secondary" size="md" onClick={addRow}>
                <span className="text-lg leading-none" aria-hidden>+</span>
                <span>Add row</span>
              </Button>
            </div>

            <div className="overflow-x-auto px-4 pb-2 pt-1 [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[4000px] border-collapse text-sm antialiased">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className={thCheck} aria-label="Select" />
                    <th className={`${thData} min-w-[9rem]`}>Date</th>
                    <th className={`${thData} min-w-[9rem]`}>Order ID</th>
                    <th className={`${thData} min-w-[8rem]`}>Country</th>
                    <th className={`${thData} min-w-[13rem]`}>Buyer Name</th>
                    <th className={`${thData} min-w-[10rem]`}>Payin - TXS ID</th>
                    <th className={`${thData} min-w-[8rem]`}>Currency</th>
                    <th className={`${thData} min-w-[10rem]`}>Payin-Value</th>
                    <th className={`${thData} min-w-[11rem]`}>Status - Payin</th>
                    <th className={`${thData} min-w-[11rem]`}>Seller - Payin</th>
                    <th className={`${thData} min-w-[11rem]`}>Seller Name</th>
                    <th className={`${thData} min-w-[10rem]`}>Invoice No</th>
                    <th className={`${thData} min-w-[11rem]`}>Invoice Date</th>
                    <th className={`${thData} min-w-[9rem]`}>E-way No</th>
                    <th className={`${thData} min-w-[10rem]`}>Invoice Value</th>
                    <th className={`${thData} min-w-[11rem]`}>Delivery Status</th>
                    <th className={`${thData} min-w-[11rem]`}>Order Status</th>
                    <th className={`${thData} min-w-[10rem]`}>Portal Fees</th>
                    <th className={`${thData} min-w-[9rem]`}>Penalty</th>
                    <th className={`${thData} min-w-[10rem]`}>GOVT Levis</th>
                    <th className={`${thData} min-w-[9rem]`}>Charges</th>
                    <th className={`${thData} min-w-[9rem]`}>TDS/TCS</th>
                    <th className={`${thData} min-w-[10rem]`}>Value (nett)</th>
                    <th className={`${thData} min-w-[12rem]`}>Date (Pay Bank)</th>
                    <th className={`${thData} min-w-[9rem]`}>TXs No</th>
                    <th className={`${thData} min-w-[12rem]`}>Status - PayBank</th>
                    <th className={`${thData} min-w-[12rem]`}>Status TDS/TCS</th>
                    <th className={`${thData} min-w-[9rem]`}>Emp ID</th>
                    <th className={`${thData} min-w-[11rem]`}>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row) => {
                    const locked = !row.selected;
                    return (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-200 transition-colors ${row.selected ? 'bg-sky-50/50' : 'bg-white'}`}
                    >
                      <td className={cellCheck}>
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={row.selected}
                          onChange={() => toggleRow(row.id)}
                          aria-label="Select row to edit"
                          title="Select this row to enable editing"
                        />
                      </td>
                      <td className={`${cellClass} whitespace-nowrap tabular-nums`}>{row.date}</td>
                      <td className={cellClass}>{row.orderId}</td>
                      <td className={cellClass}>{row.country}</td>
                      <td className={`${cellClass} max-w-[14rem]`}>{row.buyerName}</td>
                      <td className={`${cellClass} font-medium uppercase tracking-wide`}>{row.payinTxsId}</td>
                      <td className={`${cellClass} font-medium`}>{row.currency}</td>
                      <td className={cellClass}>
                        <input
                          type="text"
                          className={cellInputClass}
                          value={row.payinValue}
                          onChange={(e) => updateRow(row.id, { payinValue: e.target.value })}
                          inputMode="decimal"
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <select
                          className={cellSelectClass}
                          value={row.statusPayin}
                          onChange={(e) => updateRow(row.id, { statusPayin: e.target.value })}
                          disabled={locked}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={cellClass}>
                        <input
                          type="text"
                          className={cellInputClass}
                          value={row.sellerPayin}
                          onChange={(e) => updateRow(row.id, { sellerPayin: e.target.value })}
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>{row.sellerName}</td>
                      <td className={cellClass}>
                        <input
                          type="text"
                          className={cellInputClass}
                          value={row.invoiceNo}
                          onChange={(e) => updateRow(row.id, { invoiceNo: e.target.value })}
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <input
                          type="date"
                          className={cellInputClass}
                          value={row.invoiceDate}
                          onChange={(e) => updateRow(row.id, { invoiceDate: e.target.value })}
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <input
                          type="text"
                          className={cellInputClass}
                          value={row.eWayNo}
                          onChange={(e) => updateRow(row.id, { eWayNo: e.target.value })}
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <input
                          type="text"
                          className={cellInputClass}
                          value={row.invoiceValue}
                          onChange={(e) => updateRow(row.id, { invoiceValue: e.target.value })}
                          inputMode="decimal"
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <select
                          className={cellSelectClass}
                          value={row.deliveryStatus}
                          onChange={(e) => updateRow(row.id, { deliveryStatus: e.target.value })}
                          disabled={locked}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={cellClass}>
                        <select
                          className={cellSelectClass}
                          value={row.orderStatus}
                          onChange={(e) => updateRow(row.id, { orderStatus: e.target.value })}
                          disabled={locked}
                        >
                          <option value="Payin">Payin</option>
                          <option value="Payout">Payout</option>
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={`${cellClass} tabular-nums`}>{row.portalFees}</td>
                      <td className={cellClass}>
                        <input
                          type="text"
                          className={cellInputClass}
                          value={row.penalty}
                          onChange={(e) => updateRow(row.id, { penalty: e.target.value })}
                          inputMode="decimal"
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <input
                          type="text"
                          className={cellInputClass}
                          value={row.govtLevies}
                          onChange={(e) => updateRow(row.id, { govtLevies: e.target.value })}
                          inputMode="decimal"
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <input
                          type="text"
                          className={cellInputClass}
                          value={row.charges}
                          onChange={(e) => updateRow(row.id, { charges: e.target.value })}
                          inputMode="decimal"
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <input
                          type="text"
                          className={cellInputClass}
                          value={row.tdsTcsCol}
                          onChange={(e) => updateRow(row.id, { tdsTcsCol: e.target.value })}
                          inputMode="decimal"
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <input
                          type="text"
                          className={cellInputClass}
                          value={row.valueNett}
                          onChange={(e) => updateRow(row.id, { valueNett: e.target.value })}
                          inputMode="decimal"
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <input
                          type="date"
                          className={cellInputClass}
                          value={row.datePayBank}
                          onChange={(e) => updateRow(row.id, { datePayBank: e.target.value })}
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <input
                          type="text"
                          className={cellInputClass}
                          value={row.txsNo}
                          onChange={(e) => updateRow(row.id, { txsNo: e.target.value })}
                          disabled={locked}
                        />
                      </td>
                      <td className={cellClass}>
                        <select
                          className={cellSelectClass}
                          value={row.statusPayBank}
                          onChange={(e) => updateRow(row.id, { statusPayBank: e.target.value })}
                          disabled={locked}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={cellClass}>
                        <select
                          className={cellSelectClass}
                          value={row.statusTdsTcs2}
                          onChange={(e) => updateRow(row.id, { statusTdsTcs2: e.target.value })}
                          disabled={locked}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={`${cellClass} font-semibold tracking-wide`}>{row.empId}</td>
                      <td className={cellClass}>
                        <select
                          className={`${cellSelectClass} min-w-[10rem]`}
                          value={row.remarks}
                          onChange={(e) => updateRow(row.id, { remarks: e.target.value })}
                          disabled={locked}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageIndex(0);
                  }}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-600">
                  {start}-{end} of {total}
                </span>
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    disabled={atFirst || total === 0}
                    onClick={goFirst}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
                    aria-label="First page"
                  >
                    |‹
                  </button>
                  <button
                    type="button"
                    disabled={atFirst || total === 0}
                    onClick={goPrev}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    disabled={atLast || total === 0}
                    onClick={goNext}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
                    aria-label="Next page"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    disabled={atLast || total === 0}
                    onClick={goLast}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
                    aria-label="Last page"
                  >
                    ›|
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : activeTab === 'MIS' ? (
        <section className="bg-transparent p-0 shadow-none">
          <h2 className="mb-4 text-[2rem] font-bold text-primary">MIS</h2>

          <ReportFilters
            columns={['From Date', 'To Date', 'Department', 'Data', 'Report Type', 'Output Format', 'Actions']}
            gridTemplate="1fr 1fr 1fr 0.9fr 1fr 1fr 0.9fr"
            paddingY="py-4"
            gap="gap-x-2"
          >
            <div className="px-1">
              <Input
                type="date"
                value={misFromDate}
                onChange={(e) => setMisFromDate(e.target.value)}
              />
            </div>
            <div className="px-1">
              <Input
                type="date"
                value={misToDate}
                onChange={(e) => setMisToDate(e.target.value)}
              />
            </div>
            <div className="px-1">
              <Select
                value={misDepartment}
                onChange={(e) => setMisDepartment(e.target.value)}
                options={[
                  { value: '', label: 'Select Depart' },
                  { value: 'customer-care', label: 'Customer Care' },
                  { value: 'finance', label: 'Finance' }
                ]}
              />
            </div>
            <div className="px-1">
              <Input
                value={misData}
                onChange={(e) => setMisData(e.target.value)}
              />
            </div>
            <div className="px-1">
              <Select
                value={misReport}
                onChange={(e) => setMisReport(e.target.value)}
                options={[
                  { value: '', label: 'Select Report' },
                  ...misReportOptions.map(r => ({ value: r, label: r }))
                ]}
              />
            </div>
            <div className="px-1">
              <Input isReadOnly value="Excel" />
            </div>
            <div className="px-1">
              <GenerateButton onClick={() => {}} isFullWidth size="md" />
            </div>
          </ReportFilters>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
          <h2 className="mb-4 text-[2rem] font-bold text-primary">Upload</h2>

          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="w-full min-w-[12rem] sm:max-w-[16rem]">
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                disabled={!uploadEditing}
                className={filterInputClass}
              >
                <option value="B2B Pay Ledger">B2B Pay Ledger</option>
                <option value="Invoice BGT">Invoice BGT</option>
                <option value="Invoice Subscription">Invoice Subscription</option>
              </select>
            </div>

            <div className="w-full min-w-[10rem] sm:max-w-[10rem]">
              <select
                value={uploadMode}
                onChange={(e) => setUploadMode(e.target.value)}
                disabled={!uploadEditing}
                className={filterInputClass}
              >
                <option value="New">New</option>
                <option value="Modify">Modify</option>
              </select>
            </div>

            <div className="w-full min-w-[10rem] sm:max-w-[10rem]">
              <input
                type="text"
                value={uploadCode}
                onChange={(e) => setUploadCode(e.target.value)}
                disabled={!uploadEditing}
                className={filterInputClass}
              />
            </div>

            <div className="w-full min-w-[14rem] sm:max-w-[22rem]">
              <label
                className={[
                  filterInputClass,
                  'flex cursor-pointer items-center gap-3',
                  !uploadEditing ? 'cursor-not-allowed opacity-80' : '',
                ].join(' ')}
              >
                <span className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                  Choose File
                </span>
                <span className="truncate text-sm text-slate-600">{uploadFileName}</span>
                <input
                  type="file"
                  disabled={!uploadEditing}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setUploadFileName(file ? file.name : 'No file chosen');
                  }}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={toggleUploadEdit}
              className={[
                'inline-flex items-center rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2',
                uploadEditing
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300'
                  : 'bg-primary hover:bg-primary-dark focus-visible:ring-primary/40',
              ].join(' ')}
            >
              {uploadEditing ? 'Save' : 'Edit'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
