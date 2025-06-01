/**
 * Raglan Instruction Generator (US_12.2)
 * Generates detailed textual instructions for raglan top-down construction
 * Implements FR1-FR8 from US_12.2 specification
 */

import {
  RaglanInstructionContext,
  RaglanInstructionGenerationResult,
  RaglanInstructionSection,
  RaglanDetailedInstruction,
  RaglanStepType,
  RaglanIncreaseMethod,
  RaglanInstructionTemplate,
  DEFAULT_RAGLAN_INCREASE_METHODS
} from '@/types/raglan-instruction';
import { RaglanTopDownCalculations } from '@/types/raglan-construction';

/**
 * Main function to generate raglan top-down instructions
 * Implements FR1-FR8 from US_12.2
 * 
 * @param context - Raglan instruction generation context
 * @returns Complete raglan instruction generation result
 */
export function generateRaglanTopDownInstructions(context: RaglanInstructionContext): RaglanInstructionGenerationResult {
  try {
    const { raglanCalculations, craftType, config } = context;

    // Validate input data
    if (!raglanCalculations) {
      throw new Error('Raglan calculations are required');
    }

    // Debug log to understand what we're receiving
    console.log('Received raglanCalculations:', JSON.stringify(raglanCalculations, null, 2));

    if (typeof raglanCalculations.neckline_cast_on_total !== 'number' || 
        raglanCalculations.neckline_cast_on_total < 0) {
      throw new Error('Invalid neckline cast-on total');
    }

    if (!raglanCalculations.initial_distribution) {
      throw new Error('Initial distribution is required');
    }

    if (!raglanCalculations.raglan_shaping) {
      throw new Error('Raglan shaping data is required');
    }

    if (!raglanCalculations.stitches_at_separation) {
      throw new Error('Stitches at separation data is required');
    }

    const warnings: string[] = [];
    const sections: RaglanInstructionSection[] = [];
    let currentStep = 1;
    let currentStitchCount = 0;

    // FR2: Generate cast-on instructions for neckline
    const castOnSection = generateCastOnSection(context, currentStep, currentStitchCount);
    sections.push(castOnSection);
    currentStep += castOnSection.instructions.length;
    currentStitchCount = castOnSection.finalStitchCount;

    // FR3: Generate marker placement instructions (first round setup)
    const markerSection = generateMarkerPlacementSection(context, currentStep, currentStitchCount);
    sections.push(markerSection);
    currentStep += markerSection.instructions.length;
    currentStitchCount = markerSection.finalStitchCount;

    // FR4-FR6: Generate raglan increase rounds and plain rounds
    const increaseSection = generateRaglanIncreaseSection(context, currentStep, currentStitchCount);
    sections.push(increaseSection);
    currentStep += increaseSection.instructions.length;
    currentStitchCount = increaseSection.finalStitchCount;

    // FR7-FR8: Generate separation instructions (sleeves to holders, underarm cast-on)
    const separationSection = generateSeparationSection(context, currentStep, currentStitchCount);
    sections.push(separationSection);
    currentStep += separationSection.instructions.length;
    currentStitchCount = separationSection.finalStitchCount;

    // Combine all instructions
    const allInstructions: RaglanDetailedInstruction[] = [];
    sections.forEach(section => {
      allInstructions.push(...section.instructions);
    });

    // Calculate summary
    const increaseRounds = raglanCalculations.raglan_shaping.total_augmentation_rounds_or_rows;
    const totalRounds = raglanCalculations.raglan_shaping.raglan_line_length_rows_or_rounds;
    const plainRounds = totalRounds - increaseRounds;

    return {
      success: true,
      sections,
      allInstructions,
      warnings: warnings.length > 0 ? warnings : undefined,
      summary: {
        totalInstructions: allInstructions.length,
        totalRounds,
        finalStitchCount: currentStitchCount,
        increaseRounds,
        plainRounds
      }
    };

  } catch (error) {
    console.error('Error generating raglan instructions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during raglan instruction generation'
    };
  }
}

/**
 * Generate cast-on section instructions
 * Implements FR2: Generate instructions for neckline cast-on
 */
function generateCastOnSection(
  context: RaglanInstructionContext,
  startStep: number,
  startStitchCount: number
): RaglanInstructionSection {
  const { raglanCalculations, craftType, config } = context;
  const castOnCount = raglanCalculations.neckline_cast_on_total;

  const template = getCastOnTemplate(craftType, config.language);
  const instructionText = template
    .replace('{castOnCount}', castOnCount.toString())
    .replace('{method}', getCastOnMethodName(craftType, config.language));

  const instruction: RaglanDetailedInstruction = {
    step: startStep,
    type: 'raglan_cast_on',
    text: instructionText,
    stitchCount: castOnCount,
    raglanMetadata: {
      roundType: 'setup'
    }
  };

  return {
    sectionType: 'raglan_cast_on',
    startStep,
    startStitchCount,
    instructions: [instruction],
    finalStitchCount: castOnCount,
    rowsInSection: 0 // Cast-on doesn't count as a row
  };
}

