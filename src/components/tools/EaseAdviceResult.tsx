/**
 * EaseAdviceResult Component
 * Displays the results of ease advice with clear explanations
 * Implements User Story 3.2 - Ease Selection Advisor Tool
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { 
  EaseAdviceResponse, 
  EaseMeasurement,
  GarmentCategory,
  EaseApplicationData
} from '@/types/easeAdvisor';
import { 
  formatEaseRange,
  isRelevantMeasurement,
  convertCmToInches
} from '@/services/easeAdvisorService';

interface EaseAdviceResultProps {
  /** The ease advice response data */
  adviceData: EaseAdviceResponse['data'];
  /** The garment category for filtering relevant measurements */
  garmentCategory: GarmentCategory;
  /** Preferred unit for display */
  displayUnit?: 'cm' | 'inch';
  /** Callback when user wants to apply the suggestion */
  onApplySuggestion?: (applicationData: EaseApplicationData) => void;
  /** Whether the apply button should be shown */
  showApplyButton?: boolean;
}

/**
 * Component to display ease advice results
 */
export default function EaseAdviceResult({
  adviceData,
  garmentCategory,
  displayUnit = 'cm',
  onApplySuggestion,
  showApplyButton = true
}: EaseAdviceResultProps) {
  const { t } = useTranslation();

  if (!adviceData) {
    return null;
  }

  const { advised_ease, explanation, is_fallback } = adviceData;

  /**
   * Converts ease measurement values to display unit
   */
  const convertMeasurement = (value: number): number => {
    return displayUnit === 'inch' ? convertCmToInches(value) : value;
  };

  /**
   * Gets the measurement display name
   */
  const getMeasurementDisplayName = (measurementKey: string): string => {
    const measurementNames: Record<string, string> = {
      bust_ease: t('ease_advisor.measurements.bust_ease'),
      waist_ease: t('ease_advisor.measurements.waist_ease'),
      hip_ease: t('ease_advisor.measurements.hip_ease'),
      sleeve_ease: t('ease_advisor.measurements.sleeve_ease'),
      head_circumference: t('ease_advisor.measurements.head_circumference'),
      foot_circumference: t('ease_advisor.measurements.foot_circumference')
    };
    
    return measurementNames[measurementKey] || measurementKey;
  };

  /**
   * Handles applying the suggestion to ease preferences
   */
  const handleApplySuggestion = () => {
    if (!onApplySuggestion) return;

    const applicationData: EaseApplicationData = {
      measurement_unit: displayUnit
    };

    // Map the advised ease to the application data structure
    if (advised_ease.bust_ease && isRelevantMeasurement(garmentCategory, 'bust_ease')) {
      applicationData.bust_ease = convertMeasurement(advised_ease.bust_ease.recommended);
    }
    if (advised_ease.waist_ease && isRelevantMeasurement(garmentCategory, 'waist_ease')) {
      applicationData.waist_ease = convertMeasurement(advised_ease.waist_ease.recommended);
    }
    if (advised_ease.hip_ease && isRelevantMeasurement(garmentCategory, 'hip_ease')) {
      applicationData.hip_ease = convertMeasurement(advised_ease.hip_ease.recommended);
    }
    if (advised_ease.sleeve_ease && isRelevantMeasurement(garmentCategory, 'sleeve_ease')) {
      applicationData.sleeve_ease = convertMeasurement(advised_ease.sleeve_ease.recommended);
    }

    onApplySuggestion(applicationData);
  };

  /**
   * Renders a single ease measurement
   */
  const renderEaseMeasurement = (
    measurementKey: string,
    measurement: EaseMeasurement
  ) => {
    if (!isRelevantMeasurement(garmentCategory, measurementKey)) {
      return null;
    }

    const convertedMin = convertMeasurement(measurement.min);
    const convertedMax = convertMeasurement(measurement.max);
    const convertedRecommended = convertMeasurement(measurement.recommended);

    return (
      <div key={measurementKey} className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">
          {getMeasurementDisplayName(measurementKey)}
        </h4>
        <div className="text-lg font-semibold text-blue-600 mb-1">
          {formatEaseRange(convertedMin, convertedMax, convertedRecommended, displayUnit)}
        </div>
        <div className="text-sm text-gray-600">
          {t('ease_advisor.recommended_value')}: {convertedRecommended}{displayUnit === 'cm' ? 'cm' : '"'}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-6 w-6 text-green-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('ease_advisor.advice_title')}
          </h3>
          {is_fallback && (
            <div className="mt-1 flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-600">
                {t('ease_advisor.fallback_notice')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              {t('ease_advisor.explanation_title')}
            </h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Ease Measurements */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">
          {t('ease_advisor.suggested_ease_values')}
        </h4>
        
        {Object.keys(advised_ease).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>{t('ease_advisor.no_specific_measurements')}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(advised_ease).map(([key, measurement]) => {
              if (measurement && typeof measurement === 'object' && 'min' in measurement) {
                return renderEaseMeasurement(key, measurement);
              }
              return null;
            })}
          </div>
        )}
      </div>

      {/* Apply Suggestion Button */}
      {showApplyButton && onApplySuggestion && Object.keys(advised_ease).length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">
                {t('ease_advisor.apply_suggestion_title')}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {t('ease_advisor.apply_suggestion_description')}
              </p>
            </div>
            <button
              onClick={handleApplySuggestion}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('ease_advisor.apply_suggestion_button')}
            </button>
          </div>
        </div>
      )}

      {/* Unit Display Info */}
      <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
        {t('ease_advisor.measurements_in_unit', { unit: displayUnit === 'cm' ? 'centimeters' : 'inches' })}
      </div>
    </div>
  );
} 