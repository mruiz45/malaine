/**
 * Neckline Selector Component (US_4.4)
 * Allows users to select neckline style and configure its parameters
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NecklineStyle,
  NecklineParameters,
  NecklineStyleOption,
  NecklineSelectorProps,
  NecklineValidationResult
} from '@/types/neckline';
import {
  CircleStackIcon,
  ChevronDownIcon,
  RectangleStackIcon,
  Square3Stack3DIcon,
  ArrowUpIcon,
  EllipsisHorizontalIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import {
  CircleStackIcon as CircleStackIconSolid,
  ChevronDownIcon as ChevronDownIconSolid,
  RectangleStackIcon as RectangleStackIconSolid,
  Square3Stack3DIcon as Square3Stack3DIconSolid,
  ArrowUpIcon as ArrowUpIconSolid,
  EllipsisHorizontalIcon as EllipsisHorizontalIconSolid,
  ArrowsPointingOutIcon as ArrowsPointingOutIconSolid
} from '@heroicons/react/24/solid';

/**
 * Available neckline styles with metadata
 */
const NECKLINE_STYLES: NecklineStyleOption[] = [
  {
    key: 'round',
    display_name: 'Round Neck',
    description: 'Classic round neckline, comfortable and versatile for everyday wear.',
    configurable_params: ['depth_cm', 'width_at_center_cm'],
    default_values: { depth_cm: 8, width_at_center_cm: 20 },
    difficulty: 'beginner',
    compatible_garment_types: ['sweater', 'cardigan', 'top'],
    compatible_construction_methods: ['drop_shoulder', 'set_in_sleeve', 'raglan']
  },
  {
    key: 'v_neck',
    display_name: 'V-Neck',
    description: 'Elegant V-shaped neckline that elongates the neck and creates a flattering silhouette.',
    configurable_params: ['depth_cm', 'width_at_shoulder_cm', 'angle_degrees'],
    default_values: { depth_cm: 12, width_at_shoulder_cm: 15, angle_degrees: 45 },
    difficulty: 'intermediate',
    compatible_garment_types: ['sweater', 'cardigan', 'top'],
    compatible_construction_methods: ['drop_shoulder', 'set_in_sleeve', 'raglan']
  },
  {
    key: 'boat_neck',
    display_name: 'Boat Neck',
    description: 'Wide, horizontal neckline that sits off the shoulders for a sophisticated look.',
    configurable_params: ['width_at_shoulder_cm'],
    default_values: { width_at_shoulder_cm: 25 },
    difficulty: 'intermediate',
    compatible_garment_types: ['sweater', 'top'],
    compatible_construction_methods: ['drop_shoulder', 'set_in_sleeve']
  },
  {
    key: 'square_neck',
    display_name: 'Square Neck',
    description: 'Modern square-shaped neckline with clean, geometric lines.',
    configurable_params: ['depth_cm', 'width_at_center_cm'],
    default_values: { depth_cm: 10, width_at_center_cm: 18 },
    difficulty: 'intermediate',
    compatible_garment_types: ['sweater', 'top'],
    compatible_construction_methods: ['drop_shoulder', 'set_in_sleeve']
  },
  {
    key: 'turtleneck',
    display_name: 'Turtleneck',
    description: 'High collar that folds over, providing warmth and a classic look.',
    configurable_params: ['depth_cm'],
    default_values: { depth_cm: 15 },
    difficulty: 'advanced',
    compatible_garment_types: ['sweater'],
    compatible_construction_methods: ['drop_shoulder', 'set_in_sleeve', 'raglan']
  },
  {
    key: 'scoop',
    display_name: 'Scoop Neck',
    description: 'Curved neckline that dips lower than a round neck for a feminine touch.',
    configurable_params: ['depth_cm', 'width_at_center_cm'],
    default_values: { depth_cm: 12, width_at_center_cm: 22 },
    difficulty: 'intermediate',
    compatible_garment_types: ['sweater', 'top'],
    compatible_construction_methods: ['drop_shoulder', 'set_in_sleeve', 'raglan']
  },
  {
    key: 'cowl',
    display_name: 'Cowl Neck',
    description: 'Draped neckline that creates soft folds for a relaxed, cozy appearance.',
    configurable_params: ['depth_cm', 'width_at_center_cm'],
    default_values: { depth_cm: 18, width_at_center_cm: 28 },
    difficulty: 'advanced',
    compatible_garment_types: ['sweater', 'top'],
    compatible_construction_methods: ['drop_shoulder', 'raglan']
  }
];

/**
 * Get icon for neckline style
 */
