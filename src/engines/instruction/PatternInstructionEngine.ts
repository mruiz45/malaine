/**
 * Pattern Instruction Engine (PD_PH6_US003)
 * Main orchestrator for generating textual knitting/crochet instructions from calculated pattern details
 */

import {
  PatternInstructionGenerationInput,
  PatternInstructionGenerationOptions,
  PatternInstructionGenerationResult,
  PatternInstructionsByPiece,
  PieceInstructions,
  RowByRowInstruction,
  RowInstructionType,
  PieceInstructionContext
} from '@/types/pattern-instruction-generation';
import { CalculatedPatternDetails, CalculatedPieceDetails, ShapingInstruction } from '@/types/core-pattern-calculation';
import { InstructionGeneratorService } from '@/services/instructionGeneratorService';
import { InstructionGenerationContext, DetailedInstruction } from '@/types/instruction-generation';
import { getStandardAbbreviations, applyAbbreviations, generateAbbreviationsGlossary } from '@/utils/knitting-abbreviations';
import {
  getInstructionTemplates,
  getTemplate,
  applyTemplate,
  generatePieceHeader,
  generateConstructionNotes,
  generateSectionHeader,
  determineRowSide,
  formatStitchCount
} from '@/utils/pattern-instruction-templates';

/**
 * Default options for instruction generation
 */
const DEFAULT_OPTIONS: Required<PatternInstructionGenerationOptions> = {
  includeStitchCounts: true,
  includeRowNumbers: true,
  useStandardAbbreviations: true,
  language: 'en',
  detailLevel: 'standard',
  includeShapingDetails: true,
  includeConstructionNotes: true
};

/**
 * Core Pattern Instruction Engine
 * Converts calculated pattern details into human-readable instructions
 */
export class PatternInstructionEngine {
  private instructionService: InstructionGeneratorService;

  constructor() {
    this.instructionService = new InstructionGeneratorService();
  }

