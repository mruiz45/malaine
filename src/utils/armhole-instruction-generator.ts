/**
 * Armhole Instruction Generator Utilities (US_11.4)
 * Generates textual instructions for complex armhole shaping (rounded set-in, raglan)
 */

import {
  ArmholeShapingSchedule,
  ArmholeShapingAction,
  SleeveCapShapingSchedule
} from '@/types/armhole-shaping';
import {
  DetailedInstruction,
  InstructionGenerationConfig,
  ArmholeSide,
  ArmholeStepType
} from '@/types/instruction-generation';

/**
 * Extended action type for sleeve cap increases
 * Since ArmholeShapingAction only supports 'bind_off' | 'decrease',
 * we need a separate type for increase actions used in sleeve caps
 */
export interface SleeveCapIncreaseAction {
  /** Action type for sleeve cap increases */
  action: 'increase';
  /** Number of stitches affected */
  stitches: number;
  /** Row number from start of shaping */
  on_row_from_start_of_shaping: number;
  /** Side of fabric for the action */
  side_of_fabric: 'RS' | 'WS' | 'both';
  /** Number of repetitions (for increase series) */
  repeats?: number;
  /** Interval between repeats */
  every_x_rows?: number;
}

/**
 * Terminology dictionaries for armhole instructions by craft type and language
 */
const ARMHOLE_TERMINOLOGY = {
  knitting: {
    en: {
      bind_off: 'bind off',
      decrease: 'decrease',
      increase: 'increase',
      k2tog: 'k2tog',
      ssk: 'ssk',
      m1l: 'M1L',
      m1r: 'M1R',
      stitches: 'stitches',
      stitch: 'stitch',
      sts: 'sts',
      st: 'st',
      work_to_end: 'knit to end',
      work_plain: 'knit',
      work_purl: 'purl',
      right_side: 'RS',
      wrong_side: 'WS',
      row: 'Row',
      every: 'every',
      times: 'times',
      remaining: 'remaining',
      begin_armhole: 'Begin armhole shaping',
      raglan_marker: 'raglan marker',
      work_to_marker: 'work to',
      slip_marker: 'slip marker',
      place_marker: 'place marker',
      beginning_of_row: 'at beginning of row',
      end_of_row: 'at end of row',
      both_ends: 'at both ends',
      sleeve_cap: 'sleeve cap'
    },
    fr: {
      bind_off: 'rabattre',
      decrease: 'diminuer',
      increase: 'augmenter',
      k2tog: '2 m ens tricotées à l\'endroit',
      ssk: '1 surjet simple (SSK)',
      m1l: 'aug inter gauche (M1L)',
      m1r: 'aug inter droite (M1R)',
      stitches: 'mailles',
      stitch: 'maille',
      sts: 'm',
      st: 'm',
      work_to_end: 'tricoter jusqu\'à la fin',
      work_plain: 'tricoter à l\'endroit',
      work_purl: 'tricoter à l\'envers',
      right_side: 'Endroit',
      wrong_side: 'Envers',
      row: 'Rang',
      every: 'tous les',
      times: 'fois',
      remaining: 'restantes',
      begin_armhole: 'Commencer le façonnage des emmanchures',
      raglan_marker: 'marqueur raglan',
      work_to_marker: 'tricoter jusqu\'à',
      slip_marker: 'glisser le marqueur',
      place_marker: 'placer un marqueur',
      beginning_of_row: 'au début du rang',
      end_of_row: 'à la fin du rang',
      both_ends: 'aux deux extrémités',
      sleeve_cap: 'tête de manche'
    }
  },
  crochet: {
    en: {
      bind_off: 'fasten off',
      decrease: 'decrease',
      increase: 'increase',
      dec2tog: 'sc2tog',
      inc: '2 sc in next st',
      stitches: 'stitches',
      stitch: 'stitch',
      sts: 'sts',
      st: 'st',
      work_to_end: 'single crochet to end',
      work_plain: 'single crochet',
      right_side: 'RS',
      wrong_side: 'WS',
      row: 'Row',
      every: 'every',
      times: 'times',
      remaining: 'remaining',
      begin_armhole: 'Begin armhole shaping',
      raglan_marker: 'raglan marker',
      work_to_marker: 'work to',
      slip_marker: 'slip marker',
      place_marker: 'place marker',
      beginning_of_row: 'at beginning of row',
      end_of_row: 'at end of row',
      both_ends: 'at both ends',
      sleeve_cap: 'sleeve cap'
    },
    fr: {
      bind_off: 'arrêter',
      decrease: 'diminuer',
      increase: 'augmenter',
      dec2tog: '2 ms ens',
      inc: '2 ms dans la m suiv',
      stitches: 'mailles',
      stitch: 'maille',
      sts: 'm',
      st: 'm',
      work_to_end: 'crocheter en ms jusqu\'à la fin',
      work_plain: 'maille serrée',
      right_side: 'Endroit',
      wrong_side: 'Envers',
      row: 'Rang',
      every: 'tous les',
      times: 'fois',
      remaining: 'restantes',
      begin_armhole: 'Commencer le façonnage des emmanchures',
      raglan_marker: 'marqueur raglan',
      work_to_marker: 'crocheter jusqu\'à',
      slip_marker: 'glisser le marqueur',
      place_marker: 'placer un marqueur',
      beginning_of_row: 'au début du rang',
      end_of_row: 'à la fin du rang',
      both_ends: 'aux deux extrémités',
      sleeve_cap: 'tête de manche'
    }
  }
};

