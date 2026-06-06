import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/** Legacy `/marketing/*` URLs → Management. */
export const MarketingRedirects: React.FC = () => {
  const { pathname } = useLocation();
  if (pathname.includes('match-doe') || pathname.includes('match-code')) {
    return <Navigate to="/management/match-code" replace />;
  }
  return <Navigate to="/management/plan-charges" replace />;
};
