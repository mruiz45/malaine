'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, SwatchIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import {
  ColorSchemeSimulatorProps,
  ColorSchemeSimulatorState,
  ColorSource,
  ColorSchemeTemplateType,
  ColorScheme,
  DEFAULT_COLOR_PALETTES
} from '@/types/colorScheme';
import { TemplateRenderer, COLOR_SCHEME_TEMPLATES } from './ColorSchemeTemplates';

/**
 * Simplified yarn profile interface for the simulator
 */
interface SimulatorYarnProfile {
  id: string;
  yarn_name: string;
  color_name?: string;
  color_hex_code?: string;
}

/**
 * Color Scheme Simulator Component (US_5.1)
 * Allows users to visualize color combinations for their yarn choices
 */
export default function ColorSchemeSimulator({
  availableYarnProfiles = [],
  initialColorScheme,
  onSchemeSaved,
  onClose,
  isModal = true
}: ColorSchemeSimulatorProps) {
  const { t } = useTranslation();

  // Component state
  const [state, setState] = useState<ColorSchemeSimulatorState>({
    selectedColors: [],
    templateType: 'stripes',
    colorAssignments: [],
    isSaved: false,
    isLoading: false
  });

  const [schemeName, setSchemeName] = useState<string>('');
  const [activeColorSource, setActiveColorSource] = useState<'yarn' | 'palette'>('yarn');
  const [selectedPalette, setSelectedPalette] = useState(0);

  /**
   * Initialize with existing color scheme if provided
   */
  useEffect(() => {
    if (initialColorScheme) {
      setState(prev => ({
        ...prev,
        selectedColors: initialColorScheme.selected_colors,
        templateType: initialColorScheme.template_type,
        colorAssignments: initialColorScheme.color_assignments
      }));
      setSchemeName(initialColorScheme.name || '');
    }
  }, [initialColorScheme]);

  /**
   * Get current template definition
   */
  const currentTemplate = COLOR_SCHEME_TEMPLATES.find(t => t.type === state.templateType);

  /**
   * Handle template type change
   */
  const handleTemplateChange = useCallback((templateType: ColorSchemeTemplateType) => {
    setState(prev => ({
      ...prev,
      templateType,
      colorAssignments: [], // Reset assignments when changing template
      isSaved: false
    }));
  }, []);

  /**
   * Handle color selection from yarn profiles
   */
  const handleYarnColorSelect = useCallback((yarnProfile: SimulatorYarnProfile) => {
    if (!yarnProfile.color_hex_code) return;

    const colorSource: ColorSource = {
      type: 'yarn_profile',
      yarn_profile_id: yarnProfile.id,
      color_hex_code: yarnProfile.color_hex_code,
      color_name: yarnProfile.color_name,
      yarn_name: yarnProfile.yarn_name
    };

    setState(prev => {
      const isAlreadySelected = prev.selectedColors.some(
        c => c.type === 'yarn_profile' && c.yarn_profile_id === yarnProfile.id
      );

      if (isAlreadySelected) {
        return {
          ...prev,
          selectedColors: prev.selectedColors.filter(
            c => !(c.type === 'yarn_profile' && c.yarn_profile_id === yarnProfile.id)
          ),
          isSaved: false
        };
      }

      if (prev.selectedColors.length >= 5) {
        return prev; // Max 5 colors as per FR1
      }

      return {
        ...prev,
        selectedColors: [...prev.selectedColors, colorSource],
        isSaved: false
      };
    });
  }, []);

  /**
   * Handle color selection from palette
   */
  const handlePaletteColorSelect = useCallback((colorName: string, hexCode: string) => {
    const colorSource: ColorSource = {
      type: 'palette',
      color_hex_code: hexCode,
      color_name: colorName
    };

    setState(prev => {
      const isAlreadySelected = prev.selectedColors.some(
        c => c.type === 'palette' && c.color_hex_code === hexCode
      );

      if (isAlreadySelected) {
        return {
          ...prev,
          selectedColors: prev.selectedColors.filter(
            c => !(c.type === 'palette' && c.color_hex_code === hexCode)
          ),
          isSaved: false
        };
      }

      if (prev.selectedColors.length >= 5) {
        return prev; // Max 5 colors as per FR1
      }

      return {
        ...prev,
        selectedColors: [...prev.selectedColors, colorSource],
        isSaved: false
      };
    });
  }, []);

  /**
   * Handle color assignment to template sections
   */
  const handleSectionColorAssign = useCallback((sectionId: string) => {
    if (state.selectedColors.length === 0) return;

    // For now, cycle through selected colors
    const currentAssignment = state.colorAssignments.find(a => a.section_id === sectionId);
    const currentColorIndex = currentAssignment 
      ? state.selectedColors.findIndex(c => 
          c.color_hex_code === currentAssignment.color_source.color_hex_code
        )
      : -1;
    
    const nextColorIndex = (currentColorIndex + 1) % state.selectedColors.length;
    const nextColor = state.selectedColors[nextColorIndex];

    setState(prev => ({
      ...prev,
      colorAssignments: [
        ...prev.colorAssignments.filter(a => a.section_id !== sectionId),
        {
          section_id: sectionId,
          color_source: nextColor
        }
      ],
      isSaved: false
    }));
  }, [state.selectedColors, state.colorAssignments]);

  /**
   * Remove a selected color
   */
  const handleRemoveColor = useCallback((colorToRemove: ColorSource) => {
    setState(prev => ({
      ...prev,
      selectedColors: prev.selectedColors.filter(c => 
        !(c.type === colorToRemove.type && 
          c.color_hex_code === colorToRemove.color_hex_code &&
          c.yarn_profile_id === colorToRemove.yarn_profile_id)
      ),
      colorAssignments: prev.colorAssignments.filter(a => 
        a.color_source.color_hex_code !== colorToRemove.color_hex_code
      ),
      isSaved: false
    }));
  }, []);

  /**
   * Save the current color scheme
   */
  const handleSaveScheme = useCallback(async () => {
    if (state.selectedColors.length < 2) {
      alert(t('colorScheme.minColorsRequired', 'Please select at least 2 colors'));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const colorScheme: ColorScheme = {
        name: schemeName || `Color Scheme ${new Date().toLocaleDateString()}`,
        template_type: state.templateType,
        selected_colors: state.selectedColors,
        template_config: {
          type: state.templateType,
          config: {} as any // This would be more specific based on template type
        },
        color_assignments: state.colorAssignments,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Call the save callback
      onSchemeSaved?.(colorScheme);

      setState(prev => ({ ...prev, isSaved: true, isLoading: false }));
    } catch (error) {
      console.error('Error saving color scheme:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: t('colorScheme.saveError', 'Failed to save color scheme')
      }));
    }
  }, [state, schemeName, onSchemeSaved, t]);

  /**
   * Create color assignments object for template rendering
   */
  const colorAssignmentsForTemplate = state.colorAssignments.reduce((acc, assignment) => {
    acc[assignment.section_id] = assignment.color_source;
    return acc;
  }, {} as Record<string, ColorSource>);

  /**
   * Filter yarn profiles that have color codes
   */
  const yarnProfilesWithColors = availableYarnProfiles.filter(yarn => yarn.color_hex_code);

  const containerClasses = isModal 
    ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    : "w-full";

  const contentClasses = isModal
    ? "bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
    : "bg-white rounded-lg shadow-md";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <SwatchIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t('colorScheme.title', 'Color Scheme Simulator')}
            </h2>
          </div>
          {isModal && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Controls */}
            <div className="space-y-6">
              {/* Scheme Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('colorScheme.schemeName', 'Scheme Name')}
                </label>
                <input
                  type="text"
                  value={schemeName}
                  onChange={(e) => setSchemeName(e.target.value)}
                  placeholder={t('colorScheme.schemeNamePlaceholder', 'My Color Scheme')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('colorScheme.template', 'Preview Template')}
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {COLOR_SCHEME_TEMPLATES.map((template) => (
                    <button
                      key={template.type}
                      onClick={() => handleTemplateChange(template.type)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        state.templateType === template.type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-600">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Source Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('colorScheme.colorSource', 'Color Source')}
                </label>
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setActiveColorSource('yarn')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      activeColorSource === 'yarn'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('colorScheme.yarnProfiles', 'Yarn Profiles')}
                  </button>
                  <button
                    onClick={() => setActiveColorSource('palette')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      activeColorSource === 'palette'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('colorScheme.colorPalette', 'Color Palette')}
                  </button>
                </div>

                {/* Yarn Profiles */}
                {activeColorSource === 'yarn' && (
                  <div>
                    {yarnProfilesWithColors.length === 0 ? (
                      <div className="text-gray-500 text-center py-8">
                        {t('colorScheme.noYarnColors', 'No yarn profiles with colors available')}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                        {yarnProfilesWithColors.map((yarn) => {
                          const isSelected = state.selectedColors.some(
                            c => c.type === 'yarn_profile' && c.yarn_profile_id === yarn.id
                          );
                          
                          return (
                            <button
                              key={yarn.id}
                              onClick={() => handleYarnColorSelect(yarn)}
                              className={`p-3 border rounded-lg text-left transition-colors relative ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-6 h-6 rounded border border-gray-300"
                                  style={{ backgroundColor: yarn.color_hex_code }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    {yarn.yarn_name}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate">
                                    {yarn.color_name || yarn.color_hex_code}
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <CheckIcon className="absolute top-2 right-2 h-4 w-4 text-blue-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Color Palette */}
                {activeColorSource === 'palette' && (
                  <div>
                    {/* Palette Selection */}
                    <div className="mb-4">
                      <select
                        value={selectedPalette}
                        onChange={(e) => setSelectedPalette(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {DEFAULT_COLOR_PALETTES.map((palette, index) => (
                          <option key={index} value={index}>
                            {palette.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color Grid */}
                    <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                      {DEFAULT_COLOR_PALETTES[selectedPalette].colors.map((color) => {
                        const isSelected = state.selectedColors.some(
                          c => c.type === 'palette' && c.color_hex_code === color.hex_code
                        );

                        return (
                          <button
                            key={color.hex_code}
                            onClick={() => handlePaletteColorSelect(color.name, color.hex_code)}
                            className={`relative p-2 border rounded-lg transition-colors ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            title={color.name}
                          >
                            <div
                              className="w-full h-8 rounded border border-gray-300"
                              style={{ backgroundColor: color.hex_code }}
                            />
                            <div className="text-xs text-gray-600 mt-1 truncate">
                              {color.name}
                            </div>
                            {isSelected && (
                              <CheckIcon className="absolute top-1 right-1 h-3 w-3 text-blue-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Colors */}
              {state.selectedColors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('colorScheme.selectedColors', 'Selected Colors')} ({state.selectedColors.length}/5)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {state.selectedColors.map((color, index) => (
                      <div
                        key={`${color.type}-${color.color_hex_code}-${index}`}
                        className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2"
                      >
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: color.color_hex_code }}
                        />
                        <span className="text-sm text-gray-700">
                          {color.color_name || color.yarn_name || color.color_hex_code}
                        </span>
                        <button
                          onClick={() => handleRemoveColor(color)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('colorScheme.preview', 'Color Preview')}
                </label>
                <div className="bg-gray-50 p-6 rounded-lg">
                  {state.selectedColors.length >= 2 ? (
                    <div className="space-y-4">
                      <TemplateRenderer
                        templateType={state.templateType}
                        colorAssignments={colorAssignmentsForTemplate}
                        onSectionClick={handleSectionColorAssign}
                      />
                      <div className="text-sm text-gray-600 text-center">
                        {t('colorScheme.clickToAssign', 'Click on sections to assign colors')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <PaintBrushIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <div>
                        {t('colorScheme.selectColorsPrompt', 'Select at least 2 colors to see preview')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Template Instructions */}
              {currentTemplate && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {currentTemplate.name}
                  </h4>
                  <p className="text-sm text-blue-800 mb-3">
                    {currentTemplate.description}
                  </p>
                  <div className="text-sm text-blue-700">
                    <strong>{t('colorScheme.sections', 'Sections')}:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {currentTemplate.sections.map((section) => (
                        <li key={section.id}>{section.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {state.isSaved && (
                <span className="text-green-600 flex items-center">
                  <CheckIcon className="h-4 w-4 mr-1" />
                  {t('colorScheme.saved', 'Color scheme saved')}
                </span>
              )}
              {state.error && (
                <span className="text-red-600">{state.error}</span>
              )}
            </div>
            
            <div className="flex space-x-3">
              {isModal && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              )}
              <button
                onClick={handleSaveScheme}
                disabled={state.selectedColors.length < 2 || state.isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {state.isLoading 
                  ? t('common.saving', 'Saving...') 
                  : t('colorScheme.saveScheme', 'Save Scheme')
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 