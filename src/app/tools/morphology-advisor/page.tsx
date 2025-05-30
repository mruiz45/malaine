import React from 'react';
import { Metadata } from 'next';
import { generateCustomMetadata } from '@/utils/metadata';
import MorphologyAdvisorPageClient from '@/components/tools/MorphologyAdvisorPageClient';

export const metadata: Metadata = generateCustomMetadata(
  'Body Morphology Advisor | Malaine',
  'Get personalized advice on adapting patterns to your specific body characteristics for a better fit.',
  ['morphology', 'body fitting', 'pattern adjustment', 'knitting', 'crochet', 'fitting advice']
);

/**
 * Body Morphology Adaptation Advisor Tool Page
 * Implements User Story 5.2 - Body Morphology Adaptation Advisor Tool
 */
export default function MorphologyAdvisorPage() {
  return <MorphologyAdvisorPageClient />;
} 