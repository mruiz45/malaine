/**
 * Instruction Generator Service (US 7.3)
 * Generates detailed textual instructions for garment pieces with shaping
 * Extended for US_8.3: Stitch pattern integration
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

      // Add cast-on instruction
      instructions.push({
        step: currentStep++,
        type: 'cast_on',
        text: this.generateCastOnInstruction(context.craftType, context.startingStitchCount, finalConfig),
        stitchCount: currentStitchCount
      });

      // Process shaping if available
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
        // No shaping - generate basic instructions
        const plainInstructions = this.generatePlainInstructions(
          context,
          finalConfig,
          currentStep,
          currentStitchCount
        );
        
        instructions.push(...plainInstructions);
        currentStep += plainInstructions.length;
      }

      // Add cast-off instruction if different from starting count
      if (currentStitchCount !== context.startingStitchCount || !context.shapingSchedule?.hasShaping) {
        instructions.push({
          step: currentStep++,
          type: 'cast_off',
          text: this.generateCastOffInstruction(context.craftType, currentStitchCount, finalConfig),
          stitchCount: 0
        });
      }

      return {
        success: true,
        instructions,
        summary: {
          totalInstructions: instructions.length,
          totalRows: this.calculateTotalRows(instructions),
          finalStitchCount: currentStitchCount
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to generate instructions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        warnings: []
      };
    }
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
} 