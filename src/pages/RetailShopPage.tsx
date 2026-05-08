import React from 'react';

const TABS = ['Invoice', 'Financial', 'Rejection'] as const;
const REJECTION_YEARS = Array.from({ length: 15 }, (_, i) => String(2026 + i));

/** Invoice / table chrome — khaki olive frame + golden header row */
const OLIVE = {
  bar: 'bg-[#8b8b4c]',
  border: 'border-[#8b8b4c]',
  tableHead: 'bg-[#e7d78f]',
  /** Thick section rules + table outer vertical edges */
  sectionDivider: 'border-b-[6px] border-[#8b8b4c]',
  /** Light lines between header cells */
  tableHeadCellBorder: 'border-[#d4d3c5]',
} as const;

const fieldClass =
  'w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30';

function digitsOnly(value: string, maxLen: number) {
  return value.replace(/\D/g, '').slice(0, maxLen);
}

function normalizeGstin(value: string) {
  return value.replace(/[^0-9A-Za-z]/g, '').toUpperCase().slice(0, 15);
}

/** Allows digits and a single decimal point, max 2 fractional digits */
function normalizeMoney(value: string) {
  let s = value.replace(/[^\d.]/g, '');
  const firstDot = s.indexOf('.');
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
    const [whole, frac = ''] = s.split('.');
    s = `${whole}.${frac.slice(0, 2)}`;
  }
  return s;
}

function normalizeWeightKg(value: string) {
  let s = value.replace(/[^\d.]/g, '');
  const i = s.indexOf('.');
  if (i !== -1) {
    s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
    const [w, f = ''] = s.split('.');
    s = `${w}.${f.slice(0, 3)}`;
  }
  return s;
}

/** Indian vehicle reg: letters, digits, common separators; uppercase */
function normalizeVehicleNo(value: string) {
  return value.replace(/[^0-9A-Za-z\s-]/g, '').toUpperCase().slice(0, 16);
}

function normalizeContactOrId(value: string) {
  return value.replace(/[^A-Za-z0-9+\-()\s]/g, '').slice(0, 40);
}

/** Indian GSTIN: 15 chars (state + PAN + entity + Z + check) */
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

function validatePincode(value: string): string | undefined {
  const t = value.trim();
  if (t.length === 0) return undefined;
  if (!/^\d{6}$/.test(t)) return 'Pincode must be exactly 6 digits.';
  return undefined;
}

function validateGstin(value: string): string | undefined {
  const t = value.trim();
  if (t.length === 0) return undefined;
  if (t.length !== 15) return 'GSTIN must be exactly 15 characters.';
  if (!GSTIN_REGEX.test(t)) return 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5).';
  return undefined;
}

function validateEway(value: string): string | undefined {
  const t = value.trim();
  if (t.length === 0) return undefined;
  if (!/^\d{12}$/.test(t)) return 'E-way number must be exactly 12 digits.';
  return undefined;
}

function validateMoney(value: string, label: string): string | undefined {
  let t = value.trim();
  if (t.length === 0) return undefined;
  if (t.endsWith('.')) t = t.slice(0, -1);
  if (t.length === 0) return undefined;
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return `${label} must be a valid amount (max 2 decimal places).`;
  if (Number(t) < 0) return `${label} cannot be negative.`;
  return undefined;
}

function validateWeightKgField(value: string): string | undefined {
  let t = value.trim();
  if (t.length === 0) return undefined;
  if (t.endsWith('.')) t = t.slice(0, -1);
  if (t.length === 0) return undefined;
  if (!/^\d+(\.\d{1,3})?$/.test(t)) return 'Weight must be a number (up to 3 decimal places).';
  if (Number(t) < 0) return 'Weight cannot be negative.';
  return undefined;
}

function validateContact(value: string): string | undefined {
  const t = value.trim();
  if (t.length === 0) return undefined;
  const digits = t.replace(/\D/g, '');
  const onlyPhoneLike = t.replace(/[\s\-+()]/g, '') === digits && digits.length > 0;
  if (onlyPhoneLike && digits.length !== 10) return 'Enter 10 digits for mobile, or use letters for customer ID.';
  return undefined;
}

function validateCarryBagQty(value: string): string | undefined {
  const t = value.trim();
  if (t.length === 0) return undefined;
  if (!/^\d+$/.test(t)) return 'Quantity must be a whole number.';
  return undefined;
}

function validateVehicle(value: string): string | undefined {
  const t = value.trim();
  if (t.length === 0) return undefined;
  if (t.replace(/\s/g, '').length < 4) return 'Vehicle number looks too short.';
  return undefined;
}

type InvoiceFieldKey =
  | 'contact'
  | 'pincode'
  | 'customerGst'
  | 'eWay'
  | 'vehicle'
  | 'weight'
  | 'footerGst'
  | 'refund'
  | 'carryBagPrice'
  | 'carryBagQty'
  | 'voucherValue';