/**
 * Generate marker placement section instructions
 * Implements FR3: Generate instructions for first round with marker placement
 */
function generateMarkerPlacementSection(
  context: RaglanInstructionContext,
  startStep: number,
  startStitchCount: number
): RaglanInstructionSection {
  const { raglanCalculations, craftType, config } = context;
  const { initial_distribution } = raglanCalculations;

  const template = getMarkerPlacementTemplate(craftType, config.language);
  const instructionText = template
    .replace('{backStitches}', initial_distribution.back_stitches.toString())
    .replace('{frontStitches}', initial_distribution.front_stitches.toString())
    .replace('{leftSleeveStitches}', initial_distribution.sleeve_left_stitches.toString())
    .replace('{rightSleeveStitches}', initial_distribution.sleeve_right_stitches.toString())
    .replace('{raglanStitches}', initial_distribution.raglan_line_stitches_each.toString())
    .replace('{totalStitches}', startStitchCount.toString());

  const instruction: RaglanDetailedInstruction = {
    step: startStep,
    roundNumber: 1,
    type: 'raglan_marker_placement',
    text: instructionText,
    stitchCount: startStitchCount,
    raglanMetadata: {
      roundType: 'setup',
      sectionStitches: {
        back: initial_distribution.back_stitches,
        front: initial_distribution.front_stitches,
        leftSleeve: initial_distribution.sleeve_left_stitches,
        rightSleeve: initial_distribution.sleeve_right_stitches,
        raglanLines: initial_distribution.raglan_line_stitches_each * 4
      }
    }
  };

  return {
    sectionType: 'raglan_marker_placement',
    startStep,
    startStitchCount,
    instructions: [instruction],
    finalStitchCount: startStitchCount,
    rowsInSection: 1
  };
}

/**
 * Generate raglan increase section instructions
 * Implements FR4-FR6: Generate increase rounds and plain rounds in sequence
 */
function generateRaglanIncreaseSection(
  context: RaglanInstructionContext,
  startStep: number,
  startStitchCount: number
): RaglanInstructionSection {
  const { raglanCalculations, craftType, config, increaseMethod } = context;
  const { raglan_shaping, initial_distribution } = raglanCalculations;
  
  const instructions: RaglanDetailedInstruction[] = [];
  let currentStep = startStep;
  let currentStitchCount = startStitchCount;
  let currentRound = 2; // Round 1 was marker placement
  
  const totalIncreaseRounds = raglan_shaping.total_augmentation_rounds_or_rows;
  const increaseFrequency = raglan_shaping.increase_frequency;
  const actualIncreaseMethod = increaseMethod || DEFAULT_RAGLAN_INCREASE_METHODS[craftType];

  // Track current stitches in each section
  let backStitches = initial_distribution.back_stitches;
  let frontStitches = initial_distribution.front_stitches;
  let leftSleeveStitches = initial_distribution.sleeve_left_stitches;
  let rightSleeveStitches = initial_distribution.sleeve_right_stitches;
  const raglanLineStitches = initial_distribution.raglan_line_stitches_each;

  for (let increaseRound = 1; increaseRound <= totalIncreaseRounds; increaseRound++) {
    // Generate plain rounds before increase (if not the first increase round)
    if (increaseRound > 1) {
      const plainRoundsCount = increaseFrequency - 1;
      if (plainRoundsCount > 0) {
        const plainInstruction = generatePlainRoundsInstruction(
          currentStep,
          currentRound,
          plainRoundsCount,
          currentStitchCount,
          craftType,
          config.language
        );
        instructions.push(plainInstruction);
        currentStep++;
        currentRound += plainRoundsCount;
      }
    }

    // Generate increase round instruction
    const increaseInstruction = generateIncreaseRoundInstruction(
      currentStep,
      currentRound,
      currentStitchCount,
      actualIncreaseMethod,
      craftType,
      config.language,
      {
        back: backStitches,
        front: frontStitches,
        leftSleeve: leftSleeveStitches,
        rightSleeve: rightSleeveStitches,
        raglanLines: raglanLineStitches * 4
      }
    );

    instructions.push(increaseInstruction);
    currentStep++;
    currentRound++;

    // Update stitch counts (8 stitches increased total: 2 for each section)
    backStitches += raglan_shaping.total_increases_per_body_panel / totalIncreaseRounds;
    frontStitches += raglan_shaping.total_increases_per_body_panel / totalIncreaseRounds;
    leftSleeveStitches += raglan_shaping.total_increases_per_sleeve / totalIncreaseRounds;
    rightSleeveStitches += raglan_shaping.total_increases_per_sleeve / totalIncreaseRounds;
    currentStitchCount += 8; // 8 increases per increase round (2 per raglan line)
  }

  // Add any remaining plain rounds to reach the target raglan length
  const totalRaglanRounds = raglan_shaping.raglan_line_length_rows_or_rounds;
  const remainingPlainRounds = totalRaglanRounds - currentRound + 1; // +1 because we haven't counted the last increase round yet
  
  if (remainingPlainRounds > 0) {
    const finalPlainInstruction = generatePlainRoundsInstruction(
      currentStep,
      currentRound,
      remainingPlainRounds,
      currentStitchCount,
      craftType,
      config.language
    );
    instructions.push(finalPlainInstruction);
    currentStep++;
  }

  return {
    sectionType: 'raglan_increase_round',
    startStep,
    startStitchCount,
    instructions,
    finalStitchCount: currentStitchCount,
    rowsInSection: totalRaglanRounds - 1 // Minus the setup round
  };
}

