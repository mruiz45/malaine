/**
 * Stitch Pattern Detail Page
 * Detailed view of a single stitch pattern (US_8.1)
 * Shows comprehensive information including instructions and properties
 */

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import StitchPatternCard from '@/components/knitting/StitchPatternCard';
import StitchPreviewDisplay from '@/components/knitting/StitchPreviewDisplay';
import StitchInstructionsView from '@/components/knitting/StitchInstructionsView';
import { getStitchPattern } from '@/services/stitchPatternService';

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
        pattern.category || 'stitch pattern',
        'instructions',
        'tutorial',
        ...(pattern.search_keywords || [])
      ]
    };
  } catch {
    return {
      title: 'Stitch Pattern | Malaine',
      description: 'Detailed stitch pattern instructions and information.'
    };
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm mb-6">
        <Link 
          href="/library"
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Library
        </Link>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">{pattern.stitch_name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pattern Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {pattern.stitch_name}
                </h1>
                
                {/* Pattern Metadata */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {pattern.craft_type}
                  </span>
                  
                  {pattern.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {pattern.category}
                    </span>
                  )}
                  
                  {pattern.difficulty_level && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {pattern.difficulty_level}
                    </span>
                  )}
                  
                  {pattern.is_basic && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Basic Pattern
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {pattern.description && (
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                {pattern.description}
              </p>
            )}

            {/* Pattern Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-4">
              {pattern.stitch_repeat_width && pattern.stitch_repeat_height && (
                <div>
                  <span className="font-medium text-gray-900">Repeat Size:</span>
                  <span className="text-gray-600 ml-2">
                    {pattern.stitch_repeat_width} stitches × {pattern.stitch_repeat_height} rows
                  </span>
                </div>
              )}
              
              {pattern.common_uses && pattern.common_uses.length > 0 && (
                <div>
                  <span className="font-medium text-gray-900">Common Uses:</span>
                  <span className="text-gray-600 ml-2">
                    {pattern.common_uses.join(', ')}
                  </span>
                </div>
              )}
              
              {pattern.search_keywords && pattern.search_keywords.length > 0 && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-900">Keywords:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pattern.search_keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-200 text-gray-700"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Instructions */}
          <StitchInstructionsView 
            pattern={pattern}
            expanded={true}
          />

          {/* Pattern Properties */}
          <StitchPreviewDisplay 
            pattern={pattern}
            compact={false}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pattern Preview Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Pattern Preview
            </h3>
            <StitchPatternCard
              pattern={pattern}
              clickable={false}
              showCategory={true}
              showDifficulty={true}
              showCraftType={true}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Add to Favorites
              </button>
              
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Use in Project
              </button>
              
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Share Pattern
              </button>
            </div>
          </div>

          {/* Related Patterns */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Related Patterns
            </h3>
            <p className="text-sm text-gray-600">
              More patterns in the {pattern.category} category will appear here.
            </p>
            {/* TODO: Implement related patterns functionality */}
          </div>
        </div>
      </div>
    </div>
  );
} 