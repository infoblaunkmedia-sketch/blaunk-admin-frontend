import React from 'react';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { Input } from '../components/Input';
import { GenerateButton } from '../components/GenerateButton';
import ReportFilters from '../components/ReportFilters';

const TABS = [
  'Country Login',
  'MIS',
  'Country Media',
  'Tag',
  'Verifier',
  'Media',
  'Contest',
] as const;

// Flag images from Flagpedia (reliable public source; Google does not provide a flag CDN)
const FLAG_BASE = 'https://flagpedia.net/data/flags/w160';

function Flag({ code, size = 24 }: { code: string; size?: number }) {
  if (!code || code.length !== 2) return null;
  const c = code.toLowerCase();
  const src = `${FLAG_BASE}/${c}.webp`;
  return (
    <img
      src={src}
      alt=""
      className="inline-block shrink-0 rounded-sm object-cover shadow-sm"
      width={size}
      height={Math.round(size * 0.75)}
      loading="lazy"
    />
  );
}

type CountryLoginRow = {
  country: string;
  code: string;
  visitor: number;
  web: number;
  android: number;
  ios: number;
};

const MOCK_COUNTRY_LOGIN: CountryLoginRow[] = [
  { country: 'India', code: 'IN', visitor: 120, web: 50, android: 30, ios: 40 },
  { country: 'Bahrain', code: 'BH', visitor: 45, web: 20, android: 15, ios: 10 },
  { country: 'Bangladesh', code: 'BD', visitor: 80, web: 35, android: 25, ios: 20 },
  { country: 'Bhutan', code: 'BT', visitor: 22, web: 10, android: 6, ios: 6 },
  { country: 'Indonesia', code: 'ID', visitor: 95, web: 40, android: 30, ios: 25 },
  { country: 'Jordan', code: 'JO', visitor: 38, web: 18, android: 10, ios: 10 },
  { country: 'Malaysia', code: 'MY', visitor: 72, web: 32, android: 22, ios: 18 },
  { country: 'Maldives', code: 'MV', visitor: 60, web: 25, android: 20, ios: 15 },
  { country: 'Nepal', code: 'NP', visitor: 55, web: 25, android: 18, ios: 12 },
  { country: 'Philippines', code: 'PH', visitor: 88, web: 38, android: 28, ios: 22 },
  { country: 'Singapore', code: 'SG', visitor: 160, web: 80, android: 40, ios: 40 },
  { country: 'Sri Lanka', code: 'LK', visitor: 62, web: 28, android: 20, ios: 14 },
  { country: 'Qatar', code: 'QA', visitor: 42, web: 20, android: 12, ios: 10 },
  { country: 'Thailand', code: 'TH', visitor: 105, web: 45, android: 35, ios: 25 },
  { country: 'UAE-Dubai', code: 'AE', visitor: 180, web: 80, android: 60, ios: 40 },
  { country: 'Vietnam', code: 'VN', visitor: 90, web: 40, android: 30, ios: 20 },
];

