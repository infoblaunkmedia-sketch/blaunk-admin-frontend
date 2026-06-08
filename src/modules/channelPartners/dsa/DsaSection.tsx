import React from 'react';
import { useLocation } from 'react-router-dom';
import { DsaLimit } from './DsaLimit';
import { MediaAds } from '../../marketing/mediaAds/MediaAds';
import { DsaSectionProvider, useDsaSectionRefresh } from './DsaSectionContext';
import { PageChromeContext } from '../../../shared/components/pageChromeContext';
import type { DsaSlider } from '../../marketing/marketing.types';

const TABS = [
  { id: 'media-upload', label: 'Media Upload' },
  { id: 'dsa-limit', label: 'DSA Limit' },
] as const;

type DsaTabId = (typeof TABS)[number]['id'];

const DsaSectionBody: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState<DsaTabId>('media-upload');
  const { refreshKey, bumpRefresh } = useDsaSectionRefresh();

  React.useEffect(() => {
    const edit = (location.state as { editSlider?: DsaSlider } | null)?.editSlider;
    if (edit?.id) setActiveTab('media-upload');
  }, [location.state]);

  const switchTab = (id: DsaTabId) => {
    setActiveTab(id);
    bumpRefresh();
  };

  return (
    <PageChromeContext.Provider value={{ showPageTitle: false }}>
    <section className="flex w-full flex-col gap-5">
      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-0" aria-label="DSA tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchTab(tab.id)}
            className={[
              'relative -mb-px rounded-t-lg border border-b-0 px-4 py-2 text-sm font-semibold transition',
              activeTab === tab.id
                ? 'border-slate-200 border-b-white bg-white text-primary'
                : 'border-transparent bg-transparent text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {tab.label}
            {activeTab === tab.id ? (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            ) : null}
          </button>
        ))}
      </nav>

      {activeTab === 'media-upload' ? (
        <MediaAds refreshKey={refreshKey} />
      ) : (
        <DsaLimit refreshKey={refreshKey} onSaved={bumpRefresh} />
      )}
    </section>
    </PageChromeContext.Provider>
  );
};

export const DsaSection: React.FC = () => (
  <DsaSectionProvider>
    <DsaSectionBody />
  </DsaSectionProvider>
);
