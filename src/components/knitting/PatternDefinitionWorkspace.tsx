'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { usePatternDefinition } from '@/contexts/PatternDefinitionContext';
import { PatternCalculatorService } from '@/services/patternCalculatorService';
import DefinitionStepper from './DefinitionStepper';
import DefinitionSummary from './DefinitionSummary';
import SessionHeader from './SessionHeader';
import GarmentTypeSelector from './GarmentTypeSelector';
import SweaterStructureSelector from './SweaterStructureSelector';
import NecklineSelector from './NecklineSelector';
import SleeveSelector from './SleeveSelector';
import BeanieDefinitionForm from './BeanieDefinitionForm';
import ScarfCowlDefinitionForm from './ScarfCowlDefinitionForm';
import ColorSchemeSimulator from '../tools/ColorSchemeSimulator';
import PatternOutlineViewer from './PatternOutlineViewer';
import StitchIntegrationAdvisor from './StitchIntegrationAdvisor';
import StitchPatternSelector from './StitchPatternSelector';
import { GarmentType } from '@/types/garment';
import { ConstructionMethod, BodyShape, SweaterStructureAttributes } from '@/types/sweaterStructure';
import { NecklineStyle, NecklineParameters, NecklineAttributes } from '@/types/neckline';
import { SleeveStyle, SleeveLength, CuffStyle, SleeveAttributes, CuffParameters } from '@/types/sleeve';
import { BeanieAttributes, ScarfCowlAttributes } from '@/types/accessories';
import { ColorScheme } from '@/types/colorScheme';
import { PatternOutline } from '@/types/patternDefinition';
import { ComponentForIntegration } from '@/types/stitch-integration';
import { patternDefinitionService } from '@/services/patternDefinitionService';
import { SwatchIcon, DocumentTextIcon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { MeasurementSelector } from '@/components/measurements';
import { YarnSelector } from '@/components/yarn';
import { GaugeSelector } from '@/components/gauge';
import { EaseSelector } from '@/components/ease';
import { MeasurementSet } from '@/types/measurements';
import { YarnProfile } from '@/types/yarn';
import { GaugeProfile } from '@/types/gauge';
import { EasePreference, EaseType } from '@/types/ease';
import { StitchPattern, CraftType } from '@/types/stitchPattern';

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
            <div className="lg:col-span-3 order-2 lg:order-1">
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
            <div className="lg:col-span-1 order-1 lg:order-2">
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
  const { currentSession, updateSession, navigation, previousStep, nextStep } = usePatternDefinition();
  
  // State for color scheme simulator
  const [showColorSimulator, setShowColorSimulator] = useState(false);

  // State for pattern outline viewer (US_5.3)
  const [showOutlineViewer, setShowOutlineViewer] = useState(false);
  const [currentOutline, setCurrentOutline] = useState<PatternOutline | null>(null);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

  // State for stitch integration advisor (US_8.2)
  const [showStitchIntegrationAdvisor, setShowStitchIntegrationAdvisor] = useState(false);

  // State for pattern calculation
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Router for navigation
  const router = useRouter();

  // Mock data for available components (in real implementation, this would come from the session)
  const availableComponents: ComponentForIntegration[] = [
    {
      id: 'front-panel',
      name: 'Front Panel',
      target_stitch_count: 120
    },
    {
      id: 'back-panel', 
      name: 'Back Panel',
      target_stitch_count: 120
    },
    {
      id: 'left-sleeve',
      name: 'Left Sleeve',
      target_stitch_count: 80
    },
    {
      id: 'right-sleeve',
      name: 'Right Sleeve', 
      target_stitch_count: 80
    }
  ];

  const handleGaugeProfileSelect = async (gaugeProfile: GaugeProfile | null) => {
    if (gaugeProfile?.id) {
      await updateSession({
        selected_gauge_profile_id: gaugeProfile.id
      });
    }
  };

  const handleManualGaugeChange = async (gauge: { stitch_count: number; row_count: number; unit: string } | null) => {
    if (gauge) {
      await updateSession({
        gauge_stitch_count: gauge.stitch_count,
        gauge_row_count: gauge.row_count,
        gauge_unit: gauge.unit
      });
    }
  };

  const handleMeasurementSetSelect = async (measurementSet: MeasurementSet | null) => {
    if (measurementSet?.id) {
      await updateSession({
        selected_measurement_set_id: measurementSet.id
      });
    }
  };

  const handleEasePreferenceSelect = async (easePreference: EasePreference | null) => {
    if (easePreference) {
      await updateSession({
        ease_type: easePreference.ease_type,
        ease_value_bust: easePreference.bust_ease,
        ease_unit: easePreference.measurement_unit
      });
    }
  };

  const handleQuickEaseChange = async (ease: { type: EaseType; value_bust: number; unit?: string } | null) => {
    if (ease) {
      await updateSession({
        ease_type: ease.type,
        ease_value_bust: ease.value_bust,
        ease_unit: ease.unit
      });
    }
  };

  const handleYarnProfileSelect = async (yarnProfile: YarnProfile | null) => {
    if (yarnProfile?.id) {
      await updateSession({
        selected_yarn_profile_id: yarnProfile.id
      });
    }
  };

  const handleStitchPatternSelect = async (stitchPattern: StitchPattern | null) => {
    if (stitchPattern?.id) {
      await updateSession({
        selected_stitch_pattern_id: stitchPattern.id
      });
    }
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
    console.log('🏗️ [UI] Construction method selected:', method);
    console.log('🏗️ [UI] Current session before update:', currentSession?.id, currentSession?.parameter_snapshot);
    
    try {
      // For now, we'll store this in the session's parameter_snapshot
      // In a full implementation, this would be stored in pattern_definition_components
      const currentSnapshot = currentSession?.parameter_snapshot || {};
      console.log('🏗️ [UI] Current snapshot before merge:', currentSnapshot);
      
      const sweaterStructure: SweaterStructureAttributes = {
        ...currentSnapshot.sweater_structure,
        construction_method: method
      };
      console.log('🏗️ [UI] New sweater structure:', sweaterStructure);

      const newParameterSnapshot = {
        ...currentSnapshot,
        sweater_structure: sweaterStructure
      };
      console.log('🏗️ [UI] New parameter snapshot:', newParameterSnapshot);

      console.log('🏗️ [UI] Calling updateSession...');
      await updateSession({
        parameter_snapshot: newParameterSnapshot
      });
      console.log('🏗️ [UI] updateSession completed successfully');
    } catch (error) {
      console.error('🏗️ [UI] Error in handleConstructionMethodSelect:', error);
    }
  };

  const handleBodyShapeSelect = async (shape: BodyShape) => {
    console.log('👤 [UI] Body shape selected:', shape);
    console.log('👤 [UI] Current session before update:', currentSession?.id, currentSession?.parameter_snapshot);
    
    try {
      // For now, we'll store this in the session's parameter_snapshot
      // In a full implementation, this would be stored in pattern_definition_components
      const currentSnapshot = currentSession?.parameter_snapshot || {};
      console.log('👤 [UI] Current snapshot before merge:', currentSnapshot);
      
      const sweaterStructure: SweaterStructureAttributes = {
        ...currentSnapshot.sweater_structure,
        body_shape: shape
      };
      console.log('👤 [UI] New sweater structure:', sweaterStructure);

      const newParameterSnapshot = {
        ...currentSnapshot,
        sweater_structure: sweaterStructure
      };
      console.log('👤 [UI] New parameter snapshot:', newParameterSnapshot);

      console.log('👤 [UI] Calling updateSession...');
      await updateSession({
        parameter_snapshot: newParameterSnapshot
      });
      console.log('👤 [UI] updateSession completed successfully');
    } catch (error) {
      console.error('👤 [UI] Error in handleBodyShapeSelect:', error);
    }
  };

  /**
   * Handle neckline selections (US_4.4)
   * Now accepts defaultParameters to update style and its defaults atomically.
   */
  const handleNecklineStyleSelect = async (style: NecklineStyle, defaultParameters: NecklineParameters) => {
    console.log('👔 [UI] Neckline style selected (atomic):', style, 'with defaults:', defaultParameters);
    console.log('👔 [UI] Current session before update:', currentSession?.id, currentSession?.parameter_snapshot);
    
    try {
      const currentSnapshot = currentSession?.parameter_snapshot || {};
      console.log('👔 [UI] Current snapshot before merge:', currentSnapshot);
      
      // Create the new neckline attribute with the selected style and its default parameters
      const neckline: NecklineAttributes = {
        ...currentSnapshot.neckline, // Preserve any existing parameters not part of defaults if needed, or just overwrite
        style: style,
        parameters: defaultParameters 
      };
      console.log('👔 [UI] New neckline (atomic):', neckline);

      const newParameterSnapshot = {
        ...currentSnapshot,
        neckline: neckline
      };
      console.log('👔 [UI] New parameter snapshot (atomic):', newParameterSnapshot);

      console.log('👔 [UI] Calling updateSession (atomic for neckline style + defaults)...');
      await updateSession({
        parameter_snapshot: newParameterSnapshot
      });
      console.log('👔 [UI] updateSession completed successfully (atomic for neckline)');
    } catch (error) {
      console.error('👔 [UI] Error in handleNecklineStyleSelect (atomic):', error);
    }
  };

  const handleNecklineParametersUpdate = async (parameters: NecklineParameters) => {
    console.log('👔📐 [UI] Neckline parameters updated (user-driven):', parameters);
    console.log('👔📐 [UI] Current session before update:', currentSession?.id, currentSession?.parameter_snapshot);
    
    try {
      const currentSnapshot = currentSession?.parameter_snapshot || {};
      console.log('👔📐 [UI] Current snapshot before merge:', currentSnapshot);
      
      // Merge new parameters with existing style and other parameters if any
      const neckline: NecklineAttributes = {
        ...currentSnapshot.neckline, // This ensures we keep the currently selected style
        parameters: {
          ...(currentSnapshot.neckline?.parameters || {}),
          ...parameters
        }
      };
      console.log('👔📐 [UI] New neckline (user-driven parameters):', neckline);

      const newParameterSnapshot = {
        ...currentSnapshot,
        neckline: neckline
      };
      console.log('👔📐 [UI] New parameter snapshot (user-driven parameters):', newParameterSnapshot);

      console.log('👔📐 [UI] Calling updateSession (user-driven neckline parameters)...');
      await updateSession({
        parameter_snapshot: newParameterSnapshot
      });
      console.log('👔📐 [UI] updateSession completed successfully (user-driven neckline parameters)');
    } catch (error) {
      console.error('👔📐 [UI] Error in handleNecklineParametersUpdate (user-driven):', error);
    }
  };

  /**
   * Handle sleeve selections (US_4.5)
   */
  const handleSleeveStyleSelect = async (style: SleeveStyle) => {
    console.log('👕 [UI] Sleeve style selected:', style);
    console.log('👕 [UI] Current session before update:', currentSession?.id, currentSession?.parameter_snapshot);
    
    try {
      const currentSnapshot = currentSession?.parameter_snapshot || {};
      console.log('👕 [UI] Current snapshot before merge:', currentSnapshot);
      
      const sleeves: SleeveAttributes = {
        ...currentSnapshot.sleeves,
        style: style
      };
      console.log('👕 [UI] New sleeves:', sleeves);

      const newParameterSnapshot = {
        ...currentSnapshot,
        sleeves: sleeves
      };
      console.log('👕 [UI] New parameter snapshot:', newParameterSnapshot);

      console.log('👕 [UI] Calling updateSession...');
      await updateSession({
        parameter_snapshot: newParameterSnapshot
      });
      console.log('👕 [UI] updateSession completed successfully');
    } catch (error) {
      console.error('👕 [UI] Error in handleSleeveStyleSelect:', error);
    }
  };

  const handleSleeveLengthSelect = async (length: SleeveLength, customLength?: number) => {
    console.log('👕📏 [UI] Sleeve length selected:', length, customLength);
    console.log('👕📏 [UI] Current session before update:', currentSession?.id, currentSession?.parameter_snapshot);
    
    try {
      const currentSnapshot = currentSession?.parameter_snapshot || {};
      console.log('👕📏 [UI] Current snapshot before merge:', currentSnapshot);
      
      const sleeves: SleeveAttributes = {
        ...currentSnapshot.sleeves,
        length_key: length,
        ...(length === 'custom' && customLength ? { custom_length_cm: customLength } : {})
      };
      console.log('👕📏 [UI] New sleeves:', sleeves);

      const newParameterSnapshot = {
        ...currentSnapshot,
        sleeves: sleeves
      };
      console.log('👕📏 [UI] New parameter snapshot:', newParameterSnapshot);

      console.log('👕📏 [UI] Calling updateSession...');
      await updateSession({
        parameter_snapshot: newParameterSnapshot
      });
      console.log('👕📏 [UI] updateSession completed successfully');
    } catch (error) {
      console.error('👕📏 [UI] Error in handleSleeveLengthSelect:', error);
    }
  };

  const handleCuffStyleSelect = async (cuffStyle: CuffStyle, parameters?: CuffParameters) => {
    console.log('👕🔗 [UI] Cuff style selected:', cuffStyle, parameters);
    console.log('👕🔗 [UI] Current session before update:', currentSession?.id, currentSession?.parameter_snapshot);
    
    try {
      const currentSnapshot = currentSession?.parameter_snapshot || {};
      console.log('👕🔗 [UI] Current snapshot before merge:', currentSnapshot);
      
      const sleeves: SleeveAttributes = {
        ...currentSnapshot.sleeves,
        cuff_style: cuffStyle,
        ...(parameters || {})
      };
      console.log('👕🔗 [UI] New sleeves:', sleeves);

      const newParameterSnapshot = {
        ...currentSnapshot,
        sleeves: sleeves
      };
      console.log('👕🔗 [UI] New parameter snapshot:', newParameterSnapshot);

      console.log('👕🔗 [UI] Calling updateSession...');
      await updateSession({
        parameter_snapshot: newParameterSnapshot
      });
      console.log('👕🔗 [UI] updateSession completed successfully');
    } catch (error) {
      console.error('👕🔗 [UI] Error in handleCuffStyleSelect:', error);
    }
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
   * Handle beanie attributes update (US_7.1 - FR2)
   */
  const handleBeanieAttributesChange = async (attributes: BeanieAttributes) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        beanie: attributes
      }
    });
  };

  /**
   * Handle scarf/cowl attributes update (US_7.1 - FR3)
   */
  const handleScarfCowlAttributesChange = async (attributes: ScarfCowlAttributes) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        scarf_cowl: attributes
      }
    });
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

  /**
   * Handle opening the stitch integration advisor (US_8.2)
   */
  const handleOpenStitchIntegrationAdvisor = () => {
    setShowStitchIntegrationAdvisor(true);
  };

  /**
   * Handle closing the stitch integration advisor
   */
  const handleCloseStitchIntegrationAdvisor = () => {
    setShowStitchIntegrationAdvisor(false);
  };

  /**
   * Handle successful stitch integration
   */
  const handleStitchIntegrationSuccess = (componentId: string, integration: any) => {
    console.log('Stitch integration applied successfully:', { componentId, integration });
    // In a real implementation, this would update the session state
    // For now, we'll just log the success
  };

  /**
   * Apply sensible default parameters for unconfigured steps before pattern calculation
   */
  const applyDefaultParameters = (sessionData: any) => {
    console.log('🔧 Applying default parameters for unconfigured steps...');
    
    const garmentTypeKey = sessionData.garment_type?.type_key;
    const isSweaterType = garmentTypeKey === 'sweater' || garmentTypeKey === 'cardigan';
    
    if (!isSweaterType) {
      console.log('ℹ️ Not a sweater type, no defaults needed');
      return sessionData;
    }

    const currentSnapshot = sessionData.parameter_snapshot || {};
    let needsUpdate = false;
    const newSnapshot = { ...currentSnapshot };

    // Apply default sweater structure if missing
    if (!currentSnapshot.sweater_structure?.construction_method) {
      console.log('🔧 Applying default sweater structure: drop_shoulder + straight');
      newSnapshot.sweater_structure = {
        construction_method: 'drop_shoulder', // Beginner-friendly default
        body_shape: 'straight' // Classic, versatile default
      };
      needsUpdate = true;
    }

    // Apply default neckline if missing
    if (!currentSnapshot.neckline?.style) {
      console.log('🔧 Applying default neckline: crew_neck');
      newSnapshot.neckline = {
        style: 'crew_neck', // Most common neckline
        parameters: {
          depth_cm: 8, // Standard crew neck depth
          width_cm: 20 // Standard crew neck width
        }
      };
      needsUpdate = true;
    }

    // Apply default sleeves if missing
    if (!currentSnapshot.sleeves || (!currentSnapshot.sleeves.style && !currentSnapshot.sleeves.length_key)) {
      console.log('🔧 Applying default sleeves: straight + long + ribbed_cuff');
      newSnapshot.sleeves = {
        style: 'straight', // Simple, classic sleeve
        length_key: 'long', // Full-length sleeves
        cuff_style: 'ribbed', // Standard ribbed cuff
        cuff_length_cm: 5 // Standard cuff length
      };
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log('✅ Default parameters applied successfully');
      return {
        ...sessionData,
        parameter_snapshot: newSnapshot
      };
    } else {
      console.log('ℹ️ No default parameters needed');
      return sessionData;
    }
  };

  /**
   * Handles the "Proceed to Pattern Calculation" button click
   * Validates session completeness, calculates pattern, and navigates to PatternViewer with 2D/3D visualizations
   */
  const handleProceedToCalculation = async () => {
    if (!currentSession) {
      setCalculationError('No active session found');
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);

    try {
      // Initialize the pattern calculator service
      const calculatorService = new PatternCalculatorService();

      // First, fetch complete session data with all relationships
      let completeSessionData = await patternDefinitionService.getSession(currentSession.id);
      
      if (!completeSessionData) {
        throw new Error('Failed to fetch complete session data');
      }

      // Apply default parameters for unconfigured steps
      completeSessionData = applyDefaultParameters(completeSessionData);

      // Validate session completeness (should pass now with defaults)
      const summary = generateSessionSummary(completeSessionData);
      if (!summary.readyForCalculation) {
        const missingSteps = navigation.availableSteps.filter(
          step => !summary.completedSteps.includes(step as any)
        );
        
        console.error('❌ Pattern definition incomplete:', {
          completionPercentage: summary.completionPercentage,
          completedSteps: summary.completedSteps,
          missingSteps,
          totalSteps: navigation.availableSteps.length
        });
        
        const stepsText = missingSteps.map(step => {
          const stepTranslations: { [key: string]: string } = {
            'garment-type': 'Type de vêtement',
            'gauge': 'Échantillon',
            'measurements': 'Mesures',
            'ease': 'Aisance',
            'yarn': 'Laine',
            'stitch-pattern': 'Point de tricot',
            'garment-structure': 'Structure du vêtement',
            'neckline': 'Encolure',
            'sleeves': 'Manches',
            'accessory-definition': 'Définition accessoire'
          };
          return stepTranslations[step] || step;
        }).join(', ');
        
        throw new Error(
          `Définition de patron incomplète (${summary.completionPercentage}%). Étapes manquantes: ${stepsText}. Veuillez compléter toutes les étapes requises.`
        );
      }

      // Perform pattern calculation
      console.log('Starting pattern calculation...');
      const calculationResult = await calculatorService.calculatePatternFromSession(
        completeSessionData,
        {
          includeShaping: true,
          includeYarnEstimate: true,
          instructionFormat: 'text',
          validateInput: true
        }
      );

      console.log('Pattern calculation completed:', calculationResult);

      // Navigate to pattern viewer with calculated results
      // The PatternViewer will automatically include 2D Assembly View and 3D Preview sections
      router.push(`/pattern-viewer/${currentSession.id}`);

    } catch (error) {
      console.error('Pattern calculation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Pattern calculation failed';
      setCalculationError(errorMessage);
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Helper function to generate session summary for validation
   */
  const generateSessionSummary = (sessionData: any) => {
    console.log('🔍 Analyzing session data for calculation readiness...');
    console.log('📊 Session data:', {
      id: sessionData.id,
      session_name: sessionData.session_name,
      selected_garment_type_id: sessionData.selected_garment_type_id,
      selected_gauge_profile_id: sessionData.selected_gauge_profile_id,
      gauge_stitch_count: sessionData.gauge_stitch_count,
      gauge_row_count: sessionData.gauge_row_count,
      gauge_unit: sessionData.gauge_unit,
      selected_measurement_set_id: sessionData.selected_measurement_set_id,
      ease_type: sessionData.ease_type,
      selected_yarn_profile_id: sessionData.selected_yarn_profile_id,
      selected_stitch_pattern_id: sessionData.selected_stitch_pattern_id,
      parameter_snapshot: sessionData.parameter_snapshot,
      garment_type: sessionData.garment_type
    });

    const completedSteps = calculateCompletedSteps(sessionData);
    
    // Use navigation.availableSteps for the actual total
    const totalSteps = navigation.availableSteps.length;
    const completionPercentage = Math.round((completedSteps.length / totalSteps) * 100);
    const readyForCalculation = completionPercentage >= 80; // Allow 80%+ to be ready (was 90%)

    console.log('📊 Available steps from navigation:', navigation.availableSteps);
    console.log('✅ Completed steps:', completedSteps);
    console.log('📈 Completion percentage:', completionPercentage, '%');
    console.log('🎯 Ready for calculation:', readyForCalculation);

    return {
      completionPercentage,
      readyForCalculation,
      completedSteps
    };
  };

  /**
   * Helper function to calculate completed steps (mirrors PatternDefinitionContext logic)
   */
  const calculateCompletedSteps = (session: any): string[] => {
    const completed: string[] = [];

    // Check each step individually with detailed logging
    console.log('🔎 Checking individual steps...');

    if (session.selected_garment_type_id) {
      console.log('✅ garment-type: COMPLETED');
      completed.push('garment-type');
    } else {
      console.log('❌ garment-type: MISSING');
    }

    if (session.selected_gauge_profile_id || (session.gauge_stitch_count && session.gauge_row_count && session.gauge_unit)) {
      console.log('✅ gauge: COMPLETED');
      completed.push('gauge');
    } else {
      console.log('❌ gauge: MISSING (need profile ID or manual gauge data)');
    }

    if (session.selected_measurement_set_id) {
      console.log('✅ measurements: COMPLETED');
      completed.push('measurements');
    } else {
      console.log('❌ measurements: MISSING');
    }

    if (session.ease_type) {
      console.log('✅ ease: COMPLETED');
      completed.push('ease');
    } else {
      console.log('❌ ease: MISSING');
    }

    if (session.selected_yarn_profile_id) {
      console.log('✅ yarn: COMPLETED');
      completed.push('yarn');
    } else {
      console.log('❌ yarn: MISSING');
    }

    if (session.selected_stitch_pattern_id) {
      console.log('✅ stitch-pattern: COMPLETED');
      completed.push('stitch-pattern');
    } else {
      console.log('❌ stitch-pattern: MISSING');
    }

    // Get garment type to determine which steps are required vs optional
    const garmentTypeKey = session.garment_type?.type_key;
    console.log('🎨 Garment type key:', garmentTypeKey);

    // For sweater/cardigan types, these steps have sensible defaults
    const isSweaterType = garmentTypeKey === 'sweater' || garmentTypeKey === 'cardigan';
    
    // For garment structure: allow default construction method for sweaters
    if (session.parameter_snapshot?.sweater_structure?.construction_method) {
      console.log('✅ garment-structure: COMPLETED (explicit selection)');
      completed.push('garment-structure');
    } else if (isSweaterType) {
      console.log('✅ garment-structure: COMPLETED (default for sweater type)');
      completed.push('garment-structure');
    } else {
      console.log('❌ garment-structure: MISSING (construction method)');
      console.log('🔍 parameter_snapshot.sweater_structure:', session.parameter_snapshot?.sweater_structure);
    }

    // For neckline: allow default neckline for sweaters  
    if (session.parameter_snapshot?.neckline?.style) {
      console.log('✅ neckline: COMPLETED (explicit selection)');
      completed.push('neckline');
    } else if (isSweaterType) {
      console.log('✅ neckline: COMPLETED (default for sweater type)');
      completed.push('neckline');
    } else {
      console.log('❌ neckline: MISSING');
      console.log('🔍 parameter_snapshot.neckline:', session.parameter_snapshot?.neckline);
    }

    // For sleeves: allow default sleeves for sweaters
    if (session.parameter_snapshot?.sleeves && (
        session.parameter_snapshot.sleeves.style || 
        session.parameter_snapshot.sleeves.length_key || 
        session.parameter_snapshot.sleeves.cuff_style
      )) {
      console.log('✅ sleeves: COMPLETED (explicit selection)');
      completed.push('sleeves');
    } else if (isSweaterType) {
      console.log('✅ sleeves: COMPLETED (default for sweater type)');
      completed.push('sleeves');
    } else {
      console.log('❌ sleeves: MISSING');
      console.log('🔍 parameter_snapshot.sleeves:', session.parameter_snapshot?.sleeves);
      console.log('🔍 Full parameter_snapshot:', session.parameter_snapshot);
    }

    // Check for accessory definition requirement
    const requiresAccessoryDefinition = garmentTypeKey === 'beanie' || garmentTypeKey === 'scarf' || garmentTypeKey === 'cowl';
    
    console.log('🏷️ Requires accessory definition:', requiresAccessoryDefinition);

    if (!requiresAccessoryDefinition || 
        (requiresAccessoryDefinition && (session.parameter_snapshot?.beanie || session.parameter_snapshot?.scarf_cowl))) {
      console.log('✅ accessory-definition: COMPLETED (or not required)');
      completed.push('accessory-definition');
    } else {
      console.log('❌ accessory-definition: MISSING (required for this garment type)');
    }

    console.log('📝 Final completed steps:', completed);
    return completed;
  };

  /**
   * Check if current step can proceed to next
   */
  const canProceedToNext = () => {
    const currentIndex = navigation.availableSteps.indexOf(currentStep as any);
    const isLastStep = currentIndex === navigation.availableSteps.length - 1;
    
    // Allow navigation to next step if current step is completed
    const isCurrentStepCompleted = navigation.completedSteps.includes(currentStep as any);
    
    return !isLastStep && isCurrentStepCompleted;
  };

  /**
   * Check if can go to previous step
   */
  const canGoToPrevious = () => {
    const currentIndex = navigation.availableSteps.indexOf(currentStep as any);
    return currentIndex > 0;
  };

  /**
   * Navigation buttons component
   */
  const NavigationButtons = () => (
    <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
      <button
        onClick={previousStep}
        disabled={!canGoToPrevious()}
        className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
          canGoToPrevious()
            ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
        }`}
      >
        <ChevronLeftIcon className="h-4 w-4 mr-2" />
        {t('navigation.previous', 'Précédent')}
      </button>

      <div className="text-sm text-gray-500">
        Étape {navigation.availableSteps.indexOf(currentStep as any) + 1} sur {navigation.availableSteps.length}
      </div>

      <button
        onClick={nextStep}
        disabled={!canProceedToNext()}
        className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
          canProceedToNext()
            ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
        }`}
      >
        {t('navigation.next', 'Suivant')}
        <ChevronRightIcon className="h-4 w-4 ml-2" />
      </button>
    </div>
  );

  switch (currentStep) {
    case 'garment-type':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('garmentType.title', 'Select Garment Type')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('garmentType.description', 'Choose the type of garment you want to create. This will determine the available configuration options.')}
          </p>
          <GarmentTypeSelector 
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            onGarmentTypeSelect={handleGarmentTypeSelect}
          />
          <NavigationButtons />
        </div>
      );

    case 'gauge':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('gauge.title', 'Gauge Information')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('gauge.description', 'Enter your gauge information. This is crucial for accurate pattern calculations.')}
          </p>
          <GaugeSelector
            selectedGaugeProfile={currentSession?.selected_gauge_profile_id ? {
              id: currentSession.selected_gauge_profile_id,
              profile_name: 'Selected Gauge Profile', // This would be fetched in a real implementation
              stitch_count: currentSession.gauge_stitch_count || 20,
              row_count: currentSession.gauge_row_count || 28,
              measurement_unit: 'cm',
              swatch_width: 10,
              swatch_height: 10,
              user_id: '',
              created_at: '',
              updated_at: ''
            } : null}
            onGaugeProfileSelect={handleGaugeProfileSelect}
            manualGauge={currentSession?.gauge_stitch_count ? {
              stitch_count: currentSession.gauge_stitch_count,
              row_count: currentSession.gauge_row_count || 28,
              unit: currentSession.gauge_unit || '10cm'
            } : null}
            onManualGaugeChange={handleManualGaugeChange}
            onCreateNew={() => {
              // TODO: Navigate to gauge profile creation
              console.log('Create new gauge profile');
            }}
          />
          <NavigationButtons />
        </div>
      );

    case 'measurements':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('measurements.title', 'Measurements')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('measurements.description', 'Select or enter your measurements. These will be used to calculate the pattern dimensions.')}
          </p>
          <MeasurementSelector
            selectedMeasurementSet={currentSession?.selected_measurement_set_id ? {
              id: currentSession.selected_measurement_set_id,
              set_name: 'Selected Measurement Set', // This would be fetched in a real implementation
              measurement_unit: 'cm',
              created_at: '',
              updated_at: '',
              user_id: ''
            } : null}
            onMeasurementSetSelect={handleMeasurementSetSelect}
            onCreateNew={() => {
              // TODO: Navigate to measurement set creation
              console.log('Create new measurement set');
            }}
          />
          <NavigationButtons />
        </div>
      );

    case 'ease':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('ease.title', 'Ease Preferences')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('ease.description', 'Choose your ease preferences. This determines how fitted or loose your garment will be.')}
          </p>
          <EaseSelector
            selectedEasePreference={currentSession?.ease_type ? {
              id: 'current-ease',
              preference_name: 'Current Ease',
              ease_type: currentSession.ease_type as EaseType,
              bust_ease: currentSession.ease_value_bust || 5,
              measurement_unit: (currentSession.ease_unit || 'cm') as any,
              user_id: '',
              created_at: '',
              updated_at: ''
            } : null}
            onEasePreferenceSelect={handleEasePreferenceSelect}
            quickEase={currentSession?.ease_type ? {
              type: currentSession.ease_type as EaseType,
              value_bust: currentSession.ease_value_bust || 5,
              unit: currentSession.ease_unit
            } : null}
            onQuickEaseChange={handleQuickEaseChange}
            onCreateNew={() => {
              // TODO: Navigate to ease preference creation
              console.log('Create new ease preference');
            }}
          />
          <NavigationButtons />
        </div>
      );

    case 'yarn':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('yarn.title', 'Yarn Selection')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('yarn.description', 'Select your yarn. This information helps with pattern calculations and recommendations.')}
          </p>
          <YarnSelector
            selectedYarnProfile={currentSession?.selected_yarn_profile_id ? {
              id: currentSession.selected_yarn_profile_id,
              yarn_name: 'Selected Yarn', // This would be fetched in a real implementation
              brand_name: 'Selected Brand',
              yarn_weight_category: 'DK' as any,
              fiber_content: [{ fiber: 'Wool', percentage: 100 }],
              user_id: '',
              created_at: '',
              updated_at: ''
            } : null}
            onYarnProfileSelect={handleYarnProfileSelect}
            onCreateNew={() => {
              // TODO: Navigate to yarn profile creation
              console.log('Create new yarn profile');
            }}
          />
          <NavigationButtons />
        </div>
      );

    case 'stitch-pattern':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('stitchPattern.title', 'Stitch Pattern')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('stitchPattern.description', 'Choose your main stitch pattern. This will be used throughout the garment.')}
          </p>
          <StitchPatternSelector
            selectedPattern={currentSession?.selected_stitch_pattern_id ? {
              id: currentSession.selected_stitch_pattern_id,
              stitch_name: 'Selected Pattern', // This would be fetched in a real implementation
              craft_type: 'knitting' as CraftType,
              is_basic: true,
              created_at: '',
              updated_at: ''
            } : null}
            onPatternSelect={handleStitchPatternSelect}
            basicOnly={true}
          />
          <NavigationButtons />
        </div>
      );

    case 'garment-structure':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('garmentStructure.title', 'Garment Structure')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('garmentStructure.description', 'Define the construction method and body shape for your garment.')}
          </p>
          <SweaterStructureSelector
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            selectedConstructionMethod={currentSession?.parameter_snapshot?.sweater_structure?.construction_method}
            selectedBodyShape={currentSession?.parameter_snapshot?.sweater_structure?.body_shape}
            onConstructionMethodSelect={handleConstructionMethodSelect}
            onBodyShapeSelect={handleBodyShapeSelect}
          />
          <NavigationButtons />
        </div>
      );

    case 'neckline':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('neckline.title', 'Neckline Style')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('neckline.description', 'Choose the neckline style and specify any custom parameters.')}
          </p>
          <NecklineSelector
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            selectedConstructionMethod={currentSession?.parameter_snapshot?.sweater_structure?.construction_method}
            selectedNecklineStyle={currentSession?.parameter_snapshot?.neckline?.style}
            selectedNecklineParameters={currentSession?.parameter_snapshot?.neckline?.parameters}
            onNecklineStyleSelect={handleNecklineStyleSelect}
            onNecklineParametersUpdate={handleNecklineParametersUpdate}
          />
          <NavigationButtons />
        </div>
      );

    case 'sleeves':
      return (
        <div>
          <SleeveSelector
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            selectedConstructionMethod={currentSession?.parameter_snapshot?.sweater_structure?.construction_method}
            selectedSleeveAttributes={currentSession?.parameter_snapshot?.sleeves}
            onSleeveStyleSelect={handleSleeveStyleSelect}
            onSleeveLengthSelect={handleSleeveLengthSelect}
            onCuffStyleSelect={handleCuffStyleSelect}
          />
          <NavigationButtons />
        </div>
      );

    case 'accessory-definition':
      // For accessories like beanies and scarves/cowls
      const selectedGarmentType = currentSession?.garment_type?.type_key;
      
      if (selectedGarmentType === 'beanie') {
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('beanie.title', 'Beanie Definition')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('beanie.description', 'Define the specific parameters for your beanie.')}
            </p>
            <BeanieDefinitionForm
              selectedAttributes={currentSession?.parameter_snapshot?.beanie}
              onAttributesChange={handleBeanieAttributesChange}
            />
            <NavigationButtons />
          </div>
        );
      } else if (selectedGarmentType === 'scarf' || selectedGarmentType === 'cowl') {
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('scarfCowl.title', 'Scarf/Cowl Definition')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('scarfCowl.description', 'Define the specific parameters for your scarf or cowl.')}
            </p>
            <ScarfCowlDefinitionForm
              selectedAttributes={currentSession?.parameter_snapshot?.scarf_cowl}
              onAttributesChange={handleScarfCowlAttributesChange}
            />
            <NavigationButtons />
          </div>
        );
      } else {
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('accessoryDefinition.title', 'Accessory Definition')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('accessoryDefinition.notRequired', 'No additional accessory definition required for this garment type.')}
            </p>
            <NavigationButtons />
          </div>
        );
      }

    case 'summary':
      return (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('patternDefinition.summary.title', 'Pattern Definition Summary')}
            </h2>
            <p className="text-gray-600">
              {t('patternDefinition.summary.description', 'Review your pattern definition before proceeding to calculation.')}
            </p>
          </div>

          {/* Pattern Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Color Scheme Simulator */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <SwatchIcon className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('colorScheme.title', 'Color Scheme Simulator')}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {t('colorScheme.description', 'Visualize different color combinations for your pattern.')}
              </p>
              <button
                onClick={() => setShowColorSimulator(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
              >
                {t('colorScheme.openSimulator', 'Open Simulator')}
              </button>
            </div>

            {/* Stitch Integration Advisor */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <SparklesIcon className="h-6 w-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('stitchIntegration.title', 'Stitch Integration Advisor')}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {t('stitchIntegration.description', 'Get recommendations for integrating stitch patterns.')}
              </p>
              <button
                onClick={handleOpenStitchIntegrationAdvisor}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-200 text-sm font-medium"
              >
                {t('stitchIntegration.openAdvisor', 'Open Advisor')}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
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
              <button 
                onClick={handleProceedToCalculation}
                disabled={isCalculating}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>
                  {isCalculating 
                    ? t('patternDefinition.calculation.calculating', 'Calculating Pattern...')
                    : t('patternDefinition.calculation.proceedButton', 'Proceed to Pattern Calculation')
                  }
                </span>
              </button>
            </div>

            {/* Calculation Error Display */}
            {calculationError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {t('patternDefinition.calculation.error', 'Calculation Error')}
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{calculationError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <NavigationButtons />

          {/* Modal Components - These were missing! */}
          {/* Color Scheme Simulator Modal */}
          {showColorSimulator && (
            <ColorSchemeSimulator
              onClose={() => setShowColorSimulator(false)}
              onSchemeSaved={handleColorSchemeSave}
              isModal={true}
            />
          )}

          {/* Pattern Outline Viewer Modal */}
          {showOutlineViewer && currentOutline && (
            <PatternOutlineViewer
              outline={currentOutline}
              isOpen={showOutlineViewer}
              onClose={handleCloseOutlineViewer}
            />
          )}

          {/* Stitch Integration Advisor Modal */}
          {showStitchIntegrationAdvisor && (
            <StitchIntegrationAdvisor
              sessionId={currentSession?.id || ''}
              availableComponents={availableComponents}
              onClose={handleCloseStitchIntegrationAdvisor}
              onSuccess={handleStitchIntegrationSuccess}
            />
          )}
        </div>
      );

    default:
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('patternDefinition.unknownStep', 'Unknown Step')}
          </h2>
          <p className="text-gray-600">
            {t('patternDefinition.unknownStepDescription', 'This step is not implemented yet.')}
          </p>
          <NavigationButtons />
        </div>
      );
  }
} 