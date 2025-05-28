'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatternDefinition } from '@/contexts/PatternDefinitionContext';
import DefinitionStepper from './DefinitionStepper';
import DefinitionSummary from './DefinitionSummary';
import SessionHeader from './SessionHeader';
import GarmentTypeSelector from './GarmentTypeSelector';
import SweaterStructureSelector from './SweaterStructureSelector';
import NecklineSelector from './NecklineSelector';
import SleeveSelector from './SleeveSelector';
import ColorSchemeSimulator from '../tools/ColorSchemeSimulator';
import PatternOutlineViewer from './PatternOutlineViewer';
import { GarmentType } from '@/types/garment';
import { ConstructionMethod, BodyShape, SweaterStructureAttributes } from '@/types/sweaterStructure';
import { NecklineStyle, NecklineParameters, NecklineAttributes } from '@/types/neckline';
import { SleeveStyle, SleeveLength, CuffStyle, SleeveAttributes, CuffParameters } from '@/types/sleeve';
import { ColorScheme } from '@/types/colorScheme';
import { PatternOutline } from '@/types/patternDefinition';
import { patternDefinitionService } from '@/services/patternDefinitionService';
import { SwatchIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

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
  
  // State for color scheme simulator
  const [showColorSimulator, setShowColorSimulator] = useState(false);

  // State for pattern outline viewer (US_5.3)
  const [showOutlineViewer, setShowOutlineViewer] = useState(false);
  const [currentOutline, setCurrentOutline] = useState<PatternOutline | null>(null);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

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

  const handleGarmentTypeSelect = async (garmentType: GarmentType) => {
    await updateSession({
      selected_garment_type_id: garmentType.id
    });
  };

  /**
   * Handle sweater structure selections (US_4.3)
   */
  const handleConstructionMethodSelect = async (method: ConstructionMethod) => {
    // For now, we'll store this in the session's parameter_snapshot
    // In a full implementation, this would be stored in pattern_definition_components
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const sweaterStructure: SweaterStructureAttributes = {
      ...currentSnapshot.sweater_structure,
      construction_method: method
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        sweater_structure: sweaterStructure
      }
    });
  };

  const handleBodyShapeSelect = async (shape: BodyShape) => {
    // For now, we'll store this in the session's parameter_snapshot
    // In a full implementation, this would be stored in pattern_definition_components
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const sweaterStructure: SweaterStructureAttributes = {
      ...currentSnapshot.sweater_structure,
      body_shape: shape
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        sweater_structure: sweaterStructure
      }
    });
  };

  /**
   * Handle neckline selections (US_4.4)
   */
  const handleNecklineStyleSelect = async (style: NecklineStyle) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const neckline: NecklineAttributes = {
      ...currentSnapshot.neckline,
      style: style
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        neckline: neckline
      }
    });
  };

  const handleNecklineParametersUpdate = async (parameters: NecklineParameters) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const neckline: NecklineAttributes = {
      ...currentSnapshot.neckline,
      parameters: parameters
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        neckline: neckline
      }
    });
  };

  /**
   * Handle sleeve selections (US_4.5)
   */
  const handleSleeveStyleSelect = async (style: SleeveStyle) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const sleeves: SleeveAttributes = {
      ...currentSnapshot.sleeves,
      style: style
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        sleeves: sleeves
      }
    });
  };

  const handleSleeveLengthSelect = async (length: SleeveLength, customLength?: number) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const sleeves: SleeveAttributes = {
      ...currentSnapshot.sleeves,
      length_key: length,
      ...(length === 'custom' && customLength ? { custom_length_cm: customLength } : {})
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        sleeves: sleeves
      }
    });
  };

  const handleCuffStyleSelect = async (cuffStyle: CuffStyle, parameters?: CuffParameters) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const sleeves: SleeveAttributes = {
      ...currentSnapshot.sleeves,
      cuff_style: cuffStyle,
      ...(parameters || {})
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        sleeves: sleeves
      }
    });
  };

  /**
   * Handle color scheme save (US_5.1)
   */
  const handleColorSchemeSave = async (colorScheme: ColorScheme) => {
    try {
      if (!currentSession?.id) {
        throw new Error('No active session');
      }

      await patternDefinitionService.saveColorScheme(currentSession.id, colorScheme);
      
      // Update the session's parameter_snapshot to include the color scheme
      const currentSnapshot = currentSession.parameter_snapshot || {};
      await updateSession({
        parameter_snapshot: {
          ...currentSnapshot,
          color_scheme: colorScheme
        }
      });

      setShowColorSimulator(false);
    } catch (error) {
      console.error('Error saving color scheme:', error);
      // Handle error appropriately
    }
  };

  /**
   * Handle pattern outline generation (US_5.3)
   */
  const handleGenerateOutline = async () => {
    try {
      if (!currentSession?.id) {
        throw new Error('No active session');
      }

      setIsGeneratingOutline(true);
      const outline = await patternDefinitionService.generateOutline(currentSession.id);
      setCurrentOutline(outline);
      setShowOutlineViewer(true);
    } catch (error) {
      console.error('Error generating pattern outline:', error);
      // Handle error appropriately - could show a toast notification
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  /**
   * Handle closing the outline viewer
   */
  const handleCloseOutlineViewer = () => {
    setShowOutlineViewer(false);
    setCurrentOutline(null);
  };

  switch (currentStep) {
    case 'garment-type':
      return (
        <div>
          <GarmentTypeSelector
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            onGarmentTypeSelect={handleGarmentTypeSelect}
          />
        </div>
      );
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
          
          {/* Yarn Selection */}
          <form onSubmit={handleYarnSubmit} className="space-y-6 mb-8">
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

          {/* Color Scheme Simulator Section (US_5.1) */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('colorScheme.title', 'Color Scheme Simulator')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('colorScheme.description', 'Visualize how different yarn colors work together in your pattern')}
                </p>
              </div>
              <button
                onClick={() => setShowColorSimulator(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <SwatchIcon className="h-5 w-5" />
                <span>{t('colorScheme.openSimulator', 'Open Color Simulator')}</span>
              </button>
            </div>

            {/* Show saved color scheme if exists */}
            {currentSession?.parameter_snapshot?.color_scheme && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">
                      {currentSession.parameter_snapshot.color_scheme.name || t('colorScheme.savedScheme', 'Saved Color Scheme')}
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {t('colorScheme.template', 'Template')}: {currentSession.parameter_snapshot.color_scheme.template_type} • {' '}
                      {currentSession.parameter_snapshot.color_scheme.selected_colors.length} {t('colorScheme.colors', 'colors')}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowColorSimulator(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {t('colorScheme.edit', 'Edit')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Color Scheme Simulator Modal */}
          {showColorSimulator && (
            <ColorSchemeSimulator
              availableYarnProfiles={[
                // Mock data for demo - in real implementation, this would come from user's yarn profiles
                {
                  id: '1',
                  yarn_name: 'Merino Wool',
                  color_name: 'Ocean Blue',
                  color_hex_code: '#1E40AF'
                },
                {
                  id: '2',
                  yarn_name: 'Cotton Blend',
                  color_name: 'Cream',
                  color_hex_code: '#FEF3C7'
                },
                {
                  id: '3',
                  yarn_name: 'Alpaca Silk',
                  color_name: 'Forest Green',
                  color_hex_code: '#065F46'
                },
                {
                  id: '4',
                  yarn_name: 'Bamboo Yarn',
                  color_name: 'Coral Pink',
                  color_hex_code: '#F472B6'
                }
              ]}
              initialColorScheme={currentSession?.parameter_snapshot?.color_scheme}
              onSchemeSaved={handleColorSchemeSave}
              onClose={() => setShowColorSimulator(false)}
              isModal={true}
            />
          )}
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

    case 'garment-structure':
      // Check if this step should be displayed (only for sweaters/cardigans)
      const shouldShowSweaterStructure = currentSession?.garment_type?.type_key === 'sweater' || 
                                        currentSession?.garment_type?.type_key === 'cardigan' ||
                                        currentSession?.selected_garment_type_id; // Show if any garment type is selected for demo

      if (!shouldShowSweaterStructure) {
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('sweaterStructure.title', 'Garment Structure')}</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                {t('sweaterStructure.notApplicable', 'Garment structure options are only available for sweaters and cardigans. Please select a compatible garment type first.')}
              </p>
            </div>
          </div>
        );
      }

      const sweaterStructure = currentSession?.parameter_snapshot?.sweater_structure as SweaterStructureAttributes;

      return (
        <div>
          <SweaterStructureSelector
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            selectedConstructionMethod={sweaterStructure?.construction_method}
            selectedBodyShape={sweaterStructure?.body_shape}
            onConstructionMethodSelect={handleConstructionMethodSelect}
            onBodyShapeSelect={handleBodyShapeSelect}
            disabled={false}
            isLoading={false}
          />
        </div>
      );

    case 'neckline':
      // Check if this step should be displayed (only for garments with necklines)
      const shouldShowNecklineSelector = currentSession?.garment_type?.type_key === 'sweater' || 
                                        currentSession?.garment_type?.type_key === 'cardigan' ||
                                        currentSession?.selected_garment_type_id; // Show if any garment type is selected for demo

      if (!shouldShowNecklineSelector) {
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('neckline.title', 'Neckline Style')}</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                {t('neckline.notApplicable', 'Neckline options are only available for garments with defined necklines like sweaters and cardigans. Please select a compatible garment type first.')}
              </p>
            </div>
          </div>
        );
      }

      const necklineAttributes = currentSession?.parameter_snapshot?.neckline as NecklineAttributes;
      const sweaterStructureForNeckline = currentSession?.parameter_snapshot?.sweater_structure as SweaterStructureAttributes;

      return (
        <div>
          <NecklineSelector
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            selectedConstructionMethod={sweaterStructureForNeckline?.construction_method}
            selectedNecklineStyle={necklineAttributes?.style}
            selectedNecklineParameters={necklineAttributes?.parameters}
            onNecklineStyleSelect={handleNecklineStyleSelect}
            onNecklineParametersUpdate={handleNecklineParametersUpdate}
            disabled={false}
            isLoading={false}
          />
        </div>
      );

    case 'sleeves':
      // Check if this step should be displayed (only for garments with sleeves)
      const shouldShowSleeveSelector = currentSession?.garment_type?.type_key === 'sweater' || 
                                      currentSession?.garment_type?.type_key === 'cardigan' ||
                                      currentSession?.selected_garment_type_id; // Show if any garment type is selected for demo

      if (!shouldShowSleeveSelector) {
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('sleeve.title', 'Sleeve Style and Length')}</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                {t('sleeve.notApplicable', 'Sleeve options are only available for garments with sleeves like sweaters and cardigans. Please select a compatible garment type first.')}
              </p>
            </div>
          </div>
        );
      }

      const sleeveAttributes = currentSession?.parameter_snapshot?.sleeves as SleeveAttributes;
      const sweaterStructureForSleeves = currentSession?.parameter_snapshot?.sweater_structure as SweaterStructureAttributes;

      return (
        <div>
          <SleeveSelector
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            selectedConstructionMethod={sweaterStructureForSleeves?.construction_method}
            selectedSleeveAttributes={sleeveAttributes}
            onSleeveStyleSelect={handleSleeveStyleSelect}
            onSleeveLengthSelect={handleSleeveLengthSelect}
            onCuffStyleSelect={handleCuffStyleSelect}
            disabled={false}
            isLoading={false}
          />
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
              {currentSession?.parameter_snapshot?.sweater_structure && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Sweater Structure:</span>
                    <span></span>
                  </div>
                  {(currentSession.parameter_snapshot.sweater_structure as SweaterStructureAttributes)?.construction_method && (
                    <div className="flex justify-between pl-4">
                      <span className="text-sm text-gray-600">Construction:</span>
                      <span className="text-sm">{(currentSession.parameter_snapshot.sweater_structure as SweaterStructureAttributes).construction_method?.replace('_', ' ')}</span>
                    </div>
                  )}
                  {(currentSession.parameter_snapshot.sweater_structure as SweaterStructureAttributes)?.body_shape && (
                    <div className="flex justify-between pl-4">
                      <span className="text-sm text-gray-600">Body Shape:</span>
                      <span className="text-sm">{(currentSession.parameter_snapshot.sweater_structure as SweaterStructureAttributes).body_shape?.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              )}
              {currentSession?.parameter_snapshot?.neckline && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Neckline:</span>
                    <span></span>
                  </div>
                  {(currentSession.parameter_snapshot.neckline as NecklineAttributes)?.style && (
                    <div className="flex justify-between pl-4">
                      <span className="text-sm text-gray-600">Style:</span>
                      <span className="text-sm">{(currentSession.parameter_snapshot.neckline as NecklineAttributes).style?.replace('_', ' ')}</span>
                    </div>
                  )}
                  {(currentSession.parameter_snapshot.neckline as NecklineAttributes)?.parameters?.depth_cm && (
                    <div className="flex justify-between pl-4">
                      <span className="text-sm text-gray-600">Depth:</span>
                      <span className="text-sm">{(currentSession.parameter_snapshot.neckline as NecklineAttributes).parameters?.depth_cm}cm</span>
                    </div>
                  )}
                  {(currentSession.parameter_snapshot.neckline as NecklineAttributes)?.parameters?.width_at_center_cm && (
                    <div className="flex justify-between pl-4">
                      <span className="text-sm text-gray-600">Width:</span>
                      <span className="text-sm">{(currentSession.parameter_snapshot.neckline as NecklineAttributes).parameters?.width_at_center_cm}cm</span>
                    </div>
                  )}
                </div>
              )}
              {currentSession?.parameter_snapshot?.sleeves && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Sleeves:</span>
                    <span></span>
                  </div>
                  {(currentSession.parameter_snapshot.sleeves as SleeveAttributes)?.style && (
                    <div className="flex justify-between pl-4">
                      <span className="text-sm text-gray-600">Style:</span>
                      <span className="text-sm">{(currentSession.parameter_snapshot.sleeves as SleeveAttributes).style?.replace('_', ' ')}</span>
                    </div>
                  )}
                  {(currentSession.parameter_snapshot.sleeves as SleeveAttributes)?.length_key && (
                    <div className="flex justify-between pl-4">
                      <span className="text-sm text-gray-600">Length:</span>
                      <span className="text-sm">
                        {(currentSession.parameter_snapshot.sleeves as SleeveAttributes).length_key?.replace('_', ' ')}
                        {(currentSession.parameter_snapshot.sleeves as SleeveAttributes).length_key === 'custom' && 
                         (currentSession.parameter_snapshot.sleeves as SleeveAttributes).custom_length_cm && 
                         ` (${(currentSession.parameter_snapshot.sleeves as SleeveAttributes).custom_length_cm}cm)`
                        }
                      </span>
                    </div>
                  )}
                  {(currentSession.parameter_snapshot.sleeves as SleeveAttributes)?.cuff_style && (
                    <div className="flex justify-between pl-4">
                      <span className="text-sm text-gray-600">Cuff:</span>
                      <span className="text-sm">{(currentSession.parameter_snapshot.sleeves as SleeveAttributes).cuff_style?.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-300">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleGenerateOutline}
                  disabled={isGeneratingOutline}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                  <span>
                    {isGeneratingOutline 
                      ? t('patternDefinition.outline.generating', 'Generating outline...')
                      : t('patternDefinition.outline.generateButton', 'Generate Outline')
                    }
                  </span>
                </button>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                  Proceed to Pattern Calculation
                </button>
              </div>
            </div>
          </div>

          {/* Pattern Outline Viewer */}
          {currentOutline && (
            <PatternOutlineViewer
              outline={currentOutline}
              isOpen={showOutlineViewer}
              onClose={handleCloseOutlineViewer}
            />
          )}
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