/**
 * Ease Advisor Tool Page
 * Implements User Story 3.2 - Ease Selection Advisor Tool
 * 
 * Dedicated page for the Ease Selection Advisor tool with educational content
 */

import React from 'react';
import type { Metadata } from 'next';
import { generateCustomMetadata } from '@/utils/metadata';
import EaseAdvisorPageClient from '@/components/tools/EaseAdvisorPageClient';

export const metadata: Metadata = generateCustomMetadata(
  'Ease Selection Advisor | Malaine',
  'Get personalized ease recommendations based on garment type, desired fit, and yarn weight for the perfect style and comfort.',
  ['ease', 'knitting', 'crochet', 'fit', 'garment', 'advisor', 'recommendations']
);

/**
 * Ease Advisor Tool Page Component
 */
export default function EaseAdvisorPage() {
  return <EaseAdvisorPageClient />;
} 