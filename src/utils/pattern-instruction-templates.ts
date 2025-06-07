/**
 * Pattern Instruction Templates (PD_PH6_US003)
 * Templates for generating textual instructions from calculated data
 */

import { InstructionTemplate, RowInstructionType } from '@/types/pattern-instruction-generation';

/**
 * Knitting instruction templates
 */
const KNITTING_TEMPLATES: InstructionTemplate[] = [
  {
    templateId: 'knitting_cast_on',
    craftType: 'knitting',
    instructionType: 'cast_on',
    template: 'Cast on {stitchCount} stitches.',
    placeholders: {
      'stitchCount': 'Number of stitches to cast on'
    },
    example: 'Cast on 120 stitches.'
  },
  {
    templateId: 'knitting_plain_row_single',
    craftType: 'knitting',
    instructionType: 'plain_row',
    template: 'Row {rowNumber} ({rowSide}): {stitchPattern}. ({stitchCount} sts)',
    placeholders: {
      'rowNumber': 'Current row number',
      'rowSide': 'RS or WS',
      'stitchPattern': 'Stitch pattern instruction (e.g., "Knit all sts")',
      'stitchCount': 'Current stitch count'
    },
    example: 'Row 5 (RS): Knit all sts. (120 sts)'
  },
  {
    templateId: 'knitting_plain_rows_multiple',
    craftType: 'knitting',
    instructionType: 'plain_row',
    template: 'Rows {startRow}-{endRow}: Work in {stitchPattern} for {rowCount} rows. ({stitchCount} sts)',
    placeholders: {
      'startRow': 'Starting row number',
      'endRow': 'Ending row number',
      'stitchPattern': 'Stitch pattern name',
      'rowCount': 'Number of rows',
      'stitchCount': 'Current stitch count'
    },
    example: 'Rows 6-15: Work in Stockinette Stitch for 10 rows. (120 sts)'
  },
  {
    templateId: 'knitting_shaping_decrease_row',
    craftType: 'knitting',
    instructionType: 'shaping_row',
    template: 'Row {rowNumber} ({rowSide} - Decrease Row): {decreaseInstructions}. ({stitchCount} sts)',
    placeholders: {
      'rowNumber': 'Current row number',
      'rowSide': 'RS or WS',
      'decreaseInstructions': 'Specific decrease instructions',
      'stitchCount': 'Stitch count after decreases'
    },
    example: 'Row 31 (RS - Decrease Row): K1, k2tog, knit to last 3 sts, ssk, k1. (118 sts)'
  },
  {
    templateId: 'knitting_shaping_increase_row',
    craftType: 'knitting',
    instructionType: 'shaping_row',
    template: 'Row {rowNumber} ({rowSide} - Increase Row): {increaseInstructions}. ({stitchCount} sts)',
    placeholders: {
      'rowNumber': 'Current row number',
      'rowSide': 'RS or WS',
      'increaseInstructions': 'Specific increase instructions',
      'stitchCount': 'Stitch count after increases'
    },
    example: 'Row 51 (RS - Increase Row): K1, M1L, knit to last st, M1R, k1. (122 sts)'
  },
  {
    templateId: 'knitting_bind_off',
    craftType: 'knitting',
    instructionType: 'bind_off',
    template: 'Bind off all {stitchCount} stitches loosely.',
    placeholders: {
      'stitchCount': 'Number of stitches to bind off'
    },
    example: 'Bind off all 120 stitches loosely.'
  },
  {
    templateId: 'knitting_setup_row',
    craftType: 'knitting',
    instructionType: 'setup_row',
    template: 'Setup Row ({rowSide}): {setupInstructions}. ({stitchCount} sts)',
    placeholders: {
      'rowSide': 'RS or WS',
      'setupInstructions': 'Setup instructions',
      'stitchCount': 'Stitch count after setup'
    },
    example: 'Setup Row (WS): Purl all sts. (120 sts)'
  },
  {
    templateId: 'knitting_pattern_row',
    craftType: 'knitting',
    instructionType: 'pattern_row',
    template: 'Row {rowNumber} ({rowSide}): {patternInstructions}. ({stitchCount} sts)',
    placeholders: {
      'rowNumber': 'Current row number',
      'rowSide': 'RS or WS',
      'patternInstructions': 'Pattern-specific instructions',
      'stitchCount': 'Current stitch count'
    },
    example: 'Row 7 (RS): *K2, p2; rep from * to end. (120 sts)'
  }
];