function fieldClassWithError(hasError: boolean) {
  return [fieldClass, hasError ? 'border-red-500 focus:border-red-600 focus:ring-red-200/80' : null]
    .filter(Boolean)
    .join(' ');
}

/** Indian states and union territories (alphabetical). */
const INDIAN_STATES_UT = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

type ProductRow = {
  id: string;
  orderId: string;
  barCode: string;
  article: string;
  size: string;
  colour: string;
  gRate: string;
  qty: string;
  tax: string;
  sgst: string;
  cgst: string;
  igst: string;
  val: string;
};

const INITIAL_PRODUCTS: ProductRow[] = [
  {
    id: '1',
    orderId: '101BGL1',
    barCode: 'PRD001',
    article: 'Product A',
    size: 'M',
    colour: 'Red',
    gRate: '500',
    qty: '1',
    tax: '50%',
    sgst: '25',
    cgst: '25',
    igst: '0',
    val: '550',
  },
  {
    id: '2',
    orderId: '101BGL1',
    barCode: 'PRD002',
    article: 'Product B',
    size: 'L',
    colour: 'Blue',
    gRate: '600',
    qty: '1',
    tax: '50%',
    sgst: '30',
    cgst: '30',
    igst: '0',
    val: '660',
  },
  {
    id: '3',
    orderId: '101BGL1',
    barCode: 'PRD003',
    article: 'Product C',
    size: 'S',
    colour: 'Green',
    gRate: '400',
    qty: '2',
    tax: '50%',
    sgst: '40',
    cgst: '40',
    igst: '0',
    val: '880',
  },
  {
    id: '4',
    orderId: '101BGL1',
    barCode: 'PRD004',
    article: 'Product D',
    size: 'XL',
    colour: 'Black',
    gRate: '700',
    qty: '1',
    tax: '50%',
    sgst: '35',
    cgst: '35',
    igst: '0',
    val: '770',
  },
  {
    id: '5',
    orderId: '101BGL1',
    barCode: 'PRD005',
    article: 'Product E',
    size: 'M',
    colour: 'White',
    gRate: '450',
    qty: '1',
    tax: '50%',
    sgst: '22.5',
    cgst: '22.5',
    igst: '0',
    val: '495',
  },
];