/**
 * Generate separation section instructions
 * Implements FR7-FR8: Generate sleeve separation and underarm cast-on instructions
 */
function generateSeparationSection(
  context: RaglanInstructionContext,
  startStep: number,
  startStitchCount: number
): RaglanInstructionSection {
  const { raglanCalculations, craftType, config } = context;
  const { stitches_at_separation } = raglanCalculations;

  const template = getSeparationTemplate(craftType, config.language);
  const instructionText = template
    .replace(/\{sleeveStitches\}/g, stitches_at_separation.sleeve_each_stitches.toString())
    .replace(/\{underarmStitches\}/g, stitches_at_separation.underarm_cast_on_stitches.toString())
    .replace(/\{bodyStitches\}/g, stitches_at_separation.body_total_stitches.toString());

  const finalBodyStitches = stitches_at_separation.body_total_stitches + 
                           (stitches_at_separation.underarm_cast_on_stitches * 2);

  const instruction: RaglanDetailedInstruction = {
    step: startStep,
    type: 'raglan_separation',
    text: instructionText,
    stitchCount: finalBodyStitches,
    raglanMetadata: {
      roundType: 'separation',
      underarmCastOn: stitches_at_separation.underarm_cast_on_stitches
    }
  };

  return {
    sectionType: 'raglan_separation',
    startStep,
    startStitchCount,
    instructions: [instruction],
    finalStitchCount: finalBodyStitches,
    rowsInSection: 1
  };
}

/**
 * Generate a plain rounds instruction
 */
function generatePlainRoundsInstruction(
  step: number,
  startRound: number,
  roundCount: number,
  stitchCount: number,
  craftType: 'knitting' | 'crochet',
  language: 'en' | 'fr'
): RaglanDetailedInstruction {
  const template = getPlainRoundsTemplate(craftType, language);
  
  let text: string;
  if (roundCount === 1) {
    text = template.single
      .replace('{roundNumber}', startRound.toString())
      .replace('{totalStitches}', stitchCount.toString());
  } else {
    text = template.multiple
      .replace('{startRound}', startRound.toString())
      .replace('{endRound}', (startRound + roundCount - 1).toString())
      .replace('{totalStitches}', stitchCount.toString());
  }

  return {
    step,
    roundNumber: startRound,
    type: 'raglan_plain_round',
    text,
    stitchCount,
    raglanMetadata: {
      roundType: 'plain'
    }
  };
}

/**
 * Generate an increase round instruction
 */
function generateIncreaseRoundInstruction(
  step: number,
  roundNumber: number,
  currentStitchCount: number,
  increaseMethod: RaglanIncreaseMethod,
  craftType: 'knitting' | 'crochet',
  language: 'en' | 'fr',
  sectionStitches: {
    back: number;
    front: number;
    leftSleeve: number;
    rightSleeve: number;
    raglanLines: number;
  }
): RaglanDetailedInstruction {
  const template = getIncreaseRoundTemplate(craftType, increaseMethod, language);
  const newStitchCount = currentStitchCount + 8; // 8 increases per round

  const text = template
    .replace('{roundNumber}', roundNumber.toString())
    .replace('{totalStitches}', newStitchCount.toString())
    .replace('{currentStitches}', currentStitchCount.toString());

  return {
    step,
    roundNumber,
    type: 'raglan_increase_round',
    text,
    stitchCount: newStitchCount,
    raglanMetadata: {
      roundType: 'increase',
      sectionStitches: {
        back: sectionStitches.back + 1,
        front: sectionStitches.front + 1,
        leftSleeve: sectionStitches.leftSleeve + 1,
        rightSleeve: sectionStitches.rightSleeve + 1,
        raglanLines: sectionStitches.raglanLines
      },
      stitchesIncreased: 8
    }
  };
}

