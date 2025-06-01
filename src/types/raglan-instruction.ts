/**
 * Types for Raglan Instruction Generation (US_12.2)
 * Defines interfaces for generating detailed textual instructions for raglan top-down construction
 */

import { RaglanTopDownCalculations } from './raglan-construction';
import { InstructionGenerationConfig } from './instruction-generation';

/**
 * Type of raglan instruction step
 */
export type RaglanStepType = 
  | 'raglan_cast_on'
  | 'raglan_marker_placement'
  | 'raglan_increase_round'
  | 'raglan_plain_round'
  | 'raglan_separation'
  | 'raglan_underarm_cast_on';

/**
 * Raglan increase methods for different craft types
 */
export type RaglanIncreaseMethod = 
  // Knitting methods
  | 'M1L_M1R'           // Make 1 Left, Make 1 Right (lifted increases)
  | 'YO'                // Yarn over increases
  | 'KFB'               // Knit front and back
  | 'LLI_RLI'           // Left-leaning increase, Right-leaning increase
  // Crochet methods  
  | 'INC_CHAIN'         // Increase with chain spaces
  | 'DOUBLE_SC'         // Double single crochet in stitch
  | 'SC_CH_SC';         // Single crochet, chain, single crochet

/**
 * Context for raglan instruction generation
 */
export interface RaglanInstructionContext {
  /** Craft type (knitting or crochet) */
  craftType: 'knitting' | 'crochet';
  /** Raglan calculations from US_12.1 */
  raglanCalculations: RaglanTopDownCalculations;
  /** Preferred increase method */
  increaseMethod?: RaglanIncreaseMethod;
  /** Component key for context */
  componentKey: string;
  /** Component display name */
  componentDisplayName: string;
  /** Generation configuration */
  config: InstructionGenerationConfig;
}

/**
 * A section within raglan instruction generation
 */
export interface RaglanInstructionSection {
  /** Section identifier */
  sectionType: RaglanStepType;
  /** Starting step number for this section */
  startStep: number;
  /** Starting stitch count for this section */
  startStitchCount: number;
  /** Instructions generated for this section */
  instructions: RaglanDetailedInstruction[];
  /** Final stitch count after this section */
  finalStitchCount: number;
  /** Number of rows/rounds in this section */
  rowsInSection: number;
}

/**
 * Detailed instruction specific to raglan construction
 */
export interface RaglanDetailedInstruction {
  /** Step number in the overall sequence */
  step: number;
  /** Round/row number within the raglan construction */
  roundNumber?: number;
  /** Type of raglan instruction */
  type: RaglanStepType;
  /** Instruction text */
  text: string;
  /** Current stitch count after this step */
  stitchCount: number;
  /** Raglan-specific metadata */
  raglanMetadata: {
    /** Current round type (increase or plain) */
    roundType: 'increase' | 'plain' | 'setup' | 'separation';
    /** Stitches in each section after this step */
    sectionStitches?: {
      back: number;
      front: number;
      leftSleeve: number;
      rightSleeve: number;
      raglanLines: number;
    };
    /** For increase rounds: number of stitches increased */
    stitchesIncreased?: number;
    /** For separation: underarm cast-on count */
    underarmCastOn?: number;
  };
}

/**
 * Template for raglan instruction generation
 */
export interface RaglanInstructionTemplate {
  /** Craft type this template applies to */
  craftType: 'knitting' | 'crochet';
  /** Raglan step type */
  stepType: RaglanStepType;
  /** Increase method (for increase rounds) */
  increaseMethod?: RaglanIncreaseMethod;
  /** Template text with placeholders */
  template: string;
  /** Example templates:
   * Cast on: "Cast on {castOnCount} stitches using the long-tail method."
   * Markers: "Place markers as follows: {backStitches} for back, marker, {raglanStitches} for raglan line, marker, {sleeveStitches} for left sleeve, marker, {raglanStitches} for raglan line, marker, {frontStitches} for front, marker, {raglanStitches} for raglan line, marker, {sleeveStitches} for right sleeve, marker, {raglanStitches} for raglan line, place marker and join to work in the round."
   * Increase: "Round {roundNumber} (Increase Round): *Knit to 1 stitch before marker, M1L, k1 (raglan stitch), slip marker, k1, M1R; repeat from * 3 more times, knit to end. ({totalStitches} sts)"
   * Plain: "Rounds {startRound}-{endRound}: Knit all stitches. ({totalStitches} sts)"
   * Separation: "Separate sleeves from body: Place {sleeveStitches} left sleeve stitches on holder, cast on {underarmStitches} stitches for underarm, continue with {frontStitches} front stitches, place {sleeveStitches} right sleeve stitches on holder, cast on {underarmStitches} stitches for underarm, continue with {backStitches} back stitches. ({bodyStitches} sts total for body)"
   */
}

/**
 * Result of raglan instruction generation
 */
export interface RaglanInstructionGenerationResult {
  /** Success status */
  success: boolean;
  /** Generated raglan sections */
  sections?: RaglanInstructionSection[];
  /** All instructions in order */
  allInstructions?: RaglanDetailedInstruction[];
  /** Error message if generation failed */
  error?: string;
  /** Warnings during generation */
  warnings?: string[];
  /** Summary information */
  summary?: {
    /** Total number of instructions */
    totalInstructions: number;
    /** Total rounds/rows covered */
    totalRounds: number;
    /** Final stitch count */
    finalStitchCount: number;
    /** Number of increase rounds */
    increaseRounds: number;
    /** Number of plain rounds */
    plainRounds: number;
  };
}

/**
 * Configuration for raglan instruction templates
 */
export interface RaglanTemplateConfig {
  /** Language for templates */
  language: 'en' | 'fr';
  /** Include stitch counts in each instruction */
  includeStitchCounts: boolean;
  /** Include round numbers */
  includeRoundNumbers: boolean;
  /** Use specific technique names */
  useSpecificTechniques: boolean;
  /** Verbosity level */
  verbosity: 'minimal' | 'standard' | 'detailed';
}

/**
 * Default raglan increase methods by craft type
 */
export const DEFAULT_RAGLAN_INCREASE_METHODS: Record<'knitting' | 'crochet', RaglanIncreaseMethod> = {
  knitting: 'M1L_M1R',
  crochet: 'INC_CHAIN'
};

/**
 * Raglan instruction template library
 */
export interface RaglanTemplateLibrary {
  /** Templates by craft type and step type */
  templates: Record<'knitting' | 'crochet', Record<RaglanStepType, RaglanInstructionTemplate[]>>;
  /** Get template for specific context */
  getTemplate(craftType: 'knitting' | 'crochet', stepType: RaglanStepType, increaseMethod?: RaglanIncreaseMethod): RaglanInstructionTemplate | null;
} 