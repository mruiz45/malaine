/**
 * Hammer Sleeve Instruction Generator (US_12.4)
 * Generates detailed textual instructions for hammer sleeve construction
 * Integrates tapered sleeve logic from US_7.2/7.3
 * Supports both English and French instruction generation
 */

import {
  DetailedInstruction,
  InstructionGenerationContext,
  InstructionGenerationConfig,
  HammerSleeveStepType,
  HammerSleeveComponent
} from '@/types/instruction-generation';
import {
  HammerSleeveCalculations,
  HammerSleeveShaping,
  BodyPanelHammerArmholeShaping
} from '@/types/hammer-sleeve-construction';
import { ShapingSchedule, ShapingEvent } from '@/types/shaping';

/**
 * Context for hammer sleeve instruction generation
 */
export interface HammerSleeveInstructionContext {
  /** Craft type */
  craftType: 'knitting' | 'crochet';
  /** Hammer sleeve calculations from US_12.3 */
  hammerSleeveCalculations: HammerSleeveCalculations;
  /** Component key for identification */
  componentKey: string;
  /** Component display name */
  componentDisplayName: string;
  /** Configuration options */
  config: InstructionGenerationConfig;
  /** Optional tapered sleeve shaping schedule for main sleeve */
  sleeveShapingSchedule?: ShapingSchedule;
}

/**
 * Result of hammer sleeve instruction generation
 */
export interface HammerSleeveInstructionResult {
  /** Success status */
  success: boolean;
  /** Generated instructions for all components */
  instructions?: {
    /** Instructions for sleeve components */
    sleeve: DetailedInstruction[];
    /** Instructions for front body panel */
    front_body: DetailedInstruction[];
    /** Instructions for back body panel */
    back_body: DetailedInstruction[];
    /** Assembly instructions */
    assembly: DetailedInstruction[];
  };
  /** Error message if generation failed */
  error?: string;
  /** Warnings during generation */
  warnings?: string[];
  /** Summary information */
  summary?: {
    totalInstructions: number;
    totalRows: number;
    components: string[];
  };
}

/**
 * Generate complete hammer sleeve instructions (FR1-FR5)
 * @param context - Hammer sleeve instruction context
 * @returns Complete instruction generation result
 */
