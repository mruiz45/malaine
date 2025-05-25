/**
 * Stitch Patterns Page
 * Dedicated page for viewing and selecting stitch patterns
 * Implements US_1.5 requirements for stitch pattern selection and definition
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StitchPatternSelector from '@/components/knitting/StitchPatternSelector';
import type { StitchPattern } from '@/types/stitchPattern';

export default function StitchPatternsPage() {
  const { t } = useTranslation();
  const [selectedPattern, setSelectedPattern] = useState<StitchPattern | null>(null);

  const handlePatternSelect = (pattern: StitchPattern | null) => {
    setSelectedPattern(pattern);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('stitchPattern.title', 'Stitch Patterns')}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              {t('stitchPattern.description', 
                'Choose from our collection of basic stitch patterns for your knitting or crochet projects. Each pattern includes information about stitch repeats and characteristics that will help with your gauge calculations.'
              )}
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  {t('stitchPattern.gaugeImportant', 'Important: Gauge and Stitch Patterns')}
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    {t('stitchPattern.gaugeNotice', 
                      'Your gauge (number of stitches and rows per inch/cm) can vary significantly between different stitch patterns. Always create a gauge swatch in your chosen stitch pattern before starting your project.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <StitchPatternSelector
              selectedPattern={selectedPattern}
              onPatternSelect={handlePatternSelect}
              basicOnly={true}
            />
          </div>

          {/* Selected Pattern Details */}
          {selectedPattern && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('stitchPattern.selectedDetails', 'Selected Pattern Details')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedPattern.stitch_name}
                  </h3>
                  {selectedPattern.description && (
                    <p className="text-gray-600 mb-4">
                      {selectedPattern.description}
                    </p>
                  )}
                  
                  {(selectedPattern.stitch_repeat_width || selectedPattern.stitch_repeat_height) && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">
                        {t('stitchPattern.repeatInfo', 'Repeat Information')}
                      </h4>
                      {selectedPattern.stitch_repeat_width && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Width:</span> {selectedPattern.stitch_repeat_width} stitches
                        </p>
                      )}
                      {selectedPattern.stitch_repeat_height && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Height:</span> {selectedPattern.stitch_repeat_height} rows
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {t('stitchPattern.nextSteps', 'Next Steps')}
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• {t('stitchPattern.step1', 'Create a gauge swatch in this stitch pattern')}</li>
                    <li>• {t('stitchPattern.step2', 'Measure your gauge accurately')}</li>
                    <li>• {t('stitchPattern.step3', 'Use this information for pattern calculations')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 