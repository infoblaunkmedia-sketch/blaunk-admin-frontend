import React from 'react';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { GenerateButton } from '../components/GenerateButton';
import { ReportFilters } from '../components/ReportFilters';

const TOP_TABS = ['Upload', 'MIS'] as const;
const AD_CATEGORIES = [
  'Slider',
  'Explore',
  'Trendy Star',
  'Global Store',
  'Exclusive',
  'New Launch',
  'GIFF',
  'Tour Package',
] as const;

const SECTIONS = ['Select Section', 'Homepage', 'BGT', 'Tour', 'Store', 'Cake', 'Boutique', 'Logistic'] as const;
const COUNTRIES = [
  'Select Country',
  'India',
  'Bahrain',
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

type AdCard = {
  id: number;
  plan: string;
  uploadDate: string;
  expiryDate: string;
  amount: string;
  dsaId: string;
  productId: string;
};

const CATEGORY_DATA: Record<(typeof AD_CATEGORIES)[number], { slots: number; cards: AdCard[] }> = {
  Slider: {
    slots: 3,
    cards: [
      { id: 1, plan: 'Premium', uploadDate: '20/03/2024', expiryDate: '20/04/2024', amount: '1000', dsaId: 'DSA001', productId: 'PROD001' },
      { id: 2, plan: 'Gold', uploadDate: '19/03/2024', expiryDate: '19/04/2024', amount: '800', dsaId: 'DSA002', productId: 'PROD002' },
      { id: 3, plan: 'Platinum', uploadDate: '18/03/2024', expiryDate: '18/04/2024', amount: '1200', dsaId: 'DSA003', productId: 'PROD003' },
    ],
  },
  Explore: {
    slots: 4,
    cards: [
      { id: 4, plan: 'Premium', uploadDate: '20/03/2024', expiryDate: '20/04/2024', amount: '1000', dsaId: 'DSA004', productId: 'PROD004' },
      { id: 5, plan: 'Silver', uploadDate: '19/03/2024', expiryDate: '19/04/2024', amount: '600', dsaId: 'DSA005', productId: 'PROD005' },
      { id: 6, plan: 'Gold', uploadDate: '18/03/2024', expiryDate: '18/04/2024', amount: '800', dsaId: 'DSA006', productId: 'PROD006' },
      { id: 7, plan: 'Platinum', uploadDate: '17/03/2024', expiryDate: '17/04/2024', amount: '1200', dsaId: 'DSA007', productId: 'PROD007' },
    ],
  },
  'Trendy Star': {
    slots: 0,
    cards: [
      { id: 8, plan: 'Premium', uploadDate: '20/03/2024', expiryDate: '20/04/2024', amount: '1000', dsaId: 'DSA008', productId: 'PROD008' },
      { id: 9, plan: 'Gold', uploadDate: '19/03/2024', expiryDate: '19/04/2024', amount: '800', dsaId: 'DSA009', productId: 'PROD009' },
    ],
  },
  'Global Store': {
    slots: 0,
    cards: [
      { id: 10, plan: 'Premium', uploadDate: '20/03/2024', expiryDate: '20/04/2024', amount: '1000', dsaId: 'DSA010', productId: 'PROD010' },
      { id: 11, plan: 'Silver', uploadDate: '19/03/2024', expiryDate: '19/04/2024', amount: '600', dsaId: 'DSA011', productId: 'PROD011' },
      { id: 12, plan: 'Gold', uploadDate: '18/03/2024', expiryDate: '18/04/2024', amount: '800', dsaId: 'DSA012', productId: 'PROD012' },
    ],
  },
  Exclusive: {
    slots: 2,
    cards: [
      { id: 13, plan: 'Premium', uploadDate: '20/03/2024', expiryDate: '20/04/2024', amount: '1000', dsaId: 'DSA013', productId: 'PROD013' },
      { id: 14, plan: 'Platinum', uploadDate: '19/03/2024', expiryDate: '19/04/2024', amount: '1200', dsaId: 'DSA014', productId: 'PROD014' },
    ],
  },
  'New Launch': {
    slots: 0,
    cards: [
      { id: 15, plan: 'Premium', uploadDate: '20/03/2024', expiryDate: '20/04/2024', amount: '1000', dsaId: 'DSA015', productId: 'PROD015' },
      { id: 16, plan: 'Gold', uploadDate: '19/03/2024', expiryDate: '19/04/2024', amount: '800', dsaId: 'DSA016', productId: 'PROD016' },
      { id: 17, plan: 'Silver', uploadDate: '18/03/2024', expiryDate: '18/04/2024', amount: '600', dsaId: 'DSA017', productId: 'PROD017' },
    ],
  },
  GIFF: {
    slots: 2,
    cards: [
      { id: 18, plan: 'Premium', uploadDate: '20/03/2024', expiryDate: '20/04/2024', amount: '1000', dsaId: 'DSA018', productId: 'PROD018' },
      { id: 19, plan: 'Gold', uploadDate: '19/03/2024', expiryDate: '19/04/2024', amount: '800', dsaId: 'DSA019', productId: 'PROD019' },
    ],
  },
  'Tour Package': {
    slots: 0,
    cards: [
      { id: 20, plan: 'Silver', uploadDate: '2024-03-18', expiryDate: '2024-04-18', amount: '600', dsaId: 'DSA020', productId: 'PROD020' },
    ],
  },
};

export const SalesPage: React.FC = () => {
  const [activeTopTab, setActiveTopTab] = React.useState<(typeof TOP_TABS)[number]>('Upload');
  const [activeCategory, setActiveCategory] = React.useState<(typeof AD_CATEGORIES)[number]>('Slider');
  const [section, setSection] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [misFromDate, setMisFromDate] = React.useState('');
  const [misToDate, setMisToDate] = React.useState('');
  const [misReportType, setMisReportType] = React.useState('');
  const [categoryDataMap, setCategoryDataMap] = React.useState<Record<(typeof AD_CATEGORIES)[number], { slots: number; cards: AdCard[] }>>(() =>
    JSON.parse(JSON.stringify(CATEGORY_DATA)) as Record<(typeof AD_CATEGORIES)[number], { slots: number; cards: AdCard[] }>,
  );
  const [isEditingCards, setIsEditingCards] = React.useState(false);
  const [selectedCardIds, setSelectedCardIds] = React.useState<number[]>([]);
  const categoryData = categoryDataMap[activeCategory];

  React.useEffect(() => {
    setIsEditingCards(false);
    setSelectedCardIds([]);
  }, [activeCategory]);

  const toggleCardSelection = (id: number) => {
    setSelectedCardIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDeleteSelected = () => {
    if (selectedCardIds.length === 0) return;
    setCategoryDataMap((prev) => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        cards: prev[activeCategory].cards.filter((c) => !selectedCardIds.includes(c.id)),
      },
    }));
    setSelectedCardIds([]);
  };

  return (
    <div className="mx-auto flex max-w-[100rem] flex-col gap-4">
      <Tabs
        tabs={TOP_TABS.map((tab) => ({ id: tab, label: tab }))}
        activeTab={activeTopTab}
        onChange={(id) => setActiveTopTab(id)}
        className="max-w-md"
      />

      <div className="flex flex-col gap-0.5">
        <h1 className="text-3xl font-semibold text-primary">
          {activeTopTab === 'MIS' ? 'MIS' : 'Sales Advertisement'}
        </h1>
      </div>

      {activeTopTab === 'MIS' ? (
        <section className="space-y-4">
          <ReportFilters
            columns={['From Date', 'To Date', 'Department', 'Data', 'Report Type', 'Output Format', 'Actions']}
            gridTemplate="1fr 1fr 1fr 0.9fr 1fr 1fr 0.9fr"
            gap="gap-x-2"
            paddingY="py-4"
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
              <Input isReadOnly value="Sales" />
            </div>
            <div className="px-1">
              <Input isReadOnly value="All" />
            </div>
            <div className="px-1">
              <Select
                value={misReportType}
                onChange={(e) => setMisReportType(e.target.value)}
                options={[
                  { value: '', label: 'Select Report' },
                  { value: 'mis-subscription', label: 'MIS - Subscription' },
                  { value: 'mis-lead-tour', label: 'MIS - Lead Tour' },
                  { value: 'mis-lead-cake', label: 'MIS - Lead Cake' },
                  { value: 'mis-lead-store', label: 'MIS - Lead Store' },
                  { value: 'mis-product-listing', label: 'MIS - Product Listing' },
                  { value: 'mis-email-subscription', label: 'MIS - Email Subscription' }
                ]}
              />
            </div>
            <div className="px-1">
              <Input isReadOnly value="Excel" />
            </div>
            <div className="px-1">
              <GenerateButton onClick={() => {}} />
            </div>
          </ReportFilters>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="flex w-fit min-w-full flex-nowrap items-center gap-2 sm:min-w-0">
              {AD_CATEGORIES.map((cat) => {
                const isActive = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={[
                      'rounded-md border px-4 py-1.5 text-sm font-semibold shadow-sm transition',
                      isActive
                        ? 'border-primary bg-primary text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                    ].join(' ')}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold text-slate-800">{activeCategory}</h2>
            <div className="flex items-start gap-3">
              <span className="rounded-md border border-primary px-3 py-1.5 text-sm font-semibold text-slate-700">
                Slots: {categoryData.slots}
              </span>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingCards) {
                      setIsEditingCards(false);
                      setSelectedCardIds([]);
                      return;
                    }
                    setIsEditingCards(true);
                  }}
                  className={[
                    'inline-flex items-center rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition',
                    isEditingCards ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-dark',
                  ].join(' ')}
                >
                  {isEditingCards ? 'Save' : 'Edit'}
                </button>
                {isEditingCards ? (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="inline-flex items-center rounded-md bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                    disabled={selectedCardIds.length === 0}
                  >
                    Delete Selected ({selectedCardIds.length})
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              >
                {SECTIONS.map((item) => (
                  <option key={item} value={item === 'Select Section' ? '' : item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              >
                {COUNTRIES.map((item) => (
                  <option key={item} value={item === 'Select Country' ? '' : item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {categoryData.cards.map((card) => (
              <article key={card.id} className="relative rounded border border-slate-300 bg-white p-3">
                {isEditingCards ? (
                  <input
                    type="checkbox"
                    checked={selectedCardIds.includes(card.id)}
                    onChange={() => toggleCardSelection(card.id)}
                    className="absolute left-2 top-2 h-5 w-5 accent-primary"
                    aria-label={`Select ad ${card.id}`}
                  />
                ) : null}
                <div className="flex gap-3">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-100">
                    <img
                      src="https://placehold.co/112x112?text=AD"
                      alt={`Ad ${card.id}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 text-sm text-slate-800">
                    <p><span className="font-bold">Plan:</span> {card.plan}</p>
                    <p><span className="font-bold">Upload Date:</span> {card.uploadDate}</p>
                    <p><span className="font-bold">Expiry Date:</span> {card.expiryDate}</p>
                    <p><span className="font-bold">Amount:</span> {card.amount}</p>
                    <p><span className="font-bold">DSA ID:</span> {card.dsaId}</p>
                    <p><span className="font-bold">Product ID:</span> {card.productId}</p>
                  </div>
                </div>
              </article>
            ))}
            {categoryData.cards.length === 0 ? (
              <div className="rounded border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 lg:col-span-3">
                No cards configured for this category yet.
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
};

