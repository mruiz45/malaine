/**
 * Types for Triangular Shawl Instruction Generation (US_12.6)
 * Defines interfaces for generating detailed textual instructions for triangular shawls
 */

import { TriangularShawlCalculations, TriangularShawlConstructionMethod } from './triangular-shawl';
import { InstructionGenerationConfig, DetailedInstruction } from './instruction-generation';

/**
 * Context for generating triangular shawl instructions
 */
export interface TriangularShawlInstructionContext {
  /** Craft type for terminology */
  craftType: 'knitting' | 'crochet';
  /** Triangular shawl calculations from US_12.5 */
  triangularShawlCalculations: TriangularShawlCalculations;
  /** Component key */
  componentKey: string;
  /** Component display name */
  componentDisplayName: string;
  /** Instruction generation configuration */
  config: InstructionGenerationConfig;
}

/**
 * Result of triangular shawl instruction generation
 */
export interface TriangularShawlInstructionResult {
  /** Success status */
  success: boolean;
  /** Generated instructions */
  instructions?: DetailedInstruction[];
  /** Error message if generation failed */
  error?: string;
  /** Warning messages */
  warnings?: string[];
  /** Summary information */
  summary?: {
    totalInstructions: number;
    totalRows: number;
    finalStitchCount: number;
    constructionMethod: TriangularShawlConstructionMethod;
  };
}

/**
 * Triangular shawl instruction phase types
 */
export type TriangularShawlPhaseType = 
  | 'setup'           // Cast-on and initial setup
  | 'increase_phase'  // Increase shaping phase
  | 'decrease_phase'  // Decrease shaping phase
  | 'transition'      // Transition between phases (side-to-side)
  | 'finishing';      // Bind-off

/**
 * Instruction template for triangular shawl construction methods
 */
export interface TriangularShawlInstructionTemplate {
  /** Construction method this template applies to */
  constructionMethod: TriangularShawlConstructionMethod;
  /** Cast-on instruction template */
  castOnTemplate: {
    knitting: string;
    crochet: string;
  };
  /** Setup instructions after cast-on */
  setupTemplate?: {
    knitting: string;
    crochet: string;
  };
  /** Increase row instruction templates */
  increaseRowTemplate?: {
    knitting: string;
    crochet: string;
  };
  /** Decrease row instruction templates */
  decreaseRowTemplate?: {
    knitting: string;
    crochet: string;
  };
  /** Plain row instruction templates */
  plainRowTemplate: {
    knitting: string;
    crochet: string;
  };
  /** Bind-off instruction template */
  bindOffTemplate: {
    knitting: string;
    crochet: string;
  };
}

/**
 * Triangular shawl increase techniques
 */
export interface TriangularShawlIncreaseTechniques {
  /** Knitting increase techniques */
  knitting: {
    /** Make 1 Left */
    M1L: string;
    /** Make 1 Right */
    M1R: string;
    /** Knit Front and Back */
    KFB: string;
    /** Yarn Over */
    YO: string;
  };
  /** Crochet increase techniques */
  crochet: {
    /** Two stitches in one */
    twoInOne: string;
    /** Chain space increase */
    chainSpace: string;
  };
}

/**
 * Triangular shawl decrease techniques
 */
export interface TriangularShawlDecreaseTechniques {
  /** Knitting decrease techniques */
  knitting: {
    /** Knit 2 together */
    K2tog: string;
    /** Slip, slip, knit */
    SSK: string;
    /** Central double decrease */
    CDD: string;
  };
  /** Crochet decrease techniques */
  crochet: {
    /** Single crochet 2 together */
    sc2tog: string;
    /** Skip stitch */
    skip: string;
  };
}

/**
 * Default increase techniques for triangular shawls
 */
export const DEFAULT_TRIANGULAR_SHAWL_INCREASE_TECHNIQUES: TriangularShawlIncreaseTechniques = {
  knitting: {
    M1L: 'M1L',
    M1R: 'M1R', 
    KFB: 'KFB',
    YO: 'YO'
  },
  crochet: {
    twoInOne: '2 sc in next st',
    chainSpace: 'ch 1, sc in same st'
  }
};

/**
 * Default decrease techniques for triangular shawls
 */
export const DEFAULT_TRIANGULAR_SHAWL_DECREASE_TECHNIQUES: TriangularShawlDecreaseTechniques = {
  knitting: {
    K2tog: 'K2tog',
    SSK: 'SSK',
    CDD: 'CDD'
  },
  crochet: {
    sc2tog: 'sc2tog',
    skip: 'skip next st'
  }
};

/**
 * Triangular shawl marker placement instructions
 */
export interface TriangularShawlMarkerInstructions {
  /** Whether to use markers */
  useMarkers: boolean;
  /** Marker placement descriptions */
  markerPlacements: {
    /** Center spine marker (top-down center-out) */
    centerSpine?: string;
    /** Edge markers */
    edges?: string;
    /** Custom marker instructions */
    custom?: string[];
  };
}

/**
 * Gets the default marker instructions for a construction method
 */
export function getDefaultMarkerInstructions(
  constructionMethod: TriangularShawlConstructionMethod,
  language: 'en' | 'fr' = 'en'
): TriangularShawlMarkerInstructions {
  switch (constructionMethod) {
    case 'top_down_center_out':
      return {
        useMarkers: true,
        markerPlacements: {
          centerSpine: language === 'fr' 
            ? 'Placer un marqueur de chaque côté de la maille centrale'
            : 'Place markers on either side of center stitch',
          edges: language === 'fr'
            ? 'Placer des marqueurs aux extrémités si désiré'
            : 'Place edge markers if desired'
        }
      };
    case 'side_to_side':
      return {
        useMarkers: false,
        markerPlacements: {}
      };
    case 'bottom_up':
      return {
        useMarkers: false,
        markerPlacements: {}
      };
    default:
      return {
        useMarkers: false,
        markerPlacements: {}
      };
  }
} 