import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: readonly Tab[] | Tab[];
  activeTab: string;
  onChange: (id: any) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto no-scrollbar ${className}`} aria-label="Tabs">
      <div className="flex w-fit min-w-full gap-2 p-1 sm:min-w-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                'whitespace-nowrap rounded-md border px-4 py-1.5 text-sm font-semibold shadow-sm transition',
                isActive
                  ? 'border-primary bg-primary text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