/**
 * Get terminology for specific craft type and language
 */
function getArmholeTerminology(
  craftType: 'knitting' | 'crochet',
  language: 'en' | 'fr'
): typeof ARMHOLE_TERMINOLOGY.knitting.en | typeof ARMHOLE_TERMINOLOGY.knitting.fr | 
   typeof ARMHOLE_TERMINOLOGY.crochet.en | typeof ARMHOLE_TERMINOLOGY.crochet.fr {
  return ARMHOLE_TERMINOLOGY[craftType][language];
}

/**
 * Generate instruction for base armhole bind-off (FR2)
 * @param bindOffStitches - Number of stitches to bind off at base
 * @param rowNumber - Current row number
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text
 */
export function generateArmholeBaseBindOffInstruction(
  bindOffStitches: number,
  rowNumber: number,
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  const term = getArmholeTerminology(craftType, config.language);
  
  if (config.language === 'fr') {
    return `${term.row} ${rowNumber} (${term.right_side}) - ${term.begin_armhole}: ` +
           `${term.bind_off} ${bindOffStitches} ${bindOffStitches > 1 ? term.sts : term.st} ${term.beginning_of_row}, ` +
           `${term.work_plain} jusqu'à ${bindOffStitches} ${bindOffStitches > 1 ? term.sts : term.st} de la fin, ` +
           `${term.bind_off} les ${bindOffStitches} dernières ${bindOffStitches > 1 ? term.sts : term.st}.`;
  } else {
    return `${term.row} ${rowNumber} (${term.right_side}) - ${term.begin_armhole}: ` +
           `${term.bind_off} ${bindOffStitches} ${bindOffStitches > 1 ? term.sts : term.st} ${term.beginning_of_row}, ` +
           `${term.work_plain} to last ${bindOffStitches} ${bindOffStitches > 1 ? term.sts : term.st}, ` +
           `${term.bind_off} last ${bindOffStitches} ${bindOffStitches > 1 ? term.sts : term.st}.`;
  }
}

/**
 * Generate instruction for subsequent base bind-off row (if needed)
 * @param bindOffStitches - Number of stitches to bind off
 * @param rowNumber - Current row number
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text
 */
