/**
 * 3D Preview Hook (PD_PH5_US001)
 * Custom hook for managing 3D garment preview state and updates
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useInMemoryPatternDefinition } from '@/contexts/InMemoryPatternDefinitionContext';
import {
  Preview3DState,
  FinishedDimensions,
  MeshConfiguration,
  Scene3DConfig,
  CameraViewPreset,
  Neckline3DParams,
  Sleeve3DParams,
  GarmentComponent,
  DEFAULT_MESH_CONFIG,
  DEFAULT_SCENE_CONFIG,
  Preview3DUpdateEvent
} from '@/types/3d-preview';
import { 
  MeasurementsSectionData, 
  EaseSectionData, 
  NecklineSectionData, 
  SleevesSectionData 
} from '@/types/patternDefinitionInMemory';

/**
 * Hook for 3D preview functionality
 */
export function use3DPreview() {
  const { state } = useInMemoryPatternDefinition();
  const { currentPattern } = state;

  // 3D Preview state
  const [previewState, setPreviewState] = useState<Preview3DState>({
    enabled: true,
    isLoading: false,
    error: null,
    currentView: 'perspective',
    dimensions: null,
    meshConfig: DEFAULT_MESH_CONFIG,
    sceneConfig: DEFAULT_SCENE_CONFIG,
    autoUpdate: true,
    lastUpdated: null
  });

  /**
   * Calculate finished dimensions from measurements and ease
   */
  const calculateFinishedDimensions = useCallback((
    measurements: MeasurementsSectionData | undefined,
    ease: EaseSectionData | undefined
  ): FinishedDimensions | null => {
    if (!measurements || !measurements.isCompleted) {
      return null;
    }

    const baseMeasurements = measurements.measurements;
    const easeValues = ease?.values || {};

    // Base calculations (simplified for initial implementation)
    const finishedDimensions: FinishedDimensions = {
      bust: (baseMeasurements.bust || 34) + (easeValues.bust || 2),
      waist: baseMeasurements.waist ? 
        baseMeasurements.waist + (easeValues.waist || 2) : undefined,
      hip: baseMeasurements.hip ? 
        baseMeasurements.hip + (easeValues.hip || 2) : undefined,
      length: baseMeasurements.length || 24,
      sleeveLength: baseMeasurements.sleeveLength || 24,
      shoulderWidth: baseMeasurements.shoulderWidth || 16,
      armholeDepth: baseMeasurements.armholeDepth || 8,
      necklineDepth: 2, // Default neckline depth
      necklineWidth: 6, // Default neckline width
      unit: measurements.unit
    };

    return finishedDimensions;
  }, []);

  /**
   * Extract neckline parameters for 3D
   */
  const extractNecklineParams = useCallback((
    necklineData: NecklineSectionData | undefined,
    dimensions: FinishedDimensions | null
  ): Neckline3DParams | undefined => {
    if (!necklineData || !dimensions) {
      return undefined;
    }

    return {
      style: necklineData.style,
      depth: dimensions.necklineDepth || 2,
      width: dimensions.necklineWidth || 6,
      shape: 'round' // Default shape, could be extracted from parameters
    };
  }, []);

  /**
   * Extract sleeve parameters for 3D
   */
  const extractSleeveParams = useCallback((
    sleeveData: SleevesSectionData | undefined,
    dimensions: FinishedDimensions | null
  ): Sleeve3DParams | undefined => {
    if (!sleeveData || !dimensions) {
      return undefined;
    }

    const length = sleeveData.customLength || dimensions.sleeveLength || 24;

    return {
      style: sleeveData.style,
      length,
      cuffWidth: 8, // Default cuff width
      attachmentAngle: 0, // Default attachment angle
      taper: 'tapered' // Default taper
    };
  }, []);

  /**
   * Update 3D preview based on pattern changes
   */
  const updatePreview = useCallback(() => {
    if (!currentPattern || !previewState.autoUpdate) {
      return;
    }

    setPreviewState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const dimensions = calculateFinishedDimensions(
        currentPattern.measurements,
        currentPattern.ease
      );

      if (dimensions) {
        setPreviewState(prev => ({
          ...prev,
          dimensions,
          isLoading: false,
          lastUpdated: new Date()
        }));
      } else {
        setPreviewState(prev => ({
          ...prev,
          dimensions: null,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error updating 3D preview:', error);
      setPreviewState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      }));
    }
  }, [currentPattern, previewState.autoUpdate, calculateFinishedDimensions]);

  /**
   * Debounced update effect
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [updatePreview]);

  /**
   * Get current neckline parameters
   */
  const necklineParams = useMemo(() => {
    return extractNecklineParams(currentPattern?.neckline, previewState.dimensions);
  }, [currentPattern?.neckline, previewState.dimensions, extractNecklineParams]);

  /**
   * Get current sleeve parameters
   */
  const sleeveParams = useMemo(() => {
    return extractSleeveParams(currentPattern?.sleeves, previewState.dimensions);
  }, [currentPattern?.sleeves, previewState.dimensions, extractSleeveParams]);

  /**
   * Toggle 3D preview enabled state
   */
  const togglePreview = useCallback((enabled: boolean) => {
    setPreviewState(prev => ({ ...prev, enabled }));
  }, []);

  /**
   * Change camera view
   */
  const changeView = useCallback((view: CameraViewPreset) => {
    setPreviewState(prev => ({ ...prev, currentView: view }));
  }, []);

  /**
   * Update mesh configuration
   */
  const updateMeshConfig = useCallback((config: Partial<MeshConfiguration>) => {
    setPreviewState(prev => ({
      ...prev,
      meshConfig: { ...prev.meshConfig, ...config }
    }));
  }, []);

  /**
   * Update visibility of a single component (PD_PH5_US002)
   */
  const updateComponentVisibility = useCallback((component: GarmentComponent, visible: boolean) => {
    setPreviewState(prev => ({
      ...prev,
      meshConfig: {
        ...prev.meshConfig,
        visibility: {
          ...prev.meshConfig.visibility,
          [component]: visible
        }
      }
    }));
  }, []);

  /**
   * Update scene configuration
   */
  const updateSceneConfig = useCallback((config: Partial<Scene3DConfig>) => {
    setPreviewState(prev => ({
      ...prev,
      sceneConfig: { ...prev.sceneConfig, ...config }
    }));
  }, []);

  /**
   * Toggle auto-update
   */
  const toggleAutoUpdate = useCallback((autoUpdate: boolean) => {
    setPreviewState(prev => ({ ...prev, autoUpdate }));
  }, []);

  /**
   * Manual refresh
   */
  const refreshPreview = useCallback(() => {
    updatePreview();
  }, [updatePreview]);

  /**
   * Reset to defaults
   */
  const resetToDefaults = useCallback(() => {
    setPreviewState(prev => ({
      ...prev,
      meshConfig: DEFAULT_MESH_CONFIG,
      sceneConfig: DEFAULT_SCENE_CONFIG,
      currentView: 'perspective',
      error: null
    }));
  }, []);

  /**
   * Check if preview is available
   */
  const isPreviewAvailable = useMemo(() => {
    return !!(
      currentPattern && 
      currentPattern.garmentType && 
      previewState.dimensions
    );
  }, [currentPattern, previewState.dimensions]);

  /**
   * Get preview status message
   */
  const statusMessage = useMemo(() => {
    if (!currentPattern) {
      return 'No pattern selected';
    }
    if (!currentPattern.garmentType) {
      return 'Select garment type to enable preview';
    }
    if (!previewState.dimensions) {
      return 'Complete measurements to enable preview';
    }
    if (previewState.error) {
      return `Error: ${previewState.error}`;
    }
    if (previewState.isLoading) {
      return 'Updating preview...';
    }
    return 'Preview ready';
  }, [currentPattern, previewState.dimensions, previewState.error, previewState.isLoading]);

  return {
    // State
    previewState,
    isPreviewAvailable,
    statusMessage,
    necklineParams,
    sleeveParams,
    garmentType: currentPattern?.garmentType || null,

    // Actions
    togglePreview,
    changeView,
    updateMeshConfig,
    updateComponentVisibility,
    updateSceneConfig,
    toggleAutoUpdate,
    refreshPreview,
    resetToDefaults,

    // Utilities
    calculateFinishedDimensions
  };
} 