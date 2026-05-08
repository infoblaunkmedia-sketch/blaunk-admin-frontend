import React from 'react';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { GenerateButton } from '../components/GenerateButton';
import ReportFilters from '../components/ReportFilters';

type ConfigItem = { securityCode: string; captcha: string };
type IpRow = { id: string; serviceProvider: string; ipAddress: string };
type MacAddressRow = { id: string; serviceProvider: string; macAddress: string };

type SecuritySectionId = 'captcha' | 'ip' | 'mac';

const ALL_SECURITY_CODES = [
  'Management',
  'Finance',
  'M & A',
  'Sales',
  'Company Secretary',
  'HR',
  'Payslip',
  'IT Dept',
  'Admin & Personnel',
  'Customer Care',
  'Retail Shop',
  'DSA',
  'Verifier',
  'RETAIL MANAGEMENT',
];

function mergeConfigs(apiConfigs: ConfigItem[]): ConfigItem[] {
  const map = new Map(apiConfigs.map((c) => [c.securityCode, c.captcha ?? '']));
  return ALL_SECURITY_CODES.map((securityCode) => ({
    securityCode,
    captcha: map.get(securityCode) ?? '',
  }));
}

const inputClass =
  'min-w-0 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

type TabId = 'security' | 'mis' | 'upload';

const TABS: { id: TabId; label: string }[] = [
  { id: 'security', label: 'Security' },
  { id: 'mis', label: 'MIS' },
  { id: 'upload', label: 'Upload' },
];

function CollapsibleSecuritySection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 border-b border-slate-200 bg-primary px-4 py-3 text-left text-lg font-semibold text-white sm:px-6 sm:text-xl"
      >
        <span>{title}</span>
        <svg
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {expanded ? <div>{children}</div> : null}
    </section>
  );
}

const MIS_GRID_STYLE: React.CSSProperties = {
  gridTemplateColumns: 'minmax(6rem, 1fr) minmax(6rem, 1fr) minmax(5rem, 1fr) minmax(5rem, 1fr) minmax(8rem, 1.2fr) minmax(5rem, 1fr) auto',
};

function MisReportForm() {
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [department, setDepartment] = React.useState('IT');
  const [code, setCode] = React.useState('');
  const [reportType, setReportType] = React.useState('MIS - DDP');
  const [outputFormat, setOutputFormat] = React.useState('Excel');

  const handleGenerate = () => {
    // TODO: hook to MIS report API
    console.log({ fromDate, toDate, department, code, reportType, outputFormat });
  };

  return (
    <div className="w-full">
      <ReportFilters
        columns={['From Date', 'To Date', 'Department', 'Code', 'Report Type', 'Output Format', 'Actions']}
        gridTemplate="1.1fr 1.1fr 1fr 1fr 1.2fr 1fr 0.9fr"
        paddingY="py-4"
        gap="gap-x-2"
      >
        <div className="px-1">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="px-1">
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="px-1">
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div className="px-1">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="(optional)"
          />
        </div>
        <div className="px-1">
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'MIS - DDP', label: 'MIS - DDP' },
              { value: 'MIS - DSA Pay', label: 'MIS - DSA Pay' },
              { value: 'MIS - DSA Sales', label: 'MIS - DSA Sales' },
              { value: 'mis-dsa-ads', label: 'MIS - DSA Ads' }
            ]}
          />
        </div>
        <div className="px-1">
          <Select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            options={[
              { value: 'Excel', label: 'Excel' },
              { value: 'PDF', label: 'PDF' }
            ]}
          />
        </div>
        <div className="px-1">
          <GenerateButton onClick={handleGenerate} isFullWidth size="md" />
        </div>
      </ReportFilters>
    </div>
  );
}

