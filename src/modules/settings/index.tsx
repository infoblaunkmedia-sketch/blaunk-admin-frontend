import React from 'react';
import { Navigate } from 'react-router-dom';

/** Settings merged into Management — keep route alias only. */
export const SettingsPage: React.FC = () => <Navigate to="/management/rights" replace />;
