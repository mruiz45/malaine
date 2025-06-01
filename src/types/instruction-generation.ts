/**
 * Types for Instruction Generation with Shaping (US 7.3)
 * Extended for US_11.2: Neckline instruction generation
 * Extended for US_11.4: Armhole instruction generation
 * Extended for US_12.2: Raglan instruction generation
 * Extended for US_12.4: Hammer sleeve instruction generation
 * Defines interfaces for generating detailed textual instructions including shaping
 */

import { ShapingSchedule } from './shaping';
import { NecklineShapingSchedule } from './neckline-shaping';
import { ArmholeShapingSchedule, SleeveCapShapingSchedule } from './armhole-shaping';
import { RaglanTopDownCalculations } from './raglan-construction';
import { HammerSleeveCalculations } from './hammer-sleeve-construction';

/**
 * Type of instruction step
 * Extended for US_11.2 with neckline-specific instruction types
 * Extended for US_11.4 with armhole-specific instruction types
 * Extended for US_12.2 with raglan-specific instruction types
 * Extended for US_12.4 with hammer sleeve-specific instruction types
 */
export type InstructionType = 
  | 'shaping_row' 
  | 'plain_segment' 
  | 'cast_on' 
  | 'cast_off' 
  | 'setup_row' 
  | 'pattern_row' 
  | 'finishing'
  | 'neckline_center_divide'
  | 'neckline_shaping'
  | 'neckline_side_work'
  | 'armhole_base_bind_off'
  | 'armhole_shaping'
  | 'armhole_raglan_shaping'
  | 'sleeve_cap_shaping'
  | 'raglan_cast_on'
  | 'raglan_marker_placement'
  | 'raglan_increase_round'
  | 'raglan_plain_round'
  | 'raglan_separation'
  | 'raglan_underarm_cast_on'
  | 'hammer_sleeve_main'
  | 'hammer_sleeve_vertical'
  | 'hammer_sleeve_extension'
  | 'body_armhole_cutout'
  | 'shoulder_strap_work'
  | 'hammer_assembly';

/**
 * Side indicator for neckline instructions (US_11.2)
 */
export type NecklineSide = 'center' | 'left_front' | 'right_front';

/**
 * Side indicator for armhole instructions (US_11.4)
 */
export type ArmholeSide = 'left_armhole' | 'right_armhole' | 'both_armholes';

/**
 * Type of neckline shaping step (US_11.2)
 */
export type NecklineStepType = 'center_bind_off' | 'side_shaping' | 'side_completion';

/**
 * Type of armhole shaping step (US_11.4)
 */
export type ArmholeStepType = 'base_bind_off' | 'decrease_shaping' | 'raglan_line_shaping' | 'sleeve_cap_increases' | 'sleeve_cap_decreases';

/**
 * Type of raglan shaping step (US_12.2)
 */
export type RaglanStepType = 'cast_on_setup' | 'marker_placement' | 'increase_round' | 'plain_round' | 'sleeve_separation';

/**
 * Type of hammer sleeve shaping step (US_12.4)
 */
export type HammerSleeveStepType = 
  | 'main_sleeve_cast_on'
  | 'main_sleeve_tapered'
  | 'vertical_part_start'
  | 'vertical_part_plain'
  | 'extension_continuation'
  | 'body_cutout_bind_off'
  | 'shoulder_strap_division'
  | 'shoulder_strap_plain'
  | 'assembly_joining';

/**
 * Component part for hammer sleeve instructions (US_12.4)
 */
export type HammerSleeveComponent = 
  | 'sleeve_main'
  | 'sleeve_vertical_part'
  | 'sleeve_extension'
  | 'body_front'
  | 'body_back'
  | 'assembly';

/**
 * Detailed instruction with shaping information
 * Extended for US_11.2 with neckline-specific metadata
 * Extended for US_11.4 with armhole-specific metadata
 * Extended for US_12.2 with raglan-specific metadata
 * Extended for US_12.4 with hammer sleeve-specific metadata
 */
