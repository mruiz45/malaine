'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatternDefinition } from '@/contexts/PatternDefinitionContext';
import DefinitionStepper from './DefinitionStepper';
import DefinitionSummary from './DefinitionSummary';
import SessionHeader from './SessionHeader';

/**
 * Pattern Definition Workspace Component (US_1.6)
 * Main workspace for pattern definition sessions
 */
export default function PatternDefinitionWorkspace() {
  const { t } = useTranslation();
  const {
    currentSession,
    navigation,
    isLoading,
    error
  } = usePatternDefinition();

  if (!currentSession) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">
              {t('patternDefinition.noSession', 'No Active Session')}
            </h2>
            <p className="text-yellow-700">
              {t('patternDefinition.noSessionDescription', 'Please create or select a pattern definition session to continue.')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              {t('common.error', 'Error')}
            </h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session Header */}
      <SessionHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md">
                {/* Step Navigation */}
                <div className="border-b border-gray-200 p-6">
                  <DefinitionStepper />
                </div>

                {/* Step Content */}
                <div className="p-6">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  ) : (
                    <StepContent currentStep={navigation.currentStep} />
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <DefinitionSummary />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step Content Component
 * Renders the appropriate content based on the current step
 */
function StepContent({ currentStep }: { currentStep: string }) {
  const { t } = useTranslation();
  const { currentSession, updateSession } = usePatternDefinition();

  const handleGaugeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await updateSession({
      selected_gauge_profile_id: crypto.randomUUID(), // Simulated ID
      gauge_stitch_count: parseFloat(formData.get('stitchCount') as string),
      gauge_row_count: parseFloat(formData.get('rowCount') as string),
      gauge_unit: formData.get('unit') as string
    });
  };

  const handleMeasurementsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    await updateSession({
      selected_measurement_set_id: crypto.randomUUID() // Simulated ID
    });
  };

  const handleEaseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await updateSession({
      ease_type: formData.get('easeType') as string,
      ease_value_bust: parseFloat(formData.get('easeValue') as string),
      ease_unit: formData.get('easeUnit') as string
    });
  };

  const handleYarnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    await updateSession({
      selected_yarn_profile_id: crypto.randomUUID() // Simulated ID
    });
  };

  const handleStitchPatternSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    await updateSession({
      selected_stitch_pattern_id: crypto.randomUUID() // Simulated ID
    });
  };

  switch (currentStep) {
    case 'gauge':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('gauge.title', 'Gauge')}</h2>
          <form onSubmit={handleGaugeSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="stitchCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Stitch Count (per 10cm)
                </label>
                <input
                  type="number"
                  id="stitchCount"
                  name="stitchCount"
                  step="0.1"
                  defaultValue={currentSession?.gauge_stitch_count || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="20"
                />
              </div>
              <div>
                <label htmlFor="rowCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Row Count (per 10cm)
                </label>
                <input
                  type="number"
                  id="rowCount"
                  name="rowCount"
                  step="0.1"
                  defaultValue={currentSession?.gauge_row_count || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="28"
                />
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  id="unit"
                  name="unit"
                  defaultValue={currentSession?.gauge_unit || 'cm'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cm">Centimeters</option>
                  <option value="inch">Inches</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Save Gauge
            </button>
          </form>
        </div>
      );

    case 'measurements':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('measurements.title', 'Measurements')}</h2>
          <form onSubmit={handleMeasurementsSubmit} className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 mb-4">
                For this demo, we'll simulate selecting a measurement set.
              </p>
              <p className="text-sm text-green-600 mb-4">
                In the full implementation, you would select from your saved measurement sets or create a new one.
              </p>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Select Measurement Set
              </button>
            </div>
          </form>
        </div>
      );

    case 'ease':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('ease.title', 'Ease')}</h2>
          <form onSubmit={handleEaseSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="easeType" className="block text-sm font-medium text-gray-700 mb-2">
                  Ease Type
                </label>
                <select
                  id="easeType"
                  name="easeType"
                  defaultValue={currentSession?.ease_type || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select ease type</option>
                  <option value="positive">Positive Ease</option>
                  <option value="negative">Negative Ease</option>
                  <option value="zero">Zero Ease</option>
                </select>
              </div>
              <div>
                <label htmlFor="easeValue" className="block text-sm font-medium text-gray-700 mb-2">
                  Ease Value (Bust)
                </label>
                <input
                  type="number"
                  id="easeValue"
                  name="easeValue"
                  step="0.1"
                  defaultValue={currentSession?.ease_value_bust || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="5.0"
                />
              </div>
              <div>
                <label htmlFor="easeUnit" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  id="easeUnit"
                  name="easeUnit"
                  defaultValue={currentSession?.ease_unit || 'cm'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="cm">Centimeters</option>
                  <option value="inch">Inches</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Save Ease Preferences
            </button>
          </form>
        </div>
      );

    case 'yarn':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('yarn.title', 'Yarn')}</h2>
          <form onSubmit={handleYarnSubmit} className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <p className="text-orange-800 mb-4">
                For this demo, we'll simulate selecting a yarn profile.
              </p>
              <p className="text-sm text-orange-600 mb-4">
                In the full implementation, you would select from your saved yarn profiles or create a new one.
              </p>
              <button
                type="submit"
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
              >
                Select Yarn Profile
              </button>
            </div>
          </form>
        </div>
      );

    case 'stitch-pattern':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('stitchPattern.title', 'Stitch Pattern')}</h2>
          <form onSubmit={handleStitchPatternSubmit} className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <p className="text-indigo-800 mb-4">
                For this demo, we'll simulate selecting a stitch pattern.
              </p>
              <p className="text-sm text-indigo-600 mb-4">
                In the full implementation, you would select from your saved stitch patterns or create a new one.
              </p>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Select Stitch Pattern
              </button>
            </div>
          </form>
        </div>
      );

    case 'summary':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('patternDefinition.summary.title', 'Pattern Summary')}</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Your Pattern Definition</h3>
            <div className="space-y-4">
              {currentSession?.selected_gauge_profile_id && (
                <div className="flex justify-between">
                  <span className="font-medium">Gauge:</span>
                  <span>{currentSession.gauge_stitch_count} sts, {currentSession.gauge_row_count} rows per {currentSession.gauge_unit}</span>
                </div>
              )}
              {currentSession?.selected_measurement_set_id && (
                <div className="flex justify-between">
                  <span className="font-medium">Measurements:</span>
                  <span>Measurement set selected</span>
                </div>
              )}
              {currentSession?.ease_type && (
                <div className="flex justify-between">
                  <span className="font-medium">Ease:</span>
                  <span>{currentSession.ease_type} ({currentSession.ease_value_bust}{currentSession.ease_unit})</span>
                </div>
              )}
              {currentSession?.selected_yarn_profile_id && (
                <div className="flex justify-between">
                  <span className="font-medium">Yarn:</span>
                  <span>Yarn profile selected</span>
                </div>
              )}
              {currentSession?.selected_stitch_pattern_id && (
                <div className="flex justify-between">
                  <span className="font-medium">Stitch Pattern:</span>
                  <span>Stitch pattern selected</span>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-300">
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                Proceed to Pattern Calculation
              </button>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('common.unknown', 'Unknown Step')}</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">
              {t('patternDefinition.unknownStep', 'Unknown step: ')} {currentStep}
            </p>
          </div>
        </div>
      );
  }
} 