const getNecklineStyleIcon = (style: NecklineStyle, isSelected: boolean) => {
  const iconProps = { className: "w-6 h-6" };
  
  switch (style) {
    case 'round':
      return isSelected ? <CircleStackIconSolid {...iconProps} /> : <CircleStackIcon {...iconProps} />;
    case 'v_neck':
      return isSelected ? <ChevronDownIconSolid {...iconProps} /> : <ChevronDownIcon {...iconProps} />;
    case 'boat_neck':
      return isSelected ? <RectangleStackIconSolid {...iconProps} /> : <RectangleStackIcon {...iconProps} />;
    case 'square_neck':
      return isSelected ? <Square3Stack3DIconSolid {...iconProps} /> : <Square3Stack3DIcon {...iconProps} />;
    case 'turtleneck':
      return isSelected ? <ArrowUpIconSolid {...iconProps} /> : <ArrowUpIcon {...iconProps} />;
    case 'scoop':
      return isSelected ? <EllipsisHorizontalIconSolid {...iconProps} /> : <EllipsisHorizontalIcon {...iconProps} />;
    case 'cowl':
      return isSelected ? <ArrowsPointingOutIconSolid {...iconProps} /> : <ArrowsPointingOutIcon {...iconProps} />;
    default:
      return isSelected ? <CircleStackIconSolid {...iconProps} /> : <CircleStackIcon {...iconProps} />;
  }
};

/**
 * Get difficulty badge color
 */
const getDifficultyBadgeColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Validate neckline parameters
 */
