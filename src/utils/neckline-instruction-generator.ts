/**
 * Neckline Instruction Generator Utilities (US_11.2)
 * Generates textual instructions for complex neckline shaping (rounded, V-neck)
 */

import {
  NecklineShapingSchedule,
  NecklineShapingAction
} from '@/types/neckline-shaping';
import {
  DetailedInstruction,
  InstructionGenerationConfig,
  NecklineSide,
  NecklineStepType
} from '@/types/instruction-generation';

/**
 * Terminology dictionaries for different craft types and languages
 */
const TERMINOLOGY = {
  knitting: {
    en: {
      bind_off: 'bind off',
      decrease: 'decrease',
      k2tog: 'k2tog',
      ssk: 'ssk',
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
      remaining: 'remaining'
    },
    fr: {
      bind_off: 'rabattre',
      decrease: 'diminuer',
      k2tog: '2 m ens tricotées à l\'endroit',
      ssk: '1 surjet simple (SSK)',
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
      remaining: 'restantes'
    }
  },
  crochet: {
    en: {
      bind_off: 'fasten off',
      decrease: 'decrease',
      dec: 'dec',
      stitches: 'stitches',
      stitch: 'stitch',
      sts: 'sts',
      st: 'st',
      work_to_end: 'work to end',
      work_plain: 'single crochet',
      right_side: 'RS',
      wrong_side: 'WS',
      row: 'Row',
      every: 'every',
      times: 'times',
      remaining: 'remaining'
    },
    fr: {
      bind_off: 'arrêter',
      decrease: 'diminuer',
      dec: 'dim',
      stitches: 'mailles',
      stitch: 'maille',
      sts: 'm',
      st: 'm',
      work_to_end: 'crocheter jusqu\'à la fin',
      work_plain: 'maille serrée',
      right_side: 'Endroit',
      wrong_side: 'Envers',
      row: 'Rang',
      every: 'tous les',
      times: 'fois',
      remaining: 'restantes'
    }
  }
};

/**
 * Get terminology for craft type and language
 */
function getTerminology(craftType: 'knitting' | 'crochet', language: 'en' | 'fr') {
  return TERMINOLOGY[craftType][language];
}

/**
 * Generate instruction for binding off center stitches (FR3)
 * @param centerStitches - Number of stitches to bind off at center
 * @param stitchesBeforeCenter - Number of stitches to work before center
 * @param stitchesAfterCenter - Number of stitches remaining after center
 * @param rowNumber - Current row number
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text
 */
export function generateCenterBindOffInstruction(
  centerStitches: number,
  stitchesBeforeCenter: number,
  stitchesAfterCenter: number,
  rowNumber: number,
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  const term = getTerminology(craftType, config.language);
  
  if (config.language === 'fr') {
    return `${term.row} ${rowNumber} (${term.right_side}), début façonnage encolure: ` +
           `${term.work_plain} ${stitchesBeforeCenter} ${term.sts}, ${term.bind_off} les ${centerStitches} ${term.sts} centrales, ` +
           `${term.work_plain} les ${stitchesAfterCenter} ${term.sts} ${term.remaining}. ` +
           `Continuer sur le dernier groupe de ${stitchesAfterCenter} ${term.sts} pour le côté gauche de l'encolure, ` +
           `mettre les autres ${term.sts} en attente pour le côté droit.`;
  } else {
    return `${term.row} ${rowNumber} (${term.right_side}) - Begin neckline shaping: ` +
           `${term.work_plain} ${stitchesBeforeCenter} ${term.sts}, ${term.bind_off} center ${centerStitches} ${term.sts}, ` +
           `${term.work_plain} ${stitchesAfterCenter} ${term.sts}. ` +
           `Continue on last group of ${stitchesAfterCenter} ${term.sts} for left front, ` +
           `place remaining ${term.sts} on holder for right front.`;
  }
}

/**
 * Generate instruction for neckline shaping action (FR4)
 * @param action - Neckline shaping action
 * @param side - Which side (left/right)
 * @param rowNumber - Current row number
 * @param stitchesRemaining - Stitches remaining after this action
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text
 */
