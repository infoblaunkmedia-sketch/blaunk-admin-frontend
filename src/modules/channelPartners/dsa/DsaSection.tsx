import React from 'react';
import { DsaLimit } from './DsaLimit';
import { MediaAds } from '../../marketing/mediaAds/MediaAds';
import { DsaSectionProvider, useDsaSectionRefresh } from './DsaSectionContext';

const TABS = [
  { id: 'media-upload', label: 'Media Upload' },
  { id: 'dsa-limit', label: 'DSA Limit' },
] as const;

type DsaTabId = (typeof TABS)[number]['id'];

const DsaSectionBody: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<DsaTabId>('media-upload');
  const { refreshKey, bumpRefresh } = useDsaSectionRefresh();

  const switchTab = (id: DsaTabId) => {
    setActiveTab(id);
    bumpRefresh();
  };

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-2 w-fit" aria-label="DSA tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchTab(tab.id)}
            className={[
              'rounded-md border px-4 py-1.5 text-sm font-semibold shadow-sm transition',
              activeTab === tab.id
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'media-upload' ? (
        <MediaAds refreshKey={refreshKey} />
      ) : (
        <DsaLimit refreshKey={refreshKey} onSaved={bumpRefresh} />
      )}
    </section>
  );
};

export const DsaSection: React.FC = () => (
  <DsaSectionProvider>
    <DsaSectionBody />
  </DsaSectionProvider>
);
