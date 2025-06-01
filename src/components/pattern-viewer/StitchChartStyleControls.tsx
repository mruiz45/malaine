/**
 * Stitch Chart Style Controls Component (US_12.8)
 * Provides UI controls for customizing stitch chart appearance
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  SwatchIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import { useStitchChartStylePreferences } from '@/hooks/useStitchChartStylePreferences';
import { PREDEFINED_COLOR_SCHEMES, type ColorScheme } from '@/types/stitchChartStyles';

interface StitchChartStyleControlsProps {
  /** Whether the chart is monochrome (affects available options) */
  isMonochrome?: boolean;
  /** Whether the chart has pattern repeats */
  hasRepeats?: boolean;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when style changes affect layout */
  onStyleChange?: () => void;
}

/**
 * Color input component
 */
interface ColorInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

function ColorInput({ label, value, onChange, disabled = false }: ColorInputProps) {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-700 min-w-0 flex-1">
        {label}
      </label>
      <div className="flex items-center space-x-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

/**
 * Toggle switch component
 */
interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ label, checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

/**
 * Main style controls component
 */
export default function StitchChartStyleControls({
  isMonochrome = true,
  hasRepeats = false,
  compact = false,
  className = '',
  onStyleChange
}: StitchChartStyleControlsProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState<'colors' | 'grid' | 'repeats'>('colors');

  const {
    preferences,
    isLoading,
    updateColorOptions,
    updateGridOptions,
    updateRepeatOptions,
    resetToDefaults,
    loadPreset
  } = useStitchChartStylePreferences();

  // Notify parent component of style changes
  React.useEffect(() => {
    onStyleChange?.();
  }, [preferences, onStyleChange]);

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  const handleColorSchemeChange = (schemeId: ColorScheme) => {
    const scheme = PREDEFINED_COLOR_SCHEMES.find(s => s.id === schemeId);
    if (scheme) {
      updateColorOptions(scheme.colors);
    }
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">
              {t('stitchChart.styleControls.title', 'Chart Style Options')}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetToDefaults}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title={t('stitchChart.styleControls.resetToDefaults', 'Reset to defaults')}
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              {t('common.reset', 'Reset')}
            </button>
            {compact && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
              >
                {isExpanded ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Tabs */}
          <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('colors')}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'colors'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <SwatchIcon className="h-4 w-4 mr-1" />
              {t('stitchChart.styleControls.colors', 'Colors')}
            </button>
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Square3Stack3DIcon className="h-4 w-4 mr-1" />
              {t('stitchChart.styleControls.grid', 'Grid')}
            </button>
            {hasRepeats && (
              <button
                onClick={() => setActiveTab('repeats')}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'repeats'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('stitchChart.styleControls.repeats', 'Repeats')}
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                {/* Predefined Color Schemes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('stitchChart.styleControls.colorSchemes', 'Color Schemes')}
                  </label>
                  <select
                    onChange={(e) => handleColorSchemeChange(e.target.value as ColorScheme)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">
                      {t('stitchChart.styleControls.selectScheme', 'Select a scheme...')}
                    </option>
                    {PREDEFINED_COLOR_SCHEMES.map((scheme) => (
                      <option key={scheme.id} value={scheme.id}>
                        {t(`stitchChart.colorSchemes.${scheme.id}`, scheme.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Individual Color Controls */}
                <div className="space-y-3">
                  {isMonochrome && (
                    <ColorInput
                      label={t('stitchChart.styleControls.symbolColor', 'Symbol Color')}
                      value={preferences.colors.symbolColor || '#333333'}
                      onChange={(color) => updateColorOptions({ symbolColor: color })}
                    />
                  )}
                  
                  <ColorInput
                    label={t('stitchChart.styleControls.backgroundColor', 'Background Color')}
                    value={preferences.colors.backgroundColor || '#ffffff'}
                    onChange={(color) => updateColorOptions({ backgroundColor: color })}
                  />
                  
                  <ColorInput
                    label={t('stitchChart.styleControls.gridColor', 'Grid Color')}
                    value={preferences.colors.gridColor || '#333333'}
                    onChange={(color) => updateColorOptions({ gridColor: color })}
                  />
                  
                  <ColorInput
                    label={t('stitchChart.styleControls.noStitchColor', 'No Stitch Color')}
                    value={preferences.colors.noStitchColor || '#e5e5e5'}
                    onChange={(color) => updateColorOptions({ noStitchColor: color })}
                  />
                  
                  <ColorInput
                    label={t('stitchChart.styleControls.textColor', 'Text Color')}
                    value={preferences.colors.textColor || '#333333'}
                    onChange={(color) => updateColorOptions({ textColor: color })}
                  />
                </div>
              </div>
            )}

            {/* Grid Tab */}
            {activeTab === 'grid' && (
              <div className="space-y-4">
                <ToggleSwitch
                  label={t('stitchChart.styleControls.showGrid', 'Show Grid Lines')}
                  checked={preferences.grid.showGrid ?? true}
                  onChange={(checked) => updateGridOptions({ showGrid: checked })}
                />
                
                {preferences.grid.showGrid && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('stitchChart.styleControls.gridLineWidth', 'Grid Line Width')}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={preferences.grid.gridLineWidth || 1}
                        onChange={(e) => updateGridOptions({ gridLineWidth: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {preferences.grid.gridLineWidth || 1}px
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('stitchChart.styleControls.gridLineStyle', 'Grid Line Style')}
                      </label>
                      <select
                        value={preferences.grid.gridLineStyle || 'solid'}
                        onChange={(e) => updateGridOptions({ gridLineStyle: e.target.value as 'solid' | 'dashed' | 'dotted' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="solid">
                          {t('stitchChart.styleControls.lineStyleSolid', 'Solid')}
                        </option>
                        <option value="dashed">
                          {t('stitchChart.styleControls.lineStyleDashed', 'Dashed')}
                        </option>
                        <option value="dotted">
                          {t('stitchChart.styleControls.lineStyleDotted', 'Dotted')}
                        </option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Repeats Tab */}
            {activeTab === 'repeats' && hasRepeats && (
              <div className="space-y-4">
                <ToggleSwitch
                  label={t('stitchChart.styleControls.highlightRepeats', 'Highlight Pattern Repeats')}
                  checked={preferences.repeats.highlightRepeats ?? false}
                  onChange={(checked) => updateRepeatOptions({ highlightRepeats: checked })}
                />
                
                {preferences.repeats.highlightRepeats && (
                  <>
                    <ColorInput
                      label={t('stitchChart.styleControls.repeatHighlightColor', 'Highlight Color')}
                      value={preferences.repeats.repeatHighlightColor || '#3b82f6'}
                      onChange={(color) => updateRepeatOptions({ repeatHighlightColor: color })}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('stitchChart.styleControls.repeatOpacity', 'Highlight Opacity')}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={preferences.repeats.repeatHighlightOpacity || 0.2}
                        onChange={(e) => updateRepeatOptions({ repeatHighlightOpacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round((preferences.repeats.repeatHighlightOpacity || 0.2) * 100)}%
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('stitchChart.styleControls.repeatBorderStyle', 'Border Style')}
                      </label>
                      <select
                        value={preferences.repeats.repeatBorderStyle || 'dashed'}
                        onChange={(e) => updateRepeatOptions({ repeatBorderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="solid">
                          {t('stitchChart.styleControls.lineStyleSolid', 'Solid')}
                        </option>
                        <option value="dashed">
                          {t('stitchChart.styleControls.lineStyleDashed', 'Dashed')}
                        </option>
                        <option value="dotted">
                          {t('stitchChart.styleControls.lineStyleDotted', 'Dotted')}
                        </option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 