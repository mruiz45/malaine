import React from 'react';
import type { Metadata } from 'next';
import PatternResizerTool from '@/components/pattern-resizer/PatternResizerTool';

export const metadata: Metadata = {
  title: 'Pattern Resizer | Malaine',
  description: 'Adapt existing pattern numbers to your gauge and desired dimensions. Rescale stitch counts and measurements for your specifications.',
  keywords: ['pattern resizer', 'gauge conversion', 'pattern adaptation', 'knitting calculator', 'crochet calculator']
};

/**
 * Pattern Resizer Tool Page (US 10.1)
 * Provides functionality to resize existing patterns to new gauge and dimensions
 */
export default function PatternResizerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PatternResizerTool />
      </div>
    </div>
  );
} 