export interface DetailedInstruction {
  /** Step number in the overall sequence */
  step: number;
  /** Row number within the current section (optional) */
  row_number_in_section?: number;
  /** Type of instruction */
  type: InstructionType;
  /** Instruction text */
  text: string;
  /** Current stitch count after this step (if applicable) */
  stitchCount?: number;
  /** Additional metadata for this instruction */
  metadata?: {
    /** Is this a right side or wrong side row (for knitting) */
    isRightSide?: boolean;
    /** Number of stitches changed in this row */
    stitchesChanged?: number;
    /** Type of shaping (increase/decrease) */
    shapingType?: 'increase' | 'decrease';
    /** Current stitch pattern row index (US_8.3) */
    stitchPatternRowIndex?: number;
    /** Neckline-specific metadata (US_11.2) */
    neckline?: {
      /** Which side this instruction applies to */
      for_side: NecklineSide;
      /** Type of neckline shaping step */
      step_type: NecklineStepType;
      /** Step number within neckline shaping sequence */
      neckline_step: number;
      /** Stitches remaining on this side after the instruction */
      stitches_remaining_on_side?: number;
    };
    /** Armhole-specific metadata (US_11.4) */
    armhole?: {
      /** Which armhole(s) this instruction applies to */
      for_side: ArmholeSide;
      /** Type of armhole shaping step */
      step_type: ArmholeStepType;
      /** Step number within armhole shaping sequence */
      armhole_step: number;
      /** Stitches remaining after the instruction */
      stitches_remaining?: number;
      /** For raglan: position relative to raglan marker */
      raglan_marker_position?: 'before' | 'after' | 'both_sides';
      /** For sleeve cap: current cap height */
      sleeve_cap_height_cm?: number;
    };
    /** Raglan-specific metadata (US_12.2) */
    raglan?: {
      /** Type of raglan shaping step */
      step_type: RaglanStepType;
      /** Step number within raglan shaping sequence */
      raglan_step: number;
      /** Round number within raglan construction */
      round_number?: number;
      /** Current stitch distribution across sections */
      section_stitches?: {
        back: number;
        front: number;
        left_sleeve: number;
        right_sleeve: number;
        raglan_lines: number;
      };
      /** For increase rounds: number of stitches increased */
      stitches_increased?: number;
      /** For separation: underarm cast-on count */
      underarm_cast_on?: number;
    };
    /** Hammer sleeve-specific metadata (US_12.4) */
    hammer_sleeve?: {
      /** Type of hammer sleeve shaping step */
      step_type: HammerSleeveStepType;
      /** Step number within hammer sleeve construction sequence */
      hammer_sleeve_step: number;
      /** Component being worked */
      component: HammerSleeveComponent;
      /** Row number within current component section */
      component_row?: number;
      /** Current width in stitches for this component */
      component_width_stitches?: number;
      /** For tapered sleeve: shaping row indicator */
      is_taper_shaping_row?: boolean;
      /** For body cutout: which stitches are being bound off */
      bind_off_stitches?: number;
      /** For shoulder straps: which strap (left/right) */
      shoulder_strap_side?: 'left' | 'right' | 'both';
    };
  };
}

/**
 * Context for instruction generation
 * Extended for US_11.2 with neckline shaping support
 * Extended for US_11.4 with armhole shaping support
 * Extended for US_12.2 with raglan shaping support
 * Extended for US_12.4 with hammer sleeve shaping support
 */
export interface InstructionGenerationContext {
  /** Craft type (knitting or crochet) */
  craftType: 'knitting' | 'crochet';
  /** Component key for context */
  componentKey: string;
  /** Component display name */
  componentDisplayName: string;
  /** Starting stitch count */
  startingStitchCount: number;
  /** Target final stitch count */
  finalStitchCount: number;
  /** Total rows to generate (US_8.3) */
  totalRows?: number;
  /** Shaping schedule to process */
  shapingSchedule?: ShapingSchedule;
  /** Neckline shaping schedule to process (US_11.2) */
  necklineShapingSchedule?: NecklineShapingSchedule;
  /** Armhole shaping schedule to process (US_11.4) */
  armholeShapingSchedule?: ArmholeShapingSchedule;
  /** Sleeve cap shaping schedule to process (US_11.4) */
  sleeveCapShapingSchedule?: SleeveCapShapingSchedule;
  /** Raglan top-down calculations to process (US_12.2) */
  raglanTopDownCalculations?: RaglanTopDownCalculations;
  /** Hammer sleeve calculations to process (US_12.4) */
  hammerSleeveCalculations?: HammerSleeveCalculations;
  /** Additional context metadata */
  metadata?: {
    /** Pattern repeat information */
    patternRepeat?: number;
    /** Stitch pattern name */
    stitchPatternName?: string;
    /** Total component length */
    totalLength?: number;
    /** Raglan increase method preference (US_12.2) */
    raglanIncreaseMethod?: string;
  };
}

/**
 * Result of instruction generation
 */
export interface InstructionGenerationResult {
  /** Success status */
  success: boolean;
  /** Generated detailed instructions */
  instructions?: DetailedInstruction[];
  /** Error message if generation failed */
  error?: string;
  /** Multiple error messages (US_8.3) */
  errors?: string[];
  /** Warnings during generation */
  warnings?: string[];
  /** Total rows covered (US_8.3) */
  totalRows?: number;
  /** Summary information */
  summary?: {
    /** Total number of instructions */
    totalInstructions: number;
    /** Total rows covered */
    totalRows: number;
    /** Final stitch count */
    finalStitchCount: number;
  };
}

/**
 * Configuration for instruction generation
 */
export interface InstructionGenerationConfig {
  /** Include stitch counts in instructions */
  includeStitchCounts: boolean;
  /** Include row numbers */
  includeRowNumbers: boolean;
  /** Use specific shaping techniques (k2tog, ssk, M1L, M1R) or generic */
  useSpecificTechniques: boolean;
  /** Language preference for instruction terminology */
  language: 'en' | 'fr';
  /** Verbosity level */
  verbosity: 'minimal' | 'standard' | 'detailed';
}

/**
 * Shaping instruction template
 */
export interface ShapingInstructionTemplate {
  /** Craft type this template applies to */
  craftType: 'knitting' | 'crochet';
  /** Type of shaping */
  shapingType: 'increase' | 'decrease';
  /** Position of shaping (beginning, end, evenly) */
  shapingPosition: 'beginning' | 'end' | 'evenly' | 'both_ends';
  /** Template text with placeholders */
  template: string;
  /** Example: "Row {rowNumber} (RS - Decrease Row): K1, k2tog, knit to last 3 sts, ssk, k1. ({stitchCount} sts)" */
}

/**
 * Plain row instruction template
 */
export interface PlainInstructionTemplate {
  /** Craft type this template applies to */
  craftType: 'knitting' | 'crochet';
  /** Template for single plain row */
  singleRowTemplate: string;
  /** Template for multiple plain rows */
  multipleRowsTemplate: string;
  /** Example: "Continue in Stockinette Stitch, work {rowCount} rows plain." */
} 