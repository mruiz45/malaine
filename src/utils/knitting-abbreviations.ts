/**
 * Standard Knitting and Crochet Abbreviations (PD_PH6_US003)
 * Provides standard abbreviations for instruction generation
 */

import { StandardAbbreviations, AbbreviationDefinition } from '@/types/pattern-instruction-generation';

/**
 * Standard knitting abbreviations (English)
 */
const KNITTING_ABBREVIATIONS_EN: Record<string, AbbreviationDefinition> = {
  'k': {
    abbreviation: 'k',
    fullTerm: 'knit',
    description: 'Knit stitch',
    alternatives: ['K']
  },
  'p': {
    abbreviation: 'p',
    fullTerm: 'purl',
    description: 'Purl stitch',
    alternatives: ['P']
  },
  'st': {
    abbreviation: 'st',
    fullTerm: 'stitch',
    description: 'A single stitch',
    alternatives: ['stitch']
  },
  'sts': {
    abbreviation: 'sts',
    fullTerm: 'stitches',
    description: 'Multiple stitches',
    alternatives: ['stitches']
  },
  'rs': {
    abbreviation: 'RS',
    fullTerm: 'right side',
    description: 'The right side of the work (public side)',
    alternatives: ['right side']
  },
  'ws': {
    abbreviation: 'WS',
    fullTerm: 'wrong side',
    description: 'The wrong side of the work (private side)',
    alternatives: ['wrong side']
  },
  'co': {
    abbreviation: 'CO',
    fullTerm: 'cast on',
    description: 'Place initial stitches on needle',
    alternatives: ['cast on', 'cast-on']
  },
  'bo': {
    abbreviation: 'BO',
    fullTerm: 'bind off',
    description: 'Remove stitches from needle',
    alternatives: ['bind off', 'cast off', 'CO']
  },
  'inc': {
    abbreviation: 'inc',
    fullTerm: 'increase',
    description: 'Add one or more stitches',
    alternatives: ['increase', 'INC']
  },
  'dec': {
    abbreviation: 'dec',
    fullTerm: 'decrease',
    description: 'Remove one or more stitches',
    alternatives: ['decrease', 'DEC']
  },
  'k2tog': {
    abbreviation: 'k2tog',
    fullTerm: 'knit 2 together',
    description: 'Right-leaning decrease',
    alternatives: ['knit 2 together']
  },
  'ssk': {
    abbreviation: 'ssk',
    fullTerm: 'slip slip knit',
    description: 'Left-leaning decrease',
    alternatives: ['slip slip knit']
  },
  'm1': {
    abbreviation: 'M1',
    fullTerm: 'make 1',
    description: 'Make one stitch increase',
    alternatives: ['make 1', 'M1L', 'M1R']
  },
  'm1l': {
    abbreviation: 'M1L',
    fullTerm: 'make 1 left',
    description: 'Make one left-leaning increase',
    alternatives: ['make 1 left']
  },
  'm1r': {
    abbreviation: 'M1R',
    fullTerm: 'make 1 right',
    description: 'Make one right-leaning increase',
    alternatives: ['make 1 right']
  },
  'yo': {
    abbreviation: 'yo',
    fullTerm: 'yarn over',
    description: 'Yarn over increase',
    alternatives: ['yarn over', 'YO']
  },
  'sl': {
    abbreviation: 'sl',
    fullTerm: 'slip',
    description: 'Slip stitch without working it',
    alternatives: ['slip', 'SL']
  },
  'pm': {
    abbreviation: 'pm',
    fullTerm: 'place marker',
    description: 'Place a stitch marker',
    alternatives: ['place marker', 'PM']
  },
  'sm': {
    abbreviation: 'sm',
    fullTerm: 'slip marker',
    description: 'Slip the marker from left to right needle',
    alternatives: ['slip marker', 'SM']
  },
  'rep': {
    abbreviation: 'rep',
    fullTerm: 'repeat',
    description: 'Repeat the instructions',
    alternatives: ['repeat', 'REP']
  },
  'rem': {
    abbreviation: 'rem',
    fullTerm: 'remaining',
    description: 'Remaining stitches or rows',
    alternatives: ['remaining', 'REM']
  },
  'beg': {
    abbreviation: 'beg',
    fullTerm: 'beginning',
    description: 'Beginning of row or round',
    alternatives: ['beginning', 'BEG']
  },
  'end': {
    abbreviation: 'end',
    fullTerm: 'end',
    description: 'End of row or round',
    alternatives: ['END']
  }
};

/**
 * Standard crochet abbreviations (English)
 */