// Template functions for different instruction types and languages
function getCastOnTemplate(craftType: 'knitting' | 'crochet', language: 'en' | 'fr'): string {
  const templates = {
    knitting: {
      en: "Cast on {castOnCount} stitches using the {method} method.",
      fr: "Monter {castOnCount} mailles avec la méthode {method}."
    },
    crochet: {
      en: "Chain {castOnCount} stitches.",
      fr: "Faire {castOnCount} mailles en l'air."
    }
  };
  return templates[craftType][language];
}

function getCastOnMethodName(craftType: 'knitting' | 'crochet', language: 'en' | 'fr'): string {
  const methods = {
    knitting: {
      en: "long-tail",
      fr: "montage italien"
    },
    crochet: {
      en: "chain",
      fr: "mailles en l'air"
    }
  };
  return methods[craftType][language];
}

function getMarkerPlacementTemplate(craftType: 'knitting' | 'crochet', language: 'en' | 'fr'): string {
  const templates = {
    knitting: {
      en: "Round 1 (Setup): Place markers as follows: {backStitches} for back, place marker (pm), {raglanStitches} for raglan line, pm, {leftSleeveStitches} for left sleeve, pm, {raglanStitches} for raglan line, pm, {frontStitches} for front, pm, {raglanStitches} for raglan line, pm, {rightSleeveStitches} for right sleeve, pm, {raglanStitches} for raglan line, place marker and join to work in the round. ({totalStitches} sts)",
      fr: "Tour 1 (Mise en place) : Placer les marqueurs comme suit : {backStitches} pour le dos, placer un marqueur (pm), {raglanStitches} pour ligne raglan, pm, {leftSleeveStitches} pour manche gauche, pm, {raglanStitches} pour ligne raglan, pm, {frontStitches} pour le devant, pm, {raglanStitches} pour ligne raglan, pm, {rightSleeveStitches} pour manche droite, pm, {raglanStitches} pour ligne raglan, placer marqueur et joindre pour tricoter en rond. ({totalStitches} m)"
    },
    crochet: {
      en: "Round 1 (Setup): Place stitch markers as follows: {backStitches} for back, marker, {raglanStitches} for raglan line, marker, {leftSleeveStitches} for left sleeve, marker, {raglanStitches} for raglan line, marker, {frontStitches} for front, marker, {raglanStitches} for raglan line, marker, {rightSleeveStitches} for right sleeve, marker, {raglanStitches} for raglan line, join with slip stitch to first stitch. ({totalStitches} sts)",
      fr: "Tour 1 (Mise en place) : Placer les marqueurs comme suit : {backStitches} pour le dos, marqueur, {raglanStitches} pour ligne raglan, marqueur, {leftSleeveStitches} pour manche gauche, marqueur, {raglanStitches} pour ligne raglan, marqueur, {frontStitches} pour le devant, marqueur, {raglanStitches} pour ligne raglan, marqueur, {rightSleeveStitches} pour manche droite, marqueur, {raglanStitches} pour ligne raglan, joindre avec maille coulée à la première maille. ({totalStitches} m)"
    }
  };
  return templates[craftType][language];
}