export function generateArmholeBaseBindOffNextRowInstruction(
  bindOffStitches: number,
  rowNumber: number,
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  const term = getArmholeTerminology(craftType, config.language);
  const isRightSide = rowNumber % 2 === 1;
  const sideText = isRightSide ? term.right_side : term.wrong_side;
  
  if (config.language === 'fr') {
    return `${term.row} ${rowNumber} (${sideText}): ` +
           `${term.bind_off} ${bindOffStitches} ${bindOffStitches > 1 ? term.sts : term.st} ${term.beginning_of_row}, ` +
           `${term.work_plain} jusqu'à ${bindOffStitches} ${bindOffStitches > 1 ? term.sts : term.st} de la fin, ` +
           `${term.bind_off} les ${bindOffStitches} dernières ${bindOffStitches > 1 ? term.sts : term.st}.`;
  } else {
    return `${term.row} ${rowNumber} (${sideText}): ` +
           `${term.bind_off} ${bindOffStitches} ${bindOffStitches > 1 ? term.sts : term.st} ${term.beginning_of_row}, ` +
           `${term.work_plain} to last ${bindOffStitches} ${bindOffStitches > 1 ? term.sts : term.st}, ` +
           `${term.bind_off} last ${bindOffStitches} ${bindOffStitches > 1 ? term.sts : term.st}.`;
  }
}

/**
 * Generate instruction for armhole decrease shaping (FR3)
 * @param action - Armhole shaping action
 * @param rowNumber - Current row number
 * @param stitchesRemaining - Stitches remaining after this action
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text
 */
export function generateArmholeShapingInstruction(
  action: ArmholeShapingAction,
  rowNumber: number,
  stitchesRemaining: number,
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  const term = getArmholeTerminology(craftType, config.language);
  const isRightSide = action.side_of_fabric === 'RS';
  const sideText = isRightSide ? term.right_side : term.wrong_side;
  
  let actionText = '';
  
  if (action.action === 'decrease') {
    if (config.useSpecificTechniques && craftType === 'knitting') {
      // Use specific knitting techniques for decreases at armhole edges
      const knittingTerm = term as typeof ARMHOLE_TERMINOLOGY.knitting.en | typeof ARMHOLE_TERMINOLOGY.knitting.fr;
      if (config.language === 'fr') {
        actionText = `k1, ${knittingTerm.ssk}, tricoter jusqu'aux 3 dernières m, ${knittingTerm.k2tog}, k1`;
      } else {
        actionText = `k1, ${knittingTerm.ssk}, knit to last 3 sts, ${knittingTerm.k2tog}, k1`;
      }
    } else {
      // Generic decrease instruction
      actionText = config.language === 'fr' 
        ? `${term.decrease} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st} de chaque côté`
        : `${term.decrease} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st} at each end`;
    }
  } else if (action.action === 'bind_off') {
    actionText = config.language === 'fr' 
      ? `${term.bind_off} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st} ${term.both_ends}`
      : `${term.bind_off} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st} ${term.both_ends}`;
  }
  
  let instruction = `${term.row} ${rowNumber} (${sideText}`;
  if (action.action === 'decrease') {
    instruction += ` - ${config.language === 'fr' ? 'Diminution' : 'Decrease'}`;
  }
  instruction += `): ${actionText}.`;
  
  if (config.includeStitchCounts) {
    instruction += ` (${stitchesRemaining} ${term.sts})`;
  }
  
  return instruction;
}

/**
 * Generate instruction for raglan shaping (FR4)
 * @param action - Raglan shaping action
 * @param rowNumber - Current row number
 * @param stitchesRemaining - Stitches remaining after this action
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text
 */
