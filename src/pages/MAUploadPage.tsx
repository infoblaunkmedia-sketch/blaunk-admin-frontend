import React from 'react';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { Input } from '../components/Input';
import { Select } from '../components/Select';

const TABS = ['BGT', 'Sponsor Ads'] as const;

const BGT_OPTIONS = [
  'Select Product',
  'BGT ads',
  'Trendy Star',
  'Exclusive',
  'BGT Trending',
  'BGT Housing',
  'BGT Computer',
  'BGT Farmer',
] as const;

const SPONSOR_OPTIONS = [
  'Select Option',
  'Slider A',
  'ADS',
  'Connect farmer',
] as const;
const SPONSOR_SECTIONS = [
  'Select Section',
  'Homepage',
  'BGT',
  'Tour',
  'Store',
  'Cake',
  'Boutique',
  'Logistic',
] as const;
const SPONSOR_COUNTRIES = [
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

const PRODUCT_ASPECT_RATIO: Record<string, string> = {
  'Trendy Star': '1.46:1',
  'BGT ads': '1.79:1',
  Exclusive: '3.84:1',
  'BGT Trending': '4.80:1',
  'BGT Housing': '4.22:1',
  'BGT Computer': '3.62:1',
  'BGT Farmer': '2.17:1',
};

export const MAUploadPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]>('BGT');
  const [selectedProduct, setSelectedProduct] = React.useState('');
  const [sponsorSection, setSponsorSection] = React.useState('');
  const [sponsorOption, setSponsorOption] = React.useState('');
  const [sponsorCountry, setSponsorCountry] = React.useState('');
  const [files, setFiles] = React.useState<Record<number, string>>({});
  const [previews, setPreviews] = React.useState<Record<number, string>>({});
  const [aspectRatio, setAspectRatio] = React.useState('1.46:1');
  const [isEditing, setIsEditing] = React.useState(false);

  const productOptions = activeTab === 'BGT' ? BGT_OPTIONS : SPONSOR_OPTIONS;

  React.useEffect(() => {
    setSelectedProduct('');
    setSponsorSection('');
    setSponsorOption('');
    setSponsorCountry('');
    setFiles({});
    setPreviews({});
    setIsEditing(false);
  }, [activeTab]);

  React.useEffect(() => {
    setIsEditing(false);
  }, [selectedProduct]);

  React.useEffect(() => {
    if (!selectedProduct) {
      setAspectRatio('1.46:1');
      return;
    }
    setAspectRatio(PRODUCT_ASPECT_RATIO[selectedProduct] || '1.46:1');
  }, [selectedProduct]);

  return (
    <div className="mx-auto flex max-w-[100rem] flex-col gap-4">
      <Tabs
        tabs={TABS.map(t => ({ id: t, label: t }))}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id)}
      />

      {activeTab === 'Sponsor Ads' ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 md:grid-cols-3">
              <div className="min-w-0 w-full sm:max-w-sm">
                <Select
                  label="Section"
                  value={sponsorSection}
                  onChange={(e) => {
                    setSponsorSection(e.target.value);
                    setSponsorOption('');
                    setSponsorCountry('');
                  }}
                  options={SPONSOR_SECTIONS.map(s => ({ value: s === 'Select Section' ? '' : s, label: s }))}
                />
              </div>

              {sponsorSection ? (
                <>
                  <div className="min-w-0 w-full sm:max-w-sm">
                    <Select
                      label="Options"
                      value={sponsorOption}
                      className="sponsor-options-case"
                      onChange={(e) => setSponsorOption(e.target.value)}
                      options={SPONSOR_OPTIONS.map(o => ({ value: o === 'Select Option' ? '' : o, label: o }))}
                    />
                  </div>

                  <div className="min-w-0 w-full sm:max-w-sm">
                    <Select
                      label="Country"
                      value={sponsorCountry}
                      onChange={(e) => setSponsorCountry(e.target.value)}
                      options={SPONSOR_COUNTRIES.map(c => ({ value: c === 'Select Country' ? '' : c, label: c }))}
                    />
                  </div>
                </>
              ) : null}
            </div>
            <div className="shrink-0 sm:pb-[2px]">
              <Button
                variant={isEditing ? 'success' : 'primary'}
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 w-full sm:max-w-md sm:flex-1">
              <Select
                label="Select Option"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                isReadOnly={isEditing}
                options={productOptions.map(o => ({ value: o.includes('Select') ? '' : o, label: o }))}
              />
            </div>
            <div className="shrink-0 sm:pb-[2px]">
              <Button
                variant={isEditing ? 'success' : 'primary'}
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={!selectedProduct}
              >
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            </div>
          </div>

          {selectedProduct ? (
        <section className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-800">Upload for: {selectedProduct}</h2>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Aspect ratio selection</p>
            <label className="inline-flex items-center gap-2 text-sm text-slate-800">
              <input
                type="radio"
                name="ratio"
                value={aspectRatio}
                checked
                readOnly
                className="accent-cyan-600"
              />
              {aspectRatio}
            </label>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => {
              const slot = idx + 1;
              const fileName = files[slot] || 'Click to update (max 400KB)';
              const preview = previews[slot] || '';
              return (
                <div key={slot} className="flex flex-col items-center gap-2">
                  <p className="text-xl font-bold text-slate-800">
                    {selectedProduct} {slot}
                  </p>
                  <label
                    className={[
                      'flex h-44 w-44 flex-col overflow-hidden rounded border border-red-300 bg-white',
                      isEditing ? 'cursor-pointer' : 'cursor-default opacity-80',
                    ].join(' ')}
                  >
                    <div className="border-b border-red-300 bg-[#ececab] px-2 py-2 text-center text-xs font-semibold text-slate-700">
                      Image
                    </div>
                    {preview ? (
                      <div className="flex flex-1 items-center justify-center bg-slate-400 p-2">
                        <img src={preview} alt={`${selectedProduct} ${slot}`} className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="flex flex-1 items-center justify-center px-2 text-center text-[11px] text-red-500">
                        {fileName}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!isEditing}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 400 * 1024) {
                          return;
                        }
                        const objectUrl = URL.createObjectURL(file);
                        setFiles((prev) => ({ ...prev, [slot]: file.name }));
                        setPreviews((prev) => ({ ...prev, [slot]: objectUrl }));
                      }}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </section>
          ) : null}
        </>
      )}
    </div>
  );
};
