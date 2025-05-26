/**
 * EaseAdvisorTool Component
 * Main component for the Ease Selection Advisor Tool
 * Implements User Story 3.2 - Ease Selection Advisor Tool
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SparklesIcon,
  Cog6ToothIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import type { 
  EaseAdviceRequest, 
  EaseAdviceResponse,
  GarmentCategory,
  FitPreference,
  YarnWeightCategory,
  EaseApplicationData,
  EaseAdvisorFormErrors
} from '@/types/easeAdvisor';
import { 
  getEaseAdvice,
  validateEaseAdvisorData,
  getGarmentCategoryDisplayName,
  getFitPreferenceDisplayName,
  getYarnWeightDisplayName
} from '@/services/easeAdvisorService';
import { 
  EASE_ADVISOR_CONFIG
} from '@/utils/easeAdviceRules';
import EaseAdviceResult from './EaseAdviceResult';

interface EaseAdvisorToolProps {
  /** Callback when user applies a suggestion */
  onApplySuggestion?: (applicationData: EaseApplicationData) => void;
  /** Whether to show the apply suggestion button */
  showApplyButton?: boolean;
  /** Initial values for the form */
  initialValues?: Partial<EaseAdviceRequest>;
}

/**
 * Main Ease Advisor Tool component
 */
export default function EaseAdvisorTool({
  onApplySuggestion,
  showApplyButton = true,
  initialValues
}: EaseAdvisorToolProps) {
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState<{
    garment_category: string;
    fit_preference: string;
    yarn_weight_category: string;
  }>({
    garment_category: initialValues?.garment_category || '',
    fit_preference: initialValues?.fit_preference || '',
    yarn_weight_category: initialValues?.yarn_weight_category || ''
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [adviceData, setAdviceData] = useState<EaseAdviceResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<EaseAdvisorFormErrors>({});
  const [displayUnit, setDisplayUnit] = useState<'cm' | 'inch'>('cm');

  // Clear advice when form changes
  useEffect(() => {
    setAdviceData(null);
    setError(null);
  }, [formData.garment_category, formData.fit_preference, formData.yarn_weight_category]);

  /**
   * Handles form field changes
   */
  const handleFieldChange = (field: keyof EaseAdviceRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field-specific error
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  /**
   * Handles form submission to get ease advice
   */
  const handleGetAdvice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setFormErrors({});

      // Validate form data
      const validationErrors = validateEaseAdvisorData({
        garment_category: formData.garment_category as GarmentCategory,
        fit_preference: formData.fit_preference as FitPreference,
        yarn_weight_category: formData.yarn_weight_category as YarnWeightCategory
      });
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        return;
      }

      // Prepare request
      const request: EaseAdviceRequest = {
        garment_category: formData.garment_category as GarmentCategory,
        fit_preference: formData.fit_preference as FitPreference,
        yarn_weight_category: formData.yarn_weight_category as YarnWeightCategory || undefined
      };

      // Get advice
      const response = await getEaseAdvice(request);
      
      if (response.success && response.data) {
        setAdviceData(response.data);
      } else {
        setError(response.error || t('ease_advisor.error_getting_advice'));
      }

    } catch (err: any) {
      console.error('Error getting ease advice:', err);
      setError(err.message || t('ease_advisor.error_getting_advice'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles applying the suggestion
   */
  const handleApplySuggestion = (applicationData: EaseApplicationData) => {
    if (onApplySuggestion) {
      onApplySuggestion(applicationData);
    }
  };

  /**
   * Checks if the form is ready for submission
   */
  const isFormReady = (): boolean => {
    return !!(formData.garment_category && formData.fit_preference);
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <SparklesIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('ease_advisor.tool_title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('ease_advisor.tool_description')}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">
            {t('ease_advisor.configuration_title')}
          </h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Garment Category */}
          <div>
            <label htmlFor="garment_category" className="block text-sm font-medium text-gray-700 mb-2">
              {t('ease_advisor.garment_category')} *
            </label>
            <select
              id="garment_category"
              value={formData.garment_category || ''}
              onChange={(e) => handleFieldChange('garment_category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.garment_category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">{t('ease_advisor.select_garment_category')}</option>
              {EASE_ADVISOR_CONFIG.garment_categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {t(`ease_advisor.garment_categories.${category.value}`, category.label)}
                </option>
              ))}
            </select>
            {formErrors.garment_category && (
              <p className="mt-1 text-sm text-red-600">{formErrors.garment_category}</p>
            )}
          </div>

          {/* Fit Preference */}
          <div>
            <label htmlFor="fit_preference" className="block text-sm font-medium text-gray-700 mb-2">
              {t('ease_advisor.fit_preference')} *
            </label>
            <select
              id="fit_preference"
              value={formData.fit_preference || ''}
              onChange={(e) => handleFieldChange('fit_preference', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.fit_preference ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">{t('ease_advisor.select_fit_preference')}</option>
              {EASE_ADVISOR_CONFIG.fit_preferences.map((preference) => (
                <option key={preference.value} value={preference.value}>
                  {t(`ease_advisor.fit_preferences.${preference.value}`, preference.label)}
                </option>
              ))}
            </select>
            {formErrors.fit_preference && (
              <p className="mt-1 text-sm text-red-600">{formErrors.fit_preference}</p>
            )}
          </div>

          {/* Yarn Weight Category (Optional) */}
          <div>
            <label htmlFor="yarn_weight_category" className="block text-sm font-medium text-gray-700 mb-2">
              {t('ease_advisor.yarn_weight_category')} 
              <span className="text-gray-500 ml-1">({t('ease_advisor.optional')})</span>
            </label>
            <select
              id="yarn_weight_category"
              value={formData.yarn_weight_category || ''}
              onChange={(e) => handleFieldChange('yarn_weight_category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.yarn_weight_category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">{t('ease_advisor.select_yarn_weight')}</option>
              {EASE_ADVISOR_CONFIG.yarn_weight_categories.map((weight) => (
                <option key={weight.value} value={weight.value}>
                  {t(`ease_advisor.yarn_weights.${weight.value}`, weight.label)}
                </option>
              ))}
            </select>
            {formErrors.yarn_weight_category && (
              <p className="mt-1 text-sm text-red-600">{formErrors.yarn_weight_category}</p>
            )}
          </div>
        </div>

        {/* Unit Selection */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('ease_advisor.display_unit')}
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="display_unit"
                value="cm"
                checked={displayUnit === 'cm'}
                onChange={(e) => setDisplayUnit(e.target.value as 'cm' | 'inch')}
                className="mr-2"
              />
              {t('ease_advisor.centimeters')}
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="display_unit"
                value="inch"
                checked={displayUnit === 'inch'}
                onChange={(e) => setDisplayUnit(e.target.value as 'cm' | 'inch')}
                className="mr-2"
              />
              {t('ease_advisor.inches')}
            </label>
          </div>
        </div>

        {/* Get Advice Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleGetAdvice}
            disabled={!isFormReady() || isLoading}
            className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${
              isFormReady() && !isLoading
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t('ease_advisor.getting_advice')}</span>
              </div>
            ) : (
              t('ease_advisor.get_advice_button')
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 mb-1">
                {t('ease_advisor.error_title')}
              </h4>
              <p className="text-red-800 text-sm">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Advice Results */}
      {adviceData && (
        <EaseAdviceResult
          adviceData={adviceData}
          garmentCategory={formData.garment_category as GarmentCategory}
          displayUnit={displayUnit}
          onApplySuggestion={handleApplySuggestion}
          showApplyButton={showApplyButton}
        />
      )}
    </div>
  );
} 