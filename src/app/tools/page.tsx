import React from 'react';
import { Metadata } from 'next';
import { generateCustomMetadata } from '@/utils/metadata';
import ToolsPageClient from '@/components/tools/ToolsPageClient';

export const metadata: Metadata = generateCustomMetadata(
  'Development Tools | Malaine',
  'Temporary page to test all tools developed for Malaine',
);

/**
 * Page temporaire pour tester tous les outils développés
 * Cette page sera utilisée pendant le développement pour accéder facilement à tous les outils
 */
export default function ToolsPage() {
  return <ToolsPageClient />;
} 