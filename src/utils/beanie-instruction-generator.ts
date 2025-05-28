/**
 * Beanie Instruction Generator (US_7.1.1)
 * Generates human-readable instructions for beanie/hat garments
 * based on calculation results from beanie calculator
 */

import { BeanieCalculationResult, BeanieSectionCalculation } from './beanie-calculator';
import { BeanieAttributes } from '@/types/accessories';

/**
 * Input data for beanie instruction generation
 */
export interface BeanieInstructionGenerationInput {
  /** Calculation results from beanie calculator */
  calculationResult: BeanieCalculationResult;
  /** Beanie attributes for context */
  beanieAttributes: BeanieAttributes;
  /** Craft type for terminology */
  craftType: 'knitting' | 'crochet';
  /** Optional yarn name for personalization */
  yarnName?: string;
  /** Optional needle/hook size for instructions */
  needleSize?: string;
}

/**
 * Generated instruction step for beanie
 */
export interface BeanieInstructionStep {
  /** Step number */
  step: number;
  /** Section this step belongs to */
  section: 'setup' | 'brim' | 'body' | 'crown' | 'finishing';
  /** Instruction text */
  text: string;
  /** Additional notes or tips */
  notes?: string;
}

/**
 * Result of beanie instruction generation
 */
export interface BeanieInstructionGenerationResult {
  /** Success status */
  success: boolean;
  /** Generated instructions */
  instructions?: BeanieInstructionStep[];
  /** Error messages if any */
  errors?: string[];
  /** Warning messages if any */
  warnings?: string[];
  /** Summary information */
  summary?: {
    totalSteps: number;
    estimatedTime?: string;
    skillLevel?: string;
  };
}

/**
 * Validates input data for beanie instruction generation
 */