export function generateRaglanShapingInstruction(
  action: ArmholeShapingAction,
  rowNumber: number,
  stitchesRemaining: number,
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  const term = getArmholeTerminology(craftType, config.language);
  const isRightSide = action.side_of_fabric === 'RS';
  const sideText = isRightSide ? term.right_side : term.wrong_side;
  
  let instruction = `${term.row} ${rowNumber} (${sideText} - ${config.language === 'fr' ? 'Raglan' : 'Raglan'}): `;
  
  if (config.useSpecificTechniques && craftType === 'knitting') {
    const knittingTerm = term as typeof ARMHOLE_TERMINOLOGY.knitting.en | typeof ARMHOLE_TERMINOLOGY.knitting.fr;
    if (config.language === 'fr') {
      instruction += `${term.work_plain} jusqu'à 2 m avant le ${term.raglan_marker}, ${knittingTerm.ssk}, ` +
                     `${term.slip_marker}, ${knittingTerm.k2tog}, continuer en ${term.work_plain} jusqu'au prochain marqueur.`;
    } else {
      instruction += `${term.work_plain} to 2 sts before ${term.raglan_marker}, ${knittingTerm.ssk}, ` +
                     `${term.slip_marker}, ${knittingTerm.k2tog}, continue in pattern to next marker.`;
    }
  } else {
    // Generic raglan instruction
    if (config.language === 'fr') {
      instruction += `${term.decrease} 1 ${term.st} de chaque côté du ${term.raglan_marker}.`;
    } else {
      instruction += `${term.decrease} 1 ${term.st} each side of ${term.raglan_marker}.`;
    }
  }
  
  if (config.includeStitchCounts) {
    instruction += ` (${stitchesRemaining} ${term.sts})`;
  }
  
  return instruction;
}

/**
 * Generate instruction text for repeated armhole shaping actions (FR3)
 * @param action - Base shaping action
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text for the repeat
 */
export function generateArmholeRepeatInstructionText(
  action: ArmholeShapingAction,
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  if (!action.repeats || !action.every_x_rows || action.repeats <= 1) {
    return '';
  }
  
  const term = getArmholeTerminology(craftType, config.language);
  
  let actionText = '';
  if (action.action === 'decrease') {
    actionText = config.language === 'fr' 
      ? `diminution aux emmanchures`
      : 'armhole decreases';
  } else if (action.action === 'bind_off') {
    actionText = config.language === 'fr' 
      ? `rabattage aux emmanchures`
      : 'armhole bind-offs';
  }
  
  if (config.language === 'fr') {
    return `Répéter ${actionText} ${term.every} ${action.every_x_rows} rangs encore ${action.repeats - 1} ${term.times}.`;
  } else {
    return `Repeat ${actionText} ${term.every} ${action.every_x_rows} rows ${action.repeats - 1} more ${term.times}.`;
  }
}

/**
 * Generate instruction for sleeve cap increases (FR5)
 * @param action - Sleeve cap increase action
 * @param rowNumber - Current row number
 * @param stitchesAfterIncrease - Stitches after this increase
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text
 */
export function generateSleeveCapIncreaseInstruction(
  action: SleeveCapIncreaseAction,
  rowNumber: number,
  stitchesAfterIncrease: number,
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  const term = getArmholeTerminology(craftType, config.language);
  const isRightSide = action.side_of_fabric === 'RS';
  const sideText = isRightSide ? term.right_side : term.wrong_side;
  
  let actionText = '';
  
  if (config.useSpecificTechniques && craftType === 'knitting') {
    const knittingTerm = term as typeof ARMHOLE_TERMINOLOGY.knitting.en | typeof ARMHOLE_TERMINOLOGY.knitting.fr;
    if (config.language === 'fr') {
      actionText = `k1, ${knittingTerm.m1l}, tricoter jusqu'à la dernière m, ${knittingTerm.m1r}, k1`;
    } else {
      actionText = `k1, ${knittingTerm.m1l}, knit to last st, ${knittingTerm.m1r}, k1`;
    }
  } else {
    actionText = config.language === 'fr' 
      ? `${term.increase} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st} de chaque côté`
      : `${term.increase} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st} at each end`;
  }
  
  let instruction = `${term.row} ${rowNumber} (${sideText} - ${term.sleeve_cap} ${config.language === 'fr' ? 'Augmentation' : 'Increase'}): ${actionText}.`;
  
  if (config.includeStitchCounts) {
    instruction += ` (${stitchesAfterIncrease} ${term.sts})`;
  }
  
  return instruction;
}

