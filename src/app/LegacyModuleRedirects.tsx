import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/** `/platform/*` and `/settings/*` → `/management/*` */
export const LegacyModulePathRedirect: React.FC = () => {
  const { pathname } = useLocation();
  const next = pathname.replace(/^\/(platform|settings)/, '/management');
  return <Navigate to={next} replace />;
};
