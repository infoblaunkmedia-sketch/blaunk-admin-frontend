import React from 'react';

const TABS = ['MIS', 'DSA - Payment', 'Media Upload'] as const;
const MEDIA_TABS = ['Slider', 'Explore', 'Trendy Star', 'Global Store', 'Exclusive', 'New Launch', 'GIFF', 'Tour Package'] as const;
const AD_SLOT_BY_MEDIA_TAB: Record<(typeof MEDIA_TABS)[number], string> = {
  Slider: '1/8',
  Explore: '1/5',
  'Trendy Star': '1/5',
  'Global Store': '1/5',
  Exclusive: '1/5',
  'New Launch': '1/5',
  GIFF: '1/5',
  'Tour Package': '1/5',
};

const inputClass =
  'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

export const DsaPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]>('MIS');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [reportType, setReportType] = React.useState('');
  const [payinDate] = React.useState('17-04-2026');
  const [payin, setPayin] = React.useState('10000');
  const [ablBod, setAblBod] = React.useState('5000');
  const [marginUsed, setMarginUsed] = React.useState('2000');
  const [limitRs, setLimitRs] = React.useState('13000');
  const [dsaRowChecked, setDsaRowChecked] = React.useState(false);
  const [dsaMode, setDsaMode] = React.useState('Cash');
  const [txnRef, setTxnRef] = React.useState('');
  const [currencyType, setCurrencyType] = React.useState('Rs.');
  const [currencyPayin, setCurrencyPayin] = React.useState('');
  const [currencyInr, setCurrencyInr] = React.useState('');
  const [dsaLimit, setDsaLimit] = React.useState('');
  const [approval, setApproval] = React.useState('Pending');
  const [activeMediaTab, setActiveMediaTab] = React.useState<(typeof MEDIA_TABS)[number]>('Slider');
  const [sliderSection, setSliderSection] = React.useState('HOMEPAGE');
  const [sliderCountry, setSliderCountry] = React.useState('India');
  const [sliderPlan, setSliderPlan] = React.useState('');
  const [sliderProductId, setSliderProductId] = React.useState('');
  const [sliderPlanCharge, setSliderPlanCharge] = React.useState('50000.00');
  const [sliderLuxuryFees, setSliderLuxuryFees] = React.useState('20000.00');
  const [sliderDiscount, setSliderDiscount] = React.useState('2000.00');
  const [sliderToPay, setSliderToPay] = React.useState('50000.00');
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = React.useState('');
  const [appliedImagePreview, setAppliedImagePreview] = React.useState('');
  const [imageError, setImageError] = React.useState('');
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const editableRowClass = [
    inputClass,
    dsaRowChecked ? '' : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500',
  ].join(' ');

  React.useEffect(() => {
    return () => {
      if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
      if (appliedImagePreview) URL.revokeObjectURL(appliedImagePreview);
    };
  }, [selectedImagePreview, appliedImagePreview]);

  const onPickImage = () => imageInputRef.current?.click();

  const onImageChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file.');
      e.target.value = '';
      return;
    }
    if (file.size > 500 * 1024) {
      setImageError('Image size must be 500KB or less.');
      e.target.value = '';
      return;
    }
    setImageError('');
    if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
    const previewUrl = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setSelectedImagePreview(previewUrl);
  };

  const onCancelImage = () => {
    if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
    setSelectedImagePreview('');
    setSelectedImageFile(null);
    setImageError('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const onApplyImage = () => {
    if (!selectedImagePreview) {
      setImageError('Please select an image before applying.');
      return;
    }
    if (appliedImagePreview) URL.revokeObjectURL(appliedImagePreview);
    setAppliedImagePreview(selectedImagePreview);
    setSelectedImagePreview('');
    setSelectedImageFile(null);
    setImageError('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-2 w-fit" aria-label="DSA tabs">
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
              className="grid min-w-[1100px] gap-0 bg-primary px-2 py-3 text-left text-sm font-semibold text-white"
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
                <div className={`${inputClass} flex items-center bg-slate-100 font-semibold text-slate-700`}>DSA</div>
              </div>
              <div className="px-1">
                <div className={`${inputClass} flex items-center bg-slate-100 font-semibold text-slate-700`}>
                  PRAV2154A
                </div>
              </div>
              <div className="px-1">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select Report</option>
                  <option value="mis-dsa-pay">MIS - DSA Pay</option>
                  <option value="mis-dsa-sales">MIS - DSA Sales</option>
                  <option value="mis-dsa-ads">MIS - DSA Ads</option>
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

      {activeTab === 'DSA - Payment' && (
        <>
          <h2 className="text-4xl font-bold text-primary">Limit</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-700">Date</span>
              <input type="text" readOnly value={payinDate} className={`${inputClass} bg-slate-100`} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-700">Pay-in</span>
              <input type="text" value={payin} onChange={(e) => setPayin(e.target.value.replace(/\D/g, ''))} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-700">ABL-BOD</span>
              <input type="text" value={ablBod} onChange={(e) => setAblBod(e.target.value.replace(/\D/g, ''))} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-700">Margin Used</span>
              <input
                type="text"
                value={marginUsed}
                onChange={(e) => setMarginUsed(e.target.value.replace(/\D/g, ''))}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-700">Limit (Rs.)</span>
              <input type="text" value={limitRs} onChange={(e) => setLimitRs(e.target.value.replace(/\D/g, ''))} className={inputClass} />
            </label>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <h3 className="text-4xl font-bold text-primary">DSA Details</h3>
            <button
              type="button"
              className="rounded-sm bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
            >
              Save
            </button>
          </div>

          <div className="overflow-x-auto rounded-sm border border-slate-300 bg-white shadow-sm">
            <table className="min-w-[1700px] w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="w-10 min-w-[2.5rem] border border-white/25 px-1 py-2 text-center font-bold">&nbsp;</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Date</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">DSA Name</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Country</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">DSA Code</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Sharing Ratio</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Mode</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Txn Ref No.</th>
                  <th className="min-w-[8rem] border border-white/25 px-2 py-2 font-bold">Currency-Payin</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Currency-INR</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Limit</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Approval</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200 bg-white">
                  <td className="border border-slate-200 px-1 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={dsaRowChecked}
                      onChange={(e) => setDsaRowChecked(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                      aria-label="Select DSA row"
                    />
                  </td>
                  <td className="border border-slate-200 px-2 py-1.5 font-semibold text-slate-800">17-04-2026</td>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-700">DSA 1</td>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-700">India</td>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-700">DSA001</td>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-700">30:70</td>
                  <td className="border border-slate-200 p-1">
                    <select className={editableRowClass} value={dsaMode} onChange={(e) => setDsaMode(e.target.value)} disabled={!dsaRowChecked}>
                      <option value="Cash">Cash</option>
                      <option value="QR">QR</option>
                      <option value="Swift">Swift</option>
                      <option value="RTGS">RTGS</option>
                      <option value="NEFT">NEFT</option>
                    </select>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <input
                      type="text"
                      value={txnRef}
                      onChange={(e) => setTxnRef(e.target.value)}
                      className={editableRowClass}
                      disabled={!dsaRowChecked}
                    />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <div className="flex gap-1">
                      <select
                        className={`${editableRowClass} w-20`}
                        value={currencyType}
                        onChange={(e) => setCurrencyType(e.target.value)}
                        disabled={!dsaRowChecked}
                      >
                        <option value="Rs.">Rs.</option>
                        <option value="$">$</option>
                      </select>
                      <input
                        type="text"
                        value={currencyPayin}
                        onChange={(e) => setCurrencyPayin(e.target.value.replace(/[^\d.]/g, ''))}
                        className={editableRowClass}
                        disabled={!dsaRowChecked}
                      />
                    </div>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <input
                      type="text"
                      value={currencyInr}
                      onChange={(e) => setCurrencyInr(e.target.value.replace(/[^\d.]/g, ''))}
                      className={editableRowClass}
                      disabled={!dsaRowChecked}
                    />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <input
                      type="text"
                      value={dsaLimit}
                      onChange={(e) => setDsaLimit(e.target.value.replace(/[^\d.]/g, ''))}
                      className={editableRowClass}
                      disabled={!dsaRowChecked}
                    />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <select
                      className={[inputClass, 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'].join(' ')}
                      value={approval}
                      onChange={(e) => setApproval(e.target.value)}
                      disabled
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'Media Upload' && (
        <>
          <h2 className="text-4xl font-bold text-primary">Media Upload</h2>

          <div className="rounded-sm border border-slate-200 bg-white p-3 sm:p-4">
            <div className="mb-4 flex flex-wrap gap-2 w-fit">
              {MEDIA_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveMediaTab(tab)}
                  className={[
                    'rounded-md border px-4 py-1.5 text-xs font-semibold shadow-sm transition',
                    activeMediaTab === tab
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                  ].join(' ')}
                >
                  {tab}
                </button>
              ))}
            </div>

            {MEDIA_TABS.includes(activeMediaTab) ? (
              <div className="rounded-sm border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <h3 className="text-3xl font-bold text-slate-800">{activeMediaTab}</h3>
                  <div className="flex flex-wrap items-center gap-6">
                    <button
                      type="button"
                      className="rounded-md border border-primary bg-white px-3 py-1.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/5"
                    >
                      {`Ad Slot: ${AD_SLOT_BY_MEDIA_TAB[activeMediaTab]}`}
                    </button>
                    <p className="text-sm font-semibold text-primary">
                      DSA Code: <span className="font-bold text-slate-700">DSA0112</span>
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3">
                  <div className="mb-3 flex flex-wrap justify-end gap-4 text-sm font-semibold text-slate-700">
                    <p>
                      <span className="text-primary">Available Margin:</span> 50000.00
                    </p>
                    <p>
                      <span className="text-primary">Margin Used:</span> 1999.00
                    </p>
                  </div>

                  <div className="rounded-md bg-primary p-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-white">Section</span>
                        <select className={inputClass} value={sliderSection} onChange={(e) => setSliderSection(e.target.value)}>
                          <option value="HOMEPAGE">HOMEPAGE</option>
                          <option value="BGT">BGT</option>
                          <option value="TOUR">TOUR</option>
                          <option value="STORE">STORE</option>
                          <option value="CAKE">CAKE</option>
                          <option value="BOUTIQUE">BOUTIQUE</option>
                          <option value="LOGISTIC">LOGISTIC</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-white">Country</span>
                        <select className={inputClass} value={sliderCountry} onChange={(e) => setSliderCountry(e.target.value)}>
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
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-white">Plan</span>
                        <select className={inputClass} value={sliderPlan} onChange={(e) => setSliderPlan(e.target.value)}>
                          <option value="">Select</option>
                          <option value="standard-2m">Standard (2M Validity)</option>
                          <option value="silver-3m">Silver(3M Validity)</option>
                          <option value="gold-6m">Gold (6M Validity)</option>
                          <option value="platinum-1y">Platinum (1YR Validity)</option>
                          <option value="premium-1y">Premium (1YR Validity)</option>
                          <option value="diamond-1y">Diamond (1YR Validity)</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-white">Product ID</span>
                        <input
                          type="text"
                          value={sliderProductId}
                          onChange={(e) => setSliderProductId(e.target.value)}
                          className={inputClass}
                          placeholder="Enter Product ID"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-white">Plan Charge</span>
                        <input
                          type="text"
                          value={sliderPlanCharge}
                          onChange={(e) => setSliderPlanCharge(e.target.value.replace(/[^\d.]/g, ''))}
                          className={inputClass}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-white">Luxury Fees</span>
                        <input
                          type="text"
                          value={sliderLuxuryFees}
                          onChange={(e) => setSliderLuxuryFees(e.target.value.replace(/[^\d.]/g, ''))}
                          className={inputClass}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-white">Discount</span>
                        <input
                          type="text"
                          value={sliderDiscount}
                          onChange={(e) => setSliderDiscount(e.target.value.replace(/[^\d.]/g, ''))}
                          className={inputClass}
                        />
                      </label>
                    </div>

                    <label className="mt-2 flex max-w-[16rem] flex-col gap-1">
                      <span className="text-sm font-semibold text-white">To Pay</span>
                      <input
                        type="text"
                        value={sliderToPay}
                        onChange={(e) => setSliderToPay(e.target.value.replace(/[^\d.]/g, ''))}
                        className={inputClass}
                      />
                    </label>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-xl font-semibold text-slate-700">Upload Image</p>
                    <div className="flex justify-center py-2">
                      <div className="flex flex-col items-center gap-4">
                        <button
                          type="button"
                          onClick={onPickImage}
                          className="relative h-36 w-28 overflow-hidden border border-red-300 bg-amber-50 text-center text-[11px] font-semibold text-rose-700 shadow-sm hover:bg-amber-100"
                        >
                          {selectedImagePreview || appliedImagePreview ? (
                            <img
                              src={selectedImagePreview || appliedImagePreview}
                              alt="Uploaded preview"
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                          <span className="absolute left-0 top-0 w-full bg-amber-50/90 py-1 text-slate-700">Image</span>
                          <span className="absolute bottom-2 left-0 w-full px-1 text-[10px]">
                            Click to update (max. 500KB)
                          </span>
                        </button>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onImageChange}
                        />
                        {selectedImageFile ? (
                          <p className="text-xs font-semibold text-slate-600">{selectedImageFile.name}</p>
                        ) : null}
                        {imageError ? <p className="text-xs font-semibold text-red-600">{imageError}</p> : null}
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={onCancelImage}
                            className="rounded-sm bg-slate-400 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={onApplyImage}
                            className="rounded-sm bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
};
