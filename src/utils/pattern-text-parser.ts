/**
 * Pattern Text Parser (US 10.2)
 * Parses structured pattern text to extract numerical values for pattern resizing
 */

import { 
  StructuredPatternText, 
  PatternTextParseResult, 
  ParsedPatternData,
  ParsedComponent,
  PatternTextParserConfig,
  TemplateKeywords,
  OriginalPatternValues
} from '@/types/pattern-resizer';
import { MeasurementUnit } from '@/types/gauge';
import { getTemplateByKey } from './pattern-resizer-templates';

/**
 * Parser configuration with keywords for each template
 */
const PARSER_CONFIG: PatternTextParserConfig = {
  template_keywords: {
    'simple_body_panel_rectangular': {
      gauge: {
        stitches: ['ORIGINAL_GAUGE_STITCHES_PER_10CM', 'GAUGE_STITCHES', 'STITCHES_PER_10CM', 'ST_PER_10CM'],
        rows: ['ORIGINAL_GAUGE_ROWS_PER_10CM', 'GAUGE_ROWS', 'ROWS_PER_10CM', 'ROWS_PER_10CM']
      },
      pattern_values: {
        'original_cast_on': ['CAST_ON', 'CAST_ON_STITCHES', 'CO'],
        'original_rows_total': ['ROWS_TOTAL', 'TOTAL_ROWS', 'ROWS'],
        'original_finished_width': ['FINISHED_WIDTH_CM', 'WIDTH_CM', 'FINISHED_WIDTH', 'WIDTH'],
        'original_finished_length': ['FINISHED_LENGTH_CM', 'LENGTH_CM', 'FINISHED_LENGTH', 'LENGTH']
      },
      components: ['BODYPANEL', 'BODY_PANEL', 'BODY', 'FRONT', 'BACK']
    },
    'simple_sleeve_tapered': {
      gauge: {
        stitches: ['ORIGINAL_GAUGE_STITCHES_PER_10CM', 'GAUGE_STITCHES', 'STITCHES_PER_10CM'],
        rows: ['ORIGINAL_GAUGE_ROWS_PER_10CM', 'GAUGE_ROWS', 'ROWS_PER_10CM']
      },
      pattern_values: {
        'original_cuff_stitches': ['CUFF_STITCHES', 'CUFF_ST', 'CUFF'],
        'original_upper_arm_stitches': ['UPPER_ARM_STITCHES', 'UPPER_ARM_ST', 'UPPER_ARM'],
        'original_sleeve_length_rows': ['SLEEVE_LENGTH_ROWS', 'SLEEVE_ROWS', 'LENGTH_ROWS'],
        'original_shaping_stitches_per_event': ['SHAPING_STITCHES_PER_EVENT', 'SHAPING_ST', 'INC_DEC_ST']
      },
      components: ['SLEEVE']
    },
    'simple_scarf_rectangular': {
      gauge: {
        stitches: ['ORIGINAL_GAUGE_STITCHES_PER_10CM', 'GAUGE_STITCHES', 'STITCHES_PER_10CM'],
        rows: ['ORIGINAL_GAUGE_ROWS_PER_10CM', 'GAUGE_ROWS', 'ROWS_PER_10CM']
      },
      pattern_values: {
        'original_cast_on': ['CAST_ON', 'CAST_ON_STITCHES', 'CO'],
        'original_finished_width': ['FINISHED_WIDTH_CM', 'WIDTH_CM', 'FINISHED_WIDTH', 'WIDTH'],
        'original_finished_length': ['FINISHED_LENGTH_CM', 'LENGTH_CM', 'FINISHED_LENGTH', 'LENGTH']
      },
      components: ['SCARF']
    },
    'simple_hat_cylindrical': {
      gauge: {
        stitches: ['ORIGINAL_GAUGE_STITCHES_PER_10CM', 'GAUGE_STITCHES', 'STITCHES_PER_10CM'],
        rows: ['ORIGINAL_GAUGE_ROWS_PER_10CM', 'GAUGE_ROWS', 'ROWS_PER_10CM']
      },
      pattern_values: {
        'original_cast_on': ['CAST_ON', 'CAST_ON_STITCHES', 'CO'],
        'original_head_circumference': ['HEAD_CIRCUMFERENCE', 'CIRCUMFERENCE', 'HEAD_CIRC'],
        'original_hat_height': ['HAT_HEIGHT', 'HEIGHT']
      },
      components: ['HAT', 'BEANIE']
    }
  },
  unit_patterns: {
    cm: ['CM', 'CENTIMETER', 'CENTIMETERS', '_CM', 'PER_10CM'],
    inch: ['IN', 'INCH', 'INCHES', '_IN', 'PER_4IN', '"']
  }
};

