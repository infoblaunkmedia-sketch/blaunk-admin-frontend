import React from 'react';

type DsaSectionContextValue = {
  refreshKey: number;
  bumpRefresh: () => void;
};

const DsaSectionContext = React.createContext<DsaSectionContextValue>({
  refreshKey: 0,
  bumpRefresh: () => {},
});

export function useDsaSectionRefresh() {
  return React.useContext(DsaSectionContext);
}

export const DsaSectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const bumpRefresh = React.useCallback(() => setRefreshKey((k) => k + 1), []);
  const value = React.useMemo(() => ({ refreshKey, bumpRefresh }), [refreshKey, bumpRefresh]);
  return <DsaSectionContext.Provider value={value}>{children}</DsaSectionContext.Provider>;
};