const validateNecklineParameters = (
  style: NecklineStyle,
  parameters: NecklineParameters,
  t: any
): NecklineValidationResult => {
  const errors: Partial<Record<keyof NecklineParameters, string>> = {};
  
  // Get the style configuration
  const styleConfig = NECKLINE_STYLES.find(s => s.key === style);
  if (!styleConfig) {
    return { isValid: false, errors: {} };
  }

  // Validate each configurable parameter
  styleConfig.configurable_params.forEach(param => {
    const value = parameters[param];
    
    if (value !== undefined) {
      switch (param) {
        case 'depth_cm':
          if (value <= 0 || value > 30) {
            errors.depth_cm = t('neckline.validation.depthRange', 'Depth must be between 1 and 30 cm');
          }
          break;
        case 'width_at_shoulder_cm':
          if (value <= 0 || value > 50) {
            errors.width_at_shoulder_cm = t('neckline.validation.widthRange', 'Width must be between 1 and 50 cm');
          }
          break;
        case 'width_at_center_cm':
          if (value <= 0 || value > 40) {
            errors.width_at_center_cm = t('neckline.validation.centerWidthRange', 'Center width must be between 1 and 40 cm');
          }
          break;
        case 'angle_degrees':
          if (value <= 0 || value > 90) {
            errors.angle_degrees = t('neckline.validation.angleRange', 'Angle must be between 1 and 90 degrees');
          }
          break;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Neckline Selector Component
 */
export default function NecklineSelector({
  selectedGarmentTypeId,
  selectedConstructionMethod,
  selectedNecklineStyle,
  selectedNecklineParameters = {},
  onNecklineStyleSelect,
  onNecklineParametersUpdate,
  disabled = false,
  isLoading = false
}: NecklineSelectorProps) {
  const { t } = useTranslation();
  const [filteredNecklineStyles, setFilteredNecklineStyles] = useState<NecklineStyleOption[]>([]);
  const [parameterValues, setParameterValues] = useState<NecklineParameters>(selectedNecklineParameters);
  const [validationResult, setValidationResult] = useState<NecklineValidationResult>({ isValid: true, errors: {} });

  /**
   * Filter available neckline styles based on garment type and construction method
   */
  useEffect(() => {
    let filtered = NECKLINE_STYLES;

    // Filter by garment type if available
    if (selectedGarmentTypeId) {
      // For now, we'll use a simple mapping. In a full implementation,
      // this would be based on the actual garment type data
      const garmentTypeKey = selectedGarmentTypeId.includes('sweater') ? 'sweater' : 
                           selectedGarmentTypeId.includes('cardigan') ? 'cardigan' : 'top';
      
      filtered = filtered.filter(style => 
        style.compatible_garment_types.includes(garmentTypeKey)
      );
    }

    // Filter by construction method if available
    if (selectedConstructionMethod) {
      filtered = filtered.filter(style => 
        !style.compatible_construction_methods || 
        style.compatible_construction_methods.includes(selectedConstructionMethod)
      );
    }

    setFilteredNecklineStyles(filtered);
  }, [selectedGarmentTypeId, selectedConstructionMethod]);

  /**
   * Update parameter values when selected parameters change
   */
  useEffect(() => {
    // Always update local state with parameters from props,
    // even if it's an empty object (e.g., after deselection or for initial default values).
    // This ensures the local state accurately reflects the context's version of parameters.
    setParameterValues(selectedNecklineParameters || {});
  }, [selectedNecklineParameters]);

  /**
   * Validate parameters when they change
   */
  useEffect(() => {
    if (selectedNecklineStyle && Object.keys(parameterValues).length > 0) {
      const result = validateNecklineParameters(selectedNecklineStyle, parameterValues, t);
      setValidationResult(result);
    }
  }, [selectedNecklineStyle, parameterValues]);

  /**
   * Handle neckline style selection
   */
  const handleNecklineStyleSelect = (style: NecklineStyle) => {
    if (disabled || isLoading) return;
    
    // Get default parameters for the selected style
    const styleConfig = NECKLINE_STYLES.find(s => s.key === style);
    let defaultParameters: NecklineParameters = {};
    if (styleConfig && styleConfig.default_values) {
      defaultParameters = { ...styleConfig.default_values };
    }
    
    // Call the updated prop with both style and its default parameters
    onNecklineStyleSelect(style, defaultParameters);
    
    // Set local state for parameter inputs to reflect new defaults
    setParameterValues(defaultParameters); 
  };

  /**
   * Handle parameter value change
   */
  const handleParameterChange = (param: keyof NecklineParameters, value: number) => {
    const newParameters = { ...parameterValues, [param]: value };
    setParameterValues(newParameters);
    // This call remains, for user-driven parameter changes after style selection
    onNecklineParametersUpdate(newParameters);
  };

  /**
   * Render parameter input field
   */
  const renderParameterInput = (param: keyof NecklineParameters, label: string, unit: string = 'cm') => {
    const value = parameterValues[param] || 0;
    const error = validationResult.errors[param];
    
    return (
      <div key={param} className="space-y-2">
        <label htmlFor={param} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <input
            type="number"
            id={param}
            min="0"
            step="0.5"
            value={value}
            onChange={(e) => handleParameterChange(param, parseFloat(e.target.value) || 0)}
            disabled={disabled || isLoading}
            className={`
              w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            placeholder="0"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-500 text-sm">{unit}</span>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('neckline.title', 'Neckline Style')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('neckline.description', 'Choose the neckline style for your garment. Each style has different parameters you can customize to achieve the perfect fit and look.')}
        </p>
      </div>

      {/* Neckline Style Selection */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          {t('neckline.selectStyle', 'Select Neckline Style')}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNecklineStyles.map((style) => {
            const isSelected = selectedNecklineStyle === style.key;
            
            return (
              <div
                key={style.key}
                className={`
                  relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                  ${isSelected 
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-opacity-50' 
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                  }
                  ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => handleNecklineStyleSelect(style.key)}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {getNecklineStyleIcon(style.key, isSelected)}
                    <h5 className="text-sm font-medium text-gray-900">
                      {t(`neckline.styles.${style.key}.name`, style.display_name)}
                    </h5>
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    {t(`neckline.styles.${style.key}.description`, style.description)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(style.difficulty)}`}>
                      {t(`neckline.difficulty.${style.difficulty}`, style.difficulty)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parameter Configuration */}
      {selectedNecklineStyle && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">
            {t('neckline.parameters', 'Neckline Parameters')}
          </h4>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const styleConfig = NECKLINE_STYLES.find(s => s.key === selectedNecklineStyle);
                if (!styleConfig) return null;

                return styleConfig.configurable_params.map(param => {
                  switch (param) {
                    case 'depth_cm':
                      return renderParameterInput(param, t('neckline.params.depth', 'Depth'), 'cm');
                    case 'width_at_shoulder_cm':
                      return renderParameterInput(param, t('neckline.params.widthAtShoulder', 'Width at Shoulder'), 'cm');
                    case 'width_at_center_cm':
                      return renderParameterInput(param, t('neckline.params.widthAtCenter', 'Width at Center'), 'cm');
                    case 'angle_degrees':
                      return renderParameterInput(param, t('neckline.params.angle', 'Angle'), '°');
                    default:
                      return null;
                  }
                });
              })()}
            </div>
            
            {!validationResult.isValid && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  {t('neckline.validation.error', 'Please correct the parameter values above.')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help text */}
      {selectedNecklineStyle && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            {t('neckline.helpText', 'The neckline parameters will be used to calculate the exact shaping instructions for your pattern. Adjust these values to achieve your desired fit and style.')}
          </p>
        </div>
      )}
    </div>
  );
} 