/**
 * Crochet instruction templates
 */
const CROCHET_TEMPLATES: InstructionTemplate[] = [
  {
    templateId: 'crochet_foundation_chain',
    craftType: 'crochet',
    instructionType: 'cast_on',
    template: 'Chain {chainCount}.',
    placeholders: {
      'chainCount': 'Number of chains to make'
    },
    example: 'Chain 121.'
  },
  {
    templateId: 'crochet_foundation_row',
    craftType: 'crochet',
    instructionType: 'setup_row',
    template: 'Row 1: Work {stitchCount} {stitchType} starting in {startPosition} from hook. ({stitchCount} sts)',
    placeholders: {
      'stitchCount': 'Number of stitches to work',
      'stitchType': 'Type of crochet stitch',
      'startPosition': 'Which chain to start in'
    },
    example: 'Row 1: Work 120 sc starting in 2nd ch from hook. (120 sts)'
  },
  {
    templateId: 'crochet_plain_row',
    craftType: 'crochet',
    instructionType: 'plain_row',
    template: 'Row {rowNumber}: Ch {turningChains}, {stitchInstructions}. ({stitchCount} sts)',
    placeholders: {
      'rowNumber': 'Current row number',
      'turningChains': 'Number of turning chains',
      'stitchInstructions': 'Stitch instructions for the row',
      'stitchCount': 'Current stitch count'
    },
    example: 'Row 5: Ch 1, sc in each st across. (120 sts)'
  },
  {
    templateId: 'crochet_shaping_decrease_row',
    craftType: 'crochet',
    instructionType: 'shaping_row',
    template: 'Row {rowNumber} (Decrease Row): Ch {turningChains}, {decreaseInstructions}. ({stitchCount} sts)',
    placeholders: {
      'rowNumber': 'Current row number',
      'turningChains': 'Number of turning chains',
      'decreaseInstructions': 'Specific decrease instructions',
      'stitchCount': 'Stitch count after decreases'
    },
    example: 'Row 31 (Decrease Row): Ch 1, sc2tog, sc to last 2 sts, sc2tog. (118 sts)'
  },
  {
    templateId: 'crochet_shaping_increase_row',
    craftType: 'crochet',
    instructionType: 'shaping_row',
    template: 'Row {rowNumber} (Increase Row): Ch {turningChains}, {increaseInstructions}. ({stitchCount} sts)',
    placeholders: {
      'rowNumber': 'Current row number',
      'turningChains': 'Number of turning chains',
      'increaseInstructions': 'Specific increase instructions',
      'stitchCount': 'Stitch count after increases'
    },
    example: 'Row 51 (Increase Row): Ch 1, 2 sc in first st, sc to last st, 2 sc in last st. (122 sts)'
  },
  {
    templateId: 'crochet_fasten_off',
    craftType: 'crochet',
    instructionType: 'bind_off',
    template: 'Fasten off and weave in ends.',
    placeholders: {},
    example: 'Fasten off and weave in ends.'
  }
];

/**
 * Get instruction templates for a specific craft type
 */
export function getInstructionTemplates(craftType: 'knitting' | 'crochet'): InstructionTemplate[] {
  return craftType === 'knitting' ? KNITTING_TEMPLATES : CROCHET_TEMPLATES;
}

/**
 * Get a specific template by craft type and instruction type
 */
