/**
 * Showcase Gallery Page (US_10.3)
 * Main page for browsing showcased patterns
 */

import React from 'react';
import type { Metadata } from 'next';
import ShowcaseBrowser from '@/components/showcase/ShowcaseBrowser';

export const metadata: Metadata = {
  title: 'Pattern Gallery | Malaine',
  description: 'Discover inspiring knitting and crochet patterns. Browse our curated collection of example patterns to see what\'s possible with Malaine.',
  keywords: ['knitting patterns', 'crochet patterns', 'pattern gallery', 'knitting examples', 'crochet examples'],
  openGraph: {
    title: 'Pattern Gallery | Malaine',
    description: 'Discover inspiring knitting and crochet patterns. Browse our curated collection of example patterns.',
    type: 'website',
  },
};

/**
 * Showcase gallery page component
 * This page is accessible without authentication
 */
export default function ShowcasePage() {
  return (
    <main>
      <ShowcaseBrowser />
    </main>
  );
} 