import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { MediaAds } from './mediaAds/MediaAds';
import { MatchDoe } from './matchDoe/MatchDoe';
import { Contests } from './contests/Contests';

const TABS = [
  { label: 'Media Ads', path: '/marketing/media-ads' },
  { label: 'Match Doe', path: '/marketing/match-doe' },
  { label: 'Contests', path: '/marketing/contests' },
];

export const MarketingPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS}>
      <Routes>
        <Route index element={<Navigate to="media-ads" replace />} />
        <Route path="media-ads" element={<MediaAds />} />
        <Route path="match-doe" element={<MatchDoe />} />
        <Route path="contests" element={<Contests />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