export const RetailShopPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]>('Invoice');
  const [taxType, setTaxType] = React.useState<'SGST' | 'IGST'>('SGST');
  const [products, setProducts] = React.useState<ProductRow[]>(INITIAL_PRODUCTS);

  const [delivery, setDelivery] = React.useState('Pickup Store');
  const [logistics, setLogistics] = React.useState('');
  const [eWayNo, setEWayNo] = React.useState('');
  const [vehicleNo, setVehicleNo] = React.useState('');
  const [docketNo, setDocketNo] = React.useState('');
  const [weightKg, setWeightKg] = React.useState('');
  const [footerGstNo, setFooterGstNo] = React.useState('');
  const [refund, setRefund] = React.useState('50.00');
  const [carryBagPrice, setCarryBagPrice] = React.useState('0');
  const [carryBagQty, setCarryBagQty] = React.useState('0');
  const [voucherCode, setVoucherCode] = React.useState('');
  const [voucherValue, setVoucherValue] = React.useState('50.00');
  const [nettToPay] = React.useState('1000.00');
  const [paymentMethod, setPaymentMethod] = React.useState('UPI');
  const [paymentAmount] = React.useState('1000.00');

  const [finRowChecked, setFinRowChecked] = React.useState(false);
  const [finTransferMode, setFinTransferMode] = React.useState('Bank Deposit');
  const [finAmount, setFinAmount] = React.useState('0');
  const [finTransferDate, setFinTransferDate] = React.useState('');
  const [finNamePayout, setFinNamePayout] = React.useState('');
  const [finCashEod, setFinCashEod] = React.useState('900');
  const finEditableClass = [
    fieldClass,
    finRowChecked ? '' : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500',
  ].join(' ');

  const [customerContact, setCustomerContact] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  const [customerGst, setCustomerGst] = React.useState('');
  const [customerState, setCustomerState] = React.useState('');
  const [rejectionYear, setRejectionYear] = React.useState('2026');
  const [rejectionSearch, setRejectionSearch] = React.useState('');
  const [rejectionChecked, setRejectionChecked] = React.useState(false);
  const [rejectionQty, setRejectionQty] = React.useState('0');
  const [rejectionRemarks, setRejectionRemarks] = React.useState('Return');
  const [rejectionMode, setRejectionMode] = React.useState('Cash');
  const [rejectionReason, setRejectionReason] = React.useState('Improper size');
  const [rejectionAmount, setRejectionAmount] = React.useState('0');
  const [rejectionMaker, setRejectionMaker] = React.useState('Pending');
  const rejectionEditableClass = [
    fieldClass,
    rejectionChecked ? '' : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500',
  ].join(' ');
  const [invoiceErrors, setInvoiceErrors] = React.useState<Partial<Record<InvoiceFieldKey, string>>>({});

  const setInvoiceError = React.useCallback((key: InvoiceFieldKey, msg: string | undefined) => {
    setInvoiceErrors((prev) => {
      const next = { ...prev };
      if (msg) next[key] = msg;
      else delete next[key];
      return next;
    });
  }, []);

  const patchInvoiceErrorAfterChange = React.useCallback(
    (key: InvoiceFieldKey, value: string, validate: (v: string) => string | undefined) => {
      setInvoiceErrors((prev) => {
        if (!prev[key]) return prev;
        const msg = validate(value);
        const next = { ...prev };
        if (msg) next[key] = msg;
        else delete next[key];
        return next;
      });
    },
    [],
  );

  const [barcodeModalOpen, setBarcodeModalOpen] = React.useState(false);
  const [barcodeInput, setBarcodeInput] = React.useState('');
  const [barcodeError, setBarcodeError] = React.useState('');
  const barcodeFieldRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (barcodeModalOpen) {
      setBarcodeInput('');
      setBarcodeError('');
      const t = window.setTimeout(() => barcodeFieldRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [barcodeModalOpen]);

  React.useEffect(() => {
    if (!barcodeModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBarcodeModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [barcodeModalOpen]);

  const closeBarcodeModal = () => setBarcodeModalOpen(false);

  const handleBarcodeModalAdd = () => {
    const code = barcodeInput.trim();
    if (!code) {
      setBarcodeError('Please enter a bar code.');
      barcodeFieldRef.current?.focus();
      return;
    }
    setBarcodeError('');
    const orderId = products[0]?.orderId ?? '101BGL1';
    const newRow: ProductRow = {
      id: `row-${Date.now()}`,
      orderId,
      barCode: code,
      article: '—',
      size: '—',
      colour: '—',
      gRate: '0',
      qty: '1',
      tax: '0%',
      sgst: '0',
      cgst: '0',
      igst: '0',
      val: '0',
    };
    setProducts((prev) => [...prev, newRow]);
    closeBarcodeModal();
  };

  const updateQty = (id: string, qty: string) => {
    setProducts((prev) => prev.map((r) => (r.id === id ? { ...r, qty } : r)));
  };

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-2 w-fit" aria-label="Retail shop tabs">
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

      {activeTab === 'Invoice' && (
        <div className={`rounded-sm border-2 ${OLIVE.border} bg-white shadow-sm`}>
          {/* Top action bar */}
          <div
            className={`flex flex-wrap items-center gap-3 px-3 py-2.5 ${OLIVE.bar} ${OLIVE.sectionDivider} sm:justify-between sm:gap-4 sm:px-4`}
          >
            <div className="flex items-center gap-2 text-white">
              <span className="text-lg font-black tracking-tight">
                flash<span className="text-yellow-300">+</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setBarcodeModalOpen(true)}
                className="rounded-sm border border-amber-400 bg-yellow-400 px-4 py-1.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-yellow-300"
              >
                Add
              </button>
              <button
                type="button"
                className="rounded-sm border border-blue-800 bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-primary-dark"
              >
                Save / Print
              </button>
              <div className="flex items-center gap-3 text-xs font-semibold text-white">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="gst-type"
                    checked={taxType === 'SGST'}
                    onChange={() => setTaxType('SGST')}
                    className="accent-yellow-300"
                  />
                  SGST
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="gst-type"
                    checked={taxType === 'IGST'}
                    onChange={() => setTaxType('IGST')}
                    className="accent-yellow-300"
                  />
                  IGST
                </label>
              </div>
              <span className="rounded border border-amber-300 bg-yellow-300/90 px-2 py-1 text-xs font-bold text-slate-900">
                CHD52
              </span>
            </div>
          </div>

          {/* Customer grid */}
          <div className={`${OLIVE.sectionDivider} bg-white p-3 sm:p-4`}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Cus ID / Contact</span>
                <input
                  type="text"
                  value={customerContact}
                  onChange={(e) => {
                    const v = normalizeContactOrId(e.target.value);
                    setCustomerContact(v);
                    patchInvoiceErrorAfterChange('contact', v, validateContact);
                  }}
                  onBlur={(e) =>
                    setInvoiceError('contact', validateContact(normalizeContactOrId(e.target.value)))
                  }
                  className={fieldClassWithError(!!invoiceErrors.contact)}
                  placeholder="Customer ID or mobile"
                  inputMode="text"
                  autoComplete="tel"
                  title="Customer code or 10-digit mobile number"
                  maxLength={40}
                  aria-invalid={!!invoiceErrors.contact}
                />
                {invoiceErrors.contact ? (
                  <p className="text-xs font-semibold text-red-600" role="alert">
                    {invoiceErrors.contact}
                  </p>
                ) : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Name</span>
                <input type="text" className={fieldClass} placeholder="Full name" autoComplete="name" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Date</span>
                <input
                  type="text"
                  readOnly
                  className={`${fieldClass} bg-slate-100`}
                  value="17-04-2026"
                  title="Invoice date (DD-MM-YYYY)"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Door/Flat No</span>
                <input type="text" className={fieldClass} placeholder="" />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-1">
                <span className="text-xs font-bold text-slate-700">Address</span>
                <input type="text" className={fieldClass} placeholder="" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Bill No</span>
                <input
                  type="text"
                  readOnly
                  className={`${fieldClass} bg-slate-100`}
                  value="INV20250115"
                  title="System-generated bill number"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">City</span>
                <input type="text" className={fieldClass} placeholder="" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Pincode</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pincode}
                  onChange={(e) => {
                    const next = digitsOnly(e.target.value, 6);
                    setPincode(next);
                    patchInvoiceErrorAfterChange('pincode', next, validatePincode);
                  }}
                  onBlur={(e) =>
                    setInvoiceError('pincode', validatePincode(digitsOnly(e.target.value, 6)))
                  }
                  className={fieldClassWithError(!!invoiceErrors.pincode)}
                  placeholder="000000"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  title="6-digit Indian PIN code"
                  autoComplete="postal-code"
                  aria-invalid={!!invoiceErrors.pincode}
                />
                {invoiceErrors.pincode ? (
                  <p className="text-xs font-semibold text-red-600" role="alert">
                    {invoiceErrors.pincode}
                  </p>
                ) : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Order ID</span>
                <input
                  type="text"
                  readOnly
                  className={`${fieldClass} bg-slate-100`}
                  value="101BGL1"
                  title="Order reference"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">State</span>
                <select
                  className={fieldClass}
                  value={customerState}
                  onChange={(e) => setCustomerState(e.target.value)}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES_UT.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">GST No.</span>
                <input
                  type="text"
                  value={customerGst}
                  onChange={(e) => {
                    const v = normalizeGstin(e.target.value);
                    setCustomerGst(v);
                    patchInvoiceErrorAfterChange('customerGst', v, validateGstin);
                  }}
                  onBlur={(e) =>
                    setInvoiceError('customerGst', validateGstin(normalizeGstin(e.target.value)))
                  }
                  className={`${fieldClassWithError(!!invoiceErrors.customerGst)} uppercase`}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                  title="15-character GSTIN (e.g. 22AAAAA0000A1Z5)"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={!!invoiceErrors.customerGst}
                />
                {invoiceErrors.customerGst ? (
                  <p className="text-xs font-semibold text-red-600" role="alert">
                    {invoiceErrors.customerGst}
                  </p>
                ) : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Year</span>
                <input
                  type="text"
                  readOnly
                  className={`${fieldClass} bg-slate-100`}
                  value="2026"
                  title="Financial year"
                />
              </label>
            </div>
          </div>

          {/* Product table */}
          <div
            className={`max-h-[min(28rem,55vh)] overflow-auto border-x-2 border-[#8b8b4c] ${OLIVE.sectionDivider}`}
          >
            <table className="min-w-[1200px] w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className={`${OLIVE.tableHead} text-slate-900`}>
                  <th className={`border ${OLIVE.tableHeadCellBorder} px-2 py-2.5 font-bold`}>Order ID</th>
                  <th className={`border ${OLIVE.tableHeadCellBorder} px-2 py-2.5 font-bold`}>BAR CODE</th>
                  <th className={`border ${OLIVE.tableHeadCellBorder} px-2 py-2.5 font-bold`}>ARTICLE</th>
                  <th className={`border ${OLIVE.tableHeadCellBorder} px-2 py-2.5 font-bold`}>SIZE</th>
                  <th className={`border ${OLIVE.tableHeadCellBorder} px-2 py-2.5 font-bold`}>COLOUR</th>
                  <th className={`border ${OLIVE.tableHeadCellBorder} px-2 py-2.5 font-bold`}>G.RATE</th>
                  <th
                    className={`w-14 min-w-[3.25rem] border ${OLIVE.tableHeadCellBorder} px-1 py-2.5 text-center font-bold`}
                  >
                    QTY
                  </th>
                  <th className={`border ${OLIVE.tableHeadCellBorder} px-2 py-2.5 font-bold`}>TAX</th>
                  <th className={`border ${OLIVE.tableHeadCellBorder} px-2 py-2.5 font-bold`}>SGST %</th>
                  <th className={`border ${OLIVE.tableHeadCellBorder} px-2 py-2.5 font-bold`}>CGST %</th>
                  <th className={`border ${OLIVE.tableHeadCellBorder} px-2 py-2.5 font-bold`}>IGST %</th>
                  <th className={`border ${OLIVE.tableHeadCellBorder} px-2 py-2.5 font-bold`}>Value</th>
                </tr>
              </thead>
              <tbody>
                {products.map((row, i) => (
                  <tr
                    key={row.id}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
                  >
                    <td className="border border-slate-200 px-2 py-1.5 font-semibold">{row.orderId}</td>
                    <td className="border border-slate-200 px-2 py-1.5">{row.barCode}</td>
                    <td className="border border-slate-200 px-2 py-1.5">{row.article}</td>
                    <td className="border border-slate-200 px-2 py-1.5">{row.size}</td>
                    <td className="border border-slate-200 px-2 py-1.5">{row.colour}</td>
                    <td className="border border-slate-200 px-2 py-1.5">{row.gRate}</td>
                    <td className="border border-slate-200 p-0.5 text-center">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={row.qty}
                        onChange={(e) => updateQty(row.id, e.target.value)}
                        className="qty-stepper mx-auto box-border h-8 w-[4.5rem] min-w-0 rounded-md border-2 border-black bg-white py-0.5 pl-1 pr-0 text-center font-serif text-base font-semibold text-primary shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                        aria-label={`Quantity for ${row.article}`}
                      />
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5">{row.tax}</td>
                    <td className="border border-slate-200 px-2 py-1.5">{row.sgst}</td>
                    <td className="border border-slate-200 px-2 py-1.5">{row.cgst}</td>
                    <td className="border border-slate-200 px-2 py-1.5">{row.igst}</td>
                    <td className="border border-slate-200 px-2 py-1.5 font-semibold">{row.val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-1 gap-4 bg-slate-50/40 p-3 sm:grid-cols-3 sm:gap-6 sm:p-4">
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Delivery</span>
                <select className={fieldClass} value={delivery} onChange={(e) => setDelivery(e.target.value)}>
                  <option value="Pickup Store">Pickup Store</option>
                  <option value="Courier">Courier</option>
                  <option value="Cargo">Cargo</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Logistics</span>
                <input type="text" value={logistics} onChange={(e) => setLogistics(e.target.value)} className={fieldClass} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">E WAY No.</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={eWayNo}
                  onChange={(e) => {
                    const next = digitsOnly(e.target.value, 12);
                    setEWayNo(next);
                    patchInvoiceErrorAfterChange('eWay', next, validateEway);
                  }}
                  onBlur={(e) =>
                    setInvoiceError('eWay', validateEway(digitsOnly(e.target.value, 12)))
                  }
                  className={fieldClassWithError(!!invoiceErrors.eWay)}
                  placeholder="12-digit e-way bill"
                  maxLength={12}
                  title="E-way bill number (typically 12 digits)"
                  autoComplete="off"
                  aria-invalid={!!invoiceErrors.eWay}
                />
                {invoiceErrors.eWay ? (
                  <p className="text-xs font-semibold text-red-600" role="alert">
                    {invoiceErrors.eWay}
                  </p>
                ) : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Vehicle No.</span>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => {
                    const v = normalizeVehicleNo(e.target.value);
                    setVehicleNo(v);
                    patchInvoiceErrorAfterChange('vehicle', v, validateVehicle);
                  }}
                  onBlur={(e) =>
                    setInvoiceError('vehicle', validateVehicle(normalizeVehicleNo(e.target.value)))
                  }
                  className={`${fieldClassWithError(!!invoiceErrors.vehicle)} uppercase`}
                  placeholder="e.g. PB10AB1234"
                  maxLength={16}
                  title="Vehicle registration number"
                  autoComplete="off"
                  aria-invalid={!!invoiceErrors.vehicle}
                />
                {invoiceErrors.vehicle ? (
                  <p className="text-xs font-semibold text-red-600" role="alert">
                    {invoiceErrors.vehicle}
                  </p>
                ) : null}
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Docket No.</span>
                <input type="text" value={docketNo} onChange={(e) => setDocketNo(e.target.value)} className={fieldClass} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Wt. (kg)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weightKg}
                  onChange={(e) => {
                    const v = normalizeWeightKg(e.target.value);
                    setWeightKg(v);
                    patchInvoiceErrorAfterChange('weight', v, validateWeightKgField);
                  }}
                  onBlur={(e) =>
                    setInvoiceError('weight', validateWeightKgField(normalizeWeightKg(e.target.value)))
                  }
                  className={fieldClassWithError(!!invoiceErrors.weight)}
                  placeholder="0.000"
                  title="Weight in kilograms (up to 3 decimal places)"
                  autoComplete="off"
                  aria-invalid={!!invoiceErrors.weight}
                />
                {invoiceErrors.weight ? (
                  <p className="text-xs font-semibold text-red-600" role="alert">
                    {invoiceErrors.weight}
                  </p>
                ) : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">GST No.</span>
                <input
                  type="text"
                  value={footerGstNo}
                  onChange={(e) => {
                    const v = normalizeGstin(e.target.value);
                    setFooterGstNo(v);
                    patchInvoiceErrorAfterChange('footerGst', v, validateGstin);
                  }}
                  onBlur={(e) =>
                    setInvoiceError('footerGst', validateGstin(normalizeGstin(e.target.value)))
                  }
                  className={`${fieldClassWithError(!!invoiceErrors.footerGst)} uppercase`}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                  title="15-character GSTIN"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={!!invoiceErrors.footerGst}
                />
                {invoiceErrors.footerGst ? (
                  <p className="text-xs font-semibold text-red-600" role="alert">
                    {invoiceErrors.footerGst}
                  </p>
                ) : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Refund</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={refund}
                  onChange={(e) => {
                    const v = normalizeMoney(e.target.value);
                    setRefund(v);
                    patchInvoiceErrorAfterChange('refund', v, (val) => validateMoney(val, 'Refund'));
                  }}
                  onBlur={(e) =>
                    setInvoiceError('refund', validateMoney(normalizeMoney(e.target.value), 'Refund'))
                  }
                  className={fieldClassWithError(!!invoiceErrors.refund)}
                  placeholder="0.00"
                  title="Refund amount (2 decimal places)"
                  autoComplete="off"
                  aria-invalid={!!invoiceErrors.refund}
                />
                {invoiceErrors.refund ? (
                  <p className="text-xs font-semibold text-red-600" role="alert">
                    {invoiceErrors.refund}
                  </p>
                ) : null}
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded border border-slate-200 bg-slate-50 p-2">
                <p className="mb-2 text-xs font-bold text-slate-700">Carry Bag</p>
                <div className="flex flex-wrap items-end gap-2">
                  <label className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-slate-600">Price</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={carryBagPrice}
                      onChange={(e) => {
                        const v = normalizeMoney(e.target.value);
                        setCarryBagPrice(v);
                        patchInvoiceErrorAfterChange('carryBagPrice', v, (val) =>
                          validateMoney(val, 'Price'),
                        );
                      }}
                      onBlur={(e) =>
                        setInvoiceError(
                          'carryBagPrice',
                          validateMoney(normalizeMoney(e.target.value), 'Price'),
                        )
                      }
                      className={`${fieldClassWithError(!!invoiceErrors.carryBagPrice)} w-20 py-1`}
                      placeholder="0.00"
                      title="Price (2 decimal places)"
                      aria-invalid={!!invoiceErrors.carryBagPrice}
                    />
                  </label>
                  <label className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-slate-600">Qty</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={carryBagQty}
                      onChange={(e) => {
                        const v = digitsOnly(e.target.value, 4);
                        setCarryBagQty(v);
                        patchInvoiceErrorAfterChange('carryBagQty', v, validateCarryBagQty);
                      }}
                      onBlur={(e) =>
                        setInvoiceError(
                          'carryBagQty',
                          validateCarryBagQty(digitsOnly(e.target.value, 4)),
                        )
                      }
                      className={`${fieldClassWithError(!!invoiceErrors.carryBagQty)} w-16 py-1`}
                      placeholder="0"
                      title="Whole number quantity"
                      aria-invalid={!!invoiceErrors.carryBagQty}
                    />
                  </label>
                  <span className="pb-2 text-sm font-bold text-slate-800">0.00</span>
                </div>
                {invoiceErrors.carryBagPrice || invoiceErrors.carryBagQty ? (
                  <div className="mt-2 space-y-0.5" role="alert">
                    {invoiceErrors.carryBagPrice ? (
                      <p className="text-xs font-semibold text-red-600">{invoiceErrors.carryBagPrice}</p>
                    ) : null}
                    {invoiceErrors.carryBagQty ? (
                      <p className="text-xs font-semibold text-red-600">{invoiceErrors.carryBagQty}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700">Voucher</span>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Enter Voucher Code"
                  className={fieldClass}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  value={voucherValue}
                  onChange={(e) => {
                    const v = normalizeMoney(e.target.value);
                    setVoucherValue(v);
                    patchInvoiceErrorAfterChange('voucherValue', v, (val) =>
                      validateMoney(val, 'Voucher amount'),
                    );
                  }}
                  onBlur={(e) =>
                    setInvoiceError(
                      'voucherValue',
                      validateMoney(normalizeMoney(e.target.value), 'Voucher amount'),
                    )
                  }
                  className={`${fieldClassWithError(!!invoiceErrors.voucherValue)} mt-1`}
                  placeholder="0.00"
                  aria-label="Voucher value"
                  title="Voucher discount amount (2 decimal places)"
                  aria-invalid={!!invoiceErrors.voucherValue}
                />
                {invoiceErrors.voucherValue ? (
                  <p className="text-xs font-semibold text-red-600" role="alert">
                    {invoiceErrors.voucherValue}
                  </p>
                ) : null}
              </label>
              <div className="rounded-md border-2 border-red-700 bg-red-600 px-3 py-2 text-center shadow-inner">
                <span className="block text-xs font-bold uppercase tracking-wide text-white/90">Nett To Pay</span>
                <span className="text-xl font-black text-white">{nettToPay}</span>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex min-w-[8rem] flex-1 flex-col gap-1">
                  <span className="text-xs font-bold text-slate-700">Payment</span>
                  <select
                    className={fieldClass}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </label>
                <span className="pb-2 text-base font-bold text-slate-900" title="Amount for selected payment mode">
                  {paymentAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Financial' && (
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-3xl font-bold text-primary sm:text-4xl">Financial Data</h2>
            <button
              type="button"
              className="rounded-sm bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
            >
              Submit
            </button>
          </div>

          <div className="overflow-x-auto rounded-sm border border-slate-300 bg-white shadow-sm">
            <table className="min-w-[1600px] w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="w-10 min-w-[2.5rem] border border-white/25 px-1 py-2 text-center font-bold">
                    &nbsp;
                  </th>
                  <th className="min-w-[6.5rem] whitespace-nowrap border border-white/25 px-2 py-2 font-bold">
                    Date
                  </th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Branch</th>
                  <th className="min-w-[5.5rem] border border-white/25 px-2 py-2 font-bold">Sale-UPI</th>
                  <th className="min-w-[5.5rem] border border-white/25 px-2 py-2 font-bold">Sale-CASH</th>
                  <th className="min-w-[8rem] border border-white/25 px-2 py-2 font-bold">
                    Rej. Refund - CASH
                  </th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">NETT CASH</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">CASH-BOD</th>
                  <th className="min-w-[8rem] border border-white/25 px-2 py-2 font-bold">Transfer Mode</th>
                  <th className="min-w-[5rem] border border-white/25 px-2 py-2 font-bold">Amount</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Transfer Date</th>
                  <th className="min-w-[8rem] border border-white/25 px-2 py-2 font-bold">Name - Payout</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">CASH-EOD</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Verifier ID</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200 bg-white">
                  <td className="border border-slate-200 px-1 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={finRowChecked}
                      onChange={(e) => setFinRowChecked(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                      aria-label="Select row"
                    />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <span className="px-2 py-1.5 text-sm font-semibold text-slate-800">17-04-2026</span>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <span className="px-2 py-1.5 text-sm font-semibold text-slate-800">Branch A</span>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <span className="px-2 py-1.5 text-sm font-semibold text-slate-800">1000</span>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <span className="px-2 py-1.5 text-sm font-semibold text-slate-800">500</span>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <span className="px-2 py-1.5 text-sm font-semibold text-slate-800">100</span>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <span className="px-2 py-1.5 text-sm font-semibold text-slate-800">900</span>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <span className="px-2 py-1.5 text-sm font-semibold text-slate-800">500</span>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <select
                      className={finEditableClass}
                      value={finTransferMode}
                      onChange={(e) => setFinTransferMode(e.target.value)}
                      disabled={!finRowChecked}
                    >
                      <option value="Bank Deposit">Bank Deposit</option>
                      <option value="Cash Pickup">Cash Pickup</option>
                      <option value="Shop Counter">Shop Counter</option>
                    </select>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={finAmount}
                      onChange={(e) => setFinAmount(normalizeMoney(e.target.value))}
                      className={finEditableClass}
                      title="Amount (2 decimal places)"
                      disabled={!finRowChecked}
                    />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <input
                      type="text"
                      value={finTransferDate}
                      onChange={(e) => setFinTransferDate(e.target.value)}
                      className={finEditableClass}
                      placeholder="mm/dd/yyyy"
                      title="Transfer date (mm/dd/yyyy)"
                      disabled={!finRowChecked}
                    />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <input
                      type="text"
                      value={finNamePayout}
                      onChange={(e) => setFinNamePayout(e.target.value)}
                      className={finEditableClass}
                      placeholder=""
                      autoComplete="name"
                      disabled={!finRowChecked}
                    />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={finCashEod}
                      onChange={(e) => setFinCashEod(normalizeMoney(e.target.value))}
                      className={finEditableClass}
                      title="Cash EOD"
                      disabled={!finRowChecked}
                    />
                  </td>
                  <td className="border border-slate-200 p-1">
                    <span className="px-2 py-1.5 text-sm font-semibold text-slate-800">VER123</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Rejection' && (
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-3xl font-bold text-primary sm:text-4xl">Rejection</h2>
            <button
              type="button"
              className="rounded-sm bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
            >
              Submit
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className={`${fieldClass} w-[4.5rem] min-w-[4.5rem]`}
              value={rejectionYear}
              onChange={(e) => setRejectionYear(e.target.value)}
            >
              {REJECTION_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="flex w-full max-w-xs">
              <input
                type="text"
                value={rejectionSearch}
                onChange={(e) => setRejectionSearch(e.target.value)}
                placeholder="Search by Order Sr No."
                className="h-9 flex-1 rounded-l-md border border-primary bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary/25"
              />
              <button
                type="button"
                className="inline-flex h-9 w-12 items-center justify-center rounded-r-md bg-primary text-white transition hover:bg-primary-dark"
                aria-label="Search rejection orders"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-sm border border-slate-300 bg-white shadow-sm">
            <table className="min-w-[1900px] w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="w-10 min-w-[2.5rem] border border-white/25 px-1 py-2 text-center font-bold">&nbsp;</th>
                  <th className="min-w-[6.5rem] border border-white/25 px-2 py-2 font-bold">Date</th>
                  <th className="min-w-[8rem] border border-white/25 px-2 py-2 font-bold">Order Sr No</th>
                  <th className="min-w-[4rem] border border-white/25 px-2 py-2 font-bold">Qty</th>
                  <th className="min-w-[4rem] border border-white/25 px-2 py-2 font-bold">Size</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Remarks</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Mode</th>
                  <th className="min-w-[8rem] border border-white/25 px-2 py-2 font-bold">Reason</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Sell Price</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Amount</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Article</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Brand Name</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Order ID</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Bar Code</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Invoice Date</th>
                  <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Customer ID</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Maker</th>
                  <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Emp ID</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200 bg-white">
                  <td className="border border-slate-200 px-1 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={rejectionChecked}
                      onChange={(e) => setRejectionChecked(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                      aria-label="Select rejection row"
                    />
                  </td>
                  <td className="border border-slate-200 px-2 py-1.5 font-semibold text-slate-800">17-04-2026</td>
                  <td className="border border-slate-200 px-2 py-1.5 font-semibold text-slate-800">25/BGL01-001</td>
                  <td className="border border-slate-200 p-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={rejectionQty}
                      onChange={(e) => setRejectionQty(digitsOnly(e.target.value, 3))}
                      className={rejectionEditableClass}
                      disabled={!rejectionChecked}
                    />
                  </td>
                  <td className="border border-slate-200 px-2 py-1.5 font-semibold text-slate-800">M</td>
                  <td className="border border-slate-200 p-1">
                    <select
                      className={rejectionEditableClass}
                      value={rejectionRemarks}
                      onChange={(e) => setRejectionRemarks(e.target.value)}
                      disabled={!rejectionChecked}
                    >
                      <option value="Return">Return</option>
                      <option value="Exchange">Exchange</option>
                    </select>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <select
                      className={rejectionEditableClass}
                      value={rejectionMode}
                      onChange={(e) => setRejectionMode(e.target.value)}
                      disabled={!rejectionChecked}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </td>
                  <td className="border border-slate-200 p-1">
                    <select
                      className={rejectionEditableClass}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      disabled={!rejectionChecked}
                    >
                      <option value="Improper size">Improper size</option>
                      <option value="Damaged item">Damaged item</option>
                      <option value="Stained glass item">Stained glass item</option>
                      <option value="Colour bleed">Colour bleed</option>
                      <option value="Colour fade">Colour fade</option>
                      <option value="Improper stitching">Improper stitching</option>
                      <option value="Fit issue">Fit issue</option>
                      <option value="I didn't like it">I didn't like it</option>
                    </select>
                  </td>
                  <td className="border border-slate-200 px-2 py-1.5 font-semibold text-slate-800">1000</td>
                  <td className="border border-slate-200 p-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={rejectionAmount}
                      onChange={(e) => setRejectionAmount(normalizeMoney(e.target.value))}
                      className={rejectionEditableClass}
                      disabled={!rejectionChecked}
                    />
                  </td>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-700">Sample Article</td>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-700">Sample Brand</td>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-700">AEQQ21312</td>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-700">TS134NM0</td>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-700">17-04-2026</td>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-700">9875654233</td>
                  <td className="border border-slate-200 p-1">
                    <select
                      className={rejectionEditableClass}
                      value={rejectionMaker}
                      onChange={(e) => setRejectionMaker(e.target.value)}
                      disabled={!rejectionChecked}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Amount refund">Amount refund</option>
                    </select>
                  </td>
                  <td className="border border-slate-200 px-2 py-1.5 text-slate-700">QWE123</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {barcodeModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={closeBarcodeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="barcode-modal-heading"
            className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeBarcodeModal}
              className="absolute right-3 top-3 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <label
              id="barcode-modal-heading"
              htmlFor="barcode-modal-input"
              className="mb-2 block pr-8 text-sm font-bold text-slate-900"
            >
              Bar Code
            </label>
            <input
              ref={barcodeFieldRef}
              id="barcode-modal-input"
              type="text"
              value={barcodeInput}
              onChange={(e) => {
                setBarcodeInput(e.target.value.replace(/[^A-Za-z0-9\-_.]/g, '').slice(0, 48));
                if (barcodeError) setBarcodeError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleBarcodeModalAdd();
                }
              }}
              placeholder="Enter Bar Code"
              title="Scan or type barcode (letters, numbers, hyphen, underscore, dot)"
              className={[
                'w-full rounded-md border-2 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:ring-2',
                barcodeError
                  ? 'border-red-500 focus:border-red-600 focus:ring-red-200/80'
                  : 'border-primary focus:border-primary focus:ring-primary/25',
              ].join(' ')}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!!barcodeError}
              aria-describedby={barcodeError ? 'barcode-modal-error' : undefined}
            />
            {barcodeError ? (
              <p id="barcode-modal-error" className="mt-2 text-xs font-semibold text-red-600" role="alert">
                {barcodeError}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleBarcodeModalAdd}
                className="rounded-sm bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
