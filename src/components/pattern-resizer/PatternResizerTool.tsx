'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PatternResizerResult } from '@/types/pattern-resizer';
import ResizerMainForm from './ResizerMainForm';

interface PatternResizerToolProps {
  /** Additional CSS classes */
  className?: string;
}

export default function PatternResizerTool({ className = '' }: PatternResizerToolProps) {
  const { t } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);
  const [showDisclaimers, setShowDisclaimers] = useState(false);

  const handleCalculationComplete = (result: PatternResizerResult) => {
    // Could add analytics or other side effects here
    console.log('Pattern calculation completed:', result.success);
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('tools.pattern_resizer.title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          {t('tools.pattern_resizer.subtitle')}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tools.pattern_resizer.description')}
        </p>
      </div>

      {/* Help and Disclaimers Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-md transition-colors"
        >
          <InformationCircleIcon className="w-5 h-5 mr-2" />
          {showHelp ? t('common.hide') : t('tools.pattern_resizer.help.title')}
        </button>
        <button
          onClick={() => setShowDisclaimers(!showDisclaimers)}
          className="inline-flex items-center px-4 py-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-200 rounded-md transition-colors"
        >
          <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          {showDisclaimers ? t('common.hide') : t('tools.pattern_resizer.disclaimers.title')}
        </button>
      </div>

      {/* Help Section */}
      {showHelp && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            {t('tools.pattern_resizer.help.title')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                {t('common.steps')}:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
                {(t('tools.pattern_resizer.help.steps', { returnObjects: true }) as string[]).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                {t('common.tips')}:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                {(t('tools.pattern_resizer.help.tips', { returnObjects: true }) as string[]).map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimers Section */}
      {showDisclaimers && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
            {t('tools.pattern_resizer.disclaimers.title')}
          </h3>
          
          <div className="space-y-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              {t('tools.pattern_resizer.disclaimers.content')}
            </p>
            
            <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
              {(t('tools.pattern_resizer.disclaimers.limitations', { returnObjects: true }) as string[]).map((limitation, index) => (
                <li key={index}>{limitation}</li>
              ))}
            </ul>
            
            <div className="border-t border-yellow-200 dark:border-yellow-700 pt-4 mt-4">
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                {t('tools.pattern_resizer.disclaimers.recommendation')}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 italic">
                {t('tools.pattern_resizer.disclaimers.note')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <ResizerMainForm
          onCalculationComplete={handleCalculationComplete}
        />
      </div>

      {/* Additional Information */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('tools.related_tools')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
              {t('tools.gauge_calculator.title')}
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {t('tools.pattern_resizer.related.gauge_calculator')}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
              {t('tools.yarn_estimator.title')}
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {t('tools.pattern_resizer.related.yarn_estimator')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 