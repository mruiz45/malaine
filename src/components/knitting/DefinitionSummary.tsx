'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatternDefinition } from '@/contexts/PatternDefinitionContext';
import { 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

/**
 * Definition Summary Component
 * Displays a summary of the current pattern definition session
 */
export default function DefinitionSummary() {
  const { t } = useTranslation();
  const {
    currentSession,
    navigation,
    generateSummary,
    saveSession
  } = usePatternDefinition();

  if (!currentSession) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('patternDefinition.summary.title', 'Pattern Summary')}
        </h3>
        <p className="text-gray-500 text-sm">
          {t('patternDefinition.summary.noSession', 'No active session')}
        </p>
      </div>
    );
  }

  const summary = generateSummary();

  /**
   * Handle save session
   */
  const handleSaveSession = async () => {
    try {
      await saveSession();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {t('patternDefinition.summary.title', 'Pattern Summary')}
        </h3>
        <button
          onClick={handleSaveSession}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          {t('common.save', 'Save')}
        </button>
      </div>

      {/* Session Info */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">
          {currentSession.session_name || t('patternDefinition.untitledSession', 'Untitled Session')}
        </h4>
        <p className="text-sm text-gray-500">
          {t('patternDefinition.lastUpdated', 'Last updated')}: {' '}
          {new Date(currentSession.updated_at).toLocaleDateString()}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {t('patternDefinition.progress', 'Progress')}
          </span>
          <span className="text-sm text-gray-500">
            {summary.completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${summary.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps Summary */}
      <div className="space-y-3">
        {summary.steps.map((step) => (
          <div key={step.step} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {step.completed ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : step.step === navigation.currentStep ? (
                <ClockIcon className="h-5 w-5 text-blue-500" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                step.completed ? 'text-gray-900' : 
                step.step === navigation.currentStep ? 'text-blue-900' : 
                'text-gray-500'
              }`}>
                {t(`patternDefinition.steps.${step.step}.label`, step.step)}
              </p>
              {step.summary && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {step.summary}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Summary */}
      {summary.completionPercentage > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">
            {t('patternDefinition.summary.details', 'Details')}
          </h4>
          
          <div className="space-y-3 text-sm">
            {/* Gauge */}
            {currentSession.selected_gauge_profile_id && (
              <div>
                <span className="font-medium text-gray-700">
                  {t('gauge.title', 'Gauge')}:
                </span>
                <p className="text-gray-600 mt-1">
                  Gauge Profile Selected
                  {currentSession.gauge_stitch_count && (
                    <>
                      <br />
                      <span className="text-xs">
                        {currentSession.gauge_stitch_count} sts, {currentSession.gauge_row_count} rows
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Measurements */}
            {currentSession.selected_measurement_set_id && (
              <div>
                <span className="font-medium text-gray-700">
                  {t('measurements.title', 'Measurements')}:
                </span>
                <p className="text-gray-600 mt-1">
                  Measurement Set Selected
                </p>
              </div>
            )}

            {/* Ease */}
            {currentSession.ease_type && (
              <div>
                <span className="font-medium text-gray-700">
                  {t('ease.title', 'Ease')}:
                </span>
                <p className="text-gray-600 mt-1">
                  {currentSession.ease_type}
                  {currentSession.ease_value_bust && (
                    <span className="text-xs ml-1">
                      ({currentSession.ease_value_bust}{currentSession.ease_unit})
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Yarn */}
            {currentSession.selected_yarn_profile_id && (
              <div>
                <span className="font-medium text-gray-700">
                  {t('yarn.title', 'Yarn')}:
                </span>
                <p className="text-gray-600 mt-1">
                  Yarn Profile Selected
                </p>
              </div>
            )}

            {/* Stitch Pattern */}
            {currentSession.selected_stitch_pattern_id && (
              <div>
                <span className="font-medium text-gray-700">
                  {t('stitchPattern.title', 'Stitch Pattern')}:
                </span>
                <p className="text-gray-600 mt-1">
                  Stitch Pattern Selected
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ready for Calculation */}
      {summary.readyForCalculation && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-green-800">
                {t('patternDefinition.readyForCalculation', 'Ready for Calculation')}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {t('patternDefinition.readyForCalculationDescription', 'Your pattern definition is complete and ready for the calculation engine.')}
            </p>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {t('patternDefinition.status.label', 'Status')}:
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            currentSession.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
            currentSession.status === 'ready_for_calculation' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {t(`patternDefinition.status.${currentSession.status}`, currentSession.status)}
          </span>
        </div>
      </div>
    </div>
  );
} 