export function generateHammerSleeveInstructions(
  context: HammerSleeveInstructionContext
): HammerSleeveInstructionResult {
  try {
    const warnings: string[] = [];
    let totalInstructions = 0;
    let totalRows = 0;

    // FR2: Generate sleeve instructions (main + vertical + extension)
    const sleeveInstructions = generateSleeveInstructions(context, warnings);
    totalInstructions += sleeveInstructions.length;
    totalRows += calculateRowsFromInstructions(sleeveInstructions);

    // FR3: Generate body panel instructions (front and back)
    const frontBodyInstructions = generateBodyPanelInstructions(context, 'front', warnings);
    const backBodyInstructions = generateBodyPanelInstructions(context, 'back', warnings);
    totalInstructions += frontBodyInstructions.length + backBodyInstructions.length;
    totalRows += calculateRowsFromInstructions(frontBodyInstructions) + 
                 calculateRowsFromInstructions(backBodyInstructions);

    // FR5: Generate assembly instructions
    const assemblyInstructions = generateAssemblyInstructions(context, warnings);
    totalInstructions += assemblyInstructions.length;

    return {
      success: true,
      instructions: {
        sleeve: sleeveInstructions,
        front_body: frontBodyInstructions,
        back_body: backBodyInstructions,
        assembly: assemblyInstructions
      },
      warnings: warnings.length > 0 ? warnings : undefined,
      summary: {
        totalInstructions,
        totalRows,
        components: ['sleeve', 'front_body', 'back_body', 'assembly']
      }
    };

  } catch (error) {
    console.error('Error generating hammer sleeve instructions:', error);
    return {
      success: false,
      error: `Failed to generate hammer sleeve instructions: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generate sleeve instructions (FR2)
 * Includes main sleeve (with optional tapering), vertical part, and extension
 */
function generateSleeveInstructions(
  context: HammerSleeveInstructionContext,
  warnings: string[]
): DetailedInstruction[] {
  const instructions: DetailedInstruction[] = [];
  const { hammerSleeveCalculations, config, craftType, sleeveShapingSchedule } = context;
  const { hammer_sleeve_shaping } = hammerSleeveCalculations;
  
  let stepNumber = 1;
  let currentStitchCount = hammer_sleeve_shaping.sleeve_cap_vertical_part.width_stitches;

  // Step 1: Cast on for main sleeve
  const castOnInstruction = generateSleeveCastOnInstruction(
    craftType,
    currentStitchCount,
    config,
    stepNumber++
  );
  instructions.push(castOnInstruction);

  // Steps 2-N: Main sleeve with optional tapering (integrate US_7.2/7.3 logic)
  if (sleeveShapingSchedule && sleeveShapingSchedule.hasShaping) {
    const taperedInstructions = generateTaperedSleeveInstructions(
      context,
      sleeveShapingSchedule,
      stepNumber,
      currentStitchCount,
      warnings
    );
    instructions.push(...taperedInstructions.instructions);
    stepNumber = taperedInstructions.nextStep;
    currentStitchCount = taperedInstructions.finalStitchCount;
  } else {
    // Plain sleeve to armpit
    const plainRows = estimateMainSleeveRows(hammer_sleeve_shaping);
    const plainInstruction = generatePlainSleeveInstruction(
      craftType,
      plainRows,
      config,
      stepNumber++,
      currentStitchCount
    );
    instructions.push(plainInstruction);
  }

  // Vertical part of sleeve cap
  const verticalInstructions = generateVerticalPartInstructions(
    context,
    stepNumber,
    currentStitchCount,
    warnings
  );
  instructions.push(...verticalInstructions.instructions);
  stepNumber = verticalInstructions.nextStep;
  currentStitchCount = verticalInstructions.finalStitchCount;

  // Extension part (tricotée en continuité)
  const extensionInstructions = generateExtensionInstructions(
    context,
    stepNumber,
    currentStitchCount,
    warnings
  );
  instructions.push(...extensionInstructions.instructions);

  return instructions;
}

/**
 * Generate body panel instructions (FR3)
 * Creates instructions for front or back body panel with armhole cutout
 */
function generateBodyPanelInstructions(
  context: HammerSleeveInstructionContext,
  panel: 'front' | 'back',
  warnings: string[]
): DetailedInstruction[] {
  const instructions: DetailedInstruction[] = [];
  const { hammerSleeveCalculations, config, craftType } = context;
  const { body_panel_hammer_armhole_shaping } = hammerSleeveCalculations;
  
  let stepNumber = 1;
  const totalBodyStitches = body_panel_hammer_armhole_shaping.body_width_at_chest_stitches;

  // Step 1: Cast on for body
  const castOnInstruction = generateBodyCastOnInstruction(
    craftType,
    totalBodyStitches,
    panel,
    config,
    stepNumber++
  );
  instructions.push(castOnInstruction);

  // Step 2: Work to armhole height
  const bodyRows = estimateBodyRowsToArmhole(body_panel_hammer_armhole_shaping);
  const bodyInstruction = generateBodyToArmholeInstruction(
    craftType,
    bodyRows,
    panel,
    config,
    stepNumber++,
    totalBodyStitches
  );
  instructions.push(bodyInstruction);

  // Step 3: Armhole cutout bind-off (FR3 key requirement)
  const cutoutInstruction = generateArmholeCutoutInstruction(
    context,
    panel,
    stepNumber++,
    totalBodyStitches
  );
  instructions.push(cutoutInstruction);

  // Step 4-N: Continue on shoulder straps separately
  const shoulderStrapInstructions = generateShoulderStrapInstructions(
    context,
    panel,
    stepNumber,
    warnings
  );
  instructions.push(...shoulderStrapInstructions);

  return instructions;
}

/**
 * Generate assembly instructions (FR5)
 */
function generateAssemblyInstructions(
  context: HammerSleeveInstructionContext,
  warnings: string[]
): DetailedInstruction[] {
  const instructions: DetailedInstruction[] = [];
  const { config, craftType } = context;
  
  let stepNumber = 1;

  // Assembly instruction for joining sleeve extension to body shoulder straps
  const joinInstruction = generateJoinExtensionInstruction(
    craftType,
    config,
    stepNumber++
  );
  instructions.push(joinInstruction);

  // Side seam assembly
  const sideSeamInstruction = generateSideSeamInstruction(
    craftType,
    config,
    stepNumber++
  );
  instructions.push(sideSeamInstruction);

  // Finishing instruction
  const finishingInstruction = generateFinishingInstruction(
    craftType,
    config,
    stepNumber++
  );
  instructions.push(finishingInstruction);

  return instructions;
}

/**
 * Generate tapered sleeve instructions (integrate US_7.2/7.3 logic)
 */
function generateTaperedSleeveInstructions(
  context: HammerSleeveInstructionContext,
  shapingSchedule: ShapingSchedule,
  startStep: number,
  startStitchCount: number,
  warnings: string[]
): { instructions: DetailedInstruction[], nextStep: number, finalStitchCount: number } {
  const instructions: DetailedInstruction[] = [];
  const { craftType, config } = context;
  
  let currentStep = startStep;
  let currentStitchCount = startStitchCount;
  let currentRow = 1;

  // Process each shaping event in the schedule
  for (const shapingEvent of shapingSchedule.shapingEvents) {
    // Calculate total interval rows for this shaping event
    // Use the total shaping rows divided by the number of events as an approximation
    const totalIntervalRows = Math.ceil(shapingSchedule.totalShapingRows / shapingEvent.numShapingEvents);
    
    // Generate shaping rows according to the event
    for (let i = 0; i < shapingEvent.numShapingEvents; i++) {
      // Calculate when this shaping should occur
      const shapingInterval = Math.ceil(totalIntervalRows / shapingEvent.numShapingEvents);
      const shapingRow = currentRow + (i * shapingInterval);
      
      // Work plain rows up to shaping row
      if (i === 0 || shapingInterval > 1) {
        const plainRowCount = i === 0 ? shapingInterval - 1 : shapingInterval - 1;
        if (plainRowCount > 0) {
          const plainInstruction = generatePlainSleeveInstruction(
            craftType,
            plainRowCount,
            config,
            currentStep++,
            currentStitchCount
          );
          instructions.push(plainInstruction);
        }
      }

      // Generate shaping instruction
      const stitchChange = shapingEvent.type === 'increase' ? shapingEvent.stitchesPerEvent : -shapingEvent.stitchesPerEvent;
      currentStitchCount += stitchChange;

      const shapingInstruction = generateTaperedSleeveShapingInstruction(
        craftType,
        shapingEvent.type,
        shapingRow,
        currentStitchCount,
        config,
        currentStep++
      );
      instructions.push(shapingInstruction);
    }
    
    currentRow += totalIntervalRows;
  }

  return {
    instructions,
    nextStep: currentStep,
    finalStitchCount: currentStitchCount
  };
}

/**
 * Generate vertical part instructions
 */
function generateVerticalPartInstructions(
  context: HammerSleeveInstructionContext,
  startStep: number,
  startStitchCount: number,
  warnings: string[]
): { instructions: DetailedInstruction[], nextStep: number, finalStitchCount: number } {
  const instructions: DetailedInstruction[] = [];
  const { hammerSleeveCalculations, craftType, config } = context;
  const { sleeve_cap_vertical_part } = hammerSleeveCalculations.hammer_sleeve_shaping;
  
  let currentStep = startStep;
  
  // Work straight up for armhole depth
  const verticalInstruction = generateVerticalPartInstruction(
    craftType,
    sleeve_cap_vertical_part.height_rows,
    sleeve_cap_vertical_part.width_stitches,
    config,
    currentStep++
  );
  instructions.push(verticalInstruction);

  return {
    instructions,
    nextStep: currentStep,
    finalStitchCount: startStitchCount
  };
}

/**
 * Generate extension instructions (tricotée en continuité)
 */
function generateExtensionInstructions(
  context: HammerSleeveInstructionContext,
  startStep: number,
  startStitchCount: number,
  warnings: string[]
): { instructions: DetailedInstruction[], nextStep: number, finalStitchCount: number } {
  const instructions: DetailedInstruction[] = [];
  const { hammerSleeveCalculations, craftType, config } = context;
  const { sleeve_cap_extension } = hammerSleeveCalculations.hammer_sleeve_shaping;
  
  let currentStep = startStep;
  
  // Continue with subset of stitches for extension
  const extensionStitches = sleeve_cap_extension.width_stitches;
  const extensionInstruction = generateExtensionContinuationInstruction(
    craftType,
    extensionStitches,
    sleeve_cap_extension.length_rows,
    startStitchCount,
    config,
    currentStep++
  );
  instructions.push(extensionInstruction);

  return {
    instructions,
    nextStep: currentStep,
    finalStitchCount: extensionStitches
  };
}

/**
 * Generate shoulder strap instructions
 */
function generateShoulderStrapInstructions(
  context: HammerSleeveInstructionContext,
  panel: 'front' | 'back',
  startStep: number,
  warnings: string[]
): DetailedInstruction[] {
  const instructions: DetailedInstruction[] = [];
  const { hammerSleeveCalculations, craftType, config } = context;
  const { body_panel_hammer_armhole_shaping } = hammerSleeveCalculations;
  
  let currentStep = startStep;
  const strapStitches = body_panel_hammer_armhole_shaping.shoulder_strap_width_stitches;
  const strapRows = body_panel_hammer_armhole_shaping.armhole_depth_rows;

  // Instructions for both left and right shoulder straps
  const leftStrapInstruction = generateShoulderStrapInstruction(
    craftType,
    'left',
    strapStitches,
    strapRows,
    panel,
    config,
    currentStep++
  );
  instructions.push(leftStrapInstruction);

  const rightStrapInstruction = generateShoulderStrapInstruction(
    craftType,
    'right',
    strapStitches,
    strapRows,
    panel,
    config,
    currentStep++
  );
  instructions.push(rightStrapInstruction);

  return instructions;
}

// Instruction text generation functions with multilingual support

/**
 * Generate cast-on instruction for sleeve
 */
function generateSleeveCastOnInstruction(
  craftType: 'knitting' | 'crochet',
  stitchCount: number,
  config: InstructionGenerationConfig,
  step: number
): DetailedInstruction {
  const isEn = config.language === 'en';
  
  let text: string;
  if (craftType === 'knitting') {
    text = isEn 
      ? `Cast on ${stitchCount} stitches.`
      : `Monter ${stitchCount} mailles.`;
  } else {
    text = isEn
      ? `Chain ${stitchCount + 1}. Single crochet in 2nd chain from hook and in each chain across.`
      : `Faire ${stitchCount + 1} mailles en l'air. Bride simple dans la 2e maille en l'air à partir du crochet et dans chaque maille en l'air.`;
  }

  if (config.includeStitchCounts) {
    const stitchText = isEn ? `(${stitchCount} sts)` : `(${stitchCount} m)`;
    text += ` ${stitchText}`;
  }

  return {
    step,
    type: 'cast_on',
    text,
    stitchCount: config.includeStitchCounts ? stitchCount : undefined,
    metadata: {
      hammer_sleeve: {
        step_type: 'main_sleeve_cast_on',
        hammer_sleeve_step: 1,
        component: 'sleeve_main',
        component_width_stitches: stitchCount
      }
    }
  };
}

/**
 * Generate plain sleeve instruction
 */
function generatePlainSleeveInstruction(
  craftType: 'knitting' | 'crochet',
  rowCount: number,
  config: InstructionGenerationConfig,
  step: number,
  stitchCount: number
): DetailedInstruction {
  const isEn = config.language === 'en';
  const patternName = craftType === 'knitting' 
    ? (isEn ? 'Stockinette Stitch' : 'Point Jersey')
    : (isEn ? 'Single Crochet' : 'Bride Simple');
  
  let text: string;
  if (rowCount === 1) {
    text = isEn
      ? `Continue in ${patternName}, work 1 row plain.`
      : `Continuer en ${patternName}, tricoter 1 rang.`;
  } else {
    text = isEn
      ? `Continue in ${patternName}, work ${rowCount} rows plain.`
      : `Continuer en ${patternName}, tricoter ${rowCount} rangs.`;
  }

  if (config.includeStitchCounts) {
    const stitchText = isEn ? `(${stitchCount} sts)` : `(${stitchCount} m)`;
    text += ` ${stitchText}`;
  }

  return {
    step,
    type: 'plain_segment',
    text,
    stitchCount: config.includeStitchCounts ? stitchCount : undefined,
    metadata: {
      hammer_sleeve: {
        step_type: 'main_sleeve_tapered',
        hammer_sleeve_step: step,
        component: 'sleeve_main',
        component_width_stitches: stitchCount
      }
    }
  };
}

/**
 * Generate tapered sleeve shaping instruction
 */
function generateTaperedSleeveShapingInstruction(
  craftType: 'knitting' | 'crochet',
  shapingType: 'increase' | 'decrease',
  rowNumber: number,
  finalStitchCount: number,
  config: InstructionGenerationConfig,
  step: number
): DetailedInstruction {
  const isEn = config.language === 'en';
  const isRightSide = rowNumber % 2 === 1;
  const sideIndicator = isEn 
    ? (isRightSide ? 'RS' : 'WS')
    : (isRightSide ? 'End' : 'Env');
  
  let text: string;
  
  if (craftType === 'knitting') {
    if (shapingType === 'increase') {
      text = isEn
        ? `Row ${rowNumber} (${sideIndicator} - Increase Row): K1, M1L, knit to last st, M1R, k1.`
        : `Rang ${rowNumber} (${sideIndicator} - Rang d'augmentation): 1 m end, 1 aug interc à gauche, tricoter jusqu'à la dernière m, 1 aug interc à droite, 1 m end.`;
    } else {
      text = isEn
        ? `Row ${rowNumber} (${sideIndicator} - Decrease Row): K1, k2tog, knit to last 3 sts, ssk, k1.`
        : `Rang ${rowNumber} (${sideIndicator} - Rang de diminution): 1 m end, 2 m ens à droite, tricoter jusqu'aux 3 dernières m, 2 m ens à gauche, 1 m end.`;
    }
  } else {
    if (shapingType === 'increase') {
      text = isEn
        ? `Row ${rowNumber} (Increase Row): Sc1, 2 sc in next st, sc across to last st, 2 sc in last st.`
        : `Rang ${rowNumber} (Rang d'augmentation): 1 bs, 2 bs dans la m suiv, bs jusqu'à la dernière m, 2 bs dans la dernière m.`;
    } else {
      text = isEn
        ? `Row ${rowNumber} (Decrease Row): Sc1, sc2tog, sc across to last 3 sts, sc2tog, sc1.`
        : `Rang ${rowNumber} (Rang de diminution): 1 bs, 2 bs ens, bs jusqu'aux 3 dernières m, 2 bs ens, 1 bs.`;
    }
  }

  if (config.includeStitchCounts) {
    const stitchText = isEn ? `(${finalStitchCount} sts)` : `(${finalStitchCount} m)`;
    text += ` ${stitchText}`;
  }

  return {
    step,
    type: 'shaping_row',
    text,
    stitchCount: config.includeStitchCounts ? finalStitchCount : undefined,
    metadata: {
      isRightSide,
      stitchesChanged: shapingType === 'increase' ? 2 : -2,
      shapingType,
      hammer_sleeve: {
        step_type: 'main_sleeve_tapered',
        hammer_sleeve_step: step,
        component: 'sleeve_main',
        component_width_stitches: finalStitchCount,
        is_taper_shaping_row: true
      }
    }
  };
}

/**
 * Generate vertical part instruction
 */
function generateVerticalPartInstruction(
  craftType: 'knitting' | 'crochet',
  heightRows: number,
  widthStitches: number,
  config: InstructionGenerationConfig,
  step: number
): DetailedInstruction {
  const isEn = config.language === 'en';
  const patternName = craftType === 'knitting' 
    ? (isEn ? 'Stockinette Stitch' : 'Point Jersey')
    : (isEn ? 'Single Crochet' : 'Bride Simple');
  
  const text = isEn
    ? `Work straight in ${patternName} for ${heightRows} rows (vertical part of sleeve cap).`
    : `Tricoter droit en ${patternName} pendant ${heightRows} rangs (partie verticale de la tête de manche).`;

  return {
    step,
    type: 'hammer_sleeve_vertical',
    text,
    stitchCount: config.includeStitchCounts ? widthStitches : undefined,
    metadata: {
      hammer_sleeve: {
        step_type: 'vertical_part_plain',
        hammer_sleeve_step: step,
        component: 'sleeve_vertical_part',
        component_width_stitches: widthStitches,
        component_row: heightRows
      }
    }
  };
}

/**
 * Generate extension continuation instruction
 */
function generateExtensionContinuationInstruction(
  craftType: 'knitting' | 'crochet',
  extensionStitches: number,
  extensionRows: number,
  totalStitches: number,
  config: InstructionGenerationConfig,
  step: number
): DetailedInstruction {
  const isEn = config.language === 'en';
  const patternName = craftType === 'knitting' 
    ? (isEn ? 'Stockinette Stitch' : 'Point Jersey')
    : (isEn ? 'Single Crochet' : 'Bride Simple');
  
  const centerStitches = Math.floor((totalStitches - extensionStitches) / 2);
  
  const text = isEn
    ? `Continue with center ${extensionStitches} stitches only (place remaining ${centerStitches} stitches each side on hold). Work in ${patternName} for ${extensionRows} rows to form shoulder extension.`
    : `Continuer avec les ${extensionStitches} mailles centrales seulement (mettre les ${centerStitches} mailles restantes de chaque côté en attente). Tricoter en ${patternName} pendant ${extensionRows} rangs pour former l'extension d'épaule.`;

  return {
    step,
    type: 'hammer_sleeve_extension',
    text,
    stitchCount: config.includeStitchCounts ? extensionStitches : undefined,
    metadata: {
      hammer_sleeve: {
        step_type: 'extension_continuation',
        hammer_sleeve_step: step,
        component: 'sleeve_extension',
        component_width_stitches: extensionStitches,
        component_row: extensionRows
      }
    }
  };
}

/**
 * Generate body cast-on instruction
 */
function generateBodyCastOnInstruction(
  craftType: 'knitting' | 'crochet',
  stitchCount: number,
  panel: 'front' | 'back',
  config: InstructionGenerationConfig,
  step: number
): DetailedInstruction {
  const isEn = config.language === 'en';
  const panelName = isEn 
    ? (panel === 'front' ? 'Front' : 'Back')
    : (panel === 'front' ? 'Devant' : 'Dos');
  
  let text: string;
  if (craftType === 'knitting') {
    text = isEn 
      ? `${panelName}: Cast on ${stitchCount} stitches.`
      : `${panelName}: Monter ${stitchCount} mailles.`;
  } else {
    text = isEn
      ? `${panelName}: Chain ${stitchCount + 1}. Single crochet in 2nd chain from hook and in each chain across.`
      : `${panelName}: Faire ${stitchCount + 1} mailles en l'air. Bride simple dans la 2e maille en l'air à partir du crochet et dans chaque maille en l'air.`;
  }

  if (config.includeStitchCounts) {
    const stitchText = isEn ? `(${stitchCount} sts)` : `(${stitchCount} m)`;
    text += ` ${stitchText}`;
  }

  return {
    step,
    type: 'cast_on',
    text,
    stitchCount: config.includeStitchCounts ? stitchCount : undefined,
    metadata: {
      hammer_sleeve: {
        step_type: 'main_sleeve_cast_on',
        hammer_sleeve_step: 1,
        component: panel === 'front' ? 'body_front' : 'body_back',
        component_width_stitches: stitchCount
      }
    }
  };
}

/**
 * Generate body to armhole instruction
 */
function generateBodyToArmholeInstruction(
  craftType: 'knitting' | 'crochet',
  rowCount: number,
  panel: 'front' | 'back',
  config: InstructionGenerationConfig,
  step: number,
  stitchCount: number
): DetailedInstruction {
  const isEn = config.language === 'en';
  const patternName = craftType === 'knitting' 
    ? (isEn ? 'Stockinette Stitch' : 'Point Jersey')
    : (isEn ? 'Single Crochet' : 'Bride Simple');
  
  const text = isEn
    ? `Work in ${patternName} for ${rowCount} rows to armhole height.`
    : `Tricoter en ${patternName} pendant ${rowCount} rangs jusqu'à la hauteur d'emmanchure.`;

  return {
    step,
    type: 'plain_segment',
    text,
    stitchCount: config.includeStitchCounts ? stitchCount : undefined,
    metadata: {
      hammer_sleeve: {
        step_type: 'vertical_part_plain',
        hammer_sleeve_step: step,
        component: panel === 'front' ? 'body_front' : 'body_back',
        component_width_stitches: stitchCount,
        component_row: rowCount
      }
    }
  };
}

/**
 * Generate armhole cutout instruction (FR3 key requirement)
 */
function generateArmholeCutoutInstruction(
  context: HammerSleeveInstructionContext,
  panel: 'front' | 'back',
  step: number,
  totalStitches: number
): DetailedInstruction {
  const { hammerSleeveCalculations, craftType, config } = context;
  const { body_panel_hammer_armhole_shaping } = hammerSleeveCalculations;
  const isEn = config.language === 'en';
  
  const shoulderStrapStitches = body_panel_hammer_armhole_shaping.shoulder_strap_width_stitches;
  const bindOffStitches = body_panel_hammer_armhole_shaping.bind_off_for_cutout_stitches;
  
  const bindOffTerm = craftType === 'knitting' 
    ? (isEn ? 'bind off' : 'rabattre')
    : (isEn ? 'skip' : 'passer');
  
  const stitchTerm = craftType === 'knitting' 
    ? (isEn ? 'knit' : 'tricoter')
    : (isEn ? 'sc' : 'bs');
  
  const text = isEn
    ? `${stitchTerm.charAt(0).toUpperCase() + stitchTerm.slice(1)} ${shoulderStrapStitches} stitches (left shoulder strap), ${bindOffTerm} ${bindOffStitches} stitches (armhole cutout), ${stitchTerm} ${shoulderStrapStitches} stitches (right shoulder strap).`
    : `${stitchTerm.charAt(0).toUpperCase() + stitchTerm.slice(1)} ${shoulderStrapStitches} mailles (bretelle d'épaule gauche), ${bindOffTerm} ${bindOffStitches} mailles (découpe emmanchure), ${stitchTerm} ${shoulderStrapStitches} mailles (bretelle d'épaule droite).`;

  return {
    step,
    type: 'body_armhole_cutout',
    text,
    stitchCount: config.includeStitchCounts ? totalStitches - bindOffStitches : undefined,
    metadata: {
      hammer_sleeve: {
        step_type: 'body_cutout_bind_off',
        hammer_sleeve_step: step,
        component: panel === 'front' ? 'body_front' : 'body_back',
        component_width_stitches: totalStitches - bindOffStitches,
        bind_off_stitches: bindOffStitches
      }
    }
  };
}

/**
 * Generate shoulder strap instruction
 */
function generateShoulderStrapInstruction(
  craftType: 'knitting' | 'crochet',
  side: 'left' | 'right',
  stitches: number,
  rows: number,
  panel: 'front' | 'back',
  config: InstructionGenerationConfig,
  step: number
): DetailedInstruction {
  const isEn = config.language === 'en';
  const sideName = isEn 
    ? (side === 'left' ? 'left' : 'right')
    : (side === 'left' ? 'gauche' : 'droite');
  const patternName = craftType === 'knitting' 
    ? (isEn ? 'Stockinette Stitch' : 'Point Jersey')
    : (isEn ? 'Single Crochet' : 'Bride Simple');
  
  const text = isEn
    ? `Continue on ${sideName} shoulder strap only (${stitches} stitches). Work in ${patternName} for ${rows} rows.`
    : `Continuer sur la bretelle d'épaule ${sideName} seulement (${stitches} mailles). Tricoter en ${patternName} pendant ${rows} rangs.`;

  return {
    step,
    type: 'shoulder_strap_work',
    text,
    stitchCount: config.includeStitchCounts ? stitches : undefined,
    metadata: {
      hammer_sleeve: {
        step_type: 'shoulder_strap_plain',
        hammer_sleeve_step: step,
        component: panel === 'front' ? 'body_front' : 'body_back',
        component_width_stitches: stitches,
        component_row: rows,
        shoulder_strap_side: side
      }
    }
  };
}

/**
 * Generate join extension instruction
 */
function generateJoinExtensionInstruction(
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig,
  step: number
): DetailedInstruction {
  const isEn = config.language === 'en';
  
  const joinMethod = craftType === 'knitting'
    ? (isEn ? 'seaming' : 'couture')
    : (isEn ? 'slip stitching' : 'mailles coulées');
  
  const text = isEn
    ? `Join sleeve extensions to body shoulder straps using ${joinMethod}.`
    : `Joindre les extensions de manche aux bretelles d'épaule du corps en utilisant la ${joinMethod}.`;

  return {
    step,
    type: 'hammer_assembly',
    text,
    metadata: {
      hammer_sleeve: {
        step_type: 'assembly_joining',
        hammer_sleeve_step: step,
        component: 'assembly'
      }
    }
  };
}

/**
 * Generate side seam instruction
 */
function generateSideSeamInstruction(
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig,
  step: number
): DetailedInstruction {
  const isEn = config.language === 'en';
  
  const text = isEn
    ? `Sew side seams and underarm seams.`
    : `Coudre les coutures latérales et les coutures sous les bras.`;

  return {
    step,
    type: 'hammer_assembly',
    text,
    metadata: {
      hammer_sleeve: {
        step_type: 'assembly_joining',
        hammer_sleeve_step: step,
        component: 'assembly'
      }
    }
  };
}

/**
 * Generate finishing instruction
 */
function generateFinishingInstruction(
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig,
  step: number
): DetailedInstruction {
  const isEn = config.language === 'en';
  
  const text = isEn
    ? `Weave in all ends and block to measurements.`
    : `Rentrer tous les fils et bloquer aux mesures.`;

  return {
    step,
    type: 'finishing',
    text,
    metadata: {
      hammer_sleeve: {
        step_type: 'assembly_joining',
        hammer_sleeve_step: step,
        component: 'assembly'
      }
    }
  };
}

// Helper functions

/**
 * Estimate main sleeve rows to armpit
 */
function estimateMainSleeveRows(hammerSleeveShaping: HammerSleeveShaping): number {
  // Simple estimation - could be enhanced with actual sleeve length calculation
  return Math.max(20, hammerSleeveShaping.sleeve_cap_vertical_part.height_rows);
}

/**
 * Estimate body rows to armhole
 */
function estimateBodyRowsToArmhole(bodyShaping: BodyPanelHammerArmholeShaping): number {
  // Simple estimation - could be enhanced with actual body length calculation
  return Math.max(40, bodyShaping.armhole_depth_rows * 2);
}

/**
 * Calculate total rows from instructions
 */
function calculateRowsFromInstructions(instructions: DetailedInstruction[]): number {
  return instructions.reduce((total, instruction) => {
    if (instruction.type === 'shaping_row' || instruction.type === 'setup_row') {
      return total + 1;
    } else if (instruction.type === 'plain_segment') {
      // Extract row count from instruction text (basic parsing)
      const match = instruction.text.match(/work (\d+) rows?|pendant (\d+) rangs?/i);
      return total + (match ? parseInt(match[1] || match[2]) : 1);
    }
    return total;
  }, 0);
} 