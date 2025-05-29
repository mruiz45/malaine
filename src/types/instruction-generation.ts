/**
 * Types for Instruction Generation with Shaping (US 7.3)
 * Defines interfaces for generating detailed textual instructions including shaping
 */

import { ShapingSchedule } from './shaping';

/**
 * Type of instruction step
 */
export type InstructionType = 'shaping_row' | 'plain_segment' | 'cast_on' | 'cast_off' | 'setup_row' | 'pattern_row' | 'finishing';

/**
 * Detailed instruction with shaping information
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
  };
}

/**
 * Context for instruction generation
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
  /** Additional context metadata */
  metadata?: {
    /** Pattern repeat information */
    patternRepeat?: number;
    /** Stitch pattern name */
    stitchPatternName?: string;
    /** Total component length */
    totalLength?: number;
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