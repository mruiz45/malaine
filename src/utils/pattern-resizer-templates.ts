/**
 * Pattern Resizer Templates Configuration (US 10.1)
 * Defines the available garment structure templates for existing pattern resizing
 */

import { PatternResizerTemplate } from '@/types/pattern-resizer';

/**
 * Available pattern resizer templates
 * Each template defines the expected inputs and outputs for a specific garment structure
 */
export const PATTERN_RESIZER_TEMPLATES: PatternResizerTemplate[] = [
  {
    template_key: 'simple_body_panel_rectangular',
    display_name: 'Simple Rectangular Body Panel (Sweater/Cardigan)',
    description: 'For basic rectangular body pieces like sweater fronts/backs without complex shaping',
    inputs_original_pattern: [
      {
        key: 'original_gauge_stitches',
        label: 'Original Gauge: Stitches per 10cm/4in',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'original_gauge_rows',
        label: 'Original Gauge: Rows per 10cm/4in',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'original_cast_on',
        label: 'Original Cast-On Stitches',
        type: 'number',
        min: 1,
        step: 1,
        required: true
      },
      {
        key: 'original_rows_total',
        label: 'Original Total Rows',
        type: 'number',
        min: 1,
        step: 1,
        required: true
      },
      {
        key: 'original_finished_width',
        label: 'Original Finished Width (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'original_finished_length',
        label: 'Original Finished Length (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      }
    ],
    inputs_new_params: [
      {
        key: 'new_finished_width',
        label: 'Desired NEW Finished Width (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'new_finished_length',
        label: 'Desired NEW Finished Length (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      }
    ],
    outputs_calculated: [
      'new_cast_on_stitches',
      'new_total_rows',
      'new_actual_width',
      'new_actual_length'
    ],
    supports_shaping: false
  },
  {
    template_key: 'simple_sleeve_tapered',
    display_name: 'Simple Tapered Sleeve',
    description: 'For sleeves with basic linear tapering from cuff to upper arm',
    inputs_original_pattern: [
      {
        key: 'original_gauge_stitches',
        label: 'Original Gauge: Stitches per 10cm/4in',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'original_gauge_rows',
        label: 'Original Gauge: Rows per 10cm/4in',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'original_cuff_stitches',
        label: 'Original Cuff Stitches',
        type: 'number',
        min: 1,
        step: 1,
        required: true
      },
      {
        key: 'original_upper_arm_stitches',
        label: 'Original Upper Arm Stitches',
        type: 'number',
        min: 1,
        step: 1,
        required: true
      },
      {
        key: 'original_sleeve_length_rows',
        label: 'Original Sleeve Length (in Rows)',
        type: 'number',
        min: 1,
        step: 1,
        required: true
      },
      {
        key: 'original_shaping_stitches_per_event',
        label: 'Original Sts Inc/Dec per Shaping Row (e.g., 2 for 1 each end)',
        type: 'number',
        min: 1,
        step: 1,
        required: true,
        placeholder: '2'
      }
    ],
    inputs_new_params: [
      {
        key: 'new_cuff_width',
        label: 'Desired NEW Cuff Width (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'new_upper_arm_width',
        label: 'Desired NEW Upper Arm Width (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'new_sleeve_length',
        label: 'Desired NEW Sleeve Length (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      }
    ],
    outputs_calculated: [
      'new_cuff_stitches',
      'new_upper_arm_stitches',
      'new_sleeve_length_rows',
      'new_shaping_schedule_summary'
    ],
    supports_shaping: true
  },
  {
    template_key: 'simple_scarf_rectangular',
    display_name: 'Simple Rectangular Scarf',
    description: 'For basic rectangular scarves with consistent width',
    inputs_original_pattern: [
      {
        key: 'original_gauge_stitches',
        label: 'Original Gauge: Stitches per 10cm/4in',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'original_gauge_rows',
        label: 'Original Gauge: Rows per 10cm/4in',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'original_cast_on',
        label: 'Original Cast-On Stitches',
        type: 'number',
        min: 1,
        step: 1,
        required: true
      },
      {
        key: 'original_finished_width',
        label: 'Original Finished Width (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'original_finished_length',
        label: 'Original Finished Length (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      }
    ],
    inputs_new_params: [
      {
        key: 'new_finished_width',
        label: 'Desired NEW Finished Width (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'new_finished_length',
        label: 'Desired NEW Finished Length (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      }
    ],
    outputs_calculated: [
      'new_cast_on_stitches',
      'new_total_rows',
      'new_actual_width',
      'new_actual_length'
    ],
    supports_shaping: false
  },
  {
    template_key: 'simple_hat_cylindrical',
    display_name: 'Simple Cylindrical Hat Body',
    description: 'For the main cylindrical body of a hat (before crown shaping)',
    inputs_original_pattern: [
      {
        key: 'original_gauge_stitches',
        label: 'Original Gauge: Stitches per 10cm/4in',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'original_gauge_rows',
        label: 'Original Gauge: Rows per 10cm/4in',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'original_cast_on',
        label: 'Original Cast-On Stitches',
        type: 'number',
        min: 1,
        step: 1,
        required: true
      },
      {
        key: 'original_head_circumference',
        label: 'Original Head Circumference (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'original_hat_height',
        label: 'Original Hat Height (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      }
    ],
    inputs_new_params: [
      {
        key: 'new_head_circumference',
        label: 'Desired NEW Head Circumference (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      },
      {
        key: 'new_hat_height',
        label: 'Desired NEW Hat Height (cm/in)',
        type: 'number',
        min: 0.1,
        step: 0.1,
        required: true
      }
    ],
    outputs_calculated: [
      'new_cast_on_stitches',
      'new_total_rows',
      'new_actual_circumference',
      'new_actual_height'
    ],
    supports_shaping: false
  }
];

/**
 * Get template by key
 */
export function getTemplateByKey(templateKey: string): PatternResizerTemplate | undefined {
  return PATTERN_RESIZER_TEMPLATES.find(template => template.template_key === templateKey);
}

/**
 * Get all available templates
 */
export function getAllTemplates(): PatternResizerTemplate[] {
  return PATTERN_RESIZER_TEMPLATES;
}

/**
 * Get templates that support shaping
 */
export function getShapingTemplates(): PatternResizerTemplate[] {
  return PATTERN_RESIZER_TEMPLATES.filter(template => template.supports_shaping);
}

/**
 * Get templates that don't support shaping
 */
export function getSimpleTemplates(): PatternResizerTemplate[] {
  return PATTERN_RESIZER_TEMPLATES.filter(template => !template.supports_shaping);
} 