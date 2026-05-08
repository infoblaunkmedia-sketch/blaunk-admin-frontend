import React from 'react';

const TABS = ['MIS', 'Tax Code', 'Upload', 'Voucher', 'Values'] as const;

const inputClass =
  'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

export const RetailManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]>('MIS');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [reportType, setReportType] = React.useState('mis-invoice');
  const [isEditingTaxCodes, setIsEditingTaxCodes] = React.useState(false);
  const [isEditingPurchaseEntry, setIsEditingPurchaseEntry] = React.useState(false);
  const [isEditingLogo, setIsEditingLogo] = React.useState(false);
  const [isEditingVoucher, setIsEditingVoucher] = React.useState(false);
  const [isEditingValues, setIsEditingValues] = React.useState(false);

  const handleVoucherCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 11) {
      val = val.slice(0, 11);
    }
    e.target.value = val;
  };

  const handleEmpCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 10) {
      val = val.slice(0, 10);
    }
    e.target.value = val;
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') return;
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      e.target.value = '';
    } else {
      if (val < 0) val = 0;
      if (val > 100) val = 100;
      e.target.value = val.toString();
    }
  };

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-2 w-fit" aria-label="Retail management tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              'rounded-md border px-4 py-1.5 text-sm font-semibold shadow-sm transition',
              activeTab === tab
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
            ].join(' ')}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'MIS' && (
        <>
          <h2 className="text-4xl font-bold text-primary">MIS</h2>

          <div className="overflow-x-auto rounded-sm border border-primary bg-white shadow-sm">
            <div
              className="grid min-w-[1100px] gap-0 bg-primary px-2 py-3 text-left text-base font-semibold text-white"
              style={{ gridTemplateColumns: '1.1fr 1.1fr 1fr 1fr 1fr 1fr 0.95fr' }}
            >
              <div className="px-2">From Date</div>
              <div className="px-2">To Date</div>
              <div className="px-2">Department</div>
              <div className="px-2">Business Code</div>
              <div className="px-2">Report Type</div>
              <div className="px-2">Output Format</div>
              <div className="px-2">Actions</div>
            </div>

            <div
              className="grid min-w-[1100px] items-center gap-3 border-t border-primary/30 bg-white px-2 py-3"
              style={{ gridTemplateColumns: '1.1fr 1.1fr 1fr 1fr 1fr 1fr 0.95fr' }}
            >
              <div className="px-1">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={`${inputClass} [color-scheme:light]`}
                  aria-label="From date"
                />
              </div>
              <div className="px-1">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={`${inputClass} [color-scheme:light]`}
                  aria-label="To date"
                />
              </div>
              <div className="px-1">
                <div className={`${inputClass} flex items-center bg-slate-100 font-semibold text-slate-700`}>
                  Retail Shop
                </div>
              </div>
              <div className="px-1">
                <div className={`${inputClass} flex items-center bg-slate-100 font-semibold text-slate-700`}>
                  PRAV2154A
                </div>
              </div>
              <div className="px-1">
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className={inputClass}>
                  <option value="">Select Report</option>
                  <option value="mis-invoice">MIS - Invoice</option>
                  <option value="mis-purchase">MIS - Purchase</option>
                  <option value="mis-rejection">MIS - Rejection</option>
                  <option value="mis-financial">MIS - Financial</option>
                  <option value="invoice-pdf">Invoice - PDF</option>
                </select>
              </div>
              <div className="px-1">
                <div className={`${inputClass} flex items-center bg-slate-100 font-semibold text-slate-700`}>Excel</div>
              </div>
              <div className="px-1">
                <button
                  type="button"
                  className="rounded-sm bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'Tax Code' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-[28px] font-bold text-[#0056b3]">Tax Codes</h2>
          <div>
            <button
              type="button"
              onClick={() => setIsEditingTaxCodes(!isEditingTaxCodes)}
              className={[
                'rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition',
                isEditingTaxCodes ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-dark',
              ].join(' ')}
            >
              {isEditingTaxCodes ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="overflow-x-auto max-w-[500px]">
            <table className="w-full text-left border border-[#dee2e6] border-collapse text-base">
              <thead>
                <tr className="bg-white border-b border-[#dee2e6] text-[#0056b3]">
                  <th className="p-3 font-bold w-[40%]">TAX CODE</th>
                  <th className="p-3 font-bold w-[60%]">TAX SLAB (%)</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 15 }, (_, i) => `T${i + 1}`).map((code, index) => (
                  <tr key={code} className={index % 2 !== 0 ? 'bg-white' : 'bg-[#f2f2f2]'}>
                    <td className="p-3 font-bold text-[#333] border-b border-[#dee2e6]">{code}</td>
                    <td className="p-3 border-b border-[#dee2e6]">
                      <input
                        type="text"
                        disabled={!isEditingTaxCodes}
                        className={`w-[100px] h-8 border border-[#0056b3] bg-transparent rounded px-2 outline-none focus:ring-1 focus:ring-[#0056b3] disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Upload' && (
        <div className="flex flex-col gap-8">
          <h2 className="text-[28px] font-bold text-[#0056b3]">Upload</h2>

          <div className="flex flex-wrap items-center gap-6">
            <input
              type="text"
              value="Purchase Entry"
              readOnly
              className="h-9 w-[180px] rounded-md border-2 border-[#0056b3] bg-transparent px-3 text-base font-bold text-[#333] outline-none"
            />
            
            <select
              disabled={!isEditingPurchaseEntry}
              className="h-9 w-[140px] rounded-md border-2 border-[#0056b3] bg-transparent px-2 text-base text-[#333] outline-none focus:ring-1 focus:ring-[#0056b3] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="New">New</option>
              <option value="Modify">Modify</option>
            </select>

            <input
              type="text"
              defaultValue="25/001"
              disabled={!isEditingPurchaseEntry}
              className="h-9 w-[140px] rounded-md border-2 border-[#0056b3] bg-[#e9ecef] px-3 text-base text-[#333] outline-none focus:ring-1 focus:ring-[#0056b3] disabled:opacity-60 disabled:cursor-not-allowed"
            />

            <input
              type="file"
              disabled={!isEditingPurchaseEntry}
              className="h-9 w-[260px] rounded-md border-2 border-[#0056b3] bg-[#e9ecef] text-base text-[#333] outline-none file:mr-2 file:h-full file:border-0 file:border-r-2 file:border-[#0056b3] file:bg-white file:px-3 file:text-base file:font-medium hover:file:bg-slate-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            />

            <button
              type="button"
              onClick={() => setIsEditingPurchaseEntry(!isEditingPurchaseEntry)}
              className={[
                'rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition',
                isEditingPurchaseEntry ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-dark',
              ].join(' ')}
            >
              {isEditingPurchaseEntry ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="flex gap-6">
            <input
              type="text"
              value="Logo"
              readOnly
              className="h-9 w-[180px] rounded-md border-2 border-[#0056b3] bg-transparent px-3 text-base font-bold text-[#333] outline-none"
            />

            <div className="flex flex-col items-center gap-3">
              <div className="flex h-[150px] w-[140px] flex-col items-center justify-center border border-[#ff6b6b] bg-white relative">
                <div className="flex h-8 w-full items-center justify-center bg-[#fdf5e6] text-xs text-slate-500">
                  Image
                </div>
                <div className={`flex flex-1 items-center justify-center text-xs ${isEditingLogo ? 'text-[#28a745] font-semibold' : 'text-[#ff6b6b]'}`}>
                  {isEditingLogo ? 'Upload enabled' : 'Upload disabled'}
                </div>
                {isEditingLogo && (
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Click to upload logo"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsEditingLogo(!isEditingLogo)}
                className={[
                  'rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition',
                  isEditingLogo ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-dark',
                ].join(' ')}
              >
                {isEditingLogo ? 'Save Logo' : 'Edit Logo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Voucher' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-[28px] font-bold text-[#0056b3]">Voucher Management</h2>

          <div>
            <button
              type="button"
              onClick={() => setIsEditingVoucher(!isEditingVoucher)}
              className={[
                'rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition',
                isEditingVoucher ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-dark',
              ].join(' ')}
            >
              {isEditingVoucher ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="overflow-x-auto border border-[#dee2e6] shadow-sm pb-2">
            <div className="min-w-[1100px]">
              <div className="flex items-center bg-[#0056b3] text-white px-4 py-2 font-bold text-base">
                <div className="w-[120px]">Business Code</div>
                <div className="flex-1 flex justify-center">Voucher 1</div>
                <div className="flex-1 flex justify-center">Voucher 2</div>
                <div className="flex-1 flex justify-center">Voucher 3</div>
                <div className="flex-1 flex justify-center">Voucher 4</div>
                <div className="w-[100px] text-center">Emp Code</div>
              </div>

              <div className="flex items-center px-4 py-3 bg-white text-base">
                <div className="w-[120px] font-semibold text-[#333]">PRAV2154A</div>
                
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="flex-1 flex justify-center items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Voucher Code ${num}`}
                      onChange={handleVoucherCodeChange}
                      maxLength={11}
                      disabled={!isEditingVoucher}
                      className="h-8 w-[130px] rounded border border-[#0056b3] px-2 text-base outline-none focus:ring-1 focus:ring-[#0056b3] disabled:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                    <input
                      type="number"
                      placeholder="in%"
                      min="0"
                      max="100"
                      onChange={handlePercentageChange}
                      disabled={!isEditingVoucher}
                      className="h-8 w-[60px] rounded border border-[#0056b3] px-2 text-base outline-none focus:ring-1 focus:ring-[#0056b3] text-center disabled:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                ))}

                <div className="w-[100px] flex justify-center">
                  <input
                    type="text"
                    defaultValue="AF123"
                    onChange={handleEmpCodeChange}
                    maxLength={10}
                    disabled={!isEditingVoucher}
                    className="h-8 w-[80px] rounded border border-[#0056b3] px-2 text-base outline-none focus:ring-1 focus:ring-[#0056b3] text-center disabled:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Values' && (
        <div className="flex flex-col gap-6 max-w-[600px]">
          <h2 className="text-[28px] font-bold text-[#0056b3]">Bag Charges</h2>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditingValues(!isEditingValues)}
              className={[
                'rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition',
                isEditingValues ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-dark',
              ].join(' ')}
            >
              {isEditingValues ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="overflow-hidden border border-[#dee2e6] rounded-sm">
            <table className="w-full text-left text-base border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#dee2e6]">
                  <th className="p-3 font-bold text-[#0056b3] w-1/2">Field</th>
                  <th className="p-3 font-bold text-[#0056b3] w-1/2">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b border-[#dee2e6]">
                  <td className="p-3 font-bold text-[#333]">Currency</td>
                  <td className="p-3">
                    <input
                      type="text"
                      defaultValue="Rs"
                      disabled={!isEditingValues}
                      className="h-8 w-[120px] rounded border border-[#0056b3] bg-transparent px-2 text-base outline-none focus:ring-1 focus:ring-[#0056b3] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </td>
                </tr>
                <tr className="bg-white border-b border-[#dee2e6]">
                  <td className="p-3 font-bold text-[#333]">Bag Charge</td>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue="15"
                      disabled={!isEditingValues}
                      className="h-8 w-[120px] rounded border border-[#0056b3] bg-transparent px-2 text-base outline-none focus:ring-1 focus:ring-[#0056b3] disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab !== 'MIS' && activeTab !== 'Tax Code' && activeTab !== 'Upload' && activeTab !== 'Voucher' && activeTab !== 'Values' && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-600">
          <p className="font-semibold">{activeTab}</p>
          <p className="mt-1 text-base">This section is coming soon.</p>
        </div>
      )}
    </section>
  );
};