function validateBeanieInstructionInput(input: BeanieInstructionGenerationInput): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate calculation result
  if (!input.calculationResult) {
    errors.push('Calculation result is required');
  } else {
    if (input.calculationResult.errors && input.calculationResult.errors.length > 0) {
      errors.push('Cannot generate instructions from calculation with errors');
    }
    if (!input.calculationResult.calculations.castOnStitches || input.calculationResult.calculations.castOnStitches <= 0) {
      errors.push('Invalid cast-on stitch count in calculation result');
    }
  }

  // Validate beanie attributes
  if (!input.beanieAttributes) {
    errors.push('Beanie attributes are required');
  }

  // Validate craft type
  if (!input.craftType || !['knitting', 'crochet'].includes(input.craftType)) {
    errors.push('Craft type must be either "knitting" or "crochet"');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates cast-on instruction for working in the round
 */
function generateCastOnInstructionInRound(
  castOnStitches: number, 
  craftType: 'knitting' | 'crochet', 
  yarnName?: string,
  needleSize?: string
): string {
  const yarnText = yarnName ? ` using ${yarnName}` : '';
  const needleText = needleSize ? ` ${needleSize}` : '';
  
  if (craftType === 'knitting') {
    return `Using${needleText} circular needles${yarnText}, cast on ${castOnStitches} stitches. Join to work in the round, being careful not to twist the stitches. Place a marker to indicate the beginning of the round.`;
  } else {
    // For crochet, create a magic ring or chain and join
    return `Using your${needleText} hook${yarnText}, create a magic ring or chain ${castOnStitches + 1} and join with a slip stitch to form a ring. Round 1: Work ${castOnStitches} single crochet into the ring. Join with slip stitch to first single crochet. Place a marker to indicate the beginning of the round.`;
  }
}

/**
 * Generates brim instructions based on brim style
 */
function generateBrimInstructions(
  brimSection: BeanieSectionCalculation,
  brimStyle: string,
  craftType: 'knitting' | 'crochet'
): BeanieInstructionStep[] {
  const instructions: BeanieInstructionStep[] = [];
  let stepNumber = 2; // Assuming cast-on was step 1

  switch (brimStyle) {
    case 'folded_ribbed_1x1':
      if (craftType === 'knitting') {
        instructions.push({
          step: stepNumber++,
          section: 'brim',
          text: `Work in 1x1 ribbing (k1, p1) for ${brimSection.rounds} rounds.`,
          notes: 'This creates a stretchy brim that will fold up naturally.'
        });
      } else {
        instructions.push({
          step: stepNumber++,
          section: 'brim',
          text: `Work in ribbing pattern (alternating front post and back post double crochet) for ${brimSection.rounds} rounds.`,
          notes: 'This creates a stretchy brim that will fold up naturally.'
        });
      }
      break;
    
    case 'rolled_edge':
      if (craftType === 'knitting') {
        instructions.push({
          step: stepNumber++,
          section: 'brim',
          text: `Work in stockinette stitch (knit every round) for ${brimSection.rounds} rounds.`,
          notes: 'The stockinette will naturally curl to create a rolled edge.'
        });
      } else {
        instructions.push({
          step: stepNumber++,
          section: 'brim',
          text: `Work in single crochet for ${brimSection.rounds} rounds.`,
          notes: 'This will create a simple, clean edge.'
        });
      }
      break;
    
    case 'no_brim':
      // No additional brim instructions needed
      instructions.push({
        step: stepNumber++,
        section: 'brim',
        text: `Continue directly to body section.`,
        notes: 'No additional brim work needed for this style.'
      });
      break;
    
    default:
      if (craftType === 'knitting') {
        instructions.push({
          step: stepNumber++,
          section: 'brim',
          text: `Work in your chosen brim pattern for ${brimSection.rounds} rounds.`,
        });
      } else {
        instructions.push({
          step: stepNumber++,
          section: 'brim',
          text: `Work in your chosen brim pattern for ${brimSection.rounds} rounds.`,
        });
      }
  }

  return instructions;
}

/**
 * Generates body instructions
 */
function generateBodyInstructions(
  bodySection: BeanieSectionCalculation,
  craftType: 'knitting' | 'crochet',
  stepNumber: number
): BeanieInstructionStep[] {
  const instructions: BeanieInstructionStep[] = [];

  if (bodySection.rounds > 0) {
    if (craftType === 'knitting') {
      instructions.push({
        step: stepNumber,
        section: 'body',
        text: `Continue in stockinette stitch (knit every round) for ${bodySection.rounds} rounds.`,
        notes: 'This forms the main body of the beanie.'
      });
    } else {
      instructions.push({
        step: stepNumber,
        section: 'body',
        text: `Continue in single crochet for ${bodySection.rounds} rounds.`,
        notes: 'This forms the main body of the beanie.'
      });
    }
  } else {
    instructions.push({
      step: stepNumber,
      section: 'body',
      text: 'Proceed directly to crown shaping.',
      notes: 'No additional body rounds needed for this beanie height.'
    });
  }

  return instructions;
}

/**
 * Generates crown decrease instructions based on crown style
 */
function generateCrownInstructions(
  crownSection: BeanieSectionCalculation,
  crownStyle: string,
  decreasePoints: number,
  totalStitches: number,
  craftType: 'knitting' | 'crochet',
  stepNumber: number
): BeanieInstructionStep[] {
  const instructions: BeanieInstructionStep[] = [];
  let currentStep = stepNumber;

  const stitchesPerSection = Math.floor(totalStitches / decreasePoints);

  switch (crownStyle) {
    case 'classic_tapered':
      if (craftType === 'knitting') {
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Begin crown decreases: *K${stitchesPerSection - 2}, k2tog; repeat from * around. (${totalStitches - decreasePoints} stitches)`,
          notes: `You should have ${decreasePoints} decrease points evenly spaced around.`
        });
        
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Next round: Knit all stitches.`,
        });
        
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Continue decreasing every other round, working one less stitch before each decrease, until ${crownSection.stitches} stitches remain.`,
          notes: 'The crown will gradually taper to a point.'
        });
      } else {
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Begin crown decreases: *Sc ${stitchesPerSection - 2}, sc2tog; repeat from * around. (${totalStitches - decreasePoints} stitches)`,
          notes: `You should have ${decreasePoints} decrease points evenly spaced around.`
        });
        
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Continue decreasing every round, working one less stitch before each decrease, until ${crownSection.stitches} stitches remain.`,
          notes: 'The crown will gradually taper to a point.'
        });
      }
      break;
    
    case 'slouchy':
      if (craftType === 'knitting') {
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Begin gradual crown decreases: *K${stitchesPerSection - 2}, k2tog; repeat from * around. (${totalStitches - decreasePoints} stitches)`,
          notes: `You should have ${decreasePoints} decrease points evenly spaced around.`
        });
        
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Work 2 rounds even (no decreases).`,
        });
        
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Continue decreasing every 3rd round, working one less stitch before each decrease, until ${crownSection.stitches} stitches remain.`,
          notes: 'The slower decrease rate creates a slouchy effect.'
        });
      } else {
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Begin gradual crown decreases: *Sc ${stitchesPerSection - 2}, sc2tog; repeat from * around. (${totalStitches - decreasePoints} stitches)`,
          notes: `You should have ${decreasePoints} decrease points evenly spaced around.`
        });
        
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Continue decreasing every 2nd round, working one less stitch before each decrease, until ${crownSection.stitches} stitches remain.`,
          notes: 'The slower decrease rate creates a slouchy effect.'
        });
      }
      break;
    
    case 'flat_top':
      if (craftType === 'knitting') {
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Begin rapid crown decreases: *K${stitchesPerSection - 2}, k2tog; repeat from * around. (${totalStitches - decreasePoints} stitches)`,
          notes: `You should have ${decreasePoints} decrease points evenly spaced around.`
        });
        
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Continue decreasing every round, working one less stitch before each decrease, until ${crownSection.stitches} stitches remain.`,
          notes: 'The rapid decreases create a flatter crown shape.'
        });
      } else {
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Begin rapid crown decreases: *Sc ${stitchesPerSection - 2}, sc2tog; repeat from * around. (${totalStitches - decreasePoints} stitches)`,
          notes: `You should have ${decreasePoints} decrease points evenly spaced around.`
        });
        
        instructions.push({
          step: currentStep++,
          section: 'crown',
          text: `Continue decreasing every round, working one less stitch before each decrease, until ${crownSection.stitches} stitches remain.`,
          notes: 'The rapid decreases create a flatter crown shape.'
        });
      }
      break;
    
    default:
      instructions.push({
        step: currentStep++,
        section: 'crown',
        text: `Work crown decreases according to your chosen style until ${crownSection.stitches} stitches remain.`,
      });
  }

  return instructions;
}

/**
 * Generates finishing instructions
 */
function generateFinishingInstructions(
  finalStitches: number,
  craftType: 'knitting' | 'crochet',
  stepNumber: number
): BeanieInstructionStep[] {
  const instructions: BeanieInstructionStep[] = [];

  if (craftType === 'knitting') {
    instructions.push({
      step: stepNumber,
      section: 'finishing',
      text: `Cut yarn, leaving a 6-inch tail. Thread the tail through the remaining ${finalStitches} stitches and pull tight to close the crown.`,
      notes: 'Weave in all ends securely on the wrong side of the work.'
    });
  } else {
    instructions.push({
      step: stepNumber,
      section: 'finishing',
      text: `Fasten off, leaving a 6-inch tail. Thread the tail through the remaining ${finalStitches} stitches and pull tight to close the crown.`,
      notes: 'Weave in all ends securely on the wrong side of the work.'
    });
  }

  return instructions;
}

/**
 * Estimates skill level based on beanie complexity
 */
function estimateSkillLevel(beanieAttributes: BeanieAttributes, craftType: 'knitting' | 'crochet'): string {
  // Basic skill level assessment
  if (beanieAttributes.crown_style === 'classic_tapered' && 
      (beanieAttributes.brim_style === 'folded_ribbed_1x1' || beanieAttributes.brim_style === 'rolled_edge')) {
    return craftType === 'knitting' ? 'Beginner' : 'Beginner';
  } else if (beanieAttributes.crown_style === 'slouchy' || beanieAttributes.brim_style === 'no_brim') {
    return craftType === 'knitting' ? 'Easy' : 'Easy';
  } else {
    return craftType === 'knitting' ? 'Intermediate' : 'Intermediate';
  }
}

/**
 * Estimates completion time based on stitch count and craft type
 */
function estimateCompletionTime(totalStitches: number, craftType: 'knitting' | 'crochet'): string {
  // Rough estimates based on average crafting speeds
  const stitchesPerHour = craftType === 'knitting' ? 400 : 300; // Knitting is typically faster
  const estimatedHours = Math.ceil(totalStitches / stitchesPerHour);
  
  if (estimatedHours <= 3) {
    return '2-3 hours';
  } else if (estimatedHours <= 6) {
    return '4-6 hours';
  } else if (estimatedHours <= 10) {
    return '6-10 hours';
  } else {
    return `${estimatedHours}+ hours`;
  }
}

/**
 * Main function to generate beanie instructions
 * Implements FR6 from US 7.1.1
 */
export function generateBeanieInstructions(input: BeanieInstructionGenerationInput): BeanieInstructionGenerationResult {
  try {
    // Validate input
    const validation = validateBeanieInstructionInput(input);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    const { calculationResult, beanieAttributes, craftType, yarnName, needleSize } = input;
    const instructions: BeanieInstructionStep[] = [];
    const warnings: string[] = [];
    let stepNumber = 1;

    // Find sections in calculation result
    const brimSection = calculationResult.sections.find(s => s.sectionName === 'brim');
    const bodySection = calculationResult.sections.find(s => s.sectionName === 'body');
    const crownSection = calculationResult.sections.find(s => s.sectionName === 'crown');

    if (!brimSection || !bodySection || !crownSection) {
      return {
        success: false,
        errors: ['Missing required sections in calculation result']
      };
    }

    // Step 1: Cast On for working in the round
    instructions.push({
      step: stepNumber++,
      section: 'setup',
      text: generateCastOnInstructionInRound(
        calculationResult.calculations.castOnStitches,
        craftType,
        yarnName,
        needleSize
      )
    });

    // Steps 2+: Brim instructions
    const brimInstructions = generateBrimInstructions(brimSection, beanieAttributes.brim_style, craftType);
    brimInstructions.forEach(instruction => {
      instruction.step = stepNumber++;
      instructions.push(instruction);
    });

    // Body instructions
    const bodyInstructions = generateBodyInstructions(bodySection, craftType, stepNumber++);
    instructions.push(...bodyInstructions);
    stepNumber += bodyInstructions.length;

    // Crown instructions
    const crownInstructions = generateCrownInstructions(
      crownSection,
      beanieAttributes.crown_style,
      calculationResult.calculations.crownDecreasePoints || 8,
      calculationResult.calculations.castOnStitches,
      craftType,
      stepNumber
    );
    instructions.push(...crownInstructions);
    stepNumber += crownInstructions.length;

    // Finishing instructions
    const finishingInstructions = generateFinishingInstructions(
      crownSection.stitches,
      craftType,
      stepNumber
    );
    instructions.push(...finishingInstructions);

    // Add warnings from calculation result
    if (calculationResult.warnings) {
      warnings.push(...calculationResult.warnings);
    }

    // Generate summary
    const totalStitches = calculationResult.calculations.castOnStitches * calculationResult.calculations.totalRounds;
    const summary = {
      totalSteps: instructions.length,
      estimatedTime: estimateCompletionTime(totalStitches, craftType),
      skillLevel: estimateSkillLevel(beanieAttributes, craftType)
    };

    return {
      success: true,
      instructions,
      warnings: warnings.length > 0 ? warnings : undefined,
      summary
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Failed to generate beanie instructions: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
} 