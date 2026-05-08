import React from 'react';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { GenerateButton } from '../components/GenerateButton';
import ReportFilters from '../components/ReportFilters';

const TABS = ['MIS', 'Verifier'] as const;

const inputClass =
  'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';
const disabledFieldClass = `${inputClass} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500`;
const VERIFIER_COUNTRIES = [
  'India',
  'Bahrain',
  'Bangladesh',
  'Bhutan',
  'Indonesia',
  'Jordan',
  'Malaysia',
  'Maldives',
  'Philippines',
  'Singapore',
  'Sri Lanka',
  'Qatar',
  'Thailand',
  'UAE-Dubai',
  'Vietnam',
] as const;
const selectStatusOptions = ['Select Option', 'Pending', 'Verified', 'Refused', 'Re-Upload'] as const;
const productOptions = ['Select a Product', 'Cake', 'Store', 'Tour', 'BGT - B2B', 'Boutique', 'Logistics'] as const;
const shopLocationOptions = ['Select Option', 'Pending', 'Verified', 'Not Found', 'Criminal Issue'] as const;
const verifierStatusOptions = ['Select Status', 'Approved', 'Re-upload', 'Block Vendor'] as const;
const currencyOptions = ['INR', 'USD', 'BHD', 'BTN', 'IDR', 'JOD', 'MYR', 'MVR', 'PHP', 'SGD', 'LKR', 'QAR', 'THB', 'AED', 'VND'] as const;

export const VerifierPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]>('MIS');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [reportType, setReportType] = React.useState('mis-verifier');
  const [loginId, setLoginId] = React.useState('sample@example.com');
  const [country, setCountry] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [emailStatus, setEmailStatus] = React.useState('Select Option');
  const [mobileStatus, setMobileStatus] = React.useState('Select Option');
  const [product, setProduct] = React.useState('Select a Product');
  const [photoStatus, setPhotoStatus] = React.useState('Select Option');
  const [bankStatus, setBankStatus] = React.useState('Select Option');
  const [shopLocation, setShopLocation] = React.useState('Select Option');
  const [promoterStatus, setPromoterStatus] = React.useState('Select Option');
  const [dataEntryStatus, setDataEntryStatus] = React.useState('Select Option');
  const [documentStatus, setDocumentStatus] = React.useState('Select Option');
  const [verifierStatus, setVerifierStatus] = React.useState('Select Status');
  const [currency, setCurrency] = React.useState('INR');
  const [fees, setFees] = React.useState('');

  return (
    <section className="flex w-full flex-col gap-4">
      <nav className="flex flex-wrap gap-2 overflow-x-auto" aria-label="Verifier tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              'rounded-md border px-4 py-1.5 text-sm font-semibold shadow-sm transition',
              activeTab === tab
                ? 'border-primary bg-primary text-white hover:bg-primary-dark'
                : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50',
            ].join(' ')}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'MIS' && (
        <>
          <h2 className="text-4xl font-bold text-primary">MIS</h2>

          <ReportFilters
            columns={['From Date', 'To Date', 'Department', 'Business Code', 'Report Type', 'Output Format', 'Actions']}
            gridTemplate="1.1fr 1.1fr 1fr 1fr 1fr 1fr 0.95fr"
            gap="gap-x-2"
            paddingY="py-4"
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
              <Input isReadOnly value="Verifier" />
            </div>
            <div className="px-1">
              <Input isReadOnly value="PRAV2154A" />
            </div>
            <div className="px-1">
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                isReadOnly
                options={[{ value: 'mis-verifier', label: 'MIS - Verifier' }]}
              />
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

      {activeTab === 'Verifier' && (
        <>
          <h2 className="text-4xl font-bold text-primary">Verifier</h2>

          <ReportFilters
            columns={[
              'Date', 'Login ID', 'Country', 'Company Name', 'Email', 'Mobile No.', 
              'Product', 'Photo', 'Bank', 'Shop Location', 'Promoter', 'Data Entry', 
              'Documents', 'Status', 'Currency', 'Fees', 'Verifier ID'
            ]}
            minWidth="3200px"
            gridTemplate="repeat(17, 1fr)"
            paddingY="py-4"
          >
            <div className="px-1">
              <Input isReadOnly value="04/17/2026" />
            </div>
            <div className="px-1">
              <Input value={loginId} onChange={(e) => setLoginId(e.target.value)} />
            </div>
            <div className="px-1">
              <Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                options={[
                  { value: '', label: 'Select Country' },
                  ...VERIFIER_COUNTRIES.map((c) => ({ value: c, label: c }))
                ]}
              />
            </div>
            <div className="px-1">
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter Company"
              />
            </div>
            <div className="px-1">
              <Select
                value={emailStatus}
                onChange={(e) => setEmailStatus(e.target.value)}
                options={selectStatusOptions.map((o) => ({ value: o, label: o }))}
              />
            </div>
            <div className="px-1">
              <Select
                value={mobileStatus}
                onChange={(e) => setMobileStatus(e.target.value)}
                options={selectStatusOptions.map((o) => ({ value: o, label: o }))}
              />
            </div>
            <div className="px-1">
              <Select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                options={productOptions.map((o) => ({ value: o, label: o }))}
              />
            </div>
            <div className="px-1">
              <Select
                value={photoStatus}
                onChange={(e) => setPhotoStatus(e.target.value)}
                options={selectStatusOptions.map((o) => ({ value: o, label: o }))}
              />
            </div>
            <div className="px-1">
              <Select
                value={bankStatus}
                onChange={(e) => setBankStatus(e.target.value)}
                options={selectStatusOptions.map((o) => ({ value: o, label: o }))}
              />
            </div>
            <div className="px-1">
              <Select
                value={shopLocation}
                onChange={(e) => setShopLocation(e.target.value)}
                options={shopLocationOptions.map((o) => ({ value: o, label: o }))}
              />
            </div>
            <div className="px-1">
              <Select
                value={promoterStatus}
                onChange={(e) => setPromoterStatus(e.target.value)}
                options={shopLocationOptions.map((o) => ({ value: o, label: o }))}
              />
            </div>
            <div className="px-1">
              <Select
                value={dataEntryStatus}
                onChange={(e) => setDataEntryStatus(e.target.value)}
                options={selectStatusOptions.map((o) => ({ value: o, label: o }))}
              />
            </div>
            <div className="px-1">
              <Select
                value={documentStatus}
                onChange={(e) => setDocumentStatus(e.target.value)}
                options={selectStatusOptions.map((o) => ({ value: o, label: o }))}
              />
            </div>
            <div className="px-1">
              <Select
                value={verifierStatus}
                onChange={(e) => setVerifierStatus(e.target.value)}
                options={verifierStatusOptions.map((o) => ({ value: o, label: o }))}
              />
            </div>
            <div className="px-1">
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={currencyOptions.map((o) => ({ value: o, label: o }))}
              />
            </div>
            <div className="px-1">
              <Input
                inputMode="numeric"
                value={fees}
                onChange={(e) => setFees(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="px-2 py-1.5 text-base font-bold text-slate-800">1A23FA</div>
          </ReportFilters>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Save
            </button>
          </div>
        </>
      )}
    </section>
  );
};
