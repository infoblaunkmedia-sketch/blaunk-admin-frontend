import React from 'react';
import { Navigate } from 'react-router-dom';

/** @deprecated Use Settings → Slot Settings / Match Code. Kept for lazy-import compatibility. */
export const MarketingPage: React.FC = () => <Navigate to="/settings/slot-settings" replace />;