export const CaptchaPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabId>('security');
  const [configs, setConfigs] = React.useState<ConfigItem[]>([]);
  const [ipList, setIpList] = React.useState<IpRow[]>([]);
  const [macList, setMacList] = React.useState<MacAddressRow[]>([]);
  const [sectionOpen, setSectionOpen] = React.useState<Record<SecuritySectionId, boolean>>({
    captcha: true,
    ip: false,
    mac: false,
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [ipSaving, setIpSaving] = React.useState(false);
  const [macSaving, setMacSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [ipMessage, setIpMessage] = React.useState<string | null>(null);
  const [macMessage, setMacMessage] = React.useState<string | null>(null);

  const loadCaptcha = React.useCallback(() => {
    setMessage(null);
    setConfigs(mergeConfigs([]));
    return Promise.resolve();
  }, []);

  const loadIp = React.useCallback(() => {
    setIpMessage(null);
    setIpList([]);
    return Promise.resolve();
  }, []);

  const loadMac = React.useCallback(() => {
    setMacMessage(null);
    setMacList([]);
    return Promise.resolve();
  }, []);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([loadCaptcha(), loadIp(), loadMac()]).finally(() => setLoading(false));
  }, [loadCaptcha, loadIp, loadMac]);

  const updateCaptcha = (securityCode: string, captcha: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.securityCode === securityCode ? { ...c, captcha } : c)),
    );
  };

  const handleSaveCaptcha = async () => {
    setSaving(true);
    setMessage(null);
    try {
      setMessage('Saved locally (no server).');
    } finally {
      setSaving(false);
    }
  };

  const updateIpRow = (id: string, field: 'serviceProvider' | 'ipAddress', value: string) => {
    setIpList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const handleAddIpRow = () => {
    setIpList((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, serviceProvider: '', ipAddress: '' },
    ]);
  };

  const handleDeleteIpRow = async (id: string) => {
    setIpList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveIp = async () => {
    setIpSaving(true);
    setIpMessage(null);
    try {
      setIpList((prev) =>
        prev.map((r, i) => ({
          ...r,
          id: r.id.startsWith('new-') ? `local-ip-${i}-${Date.now()}` : r.id,
        })),
      );
      setIpMessage('Saved locally (no server).');
    } finally {
      setIpSaving(false);
    }
  };

  const updateMacRow = (id: string, field: 'serviceProvider' | 'macAddress', value: string) => {
    setMacList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const handleAddMacRow = () => {
    setMacList((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, serviceProvider: '', macAddress: '' },
    ]);
  };

  const handleDeleteMacRow = async (id: string) => {
    setMacList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveMac = async () => {
    setMacSaving(true);
    setMacMessage(null);
    try {
      setMacList((prev) =>
        prev.map((r, i) => ({
          ...r,
          id: r.id.startsWith('new-') ? `local-mac-${i}-${Date.now()}` : r.id,
        })),
      );
      setMacMessage('Saved locally (no server).');
    } finally {
      setMacSaving(false);
    }
  };

  const toggleSection = (id: SecuritySectionId) => {
    setSectionOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div>
      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id)}
      />

      {activeTab === 'security' && (
        <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
          <CollapsibleSecuritySection
            title="Captcha"
            expanded={sectionOpen.captcha}
            onToggle={() => toggleSection('captcha')}
          >
            {message ? (
              <div
                className={`mx-4 mt-3 rounded-md border px-3 py-2 text-sm sm:mx-6 ${
                  message.startsWith('Saved')
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {message}
              </div>
            ) : null}
            <div className="overflow-x-auto p-4 sm:p-6">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 font-medium text-slate-700">Security Code</th>
                      <th className="px-3 py-2 font-medium text-slate-700">Captcha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {configs.map((row) => (
                      <tr key={row.securityCode}>
                        <td className="px-3 py-2 font-medium text-slate-700">
                          {row.securityCode}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.captcha}
                            onChange={(e) =>
                              updateCaptcha(row.securityCode, e.target.value)
                            }
                            className={`${inputClass} min-w-[10rem] w-full`}
                            placeholder="e.g. BLAUNK3"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSaveCaptcha}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </CollapsibleSecuritySection>

          <CollapsibleSecuritySection
            title="IP Address"
            expanded={sectionOpen.ip}
            onToggle={() => toggleSection('ip')}
          >
            {ipMessage ? (
              <div
                className={`mx-4 mt-3 rounded-md border px-3 py-2 text-sm sm:mx-6 ${
                  ipMessage.startsWith('Saved')
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {ipMessage}
              </div>
            ) : null}
            <div className="overflow-x-auto p-4 sm:p-6">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 font-medium text-slate-700">Service Provider</th>
                      <th className="px-3 py-2 font-medium text-slate-700">IP Address</th>
                      <th className="w-20 px-3 py-2 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {ipList.map((row) => (
                      <tr key={row.id}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.serviceProvider}
                            onChange={(e) =>
                              updateIpRow(row.id, 'serviceProvider', e.target.value)
                            }
                            className={`${inputClass} min-w-[8rem] w-full`}
                            placeholder="e.g. AIRTEL"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.ipAddress}
                            onChange={(e) =>
                              updateIpRow(row.id, 'ipAddress', e.target.value)
                            }
                            className={`${inputClass} min-w-[10rem] w-full`}
                            placeholder="e.g. 192.168.1.1"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteIpRow(row.id)}
                            className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={handleAddIpRow}>
                  Add Row
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSaveIp}
                  disabled={ipSaving}
                >
                  {ipSaving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </CollapsibleSecuritySection>

          <CollapsibleSecuritySection
            title="MAC Address"
            expanded={sectionOpen.mac}
            onToggle={() => toggleSection('mac')}
          >
            {macMessage ? (
              <div
                className={`mx-4 mt-3 rounded-md border px-3 py-2 text-sm sm:mx-6 ${
                  macMessage.startsWith('Saved')
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {macMessage}
              </div>
            ) : null}
            <div className="overflow-x-auto p-4 sm:p-6">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 font-medium text-slate-700">Service Provider</th>
                      <th className="px-3 py-2 font-medium text-slate-700">MAC Address</th>
                      <th className="w-20 px-3 py-2 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {macList.map((row) => (
                      <tr key={row.id}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.serviceProvider}
                            onChange={(e) =>
                              updateMacRow(row.id, 'serviceProvider', e.target.value)
                            }
                            className={`${inputClass} min-w-[8rem] w-full`}
                            placeholder="e.g. AIRTEL"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.macAddress}
                            onChange={(e) =>
                              updateMacRow(row.id, 'macAddress', e.target.value)
                            }
                            className={`${inputClass} min-w-[10rem] w-full font-mono text-xs sm:text-sm`}
                            placeholder="e.g. 00:1A:2B:3C:4D:5E"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteMacRow(row.id)}
                            className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={handleAddMacRow}>
                  Add Row
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSaveMac}
                  disabled={macSaving}
                >
                  {macSaving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </CollapsibleSecuritySection>
        </div>
      )}

      {activeTab === 'mis' && (
        <MisReportForm />
      )}

      {activeTab === 'upload' && (
        <div className="p-4 sm:p-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-slate-600">
            <p className="font-medium">Upload</p>
            <p className="mt-1 text-sm">Upload options will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
};
