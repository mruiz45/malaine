/**
 * Sleeve Selector Component (US_4.5)
 * Allows users to select sleeve style, length, and cuff options
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatternDefinition } from '@/contexts/PatternDefinitionContext';
import {
  SleeveStyle,
  SleeveLength,
  CuffStyle,
  SleeveStyleOption,
  SleeveLengthOption,
  CuffStyleOption,
  SleeveConfiguration,
  SleeveAttributes,
  CuffParameters,
  SleeveSelectorProps
} from '@/types/sleeve';
import { ConstructionMethod } from '@/types/sweaterStructure';
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  RectangleStackIcon,
  Square3Stack3DIcon,
  CubeIcon,
  ScissorsIcon,
  HandRaisedIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  ArrowsPointingOutIcon as ArrowsPointingOutIconSolid,
  ArrowsPointingInIcon as ArrowsPointingInIconSolid,
  RectangleStackIcon as RectangleStackIconSolid,
  Square3Stack3DIcon as Square3Stack3DIconSolid,
  CubeIcon as CubeIconSolid,
  ScissorsIcon as ScissorsIconSolid,
  HandRaisedIcon as HandRaisedIconSolid,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/solid';

/**
 * Default sleeve configuration (fallback if template data is not available)
 */
const DEFAULT_SLEEVE_CONFIG: SleeveConfiguration = {
  styles_by_construction: {
    drop_shoulder: [
      { key: 'straight', name: 'Straight', description: 'Classic straight sleeve with no tapering' },
      { key: 'tapered', name: 'Tapered', description: 'Gradually narrows from shoulder to wrist' }
    ],
    set_in_sleeve: [
      { key: 'straight', name: 'Straight', description: 'Classic straight sleeve with shaped cap' },
      { key: 'tapered', name: 'Tapered', description: 'Fitted sleeve that narrows toward the wrist' },
      { key: 'puff_cap', name: 'Puff Cap', description: 'Gathered cap creates volume at the shoulder' },
      { key: 'fitted', name: 'Fitted', description: 'Close-fitting sleeve with precise shaping' }
    ],
    raglan: [
      { key: 'straight', name: 'Straight', description: 'Straight raglan sleeve with diagonal seam' },
      { key: 'tapered', name: 'Tapered', description: 'Tapered raglan sleeve for a fitted look' },
      { key: 'bell', name: 'Bell Sleeve', description: 'Flares out at the wrist for dramatic effect' }
    ],
    dolman: [
      { key: 'straight', name: 'Straight', description: 'Wide, flowing sleeve integrated with body' },
      { key: 'bell', name: 'Bell Sleeve', description: 'Dramatic flare from elbow to wrist' }
    ]
  },
  lengths: [
    { key: 'cap', name: 'Cap Sleeve', description: 'Very short sleeve covering just the shoulder', typical_length_cm: 8 },
    { key: 'short', name: 'Short Sleeve', description: 'Ends above the elbow', typical_length_cm: 20 },
    { key: 'elbow', name: 'Elbow Length', description: 'Reaches to the elbow', typical_length_cm: 30 },
    { key: 'three_quarter', name: 'Three-Quarter Length', description: 'Ends between elbow and wrist', typical_length_cm: 40 },
    { key: 'long', name: 'Long Sleeve', description: 'Full-length sleeve to the wrist', typical_length_cm: 55 },
    { key: 'custom', name: 'Custom Length', description: 'Specify exact length measurement', requires_input: true, input_param: 'custom_length_cm' }
  ],
  cuff_styles: [
    { key: 'none', name: 'No Cuff', description: 'Plain edge finish with no additional cuff' },
    { key: 'ribbed_1x1', name: '1x1 Ribbed Cuff', description: 'Single rib pattern for stretch and fit', params: ['cuff_depth_cm'], default_values: { cuff_depth_cm: 5 } },
    { key: 'ribbed_2x2', name: '2x2 Ribbed Cuff', description: 'Double rib pattern for more texture', params: ['cuff_depth_cm'], default_values: { cuff_depth_cm: 6 } },
    { key: 'folded', name: 'Folded Cuff', description: 'Turned-up cuff for a classic look', params: ['cuff_depth_cm', 'fold_depth_cm'], default_values: { cuff_depth_cm: 8, fold_depth_cm: 3 } },
    { key: 'bell_flare', name: 'Bell Flare', description: 'Flared opening without ribbing', params: ['flare_width_cm'], default_values: { flare_width_cm: 10 } },
    { key: 'fitted_band', name: 'Fitted Band', description: 'Narrow fitted band at wrist', params: ['band_width_cm'], default_values: { band_width_cm: 3 } }
  ]
};

