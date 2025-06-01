/**
 * Types for Triangular Shawl Calculations (US_12.5)
 * Defines interfaces for triangular shawl construction methods and calculation results
 */

/**
 * Triangular shawl construction methods
 */
export type TriangularShawlConstructionMethod = 
  | 'top_down_center_out'  // Starts from center top with increases
  | 'side_to_side'         // Starts from one point, increases then decreases  
  | 'bottom_up';           // Starts from wide edge with decreases

/**
 * Input parameters for triangular shawl calculations
 */
export interface TriangularShawlCalculationInput {
  /** Target wingspan in cm */
  target_wingspan_cm: number;
  /** Target depth from center to point in cm */
  target_depth_cm: number;
  /** Gauge: stitches per 10cm */
  gauge_stitches_per_10cm: number;
  /** Gauge: rows per 10cm */
  gauge_rows_per_10cm: number;
  /** Construction method */
  construction_method: TriangularShawlConstructionMethod;
  /** Border stitches on each side (optional, defaults to 0) */
  border_stitches_each_side?: number;
  /** Whether to work flat or in the round (typically flat for shawls) */
  work_style?: 'flat' | 'in_the_round';
}

/**
 * Shaping phase for triangular shawl construction
 */
export interface TriangularShawlShapingPhase {
  /** Phase description */
  description: string;
  /** Total number of increase/decrease rows in this phase */
  total_shaping_rows: number;
  /** Number of stitches increased/decreased per shaping event */
  stitches_per_event: number;
  /** Total rows in this phase (including non-shaping rows) */
  total_rows_in_phase: number;
  /** Frequency of shaping (every X rows) */
  shaping_frequency: number;
}

/**
 * Complete triangular shawl calculation result
 */
export interface TriangularShawlCalculations {
  /** Construction method used */
  construction_method: TriangularShawlConstructionMethod;
  /** Input parameters */
  inputs: {
    target_wingspan_cm: number;
    target_depth_cm: number;
    gauge_stitches_per_10cm: number;
    gauge_rows_per_10cm: number;
    border_stitches_each_side: number;
    work_style: 'flat' | 'in_the_round';
  };
  /** Setup information */
  setup: {
    /** Number of stitches to cast on */
    cast_on_stitches: number;
    /** Setup instructions if any */
    setup_notes?: string;
  };
  /** Shaping schedule */
  shaping_schedule: {
    /** Phase 1: Increases for top-down or first half of side-to-side */
    phase_1_increases?: TriangularShawlShapingPhase;
    /** Phase 2: Decreases for second half of side-to-side or bottom-up */
    phase_2_decreases?: TriangularShawlShapingPhase;
  };
  /** Final stitch count after all shaping */
  final_stitch_count: number;
  /** Total rows knitted */
  total_rows_knit: number;
  /** Actual calculated dimensions */
  calculated_dimensions: {
    /** Actual wingspan achieved in cm */
    actual_wingspan_cm: number;
    /** Actual depth achieved in cm */
    actual_depth_cm: number;
  };
  /** Warnings or notes about the calculation */
  warnings?: string[];
}

/**
 * Attributes for triangular shawl garment type
 */
export interface TriangularShawlAttributes {
  /** Garment type discriminator */
  type: 'triangular_shawl';
  /** Target wingspan in cm */
  target_wingspan_cm: number;
  /** Target depth from center to point in cm */
  target_depth_cm: number;
  /** Construction method */
  construction_method: TriangularShawlConstructionMethod;
  /** Border stitches on each side (optional) */
  border_stitches_each_side?: number;
  /** Work style */
  work_style: 'flat' | 'in_the_round';
}

/**
 * Validation function for triangular shawl attributes
 */
export function validateTriangularShawlAttributes(attributes: Partial<TriangularShawlAttributes>): string[] {
  const errors: string[] = [];

  if (!attributes.target_wingspan_cm || attributes.target_wingspan_cm <= 0) {
    errors.push('Target wingspan must be greater than 0');
  }

  if (!attributes.target_depth_cm || attributes.target_depth_cm <= 0) {
    errors.push('Target depth must be greater than 0');
  }

  if (!attributes.construction_method) {
    errors.push('Construction method must be selected');
  }

  if (!attributes.work_style) {
    errors.push('Work style must be selected');
  }

  if (attributes.border_stitches_each_side !== undefined && attributes.border_stitches_each_side < 0) {
    errors.push('Border stitches cannot be negative');
  }

  return errors;
}

/**
 * Helper function to get construction method display name
 */
export function getConstructionMethodDisplayName(method: TriangularShawlConstructionMethod, language: 'en' | 'fr' = 'en'): string {
  const names = {
    top_down_center_out: {
      en: 'Top-Down Center-Out',
      fr: 'Du Haut vers le Bas depuis le Centre'
    },
    side_to_side: {
      en: 'Side-to-Side',
      fr: 'Pointe à Pointe'
    },
    bottom_up: {
      en: 'Bottom-Up',
      fr: 'Du Bas vers le Haut'
    }
  };

  return names[method][language];
}

/**
 * Helper function to get construction method description
 */
export function getConstructionMethodDescription(method: TriangularShawlConstructionMethod, language: 'en' | 'fr' = 'en'): string {
  const descriptions = {
    top_down_center_out: {
      en: 'Starts with a few stitches at the center top, with increases on both sides and around a central spine to form a downward-pointing triangle',
      fr: 'Commence par quelques mailles au centre de la nuque, avec des augmentations de chaque côté et de part et d\'autre d\'une maille centrale pour former un triangle pointant vers le bas'
    },
    side_to_side: {
      en: 'Starts with a few stitches at one point, increases on one side until maximum depth, then decreases on the same side to form the other half',
      fr: 'Commence par quelques mailles à une pointe, augmente sur un seul côté jusqu\'à la profondeur maximale, puis diminue sur ce même côté pour former l\'autre moitié'
    },
    bottom_up: {
      en: 'Starts with a large number of stitches for the longest side of the triangle and decreases regularly on both sides to form the top point',
      fr: 'Commence par un grand nombre de mailles pour le côté le plus long du triangle et diminue régulièrement de chaque côté pour former la pointe supérieure'
    }
  };

  return descriptions[method][language];
} 