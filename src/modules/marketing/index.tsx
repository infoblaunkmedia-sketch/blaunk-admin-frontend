import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ModuleLayout } from '../../shared/components/ModuleLayout';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { MediaAds } from './mediaAds/MediaAds';
import { SlotSettings } from './slotSettings/SlotSettings';
import { MatchDoe } from './matchDoe/MatchDoe';
import { Contests } from './contests/Contests';

const TABS = [
  { label: 'Media Ads', path: '/marketing/media-ads', section: 'media-ads' },
  { label: 'Slot Settings', path: '/marketing/slot-settings', section: 'slot-settings' },
  { label: 'Match Code', path: '/marketing/match-doe', section: 'match-doe' },
  { label: 'Contests', path: '/marketing/contests', section: 'contests' },
];

export const MarketingPage: React.FC = () => (
  <ErrorBoundary>
    <ModuleLayout tabs={TABS} moduleKey="marketing">
      <Routes>
        <Route index element={<Navigate to="media-ads" replace />} />
        <Route path="media-ads" element={<MediaAds />} />
        <Route path="slot-settings" element={<SlotSettings />} />
        <Route path="match-doe" element={<MatchDoe />} />
        <Route path="contests" element={<Contests />} />
      </Routes>
    </ModuleLayout>
  </ErrorBoundary>
);
