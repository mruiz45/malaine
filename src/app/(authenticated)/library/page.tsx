/**
 * Stitch Pattern Library Page
 * Main page for browsing the stitch pattern library (US_8.1)
 * Provides comprehensive browsing, search, and selection capabilities
 */

import React from 'react';
import { Metadata } from 'next';
import StitchLibraryBrowser from '@/components/knitting/StitchLibraryBrowser';
import { generateLibraryMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateLibraryMetadata();

/**
 * Stitch Pattern Library Page Component
 */
export default function LibraryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <StitchLibraryBrowser />
    </div>
  );
} 