export function getTemplate(
  craftType: 'knitting' | 'crochet',
  instructionType: RowInstructionType,
  templateVariant?: string
): InstructionTemplate | undefined {
  const templates = getInstructionTemplates(craftType);
  
  if (templateVariant) {
    return templates.find(t => 
      t.instructionType === instructionType && 
      t.templateId.includes(templateVariant)
    );
  }
  
  return templates.find(t => t.instructionType === instructionType);
}

/**
 * Apply template with placeholders
 */
export function applyTemplate(
  template: InstructionTemplate,
  values: Record<string, string | number>
): string {
  let result = template.template;
  
  // Replace placeholders with values
  for (const [placeholder, value] of Object.entries(values)) {
    const placeholderPattern = new RegExp(`\\{${placeholder}\\}`, 'g');
    result = result.replace(placeholderPattern, String(value));
  }
  
  return result;
}

/**
 * Validate that all required placeholders are provided
 */
export function validateTemplatePlaceholders(
  template: InstructionTemplate,
  values: Record<string, string | number>
): { isValid: boolean; missingPlaceholders: string[] } {
  const missingPlaceholders: string[] = [];
  
  for (const placeholder of Object.keys(template.placeholders)) {
    if (!(placeholder in values)) {
      missingPlaceholders.push(placeholder);
    }
  }
  
  return {
    isValid: missingPlaceholders.length === 0,
    missingPlaceholders
  };
}

/**
 * Generate section header markdown
 */
export function generateSectionHeader(
  sectionName: string,
  level: number = 2
): string {
  const headerMarker = '#'.repeat(level);
  return `${headerMarker} ${sectionName}\n\n`;
}

/**
 * Generate piece instructions header
 */
export function generatePieceHeader(
  pieceName: string,
  castOnStitches: number,
  totalRows: number,
  finalStitchCount: number,
  finishedWidth: number,
  finishedLength: number
): string {
  let header = generateSectionHeader(pieceName, 2);
  
  header += `**Cast On:** ${castOnStitches} stitches  \n`;
  header += `**Total Rows:** ${totalRows}  \n`;
  header += `**Final Stitch Count:** ${finalStitchCount} stitches  \n`;
  header += `**Finished Dimensions:** ${finishedWidth} cm wide × ${finishedLength} cm long  \n\n`;
  
  return header;
}

/**
 * Generate construction notes section
 */
export function generateConstructionNotes(notes: string[]): string {
  if (notes.length === 0) {
    return '';
  }
  
  let notesSection = generateSectionHeader('Construction Notes', 3);
  
  for (const note of notes) {
    notesSection += `- ${note}\n`;
  }
  
  notesSection += '\n';
  return notesSection;
}

/**
 * Generate repeat instruction text
 */
export function generateRepeatInstruction(
  baseInstruction: string,
  repeatCount: number,
  intervalRows?: number
): string {
  if (intervalRows) {
    return `${baseInstruction} Repeat this every ${intervalRows} rows, ${repeatCount} times total.`;
  } else {
    return `${baseInstruction} Repeat ${repeatCount} times.`;
  }
}

/**
 * Determine row side (RS/WS) based on row number
 */
export function determineRowSide(rowNumber: number, startingSide: 'RS' | 'WS' = 'RS'): 'RS' | 'WS' {
  const isOdd = rowNumber % 2 === 1;
  
  if (startingSide === 'RS') {
    return isOdd ? 'RS' : 'WS';
  } else {
    return isOdd ? 'WS' : 'RS';
  }
}

/**
 * Format stitch count with proper grammar
 */
export function formatStitchCount(count: number): string {
  return count === 1 ? `${count} st` : `${count} sts`;
}

/**
 * Format row range for multiple plain rows
 */
export function formatRowRange(startRow: number, endRow: number): string {
  if (startRow === endRow) {
    return `Row ${startRow}`;
  }
  return `Rows ${startRow}-${endRow}`;
} 