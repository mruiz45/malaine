/**
 * Instruction Generator Service (US 7.3)
 * Generates detailed textual instructions for garment pieces with shaping
 * Extended for US_8.3: Stitch pattern integration
 * Extended for US_11.2: Neckline instruction generation
 * Extended for US_11.4: Armhole instruction generation
 * Extended for US_12.2: Raglan instruction generation
 */

import { 
  InstructionGenerationContext, 
  InstructionGenerationResult, 
  InstructionGenerationConfig,
  DetailedInstruction,
  ShapingInstructionTemplate,
  PlainInstructionTemplate
} from '@/types/instruction-generation';
import { ShapingSchedule, ShapingEvent } from '@/types/shaping';
import { NecklineShapingSchedule, NecklineShapingAction } from '@/types/neckline-shaping';
import { ArmholeShapingSchedule, ArmholeShapingAction, SleeveCapShapingSchedule } from '@/types/armhole-shaping';
import { RaglanTopDownCalculations } from '@/types/raglan-construction';
import { HammerSleeveCalculations } from '@/types/hammer-sleeve-construction';
import { 
  RaglanInstructionContext,
  RaglanInstructionGenerationResult,
  DEFAULT_RAGLAN_INCREASE_METHODS
} from '@/types/raglan-instruction';
import { 
  StitchPatternInstructionContext,
  ComponentStitchPatternIntegrationData
} from '@/types/pattern-calculation';
import { StitchPattern } from '@/types/stitchPattern';
import {
  createStitchPatternContext,
  generateStitchPatternRowInstruction,
  validateStitchPatternCompatibility,
  generateStitchPatternCastOnInstruction
} from '@/utils/stitch-pattern-instruction-generator';
import {
  generateCenterBindOffInstruction,
  generateNecklineShapingInstruction,
  generateNecklinePlainRowInstruction,
  generateRepeatInstructionText,
  determineRowSide,
  calculateStitchesAfterAction
} from '@/utils/neckline-instruction-generator';
import {
  generateArmholeBaseBindOffInstruction,
  generateArmholeBaseBindOffNextRowInstruction,
  generateArmholeShapingInstruction,
  generateRaglanShapingInstruction,
  generateArmholeRepeatInstructionText,
  generateSleeveCapIncreaseInstruction,
  generateSleeveCapDecreaseInstruction,
  calculateStitchesAfterArmholeAction,
  determineArmholeRowSide,
  generateArmholePlainRowInstruction
} from '@/utils/armhole-instruction-generator';
import { generateRaglanTopDownInstructions } from '@/utils/raglan-instruction-generator';
import { 
  generateHammerSleeveInstructions,
  HammerSleeveInstructionContext,
  HammerSleeveInstructionResult
} from '@/utils/hammer-sleeve-instruction-generator';
import { 
  generateTriangularShawlInstructions
} from '@/utils/triangular-shawl-instruction-generator';
import type {
  TriangularShawlInstructionContext,
  TriangularShawlInstructionResult
} from '@/utils/triangular-shawl-instruction-generator';

/**
 * Service class for generating detailed instructions with shaping and stitch patterns
 */
export class InstructionGeneratorService {
  private readonly defaultConfig: InstructionGenerationConfig = {
    includeStitchCounts: true,
    includeRowNumbers: true,
    useSpecificTechniques: false, // Generic instructions initially
    language: 'en',
    verbosity: 'standard'
  };

  /**
   * Generates detailed instructions with shaping for a component
   * Extended for US_11.2: Integrated neckline instruction generation
   * Extended for US_12.2: Integrated raglan instruction generation
   * @param context - Component and shaping context
   * @param config - Optional configuration overrides
   * @returns Generated instructions result
   */
  public generateDetailedInstructionsWithShaping(
    context: InstructionGenerationContext,
    config?: Partial<InstructionGenerationConfig>
  ): InstructionGenerationResult {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };
      const instructions: DetailedInstruction[] = [];
      let currentStitchCount = context.startingStitchCount;
      let currentStep = 1;
      let currentRowInSection = 1;

      // Process raglan shaping if available (US_12.2)
      if (context.raglanTopDownCalculations) {
        const raglanResult = this.generateRaglanInstructions(
          context.raglanTopDownCalculations,
          context,
          finalConfig
        );

        if (raglanResult.success && raglanResult.allInstructions) {
          // Convert raglan instructions to DetailedInstruction format
          const convertedRaglanInstructions = raglanResult.allInstructions.map((raglanInstruction) => ({
            step: raglanInstruction.step,
            row_number_in_section: raglanInstruction.roundNumber,
            type: raglanInstruction.type,
            text: raglanInstruction.text,
            stitchCount: raglanInstruction.stitchCount,
            metadata: {
              raglan: {
                step_type: this.mapRaglanStepType(raglanInstruction.type),
                raglan_step: raglanInstruction.step,
                round_number: raglanInstruction.roundNumber,
                section_stitches: raglanInstruction.raglanMetadata.sectionStitches ? {
                  back: raglanInstruction.raglanMetadata.sectionStitches.back,
                  front: raglanInstruction.raglanMetadata.sectionStitches.front,
                  left_sleeve: raglanInstruction.raglanMetadata.sectionStitches.leftSleeve,
                  right_sleeve: raglanInstruction.raglanMetadata.sectionStitches.rightSleeve,
                  raglan_lines: raglanInstruction.raglanMetadata.sectionStitches.raglanLines
                } : undefined,
                stitches_increased: raglanInstruction.raglanMetadata.stitchesIncreased,
                underarm_cast_on: raglanInstruction.raglanMetadata.underarmCastOn
              }
            }
          }));

          instructions.push(...convertedRaglanInstructions);
          currentStep += raglanResult.allInstructions.length;
          
          // Update final stitch count based on raglan shaping
          if (raglanResult.summary?.finalStitchCount) {
            currentStitchCount = raglanResult.summary.finalStitchCount;
          }

          return {
            success: true,
            instructions,
            totalRows: raglanResult.summary?.totalRounds,
            summary: {
              totalInstructions: instructions.length,
              totalRows: raglanResult.summary?.totalRounds || 0,
              finalStitchCount: currentStitchCount
            }
          };
        } else if (raglanResult.error) {
          return {
            success: false,
            error: `Raglan instruction generation failed: ${raglanResult.error}`,
            warnings: [`Failed to generate raglan instructions: ${raglanResult.error}`]
          };
        }
      }

