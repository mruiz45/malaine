/**
 * Pattern Assembler Service (US_9.1)
 * Transforms PatternCalculationResult into structured AssembledPattern
 */

import {
  AssembledPattern,
  PatternAbbreviation,
  SpecialStitch,
  PatternYarn,
  PatternGauge,
  FinishedMeasurements,
  PatternComponent,
  AssemblyInstruction,
  ComponentInstruction,
  ComponentCalculations
} from '@/types/assembled-pattern';
import {
  PatternCalculationResult,
  ComponentCalculationResult
} from '@/types/pattern-calculation';
import { StitchPattern } from '@/types/stitchPattern';

/**
 * Service for assembling complete pattern documents from calculation results
 */
export class PatternAssemblerService {
  
  /**
   * Assembles a complete pattern from calculation result
   * @param calculationResult - Pattern calculation result
   * @param sessionId - Source session ID
   * @param craftType - Craft type (knitting or crochet) from session data
   * @param options - Assembly options
   * @returns Assembled pattern structure
   */
  public assemblePattern(
    calculationResult: PatternCalculationResult,
    sessionId: string,
    craftType: 'knitting' | 'crochet',
    options: {
      includeShapingSummaries?: boolean;
      includeYarnEstimates?: boolean;
      language?: 'en' | 'fr';
    } = {}
  ): AssembledPattern {
    const { input } = calculationResult;
    const language = options.language || 'en';

    // Generate pattern title
    const patternTitle = this.generatePatternTitle(input, craftType, language);
    
    // Generate target size label
    const targetSizeLabel = this.generateSizeLabel(input, language);

    // Assemble gauge information
    const gauge: PatternGauge = {
      stitchesPer10cm: input.gauge.stitchesPer10cm,
      rowsPer10cm: input.gauge.rowsPer10cm,
      unit: input.gauge.unit,
      profileName: input.gauge.profileName
    };

    // Assemble yarn information
    const yarns: PatternYarn[] = [{
      name: input.yarn.name,
      estimated_quantity: options.includeYarnEstimates 
        ? this.estimateYarnQuantity(calculationResult, input.yarn.weightCategory)
        : 'To be calculated',
      weight_category: input.yarn.weightCategory,
      fiber: input.yarn.fiber
    }];

    // Generate needles/hooks list
    const needles_hooks = this.generateToolsList(input, craftType, language);

    // Generate standard abbreviations
    const abbreviations = this.generateStandardAbbreviations(craftType, language);

    // Extract special stitches if any
    const special_stitches = this.extractSpecialStitches(input, language);

    // Format finished measurements
    const finished_measurements = this.formatFinishedMeasurements(input, language);

    // Assemble component instructions
    const components = this.assembleComponents(
      calculationResult.components,
      options.includeShapingSummaries,
      language
    );

    // Generate assembly instructions
    const assembly_instructions = this.generateAssemblyInstructions(input, language);

    // Collect pattern notes and warnings
    const pattern_notes = this.collectPatternNotes(calculationResult, language);

    return {
      patternTitle,
      targetSizeLabel,
      craftType,
      gauge,
      yarns,
      needles_hooks,
      abbreviations,
      special_stitches,
      finished_measurements,
      components,
      assembly_instructions,
      pattern_notes,
      generated_at: new Date().toISOString(),
      session_id: sessionId
    };
  }

  /**
   * Generates a pattern title
   */
  private generatePatternTitle(input: any, craftType: 'knitting' | 'crochet', language: 'en' | 'fr'): string {
    const craftTypeName = craftType === 'knitting' 
      ? (language === 'fr' ? 'Tricot' : 'Knitted')
      : (language === 'fr' ? 'Crochet' : 'Crocheted');
    
    const garmentType = input.garment.displayName || 
      (language === 'fr' ? 'Vêtement' : 'Garment');
    
    return `${craftTypeName} ${garmentType}`;
  }

