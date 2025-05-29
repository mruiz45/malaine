/**
 * Types pour l'outil d'intégration de motifs de mailles (Stitch Pattern Integration Advisor)
 * US_8.2 - Implémentation conforme aux spécifications fonctionnelles
 */

/**
 * Requête d'analyse d'intégration de motif
 */
export interface StitchIntegrationRequest {
  /** ID du composant dans la session de définition */
  componentId: string;
  /** Nombre de mailles cible pour ce composant */
  targetStitchCount: number;
  /** ID du motif de mailles sélectionné depuis la bibliothèque */
  selectedStitchPatternId: string;
  /** Nombre de mailles de lisière désirées de chaque côté */
  desiredEdgeStitches: number;
}

/**
 * Option d'intégration suggérée
 */
export interface IntegrationOption {
  /** Type d'option d'intégration */
  type: 'center_with_stockinette' | 'adjust_for_full_repeats';
  /** Description lisible de l'option */
  description: string;
  /** Nombre total de mailles avec cette option */
  totalStitches: number;
  /** Mailles de lisière de chaque côté (optionnel) */
  edgeStitchesEachSide?: number;
  /** Offset de centrage en mailles (optionnel) */
  centeringOffsetStitches?: number;
  /** Mailles de stockinette de chaque côté (pour option center) */
  stockinetteStitchesEachSide?: number;
}

/**
 * Résultat de l'analyse d'intégration
 */
export interface StitchIntegrationAnalysis {
  /** Nombre de répétitions complètes qui rentrent */
  fullRepeats: number;
  /** Mailles restantes après les répétitions complètes */
  remainingStitches: number;
  /** Nombre de mailles ajusté suggéré */
  suggestedAdjustedStitchCount: number;
  /** Options d'intégration proposées */
  options: IntegrationOption[];
  /** Largeur disponible pour le motif (sans lisières) */
  availableWidthForPattern: number;
  /** Mailles utilisées par les répétitions complètes */
  stitchesUsedByRepeats: number;
}

/**
 * Configuration d'intégration choisie par l'utilisateur
 */
export interface StitchIntegrationChoice {
  /** Option choisie */
  selectedOption: IntegrationOption;
  /** ID du motif appliqué */
  stitchPatternId: string;
  /** Nom du motif appliqué */
  stitchPatternName: string;
  /** Nombre final de mailles pour le composant */
  finalStitchCount: number;
}

/**
 * Mise à jour des attributs de composant pour l'intégration de motif
 * Structure stockée dans pattern_definition_components.selected_attributes
 */
export interface ComponentStitchPatternIntegration {
  /** ID du motif de mailles appliqué */
  stitch_pattern_id: string;
  /** Nom du motif appliqué pour référence */
  applied_stitch_pattern_name: string;
  /** Nombre de mailles ajusté pour le composant */
  adjusted_component_stitch_count: number;
  /** Mailles de lisière de chaque côté */
  edge_stitches_each_side: number;
  /** Offset de centrage en mailles */
  centering_offset_stitches: number;
  /** Type d'intégration utilisé */
  integration_type: 'center_with_stockinette' | 'adjust_for_full_repeats';
  /** Mailles de stockinette de chaque côté (si applicable) */
  stockinette_stitches_each_side?: number;
  /** Nombre de répétitions complètes intégrées */
  full_repeats_count: number;
}

/**
 * Données de motif nécessaires pour les calculs
 */
export interface StitchPatternForIntegration {
  id: string;
  name: string;
  stitch_repeat_width: number;
  row_repeat_height?: number;
}

/**
 * Données de composant nécessaires pour les calculs
 */
export interface ComponentForIntegration {
  id: string;
  name: string;
  target_stitch_count: number;
  selected_attributes?: ComponentStitchPatternIntegration;
}

/**
 * Requête de mise à jour de composant avec intégration
 */
export interface UpdateComponentWithIntegrationRequest {
  sessionId: string;
  componentId: string;
  integration: ComponentStitchPatternIntegration;
}

/**
 * Réponse de mise à jour de composant
 */
export interface UpdateComponentResponse {
  success: boolean;
  message: string;
  updatedComponent?: ComponentForIntegration;
} 