/**
 * Get icon for sleeve style
 */
const getSleeveStyleIcon = (style: SleeveStyle, isSelected: boolean) => {
  const iconProps = { className: "w-6 h-6" };
  
  switch (style) {
    case 'straight':
      return isSelected ? <ArrowsPointingOutIconSolid {...iconProps} /> : <ArrowsPointingOutIcon {...iconProps} />;
    case 'tapered':
      return isSelected ? <ArrowsPointingInIconSolid {...iconProps} /> : <ArrowsPointingInIcon {...iconProps} />;
    case 'puff_cap':
      return isSelected ? <RectangleStackIconSolid {...iconProps} /> : <RectangleStackIcon {...iconProps} />;
    case 'fitted':
      return isSelected ? <Square3Stack3DIconSolid {...iconProps} /> : <Square3Stack3DIcon {...iconProps} />;
    case 'bell':
      return isSelected ? <CubeIconSolid {...iconProps} /> : <CubeIcon {...iconProps} />;
    default:
      return isSelected ? <ArrowsPointingOutIconSolid {...iconProps} /> : <ArrowsPointingOutIcon {...iconProps} />;
  }
};

/**
 * Get icon for sleeve length
 */
const getSleeveLengthIcon = (length: SleeveLength, isSelected: boolean) => {
  const iconProps = { className: "w-6 h-6" };
  
  switch (length) {
    case 'cap':
      return isSelected ? <ScissorsIconSolid {...iconProps} /> : <ScissorsIcon {...iconProps} />;
    case 'short':
      return isSelected ? <HandRaisedIconSolid {...iconProps} /> : <HandRaisedIcon {...iconProps} />;
    case 'elbow':
      return isSelected ? <ArrowsPointingInIconSolid {...iconProps} /> : <ArrowsPointingInIcon {...iconProps} />;
    case 'three_quarter':
      return isSelected ? <ArrowsPointingOutIconSolid {...iconProps} /> : <ArrowsPointingOutIcon {...iconProps} />;
    case 'long':
      return isSelected ? <RectangleStackIconSolid {...iconProps} /> : <RectangleStackIcon {...iconProps} />;
    case 'custom':
      return isSelected ? <ClockIconSolid {...iconProps} /> : <ClockIcon {...iconProps} />;
    default:
      return isSelected ? <RectangleStackIconSolid {...iconProps} /> : <RectangleStackIcon {...iconProps} />;
  }
};

/**
 * Get icon for cuff style
 */
const getCuffStyleIcon = (cuff: CuffStyle, isSelected: boolean) => {
  const iconProps = { className: "w-6 h-6" };
  
  switch (cuff) {
    case 'none':
      return isSelected ? <ScissorsIconSolid {...iconProps} /> : <ScissorsIcon {...iconProps} />;
    case 'ribbed_1x1':
    case 'ribbed_2x2':
      return isSelected ? <Square3Stack3DIconSolid {...iconProps} /> : <Square3Stack3DIcon {...iconProps} />;
    case 'folded':
      return isSelected ? <RectangleStackIconSolid {...iconProps} /> : <RectangleStackIcon {...iconProps} />;
    case 'bell_flare':
      return isSelected ? <CubeIconSolid {...iconProps} /> : <CubeIcon {...iconProps} />;
    case 'fitted_band':
      return isSelected ? <ArrowsPointingInIconSolid {...iconProps} /> : <ArrowsPointingInIcon {...iconProps} />;
    default:
      return isSelected ? <ScissorsIconSolid {...iconProps} /> : <ScissorsIcon {...iconProps} />;
  }
};

/**
 * SleeveSelector Component
 */