  /**
   * Generates size label
   */
  private generateSizeLabel(input: any, language: 'en' | 'fr'): string {
    const chest = input.garment.measurements.finishedChestCircumference;
    if (chest) {
      const unit = input.units.dimensionUnit;
      return `${chest}${unit} ${language === 'fr' ? 'tour de poitrine' : 'chest'}`;
    }
    return language === 'fr' ? 'Taille personnalisée' : 'Custom Size';
  }

  /**
   * Estimates yarn quantity
   */
  private estimateYarnQuantity(result: PatternCalculationResult, weightCategory: string): string {
    const totalStitches = result.patternMetadata.totalStitches;
    
    // Rough estimation based on weight category and stitch count
    const baseGrams = this.getBaseGramsForWeight(weightCategory);
    const estimatedGrams = Math.ceil((totalStitches / 1000) * baseGrams);
    
    return `${estimatedGrams}g (approximately)`;
  }

  /**
   * Gets base grams per 1000 stitches for different yarn weights
   */
  private getBaseGramsForWeight(weightCategory: string): number {
    const weights: Record<string, number> = {
      'Lace': 15,
      'Light Fingering': 20,
      'Fingering': 25,
      'Sport': 35,
      'DK': 45,
      'Worsted': 55,
      'Aran': 65,
      'Bulky': 80,
      'Super Bulky': 100
    };
    return weights[weightCategory] || 45; // Default to DK weight
  }

  /**
   * Generates tools list (needles/hooks)
   */
  private generateToolsList(input: any, craftType: 'knitting' | 'crochet', language: 'en' | 'fr'): string[] {
    const tools: string[] = [];
    const unit = language === 'fr' ? 'mm' : 'mm';
    
    if (craftType === 'knitting') {
      // Estimate needle size from gauge - this is a simplified calculation
      const needleSize = this.estimateNeedleSize(input.gauge, input.yarn.weightCategory);
      tools.push(`${needleSize}${unit} ${language === 'fr' ? 'aiguilles circulaires' : 'circular needles'}`);
      
      // Add smaller needles for ribbing if applicable
      const ribbingSize = needleSize - 0.5;
      tools.push(`${ribbingSize}${unit} ${language === 'fr' ? 'aiguilles pour les côtes' : 'needles for ribbing'}`);
    } else {
      // Crochet hooks
      const hookSize = this.estimateHookSize(input.gauge, input.yarn.weightCategory);
      tools.push(`${hookSize}${unit} ${language === 'fr' ? 'crochet' : 'crochet hook'}`);
    }
    
    return tools;
  }

  /**
   * Estimates needle size from gauge and yarn weight
   */
  private estimateNeedleSize(gauge: any, weightCategory: string): number {
    // Simplified estimation - in real implementation, this would be more sophisticated
    const sizeMap: Record<string, number> = {
      'Lace': 2.0,
      'Light Fingering': 2.5,
      'Fingering': 3.0,
      'Sport': 3.5,
      'DK': 4.0,
      'Worsted': 4.5,
      'Aran': 5.0,
      'Bulky': 6.0,
      'Super Bulky': 8.0
    };
    return sizeMap[weightCategory] || 4.0;
  }

  /**
   * Estimates hook size for crochet
   */
  private estimateHookSize(gauge: any, weightCategory: string): number {
    // Crochet hooks are generally larger than knitting needles
    const sizeMap: Record<string, number> = {
      'Lace': 2.5,
      'Light Fingering': 3.0,
      'Fingering': 3.5,
      'Sport': 4.0,
      'DK': 4.5,
      'Worsted': 5.0,
      'Aran': 5.5,
      'Bulky': 6.5,
      'Super Bulky': 9.0
    };
    return sizeMap[weightCategory] || 4.5;
  }