      // Add cast-on instruction (for non-raglan components)
      instructions.push({
        step: currentStep++,
        type: 'cast_on',
        text: this.generateCastOnInstruction(context.craftType, context.startingStitchCount, finalConfig),
        stitchCount: currentStitchCount
      });

      // Process regular shaping if available
      if (context.shapingSchedule && context.shapingSchedule.hasShaping) {
        const shapingInstructions = this.processShapingSchedule(
          context.shapingSchedule,
          context,
          finalConfig,
          currentStep,
          currentStitchCount
        );
        
        instructions.push(...shapingInstructions.instructions);
        currentStep = shapingInstructions.nextStep;
        currentStitchCount = shapingInstructions.finalStitchCount;
      } else {
        // No regular shaping - generate basic instructions
        const plainInstructions = this.generatePlainInstructions(
          context,
          finalConfig,
          currentStep,
          currentStitchCount
        );
        
        instructions.push(...plainInstructions);
        currentStep += plainInstructions.length;
      }

      // Process neckline shaping if available (US_11.2)
      if (context.necklineShapingSchedule) {
        const necklineResult = this.generateNecklineInstructions(
          context.necklineShapingSchedule,
          {
            ...context,
            startingStitchCount: currentStitchCount // Use current stitch count as starting point for neckline
          },
          finalConfig
        );

        if (necklineResult.success && necklineResult.instructions) {
          // Adjust step numbers to continue from current step
          const adjustedNecklineInstructions = necklineResult.instructions.map(instruction => ({
            ...instruction,
            step: instruction.step + currentStep - 1
          }));

          instructions.push(...adjustedNecklineInstructions);
          currentStep += necklineResult.instructions.length;
          
          // Update final stitch count based on neckline shaping
          if (necklineResult.summary?.finalStitchCount) {
            currentStitchCount = necklineResult.summary.finalStitchCount;
          }
        } else if (necklineResult.error) {
          // Add neckline generation error as warning
          return {
            success: false,
            error: `Neckline instruction generation failed: ${necklineResult.error}`,
            warnings: [`Failed to generate neckline instructions: ${necklineResult.error}`]
          };
        }
      }

      // Process armhole shaping if available (US_11.4)
      if (context.armholeShapingSchedule) {
        const armholeResult = this.generateArmholeInstructions(
          context.armholeShapingSchedule,
          {
            ...context,
            startingStitchCount: currentStitchCount // Use current stitch count as starting point for armhole
          },
          finalConfig
        );

        if (armholeResult.success && armholeResult.instructions) {
          // Adjust step numbers to continue from current step
          const adjustedArmholeInstructions = armholeResult.instructions.map(instruction => ({
            ...instruction,
            step: instruction.step + currentStep - 1
          }));

          instructions.push(...adjustedArmholeInstructions);
          currentStep += armholeResult.instructions.length;
          
          // Update final stitch count based on armhole shaping
          if (armholeResult.summary?.finalStitchCount) {
            currentStitchCount = armholeResult.summary.finalStitchCount;
          }
        } else if (armholeResult.error) {
          // Add armhole generation error as warning
          return {
            success: false,
            error: `Armhole instruction generation failed: ${armholeResult.error}`,
            warnings: [`Failed to generate armhole instructions: ${armholeResult.error}`]
          };
        }
      }

      // Process sleeve cap shaping if available (US_11.4)
      if (context.sleeveCapShapingSchedule) {
        const sleeveCapResult = this.generateSleeveCapInstructions(
          context.sleeveCapShapingSchedule,
          {
            ...context,
            startingStitchCount: currentStitchCount // Use current stitch count as starting point for sleeve cap
          },
          finalConfig
        );

        if (sleeveCapResult.success && sleeveCapResult.instructions) {
          // Adjust step numbers to continue from current step
          const adjustedSleeveCapInstructions = sleeveCapResult.instructions.map(instruction => ({
            ...instruction,
            step: instruction.step + currentStep - 1
          }));

          instructions.push(...adjustedSleeveCapInstructions);
          currentStep += sleeveCapResult.instructions.length;
          
          // Update final stitch count based on sleeve cap shaping
          if (sleeveCapResult.summary?.finalStitchCount) {
            currentStitchCount = sleeveCapResult.summary.finalStitchCount;
          }
        } else if (sleeveCapResult.error) {
          // Add sleeve cap generation error as warning
          return {
            success: false,
            error: `Sleeve cap instruction generation failed: ${sleeveCapResult.error}`,
            warnings: [`Failed to generate sleeve cap instructions: ${sleeveCapResult.error}`]
          };
        }
      }