/**
 * Main function to parse structured pattern text
 */
export function parseStructuredPatternText(input: StructuredPatternText): PatternTextParseResult {
  try {
    const { text, unit, template_key } = input;
    
    // Validate template
    const template = getTemplateByKey(template_key);
    if (!template) {
      return {
        success: false,
        error: `Unknown template: ${template_key}`
      };
    }

    // Get keywords for this template
    const keywords = PARSER_CONFIG.template_keywords[template_key];
    if (!keywords) {
      return {
        success: false,
        error: `No parser configuration for template: ${template_key}`
      };
    }

    // Parse the text
    const parseResult = parseTextContent(text, keywords, unit);
    
    if (!parseResult.success) {
      return parseResult;
    }

    return {
      success: true,
      data: parseResult.data,
      warnings: parseResult.warnings
    };

  } catch (error) {
    console.error('Pattern text parsing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

/**
 * Parse text content using keywords
 */
function parseTextContent(
  text: string, 
  keywords: TemplateKeywords, 
  preferredUnit: MeasurementUnit
): PatternTextParseResult {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const warnings: string[] = [];
  const parsedData: ParsedPatternData = {
    original_gauge: {},
    original_pattern_values: {},
    components: [],
    warnings: []
  };

  let currentComponent: ParsedComponent | null = null;
  let detectedUnit: MeasurementUnit = preferredUnit;

  for (const line of lines) {
    const upperLine = line.toUpperCase();

    // Skip comments
    if (upperLine.startsWith('//') || upperLine.startsWith('#')) {
      continue;
    }

    // Parse pattern name
    if (upperLine.startsWith('PATTERN_NAME:')) {
      const name = extractValue(line);
      if (name && typeof name === 'string') {
        parsedData.pattern_name = name;
      }
      continue;
    }

    // Parse component declarations
    if (upperLine.startsWith('COMPONENT:')) {
      const componentName = extractValue(line);
      if (componentName && typeof componentName === 'string') {
        // Save previous component
        if (currentComponent) {
          parsedData.components?.push(currentComponent);
        }
        // Start new component
        currentComponent = {
          name: componentName,
          values: {}
        };
      }
      continue;
    }

    // Detect unit from line content
    const lineUnit = detectUnit(upperLine);
    if (lineUnit && lineUnit !== detectedUnit) {
      detectedUnit = lineUnit;
      if (lineUnit !== preferredUnit) {
        warnings.push(`Detected unit ${lineUnit} in text, but preference is ${preferredUnit}`);
      }
    }

    // Parse gauge values
    const gaugeStitches = parseKeywordValue(upperLine, keywords.gauge.stitches);
    if (gaugeStitches !== null) {
      parsedData.original_gauge!.original_gauge_stitches = gaugeStitches;
      parsedData.original_gauge!.original_gauge_unit = detectedUnit;
      parsedData.original_gauge!.original_swatch_width = 10; // Default
      continue;
    }

    const gaugeRows = parseKeywordValue(upperLine, keywords.gauge.rows);
    if (gaugeRows !== null) {
      parsedData.original_gauge!.original_gauge_rows = gaugeRows;
      parsedData.original_gauge!.original_swatch_height = 10; // Default
      continue;
    }

    // Parse pattern values
    for (const [fieldKey, fieldKeywords] of Object.entries(keywords.pattern_values)) {
      const value = parseKeywordValue(upperLine, fieldKeywords);
      if (value !== null) {
        if (currentComponent) {
          currentComponent.values[fieldKey] = value;
        } else {
          parsedData.original_pattern_values![fieldKey] = value;
        }
        break;
      }
    }
  }

  // Save last component
  if (currentComponent) {
    parsedData.components?.push(currentComponent);
  }

  // Validate required fields
  const validationResult = validateParsedData(parsedData, keywords);
  if (!validationResult.success) {
    return validationResult;
  }

  // Merge component values if no components were explicitly defined
  if (parsedData.components?.length === 0 && Object.keys(parsedData.original_pattern_values || {}).length > 0) {
    // All values go to main pattern values - this is fine
  } else if (parsedData.components?.length === 1) {
    // Merge single component values into main pattern values
    const component = parsedData.components[0];
    parsedData.original_pattern_values = {
      ...parsedData.original_pattern_values,
      ...component.values
    };
  }

  parsedData.warnings = warnings;

  return {
    success: true,
    data: parsedData,
    warnings
  };
}

/**
 * Extract value from a key:value line
 */
function extractValue(line: string): string | number | null {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return null;

  const valueStr = line.substring(colonIndex + 1).trim();
  
  // Try to parse as number
  const numValue = parseFloat(valueStr);
  if (!isNaN(numValue)) {
    return numValue;
  }

  // Return as string
  return valueStr;
}

/**
 * Parse a value for specific keywords
 */
function parseKeywordValue(line: string, keywords: string[]): number | null {
  for (const keyword of keywords) {
    if (line.includes(keyword + ':')) {
      const value = extractValue(line);
      if (typeof value === 'number') {
        return value;
      }
    }
  }
  return null;
}

/**
 * Detect unit from line content
 */
function detectUnit(line: string): MeasurementUnit | null {
  const { cm, inch } = PARSER_CONFIG.unit_patterns;
  
  for (const pattern of cm) {
    if (line.includes(pattern)) {
      return 'cm';
    }
  }
  
  for (const pattern of inch) {
    if (line.includes(pattern)) {
      return 'inch';
    }
  }
  
  return null;
}

/**
 * Validate parsed data has required fields
 */
function validateParsedData(
  data: ParsedPatternData, 
  keywords: TemplateKeywords
): PatternTextParseResult {
  const errors: string[] = [];

  // Check gauge
  if (!data.original_gauge?.original_gauge_stitches) {
    errors.push('Missing gauge stitches information');
  }
  if (!data.original_gauge?.original_gauge_rows) {
    errors.push('Missing gauge rows information');
  }

  // Check pattern values
  const allValues = { ...data.original_pattern_values };
  if (data.components?.length === 1) {
    Object.assign(allValues, data.components[0].values);
  }

  const requiredFields = Object.keys(keywords.pattern_values);
  for (const field of requiredFields) {
    if (!(field in allValues)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: `Validation failed: ${errors.join(', ')}`
    };
  }

  return { success: true };
}

/**
 * Get example text for a template
 */
export function getExampleTextForTemplate(templateKey: string, unit: MeasurementUnit = 'cm'): string {
  const unitSuffix = unit === 'cm' ? '_CM' : '_IN';
  const gaugeSuffix = unit === 'cm' ? '_PER_10CM' : '_PER_4IN';

  switch (templateKey) {
    case 'simple_body_panel_rectangular':
      return `PATTERN_NAME: My Sweater Body Panel
ORIGINAL_GAUGE_STITCHES${gaugeSuffix}: 20
ORIGINAL_GAUGE_ROWS${gaugeSuffix}: 28
COMPONENT: BodyPanel
CAST_ON: 100
ROWS_TOTAL: 150
FINISHED_WIDTH${unitSuffix}: 50
FINISHED_LENGTH${unitSuffix}: 75`;

    case 'simple_sleeve_tapered':
      return `PATTERN_NAME: My Sweater Sleeve
ORIGINAL_GAUGE_STITCHES${gaugeSuffix}: 20
ORIGINAL_GAUGE_ROWS${gaugeSuffix}: 28
COMPONENT: Sleeve
CUFF_STITCHES: 40
UPPER_ARM_STITCHES: 80
SLEEVE_LENGTH_ROWS: 120
SHAPING_STITCHES_PER_EVENT: 2`;

    case 'simple_scarf_rectangular':
      return `PATTERN_NAME: My Scarf
ORIGINAL_GAUGE_STITCHES${gaugeSuffix}: 18
ORIGINAL_GAUGE_ROWS${gaugeSuffix}: 24
COMPONENT: Scarf
CAST_ON: 60
FINISHED_WIDTH${unitSuffix}: 25
FINISHED_LENGTH${unitSuffix}: 180`;

    case 'simple_hat_cylindrical':
      return `PATTERN_NAME: My Hat
ORIGINAL_GAUGE_STITCHES${gaugeSuffix}: 22
ORIGINAL_GAUGE_ROWS${gaugeSuffix}: 30
COMPONENT: Hat
CAST_ON: 120
HEAD_CIRCUMFERENCE: 56
HAT_HEIGHT: 20`;

    default:
      return `PATTERN_NAME: My Pattern
ORIGINAL_GAUGE_STITCHES${gaugeSuffix}: 20
ORIGINAL_GAUGE_ROWS${gaugeSuffix}: 28
// Add your pattern values here...`;
  }
} 