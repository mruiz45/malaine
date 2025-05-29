/**
 * Pattern Header Component (US_9.1)
 * Displays pattern title and basic information
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AssembledPattern } from '@/types/assembled-pattern';

interface PatternHeaderProps {
  /** The assembled pattern */
  pattern: AssembledPattern;
  /** Whether in print mode */
  printMode?: boolean;
}

/**
 * Component for displaying pattern header information
 */
export default function PatternHeader({
  pattern,
  printMode = false
}: PatternHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={`text-center ${printMode ? 'mb-8' : 'mb-6'}`}>
      {/* Pattern Title */}
      <h1 className={`font-bold text-gray-900 ${printMode ? 'text-3xl mb-4' : 'text-2xl mb-3'}`}>
        {pattern.patternTitle}
      </h1>
      
      {/* Size Information */}
      <div className={`text-gray-600 ${printMode ? 'text-lg mb-4' : 'text-base mb-3'}`}>
        <p>
          <span className="font-medium">{t('patternViewer.size', 'Size')}:</span> {pattern.targetSizeLabel}
        </p>
      </div>
      
      {/* Craft Type */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        pattern.craftType === 'knitting' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-green-100 text-green-800'
      } ${printMode ? 'mb-4' : 'mb-3'}`}>
        {pattern.craftType === 'knitting' 
          ? t('patternViewer.knitting', 'Knitting')
          : t('patternViewer.crochet', 'Crochet')
        }
      </div>
      
      {/* Generation Info - Only in print mode */}
      {printMode && (
        <div className="text-sm text-gray-500 mt-4 border-b border-gray-200 pb-4">
          <p>{t('patternViewer.generatedOn', 'Generated on')}: {new Date(pattern.generated_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
} 