/**
 * Pattern Instruction Generation Types (PD_PH6_US003)
 * Types for generating textual knitting/crochet instructions from calculated pattern details
 */

import { CalculatedPatternDetails, CalculatedPieceDetails } from './core-pattern-calculation';
import { DetailedInstruction } from './instruction-generation';

/**
 * Input for pattern instruction generation
 * Takes the output from PD_PH6_US002 (CalculatedPatternDetails)
 */
export interface PatternInstructionGenerationInput {
  /** Calculated pattern details from the calculation engine */
  calculatedPatternDetails: CalculatedPatternDetails;
  /** Generation options */
  options?: PatternInstructionGenerationOptions;
}

/**
 * Options for pattern instruction generation
 */
export interface PatternInstructionGenerationOptions {
  /** Include stitch counts in instructions */
  includeStitchCounts?: boolean;
  /** Include row numbers */
  includeRowNumbers?: boolean;
  /** Use standard abbreviations */
  useStandardAbbreviations?: boolean;
  /** Language for instructions */
  language?: 'en' | 'fr';
  /** Level of detail */
  detailLevel?: 'minimal' | 'standard' | 'detailed';
  /** Include shaping details */
  includeShapingDetails?: boolean;
  /** Include construction notes */
  includeConstructionNotes?: boolean;
}

/**
 * Result of pattern instruction generation
 */
export interface PatternInstructionGenerationResult {
  /** Success status */
  success: boolean;
  /** Generated instructions by piece */
  instructionsByPiece?: PatternInstructionsByPiece;
  /** Overall pattern introduction */
  patternIntroduction?: string;
  /** Abbreviations glossary */
  abbreviationsGlossary?: StandardAbbreviations;
  /** Error messages if any */
  errors?: string[];
  /** Warning messages */
  warnings?: string[];
  /** Generation metadata */
  metadata?: {
    /** Total instruction count */
    totalInstructions: number;
    /** Pieces processed */
    piecesProcessed: string[];
    /** Generation timestamp */
    generatedAt: string;
  };
}

/**
 * Instructions organized by pattern piece
 */
export interface PatternInstructionsByPiece {
  [pieceKey: string]: PieceInstructions;
}

/**
 * Instructions for a single pattern piece
 */
export interface PieceInstructions {
  /** Piece identifier */
  pieceKey: string;
  /** Display name for the piece */
  displayName: string;
  /** Full markdown instructions */
  markdownInstructions: string;
  /** Row-by-row instruction steps */
  instructionSteps: RowByRowInstruction[];
  /** Construction summary */
  constructionSummary: {
    /** Cast-on stitch count */
    castOnStitches: number;
    /** Total row count */
    totalRows: number;
    /** Final stitch count */
    finalStitchCount: number;
    /** Finished dimensions */
    finishedDimensions: {
      width_cm: number;
      length_cm: number;
      circumference_cm?: number;
    };
  };
  /** Construction notes */
  constructionNotes?: string[];
}

/**
 * Row-by-row instruction with detailed information
 */
export interface RowByRowInstruction {
  /** Row number */
  rowNumber: number;
  /** Section within the piece (e.g., "Body", "Armhole Shaping") */
  section: string;
  /** Instruction text with abbreviations */
  instructionText: string;
  /** Current stitch count after this row */
  stitchCount: number;
  /** Row type (plain, shaping, pattern) */
  rowType: RowInstructionType;
  /** Additional metadata */
  metadata?: {
    /** Is this a right side (RS) or wrong side (WS) row */
    isRightSide: boolean;
    /** Stitches changed in this row (+ for increases, - for decreases) */
    stitchesChanged?: number;
    /** Shaping type if applicable */
    shapingType?: 'increase' | 'decrease';
    /** Stitch pattern row if applicable */
    stitchPatternRow?: number;
    /** Construction notes for this row */
    notes?: string[];
  };
}

/**
 * Type of row instruction
 */
export type RowInstructionType = 
  | 'cast_on'
  | 'plain_row'
  | 'shaping_row'
  | 'pattern_row'
  | 'bind_off'
  | 'setup_row'
  | 'transition_row';

/**
 * Standard knitting/crochet abbreviations
 */
export interface StandardAbbreviations {
  /** Abbreviation mappings */
  abbreviations: Record<string, AbbreviationDefinition>;
  /** Craft type these abbreviations apply to */
  craftType: 'knitting' | 'crochet';
  /** Language of abbreviations */
  language: 'en' | 'fr';
}

/**
 * Definition of a single abbreviation
 */
export interface AbbreviationDefinition {
  /** Abbreviated form */
  abbreviation: string;
  /** Full term */
  fullTerm: string;
  /** Description of the technique */
  description: string;
  /** Alternative abbreviations */
  alternatives?: string[];
}

/**
 * Template for generating instruction text
 */
export interface InstructionTemplate {
  /** Template identifier */
  templateId: string;
  /** Craft type this template applies to */
  craftType: 'knitting' | 'crochet';
  /** Instruction type */
  instructionType: RowInstructionType;
  /** Template text with placeholders */
  template: string;
  /** Placeholder descriptions */
  placeholders: Record<string, string>;
  /** Example usage */
  example?: string;
}

/**
 * Context for instruction generation from calculated piece
 */
export interface PieceInstructionContext {
  /** Calculated piece details */
  pieceDetails: CalculatedPieceDetails;
  /** Craft type */
  craftType: 'knitting' | 'crochet';
  /** Generation options */
  options: PatternInstructionGenerationOptions;
  /** Standard abbreviations to use */
  abbreviations: StandardAbbreviations;
  /** Available instruction templates */
  templates: InstructionTemplate[];
} 