  /**
   * Generates standard abbreviations
   */
  private generateStandardAbbreviations(craftType: 'knitting' | 'crochet', language: 'en' | 'fr'): PatternAbbreviation[] {
    if (craftType === 'knitting') {
      return language === 'fr' ? [
        { abbr: 'm', definition: 'maille' },
        { abbr: 'end', definition: 'maille endroit' },
        { abbr: 'env', definition: 'maille envers' },
        { abbr: 'aug', definition: 'augmentation' },
        { abbr: 'dim', definition: 'diminution' },
        { abbr: 'rg', definition: 'rang' }
      ] : [
        { abbr: 'st', definition: 'stitch' },
        { abbr: 'sts', definition: 'stitches' },
        { abbr: 'k', definition: 'knit' },
        { abbr: 'p', definition: 'purl' },
        { abbr: 'inc', definition: 'increase' },
        { abbr: 'dec', definition: 'decrease' },
        { abbr: 'row', definition: 'row' }
      ];
    } else {
      return language === 'fr' ? [
        { abbr: 'ml', definition: 'maille en l\'air' },
        { abbr: 'ms', definition: 'maille serrée' },
        { abbr: 'db', definition: 'double bride' },
        { abbr: 'br', definition: 'bride' },
        { abbr: 'aug', definition: 'augmentation' },
        { abbr: 'dim', definition: 'diminution' }
      ] : [
        { abbr: 'ch', definition: 'chain' },
        { abbr: 'sc', definition: 'single crochet' },
        { abbr: 'dc', definition: 'double crochet' },
        { abbr: 'hdc', definition: 'half double crochet' },
        { abbr: 'inc', definition: 'increase' },
        { abbr: 'dec', definition: 'decrease' }
      ];
    }
  }

  /**
   * Extracts special stitches from pattern
   */
  private extractSpecialStitches(input: any, language: 'en' | 'fr'): SpecialStitch[] {
    const specialStitches: SpecialStitch[] = [];
    
    // Check if a complex stitch pattern is used
    if (input.stitchPattern && input.stitchPattern.patternType !== 'stockinette' && input.stitchPattern.patternType !== 'basic') {
      specialStitches.push({
        name: input.stitchPattern.name,
        instructions: language === 'fr' 
          ? 'Voir les instructions détaillées du point'
          : 'See detailed stitch pattern instructions',
        abbreviation: input.stitchPattern.name.replace(/\s+/g, '').toLowerCase()
      });
    }
    
    return specialStitches;
  }

  /**
   * Formats finished measurements
   */
  private formatFinishedMeasurements(input: any, language: 'en' | 'fr'): FinishedMeasurements {
    const measurements = input.garment.measurements;
    const unit = input.units.dimensionUnit;
    
    const result: FinishedMeasurements = {};
    
    if (measurements.finishedChestCircumference) {
      result.chest = `${measurements.finishedChestCircumference}${unit}`;
    }
    if (measurements.finishedLength) {
      result.length = `${measurements.finishedLength}${unit}`;
    }
    if (measurements.finishedWaistCircumference) {
      result.waist = `${measurements.finishedWaistCircumference}${unit}`;
    }
    if (measurements.finishedHipCircumference) {
      result.hips = `${measurements.finishedHipCircumference}${unit}`;
    }
    if (measurements.finishedShoulderWidth) {
      result.shoulder_width = `${measurements.finishedShoulderWidth}${unit}`;
    }
    if (measurements.finishedArmLength) {
      result.arm_length = `${measurements.finishedArmLength}${unit}`;
    }
    if (measurements.finishedUpperArmCircumference) {
      result.upper_arm = `${measurements.finishedUpperArmCircumference}${unit}`;
    }
    if (measurements.finishedNeckCircumference) {
      result.neck = `${measurements.finishedNeckCircumference}${unit}`;
    }
    
    return result;
  }

