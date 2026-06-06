import React from 'react';
import { Navigate } from 'react-router-dom';

/** @deprecated Use Management. Kept for lazy-import compatibility. */
export const MarketingPage: React.FC = () => <Navigate to="/management/plan-charges" replace />;