/**
 * Generate instruction for sleeve cap decreases (FR5)
 * @param action - Sleeve cap shaping action
 * @param rowNumber - Current row number
 * @param stitchesAfterDecrease - Stitches after this decrease
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text
 */
export function generateSleeveCapDecreaseInstruction(
  action: ArmholeShapingAction,
  rowNumber: number,
  stitchesAfterDecrease: number,
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  const term = getArmholeTerminology(craftType, config.language);
  const isRightSide = action.side_of_fabric === 'RS';
  const sideText = isRightSide ? term.right_side : term.wrong_side;
  
  let actionText = '';
  
  if (config.useSpecificTechniques && craftType === 'knitting') {
    const knittingTerm = term as typeof ARMHOLE_TERMINOLOGY.knitting.en | typeof ARMHOLE_TERMINOLOGY.knitting.fr;
    if (config.language === 'fr') {
      actionText = `k1, ${knittingTerm.ssk}, tricoter jusqu'aux 3 dernières m, ${knittingTerm.k2tog}, k1`;
    } else {
      actionText = `k1, ${knittingTerm.ssk}, knit to last 3 sts, ${knittingTerm.k2tog}, k1`;
    }
  } else {
    actionText = config.language === 'fr' 
      ? `${term.decrease} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st} de chaque côté`
      : `${term.decrease} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st} at each end`;
  }
  
  let instruction = `${term.row} ${rowNumber} (${sideText} - ${term.sleeve_cap} ${config.language === 'fr' ? 'Diminution' : 'Decrease'}): ${actionText}.`;
  
  if (config.includeStitchCounts) {
    instruction += ` (${stitchesAfterDecrease} ${term.sts})`;
  }
  
  return instruction;
}

/**
 * Calculate stitches remaining after an armhole or sleeve cap shaping action
 * @param currentStitches - Current stitch count
 * @param action - Shaping action (armhole decrease/bind-off or sleeve cap increase)
 * @returns Stitches remaining after the action
 */
export function calculateStitchesAfterArmholeAction(
  currentStitches: number,
  action: ArmholeShapingAction | SleeveCapIncreaseAction
): number {
  const stitchChange = action.stitches * (action.repeats || 1);
  
  if (action.action === 'decrease' || action.action === 'bind_off') {
    // For armholes, decreases affect both sides, so multiply by 2
    return currentStitches - (stitchChange * 2);
  } else if (action.action === 'increase') {
    // This handles 'increase' action for sleeve caps
    return currentStitches + (stitchChange * 2);
  }
  
  return currentStitches;
}

/**
 * Determine row side (RS/WS) based on row offset from start of shaping
 * @param rowOffset - Row number offset from start of armhole shaping
 * @returns True if right side, false if wrong side
 */
export function determineArmholeRowSide(rowOffset: number): boolean {
  // Assume first row of armhole shaping is RS (standard convention)
  return rowOffset % 2 === 1;
}

/**
 * Generate plain row instruction between armhole shaping actions
 * @param rowNumber - Current row number
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text
 */
export function generateArmholePlainRowInstruction(
  rowNumber: number,
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  const term = getArmholeTerminology(craftType, config.language);
  const isRightSide = determineArmholeRowSide(rowNumber);
  const sideText = isRightSide ? term.right_side : term.wrong_side;
  
  if (config.language === 'fr') {
    let workText = term.work_plain;
    if (craftType === 'knitting' && !isRightSide) {
      const knittingTerm = term as typeof ARMHOLE_TERMINOLOGY.knitting.fr;
      workText = knittingTerm.work_purl;
    }
    return `${term.row} ${rowNumber} (${sideText}): ${workText} ${term.work_to_end}.`;
  } else {
    const workText = isRightSide ? term.work_plain : (craftType === 'knitting' ? 'purl' : term.work_plain);
    return `${term.row} ${rowNumber} (${sideText}): ${workText} ${term.work_to_end}.`;
  }
} 