import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/** Legacy `/marketing/*` URLs → Settings (Slot Settings / Match Code). */
export const MarketingRedirects: React.FC = () => {
  const { pathname } = useLocation();
  if (pathname.includes('match-doe') || pathname.includes('match-code')) {
    return <Navigate to="/settings/match-code" replace />;
  }
  return <Navigate to="/settings/slot-settings" replace />;
};