export const AdminPersonnelPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]>('MIS');
  const [misFromDate, setMisFromDate] = React.useState('');
  const [misToDate, setMisToDate] = React.useState('');
  const [mediaCountry, setMediaCountry] = React.useState('India');
  const [mediaSection, setMediaSection] = React.useState('BGT: Connect with farmers');
  const [mediaFiles, setMediaFiles] = React.useState<Record<number, string>>({});
  const [mediaPreviews, setMediaPreviews] = React.useState<Record<number, string>>({});
  const [tagSearch, setTagSearch] = React.useState('');
  const [tagProduct, setTagProduct] = React.useState('Cake');
  const [tagGrade, setTagGrade] = React.useState('Best Seller');
  const [tagProductId, setTagProductId] = React.useState('12345678901');
  const [tagTaggedOn, setTagTaggedOn] = React.useState('');
  const [tagExpireOn, setTagExpireOn] = React.useState('2024-12-31');
  const [tagApprovedBy, setTagApprovedBy] = React.useState('ASD12F');
  const [tagStatus, setTagStatus] = React.useState('Approved');
  const [tagAmount, setTagAmount] = React.useState('');
  const [tagEmpCode, setTagEmpCode] = React.useState('');
  const [verifierSearch, setVerifierSearch] = React.useState('');
  const [verifierSelected, setVerifierSelected] = React.useState(false);
  const [verifierAction, setVerifierAction] = React.useState('Pending');
  const [mediaTabFiles, setMediaTabFiles] = React.useState<Record<string, string>>({});
  const [mediaSectionPreviews, setMediaSectionPreviews] = React.useState<Record<string, string>>({});
  const [mediaEditing, setMediaEditing] = React.useState(false);
  const [contestEditing, setContestEditing] = React.useState(false);
  const [contestQuestion, setContestQuestion] = React.useState('');
  const [contestAnswers, setContestAnswers] = React.useState<string[]>([
    '',
    '',
    '',
    '',
    '',
  ]);
  const filterInputClass =
    'h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';
  const MAX_MEDIA_UPLOAD_KB = 700;

  return (
    <section className="flex w-full flex-col gap-4">
      <Tabs
        tabs={TABS.map(t => ({ id: t, label: t }))}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id)}
      />

      <div>
        {activeTab === 'MIS' && (
          <>
            <h2 className="mb-4 text-4xl font-bold text-primary">MIS</h2>
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
                <Input isReadOnly value="Admin" />
              </div>
              <div className="px-1">
                <Input isReadOnly value="All" />
              </div>
              <div className="px-1">
                <Input isReadOnly value="MIS - Verifier" />
              </div>
              <div className="px-1">
                <Input isReadOnly value="Excel" />
              </div>
              <div className="px-1">
                <GenerateButton onClick={() => {}} />
              </div>
            </ReportFilters>
          </>
        )}

        {activeTab === 'Country Login' && (
          <>
            <h2 className="mb-4 text-2xl font-bold text-primary">Country Login</h2>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 py-3 font-medium">Country</th>
                    <th className="px-4 py-3 font-medium">Visitor</th>
                    <th className="px-4 py-3 font-medium">Web based</th>
                    <th className="px-4 py-3 font-medium">Android</th>
                    <th className="px-4 py-3 font-medium">iOS</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {MOCK_COUNTRY_LOGIN.map((row, index) => (
                    <tr
                      key={row.code}
                      className={
                        index % 2 === 0
                          ? 'bg-white hover:bg-slate-50'
                          : 'bg-slate-50/70 hover:bg-slate-100'
                      }
                    >
                      <td className="flex items-center gap-2 px-4 py-3 font-medium text-slate-800">
                        <Flag code={row.code} size={24} />
                        {row.country}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.visitor}</td>
                      <td className="px-4 py-3 text-slate-600">{row.web}</td>
                      <td className="px-4 py-3 text-slate-600">{row.android}</td>
                      <td className="px-4 py-3 text-slate-600">{row.ios}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {row.visitor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'Country Media' && (
          <>
            <h2 className="mb-4 text-4xl font-bold text-primary">Country Media</h2>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
              <div className="mb-4 flex flex-wrap items-end gap-4">
                <div className="w-full min-w-[11rem] sm:w-auto sm:min-w-[9rem]">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Country</label>
                  <select value={mediaCountry} onChange={(e) => setMediaCountry(e.target.value)} className={filterInputClass}>
                    <option value="India">India</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Bhutan">Bhutan</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Thailand">Thailand</option>
                    <option value="UAE-Dubai">UAE-Dubai</option>
                    <option value="Vietnam">Vietnam</option>
                  </select>
                </div>

                <div className="w-full min-w-[15rem] sm:w-auto sm:min-w-[15rem]">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Section</label>
                  <select value={mediaSection} onChange={(e) => setMediaSection(e.target.value)} className={filterInputClass}>
                    <option value="BGT: Connect with farmers">BGT: Connect with farmers</option>
                    <option value="Homepage: B2B marketing">Homepage: B2B marketing</option>
                    <option value="Tour: Long Ads">Tour: Long Ads</option>
                    <option value="Cake: Celebration">Cake: Celebration</option>
                    <option value="Boutique">Boutique</option>
                    <option value="Logistic: Main slider">Logistic: Main slider</option>
                  </select>
                </div>

                <Button variant="success" onClick={() => {}}>
                  Save
                </Button>
              </div>

              <h3 className="mb-4 text-3xl font-semibold text-slate-800">{mediaSection}</h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const slot = idx + 1;
                  const preview = mediaPreviews[slot];
                  const fileName = mediaFiles[slot] || `Click to update (max ${MAX_MEDIA_UPLOAD_KB}KB)`;
                  return (
                    <div key={slot} className="flex flex-col items-center gap-2">
                      <p className="text-lg font-bold text-slate-800">B{slot}</p>
                      <label className="flex h-40 w-28 cursor-pointer flex-col overflow-hidden border border-rose-300 bg-white">
                        <div className="border-b border-rose-300 bg-[#ececab] px-2 py-1 text-center text-[11px] font-semibold text-slate-700">
                          Image
                        </div>
                        {preview ? (
                          <div className="flex flex-1 items-center justify-center bg-slate-100 p-1">
                            <img src={preview} alt={`B${slot}`} className="max-h-full max-w-full object-contain" />
                          </div>
                        ) : (
                          <div className="flex flex-1 items-start justify-center px-1 pt-2 text-center text-[9px] text-rose-500">
                            {fileName}
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > MAX_MEDIA_UPLOAD_KB * 1024) return;
                            const objectUrl = URL.createObjectURL(file);
                            setMediaFiles((prev) => ({ ...prev, [slot]: file.name }));
                            setMediaPreviews((prev) => ({ ...prev, [slot]: objectUrl }));
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === 'Tag' && (
          <>
            <h2 className="mb-4 text-4xl font-bold text-primary">Tag</h2>

            <div className="mb-4 flex w-full max-w-md">
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search Product ID"
                className="h-11 flex-1 rounded-l-md border border-primary bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary/25"
              />
              <button
                type="button"
                className="inline-flex h-11 w-12 items-center justify-center rounded-r-md bg-primary text-white transition hover:bg-primary-dark"
                aria-label="Search Product ID"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 bg-white">
              <table className="min-w-[980px] w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-white text-slate-900">
                    <th className="border-r border-slate-200 px-3 py-2 text-xl font-bold">Product</th>
                    <th className="border-r border-slate-200 px-3 py-2 text-xl font-bold">Grade</th>
                    <th className="border-r border-slate-200 px-3 py-2 text-xl font-bold">Product ID</th>
                    <th className="border-r border-slate-200 px-3 py-2 text-xl font-bold">Tagged on</th>
                    <th className="border-r border-slate-200 px-3 py-2 text-xl font-bold">Expire on</th>
                    <th className="border-r border-slate-200 px-3 py-2 text-xl font-bold">Approved By</th>
                    <th className="border-r border-slate-200 px-3 py-2 text-xl font-bold">Status</th>
                    <th className="border-r border-slate-200 px-3 py-2 text-xl font-bold">Amount</th>
                    <th className="border-r border-slate-200 px-3 py-2 text-xl font-bold">Emp Code</th>
                    <th className="px-3 py-2 text-xl font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200">
                    <td className="border-r border-slate-200 p-2">
                      <select value={tagProduct} onChange={(e) => setTagProduct(e.target.value)} className={`${filterInputClass} h-10`}>
                        <option value="">Select Product</option>
                        <option value="Cake">Cake</option>
                        <option value="Tour">Tour</option>
                        <option value="Store">Store</option>
                        <option value="BGT">BGT</option>
                      </select>
                    </td>
                    <td className="border-r border-slate-200 p-2">
                      <select value={tagGrade} onChange={(e) => setTagGrade(e.target.value)} className={`${filterInputClass} h-10`}>
                        <option value="">Select Grade</option>
                        <option value="Best Seller">Best Seller</option>
                        <option value="B-Assured">B-Assured</option>
                      </select>
                    </td>
                    <td className="border-r border-slate-200 p-2">
                      <input
                        type="text"
                        value={tagProductId}
                        onChange={(e) => setTagProductId(e.target.value)}
                        className={`${filterInputClass} h-10`}
                      />
                    </td>
                    <td className="border-r border-slate-200 p-2">
                      <input
                        type="date"
                        value={tagTaggedOn}
                        onChange={(e) => setTagTaggedOn(e.target.value)}
                        className={`${filterInputClass} h-10`}
                      />
                    </td>
                    <td className="border-r border-slate-200 p-2">
                      <input
                        type="date"
                        value={tagExpireOn}
                        onChange={(e) => setTagExpireOn(e.target.value)}
                        className={`${filterInputClass} h-10`}
                      />
                    </td>
                    <td className="border-r border-slate-200 p-2">
                      <input
                        type="text"
                        value={tagApprovedBy}
                        onChange={(e) => setTagApprovedBy(e.target.value)}
                        className={`${filterInputClass} h-10`}
                      />
                    </td>
                    <td className="border-r border-slate-200 p-2">
                      <select value={tagStatus} onChange={(e) => setTagStatus(e.target.value)} className={`${filterInputClass} h-10`}>
                        <option value="">Select status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                      </select>
                    </td>
                    <td className="border-r border-slate-200 p-2">
                      <input
                        type="text"
                        value={tagAmount}
                        onChange={(e) => setTagAmount(e.target.value)}
                        className={`${filterInputClass} h-10`}
                      />
                    </td>
                    <td className="border-r border-slate-200 p-2">
                      <input
                        type="text"
                        value={tagEmpCode}
                        onChange={(e) => setTagEmpCode(e.target.value)}
                        className={`${filterInputClass} h-10`}
                      />
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-rose-600 text-white transition hover:bg-rose-700"
                        aria-label="Delete row"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="success" onClick={() => {}}>
                Save
              </Button>
            </div>
          </>
        )}

        {activeTab === 'Verifier' && (
          <>
            <h2 className="mb-4 text-4xl font-bold text-primary">Verifier</h2>

            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="flex w-full max-w-md">
                <input
                  type="text"
                  value={verifierSearch}
                  onChange={(e) => setVerifierSearch(e.target.value)}
                  placeholder="Search by Vendor PAN or Mobile No."
                  className="h-11 flex-1 rounded-l-md border border-primary bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary/25"
                />
                <button
                  type="button"
                  className="inline-flex h-11 w-12 items-center justify-center rounded-r-md bg-primary text-white transition hover:bg-primary-dark"
                  aria-label="Search verifier"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <Button onClick={() => {}}>
                Save Changes
              </Button>
            </div>

            <div className="overflow-x-auto border border-slate-200 bg-white">
              <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-5 py-3 font-semibold">&nbsp;</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Login ID</th>
                    <th className="px-5 py-3 font-semibold">Country</th>
                    <th className="px-5 py-3 font-semibold">Company Name</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Mobile No.</th>
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold">Photo</th>
                    <th className="px-5 py-3 font-semibold">Bank</th>
                    <th className="px-5 py-3 font-semibold">Shop Location</th>
                    <th className="px-5 py-3 font-semibold">Promoter</th>
                    <th className="px-5 py-3 font-semibold">Data Entry</th>
                    <th className="px-5 py-3 font-semibold">Documents</th>
                    <th className="px-5 py-3 font-semibold">Request</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Currency</th>
                    <th className="px-5 py-3 font-semibold">Fees</th>
                    <th className="px-5 py-3 font-semibold">Verifier ID</th>
                    <th className="px-5 py-3 font-semibold">Employee ID</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200 bg-white">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={verifierSelected}
                        onChange={(e) => setVerifierSelected(e.target.checked)}
                        className="h-4 w-4 cursor-pointer accent-primary"
                        aria-label="Select verifier row"
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-700">16-04-2026</td>
                    <td className="px-5 py-3 text-slate-700">
                      <span className="force-lowercase">sample@example.com</span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">India</td>
                    <td className="px-5 py-3 text-slate-700">Sample Company</td>
                    <td className="px-5 py-3 text-slate-700">Verified</td>
                    <td className="px-5 py-3 text-slate-700">Verified</td>
                    <td className="px-5 py-3 text-slate-700">Cake</td>
                    <td className="px-5 py-3 text-slate-700">Verified</td>
                    <td className="px-5 py-3 text-slate-700">Pending</td>
                    <td className="px-5 py-3 text-slate-700">Verified</td>
                    <td className="px-5 py-3 text-slate-700">Pending</td>
                    <td className="px-5 py-3 text-slate-700">Verified</td>
                    <td className="px-5 py-3 text-slate-700">Verified</td>
                    <td className="px-5 py-3 text-slate-700">Approved</td>
                    <td className="px-5 py-3 text-slate-700">Approved</td>
                    <td className="px-5 py-3 text-slate-700">Rs.</td>
                    <td className="px-5 py-3 text-slate-700">250.55</td>
                    <td className="px-5 py-3 text-slate-700">1A23FA</td>
                    <td className="px-5 py-3 text-slate-700">1A23FA</td>
                    <td className="px-5 py-2">
                      <select
                        value={verifierAction}
                        onChange={(e) => setVerifierAction(e.target.value)}
                        disabled={!verifierSelected}
                        className={[
                          'h-10 min-w-[10rem] rounded-md border px-3 text-sm outline-none transition',
                          verifierSelected
                            ? 'border-primary bg-white text-slate-900 focus:ring-2 focus:ring-primary/25'
                            : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400',
                        ].join(' ')}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Penalty">Penalty</option>
                        <option value="Reverification">Reverification</option>
                        <option value="Verified">Verified</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'Media' && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-4xl font-bold text-primary">Media</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="primary" size="lg" disabled={mediaEditing} onClick={() => setMediaEditing(true)}>
                  Edit
                </Button>
                <Button type="button" variant="success" size="lg" disabled={!mediaEditing} onClick={() => setMediaEditing(false)}>
                  Save
                </Button>
              </div>
            </div>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
              {[
                { title: 'Location Centre', count: 3, maxKb: MAX_MEDIA_UPLOAD_KB },
                { title: 'Social Media', count: 4, maxKb: MAX_MEDIA_UPLOAD_KB },
                { title: 'Become a Seller', count: 3, maxKb: MAX_MEDIA_UPLOAD_KB },
                { title: 'Blaunk Certificate', count: 1, maxKb: MAX_MEDIA_UPLOAD_KB },
                { title: 'Refer & Earn', count: 1, maxKb: MAX_MEDIA_UPLOAD_KB },
                { title: 'Contest', count: 1, maxKb: MAX_MEDIA_UPLOAD_KB },
              ].map((group) => (
                <div key={group.title} className="mb-8 last:mb-0">
                  <h3 className="mb-4 text-xl font-semibold text-slate-800">{group.title}</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: group.count }).map((_, idx) => {
                      const slotKey = `${group.title}-${idx + 1}`;
                      const preview = mediaSectionPreviews[slotKey];
                      const fileName = mediaTabFiles[slotKey] || `Click to update (max ${group.maxKb}KB)`;
                      return (
                        <div key={slotKey} className="flex flex-col items-center gap-2">
                          <label
                            className={[
                              'flex h-40 w-28 flex-col overflow-hidden border border-rose-300 bg-white',
                              mediaEditing ? 'cursor-pointer' : 'pointer-events-none cursor-not-allowed opacity-80',
                            ].join(' ')}
                          >
                            <div className="border-b border-rose-300 bg-[#ececab] px-2 py-1 text-center text-[11px] font-semibold text-slate-700">
                              Image
                            </div>
                            {preview ? (
                              <div className="flex flex-1 items-center justify-center bg-slate-100 p-1">
                                <img src={preview} alt={slotKey} className="max-h-full max-w-full object-contain" />
                              </div>
                            ) : (
                              <div className="flex flex-1 items-start justify-center px-1 pt-2 text-center text-[9px] text-rose-500">
                                {fileName}
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={!mediaEditing}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > group.maxKb * 1024) return;
                                const objectUrl = URL.createObjectURL(file);
                                setMediaTabFiles((prev) => ({ ...prev, [slotKey]: file.name }));
                                setMediaSectionPreviews((prev) => ({ ...prev, [slotKey]: objectUrl }));
                              }}
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        {activeTab === 'Contest' && (
          <>
            <h2 className="mb-4 text-4xl font-bold text-primary">Contest</h2>
            <section className="w-full max-w-2xl rounded border border-slate-200 bg-white">
              <div className="border-b border-slate-200 p-2">
                <input
                  type="text"
                  value={contestQuestion}
                  onChange={(e) => setContestQuestion(e.target.value)}
                  placeholder="Type Question"
                  disabled={!contestEditing}
                  style={
                    !contestEditing
                      ? { backgroundColor: '#f1f5f9', color: '#64748b', height: 32 }
                      : { backgroundColor: '#ffffff', color: '#0f172a', height: 32 }
                  }
                  className={[
                    filterInputClass,
                    !contestEditing
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                      : 'border-slate-300 bg-white text-slate-900',
                  ].join(' ')}
                />
              </div>

              {contestAnswers.map((answer, idx) => (
                <div key={`contest-answer-${idx}`} className="grid grid-cols-[110px,minmax(0,1fr)] items-center border-b border-slate-200 p-2 last:border-b-0">
                  <label className="pr-3 text-sm text-slate-700">{`Answer ${idx + 1}`}</label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => {
                      const next = [...contestAnswers];
                      next[idx] = e.target.value;
                      setContestAnswers(next);
                    }}
                    placeholder={`Answer ${idx + 1}`}
                    disabled={!contestEditing}
                    style={
                      !contestEditing
                        ? { backgroundColor: '#f1f5f9', color: '#64748b', height: 32 }
                        : { backgroundColor: '#ffffff', color: '#0f172a', height: 32 }
                    }
                    className={[
                      filterInputClass,
                      !contestEditing
                        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                        : 'border-slate-300 bg-white text-slate-900',
                    ].join(' ')}
                  />
                </div>
              ))}
            </section>

            <div className="mt-4">
              <Button
                variant={contestEditing ? 'success' : 'primary'}
                onClick={() => setContestEditing((prev) => !prev)}
              >
                {contestEditing ? 'Save' : 'Edit'}
              </Button>
            </div>
          </>
        )}

        {activeTab !== 'MIS' && activeTab !== 'Country Login' && activeTab !== 'Country Media' && activeTab !== 'Tag' && activeTab !== 'Verifier' && activeTab !== 'Media' && activeTab !== 'Contest' && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-500">
            {activeTab} content coming soon.
          </div>
        )}
      </div>
    </section>
  );
};