function getIncreaseRoundTemplate(craftType: 'knitting' | 'crochet', increaseMethod: RaglanIncreaseMethod, language: 'en' | 'fr'): string {
  const templates = {
    knitting: {
      M1L_M1R: {
        en: "Round {roundNumber} (Increase Round): *Knit to 1 stitch before marker, M1L, k1 (raglan stitch), slip marker, k1, M1R; repeat from * 3 more times, knit to end. ({totalStitches} sts)",
        fr: "Tour {roundNumber} (Tour d'augmentation) : *Tricoter jusqu'à 1 maille avant le marqueur, 1 aug G (M1L), 1 m end (maille raglan), glisser marqueur, 1 m end, 1 aug D (M1R) ; répéter de * encore 3 fois, tricoter jusqu'à la fin. ({totalStitches} m)"
      },
      YO: {
        en: "Round {roundNumber} (Increase Round): *Knit to marker, yarn over, slip marker, k1 (raglan stitch), slip marker, yarn over; repeat from * 3 more times, knit to end. ({totalStitches} sts)",
        fr: "Tour {roundNumber} (Tour d'augmentation) : *Tricoter jusqu'au marqueur, jeté, glisser marqueur, 1 m end (maille raglan), glisser marqueur, jeté ; répéter de * encore 3 fois, tricoter jusqu'à la fin. ({totalStitches} m)"
      }
    },
    crochet: {
      INC_CHAIN: {
        en: "Round {roundNumber} (Increase Round): *Single crochet to marker, (2 sc, ch 1, 2 sc) in raglan stitch, move marker; repeat from * 3 more times, single crochet to end, join with slip stitch. ({totalStitches} sts)",
        fr: "Tour {roundNumber} (Tour d'augmentation) : *Maille serrée jusqu'au marqueur, (2 ms, 1 ml, 2 ms) dans la maille raglan, déplacer marqueur ; répéter de * encore 3 fois, maille serrée jusqu'à la fin, joindre avec maille coulée. ({totalStitches} m)"
      }
    }
  };

  if (craftType === 'knitting') {
    return templates.knitting[increaseMethod as keyof typeof templates.knitting]?.[language] || 
           templates.knitting.M1L_M1R[language];
  } else {
    return templates.crochet[increaseMethod as keyof typeof templates.crochet]?.[language] || 
           templates.crochet.INC_CHAIN[language];
  }
}

function getPlainRoundsTemplate(craftType: 'knitting' | 'crochet', language: 'en' | 'fr'): { single: string; multiple: string } {
  const templates = {
    knitting: {
      en: {
        single: "Round {roundNumber}: Knit all stitches. ({totalStitches} sts)",
        multiple: "Rounds {startRound}-{endRound}: Knit all stitches. ({totalStitches} sts)"
      },
      fr: {
        single: "Tour {roundNumber} : Tricoter toutes les mailles à l'endroit. ({totalStitches} m)",
        multiple: "Tours {startRound}-{endRound} : Tricoter toutes les mailles à l'endroit. ({totalStitches} m)"
      }
    },
    crochet: {
      en: {
        single: "Round {roundNumber}: Single crochet in each stitch around, join with slip stitch. ({totalStitches} sts)",
        multiple: "Rounds {startRound}-{endRound}: Single crochet in each stitch around, join with slip stitch. ({totalStitches} sts)"
      },
      fr: {
        single: "Tour {roundNumber} : Maille serrée dans chaque maille tout autour, joindre avec maille coulée. ({totalStitches} m)",
        multiple: "Tours {startRound}-{endRound} : Maille serrée dans chaque maille tout autour, joindre avec maille coulée. ({totalStitches} m)"
      }
    }
  };
  return templates[craftType][language];
}

function getSeparationTemplate(craftType: 'knitting' | 'crochet', language: 'en' | 'fr'): string {
  const templates = {
    knitting: {
      en: "Separate sleeves from body: Place {sleeveStitches} left sleeve stitches on holder or waste yarn, cast on {underarmStitches} stitches for underarm, continue with front stitches, place {sleeveStitches} right sleeve stitches on holder or waste yarn, cast on {underarmStitches} stitches for underarm, continue with back stitches. ({bodyStitches} sts total for body)",
      fr: "Séparer les manches du corps : Mettre {sleeveStitches} mailles de manche gauche en attente sur un arrêt-mailles, monter {underarmStitches} mailles pour l'emmanchure, continuer avec les mailles du devant, mettre {sleeveStitches} mailles de manche droite en attente sur un arrêt-mailles, monter {underarmStitches} mailles pour l'emmanchure, continuer avec les mailles du dos. ({bodyStitches} m au total pour le corps)"
    },
    crochet: {
      en: "Separate sleeves from body: Place {sleeveStitches} left sleeve stitches on holder, chain {underarmStitches} for underarm, skip sleeve stitches, continue with front stitches, place {sleeveStitches} right sleeve stitches on holder, chain {underarmStitches} for underarm, skip sleeve stitches, continue with back stitches, join with slip stitch. ({bodyStitches} sts total for body)",
      fr: "Séparer les manches du corps : Mettre {sleeveStitches} mailles de manche gauche en attente, faire {underarmStitches} mailles en l'air pour l'emmanchure, passer les mailles de manche, continuer avec les mailles du devant, mettre {sleeveStitches} mailles de manche droite en attente, faire {underarmStitches} mailles en l'air pour l'emmanchure, passer les mailles de manche, continuer avec les mailles du dos, joindre avec maille coulée. ({bodyStitches} m au total pour le corps)"
    }
  };
  return templates[craftType][language];
} 