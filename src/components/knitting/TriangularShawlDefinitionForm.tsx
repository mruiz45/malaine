/**
 * Triangular Shawl Definition Form Component (US_12.5)
 * Form for defining triangular shawl parameters including dimensions and construction method
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TriangularShawlAttributes,
  TriangularShawlConstructionMethod,
  validateTriangularShawlAttributes
} from '@/types/triangular-shawl';
import { WorkStyle } from '@/types/accessories';

interface TriangularShawlDefinitionFormProps {
  /** Current triangular shawl attributes */
  selectedAttributes?: Partial<TriangularShawlAttributes>;
  /** Callback when attributes change */
  onAttributesChange: (attributes: Partial<TriangularShawlAttributes>) => void;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Whether the form is in loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
}

/**
 * Form component for defining triangular shawl parameters
 */
export default function TriangularShawlDefinitionForm({
  selectedAttributes,
  onAttributesChange,
  disabled = false,
  isLoading = false,
  error
}: TriangularShawlDefinitionFormProps) {
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState<Partial<TriangularShawlAttributes>>({
    type: 'triangular_shawl',
    target_wingspan_cm: 150,
    target_depth_cm: 75,
    construction_method: 'top_down_center_out',
    work_style: 'flat',
    border_stitches_each_side: 0,
    ...selectedAttributes
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Update form data when selectedAttributes changes
  useEffect(() => {
    if (selectedAttributes) {
      setFormData(prev => ({
        ...prev,
        ...selectedAttributes
      }));
    }
  }, [selectedAttributes]);

  // Validate form data and update parent
  useEffect(() => {
    const errors = validateTriangularShawlAttributes(formData);
    setValidationErrors(errors);
    
    // Only call parent callback if no validation errors
    if (errors.length === 0) {
      onAttributesChange(formData);
    }
  }, [formData, onAttributesChange]);

  /**
   * Handle form field changes
   */
  const handleFormChange = (updates: Partial<TriangularShawlAttributes>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  /**
   * Handle construction method change
   */
  const handleConstructionMethodChange = (method: TriangularShawlConstructionMethod) => {
    handleFormChange({ construction_method: method });
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
            {[...Array(4)].map((_, index) => (
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
          {t('triangular_shawl.title', 'Triangular Shawl')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('triangular_shawl.description', 'Calculator for triangular shawls with different construction methods')}
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
        {/* Construction Method Selection */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-900">
            {t('triangular_shawl.construction.construction_method', 'Construction Method')}
          </h4>

          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="radio"
                name="construction-method"
                value="top_down_center_out"
                checked={formData.construction_method === 'top_down_center_out'}
                onChange={() => handleConstructionMethodChange('top_down_center_out')}
                disabled={disabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {t('triangular_shawl.construction_methods.top_down_center_out.name', 'Top-Down Center-Out')}
                </div>
                <div className="text-xs text-gray-500">
                  {t('triangular_shawl.construction_methods.top_down_center_out.description', 'Starts with a few stitches at the center top, with increases on both sides and around a central spine to form a downward-pointing triangle')}
                </div>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="radio"
                name="construction-method"
                value="side_to_side"
                checked={formData.construction_method === 'side_to_side'}
                onChange={() => handleConstructionMethodChange('side_to_side')}
                disabled={disabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {t('triangular_shawl.construction_methods.side_to_side.name', 'Side-to-Side')}
                </div>
                <div className="text-xs text-gray-500">
                  {t('triangular_shawl.construction_methods.side_to_side.description', 'Starts with a few stitches at one point, increases on one side until maximum depth, then decreases on the same side to form the other half')}
                </div>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="radio"
                name="construction-method"
                value="bottom_up"
                checked={formData.construction_method === 'bottom_up'}
                onChange={() => handleConstructionMethodChange('bottom_up')}
                disabled={disabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {t('triangular_shawl.construction_methods.bottom_up.name', 'Bottom-Up')}
                </div>
                <div className="text-xs text-gray-500">
                  {t('triangular_shawl.construction_methods.bottom_up.description', 'Starts with a large number of stitches for the longest side of the triangle and decreases regularly on both sides to form the top point')}
                </div>
              </div>
            </label>
          </div>

          {/* Work Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('triangular_shawl.construction.work_style', 'Work Style')}
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
                    {t('triangular_shawl.construction.flat', 'Flat')}
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
                    {t('triangular_shawl.construction.in_the_round', 'In the Round')}
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
            {t('triangular_shawl.dimensions', 'Dimensions')}
          </h4>

          {/* Target Wingspan */}
          <div>
            <label htmlFor="wingspan" className="block text-sm font-medium text-gray-700 mb-2">
              {t('triangular_shawl.dimensions.target_wingspan', 'Target Wingspan (cm)')}
            </label>
            <input
              type="number"
              id="wingspan"
              value={formData.target_wingspan_cm || ''}
              onChange={(e) => handleFormChange({ target_wingspan_cm: parseFloat(e.target.value) || 0 })}
              disabled={disabled}
              min="50"
              max="300"
              step="5"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="150"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('triangular_shawl.dimensions.wingspan_description', 'Total width of the shawl from end to end')}
            </p>
          </div>

          {/* Target Depth */}
          <div>
            <label htmlFor="depth" className="block text-sm font-medium text-gray-700 mb-2">
              {t('triangular_shawl.dimensions.target_depth', 'Target Depth (cm)')}
            </label>
            <input
              type="number"
              id="depth"
              value={formData.target_depth_cm || ''}
              onChange={(e) => handleFormChange({ target_depth_cm: parseFloat(e.target.value) || 0 })}
              disabled={disabled}
              min="25"
              max="150"
              step="5"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="75"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('triangular_shawl.dimensions.depth_description', 'Depth from center to triangle point')}
            </p>
          </div>

          {/* Border Stitches */}
          <div>
            <label htmlFor="border-stitches" className="block text-sm font-medium text-gray-700 mb-2">
              {t('triangular_shawl.construction.border_stitches', 'Border Stitches Each Side')}
            </label>
            <input
              type="number"
              id="border-stitches"
              value={formData.border_stitches_each_side || ''}
              onChange={(e) => handleFormChange({ border_stitches_each_side: parseInt(e.target.value) || 0 })}
              disabled={disabled}
              min="0"
              max="20"
              step="1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('triangular_shawl.border_help', 'Number of border stitches to add on each side (optional)')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 