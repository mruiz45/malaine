/**
 * Stitch Pattern Library Page
 * Comprehensive stitch pattern library with browsing, search, and filtering (US_8.1)
 * Replaces the basic pattern selection functionality with full library features
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StitchLibraryBrowser from '@/components/knitting/StitchLibraryBrowser';

export default function StitchPatternsPage() {
  const { t } = useTranslation();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('stitchLibrary.title', 'Stitch Pattern Library')}
            </h1>
            <p className="text-lg text-gray-600 max-w-4xl">
              {t('stitchLibrary.description', 
                'Explore our comprehensive collection of stitch patterns for knitting and crochet. Browse by category, search by keywords, or filter by difficulty level to find the perfect pattern for your project.'
              )}
            </p>
          </div>

          {/* Library Browser */}
          <StitchLibraryBrowser />

          {/* Help Section */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              {t('stitchLibrary.helpTitle', 'Using the Stitch Library')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div>
                <h3 className="font-medium mb-2">
                  {t('stitchLibrary.browsingTitle', 'Browsing Patterns')}
                </h3>
                <ul className="space-y-1">
                  <li>• {t('stitchLibrary.browsingTip1', 'Click on categories to see patterns in that group')}</li>
                  <li>• {t('stitchLibrary.browsingTip2', 'Use the search bar to find patterns by name or keywords')}</li>
                  <li>• {t('stitchLibrary.browsingTip3', 'Filter by craft type (knitting/crochet) and difficulty level')}</li>
                  <li>• {t('stitchLibrary.browsingTip4', 'Switch between grid and list views for different layouts')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">
                  {t('stitchLibrary.patternsTitle', 'Pattern Information')}
                </h3>
                <ul className="space-y-1">
                  <li>• {t('stitchLibrary.patternsTip1', 'Each pattern shows difficulty level and common uses')}</li>
                  <li>• {t('stitchLibrary.patternsTip2', 'Click on a pattern to view detailed instructions')}</li>
                  <li>• {t('stitchLibrary.patternsTip3', 'Instructions include step-by-step guidance')}</li>
                  <li>• {t('stitchLibrary.patternsTip4', 'Copy or print instructions for offline use')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 