export default function SleeveSelector({
  selectedGarmentTypeId,
  selectedConstructionMethod,
  selectedSleeveAttributes,
  onSleeveStyleSelect,
  onSleeveLengthSelect,
  onCuffStyleSelect,
  disabled = false,
  isLoading = false,
  error
}: SleeveSelectorProps) {
  const { t } = useTranslation();
  const { saveSession } = usePatternDefinition();
  
  // Debug logs - TEMPORARY
  console.log('SleeveSelector Debug:', {
    selectedConstructionMethod,
    selectedSleeveAttributes,
    availableSleeveStyles: selectedConstructionMethod ? (DEFAULT_SLEEVE_CONFIG.styles_by_construction[selectedConstructionMethod] || []) : []
  });
  
  // Local state for custom inputs
  const [customLength, setCustomLength] = useState<number>(selectedSleeveAttributes?.custom_length_cm || 55);
  const [cuffParameters, setCuffParameters] = useState<CuffParameters>({
    cuff_depth_cm: selectedSleeveAttributes?.cuff_depth_cm || 5,
    fold_depth_cm: selectedSleeveAttributes?.fold_depth_cm || 3,
    flare_width_cm: selectedSleeveAttributes?.flare_width_cm || 10,
    band_width_cm: selectedSleeveAttributes?.band_width_cm || 3
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // For now, use default configuration. In full implementation, this would be fetched from the component template
  const sleeveConfig = DEFAULT_SLEEVE_CONFIG;

  /**
   * Filter sleeve styles based on construction method
   */
  const availableSleeveStyles = useMemo(() => {
    if (!selectedConstructionMethod || !sleeveConfig.styles_by_construction[selectedConstructionMethod]) {
      return [];
    }
    return sleeveConfig.styles_by_construction[selectedConstructionMethod];
  }, [selectedConstructionMethod, sleeveConfig]);

  /**
   * Check if sleeve configuration summary should be shown
   */
  const hasSleeveConfiguration = useMemo(() => {
    return !!(selectedSleeveAttributes?.style || 
              selectedSleeveAttributes?.length_key || 
              selectedSleeveAttributes?.cuff_style);
  }, [selectedSleeveAttributes]);

  /**
   * Auto-save when sleeve configuration summary appears
   */
  useEffect(() => {
    if (hasSleeveConfiguration && !disabled && !isLoading) {
      setIsSaving(true);
      // Trigger save with a short delay to ensure all updates are complete
      const timeoutId = setTimeout(async () => {
        try {
          await saveSession();
          setLastSavedAt(new Date());
        } catch (error) {
          console.error('Error saving sleeve configuration:', error);
        } finally {
          setIsSaving(false);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [hasSleeveConfiguration, disabled, isLoading, saveSession]);

  /**
   * Handle sleeve style selection
   */
  const handleSleeveStyleSelect = (style: SleeveStyle) => {
    console.log('👕🎨 [SleeveSelector] onClick - Style:', style);
    if (disabled || isLoading) return;
    onSleeveStyleSelect(style);
  };

  /**
   * Handle sleeve length selection
   */
  const handleSleeveLengthSelect = (length: SleeveLength) => {
    console.log('👕📏 [SleeveSelector] onClick - Length:', length);
    if (disabled || isLoading) return;
    
    if (length === 'custom') {
      onSleeveLengthSelect(length, customLength);
    } else {
      onSleeveLengthSelect(length);
    }
  };

  /**
   * Handle custom length change
   */
  const handleCustomLengthChange = (value: number) => {
    console.log('👕📏🔢 [SleeveSelector] Custom Length Input Change:', value);
    setCustomLength(value);
    if (selectedSleeveAttributes?.length_key === 'custom') {
      onSleeveLengthSelect('custom', value);
    }
  };

  const handleConfirmCustomLength = () => {
    console.log('👕📏✅ [SleeveSelector] onClick - Confirm Custom Length:', customLength);
    if (disabled || isLoading) return;
    onSleeveLengthSelect('custom', customLength);
  };

  /**
   * Handle cuff style selection
   */
  const handleCuffStyleSelect = (cuffStyle: CuffStyle) => {
    console.log('👕🪢 [SleeveSelector] onClick - Cuff Style:', cuffStyle);
    if (disabled || isLoading) return;
    
    const cuffOption = sleeveConfig.cuff_styles.find(c => c.key === cuffStyle);
    if (cuffOption && cuffOption.params && cuffOption.params.length > 0) {
      // Use current parameters or defaults
      const params: CuffParameters = {};
      cuffOption.params.forEach(param => {
        if (param in cuffParameters) {
          params[param as keyof CuffParameters] = cuffParameters[param as keyof CuffParameters];
        } else if (cuffOption.default_values && param in cuffOption.default_values) {
          params[param as keyof CuffParameters] = cuffOption.default_values[param];
        }
      });
      onCuffStyleSelect(cuffStyle, params);
    } else {
      onCuffStyleSelect(cuffStyle);
    }
  };

  /**
   * Handle cuff parameter change
   */
  const handleCuffParameterChange = (param: keyof CuffParameters, value: number) => {
    console.log('👕🪢🔢 [SleeveSelector] Cuff Parameter Input Change:', param, value);
    const newParams = { ...cuffParameters, [param]: value };
    setCuffParameters(newParams);
    
    if (selectedSleeveAttributes?.cuff_style) {
      onCuffStyleSelect(selectedSleeveAttributes.cuff_style, newParams);
    }
  };

  const handleConfirmCuffParameters = () => {
    console.log('��🪢✅ [SleeveSelector] onClick - Confirm Cuff Parameters');
    if (disabled || isLoading || !selectedSleeveAttributes?.cuff_style) return;
    onCuffStyleSelect(selectedSleeveAttributes.cuff_style, cuffParameters);
  };

  /**
   * Get required cuff parameters for selected cuff style
   */
  const getRequiredCuffParams = () => {
    if (!selectedSleeveAttributes?.cuff_style) return [];
    
    const cuffOption = sleeveConfig.cuff_styles.find(c => c.key === selectedSleeveAttributes.cuff_style);
    return cuffOption?.params || [];
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            {t('sleeve.error.title', 'Error Loading Sleeve Options')}
          </h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  /**
   * Check if sleeves are applicable for current garment
   */
  if (!selectedConstructionMethod) {
    return (
      <div className="space-y-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            {t('sleeve.constructionRequired.title', 'Construction Method Required')}
          </h3>
          <p className="text-yellow-700 mb-4">
            {t('sleeve.constructionRequired.description', 'Please select a construction method first to see available sleeve options. You need to complete the "Garment Structure" step before configuring sleeves.')}
          </p>
          <p className="text-sm text-yellow-600">
            {t('sleeve.constructionRequired.help', 'Click "Previous" to go back to the Garment Structure step and select a construction method like "Drop Shoulder", "Set-in Sleeve", or "Raglan".')}
          </p>
        </div>
      </div>
    );
  }

  if (availableSleeveStyles.length === 0) {
    return (
      <div className="space-y-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            {t('sleeve.noOptions.title', 'No Sleeve Options Available')}
          </h3>
          <p className="text-yellow-700">
            {t('sleeve.noOptions.description', 'No sleeve options are available for the selected construction method.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('sleeve.title', 'Sleeve Style and Length')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('sleeve.description', 'Choose the style, length, and cuff options for your sleeves. Available options depend on your selected construction method.')}
        </p>
      </div>

      {/* Sleeve Style Selection */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {t('sleeve.style.title', 'Sleeve Style')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableSleeveStyles.map((styleOption) => {
            const isSelected = selectedSleeveAttributes?.style === styleOption.key;
            return (
              <button
                key={styleOption.key}
                onClick={() => onSleeveStyleSelect(styleOption.key)}
                disabled={disabled}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-900' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {getSleeveStyleIcon(styleOption.key, isSelected)}
                  <span className="font-medium">{styleOption.name}</span>
                </div>
                <p className="text-sm text-gray-600">{styleOption.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sleeve Length Selection */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {t('sleeve.length.title', 'Sleeve Length')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sleeveConfig.lengths.map((lengthOption) => {
            const isSelected = selectedSleeveAttributes?.length_key === lengthOption.key;
            return (
              <button
                key={lengthOption.key}
                onClick={() => handleSleeveLengthSelect(lengthOption.key)}
                disabled={disabled}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${isSelected 
                    ? 'border-green-500 bg-green-50 text-green-900' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {getSleeveLengthIcon(lengthOption.key, isSelected)}
                  <span className="font-medium">{lengthOption.name}</span>
                </div>
                <p className="text-sm text-gray-600">{lengthOption.description}</p>
                {lengthOption.typical_length_cm && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('sleeve.length.typical', 'Typical: {{length}}cm', { length: lengthOption.typical_length_cm })}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Length Input */}
        {selectedSleeveAttributes?.length_key === 'custom' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <label htmlFor="customLength" className="block text-sm font-medium text-green-800 mb-2">
              {t('sleeve.length.custom.label', 'Custom Length (cm)')}
            </label>
            <input
              type="number"
              id="customLength"
              min="5"
              max="100"
              step="0.5"
              value={customLength}
              onChange={(e) => handleCustomLengthChange(parseFloat(e.target.value) || 0)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="55"
            />
            <p className="text-xs text-green-600 mt-1">
              {t('sleeve.length.custom.help', 'Enter the desired sleeve length from shoulder to wrist in centimeters.')}
            </p>
          </div>
        )}
      </div>

      {/* Cuff Style Selection */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {t('sleeve.cuff.title', 'Cuff Style')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sleeveConfig.cuff_styles.map((cuffOption) => {
            const isSelected = selectedSleeveAttributes?.cuff_style === cuffOption.key;
            return (
              <button
                key={cuffOption.key}
                onClick={() => onCuffStyleSelect(cuffOption.key)}
                disabled={disabled}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${isSelected 
                    ? 'border-purple-500 bg-purple-50 text-purple-900' 
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {getCuffStyleIcon(cuffOption.key, isSelected)}
                  <span className="font-medium">{cuffOption.name}</span>
                </div>
                <p className="text-sm text-gray-600">{cuffOption.description}</p>
              </button>
            );
          })}
        </div>

        {/* Cuff Parameters */}
        {selectedSleeveAttributes?.cuff_style && getRequiredCuffParams().length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h5 className="text-sm font-medium text-purple-800 mb-3">
              {t('sleeve.cuff.parameters.title', 'Cuff Parameters')}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getRequiredCuffParams().map((param) => (
                <div key={param}>
                  <label htmlFor={param} className="block text-sm font-medium text-purple-700 mb-1">
                    {t(`sleeve.cuff.parameters.${param}`, param.replace('_', ' '))} (cm)
                  </label>
                  <input
                    type="number"
                    id={param}
                    min="0.5"
                    max="20"
                    step="0.5"
                    value={cuffParameters[param as keyof CuffParameters] || 0}
                    onChange={(e) => handleCuffParameterChange(param as keyof CuffParameters, parseFloat(e.target.value) || 0)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {(selectedSleeveAttributes?.style || selectedSleeveAttributes?.length_key || selectedSleeveAttributes?.cuff_style) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-gray-900">
              {t('sleeve.summary.title', 'Sleeve Configuration Summary')}
            </h4>
            {isSaving && (
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                {t('sleeve.summary.saving', 'Saving...')}
              </div>
            )}
            {!isSaving && lastSavedAt && (
              <div className="flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('sleeve.summary.saved', 'Saved')}
              </div>
            )}
          </div>
          <div className="space-y-2 text-sm">
            {selectedSleeveAttributes.style && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('sleeve.summary.style', 'Style:')}</span>
                <span className="font-medium">{availableSleeveStyles.find(s => s.key === selectedSleeveAttributes.style)?.name}</span>
              </div>
            )}
            {selectedSleeveAttributes.length_key && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('sleeve.summary.length', 'Length:')}</span>
                <span className="font-medium">
                  {sleeveConfig.lengths.find(l => l.key === selectedSleeveAttributes.length_key)?.name}
                  {selectedSleeveAttributes.length_key === 'custom' && selectedSleeveAttributes.custom_length_cm && 
                    ` (${selectedSleeveAttributes.custom_length_cm}cm)`
                  }
                </span>
              </div>
            )}
            {selectedSleeveAttributes.cuff_style && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('sleeve.summary.cuff', 'Cuff:')}</span>
                <span className="font-medium">{sleeveConfig.cuff_styles.find(c => c.key === selectedSleeveAttributes.cuff_style)?.name}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 