/**
 * Showcase Gallery Page (US_10.3)
 * Main page for browsing showcased patterns
 */

import React from 'react';
import type { Metadata } from 'next';
import ShowcaseBrowser from '@/components/showcase/ShowcaseBrowser';
import { generateShowcaseMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateShowcaseMetadata();

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