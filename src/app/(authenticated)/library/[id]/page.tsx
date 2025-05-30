/**
 * Stitch Pattern Detail Page
 * Detailed view of a single stitch pattern (US_8.1)
 * Shows comprehensive information including instructions and properties
 */

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StitchPatternDetailClient from '@/components/knitting/StitchPatternDetailClient';
import { getStitchPattern } from '@/services/stitchPatternService';
import { generateLibraryPatternMetadata } from '@/utils/metadata';

interface PageProps {
  params: {
    id: string;
  };
}

/**
 * Generate metadata for the pattern detail page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const pattern = await getStitchPattern(params.id);
    
    return {
      title: `${pattern.stitch_name} | Stitch Pattern Library | Malaine`,
      description: pattern.description || `Learn how to create the ${pattern.stitch_name} stitch pattern. Detailed instructions and techniques for ${pattern.craft_type}.`,
      keywords: [
        pattern.stitch_name,
        pattern.craft_type,
        pattern.category || 'pattern',
        'instructions',
        'tutorial',
        ...(pattern.search_keywords || [])
      ]
    };
  } catch {
    return generateLibraryPatternMetadata();
  }
}

/**
 * Stitch Pattern Detail Page Component
 */
export default async function StitchPatternDetailPage({ params }: PageProps) {
  let pattern;
  
  try {
    pattern = await getStitchPattern(params.id);
  } catch (error) {
    console.error('Error fetching stitch pattern:', error);
    notFound();
  }

  if (!pattern) {
    notFound();
  }

  return <StitchPatternDetailClient pattern={pattern} />;
} 