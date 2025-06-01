# Example Usage: Raglan Top-Down Construction Calculator (US_12.1)

This document demonstrates how to use the newly implemented raglan top-down construction calculator.

## Overview

The raglan top-down calculator implements the logic for calculating raglan sweaters knitted from the neckline down. It calculates:

- Initial neckline cast-on stitches
- Distribution of stitches between body panels, sleeves, and raglan lines
- Raglan increase scheduling
- Stitch counts at separation point
- Underarm cast-on stitches

## Basic Usage

### 1. Frontend Integration

When selecting sweater construction in the UI, users can now choose "Raglan Top-Down":

```typescript
// In SweaterStructureSelector component
const selectedConstructionMethod = 'raglan_top_down';

// This will be stored in the pattern definition session
```

### 2. API Calculation Request

When the calculation API is called, components with `construction_method: 'raglan_top_down'` will be automatically detected and calculated using the raglan calculator:

```typescript
// Example component data in pattern definition session
const componentData = {
  componentKey: 'raglan_yoke',
  displayName: 'Raglan Sweater',
  attributes: {
    construction_method: 'raglan_top_down',
    bust_circumference_cm: 100,
    body_length_cm: 60,
    sleeve_length_cm: 60,
    upper_arm_circumference_cm: 35,
    neckline_depth_cm: 8,
    neckline_circumference_cm: 36,
    raglan_line_stitches: 2,
    ease: {
      neckline_cm: 2,
      body_cm: 5,
      sleeve_cm: 3
    }
  }
};
```

### 3. Calculation Results

The API returns comprehensive raglan calculation data:

```json
{
  "success": true,
  "data": {
    "calculationId": "calc_1234567890_abc123",
    "components": [
      {
        "componentKey": "raglan_yoke",
        "displayName": "Raglan Sweater",
        "stitchCount": 280,
        "rowCount": 80,
        "raglanTopDownCalculations": {
          "neckline_cast_on_total": 76,
          "initial_distribution": {
            "front_stitches": 23,
            "back_stitches": 23,
            "sleeve_left_stitches": 11,
            "sleeve_right_stitches": 11,
            "raglan_line_stitches_each": 2,
            "total_check": 76
          },
          "raglan_shaping": {
            "raglan_line_length_rows_or_rounds": 60,
            "augmentation_frequency_description": "Increase 8 stitches every 2nd round/row.",
            "total_augmentation_rounds_or_rows": 28,
            "total_increases_per_sleeve": 28,
            "total_increases_per_body_panel": 28,
            "increase_frequency": 2
          },
          "stitches_at_separation": {
            "body_total_stitches": 158,
            "sleeve_each_stitches": 61,
            "underarm_cast_on_stitches": 8
          },
          "calculation_metadata": {
            "actual_neckline_circumference_cm": 38.0,
            "actual_body_width_at_separation_cm": 79.0,
            "actual_sleeve_width_at_separation_cm": 30.5
          }
        },
        "shapingInstructions": [
          "Cast on 76 stitches for neckline",
          "Distribute stitches: 23 back, 23 front, 11 each sleeve, 2 each raglan line",
          "Increase 8 stitches every 2nd round/row.",
          "Work raglan increases for 28 rounds/rows",
          "At separation: 158 body stitches, 61 sleeve stitches each",
          "Cast on 8 stitches under each arm"
        ]
      }
    ]
  }
}
```

## Example Pattern Definition

Here's a complete example of how to set up a raglan top-down sweater:

```typescript
const patternDefinitionSession = {
  craft_type: 'knitting',
  project_type: 'sweater',
  garment_type: {
    key: 'sweater',
    construction_method: 'raglan_top_down',
    body_shape: 'straight'
  },
  gauge_profile: {
    stitches_per_10cm: 20,
    rows_per_10cm: 30,
    unit: 'cm'
  },
  yarn_profile: {
    name: 'DK Cotton',
    weight_category: 'DK'
  },
  components: [
    {
      component_key: 'raglan_yoke',
      component_name: 'Raglan Sweater',
      selected_attributes: {
        construction_method: 'raglan_top_down',
        bust_circumference_cm: 100,
        body_length_cm: 60,
        sleeve_length_cm: 60,
        upper_arm_circumference_cm: 35,
        neckline_depth_cm: 8,
        neckline_circumference_cm: 36,
        raglan_line_stitches: 2
      }
    }
  ]
};
```

## Direct Calculator Usage

For advanced use cases, you can use the calculator directly:

```typescript
import { calculateRaglanTopDown } from '@/utils/raglan-top-down-calculator';
import { RaglanTopDownInput } from '@/types/raglan-construction';

const input: RaglanTopDownInput = {
  targetDimensions: {
    bustCircumference_cm: 100,
    bodyLength_cm: 60,
    sleeveLength_cm: 60,
    upperArmCircumference_cm: 35
  },
  gauge: {
    stitchesPer10cm: 20,
    rowsPer10cm: 30,
    unit: 'cm'
  },
  neckline: {
    depth_cm: 8,
    circumference_cm: 36
  },
  raglanLineStitches: 2,
  componentKey: 'raglan_sweater'
};

const result = calculateRaglanTopDown(input);

if (result.success) {
  console.log('Neckline cast-on:', result.calculations.neckline_cast_on_total);
  console.log('Initial distribution:', result.calculations.initial_distribution);
  console.log('Raglan shaping:', result.calculations.raglan_shaping);
  console.log('At separation:', result.calculations.stitches_at_separation);
} else {
  console.error('Calculation failed:', result.error);
}
```

## Configuration Options

### Raglan Line Stitches

The number of stitches dedicated to each raglan line can be customized:

- `1`: Minimal raglan line (single stitch increases)
- `2`: Standard raglan line (most common)
- `3-4`: Decorative raglan line with small cable or pattern
- `5-6`: Wide decorative raglan line

### Ease Settings

Custom ease can be applied:

```typescript
const ease = {
  neckline_cm: 2,  // Ease around neckline
  body_cm: 5,      // Positive ease for body
  sleeve_cm: 3     // Ease for upper arm
};
```

## Error Handling

The calculator includes comprehensive validation:

```typescript
const result = calculateRaglanTopDown(input);

if (!result.success) {
  if (result.validationErrors) {
    console.log('Validation errors:', result.validationErrors);
  }
  if (result.error) {
    console.log('Calculation error:', result.error);
  }
}

if (result.warnings) {
  console.log('Warnings:', result.warnings);
}
```

## Integration with Pattern Generation

The raglan calculations integrate seamlessly with the existing pattern generation system:

1. **Instruction Generation**: Basic shaping instructions are automatically generated
2. **Stitch Pattern Integration**: Works with existing stitch pattern features
3. **Yarn Estimation**: Integrates with yarn quantity estimation
4. **PDF Export**: Results can be included in generated pattern PDFs

## Testing

Run the comprehensive test suite:

```bash
npm test raglan-top-down-calculator.test.ts
```

The tests validate all acceptance criteria from US_12.1:
- AC1: Plausible neckline cast-on calculation
- AC2: Correct stitch distribution
- AC3: Proper raglan increase scheduling
- AC4: Underarm cast-on calculation
- AC5: Complete output data structure 