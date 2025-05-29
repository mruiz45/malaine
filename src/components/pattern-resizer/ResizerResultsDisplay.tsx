'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PatternResizerResult } from '@/types/pattern-resizer';
import { formatPatternResizerResult } from '@/services/patternResizerService';

interface ResizerResultsDisplayProps {
  /** Calculation result to display */
  result: PatternResizerResult;
  /** Template key used for the calculation */
  templateKey: string;
  /** Whether to show detailed metadata */
  showMetadata?: boolean;
}

/**
 * Component for displaying pattern resizer calculation results
 * Shows the calculated new values in a clear, organized format
 */
export default function ResizerResultsDisplay({
  result,
  templateKey,
  showMetadata = true
}: ResizerResultsDisplayProps) {
  const { t } = useTranslation();

  const { formattedValues, warnings, metadata } = formatPatternResizerResult(result);

  // Define display order and labels for different templates
  const getDisplayFields = (templateKey: string) => {
    switch (templateKey) {
      case 'simple_body_panel_rectangular':
      case 'simple_scarf_rectangular':
        return [
          { key: 'new_cast_on_stitches', type: 'count' },
          { key: 'new_total_rows', type: 'count' },
          { key: 'new_actual_width', type: 'dimension' },
          { key: 'new_actual_length', type: 'dimension' }
        ];
      
      case 'simple_sleeve_tapered':
        return [
          { key: 'new_cuff_stitches', type: 'count' },
          { key: 'new_upper_arm_stitches', type: 'count' },
          { key: 'new_sleeve_length_rows', type: 'count' },
          { key: 'new_shaping_schedule_summary', type: 'text' }
        ];
      
      case 'simple_hat_cylindrical':
        return [
          { key: 'new_cast_on_stitches', type: 'count' },
          { key: 'new_total_rows', type: 'count' },
          { key: 'new_actual_circumference', type: 'dimension' },
          { key: 'new_actual_height', type: 'dimension' }
        ];
      
      default:
        return Object.keys(formattedValues).map(key => ({ key, type: 'generic' }));
    }
  };

  const displayFields = getDisplayFields(templateKey);

  const formatValue = (value: string, type: string) => {
    switch (type) {
      case 'count':
        return `${value} ${t('tools.pattern_resizer.results.stitches')}`;
      case 'dimension':
        // Assume unit will be handled by the backend calculation
        return value;
      case 'text':
        return value;
      default:
        return value;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'count':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'dimension':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21l3-3-3-3m8 6l3-3-3-3M4 3h16M4 21h16" />
          </svg>
        );
      case 'text':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('tools.pattern_resizer.results.title')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('tools.pattern_resizer.results.calculation_summary')}
        </p>
      </div>

      {/* Calculated Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayFields.map(({ key, type }) => {
          const value = formattedValues[key];
          if (!value) return null;

          return (
            <div
              key={key}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(type)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {t(`tools.pattern_resizer.results.${key}`) || key.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-lg font-semibold text-gray-800">
                    {type === 'count' || type === 'dimension' ? formatValue(value, type) : value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Considerations
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      {showMetadata && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {t('tools.pattern_resizer.results.calculation_summary')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">{t('tools.pattern_resizer.results.template_used')}:</span>
              <br />
              {t(`tools.pattern_resizer.templates.${metadata.templateUsed}.name`) || metadata.templateUsed}
            </div>
            <div>
              <span className="font-medium">Calculated:</span>
              <br />
              {new Date(metadata.calculatedAt).toLocaleString()}
            </div>
            {metadata.hadShaping && (
              <div>
                <span className="font-medium">Features:</span>
                <br />
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Includes Shaping
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimers */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-orange-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">
              {t('tools.pattern_resizer.disclaimers.title')}
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p className="mb-2">{t('tools.pattern_resizer.disclaimers.content')}</p>
              <ul className="list-disc list-inside space-y-1 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <li key={i}>
                    {t(`tools.pattern_resizer.disclaimers.limitations.${i}`)}
                  </li>
                ))}
              </ul>
              <p className="font-medium">{t('tools.pattern_resizer.disclaimers.recommendation')}</p>
              <p className="text-xs mt-1 italic">{t('tools.pattern_resizer.disclaimers.note')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 