  /**
   * Main method to generate pattern instructions
   */
  async generateInstructions(input: PatternInstructionGenerationInput): Promise<PatternInstructionGenerationResult> {
    try {
      // Validate input
      const validation = this.validateInput(input);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      const options = { ...DEFAULT_OPTIONS, ...input.options };
      const { calculatedPatternDetails } = input;
      
      // Get standard abbreviations for the craft type
      const abbreviations = getStandardAbbreviations(
        calculatedPatternDetails.patternInfo.craftType,
        options.language
      );

      // Generate instructions for each piece
      const instructionsByPiece: PatternInstructionsByPiece = {};
      const warnings: string[] = [];
      const piecesProcessed: string[] = [];

      for (const [pieceKey, pieceDetails] of Object.entries(calculatedPatternDetails.pieces)) {
        try {
          const pieceInstructions = await this.generatePieceInstructions(
            pieceKey,
            pieceDetails,
            calculatedPatternDetails.patternInfo.craftType,
            options,
            abbreviations
          );

          instructionsByPiece[pieceKey] = pieceInstructions;
          piecesProcessed.push(pieceKey);

          // Collect any warnings from piece generation
          if (pieceInstructions.constructionNotes) {
            warnings.push(...pieceInstructions.constructionNotes);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          warnings.push(`Failed to generate instructions for piece "${pieceKey}": ${errorMessage}`);
        }
      }

      // Generate pattern introduction
      const patternIntroduction = this.generatePatternIntroduction(calculatedPatternDetails, options);

      // Generate abbreviations glossary
      const abbreviationsGlossary = options.useStandardAbbreviations ? abbreviations : undefined;

      // Calculate total instruction count
      const totalInstructions = Object.values(instructionsByPiece)
        .reduce((sum, piece) => sum + piece.instructionSteps.length, 0);

      return {
        success: true,
        instructionsByPiece,
        patternIntroduction,
        abbreviationsGlossary,
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: {
          totalInstructions,
          piecesProcessed,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during instruction generation';
      return {
        success: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Generate instructions for a single piece
   */
  private async generatePieceInstructions(
    pieceKey: string,
    pieceDetails: CalculatedPieceDetails,
    craftType: 'knitting' | 'crochet',
    options: Required<PatternInstructionGenerationOptions>,
    abbreviations: any
  ): Promise<PieceInstructions> {
    
    // Create context for piece instruction generation
    const context: PieceInstructionContext = {
      pieceDetails,
      craftType,
      options,
      abbreviations,
      templates: getInstructionTemplates(craftType)
    };

    // Generate row-by-row instructions
    const instructionSteps = await this.generateRowByRowInstructions(context);

    // Generate full markdown instructions
    const markdownInstructions = this.generateMarkdownInstructions(context, instructionSteps);

    // Collect construction notes
    const constructionNotes = this.collectConstructionNotes(pieceDetails, options);

    return {
      pieceKey,
      displayName: pieceDetails.displayName,
      markdownInstructions,
      instructionSteps,
      constructionSummary: {
        castOnStitches: pieceDetails.castOnStitches,
        totalRows: pieceDetails.lengthInRows,
        finalStitchCount: pieceDetails.finalStitchCount,
        finishedDimensions: pieceDetails.finishedDimensions
      },
      constructionNotes: constructionNotes.length > 0 ? constructionNotes : undefined
    };
  }

  /**
   * Generate row-by-row instructions for a piece
   */
  private async generateRowByRowInstructions(context: PieceInstructionContext): Promise<RowByRowInstruction[]> {
    const { pieceDetails, craftType, options, abbreviations } = context;
    const instructions: RowByRowInstruction[] = [];
    
    let currentRow = 1;
    let currentStitchCount = pieceDetails.castOnStitches;
    let currentSection = 'Cast On';

    // Step 1: Cast On instruction
    const castOnTemplate = getTemplate(craftType, 'cast_on');
    if (castOnTemplate) {
      const templateValues: Record<string, string | number> = craftType === 'knitting' 
        ? { stitchCount: pieceDetails.castOnStitches }
        : { chainCount: pieceDetails.castOnStitches + 1 }; // Crochet needs one extra chain
      
      const castOnText = applyTemplate(castOnTemplate, templateValues);

      instructions.push({
        rowNumber: 0, // Cast on is row 0
        section: currentSection,
        instructionText: applyAbbreviations(castOnText, abbreviations, options.useStandardAbbreviations || false),
        stitchCount: currentStitchCount,
        rowType: 'cast_on',
        metadata: {
          isRightSide: true,
          notes: ['Place stitch markers as needed for pattern tracking']
        }
      });
    }

    // Step 1.5: For crochet, add foundation row if needed
    if (craftType === 'crochet') {
      const foundationTemplate = getTemplate(craftType, 'setup_row');
      if (foundationTemplate) {
        const foundationText = applyTemplate(foundationTemplate, {
          stitchCount: pieceDetails.castOnStitches,
          stitchType: 'sc',
          startPosition: '2nd ch'
        });

        instructions.push({
          rowNumber: 1,
          section: currentSection,
          instructionText: applyAbbreviations(foundationText, abbreviations, options.useStandardAbbreviations || false),
          stitchCount: currentStitchCount,
          rowType: 'setup_row',
          metadata: {
            isRightSide: true,
            notes: ['Foundation row establishes working stitches']
          }
        });
        currentRow = 2; // Next row starts at 2 for crochet
      }
    }

    // Step 2: Process shaping instructions row by row
    if (pieceDetails.shaping && pieceDetails.shaping.length > 0) {
      instructions.push(...await this.processShapingInstructions(
        pieceDetails.shaping,
        context,
        currentRow,
        currentStitchCount
      ));
    } else {
      // Step 3: Generate plain rows if no shaping
      instructions.push(...this.generatePlainRowInstructions(
        context,
        currentRow,
        pieceDetails.lengthInRows,
        currentStitchCount
      ));
    }

    // Step 4: Add bind off instruction
    const bindOffTemplate = getTemplate(craftType, 'bind_off');
    if (bindOffTemplate) {
      const bindOffText = applyTemplate(bindOffTemplate, {
        stitchCount: pieceDetails.finalStitchCount
      });

      instructions.push({
        rowNumber: pieceDetails.lengthInRows + 1,
        section: 'Bind Off',
        instructionText: applyAbbreviations(bindOffText, abbreviations, options.useStandardAbbreviations || false),
        stitchCount: 0, // No stitches remain after bind off
        rowType: 'bind_off',
        metadata: {
          isRightSide: determineRowSide(pieceDetails.lengthInRows + 1) === 'RS',
          notes: ['Weave in all ends securely']
        }
      });
    }

    return instructions;
  }

  /**
   * Process shaping instructions and convert to row-by-row format
   */
  private async processShapingInstructions(
    shapingInstructions: ShapingInstruction[],
    context: PieceInstructionContext,
    startRow: number,
    startStitchCount: number
  ): Promise<RowByRowInstruction[]> {
    const instructions: RowByRowInstruction[] = [];
    const { craftType, options, abbreviations } = context;

    let currentRow = startRow;
    let currentStitchCount = startStitchCount;
    let currentSection = 'Body';

    // Group shaping instructions by type/section
    const groupedShaping = this.groupShapingInstructions(shapingInstructions);

    for (const [sectionName, sectionShaping] of Object.entries(groupedShaping)) {
      currentSection = sectionName;

      for (const shaping of sectionShaping) {
        // Try to use existing instruction generation service for complex shaping
        if (this.isComplexShaping(shaping)) {
          const detailedInstructions = await this.generateDetailedShapingInstructions(
            shaping,
            context,
            currentRow,
            currentStitchCount
          );

          // Convert DetailedInstruction to RowByRowInstruction
          for (const detailedInstr of detailedInstructions) {
            instructions.push(this.convertDetailedToRowByRow(
              detailedInstr,
              currentSection,
              abbreviations,
              options.useStandardAbbreviations || false
            ));

            currentRow = detailedInstr.row_number_in_section || currentRow + 1;
            currentStitchCount = detailedInstr.stitchCount || currentStitchCount;
          }
        } else {
          // Generate simple shaping instruction
          const shapingInstruction = this.generateSimpleShapingInstruction(
            shaping,
            craftType,
            currentRow,
            currentStitchCount,
            currentSection,
            abbreviations,
            options.useStandardAbbreviations || false
          );

          instructions.push(shapingInstruction);
          currentRow++;
          
          // Update stitch count based on shaping
          if (shaping.type?.includes('decrease')) {
            currentStitchCount -= Math.abs(shaping.stitchCountChange || 0);
          } else if (shaping.type?.includes('increase')) {
            currentStitchCount += Math.abs(shaping.stitchCountChange || 0);
          }
        }
      }
    }

    return instructions;
  }

  /**
   * Generate plain row instructions for sections without shaping
   */
  private generatePlainRowInstructions(
    context: PieceInstructionContext,
    startRow: number,
    totalRows: number,
    stitchCount: number
  ): RowByRowInstruction[] {
    const { craftType, options, abbreviations } = context;
    const instructions: RowByRowInstruction[] = [];

    // Determine stitch pattern (default to Stockinette for knitting, SC for crochet)
    const stitchPatternName = craftType === 'knitting' ? 'Stockinette Stitch' : 'Single Crochet';
    
    // Group plain rows for efficiency  
    if ((options.detailLevel === 'minimal' && totalRows > 10) || (options.detailLevel === 'standard' && totalRows > 20)) {
      // Generate grouped instruction for multiple rows
      const template = getTemplate(craftType, 'plain_row', 'multiple');
      if (template) {
        const instructionText = applyTemplate(template, {
          startRow,
          endRow: totalRows,
          stitchPattern: stitchPatternName,
          rowCount: totalRows - startRow + 1,
          stitchCount
        });

        instructions.push({
          rowNumber: startRow,
          section: 'Body',
          instructionText: applyAbbreviations(instructionText, abbreviations, options.useStandardAbbreviations),
          stitchCount,
          rowType: 'plain_row',
          metadata: {
            isRightSide: determineRowSide(startRow) === 'RS',
            notes: [`Work ${totalRows - startRow + 1} rows in ${stitchPatternName}`]
          }
        });
      }
    } else {
      // Generate row-by-row instructions
      for (let row = startRow; row <= totalRows; row++) {
        const template = getTemplate(craftType, 'plain_row', 'single');
        if (template) {
          const stitchPattern = craftType === 'knitting' 
            ? (determineRowSide(row) === 'RS' ? 'Knit all sts' : 'Purl all sts')
            : 'Single crochet in each stitch across';

          const instructionText = applyTemplate(template, {
            rowNumber: row,
            rowSide: determineRowSide(row),
            stitchPattern,
            stitchCount
          });

          instructions.push({
            rowNumber: row,
            section: 'Body',
            instructionText: applyAbbreviations(instructionText, abbreviations, options.useStandardAbbreviations),
            stitchCount,
            rowType: 'plain_row',
            metadata: {
              isRightSide: determineRowSide(row) === 'RS'
            }
          });
        }
      }
    }

    return instructions;
  }

  /**
   * Generate full markdown instructions from row-by-row instructions
   */
  private generateMarkdownInstructions(
    context: PieceInstructionContext,
    instructions: RowByRowInstruction[]
  ): string {
    const { pieceDetails, options } = context;
    
    let markdown = generatePieceHeader(
      pieceDetails.displayName,
      pieceDetails.castOnStitches,
      pieceDetails.lengthInRows,
      pieceDetails.finalStitchCount,
      pieceDetails.finishedDimensions.width_cm,
      pieceDetails.finishedDimensions.length_cm
    );

    // Group instructions by section
    const instructionsBySection = this.groupInstructionsBySection(instructions);

    for (const [sectionName, sectionInstructions] of Object.entries(instructionsBySection)) {
      if (sectionName !== 'Cast On') {
        markdown += generateSectionHeader(sectionName, 3);
      }

      for (const instruction of sectionInstructions) {
        if (options.includeRowNumbers && instruction.rowNumber > 0) {
          markdown += `**Row ${instruction.rowNumber}:** `;
        }
        markdown += `${instruction.instructionText}  \n`;
      }
      markdown += '\n';
    }

    // Add construction notes if available
    if (pieceDetails.constructionNotes && options.includeConstructionNotes) {
      markdown += generateConstructionNotes(pieceDetails.constructionNotes);
    }

    return markdown;
  }

  /**
   * Validation methods and helpers
   */
  private validateInput(input: PatternInstructionGenerationInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.calculatedPatternDetails) {
      errors.push('Calculated pattern details are required');
    } else {
      const { patternInfo, pieces } = input.calculatedPatternDetails;
      
      if (!patternInfo) {
        errors.push('Pattern info is required');
      } else {
        if (!patternInfo.craftType || !['knitting', 'crochet'].includes(patternInfo.craftType)) {
          errors.push('Valid craft type (knitting or crochet) is required');
        }
      }

      if (!pieces || Object.keys(pieces).length === 0) {
        errors.push('At least one pattern piece is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Additional helper methods...
  private generatePatternIntroduction(
    calculatedPatternDetails: CalculatedPatternDetails,
    options: Required<PatternInstructionGenerationOptions>
  ): string {
    const { patternInfo } = calculatedPatternDetails;
    const craftName = patternInfo.craftType === 'knitting' ? 'Knitting' : 'Crochet';
    
    let intro = `# ${patternInfo.garmentType} ${craftName} Pattern\n\n`;
    intro += `This pattern was generated by Malaine on ${new Date(patternInfo.calculatedAt).toLocaleDateString()}.\n\n`;
    
    const pieceCount = Object.keys(calculatedPatternDetails.pieces).length;
    intro += `**Pattern includes ${pieceCount} piece${pieceCount !== 1 ? 's' : ''}:**\n`;
    
    for (const [pieceKey, pieceDetails] of Object.entries(calculatedPatternDetails.pieces)) {
      intro += `- ${pieceDetails.displayName}\n`;
    }
    
    intro += '\n';
    return intro;
  }

  private groupShapingInstructions(shaping: ShapingInstruction[]): Record<string, ShapingInstruction[]> {
    const grouped: Record<string, ShapingInstruction[]> = {};
    
    for (const instruction of shaping) {
      const section = this.determineSectionFromShaping(instruction);
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(instruction);
    }
    
    return grouped;
  }

  private determineSectionFromShaping(shaping: ShapingInstruction): string {
    const type = shaping.type?.toLowerCase() || '';
    
    if (type.includes('waist')) return 'Waist Shaping';
    if (type.includes('bust')) return 'Bust Shaping';
    if (type.includes('armhole')) return 'Armhole Shaping';
    if (type.includes('neckline') || type.includes('neck')) return 'Neckline Shaping';
    if (type.includes('sleeve')) return 'Sleeve Shaping';
    
    return 'Body Shaping';
  }

  private isComplexShaping(shaping: ShapingInstruction): boolean {
    const type = shaping.type?.toLowerCase() || '';
    return type.includes('neckline') || type.includes('armhole') || type.includes('raglan');
  }

  private async generateDetailedShapingInstructions(
    shaping: ShapingInstruction,
    context: PieceInstructionContext,
    currentRow: number,
    currentStitchCount: number
  ): Promise<DetailedInstruction[]> {
    // This would integrate with the existing InstructionGeneratorService
    // For now, return a simple conversion
    return [{
      step: 1,
      type: 'shaping_row',
      text: shaping.instruction || 'Shaping row',
      stitchCount: currentStitchCount,
      row_number_in_section: currentRow
    }];
  }

  private convertDetailedToRowByRow(
    detailed: DetailedInstruction,
    section: string,
    abbreviations: any,
    useAbbreviations: boolean
  ): RowByRowInstruction {
    return {
      rowNumber: detailed.row_number_in_section || detailed.step,
      section,
      instructionText: applyAbbreviations(detailed.text, abbreviations, useAbbreviations),
      stitchCount: detailed.stitchCount || 0,
      rowType: this.convertDetailedTypeToRowType(detailed.type),
      metadata: {
        isRightSide: detailed.metadata?.isRightSide || false,
        stitchesChanged: detailed.metadata?.stitchesChanged,
        shapingType: detailed.metadata?.shapingType
      }
    };
  }

  private convertDetailedTypeToRowType(type: any): RowInstructionType {
    if (typeof type === 'string') {
      if (type.includes('shaping')) return 'shaping_row';
      if (type.includes('cast_on')) return 'cast_on';
      if (type.includes('cast_off') || type.includes('bind_off')) return 'bind_off';
      if (type.includes('pattern')) return 'pattern_row';
      if (type.includes('setup')) return 'setup_row';
    }
    return 'plain_row';
  }

  private generateSimpleShapingInstruction(
    shaping: ShapingInstruction,
    craftType: 'knitting' | 'crochet',
    rowNumber: number,
    stitchCount: number,
    section: string,
    abbreviations: any,
    useAbbreviations: boolean
  ): RowByRowInstruction {
    const isDecrease = shaping.type?.includes('decrease') || false;
    const templateType = isDecrease ? 'shaping_decrease_row' : 'shaping_increase_row';
    const template = getTemplate(craftType, 'shaping_row', templateType);
    
    let instructionText = shaping.instruction || 'Work shaping as indicated';
    
    if (template) {
      instructionText = applyTemplate(template, {
        rowNumber,
        rowSide: determineRowSide(rowNumber),
        decreaseInstructions: shaping.instruction || '',
        increaseInstructions: shaping.instruction || '',
        stitchCount
      });
    }

    return {
      rowNumber,
      section,
      instructionText: applyAbbreviations(instructionText, abbreviations, useAbbreviations),
      stitchCount,
      rowType: 'shaping_row',
      metadata: {
        isRightSide: determineRowSide(rowNumber) === 'RS',
        shapingType: isDecrease ? 'decrease' : 'increase'
      }
    };
  }

  private extractStitchChange(instructionText: string): number {
    // Simple regex to extract numbers from instruction text
    const matches = instructionText.match(/(\d+)/);
    return matches ? parseInt(matches[1]) : 1;
  }

  private groupInstructionsBySection(instructions: RowByRowInstruction[]): Record<string, RowByRowInstruction[]> {
    const grouped: Record<string, RowByRowInstruction[]> = {};
    
    for (const instruction of instructions) {
      if (!grouped[instruction.section]) {
        grouped[instruction.section] = [];
      }
      grouped[instruction.section].push(instruction);
    }
    
    return grouped;
  }

  private collectConstructionNotes(
    pieceDetails: CalculatedPieceDetails,
    options: Required<PatternInstructionGenerationOptions>
  ): string[] {
    const notes: string[] = [];
    
    if (pieceDetails.constructionNotes) {
      notes.push(...pieceDetails.constructionNotes);
    }
    
    // Add automatic notes based on piece characteristics
    if (pieceDetails.shaping && pieceDetails.shaping.length > 0) {
      notes.push('Piece includes shaping - pay attention to stitch counts');
    }
    
    if (pieceDetails.lengthInRows > 200) {
      notes.push('This is a long piece - consider using stitch markers to track progress');
    }
    
    return notes;
  }
} 