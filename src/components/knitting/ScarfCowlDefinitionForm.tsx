/**
 * Scarf/Cowl Definition Form Component (US_7.1 - FR3)
 * Allows users to define scarf or cowl parameters including dimensions
 * and work style (flat vs in the round)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScarfCowlDefinitionFormProps,
  ScarfCowlAttributes,
  ScarfAttributes,
  CowlAttributes,
  AccessoryType,
  WorkStyle,
  validateScarfCowlAttributes
} from '@/types/accessories';

/**
 * Scarf/Cowl Definition Form Component
 */
export default function ScarfCowlDefinitionForm({
  selectedAttributes,
  onAttributesChange,
  disabled = false,
  isLoading = false,
  error
}: ScarfCowlDefinitionFormProps) {
  const { t } = useTranslation();

  // Local state for form inputs
  const [accessoryType, setAccessoryType] = useState<AccessoryType>(
    selectedAttributes?.type || 'scarf'
  );
  
  const [formData, setFormData] = useState<Partial<ScarfCowlAttributes>>({
    type: selectedAttributes?.type || 'scarf',
    work_style: selectedAttributes?.work_style || 'flat',
    ...(selectedAttributes?.type === 'scarf' ? {
      width_cm: (selectedAttributes as ScarfAttributes)?.width_cm || 20,
      length_cm: (selectedAttributes as ScarfAttributes)?.length_cm || 150
    } : {
      circumference_cm: (selectedAttributes as CowlAttributes)?.circumference_cm || 60,
      height_cm: (selectedAttributes as CowlAttributes)?.height_cm || 25
    })
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  /**
   * Update form data when selectedAttributes changes
   */
  useEffect(() => {
    if (selectedAttributes) {
      setAccessoryType(selectedAttributes.type);
      setFormData(selectedAttributes);
    }
  }, [selectedAttributes]);

  /**
   * Validate and emit changes
   */
  const handleFormChange = (updates: Partial<ScarfCowlAttributes>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);

    // Validate the form
    const errors = validateScarfCowlAttributes(newFormData);
    setValidationErrors(errors);

    // If valid, emit the changes
    if (errors.length === 0 && newFormData.type && newFormData.work_style) {
      if (newFormData.type === 'scarf' && 'width_cm' in newFormData && 'length_cm' in newFormData) {
        const scarfAttributes: ScarfAttributes = {
          type: 'scarf',
          width_cm: newFormData.width_cm!,
          length_cm: newFormData.length_cm!,
          work_style: newFormData.work_style
        };
        onAttributesChange(scarfAttributes);
      } else if (newFormData.type === 'cowl' && 'circumference_cm' in newFormData && 'height_cm' in newFormData) {
        const cowlAttributes: CowlAttributes = {
          type: 'cowl',
          circumference_cm: newFormData.circumference_cm!,
          height_cm: newFormData.height_cm!,
          work_style: newFormData.work_style
        };
        onAttributesChange(cowlAttributes);
      }
    }
  };

  /**
   * Handle accessory type change (scarf vs cowl)
   */
  const handleAccessoryTypeChange = (type: AccessoryType) => {
    setAccessoryType(type);
    
    // Reset form data with appropriate defaults for the new type
    const baseData = {
      type,
      work_style: type === 'cowl' ? 'in_the_round' as WorkStyle : 'flat' as WorkStyle
    };

    const newFormData = type === 'scarf' ? {
      ...baseData,
      width_cm: 20,
      length_cm: 150
    } : {
      ...baseData,
      circumference_cm: 60,
      height_cm: 25
    };

    handleFormChange(newFormData);
  };

  /**
   * Handle work style change
   */
  const handleWorkStyleChange = (workStyle: WorkStyle) => {
    handleFormChange({ work_style: workStyle });
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('scarfCowl.defineParameters', 'Define Scarf/Cowl Parameters')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('scarfCowl.defineParametersDescription', 'Set the type and dimensions for your scarf or cowl accessory.')}
        </p>
      </div>

      {/* Error display */}
      {(error || validationErrors.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t('common.validationErrors', 'Validation Errors')}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error && <p>{error}</p>}
                {validationErrors.map((validationError, index) => (
                  <p key={index}>{validationError}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accessory Type Selection */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-900">
            {t('scarfCowl.accessoryType', 'Accessory Type')}
          </h4>

          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="radio"
                name="accessory-type"
                value="scarf"
                checked={accessoryType === 'scarf'}
                onChange={() => handleAccessoryTypeChange('scarf')}
                disabled={disabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {t('scarfCowl.scarf', 'Scarf')}
                </div>
                <div className="text-xs text-gray-500">
                  {t('scarfCowl.scarfDescription', 'A rectangular piece worn around the neck')}
                </div>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="radio"
                name="accessory-type"
                value="cowl"
                checked={accessoryType === 'cowl'}
                onChange={() => handleAccessoryTypeChange('cowl')}
                disabled={disabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {t('scarfCowl.cowl', 'Cowl')}
                </div>
                <div className="text-xs text-gray-500">
                  {t('scarfCowl.cowlDescription', 'A circular neck warmer, typically worked in the round')}
                </div>
              </div>
            </label>
          </div>

          {/* Work Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('scarfCowl.workStyle', 'Work Style')}
            </label>
            <div className="space-y-2">
              <label className="flex items-start">
                <input
                  type="radio"
                  name="work-style"
                  value="flat"
                  checked={formData.work_style === 'flat'}
                  onChange={() => handleWorkStyleChange('flat')}
                  disabled={disabled}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {t('scarfCowl.flat', 'Flat Knitting')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('scarfCowl.flatDescription', 'Worked back and forth in rows')}
                  </div>
                </div>
              </label>

              <label className="flex items-start">
                <input
                  type="radio"
                  name="work-style"
                  value="in_the_round"
                  checked={formData.work_style === 'in_the_round'}
                  onChange={() => handleWorkStyleChange('in_the_round')}
                  disabled={disabled}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {t('scarfCowl.inTheRound', 'Circular Knitting')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('scarfCowl.inTheRoundDescription', 'Worked continuously in rounds')}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Dimensions Section */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-900">
            {t('scarfCowl.dimensions', 'Dimensions')}
          </h4>

          {accessoryType === 'scarf' ? (
            // Scarf dimensions
            <>
              <div>
                <label htmlFor="scarf-width" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('scarfCowl.width', 'Width (cm)')}
                </label>
                <input
                  type="number"
                  id="scarf-width"
                  value={(formData as Partial<ScarfAttributes>).width_cm || ''}
                  onChange={(e) => handleFormChange({ width_cm: parseFloat(e.target.value) || 0 })}
                  disabled={disabled}
                  min="10"
                  max="50"
                  step="0.5"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="20"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('scarfCowl.widthHelp', 'Typical range: 15-25 cm')}
                </p>
              </div>

              <div>
                <label htmlFor="scarf-length" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('scarfCowl.length', 'Length (cm)')}
                </label>
                <input
                  type="number"
                  id="scarf-length"
                  value={(formData as Partial<ScarfAttributes>).length_cm || ''}
                  onChange={(e) => handleFormChange({ length_cm: parseFloat(e.target.value) || 0 })}
                  disabled={disabled}
                  min="50"
                  max="300"
                  step="5"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="150"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('scarfCowl.lengthHelp', 'Typical range: 120-180 cm')}
                </p>
              </div>
            </>
          ) : (
            // Cowl dimensions
            <>
              <div>
                <label htmlFor="cowl-circumference" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('scarfCowl.circumference', 'Circumference (cm)')}
                </label>
                <input
                  type="number"
                  id="cowl-circumference"
                  value={(formData as Partial<CowlAttributes>).circumference_cm || ''}
                  onChange={(e) => handleFormChange({ circumference_cm: parseFloat(e.target.value) || 0 })}
                  disabled={disabled}
                  min="40"
                  max="100"
                  step="1"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="60"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('scarfCowl.circumferenceHelp', 'Typical range: 50-70 cm')}
                </p>
              </div>

              <div>
                <label htmlFor="cowl-height" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('scarfCowl.height', 'Height (cm)')}
                </label>
                <input
                  type="number"
                  id="cowl-height"
                  value={(formData as Partial<CowlAttributes>).height_cm || ''}
                  onChange={(e) => handleFormChange({ height_cm: parseFloat(e.target.value) || 0 })}
                  disabled={disabled}
                  min="10"
                  max="50"
                  step="0.5"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="25"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('scarfCowl.heightHelp', 'Typical range: 20-30 cm')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {formData.type && formData.work_style && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            {t('scarfCowl.summary', `${accessoryType === 'scarf' ? 'Scarf' : 'Cowl'} Summary`)}
          </h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <span className="font-medium">{t('scarfCowl.type', 'Type')}:</span> {t(`scarfCowl.${accessoryType}`, accessoryType)}
            </p>
            <p>
              <span className="font-medium">{t('scarfCowl.construction', 'Construction')}:</span> {t(`scarfCowl.${formData.work_style?.replace('_', '')}`, formData.work_style)}
            </p>
            {accessoryType === 'scarf' && (
              <>
                <p>
                  <span className="font-medium">{t('scarfCowl.width', 'Width')}:</span> {(formData as ScarfAttributes).width_cm} cm
                </p>
                <p>
                  <span className="font-medium">{t('scarfCowl.length', 'Length')}:</span> {(formData as ScarfAttributes).length_cm} cm
                </p>
              </>
            )}
            {accessoryType === 'cowl' && (
              <>
                <p>
                  <span className="font-medium">{t('scarfCowl.circumference', 'Circumference')}:</span> {(formData as CowlAttributes).circumference_cm} cm
                </p>
                <p>
                  <span className="font-medium">{t('scarfCowl.height', 'Height')}:</span> {(formData as CowlAttributes).height_cm} cm
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 