export function generateNecklineShapingInstruction(
  action: NecklineShapingAction,
  side: 'left_front' | 'right_front',
  rowNumber: number,
  stitchesRemaining: number,
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  const term = getTerminology(craftType, config.language);
  const isRightSide = action.side_of_fabric === 'RS';
  const sideText = isRightSide ? term.right_side : term.wrong_side;
  
  let actionText = '';
  let positionText = '';
  
  // Determine action text and position
  if (action.action === 'bind_off') {
    actionText = `${term.bind_off} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st}`;
    
    // For bind off, position depends on side and fabric side
    if (side === 'left_front') {
      positionText = config.language === 'fr' 
        ? 'au début du rang (côté encolure)' 
        : 'at beginning of row (neckline edge)';
    } else {
      positionText = config.language === 'fr' 
        ? 'à la fin du rang (côté encolure)' 
        : 'at end of row (neckline edge)';
    }
  } else if (action.action === 'decrease') {
    // Use specific techniques if enabled and it's knitting
    if (config.useSpecificTechniques && craftType === 'knitting') {
      const knittingTerm = term as typeof TERMINOLOGY.knitting.en | typeof TERMINOLOGY.knitting.fr;
      if (side === 'left_front') {
        actionText = config.language === 'fr' 
          ? `${action.stitches > 1 ? action.stitches + ' ' : ''}${knittingTerm.ssk}`
          : `${action.stitches > 1 ? action.stitches + ' ' : ''}${knittingTerm.ssk}`;
      } else {
        actionText = config.language === 'fr' 
          ? `${action.stitches > 1 ? action.stitches + ' ' : ''}${knittingTerm.k2tog}`
          : `${action.stitches > 1 ? action.stitches + ' ' : ''}${knittingTerm.k2tog}`;
      }
    } else {
      actionText = `${term.decrease} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st}`;
    }
    
    positionText = config.language === 'fr' 
      ? 'côté encolure' 
      : 'at neckline edge';
  }
  
  // Build full instruction
  let instruction = '';
  
  if (config.language === 'fr') {
    if (action.action === 'bind_off') {
      instruction = `${term.row} suivant (${sideText}): ${actionText} ${positionText}, ${term.work_plain} le reste du rang.`;
    } else {
      instruction = `${term.row} suivant (${sideText} - Diminution): ${actionText} ${positionText}, ${term.work_plain} le reste du rang.`;
    }
    
    if (config.includeStitchCounts) {
      instruction += ` (${stitchesRemaining} ${term.sts} ${term.remaining} pour ce côté)`;
    }
  } else {
    if (action.action === 'bind_off') {
      instruction = `Next row (${sideText}): ${actionText} ${positionText}, ${term.work_to_end}.`;
    } else {
      instruction = `Next row (${sideText} - Decrease): ${actionText} ${positionText}, ${term.work_to_end}.`;
    }
    
    if (config.includeStitchCounts) {
      instruction += ` (${stitchesRemaining} ${term.sts} ${term.remaining} this side)`;
    }
  }
  
  return instruction;
}

/**
 * Generate instruction for plain row on neckline side
 * @param side - Which side (left/right)
 * @param isRightSide - Whether this is a right side row
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text
 */
export function generateNecklinePlainRowInstruction(
  side: 'left_front' | 'right_front',
  isRightSide: boolean,
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  const term = getTerminology(craftType, config.language);
  const sideText = isRightSide ? term.right_side : term.wrong_side;
  
  if (config.language === 'fr') {
    let workText = term.work_plain;
    if (craftType === 'knitting' && !isRightSide) {
      const knittingTerm = term as typeof TERMINOLOGY.knitting.fr;
      workText = knittingTerm.work_purl;
    }
    return `${term.row} suivant (${sideText}): ${workText} jusqu'au bord de l'encolure.`;
  } else {
    const workText = isRightSide ? term.work_plain : (craftType === 'knitting' ? 'purl' : term.work_plain);
    return `Next row (${sideText}): ${workText} to neckline edge.`;
  }
}

/**
 * Generate instruction text for repeated shaping actions (FR4)
 * @param action - Base shaping action
 * @param side - Which side (left/right)
 * @param craftType - Knitting or crochet
 * @param config - Instruction generation configuration
 * @returns Generated instruction text for the repeat
 */
export function generateRepeatInstructionText(
  action: NecklineShapingAction,
  side: 'left_front' | 'right_front',
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): string {
  if (!action.repeats || !action.every_x_rows || action.repeats <= 1) {
    return '';
  }
  
  const term = getTerminology(craftType, config.language);
  
  let actionText = '';
  if (action.action === 'bind_off') {
    actionText = `${term.bind_off} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st}`;
  } else {
    actionText = `${term.decrease} ${action.stitches} ${action.stitches > 1 ? term.sts : term.st}`;
  }
  
  if (config.language === 'fr') {
    return `Répéter la diminution ${term.every} ${action.every_x_rows} rangs encore ${action.repeats - 1} ${term.times}.`;
  } else {
    return `Repeat ${actionText} ${term.every} ${action.every_x_rows} rows ${action.repeats - 1} more ${term.times}.`;
  }
}

/**
 * Determine if a row is a right side or wrong side row
 * @param rowOffset - Row offset from start of shaping
 * @returns True if right side row
 */
export function determineRowSide(rowOffset: number): boolean {
  // Assuming we start neckline shaping on a right side row
  // Row offsets: 0 = RS, 1 = WS, 2 = RS, etc.
  return rowOffset % 2 === 0;
}

/**
 * Calculate stitches remaining after a shaping action
 * @param startingStitches - Stitches before the action
 * @param action - Shaping action
 * @returns Stitches remaining after the action
 */
export function calculateStitchesAfterAction(
  startingStitches: number,
  action: NecklineShapingAction
): number {
  if (action.action === 'bind_off' || action.action === 'decrease') {
    return startingStitches - action.stitches;
  }
  return startingStitches;
}

/**
 * Get shaping technique terminology based on side and craft type
 * @param side - Which side of the neckline
 * @param craftType - Knitting or crochet
 * @param config - Configuration including language
 * @returns Appropriate technique terminology
 */
export function getShapingTechnique(
  side: 'left_front' | 'right_front',
  craftType: 'knitting' | 'crochet',
  config: InstructionGenerationConfig
): { decrease: string; increase: string } {
  const term = getTerminology(craftType, config.language);
  
  if (craftType === 'knitting' && config.useSpecificTechniques) {
    const knittingTerm = term as typeof TERMINOLOGY.knitting.en | typeof TERMINOLOGY.knitting.fr;
    if (side === 'left_front') {
      return {
        decrease: knittingTerm.ssk,
        increase: 'M1L' // Could be added to terminology if needed
      };
    } else {
      return {
        decrease: knittingTerm.k2tog,
        increase: 'M1R' // Could be added to terminology if needed
      };
    }
  }
  
  // Generic terminology
  return {
    decrease: term.decrease,
    increase: 'increase' // Could be added to terminology if needed
  };
} 