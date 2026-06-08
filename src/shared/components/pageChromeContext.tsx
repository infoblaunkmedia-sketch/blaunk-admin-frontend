import React from 'react';

type PageChromeContextValue = {
  /** When false, module tabs indicate the section — hide page title. */
  showPageTitle: boolean;
};

export const PageChromeContext = React.createContext<PageChromeContextValue>({
  showPageTitle: true,
});

export function usePageChrome(): PageChromeContextValue {
  return React.useContext(PageChromeContext);
}
