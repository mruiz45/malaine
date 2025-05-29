import { useState, useCallback } from 'react';
import type {
  StitchIntegrationRequest,
  StitchIntegrationAnalysis,
  ComponentStitchPatternIntegration,
  UpdateComponentResponse,
  StitchIntegrationChoice
} from '@/types/stitch-integration';

/**
 * Hook pour l'intégration de motifs de mailles (Stitch Pattern Integration Advisor)
 * US_8.2 - Encapsule la logique d'intégration côté client
 */
export function useStitchIntegration() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StitchIntegrationAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Analyse l'intégration d'un motif de mailles dans un composant
   */
  const analyzeIntegration = useCallback(async (
    request: StitchIntegrationRequest
  ): Promise<StitchIntegrationAnalysis | null> => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/tools/stitch-pattern-integrator/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const analysis: StitchIntegrationAnalysis = await response.json();
      setAnalysisResult(analysis);
      return analysis;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during analysis';
      setError(errorMessage);
      console.error('Error analyzing stitch integration:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Applique l'intégration choisie à un composant
   */
  const applyIntegration = useCallback(async (
    sessionId: string,
    componentId: string,
    choice: StitchIntegrationChoice
  ): Promise<UpdateComponentResponse | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      // Préparation des données d'intégration selon le choix utilisateur
      const integrationData: ComponentStitchPatternIntegration = {
        stitch_pattern_id: choice.stitchPatternId,
        applied_stitch_pattern_name: choice.stitchPatternName,
        adjusted_component_stitch_count: choice.finalStitchCount,
        edge_stitches_each_side: choice.selectedOption.edgeStitchesEachSide || 0,
        centering_offset_stitches: choice.selectedOption.centeringOffsetStitches || 0,
        integration_type: choice.selectedOption.type,
        stockinette_stitches_each_side: choice.selectedOption.stockinetteStitchesEachSide,
        full_repeats_count: analysisResult?.fullRepeats || 0
      };

      const response = await fetch(
        `/api/pattern-definition-sessions/${sessionId}/components/${componentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ integration: integrationData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: UpdateComponentResponse = await response.json();
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during update';
      setError(errorMessage);
      console.error('Error applying stitch integration:', err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [analysisResult]);

  /**
   * Récupère les détails d'un composant
   */
  const getComponentDetails = useCallback(async (
    sessionId: string,
    componentId: string
  ) => {
    try {
      const response = await fetch(
        `/api/pattern-definition-sessions/${sessionId}/components/${componentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while fetching component';
      setError(errorMessage);
      console.error('Error fetching component details:', err);
      return null;
    }
  }, []);

  /**
   * Calcule les suggestions d'intégration localement (utilitaire)
   * Peut être utilisé pour des prévisualisations rapides côté client
   */
  const calculateLocalSuggestions = useCallback((
    targetStitchCount: number,
    stitchRepeatWidth: number,
    desiredEdgeStitches: number
  ) => {
    const availableWidthForPattern = targetStitchCount - (2 * desiredEdgeStitches);
    const numFullRepeats = Math.floor(availableWidthForPattern / stitchRepeatWidth);
    const stitchesUsedByRepeats = numFullRepeats * stitchRepeatWidth;
    const remainingStitches = availableWidthForPattern - stitchesUsedByRepeats;

    return {
      fullRepeats: numFullRepeats,
      remainingStitches,
      availableWidthForPattern,
      stitchesUsedByRepeats,
      canFitPattern: numFullRepeats > 0,
      minStitchesForOneRepeat: stitchRepeatWidth + (2 * desiredEdgeStitches)
    };
  }, []);

  /**
   * Réinitialise l'état du hook
   */
  const resetState = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
    setIsAnalyzing(false);
    setIsUpdating(false);
  }, []);

  /**
   * Valide les paramètres d'une requête d'analyse
   */
  const validateAnalysisRequest = useCallback((request: StitchIntegrationRequest): string | null => {
    if (!request.componentId) {
      return 'Component ID is required';
    }
    if (!request.selectedStitchPatternId) {
      return 'Stitch pattern ID is required';
    }
    if (request.targetStitchCount <= 0) {
      return 'Target stitch count must be greater than 0';
    }
    if (request.desiredEdgeStitches < 0) {
      return 'Desired edge stitches must be 0 or greater';
    }
    if (request.desiredEdgeStitches * 2 >= request.targetStitchCount) {
      return 'Edge stitches cannot exceed or equal half the total stitch count';
    }
    return null;
  }, []);

  return {
    // État
    isAnalyzing,
    isUpdating,
    analysisResult,
    error,

    // Actions
    analyzeIntegration,
    applyIntegration,
    getComponentDetails,
    calculateLocalSuggestions,
    resetState,
    validateAnalysisRequest,

    // Getters utilitaires
    hasAnalysis: !!analysisResult,
    canApplyIntegration: !!analysisResult && !isUpdating,
    isLoading: isAnalyzing || isUpdating
  };
} 