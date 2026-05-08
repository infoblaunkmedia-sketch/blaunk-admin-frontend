import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { Input } from '../components/Input';
import { GenerateButton } from '../components/GenerateButton';

const TABS = ['Profile', 'Report an Issue', 'Reviews', 'MIS'] as const;

const PENALTY_OPTIONS = ['Rs 100', 'Rs 250', 'Rs 500', '$1', '$2', '$3', 'NA'] as const;

const inputClass =
  'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

const tableHeadClass = 'border-b border-[#e0e0e0] bg-[#f5f5f5] text-slate-900';

function PenaltyDropdown({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = React.useState({ top: 0, left: 0, width: 0 });

  const updatePosition = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPos({ top: r.bottom + 2, left: r.left, width: r.width });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => {
      updatePosition();
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        const t = e.target as HTMLElement | null;
        if (t?.closest?.('[data-penalty-dropdown-list]')) return;
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const triggerClasses = [
    'inline-flex h-9 w-full min-w-[7.5rem] items-center justify-between gap-2 rounded-md border px-3 text-left text-sm font-semibold outline-none transition',
    disabled
      ? 'cursor-not-allowed border-[#e0e0e0] bg-slate-100 text-slate-500'
      : open
        ? 'border-primary bg-white text-slate-900 ring-2 ring-primary/25'
        : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400',
  ].join(' ');

  const list =
    open && !disabled
      ? createPortal(
          <ul
            data-penalty-dropdown-list
            role="listbox"
            className="fixed z-[100] overflow-hidden rounded-md border border-slate-500 bg-white py-1 shadow-lg"
            style={{ top: menuPos.top, left: menuPos.left, width: Math.max(menuPos.width, 120) }}
          >
            {PENALTY_OPTIONS.map((opt) => (
              <li key={opt} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={value === opt}
                  className="w-full px-3 py-2 text-left text-sm font-semibold text-slate-900 transition hover:bg-primary hover:text-white"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className="relative min-w-[7.5rem]">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={triggerClasses}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className="truncate">{value}</span>
        <svg className="h-4 w-4 shrink-0 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {list}
    </div>
  );
}

export const CustomerCarePage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]>('MIS');
  const [issueSearch, setIssueSearch] = React.useState('');
  const [rowSelected, setRowSelected] = React.useState(false);
  const [ccsResolution, setCcsResolution] = React.useState('No response on calls and mails');
  const [penalty, setPenalty] = React.useState('Rs 100');
  const [status, setStatus] = React.useState('Closed');
  const [reviewSearch, setReviewSearch] = React.useState('');
  const [reviewRowSelected, setReviewRowSelected] = React.useState(false);
  const [reviewReply, setReviewReply] = React.useState('');
  const [misFromDate, setMisFromDate] = React.useState('');
  const [misToDate, setMisToDate] = React.useState('');
  const [misSegment, setMisSegment] = React.useState('');
  const [misReportType, setMisReportType] = React.useState('');

  return (
    <section className="flex w-full flex-col gap-4">
      <Tabs
        tabs={TABS.map(t => ({ id: t, label: t }))}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id)}
      />

      {activeTab === 'Report an Issue' && (
        <>
          <h2 className="text-4xl font-bold text-primary">Report An Issue</h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex w-full max-w-md">
              <Input
                placeholder="Search by RN No./ Product ID"
                value={issueSearch}
                onChange={(e) => setIssueSearch(e.target.value)}
                className="flex-1"
              />
            </div>

            <Button variant="success">
              Save
            </Button>
            <Button
              variant="danger"
              disabled={!rowSelected}
            >
              Delete
            </Button>
          </div>

          <div className="overflow-x-auto border border-slate-200 bg-white">
              <table className="min-w-[1600px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className={tableHeadClass}>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">&nbsp;</th>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">Issue Date</th>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">RN No.</th>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">Issue</th>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">CCS-Resolution</th>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">Penalty</th>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">Total Complaint</th>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">Status</th>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">Country</th>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">Vendor City</th>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">Vendor Mobile</th>
                  <th className="border-r border-[#e0e0e0] px-4 py-2 font-bold">Vendor Name</th>
                  <th className="px-4 py-2 font-bold">Customer Email ID</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                    <td className="border-r border-slate-200 px-4 py-2">
                    <input
                      type="checkbox"
                      checked={rowSelected}
                      onChange={(e) => setRowSelected(e.target.checked)}
                      className="h-4 w-4 cursor-pointer accent-primary"
                      aria-label="Select row"
                    />
                  </td>
                  <td className="border-r border-slate-200 px-4 py-2 whitespace-nowrap">12-01-2024</td>
                    <td className="border-r border-slate-200 px-4 py-2">25/2312346</td>
                    <td className="border-r border-slate-200 px-4 py-2">Static Issue</td>
                  <td className="border-r border-slate-200 p-2">
                    <select
                      value={ccsResolution}
                      onChange={(e) => setCcsResolution(e.target.value)}
                      disabled={!rowSelected}
                      className={[
                        inputClass,
                        !rowSelected ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : '',
                      ].join(' ')}
                    >
                      <option value="Report management">Report management</option>
                      <option value="Report to DSA">Report to DSA</option>
                      <option value="No response on calls and mails">No response on calls and mails</option>
                      <option value="Penalty levied and agreed by vendor">Penalty levied and agreed by vendor</option>
                      <option value="Denied the reported issue">Denied the reported issue</option>
                      <option value="Agreed to resolve issue in 48 hours Take this matter legally">
                        Agreed to resolve issue in 48 hours Take this matter legally
                      </option>
                      <option value="Block the buyer">Block the buyer</option>
                      <option value="Ready for settlement">Ready for settlement</option>
                      <option value="Agreed to refund">Agreed to refund</option>
                      <option value="Refund initiated">Refund initiated</option>
                      <option value="Matter under scrutiny">Matter under scrutiny</option>
                      <option value="Issue resolved">Issue resolved</option>
                      <option value="Intentional and repeated reporting from buyer">
                        Intentional and repeated reporting from buyer
                      </option>
                      <option value="Delivery denied by buyer">Delivery denied by buyer</option>
                      <option value="Other special case">Other special case</option>
                    </select>
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    <PenaltyDropdown
                      value={penalty}
                      onChange={setPenalty}
                      disabled={!rowSelected}
                    />
                  </td>
                  <td className="border-r border-slate-200 px-4 py-1.5 text-center">1</td>
                  <td className="border-r border-slate-200 p-2">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={!rowSelected}
                      className={[
                        inputClass,
                        !rowSelected ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : '',
                      ].join(' ')}
                    >
                      <option value="Closed">Closed</option>
                      <option value="Pending">Pending</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Closed and Waiver">Closed and Waiver</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="border-r border-slate-200 px-4 py-2">India</td>
                  <td className="border-r border-slate-200 px-4 py-2">Mumbai</td>
                  <td className="border-r border-slate-200 px-4 py-2">+911234567890</td>
                  <td className="border-r border-slate-200 px-4 py-2">C&amp;D Retail LLP</td>
                  <td className="px-4 py-2">
                    <span className="force-lowercase">customer@example.com</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'Reviews' && (
        <>
          <h2 className="text-4xl font-bold text-primary">Reviews</h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex w-full max-w-md">
              <Input
                placeholder="Search by Name/ Mobile No./ Product ID"
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                className="flex-1"
              />
            </div>

            <Button variant="success">
              Save
            </Button>
            <Button
              variant="danger"
              disabled={!reviewRowSelected}
            >
              Delete
            </Button>
          </div>

          <div className="overflow-x-auto border border-slate-200 bg-white">
            <table className="min-w-[1500px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-white text-slate-900">
                  <th className="border-r border-slate-200 px-4 py-2 font-bold">&nbsp;</th>
                  <th className="border-r border-slate-200 px-4 py-2 font-bold">Date</th>
                  <th className="border-r border-slate-200 px-4 py-2 font-bold">Ticket No.</th>
                  <th className="border-r border-slate-200 px-4 py-2 font-bold">Group</th>
                  <th className="border-r border-slate-200 px-4 py-2 font-bold">Rating</th>
                  <th className="border-r border-slate-200 px-4 py-2 font-bold">Customer Feedback</th>
                  <th className="border-r border-slate-200 px-4 py-2 font-bold">Reply</th>
                  <th className="border-r border-slate-200 px-4 py-2 font-bold">Emp Code</th>
                  <th className="border-r border-slate-200 px-4 py-2 font-bold">Country</th>
                  <th className="border-r border-slate-200 px-4 py-2 font-bold">Customer Name</th>
                  <th className="border-r border-slate-200 px-4 py-2 font-bold">Mobile No.</th>
                  <th className="px-4 py-2 font-bold">Customer Email ID</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="border-r border-slate-200 px-4 py-2">
                    <input
                      type="checkbox"
                      checked={reviewRowSelected}
                      onChange={(e) => setReviewRowSelected(e.target.checked)}
                      className="h-4 w-4 cursor-pointer accent-primary"
                      aria-label="Select review row"
                    />
                  </td>
                  <td className="border-r border-slate-200 whitespace-nowrap px-4 py-2">7-12-2024</td>
                  <td className="border-r border-slate-200 px-4 py-2">TICK12345</td>
                  <td className="border-r border-slate-200 px-4 py-2">Cake</td>
                  <td className="border-r border-slate-200 px-4 py-2 text-yellow-400">
                    <span aria-label="5 star rating" title="5 star rating">
                      ★★★★★
                    </span>
                  </td>
                  <td className="border-r border-slate-200 px-4 py-2 text-slate-700">
                    hello this is a sample review from the user side hello this is a sample review from the us
                  </td>
                  <td className="border-r border-slate-200 p-2">
                    <select
                      value={reviewReply}
                      onChange={(e) => setReviewReply(e.target.value)}
                      disabled={!reviewRowSelected}
                      className={[
                        inputClass,
                        !reviewRowSelected ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500' : '',
                      ].join(' ')}
                    >
                      <option value="">Select Reply</option>
                      <option value="Thanks for valued reply.">Thanks for valued reply.</option>
                      <option value="We have escalated this matter with concern Team.">
                        We have escalated this matter with concern Team.
                      </option>
                      <option value="We will try to resolve this matter in 24 hrs.">
                        We will try to resolve this matter in 24 hrs.
                      </option>
                      <option value="Our team will get back to you in 24Hrs">
                        Our team will get back to you in 24Hrs
                      </option>
                    </select>
                  </td>
                  <td className="border-r border-slate-200 px-4 py-2">2154A</td>
                  <td className="border-r border-slate-200 px-4 py-2">USA</td>
                  <td className="border-r border-slate-200 px-4 py-2">John Doe</td>
                  <td className="border-r border-slate-200 px-4 py-2">+91 9876543321</td>
                  <td className="px-4 py-2">
                    <span className="force-lowercase">john.doe@example.com</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'MIS' && (
        <>
          <h2 className="text-4xl font-bold text-primary">MIS</h2>

          <div className="overflow-x-auto rounded-sm border-2 border-primary bg-white shadow-sm">
            <div
              className="grid min-w-[1080px] gap-0 bg-primary px-2 py-3 text-left text-sm font-semibold text-white"
              style={{ gridTemplateColumns: '1.1fr 1.1fr 1.1fr 1.1fr 1.1fr 1.1fr 0.9fr' }}
            >
              <div className="px-2">From Date</div>
              <div className="px-2">To Date</div>
              <div className="px-2">Department</div>
              <div className="px-2">Segment</div>
              <div className="px-2">Report Type</div>
              <div className="px-2">Output Format</div>
              <div className="px-2">Actions</div>
            </div>

            <div
              className="grid min-w-[1080px] items-center gap-3 border-t border-primary/30 bg-white px-2 py-3"
              style={{ gridTemplateColumns: '1.1fr 1.1fr 1.1fr 1.1fr 1.1fr 1.1fr 0.9fr' }}
            >
              <div className="px-1">
                <input
                  type="date"
                  value={misFromDate}
                  onChange={(e) => setMisFromDate(e.target.value)}
                  className={`${inputClass} min-w-0 [color-scheme:light]`}
                  aria-label="From date"
                />
              </div>
              <div className="px-1">
                <input
                  type="date"
                  value={misToDate}
                  onChange={(e) => setMisToDate(e.target.value)}
                  className={`${inputClass} min-w-0 [color-scheme:light]`}
                  aria-label="To date"
                />
              </div>
              <div className="px-1">
                <div className={`${inputClass} flex items-center bg-slate-100 font-semibold text-slate-700`}>
                  Customer Care
                </div>
              </div>
              <div className="px-1">
                <input
                  type="text"
                  value={misSegment}
                  onChange={(e) => setMisSegment(e.target.value)}
                  placeholder="(optional)"
                  className={inputClass}
                />
              </div>
              <div className="px-1">
                <select
                  value={misReportType}
                  onChange={(e) => setMisReportType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select Report</option>
                  <option value="customer-review">Customer Review</option>
                  <option value="report-an-issue">Report an Issue</option>
                  <option value="refer-and-earn">Refer &amp; Earn</option>
                  <option value="contest">Contest</option>
                  <option value="customer-profile">Customer-Profile</option>
                </select>
              </div>
              <div className="px-1">
                <div className={`${inputClass} flex items-center bg-slate-100 font-semibold text-slate-700`}>
                  Excel
                </div>
              </div>
              <div className="flex px-1">
                <GenerateButton onClick={() => {}} />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab !== 'Report an Issue' && activeTab !== 'Reviews' && activeTab !== 'MIS' && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
          {activeTab} content coming soon.
        </div>
      )}
    </section>
  );
};
