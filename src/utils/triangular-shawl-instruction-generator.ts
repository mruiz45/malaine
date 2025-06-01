/**
 * Triangular Shawl Instruction Generator (US_12.6)
 * Generates detailed textual instructions for triangular shawl construction methods
 */

import {
  TriangularShawlInstructionContext,
  TriangularShawlInstructionResult,
  TriangularShawlPhaseType,
  DEFAULT_TRIANGULAR_SHAWL_INCREASE_TECHNIQUES,
  DEFAULT_TRIANGULAR_SHAWL_DECREASE_TECHNIQUES,
  getDefaultMarkerInstructions
} from '@/types/triangular-shawl-instruction';
import {
  TriangularShawlCalculations,
  TriangularShawlConstructionMethod,
  TriangularShawlShapingPhase
} from '@/types/triangular-shawl';
import { DetailedInstruction } from '@/types/instruction-generation';

// Export types for use in other modules
export type {
  TriangularShawlInstructionContext,
  TriangularShawlInstructionResult,
  TriangularShawlPhaseType
} from '@/types/triangular-shawl-instruction';

/**
 * Main function to generate triangular shawl instructions (US_12.6)
 * @param context - Instruction generation context
 * @returns Generated triangular shawl instructions
 */
export function generateTriangularShawlInstructions(
  context: TriangularShawlInstructionContext
): TriangularShawlInstructionResult {
  try {
    const { triangularShawlCalculations, craftType, config } = context;

    // Generate instructions based on construction method
    switch (triangularShawlCalculations.construction_method) {
      case 'top_down_center_out':
        return generateTopDownCenterOutInstructions(context);
      case 'side_to_side':
        return generateSideToSideInstructions(context);
      case 'bottom_up':
        return generateBottomUpInstructions(context);
      default:
        return {
          success: false,
          error: `Unsupported construction method: ${triangularShawlCalculations.construction_method}`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during triangular shawl instruction generation'
    };
  }
}

/**
 * Generates instructions for top-down center-out construction (FR2)
 * @param context - Instruction generation context
 * @returns Generated instructions
 */
export function generateTopDownCenterOutInstructions(
  context: TriangularShawlInstructionContext
): TriangularShawlInstructionResult {
  const { triangularShawlCalculations, craftType, config } = context;
  const calculations = triangularShawlCalculations;
  const instructions: DetailedInstruction[] = [];
  const warnings: string[] = [];
  let stepNumber = 1;

  try {
    // Step 1: Cast-on instructions
    const castOnInstruction = generateCastOnInstruction(
      calculations.setup.cast_on_stitches,
      craftType,
      config,
      stepNumber++
    );
    instructions.push(castOnInstruction);

    // Step 2: Setup row with marker placement
    const markerInstructions = getDefaultMarkerInstructions(
      calculations.construction_method,
      config.language
    );
    
    if (markerInstructions.useMarkers) {
      const setupInstruction = generateTopDownSetupInstruction(
        calculations.setup.cast_on_stitches,
        markerInstructions,
        craftType,
        config,
        stepNumber++
      );
      instructions.push(setupInstruction);
    }

    // Step 3: Increase phase instructions
    const increasePhase = calculations.shaping_schedule.phase_1_increases;
    if (increasePhase) {
      const increaseInstructions = generateTopDownIncreaseInstructions(
        increasePhase,
        calculations.setup.cast_on_stitches,
        craftType,
        config,
        stepNumber
      );
      instructions.push(...increaseInstructions.instructions);
      stepNumber = increaseInstructions.nextStep;
    }

    // Step Final: Bind-off instruction
    const bindOffInstruction = generateBindOffInstruction(
      calculations.final_stitch_count,
      craftType,
      config,
      stepNumber++
    );
    instructions.push(bindOffInstruction);

    // Add warnings from calculations
    if (calculations.warnings) {
      warnings.push(...calculations.warnings);
    }

    return {
      success: true,
      instructions,
      warnings: warnings.length > 0 ? warnings : undefined,
      summary: {
        totalInstructions: instructions.length,
        totalRows: calculations.total_rows_knit,
        finalStitchCount: calculations.final_stitch_count,
        constructionMethod: calculations.construction_method
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Failed to generate top-down center-out instructions: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generates instructions for side-to-side construction (FR3)
 * @param context - Instruction generation context
 * @returns Generated instructions
 */
export function generateSideToSideInstructions(
  context: TriangularShawlInstructionContext
): TriangularShawlInstructionResult {
  const { triangularShawlCalculations, craftType, config } = context;
  const calculations = triangularShawlCalculations;
  const instructions: DetailedInstruction[] = [];
  const warnings: string[] = [];
  let stepNumber = 1;

  try {
    // Step 1: Cast-on instructions
    const castOnInstruction = generateCastOnInstruction(
      calculations.setup.cast_on_stitches,
      craftType,
      config,
      stepNumber++
    );
    instructions.push(castOnInstruction);

    // Step 2: Increase phase (first half)
    const increasePhase = calculations.shaping_schedule.phase_1_increases;
    if (increasePhase) {
      const increaseInstructions = generateSideToSideIncreaseInstructions(
        increasePhase,
        calculations.setup.cast_on_stitches,
        craftType,
        config,
        stepNumber
      );
      instructions.push(...increaseInstructions.instructions);
      stepNumber = increaseInstructions.nextStep;
    }

    // Step 3: Transition note
    const transitionInstruction = generateSideToSideTransitionInstruction(
      craftType,
      config,
      stepNumber++
    );
    instructions.push(transitionInstruction);

    // Step 4: Decrease phase (second half)
    const decreasePhase = calculations.shaping_schedule.phase_2_decreases;
    if (decreasePhase) {
      const decreaseInstructions = generateSideToSideDecreaseInstructions(
        decreasePhase,
        craftType,
        config,
        stepNumber
      );
      instructions.push(...decreaseInstructions.instructions);
      stepNumber = decreaseInstructions.nextStep;
    }

    // Step Final: Bind-off instruction
    const bindOffInstruction = generateBindOffInstruction(
      calculations.final_stitch_count,
      craftType,
      config,
      stepNumber++
    );
    instructions.push(bindOffInstruction);

    // Add warnings from calculations
    if (calculations.warnings) {
      warnings.push(...calculations.warnings);
    }

    return {
      success: true,
      instructions,
      warnings: warnings.length > 0 ? warnings : undefined,
      summary: {
        totalInstructions: instructions.length,
        totalRows: calculations.total_rows_knit,
        finalStitchCount: calculations.final_stitch_count,
        constructionMethod: calculations.construction_method
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Failed to generate side-to-side instructions: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generates instructions for bottom-up construction (FR4)
 * @param context - Instruction generation context
 * @returns Generated instructions
 */
export function generateBottomUpInstructions(
  context: TriangularShawlInstructionContext
): TriangularShawlInstructionResult {
  const { triangularShawlCalculations, craftType, config } = context;
  const calculations = triangularShawlCalculations;
  const instructions: DetailedInstruction[] = [];
  const warnings: string[] = [];
  let stepNumber = 1;

  try {
    // Step 1: Cast-on instructions (large number for wingspan)
    const castOnInstruction = generateCastOnInstruction(
      calculations.setup.cast_on_stitches,
      craftType,
      config,
      stepNumber++
    );
    instructions.push(castOnInstruction);

    // Step 2: Decrease phase instructions
    const decreasePhase = calculations.shaping_schedule.phase_2_decreases;
    if (decreasePhase) {
      const decreaseInstructions = generateBottomUpDecreaseInstructions(
        decreasePhase,
        calculations.setup.cast_on_stitches,
        craftType,
        config,
        stepNumber
      );
      instructions.push(...decreaseInstructions.instructions);
      stepNumber = decreaseInstructions.nextStep;
    }

    // Step Final: Bind-off instruction
    const bindOffInstruction = generateBindOffInstruction(
      calculations.final_stitch_count,
      craftType,
      config,
      stepNumber++
    );
    instructions.push(bindOffInstruction);

    // Add warnings from calculations
    if (calculations.warnings) {
      warnings.push(...calculations.warnings);
    }

    return {
      success: true,
      instructions,
      warnings: warnings.length > 0 ? warnings : undefined,
      summary: {
        totalInstructions: instructions.length,
        totalRows: calculations.total_rows_knit,
        finalStitchCount: calculations.final_stitch_count,
        constructionMethod: calculations.construction_method
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Failed to generate bottom-up instructions: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generates cast-on instruction
 */
function generateCastOnInstruction(
  stitchCount: number,
  craftType: 'knitting' | 'crochet',
  config: any,
  stepNumber: number
): DetailedInstruction {
  let instruction: string;

  if (craftType === 'knitting') {
    instruction = config.language === 'fr' 
      ? `Monter ${stitchCount} mailles.`
      : `Cast on ${stitchCount} stitches.`;
  } else {
    instruction = config.language === 'fr'
      ? `Chaînette de ${stitchCount + 1}. Bride dans la 2e chaînette à partir du crochet et dans chaque chaînette. (${stitchCount} br)`
      : `Chain ${stitchCount + 1}. Single crochet in 2nd chain from hook and in each chain across. (${stitchCount} sc)`;
  }

  return {
    step: stepNumber,
    type: 'cast_on',
    text: instruction,
    stitchCount: stitchCount
  };
}

/**
 * Generates setup instruction for top-down center-out with markers
 */
function generateTopDownSetupInstruction(
  stitchCount: number,
  markerInstructions: any,
  craftType: 'knitting' | 'crochet',
  config: any,
  stepNumber: number
): DetailedInstruction {
  let instruction: string;

  if (craftType === 'knitting') {
    instruction = config.language === 'fr'
      ? `Rang de mise en place : Tricoter 1 maille, placer un marqueur, tricoter 1 maille (maille centrale), placer un marqueur, tricoter 1 maille. ${markerInstructions.markerPlacements.centerSpine}`
      : `Setup Row: Knit 1 stitch, place marker, knit 1 stitch (center stitch), place marker, knit 1 stitch. ${markerInstructions.markerPlacements.centerSpine}`;
  } else {
    instruction = config.language === 'fr'
      ? `Tour de mise en place : Bride dans chaque maille. Marquer la maille centrale si désiré.`
      : `Setup Round: Single crochet in each stitch. Mark center stitch if desired.`;
  }

  return {
    step: stepNumber,
    type: 'setup_row',
    text: instruction,
    stitchCount: stitchCount
  };
}

/**
 * Generates increase instructions for top-down center-out
 */
function generateTopDownIncreaseInstructions(
  increasePhase: TriangularShawlShapingPhase,
  startStitchCount: number,
  craftType: 'knitting' | 'crochet',
  config: any,
  startStep: number
): { instructions: DetailedInstruction[], nextStep: number } {
  const instructions: DetailedInstruction[] = [];
  let stepNumber = startStep;
  let currentStitchCount = startStitchCount;

  // Generate increase row instruction with proper type checking
  let increaseRowInstruction: string;
  let plainRowInstruction: string;

  if (craftType === 'knitting') {
    const knittingTechniques = DEFAULT_TRIANGULAR_SHAWL_INCREASE_TECHNIQUES.knitting;
    increaseRowInstruction = config.language === 'fr'
      ? `Rang Endroit (Augmentation) : Tricoter 1, ${knittingTechniques.M1R}, tricoter jusqu'à 1 maille avant le marqueur central, ${knittingTechniques.M1R}, tricoter 1 (maille centrale), ${knittingTechniques.M1L}, tricoter jusqu'au dernier marqueur/maille, ${knittingTechniques.M1L}, tricoter 1.`
      : `Right Side Row (Increase): Knit 1, ${knittingTechniques.M1R}, knit to 1 st before center marker, ${knittingTechniques.M1R}, knit 1 (center st), ${knittingTechniques.M1L}, knit to last marker/st, ${knittingTechniques.M1L}, knit 1.`;
    
    plainRowInstruction = config.language === 'fr'
      ? `Rang Envers : Tricoter à l'envers tous les mailles.`
      : `Wrong Side Row: Purl all stitches.`;
  } else {
    const crochetTechniques = DEFAULT_TRIANGULAR_SHAWL_INCREASE_TECHNIQUES.crochet;
    increaseRowInstruction = config.language === 'fr'
      ? `Tour d'Augmentation : ${crochetTechniques.twoInOne} dans la première maille, bride dans chaque maille jusqu'à la maille centrale, ${crochetTechniques.twoInOne} dans la maille centrale, bride dans chaque maille jusqu'à la dernière maille, ${crochetTechniques.twoInOne} dans la dernière maille.`
      : `Increase Round: ${crochetTechniques.twoInOne} in first st, sc in each st to center st, ${crochetTechniques.twoInOne} in center st, sc in each st to last st, ${crochetTechniques.twoInOne} in last st.`;
    
    plainRowInstruction = config.language === 'fr'
      ? `Tour uni : Bride dans chaque maille.`
      : `Plain Round: Single crochet in each stitch.`;
  }

  // Add the pattern instructions
  instructions.push({
    step: stepNumber++,
    type: 'shaping_row',
    text: increaseRowInstruction + (config.includeStitchCounts ? ` (4 augmentations par rang)` : ''),
    stitchCount: currentStitchCount + increasePhase.stitches_per_event
  });

  if (increasePhase.shaping_frequency > 1) {
    instructions.push({
      step: stepNumber++,
      type: 'pattern_row',
      text: plainRowInstruction,
      stitchCount: currentStitchCount + increasePhase.stitches_per_event
    });
  }

  // Add repeat instruction
  const repeatInstruction = config.language === 'fr'
    ? `Répéter ces ${increasePhase.shaping_frequency} rangs ${increasePhase.total_shaping_rows} fois au total.`
    : `Repeat these ${increasePhase.shaping_frequency} rows ${increasePhase.total_shaping_rows} times total.`;

  instructions.push({
    step: stepNumber++,
    type: 'plain_segment',
    text: repeatInstruction,
    stitchCount: startStitchCount + (increasePhase.total_shaping_rows * increasePhase.stitches_per_event)
  });

  return {
    instructions,
    nextStep: stepNumber
  };
}

/**
 * Generates increase instructions for side-to-side
 */
function generateSideToSideIncreaseInstructions(
  increasePhase: TriangularShawlShapingPhase,
  startStitchCount: number,
  craftType: 'knitting' | 'crochet',
  config: any,
  startStep: number
): { instructions: DetailedInstruction[], nextStep: number } {
  const instructions: DetailedInstruction[] = [];
  let stepNumber = startStep;

  let increaseRowInstruction: string;
  let plainRowInstruction: string;

  if (craftType === 'knitting') {
    const knittingTechniques = DEFAULT_TRIANGULAR_SHAWL_INCREASE_TECHNIQUES.knitting;
    increaseRowInstruction = config.language === 'fr'
      ? `Rang Endroit : ${knittingTechniques.KFB} dans la première maille, tricoter jusqu'à la fin.`
      : `Right Side Row: ${knittingTechniques.KFB} in first stitch, knit to end.`;
    
    plainRowInstruction = config.language === 'fr'
      ? `Rang Envers : Tricoter à l'envers tous les mailles.`
      : `Wrong Side Row: Purl all stitches.`;
  } else {
    const crochetTechniques = DEFAULT_TRIANGULAR_SHAWL_INCREASE_TECHNIQUES.crochet;
    increaseRowInstruction = config.language === 'fr'
      ? `Rang d'Augmentation : ${crochetTechniques.twoInOne} dans la première maille, bride jusqu'à la fin.`
      : `Increase Row: ${crochetTechniques.twoInOne} in first stitch, sc to end.`;
    
    plainRowInstruction = config.language === 'fr'
      ? `Rang uni : Bride dans chaque maille.`
      : `Plain Row: Single crochet in each stitch.`;
  }

  // Add phase 1 instructions
  instructions.push({
    step: stepNumber++,
    type: 'shaping_row',
    text: increaseRowInstruction + (config.includeStitchCounts ? ` (1 augmentation par rang endroit)` : ''),
    stitchCount: startStitchCount + increasePhase.stitches_per_event
  });

  if (increasePhase.shaping_frequency > 1) {
    instructions.push({
      step: stepNumber++,
      type: 'pattern_row',
      text: plainRowInstruction,
      stitchCount: startStitchCount + increasePhase.stitches_per_event
    });
  }

  // Add repeat instruction for increase phase
  const repeatInstruction = config.language === 'fr'
    ? `Répéter ces ${increasePhase.shaping_frequency} rangs ${increasePhase.total_shaping_rows} fois au total pour atteindre la profondeur maximale.`
    : `Repeat these ${increasePhase.shaping_frequency} rows ${increasePhase.total_shaping_rows} times total to reach maximum depth.`;

  instructions.push({
    step: stepNumber++,
    type: 'plain_segment',
    text: repeatInstruction,
    stitchCount: startStitchCount + (increasePhase.total_shaping_rows * increasePhase.stitches_per_event)
  });

  return {
    instructions,
    nextStep: stepNumber
  };
}

/**
 * Generates transition instruction for side-to-side
 */
function generateSideToSideTransitionInstruction(
  craftType: 'knitting' | 'crochet',
  config: any,
  stepNumber: number
): DetailedInstruction {
  const instruction = config.language === 'fr'
    ? `Transition : Vous avez maintenant atteint la profondeur maximale du châle. Commencer la phase de diminution pour former la seconde moitié.`
    : `Transition: You have now reached the maximum depth of the shawl. Begin the decrease phase to form the second half.`;

  return {
    step: stepNumber,
    type: 'plain_segment',
    text: instruction,
    stitchCount: 0 // Placeholder, actual count depends on phase 1
  };
}

/**
 * Generates decrease instructions for side-to-side
 */
function generateSideToSideDecreaseInstructions(
  decreasePhase: TriangularShawlShapingPhase,
  craftType: 'knitting' | 'crochet',
  config: any,
  startStep: number
): { instructions: DetailedInstruction[], nextStep: number } {
  const instructions: DetailedInstruction[] = [];
  let stepNumber = startStep;

  let decreaseRowInstruction: string;
  let plainRowInstruction: string;

  if (craftType === 'knitting') {
    const knittingTechniques = DEFAULT_TRIANGULAR_SHAWL_DECREASE_TECHNIQUES.knitting;
    decreaseRowInstruction = config.language === 'fr'
      ? `Rang Endroit : ${knittingTechniques.SSK}, tricoter jusqu'à la fin.`
      : `Right Side Row: ${knittingTechniques.SSK}, knit to end.`;
    
    plainRowInstruction = config.language === 'fr'
      ? `Rang Envers : Tricoter à l'envers tous les mailles.`
      : `Wrong Side Row: Purl all stitches.`;
  } else {
    const crochetTechniques = DEFAULT_TRIANGULAR_SHAWL_DECREASE_TECHNIQUES.crochet;
    decreaseRowInstruction = config.language === 'fr'
      ? `Rang de Diminution : Sauter la première maille, bride jusqu'à la fin.`
      : `Decrease Row: Skip first stitch, sc to end.`;
    
    plainRowInstruction = config.language === 'fr'
      ? `Rang uni : Bride dans chaque maille.`
      : `Plain Row: Single crochet in each stitch.`;
  }

  // Add decrease instructions
  instructions.push({
    step: stepNumber++,
    type: 'shaping_row',
    text: decreaseRowInstruction + (config.includeStitchCounts ? ` (1 diminution par rang endroit)` : ''),
    stitchCount: 0 // Will be calculated based on current count
  });

  if (decreasePhase.shaping_frequency > 1) {
    instructions.push({
      step: stepNumber++,
      type: 'pattern_row',
      text: plainRowInstruction,
      stitchCount: 0 // Will be calculated based on current count
    });
  }

  // Add repeat instruction for decrease phase
  const repeatInstruction = config.language === 'fr'
    ? `Répéter ces ${decreasePhase.shaping_frequency} rangs ${decreasePhase.total_shaping_rows} fois au total pour revenir au point de départ.`
    : `Repeat these ${decreasePhase.shaping_frequency} rows ${decreasePhase.total_shaping_rows} times total to return to starting point.`;

  instructions.push({
    step: stepNumber++,
    type: 'plain_segment',
    text: repeatInstruction,
    stitchCount: 0 // Will be calculated based on final count
  });

  return {
    instructions,
    nextStep: stepNumber
  };
}

/**
 * Generates decrease instructions for bottom-up
 */
function generateBottomUpDecreaseInstructions(
  decreasePhase: TriangularShawlShapingPhase,
  startStitchCount: number,
  craftType: 'knitting' | 'crochet',
  config: any,
  startStep: number
): { instructions: DetailedInstruction[], nextStep: number } {
  const instructions: DetailedInstruction[] = [];
  let stepNumber = startStep;

  let decreaseRowInstruction: string;
  let plainRowInstruction: string;

  if (craftType === 'knitting') {
    const knittingTechniques = DEFAULT_TRIANGULAR_SHAWL_DECREASE_TECHNIQUES.knitting;
    decreaseRowInstruction = config.language === 'fr'
      ? `Rang Endroit (Diminution) : Tricoter 1, ${knittingTechniques.SSK}, tricoter jusqu'aux 3 dernières mailles, ${knittingTechniques.K2tog}, tricoter 1.`
      : `Right Side Row (Decrease): Knit 1, ${knittingTechniques.SSK}, knit to last 3 stitches, ${knittingTechniques.K2tog}, knit 1.`;
    
    plainRowInstruction = config.language === 'fr'
      ? `Rang Envers : Tricoter à l'envers tous les mailles.`
      : `Wrong Side Row: Purl all stitches.`;
  } else {
    const crochetTechniques = DEFAULT_TRIANGULAR_SHAWL_DECREASE_TECHNIQUES.crochet;
    decreaseRowInstruction = config.language === 'fr'
      ? `Rang de Diminution : Bride 1, ${crochetTechniques.sc2tog}, bride jusqu'aux 3 dernières mailles, ${crochetTechniques.sc2tog}, bride 1.`
      : `Decrease Row: Single crochet 1, ${crochetTechniques.sc2tog}, sc to last 3 stitches, ${crochetTechniques.sc2tog}, sc 1.`;
    
    plainRowInstruction = config.language === 'fr'
      ? `Rang uni : Bride dans chaque maille.`
      : `Plain Row: Single crochet in each stitch.`;
  }

  // Add decrease instructions
  instructions.push({
    step: stepNumber++,
    type: 'shaping_row',
    text: decreaseRowInstruction + (config.includeStitchCounts ? ` (2 diminutions par rang)` : ''),
    stitchCount: startStitchCount - decreasePhase.stitches_per_event
  });

  if (decreasePhase.shaping_frequency > 1) {
    instructions.push({
      step: stepNumber++,
      type: 'pattern_row',
      text: plainRowInstruction,
      stitchCount: startStitchCount - decreasePhase.stitches_per_event
    });
  }

  // Add repeat instruction
  const repeatInstruction = config.language === 'fr'
    ? `Répéter ces ${decreasePhase.shaping_frequency} rangs ${decreasePhase.total_shaping_rows} fois au total jusqu'à ce qu'il ne reste que 3 mailles.`
    : `Repeat these ${decreasePhase.shaping_frequency} rows ${decreasePhase.total_shaping_rows} times total until 3 stitches remain.`;

  instructions.push({
    step: stepNumber++,
    type: 'plain_segment',
    text: repeatInstruction,
    stitchCount: startStitchCount - (decreasePhase.total_shaping_rows * decreasePhase.stitches_per_event)
  });

  return {
    instructions,
    nextStep: stepNumber
  };
}

/**
 * Generates bind-off instruction
 */
function generateBindOffInstruction(
  stitchCount: number,
  craftType: 'knitting' | 'crochet',
  config: any,
  stepNumber: number
): DetailedInstruction {
  let instruction: string;

  if (craftType === 'knitting') {
    instruction = config.language === 'fr'
      ? `Rabattre toutes les ${stitchCount} mailles.`
      : `Bind off all ${stitchCount} stitches.`;
  } else {
    instruction = config.language === 'fr'
      ? `Arrêter le travail et rentrer les fils.`
      : `Fasten off and weave in ends.`;
  }

  return {
    step: stepNumber,
    type: 'cast_off',
    text: instruction,
    stitchCount: 0
  };
} 