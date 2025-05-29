/**
 * Pattern Resizer Service (US 10.1)
 * Client-side service for existing pattern resizing functionality
 * Follows the established service layer pattern in the Malaine project
 */

import { 
  PatternResizerInput, 
  PatternResizerResult, 
  PatternResizerApiResponse 
} from '@/types/pattern-resizer';

/**
 * Calculate new pattern values for an existing pattern
 * @param input Pattern resizer calculation input
 * @returns Promise resolving to calculation result
 */
export async function calculatePatternResize(input: PatternResizerInput): Promise<PatternResizerResult> {
  try {
    const response = await fetch('/api/tools/pattern-resizer/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const data: PatternResizerApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Calculation failed');
    }

    if (!data.data) {
      throw new Error('No calculation result returned');
    }

    return data.data;

  } catch (error) {
    console.error('Pattern resizer service error:', error);
    
    // Re-throw with a more user-friendly message
    if (error instanceof Error) {
      throw new Error(`Failed to calculate pattern resize: ${error.message}`);
    } else {
      throw new Error('Failed to calculate pattern resize: Unknown error');
    }
  }
}

/**
 * Validate pattern resizer input on client side
 * @param input Pattern resizer input to validate
 * @returns Object with validation result and errors
 */
export function validatePatternResizerInput(input: Partial<PatternResizerInput>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate template key
  if (!input.template_key || typeof input.template_key !== 'string') {
    errors.push('Template selection is required');
  }

  // Validate original gauge
  if (!input.original_gauge) {
    errors.push('Original gauge information is required');
  } else {
    if (!input.original_gauge.original_gauge_stitches || input.original_gauge.original_gauge_stitches <= 0) {
      errors.push('Original gauge stitches must be a positive number');
    }
    if (!input.original_gauge.original_gauge_rows || input.original_gauge.original_gauge_rows <= 0) {
      errors.push('Original gauge rows must be a positive number');
    }
    if (!input.original_gauge.original_gauge_unit) {
      errors.push('Original gauge unit is required');
    }
  }

  // Validate new gauge
  if (!input.new_gauge) {
    errors.push('New gauge information is required');
  } else {
    if (!input.new_gauge.new_gauge_stitches || input.new_gauge.new_gauge_stitches <= 0) {
      errors.push('New gauge stitches must be a positive number');
    }
    if (!input.new_gauge.new_gauge_rows || input.new_gauge.new_gauge_rows <= 0) {
      errors.push('New gauge rows must be a positive number');
    }
    if (!input.new_gauge.new_gauge_unit) {
      errors.push('New gauge unit is required');
    }
  }

  // Validate original pattern values
  if (!input.original_pattern_values || Object.keys(input.original_pattern_values).length === 0) {
    errors.push('Original pattern values are required');
  } else {
    // Check for positive numeric values
    Object.entries(input.original_pattern_values).forEach(([key, value]) => {
      if (typeof value === 'number' && value <= 0) {
        errors.push(`${key.replace(/_/g, ' ')} must be a positive number`);
      } else if (typeof value === 'string' && value.trim() === '') {
        errors.push(`${key.replace(/_/g, ' ')} cannot be empty`);
      }
    });
  }

  // Validate new dimension values
  if (!input.new_dimension_values || Object.keys(input.new_dimension_values).length === 0) {
    errors.push('New dimension values are required');
  } else {
    // Check for positive numeric values
    Object.entries(input.new_dimension_values).forEach(([key, value]) => {
      if (typeof value === 'number' && value <= 0) {
        errors.push(`${key.replace(/_/g, ' ')} must be a positive number`);
      } else if (typeof value === 'string' && value.trim() === '') {
        errors.push(`${key.replace(/_/g, ' ')} cannot be empty`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format calculation results for display
 * @param result Pattern resizer calculation result
 * @returns Formatted result object for UI display
 */
export function formatPatternResizerResult(result: PatternResizerResult): {
  formattedValues: { [key: string]: string };
  warnings: string[];
  metadata: {
    templateUsed: string;
    calculatedAt: string;
    hadShaping: boolean;
  };
} {
  const formattedValues: { [key: string]: string } = {};

  if (result.calculated_new_values) {
    Object.entries(result.calculated_new_values).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'number') {
          // Format numbers appropriately
          if (key.includes('width') || key.includes('length') || key.includes('circumference') || key.includes('height')) {
            formattedValues[key] = `${value.toFixed(1)}`;
          } else {
            formattedValues[key] = value.toString();
          }
        } else {
          formattedValues[key] = value.toString();
        }
      }
    });
  }

  return {
    formattedValues,
    warnings: result.warnings || [],
    metadata: {
      templateUsed: result.metadata?.template_used || 'Unknown',
      calculatedAt: result.metadata?.calculated_at || new Date().toISOString(),
      hadShaping: result.metadata?.had_shaping || false
    }
  };
} 