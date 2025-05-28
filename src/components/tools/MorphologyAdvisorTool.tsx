/**
 * MorphologyAdvisorTool Component
 * Main component for the Body Morphology Adaptation Advisor Tool
 * Implements User Story 5.2 - Body Morphology Adaptation Advisor Tool
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UserIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import type { 
  MorphologyCharacteristic,
  MorphologyAdvisory,
  MorphologyAdvisorFormErrors,
  MorphologyAdvisorToolProps
} from '@/types/morphologyAdvisor';
import { 
  getMorphologyAdvice,
  validateMorphologyAdvisorData,
  groupCharacteristicsByCategory,
  getMorphologyCharacteristicDisplayName
} from '@/services/morphologyAdvisorService';
import { MORPHOLOGY_CHARACTERISTICS } from '@/types/morphologyAdvisor';
import MorphologyCharacteristicsSelector from './MorphologyCharacteristicsSelector';
import MorphologyAdviceDisplay from './MorphologyAdviceDisplay';

/**
 * Main Morphology Advisor Tool component
 */
export default function MorphologyAdvisorTool({
  initialCharacteristics = [],
  onCharacteristicsChange,
  compact = false
}: MorphologyAdvisorToolProps) {
  const { t } = useTranslation();

  // Form state
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<MorphologyCharacteristic[]>(
    initialCharacteristics
  );

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [advisories, setAdvisories] = useState<MorphologyAdvisory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<MorphologyAdvisorFormErrors>({});
  const [hasSearched, setHasSearched] = useState(false);

  // Clear advisories when characteristics change
  useEffect(() => {
    if (hasSearched) {
      setAdvisories([]);
      setError(null);
      setHasSearched(false);
    }
  }, [selectedCharacteristics, hasSearched]);

  /**
   * Handles characteristic selection changes
   */
  const handleCharacteristicsChange = (characteristics: MorphologyCharacteristic[]) => {
    setSelectedCharacteristics(characteristics);
    
    // Clear field-specific error
    if (formErrors.selected_characteristics) {
      setFormErrors(prev => ({
        ...prev,
        selected_characteristics: undefined
      }));
    }

    // Notify parent component
    if (onCharacteristicsChange) {
      onCharacteristicsChange(characteristics);
    }
  };

  /**
   * Handles form submission to get morphology advice
   */
  const handleGetAdvice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setFormErrors({});

      // Validate form data
      const validationErrors = validateMorphologyAdvisorData(selectedCharacteristics);
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        return;
      }

      // Get advice
      const response = await getMorphologyAdvice(selectedCharacteristics);
      
      if (response.success && response.data) {
        setAdvisories(response.data);
        setHasSearched(true);
      } else {
        setError(response.error || t('morphology_advisor.error_getting_advice'));
      }

    } catch (err: any) {
      console.error('Error getting morphology advice:', err);
      setError(err.message || t('morphology_advisor.error_getting_advice'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Checks if the form is ready for submission
   */
  const isFormReady = (): boolean => {
    return selectedCharacteristics.length > 0;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <UserIcon className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className={`font-semibold text-gray-900 ${compact ? 'text-lg' : 'text-xl'}`}>
            {t('morphology_advisor.tool_title')}
          </h2>
          {!compact && (
            <p className="text-sm text-gray-600 mt-1">
              {t('morphology_advisor.tool_description')}
            </p>
          )}
        </div>
      </div>

      {/* Configuration Form */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('morphology_advisor.configuration_title')}
          </h3>
          
          {/* Characteristics Selector */}
          <MorphologyCharacteristicsSelector
            selectedCharacteristics={selectedCharacteristics}
            onSelectionChange={handleCharacteristicsChange}
            disabled={isLoading}
            error={formErrors.selected_characteristics}
          />
        </div>

        {/* Get Advice Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGetAdvice}
            disabled={!isFormReady() || isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isFormReady() && !isLoading
                ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t('morphology_advisor.getting_advice')}</span>
              </div>
            ) : (
              t('morphology_advisor.get_advice_button')
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
            <h4 className="text-sm font-medium text-red-800">
              {t('morphology_advisor.error_title')}
            </h4>
          </div>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Advice Results */}
      {advisories.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-6">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">
              {t('morphology_advisor.advice_title')}
            </h3>
          </div>
          
          <div className="space-y-6">
            {advisories.map((advisory) => (
              <MorphologyAdviceDisplay
                key={advisory.id}
                advisory={advisory}
                expanded={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {hasSearched && advisories.length === 0 && !error && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <InformationCircleIcon className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              {t('morphology_advisor.no_results_message')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 