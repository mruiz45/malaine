/**
 * MorphologyAdviceDisplay Component
 * Displays morphology advice in an organized, readable format
 * Implements User Story 5.2 - Body Morphology Adaptation Advisor Tool
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ScaleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import type { MorphologyAdviceDisplayProps } from '@/types/morphologyAdvisor';

/**
 * Morphology advice display component
 */
export default function MorphologyAdviceDisplay({
  advisory,
  expanded = false,
  onToggleExpanded
}: MorphologyAdviceDisplayProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(expanded);

  /**
   * Handles expansion toggle
   */
  const handleToggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    if (onToggleExpanded) {
      onToggleExpanded();
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleToggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <InformationCircleIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {advisory.display_name}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {advisory.description}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Fitting Implications */}
          {advisory.implications && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-yellow-800 mb-2">
                    {t('morphology_advisor.fitting_implications')}
                  </h5>
                  <p className="text-sm text-yellow-700">
                    {advisory.implications}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Measurement Focus */}
          {advisory.measurement_focus && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-blue-800 mb-2">
                    {t('morphology_advisor.measurement_focus')}
                  </h5>
                  <p className="text-sm text-blue-700">
                    {advisory.measurement_focus}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ease Considerations */}
          {advisory.ease_considerations && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ScaleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-green-800 mb-2">
                    {t('morphology_advisor.ease_considerations')}
                  </h5>
                  <p className="text-sm text-green-700">
                    {advisory.ease_considerations}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Adjustment Suggestions */}
          {advisory.adjustment_suggestions && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <WrenchScrewdriverIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-purple-800 mb-2">
                    {t('morphology_advisor.adjustment_suggestions')}
                  </h5>
                  <p className="text-sm text-purple-700">
                    {advisory.adjustment_suggestions}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Image (if available) */}
          {advisory.image_url && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-800 mb-3">
                {t('morphology_advisor.visual_guide')}
              </h5>
              <img
                src={advisory.image_url}
                alt={`Visual guide for ${advisory.display_name}`}
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>
          )}

          {/* Related Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-800 mb-2">
              {t('morphology_advisor.related_information')}
            </h5>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                • {t('morphology_advisor.related_measurements_link')}
              </p>
              <p>
                • {t('morphology_advisor.related_ease_link')}
              </p>
              <p>
                • {t('morphology_advisor.pattern_selection_tips')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 