      return {
        success: true,
        instructions,
        totalRows: this.calculateTotalRows(instructions),
        summary: {
          totalInstructions: instructions.length,
          totalRows: this.calculateTotalRows(instructions),
          finalStitchCount: currentStitchCount
        }
      };

    } catch (error) {
      console.error('Error generating detailed instructions:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during instruction generation'
      };
    }
  }

  /**
   * Generates raglan top-down instructions (US_12.2)
   * @param raglanCalculations - Raglan calculations from US_12.1
   * @param context - Generation context
   * @param config - Configuration
   * @returns Raglan instruction generation result
   */
  public generateRaglanInstructions(
    raglanCalculations: RaglanTopDownCalculations,
    context: InstructionGenerationContext,
    config?: Partial<InstructionGenerationConfig>
  ): RaglanInstructionGenerationResult {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };
      
      // Extract raglan increase method preference from context metadata
      const increaseMethod = context.metadata?.raglanIncreaseMethod as any || 
                            DEFAULT_RAGLAN_INCREASE_METHODS[context.craftType];

      const raglanContext: RaglanInstructionContext = {
        craftType: context.craftType,
        raglanCalculations,
        increaseMethod,
        componentKey: context.componentKey,
        componentDisplayName: context.componentDisplayName,
        config: finalConfig
      };

      return generateRaglanTopDownInstructions(raglanContext);

    } catch (error) {
      console.error('Error generating raglan instructions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during raglan instruction generation'
      };
    }
  }

  /**
   * Generates hammer sleeve instructions (US_12.4)
   * @param hammerSleeveCalculations - Hammer sleeve calculations from US_12.3
   * @param context - Generation context
   * @param config - Configuration
   * @returns Hammer sleeve instruction generation result
   */
  public generateHammerSleeveInstructions(
    hammerSleeveCalculations: HammerSleeveCalculations,
    context: InstructionGenerationContext,
    config?: Partial<InstructionGenerationConfig>
  ): HammerSleeveInstructionResult {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };

      const hammerSleeveContext: HammerSleeveInstructionContext = {
        craftType: context.craftType,
        hammerSleeveCalculations,
        componentKey: context.componentKey,
        componentDisplayName: context.componentDisplayName,
        config: finalConfig,
        sleeveShapingSchedule: context.shapingSchedule // Pass tapered sleeve shaping if available
      };

      return generateHammerSleeveInstructions(hammerSleeveContext);

    } catch (error) {
      console.error('Error generating hammer sleeve instructions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during hammer sleeve instruction generation'
      };
    }
  }

  /**
   * Helper method to map raglan step types to the format expected by DetailedInstruction
   */
  private mapRaglanStepType(raglanType: any): any {
    const mapping: Record<string, string> = {
      'raglan_cast_on': 'cast_on_setup',
      'raglan_marker_placement': 'marker_placement',
      'raglan_increase_round': 'increase_round',
      'raglan_plain_round': 'plain_round',
      'raglan_separation': 'sleeve_separation'
    };
    return mapping[raglanType] || raglanType;
  }

  /**
   * Generates detailed instructions with stitch pattern integration (US_8.3)
   * @param context - Generation context including stitch pattern data
   * @param shapingSchedule - Optional shaping schedule
   * @param stitchPattern - Stitch pattern data from database
   * @param integrationData - Stitch pattern integration data from US_8.2
   * @param config - Optional configuration overrides
   * @returns Generated instructions with success status
   */
  async generateInstructionsWithStitchPattern(
    context: InstructionGenerationContext,
    shapingSchedule: ShapingSchedule | undefined,
    stitchPattern: StitchPattern,
    integrationData: ComponentStitchPatternIntegrationData,
    config?: Partial<InstructionGenerationConfig>
  ): Promise<InstructionGenerationResult> {
    const finalConfig = { ...this.defaultConfig, ...config };

    try {
      // Validate stitch pattern compatibility
      const validation = validateStitchPatternCompatibility(stitchPattern, integrationData);
      if (!validation.isValid) {
        return {
          success: false,
          instructions: [],
          errors: validation.errors,
          warnings: validation.warnings
        };
      }

      // Create stitch pattern instruction context
      const stitchPatternContext = createStitchPatternContext(stitchPattern, integrationData);

      // Generate instructions
      const instructions: DetailedInstruction[] = [];
      const warnings: string[] = [...validation.warnings];
      let stepNumber = 1;

      // Step 1: Cast On with stitch pattern integration
      const castOnInstruction = generateStitchPatternCastOnInstruction(
        stitchPatternContext,
        integrationData,
        context.craftType
      );

      instructions.push({
        step: stepNumber++,
        type: 'setup_row',
        text: castOnInstruction,
        stitchCount: integrationData.adjustedComponentStitchCount
      });

      // Generate body instructions with pattern integration
      const bodyInstructions = await this.generateStitchPatternBodyInstructions(
        context,
        stitchPatternContext,
        shapingSchedule,
        finalConfig,
        stepNumber
      );

      instructions.push(...bodyInstructions.instructions);
      stepNumber += bodyInstructions.instructions.length;
      warnings.push(...bodyInstructions.warnings);

      // Step Final: Bind Off
      instructions.push({
        step: stepNumber++,
        type: 'finishing',
        text: context.craftType === 'knitting' ? 'Bind off all stitches.' : 'Fasten off.',
        stitchCount: bodyInstructions.finalStitchCount
      });

      return {
        success: true,
        instructions,
        warnings: warnings.length > 0 ? warnings : undefined,
        totalRows: this.calculateTotalRows(instructions)
      };

    } catch (error) {
      return {
        success: false,
        instructions: [],
        errors: [`Failed to generate instructions with stitch pattern: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Processes shaping schedule and generates corresponding instructions
   */
  private processShapingSchedule(
    shapingSchedule: ShapingSchedule,
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    startStep: number,
    startStitchCount: number
  ): { instructions: DetailedInstruction[], nextStep: number, finalStitchCount: number } {
    const instructions: DetailedInstruction[] = [];
    let currentStep = startStep;
    let currentStitchCount = startStitchCount;
    let currentRowInSection = 1;

    for (const shapingEvent of shapingSchedule.shapingEvents) {
      const eventInstructions = this.processShapingEvent(
        shapingEvent,
        context,
        config,
        currentStep,
        currentStitchCount,
        currentRowInSection
      );

      instructions.push(...eventInstructions.instructions);
      currentStep = eventInstructions.nextStep;
      currentStitchCount = eventInstructions.finalStitchCount;
      currentRowInSection = eventInstructions.nextRowInSection;
    }

    return {
      instructions,
      nextStep: currentStep,
      finalStitchCount: currentStitchCount
    };
  }

  /**
   * Processes a single shaping event
   */
  private processShapingEvent(
    shapingEvent: ShapingEvent,
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    startStep: number,
    startStitchCount: number,
    startRowInSection: number
  ): { instructions: DetailedInstruction[], nextStep: number, finalStitchCount: number, nextRowInSection: number } {
    const instructions: DetailedInstruction[] = [];
    let currentStep = startStep;
    let currentStitchCount = startStitchCount;
    let currentRowInSection = startRowInSection;

    // Process each shaping instruction from the detailed breakdown
    for (let i = 0; i < shapingEvent.detailedBreakdown.length; i++) {
      const detail = shapingEvent.detailedBreakdown[i];
      
      // Add plain rows before shaping if needed
      if (detail.actionRowOffset > 1) {
        const plainRowCount = detail.actionRowOffset - 1;
        instructions.push({
          step: currentStep++,
          type: 'plain_segment',
          text: this.generatePlainRowText(context.craftType, plainRowCount, config),
          metadata: {
            isRightSide: this.isRightSideRow(currentRowInSection)
          }
        });
        currentRowInSection += plainRowCount;
      }

      // Add shaping row
      const stitchChange = shapingEvent.type === 'decrease' ? -shapingEvent.stitchesPerEvent : shapingEvent.stitchesPerEvent;
      const newStitchCount = currentStitchCount + stitchChange;

      instructions.push({
        step: currentStep++,
        row_number_in_section: currentRowInSection,
        type: 'shaping_row',
        text: this.generateShapingRowText(
          context.craftType,
          shapingEvent.type,
          currentRowInSection,
          newStitchCount,
          config
        ),
        stitchCount: config.includeStitchCounts ? newStitchCount : undefined,
        metadata: {
          isRightSide: this.isRightSideRow(currentRowInSection),
          stitchesChanged: Math.abs(stitchChange),
          shapingType: shapingEvent.type
        }
      });

      currentStitchCount = newStitchCount;
      currentRowInSection++;
    }

    return {
      instructions,
      nextStep: currentStep,
      finalStitchCount: currentStitchCount,
      nextRowInSection: currentRowInSection
    };
  }

  /**
   * Generates cast-on instruction
   */
  private generateCastOnInstruction(
    craftType: 'knitting' | 'crochet',
    stitchCount: number,
    config: InstructionGenerationConfig
  ): string {
    if (craftType === 'knitting') {
      return `Cast on ${stitchCount} stitches.`;
    } else {
      return `Chain ${stitchCount + 1}. Single crochet in 2nd chain from hook and in each chain across. (${stitchCount} sc)`;
    }
  }

  /**
   * Generates cast-off instruction
   */
  private generateCastOffInstruction(
    craftType: 'knitting' | 'crochet',
    stitchCount: number,
    config: InstructionGenerationConfig
  ): string {
    if (craftType === 'knitting') {
      return `Cast off all ${stitchCount} stitches.`;
    } else {
      return `Fasten off.`;
    }
  }

  /**
   * Generates plain row instruction text
   */
  private generatePlainRowText(
    craftType: 'knitting' | 'crochet',
    rowCount: number,
    config: InstructionGenerationConfig
  ): string {
    const patternName = craftType === 'knitting' ? 'Stockinette Stitch' : 'Single Crochet';
    
    if (rowCount === 1) {
      return `Continue in ${patternName}, work 1 row plain.`;
    } else {
      return `Continue in ${patternName}, work ${rowCount} rows plain.`;
    }
  }

  /**
   * Generates shaping row instruction text
   */
  private generateShapingRowText(
    craftType: 'knitting' | 'crochet',
    shapingType: 'increase' | 'decrease',
    rowNumber: number,
    finalStitchCount: number,
    config: InstructionGenerationConfig
  ): string {
    const isRightSide = this.isRightSideRow(rowNumber);
    const sideIndicator = isRightSide ? 'RS' : 'WS';
    
    let instruction: string;
    
    if (craftType === 'knitting') {
      if (shapingType === 'decrease') {
        instruction = `Row ${rowNumber} (${sideIndicator} - Decrease Row): K1, k2tog, knit to last 3 sts, ssk, k1.`;
      } else {
        instruction = `Row ${rowNumber} (${sideIndicator} - Increase Row): K1, M1L, knit to last st, M1R, k1.`;
      }
    } else {
      if (shapingType === 'decrease') {
        instruction = `Row ${rowNumber} (Decrease Row): Sc1, sc2tog, sc across to last 3 sts, sc2tog, sc1.`;
      } else {
        instruction = `Row ${rowNumber} (Increase Row): Sc1, 2 sc in next st, sc across to last st, 2 sc in last st.`;
      }
    }

    if (config.includeStitchCounts) {
      instruction += ` (${finalStitchCount} sts)`;
    }

    return instruction;
  }

  /**
   * Generates basic plain instructions when no shaping is required
   */
  private generatePlainInstructions(
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    startStep: number,
    stitchCount: number
  ): DetailedInstruction[] {
    const instructions: DetailedInstruction[] = [];
    const patternName = context.craftType === 'knitting' ? 'Stockinette Stitch' : 'Single Crochet';
    
    // Estimate rows needed (this would typically come from the component calculation)
    const estimatedRows = Math.max(10, Math.floor(stitchCount / 4));
    
    instructions.push({
      step: startStep,
      type: 'plain_segment',
      text: `Continue in ${patternName} for approximately ${estimatedRows} rows or to desired length.`,
      stitchCount: stitchCount
    });

    return instructions;
  }

  /**
   * Determines if a row number is a right side row (assumes RS on odd rows)
   */
  private isRightSideRow(rowNumber: number): boolean {
    return rowNumber % 2 === 1;
  }

  /**
   * Calculates total rows covered by instructions
   */
  private calculateTotalRows(instructions: DetailedInstruction[]): number {
    return instructions.reduce((total, instruction) => {
      if (instruction.type === 'shaping_row' || instruction.type === 'setup_row') {
        return total + 1;
      } else if (instruction.type === 'plain_segment') {
        // Extract row count from instruction text (basic parsing)
        const match = instruction.text.match(/work (\d+) rows?/);
        return total + (match ? parseInt(match[1]) : 0);
      }
      return total;
    }, 0);
  }

  /**
   * Generates body instructions with stitch pattern integration (US_8.3)
   */
  private async generateStitchPatternBodyInstructions(
    context: InstructionGenerationContext,
    stitchPatternContext: StitchPatternInstructionContext,
    shapingSchedule: ShapingSchedule | undefined,
    config: InstructionGenerationConfig,
    startStep: number
  ): Promise<{
    instructions: DetailedInstruction[];
    warnings: string[];
    finalStitchCount: number;
  }> {
    const instructions: DetailedInstruction[] = [];
    const warnings: string[] = [];
    
    let currentStitchCount = context.startingStitchCount;
    let currentPatternRowIndex = stitchPatternContext.currentPatternRowIndex;
    let stepNumber = startStep;
    let overallRowNumber = 1;

    // Calculate total rows needed
    const totalRows = context.totalRows || 20; // Default if not specified

    // Build a simplified shaping schedule - distribute shaping events across total rows
    const shapingRowMap = new Map<number, ShapingEvent>();
    if (shapingSchedule?.hasShaping && shapingSchedule.shapingEvents.length > 0) {
      // For simplicity, distribute shaping events evenly across the total rows
      // This is a simplified approach - more sophisticated scheduling would be needed for production
      const firstShapingEvent = shapingSchedule.shapingEvents[0];
      if (firstShapingEvent.numShapingEvents > 0) {
        const interval = Math.floor(totalRows / firstShapingEvent.numShapingEvents);
        for (let i = 0; i < firstShapingEvent.numShapingEvents; i++) {
          const shapingRow = (i + 1) * interval;
          if (shapingRow <= totalRows) {
            shapingRowMap.set(shapingRow, {
              ...firstShapingEvent,
              totalStitchesToChange: firstShapingEvent.stitchesPerEvent
            });
          }
        }
      }
    }

    // Process each row
    for (let row = 1; row <= totalRows; row++) {
      // Check if this row has shaping
      const shapingEvent = shapingRowMap.get(row);

      // Update stitch pattern context with current row index
      const contextWithCurrentRow = {
        ...stitchPatternContext,
        currentPatternRowIndex: currentPatternRowIndex
      };

      // Generate row instruction
      const rowInstruction = generateStitchPatternRowInstruction(
        contextWithCurrentRow,
        overallRowNumber,
        currentStitchCount,
        context.craftType,
        shapingEvent
      );

      // Update stitch count if shaping occurred
      if (shapingEvent) {
        const stitchChange = shapingEvent.type === 'decrease' 
          ? -shapingEvent.totalStitchesToChange 
          : shapingEvent.totalStitchesToChange;
        currentStitchCount += stitchChange;
      }

      // Add instruction
      instructions.push({
        step: stepNumber++,
        row_number_in_section: overallRowNumber,
        type: rowInstruction.isShapingRow ? 'shaping_row' : 'pattern_row',
        text: rowInstruction.instruction,
        stitchCount: currentStitchCount,
        metadata: {
          isRightSide: this.isRightSideRow(overallRowNumber),
          stitchesChanged: shapingEvent ? (shapingEvent.type === 'decrease' ? -shapingEvent.totalStitchesToChange : shapingEvent.totalStitchesToChange) : 0,
          shapingType: shapingEvent?.type,
          stitchPatternRowIndex: currentPatternRowIndex
        }
      });

      // Update pattern row index for next iteration
      currentPatternRowIndex = rowInstruction.nextPatternRowIndex;
      overallRowNumber++;
    }

    return {
      instructions,
      warnings,
      finalStitchCount: currentStitchCount
    };
  }

  /**
   * Generates detailed instructions for neckline shaping (US_11.2)
   * @param necklineSchedule - Neckline shaping schedule from US_11.1
   * @param context - Instruction generation context
   * @param config - Configuration options
   * @returns Array of detailed instructions for neckline shaping
   */
  public generateNecklineInstructions(
    necklineSchedule: NecklineShapingSchedule,
    context: InstructionGenerationContext,
    config?: Partial<InstructionGenerationConfig>
  ): InstructionGenerationResult {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };
      const instructions: DetailedInstruction[] = [];
      let currentStep = 1;

      // Generate center bind-off instruction if applicable (FR3)
      if (necklineSchedule.center_bind_off_stitches && necklineSchedule.center_bind_off_stitches > 0) {
        const centerInstruction = this.generateCenterDivisionStep(
          necklineSchedule,
          context,
          finalConfig,
          currentStep
        );
        instructions.push(centerInstruction);
        currentStep++;
      }

      // Generate shaping instructions for both sides (FR2, FR4)
      const leftSideInstructions = this.generateSideShapingSteps(
        necklineSchedule.sides.left,
        'left_front',
        necklineSchedule,
        context,
        finalConfig,
        currentStep
      );
      
      const rightSideInstructions = this.generateSideShapingSteps(
        necklineSchedule.sides.right,
        'right_front',
        necklineSchedule,
        context,
        finalConfig,
        currentStep + leftSideInstructions.length
      );

      instructions.push(...leftSideInstructions);
      instructions.push(...rightSideInstructions);

      return {
        success: true,
        instructions,
        summary: {
          totalInstructions: instructions.length,
          totalRows: necklineSchedule.total_rows_for_shaping,
          finalStitchCount: necklineSchedule.final_shoulder_stitches_each_side * 2
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to generate neckline instructions: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generates the center division step (FR3)
   * @param schedule - Neckline shaping schedule
   * @param context - Generation context
   * @param config - Configuration
   * @param stepNumber - Current step number
   * @returns Center division instruction
   */
  private generateCenterDivisionStep(
    schedule: NecklineShapingSchedule,
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    stepNumber: number
  ): DetailedInstruction {
    const centerStitches = schedule.center_bind_off_stitches || 0;
    const totalStitches = context.startingStitchCount;
    const stitchesBeforeCenter = Math.floor((totalStitches - centerStitches) / 2);
    const stitchesAfterCenter = totalStitches - centerStitches - stitchesBeforeCenter;

    const instructionText = generateCenterBindOffInstruction(
      centerStitches,
      stitchesBeforeCenter,
      stitchesAfterCenter,
      1, // Assuming neckline shaping starts on row 1
      context.craftType,
      config
    );

    return {
      step: stepNumber,
      type: 'neckline_center_divide',
      text: instructionText,
      stitchCount: stitchesAfterCenter, // Focusing on left side initially
      metadata: {
        isRightSide: true, // Assuming we start on RS
        neckline: {
          for_side: 'center',
          step_type: 'center_bind_off',
          neckline_step: 1,
          stitches_remaining_on_side: stitchesAfterCenter
        }
      }
    };
  }

  /**
   * Generates shaping steps for one side of the neckline (FR4)
   * @param sideActions - Actions for this side
   * @param side - Which side (left/right)
   * @param schedule - Complete neckline schedule
   * @param context - Generation context
   * @param config - Configuration
   * @param startStepNumber - Starting step number
   * @returns Array of instructions for this side
   */
  private generateSideShapingSteps(
    sideActions: NecklineShapingAction[],
    side: 'left_front' | 'right_front',
    schedule: NecklineShapingSchedule,
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    startStepNumber: number
  ): DetailedInstruction[] {
    const instructions: DetailedInstruction[] = [];
    let currentStepNumber = startStepNumber;
    let necklineStepNumber = 1;
    
    // Calculate starting stitches for this side
    const centerStitches = schedule.center_bind_off_stitches || 0;
    const totalStitches = context.startingStitchCount;
    let currentStitchCount = Math.floor((totalStitches - centerStitches) / 2);

    // Track current row for determining RS/WS
    let currentRowOffset = 1; // Starting after center bind-off

    for (const action of sideActions) {
      // Handle repeated actions (FR4)
      if (action.repeats && action.repeats > 1) {
        // Generate first occurrence
        const firstInstruction = this.generateSingleShapingInstruction(
          action,
          side,
          currentStitchCount,
          currentRowOffset,
          context,
          config,
          currentStepNumber,
          necklineStepNumber
        );
        instructions.push(firstInstruction);
        currentStitchCount = calculateStitchesAfterAction(currentStitchCount, action);
        currentStepNumber++;
        necklineStepNumber++;

        // Generate repeat instruction
        const repeatText = generateRepeatInstructionText(action, side, context.craftType, config);
        if (repeatText) {
          instructions.push({
            step: currentStepNumber,
            type: 'neckline_shaping',
            text: repeatText,
            stitchCount: currentStitchCount - (action.stitches * (action.repeats - 1)),
            metadata: {
              neckline: {
                for_side: side,
                step_type: 'side_shaping',
                neckline_step: necklineStepNumber,
                stitches_remaining_on_side: currentStitchCount - (action.stitches * (action.repeats - 1))
              }
            }
          });
          currentStepNumber++;
          necklineStepNumber++;
          currentStitchCount -= action.stitches * (action.repeats - 1);
        }

        // Update row offset for frequency
        if (action.every_x_rows) {
          currentRowOffset += action.every_x_rows * action.repeats;
        }
      } else {
        // Single action
        const instruction = this.generateSingleShapingInstruction(
          action,
          side,
          currentStitchCount,
          currentRowOffset,
          context,
          config,
          currentStepNumber,
          necklineStepNumber
        );
        instructions.push(instruction);
        currentStitchCount = calculateStitchesAfterAction(currentStitchCount, action);
        currentStepNumber++;
        necklineStepNumber++;
        currentRowOffset += action.every_x_rows || 1;
      }

      // Add plain row instruction between shaping actions if needed
      if (action.every_x_rows && action.every_x_rows > 1) {
        const plainInstruction = this.generateNecklinePlainRowsBetweenShaping(
          side,
          action.every_x_rows - 1,
          currentRowOffset - action.every_x_rows + 1,
          context,
          config,
          currentStepNumber,
          necklineStepNumber
        );
        if (plainInstruction) {
          instructions.push(plainInstruction);
          currentStepNumber++;
          necklineStepNumber++;
        }
      }
    }

    return instructions;
  }

  /**
   * Generates a single shaping instruction
   * @param action - Shaping action
   * @param side - Which side
   * @param currentStitchCount - Current stitch count
   * @param rowOffset - Row offset from start
   * @param context - Generation context
   * @param config - Configuration
   * @param stepNumber - Step number
   * @param necklineStepNumber - Neckline step number
   * @returns Single shaping instruction
   */
  private generateSingleShapingInstruction(
    action: NecklineShapingAction,
    side: 'left_front' | 'right_front',
    currentStitchCount: number,
    rowOffset: number,
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    stepNumber: number,
    necklineStepNumber: number
  ): DetailedInstruction {
    const stitchesAfterAction = calculateStitchesAfterAction(currentStitchCount, action);
    const isRightSide = determineRowSide(rowOffset);

    // Update action with calculated row side
    const actionWithSide: NecklineShapingAction = {
      ...action,
      side_of_fabric: isRightSide ? 'RS' : 'WS'
    };

    const instructionText = generateNecklineShapingInstruction(
      actionWithSide,
      side,
      rowOffset + 1, // Convert to 1-based row numbering
      stitchesAfterAction,
      context.craftType,
      config
    );

    return {
      step: stepNumber,
      type: 'neckline_shaping',
      text: instructionText,
      stitchCount: stitchesAfterAction,
      metadata: {
        isRightSide,
        stitchesChanged: -action.stitches, // Negative for decreases/bind-offs
        shapingType: 'decrease',
        neckline: {
          for_side: side,
          step_type: 'side_shaping',
          neckline_step: necklineStepNumber,
          stitches_remaining_on_side: stitchesAfterAction
        }
      }
    };
  }

  /**
   * Generates plain row instructions between shaping actions
   * @param side - Which side
   * @param rowCount - Number of plain rows
   * @param startRowOffset - Starting row offset
   * @param context - Generation context
   * @param config - Configuration
   * @param stepNumber - Step number
   * @param necklineStepNumber - Neckline step number
   * @returns Plain row instruction or null if no instruction needed
   */
  private generateNecklinePlainRowsBetweenShaping(
    side: 'left_front' | 'right_front',
    rowCount: number,
    startRowOffset: number,
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    stepNumber: number,
    necklineStepNumber: number
  ): DetailedInstruction | null {
    if (rowCount <= 0) {
      return null;
    }

    const isRightSide = determineRowSide(startRowOffset);
    const instructionText = generateNecklinePlainRowInstruction(
      side,
      isRightSide,
      context.craftType,
      config
    );

    return {
      step: stepNumber,
      type: 'neckline_side_work',
      text: rowCount === 1 
        ? instructionText 
        : `${instructionText} Repeat for ${rowCount} rows.`,
      metadata: {
        isRightSide,
        neckline: {
          for_side: side,
          step_type: 'side_completion',
          neckline_step: necklineStepNumber
        }
      }
    };
  }

  /**
   * Generates detailed instructions for armhole shaping (US_11.4)
   * @param armholeSchedule - Armhole shaping schedule from US_11.3
   * @param context - Instruction generation context
   * @param config - Configuration options
   * @returns Array of detailed instructions for armhole shaping
   */
  public generateArmholeInstructions(
    armholeSchedule: ArmholeShapingSchedule,
    context: InstructionGenerationContext,
    config?: Partial<InstructionGenerationConfig>
  ): InstructionGenerationResult {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };
      const instructions: DetailedInstruction[] = [];
      let currentStep = 1;
      let currentStitchCount = context.startingStitchCount;
      let currentRowOffset = 1; // Start at row 1 of armhole shaping

      // Generate base bind-off instruction(s) if applicable (FR2)
      if (armholeSchedule.base_bind_off_stitches > 0) {
        const baseBindOffInstructions = this.generateArmholeBaseBindOffSteps(
          armholeSchedule,
          context,
          finalConfig,
          currentStep,
          currentRowOffset
        );
        
        instructions.push(...baseBindOffInstructions);
        currentStep += baseBindOffInstructions.length;
        currentRowOffset += baseBindOffInstructions.length;
        
        // Update stitch count after base bind-off
        // Base bind-off removes stitches from both sides
        currentStitchCount -= armholeSchedule.base_bind_off_stitches * 2;
      }

      // Generate shaping instructions for decreases (FR3)
      const shapingInstructions = this.generateArmholeShapingSteps(
        armholeSchedule.shaping_details,
        armholeSchedule.type,
        context,
        finalConfig,
        currentStep,
        currentRowOffset,
        currentStitchCount
      );

      instructions.push(...shapingInstructions);

      return {
        success: true,
        instructions,
        summary: {
          totalInstructions: instructions.length,
          totalRows: armholeSchedule.total_rows_for_shaping,
          finalStitchCount: armholeSchedule.final_stitches_at_shoulder_edge
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to generate armhole instructions: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generates detailed instructions for sleeve cap shaping (US_11.4 - FR5)
   * @param sleeveCapSchedule - Sleeve cap shaping schedule
   * @param context - Instruction generation context
   * @param config - Configuration options
   * @returns Array of detailed instructions for sleeve cap shaping
   */
  public generateSleeveCapInstructions(
    sleeveCapSchedule: SleeveCapShapingSchedule,
    context: InstructionGenerationContext,
    config?: Partial<InstructionGenerationConfig>
  ): InstructionGenerationResult {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };
      const instructions: DetailedInstruction[] = [];
      let currentStep = 1;
      let currentStitchCount = sleeveCapSchedule.initial_stitches;
      let currentRowOffset = 1;

      // Generate sleeve cap shaping instructions
      const shapingInstructions = this.generateSleeveCapShapingSteps(
        sleeveCapSchedule.cap_shaping_details,
        context,
        finalConfig,
        currentStep,
        currentRowOffset,
        currentStitchCount
      );

      instructions.push(...shapingInstructions);

      return {
        success: true,
        instructions,
        summary: {
          totalInstructions: instructions.length,
          totalRows: sleeveCapSchedule.total_cap_rows,
          finalStitchCount: sleeveCapSchedule.final_cap_stitches
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to generate sleeve cap instructions: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generate base bind-off steps for armhole shaping
   * @private
   */
  private generateArmholeBaseBindOffSteps(
    armholeSchedule: ArmholeShapingSchedule,
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    startStepNumber: number,
    startRowOffset: number
  ): DetailedInstruction[] {
    const instructions: DetailedInstruction[] = [];
    const bindOffStitches = armholeSchedule.base_bind_off_stitches;

    // First bind-off row (typically RS)
    const firstInstruction = generateArmholeBaseBindOffInstruction(
      bindOffStitches,
      startRowOffset,
      context.craftType,
      config
    );

    instructions.push({
      step: startStepNumber,
      row_number_in_section: startRowOffset,
      type: 'armhole_base_bind_off',
      text: firstInstruction,
      stitchCount: context.startingStitchCount - (bindOffStitches * 2),
      metadata: {
        isRightSide: determineArmholeRowSide(startRowOffset),
        stitchesChanged: -(bindOffStitches * 2),
        shapingType: 'decrease',
        armhole: {
          for_side: 'both_armholes',
          step_type: 'base_bind_off',
          armhole_step: 1,
          stitches_remaining: context.startingStitchCount - (bindOffStitches * 2)
        }
      }
    });

    return instructions;
  }

  /**
   * Generate shaping steps for armhole decreases
   * @private
   */
  private generateArmholeShapingSteps(
    shapingDetails: ArmholeShapingAction[],
    armholeType: 'rounded_set_in' | 'raglan',
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    startStepNumber: number,
    startRowOffset: number,
    startStitchCount: number
  ): DetailedInstruction[] {
    const instructions: DetailedInstruction[] = [];
    let currentStepNumber = startStepNumber;
    let currentRowOffset = startRowOffset;
    let currentStitchCount = startStitchCount;
    let armholeStepNumber = 1;

    for (const action of shapingDetails) {
      // Handle repeated actions (FR3)
      if (action.repeats && action.repeats > 1) {
        // Generate first occurrence
        const firstInstruction = this.generateSingleArmholeShapingInstruction(
          action,
          armholeType,
          currentStitchCount,
          currentRowOffset,
          context,
          config,
          currentStepNumber,
          armholeStepNumber
        );
        instructions.push(firstInstruction);
        currentStitchCount = calculateStitchesAfterArmholeAction(currentStitchCount, action);
        currentStepNumber++;
        armholeStepNumber++;

        // Generate repeat instruction
        const repeatText = generateArmholeRepeatInstructionText(action, context.craftType, config);
        if (repeatText) {
          instructions.push({
            step: currentStepNumber,
            type: 'armhole_shaping',
            text: repeatText,
            stitchCount: currentStitchCount - (action.stitches * (action.repeats - 1) * 2), // Both sides
            metadata: {
              armhole: {
                for_side: 'both_armholes',
                step_type: armholeType === 'raglan' ? 'raglan_line_shaping' : 'decrease_shaping',
                armhole_step: armholeStepNumber,
                stitches_remaining: currentStitchCount - (action.stitches * (action.repeats - 1) * 2)
              }
            }
          });
          currentStepNumber++;
          armholeStepNumber++;
          currentStitchCount -= action.stitches * (action.repeats - 1) * 2; // Subtract remaining repeats
        }

        // Update row offset for frequency
        if (action.every_x_rows) {
          currentRowOffset += action.every_x_rows * action.repeats;
        }

      } else {
        // Single action
        const instruction = this.generateSingleArmholeShapingInstruction(
          action,
          armholeType,
          currentStitchCount,
          currentRowOffset,
          context,
          config,
          currentStepNumber,
          armholeStepNumber
        );
        instructions.push(instruction);
        currentStitchCount = calculateStitchesAfterArmholeAction(currentStitchCount, action);
        currentStepNumber++;
        armholeStepNumber++;

        // Update row offset
        if (action.every_x_rows) {
          currentRowOffset += action.every_x_rows;
        } else {
          currentRowOffset++;
        }
      }

      // Add plain rows between shaping if needed
      const plainRowsNeeded = action.every_x_rows ? action.every_x_rows - 1 : 0;
      if (plainRowsNeeded > 0) {
        const plainRowInstruction = this.generateArmholePlainRowsBetweenShaping(
          plainRowsNeeded,
          currentRowOffset,
          context,
          config,
          currentStepNumber,
          armholeStepNumber
        );
        if (plainRowInstruction) {
          instructions.push(plainRowInstruction);
          currentStepNumber++;
          armholeStepNumber++;
        }
      }
    }

    return instructions;
  }

  /**
   * Generate shaping steps for sleeve cap
   * @private
   */
  private generateSleeveCapShapingSteps(
    shapingDetails: ArmholeShapingAction[],
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    startStepNumber: number,
    startRowOffset: number,
    startStitchCount: number
  ): DetailedInstruction[] {
    const instructions: DetailedInstruction[] = [];
    let currentStepNumber = startStepNumber;
    let currentRowOffset = startRowOffset;
    let currentStitchCount = startStitchCount;
    let sleeveCapStepNumber = 1;

    for (const action of shapingDetails) {
      // Generate sleeve cap instruction based on action type
      let instruction: DetailedInstruction;

      if (action.action === 'increase') {
        const instructionText = generateSleeveCapIncreaseInstruction(
          action,
          currentRowOffset,
          currentStitchCount + (action.stitches * 2), // Both sides
          context.craftType,
          config
        );

        instruction = {
          step: currentStepNumber,
          row_number_in_section: currentRowOffset,
          type: 'sleeve_cap_shaping',
          text: instructionText,
          stitchCount: currentStitchCount + (action.stitches * 2),
          metadata: {
            isRightSide: determineArmholeRowSide(currentRowOffset),
            stitchesChanged: action.stitches * 2,
            shapingType: 'increase',
            armhole: {
              for_side: 'both_armholes',
              step_type: 'sleeve_cap_increases',
              armhole_step: sleeveCapStepNumber,
              stitches_remaining: currentStitchCount + (action.stitches * 2)
            }
          }
        };
      } else {
        const instructionText = generateSleeveCapDecreaseInstruction(
          action,
          currentRowOffset,
          currentStitchCount - (action.stitches * 2), // Both sides
          context.craftType,
          config
        );

        instruction = {
          step: currentStepNumber,
          row_number_in_section: currentRowOffset,
          type: 'sleeve_cap_shaping',
          text: instructionText,
          stitchCount: currentStitchCount - (action.stitches * 2),
          metadata: {
            isRightSide: determineArmholeRowSide(currentRowOffset),
            stitchesChanged: -(action.stitches * 2),
            shapingType: 'decrease',
            armhole: {
              for_side: 'both_armholes',
              step_type: 'sleeve_cap_decreases',
              armhole_step: sleeveCapStepNumber,
              stitches_remaining: currentStitchCount - (action.stitches * 2)
            }
          }
        };
      }

      instructions.push(instruction);
      currentStitchCount = calculateStitchesAfterArmholeAction(currentStitchCount, action);
      currentStepNumber++;
      sleeveCapStepNumber++;

      // Update row offset
      if (action.every_x_rows) {
        currentRowOffset += action.every_x_rows;
      } else {
        currentRowOffset++;
      }
    }

    return instructions;
  }

  /**
   * Generate single armhole shaping instruction
   * @private
   */
  private generateSingleArmholeShapingInstruction(
    action: ArmholeShapingAction,
    armholeType: 'rounded_set_in' | 'raglan',
    currentStitchCount: number,
    currentRowOffset: number,
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    stepNumber: number,
    armholeStepNumber: number
  ): DetailedInstruction {
    const stitchesAfterAction = calculateStitchesAfterArmholeAction(currentStitchCount, action);

    let instructionText: string;
    let instructionType: 'armhole_shaping' | 'armhole_raglan_shaping';
    let stepType: 'decrease_shaping' | 'raglan_line_shaping';

    if (armholeType === 'raglan') {
      instructionText = generateRaglanShapingInstruction(
        action,
        currentRowOffset,
        stitchesAfterAction,
        context.craftType,
        config
      );
      instructionType = 'armhole_raglan_shaping';
      stepType = 'raglan_line_shaping';
    } else {
      instructionText = generateArmholeShapingInstruction(
        action,
        currentRowOffset,
        stitchesAfterAction,
        context.craftType,
        config
      );
      instructionType = 'armhole_shaping';
      stepType = 'decrease_shaping';
    }

    return {
      step: stepNumber,
      row_number_in_section: currentRowOffset,
      type: instructionType,
      text: instructionText,
      stitchCount: stitchesAfterAction,
      metadata: {
        isRightSide: determineArmholeRowSide(currentRowOffset),
        stitchesChanged: action.action === 'decrease' ? -(action.stitches * 2) : (action.stitches * 2),
        shapingType: action.action === 'decrease' ? 'decrease' : 'increase',
        armhole: {
          for_side: 'both_armholes',
          step_type: stepType,
          armhole_step: armholeStepNumber,
          stitches_remaining: stitchesAfterAction,
          raglan_marker_position: armholeType === 'raglan' ? 'both_sides' : undefined
        }
      }
    };
  }

  /**
   * Generate plain row instructions between armhole shaping actions
   * @private
   */
  private generateArmholePlainRowsBetweenShaping(
    rowCount: number,
    startRowOffset: number,
    context: InstructionGenerationContext,
    config: InstructionGenerationConfig,
    stepNumber: number,
    armholeStepNumber: number
  ): DetailedInstruction | null {
    if (rowCount <= 0) {
      return null;
    }

    const instructionText = generateArmholePlainRowInstruction(
      startRowOffset,
      context.craftType,
      config
    );

    return {
      step: stepNumber,
      type: 'plain_segment',
      text: rowCount === 1 
        ? instructionText 
        : `${instructionText} Repeat for ${rowCount} rows.`,
      metadata: {
        isRightSide: determineArmholeRowSide(startRowOffset),
        armhole: {
          for_side: 'both_armholes',
          step_type: 'decrease_shaping',
          armhole_step: armholeStepNumber
        }
      }
    };
  }

  /**
   * Generates triangular shawl instructions (US_12.6)
   * @param triangularShawlCalculations - Triangular shawl calculations from US_12.5
   * @param context - Generation context
   * @param config - Configuration
   * @returns Triangular shawl instruction generation result
   */
  public generateTriangularShawlInstructions(
    triangularShawlCalculations: import('@/types/triangular-shawl').TriangularShawlCalculations,
    context: InstructionGenerationContext,
    config?: Partial<InstructionGenerationConfig>
  ): TriangularShawlInstructionResult {
    try {
      const finalConfig = { ...this.defaultConfig, ...config };

      const triangularShawlContext: TriangularShawlInstructionContext = {
        craftType: context.craftType,
        triangularShawlCalculations,
        componentKey: context.componentKey,
        componentDisplayName: context.componentDisplayName,
        config: finalConfig
      };

      return generateTriangularShawlInstructions(triangularShawlContext);

    } catch (error) {
      console.error('Error generating triangular shawl instructions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during triangular shawl instruction generation'
      };
    }
  }
} 