  /**
   * Assembles component instructions
   */
  private assembleComponents(
    components: ComponentCalculationResult[],
    includeShapingSummaries: boolean = true,
    language: 'en' | 'fr'
  ): PatternComponent[] {
    return components.map(component => {
      // Convert calculation data
      const calculations: ComponentCalculations = {
        cast_on: component.detailedCalculations?.castOnStitches,
        rows: component.detailedCalculations?.totalRows,
        target_width_cm: component.detailedCalculations?.targetWidthUsed_cm,
        target_length_cm: component.detailedCalculations?.targetLengthUsed_cm,
        actual_width_cm: component.detailedCalculations?.actualCalculatedWidth_cm,
        actual_length_cm: component.detailedCalculations?.actualCalculatedLength_cm,
        pattern_repeats: component.detailedCalculations?.patternRepeats
      };

      // Convert instructions
      const instructions: ComponentInstruction[] = [];
      
      if (component.instructions) {
        component.instructions.forEach(instruction => {
          instructions.push({
            step: instruction.step,
            text: instruction.text
          });
        });
      }
      
      if (component.detailedInstructions) {
        component.detailedInstructions.forEach(instruction => {
          instructions.push({
            step: instruction.step,
            text: instruction.text,
            rowNumber: instruction.rowNumber,
            stitchCount: instruction.stitchCount,
            isShapingRow: instruction.isShapingRow
          });
        });
      }

      // Generate shaping summary if requested
      let shaping_summary: string | undefined;
      if (includeShapingSummaries && component.shapingInstructions && component.shapingInstructions.length > 0) {
        shaping_summary = component.shapingInstructions.join(' ');
      }

      return {
        componentName: component.displayName,
        calculations,
        instructions,
        shaping_summary,
        notes: component.warnings
      };
    });
  }

  /**
   * Generates assembly instructions
   */
  private generateAssemblyInstructions(input: any, language: 'en' | 'fr'): AssemblyInstruction[] {
    const garmentType = input.garment.typeKey;
    const craftType = input.craftType;
    
    // Generate generic assembly instructions based on garment type
    const instructions: AssemblyInstruction[] = [];
    let step = 1;
    
    if (garmentType.includes('sweater') || garmentType.includes('pullover')) {
      if (language === 'fr') {
        instructions.push(
          { step: step++, text: 'Coudre les coutures d\'épaules.' },
          { step: step++, text: 'Monter les manches.' },
          { step: step++, text: 'Coudre les coutures de côté et des manches.' },
          { step: step++, text: 'Rentrer tous les fils.' }
        );
      } else {
        instructions.push(
          { step: step++, text: 'Sew shoulder seams.' },
          { step: step++, text: 'Set in sleeves.' },
          { step: step++, text: 'Sew side and sleeve seams.' },
          { step: step++, text: 'Weave in all ends.' }
        );
      }
    } else if (garmentType.includes('hat') || garmentType.includes('beanie')) {
      if (language === 'fr') {
        instructions.push(
          { step: step++, text: 'Fermer le haut du bonnet si nécessaire.' },
          { step: step++, text: 'Rentrer tous les fils.' }
        );
      } else {
        instructions.push(
          { step: step++, text: 'Close top of hat if needed.' },
          { step: step++, text: 'Weave in all ends.' }
        );
      }
    } else {
      // Generic finishing
      if (language === 'fr') {
        instructions.push(
          { step: step++, text: 'Assembler les pièces selon le schéma.' },
          { step: step++, text: 'Rentrer tous les fils.' }
        );
      } else {
        instructions.push(
          { step: step++, text: 'Assemble pieces according to schematic.' },
          { step: step++, text: 'Weave in all ends.' }
        );
      }
    }
    
    return instructions;
  }

  /**
   * Collects pattern notes and warnings
   */
  private collectPatternNotes(result: PatternCalculationResult, language: 'en' | 'fr'): string[] {
    const notes: string[] = [];
    
    // Add general notes
    if (language === 'fr') {
      notes.push('L\'échantillon est crucial pour ce patron.');
    } else {
      notes.push('Gauge is critical for this pattern.');
    }
    
    // Add warnings from calculation
    if (result.warnings && result.warnings.length > 0) {
      notes.push(...result.warnings);
    }
    
    // Add component-specific warnings
    result.components.forEach(component => {
      if (component.warnings && component.warnings.length > 0) {
        component.warnings.forEach(warning => {
          notes.push(`${component.displayName}: ${warning}`);
        });
      }
    });
    
    return notes;
  }
} 