const CROCHET_ABBREVIATIONS_EN: Record<string, AbbreviationDefinition> = {
  'ch': {
    abbreviation: 'ch',
    fullTerm: 'chain',
    description: 'Chain stitch',
    alternatives: ['chain', 'CH']
  },
  'sc': {
    abbreviation: 'sc',
    fullTerm: 'single crochet',
    description: 'Single crochet stitch',
    alternatives: ['single crochet', 'SC']
  },
  'hdc': {
    abbreviation: 'hdc',
    fullTerm: 'half double crochet',
    description: 'Half double crochet stitch',
    alternatives: ['half double crochet', 'HDC']
  },
  'dc': {
    abbreviation: 'dc',
    fullTerm: 'double crochet',
    description: 'Double crochet stitch',
    alternatives: ['double crochet', 'DC']
  },
  'tr': {
    abbreviation: 'tr',
    fullTerm: 'treble crochet',
    description: 'Treble crochet stitch',
    alternatives: ['treble crochet', 'TR']
  },
  'sl st': {
    abbreviation: 'sl st',
    fullTerm: 'slip stitch',
    description: 'Slip stitch',
    alternatives: ['slip stitch', 'SL ST']
  },
  'st': {
    abbreviation: 'st',
    fullTerm: 'stitch',
    description: 'A single stitch',
    alternatives: ['stitch']
  },
  'sts': {
    abbreviation: 'sts',
    fullTerm: 'stitches',
    description: 'Multiple stitches',
    alternatives: ['stitches']
  },
  'inc': {
    abbreviation: 'inc',
    fullTerm: 'increase',
    description: 'Add one or more stitches',
    alternatives: ['increase', 'INC']
  },
  'dec': {
    abbreviation: 'dec',
    fullTerm: 'decrease',
    description: 'Remove one or more stitches',
    alternatives: ['decrease', 'DEC']
  },
  'sk': {
    abbreviation: 'sk',
    fullTerm: 'skip',
    description: 'Skip the next stitch',
    alternatives: ['skip', 'SK']
  },
  'rep': {
    abbreviation: 'rep',
    fullTerm: 'repeat',
    description: 'Repeat the instructions',
    alternatives: ['repeat', 'REP']
  },
  'rem': {
    abbreviation: 'rem',
    fullTerm: 'remaining',
    description: 'Remaining stitches or rows',
    alternatives: ['remaining', 'REM']
  },
  'beg': {
    abbreviation: 'beg',
    fullTerm: 'beginning',
    description: 'Beginning of row or round',
    alternatives: ['beginning', 'BEG']
  },
  'rnd': {
    abbreviation: 'rnd',
    fullTerm: 'round',
    description: 'Round in circular crochet',
    alternatives: ['round', 'RND']
  },
  'fo': {
    abbreviation: 'FO',
    fullTerm: 'fasten off',
    description: 'End the yarn and secure',
    alternatives: ['fasten off', 'finish off']
  }
};

/**
 * Get standard abbreviations for a craft type and language
 */
export function getStandardAbbreviations(
  craftType: 'knitting' | 'crochet',
  language: 'en' | 'fr' = 'en'
): StandardAbbreviations {
  // For now, we only have English abbreviations
  // Future: Add French abbreviations
  if (language === 'fr') {
    // TODO: Implement French abbreviations in future iterations
    console.warn('French abbreviations not yet implemented, falling back to English');
  }

  const abbreviations = craftType === 'knitting' 
    ? KNITTING_ABBREVIATIONS_EN 
    : CROCHET_ABBREVIATIONS_EN;

  return {
    abbreviations,
    craftType,
    language: 'en' // For now, always English
  };
}

/**
 * Apply abbreviations to instruction text
 */
export function applyAbbreviations(
  text: string,
  abbreviations: StandardAbbreviations,
  useAbbreviations: boolean = true
): string {
  if (!useAbbreviations) {
    return text;
  }

  let result = text;
  
  // Apply abbreviations in order of specificity (longer terms first)
  const sortedAbbrevs = Object.entries(abbreviations.abbreviations)
    .sort((a, b) => b[1].fullTerm.length - a[1].fullTerm.length);

  for (const [_, abbrevDef] of sortedAbbrevs) {
    // Replace full terms with abbreviations (case-insensitive, word boundaries)
    const fullTermRegex = new RegExp(`\\b${abbrevDef.fullTerm}\\b`, 'gi');
    result = result.replace(fullTermRegex, abbrevDef.abbreviation);

    // Also handle alternatives
    if (abbrevDef.alternatives) {
      for (const alternative of abbrevDef.alternatives) {
        const altRegex = new RegExp(`\\b${alternative}\\b`, 'gi');
        result = result.replace(altRegex, abbrevDef.abbreviation);
      }
    }
  }

  return result;
}

/**
 * Generate abbreviations glossary markdown
 */
export function generateAbbreviationsGlossary(abbreviations: StandardAbbreviations): string {
  const { craftType } = abbreviations;
  const title = craftType === 'knitting' ? 'Knitting Abbreviations' : 'Crochet Abbreviations';
  
  let markdown = `## ${title}\n\n`;
  markdown += '| Abbreviation | Full Term | Description |\n';
  markdown += '|--------------|-----------|-------------|\n';

  // Sort abbreviations alphabetically
  const sortedAbbrevs = Object.entries(abbreviations.abbreviations)
    .sort((a, b) => a[1].abbreviation.localeCompare(b[1].abbreviation));

  for (const [_, abbrevDef] of sortedAbbrevs) {
    markdown += `| ${abbrevDef.abbreviation} | ${abbrevDef.fullTerm} | ${abbrevDef.description} |\n`;
  }

  return markdown;
}

/**
 * Validate that abbreviations are consistent with text
 */
export function validateAbbreviationUsage(
  text: string,
  abbreviations: StandardAbbreviations
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check for inconsistent usage of abbreviations vs full terms
  for (const [_, abbrevDef] of Object.entries(abbreviations.abbreviations)) {
    const hasAbbrev = text.includes(abbrevDef.abbreviation);
    const hasFullTerm = text.toLowerCase().includes(abbrevDef.fullTerm.toLowerCase());
    
    if (hasAbbrev && hasFullTerm) {
      issues.push(`Mixed usage of "${abbrevDef.abbreviation}" and "${abbrevDef.fullTerm}" in text`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues
  };
} 