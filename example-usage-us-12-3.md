# Example Usage: Hammer Sleeve Construction Calculator (US_12.3)

This document demonstrates how to use the newly implemented hammer sleeve construction calculator.

## Overview

The hammer sleeve calculator implements the logic for calculating hammer sleeve garments where the sleeve cap extends horizontally to form part of the shoulder. It calculates:

- Sleeve cap extension dimensions (horizontal part forming shoulder)
- Sleeve cap vertical part dimensions (part rising along the arm)
- Body panel armhole cutout dimensions and shaping
- Geometric compatibility between sleeve and body pieces

## Basic Usage

### 1. Frontend Integration

When selecting garment construction in the UI, users can now choose "Hammer Sleeve":

```typescript
// In garment construction selector component
const selectedConstructionMethod = 'hammer_sleeve';

// This will be stored in the pattern definition session
```

### 2. Component Data Structure

Components using hammer sleeve construction should include the required attributes:

```typescript
// Example component data in pattern definition session
const componentData = {
  componentKey: 'hammer_sleeve_garment',
  displayName: 'Hammer Sleeve Sweater',
  attributes: {
    construction_method: 'hammer_sleeve',
    total_shoulder_width_cm: 45,
    upper_arm_width_cm: 30,
    armhole_depth_cm: 20,
    neckline_width_cm: 25
  }
};
```

### 3. API Calculation Request

When the calculation API is called, components with `construction_method: 'hammer_sleeve'` will be automatically detected and calculated using the hammer sleeve calculator:

```typescript
// Example API request
const calculationRequest = {
  input: {
    version: "1.0.0",
    sessionId: "session_12345",
    units: { dimensionUnit: "cm", gaugeUnit: "cm" },
    gauge: {
      stitchesPer10cm: 20,
      rowsPer10cm: 30,
      unit: "cm",
      profileName: "Standard DK"
    },
    // ... other required fields
    garment: {
      components: [componentData]
    }
  }
};
```

### 4. Calculation Results

The API returns comprehensive hammer sleeve calculation data:

```json
{
  "success": true,
  "data": {
    "components": [
      {
        "componentKey": "hammer_sleeve_garment",
        "displayName": "Hammer Sleeve Sweater",
        "stitchCount": 320,
        "rowCount": 80,
        "shapingInstructions": [
          "Sleeve cap extension: 20 stitches wide, 10 rows long",
          "Sleeve cap vertical part: 60 stitches wide, 60 rows high",
          "Body shoulder strap: 25 stitches each side",
          "Body armhole cutout: 60 stitches wide, 60 rows deep",
          "Bind off 60 stitches for armhole cutout",
          "Total body width at chest: 170 stitches"
        ],
        "hammerSleeveCalculations": {
          "hammer_sleeve_shaping": {
            "sleeve_cap_extension": {
              "width_stitches": 20,
              "length_rows": 10,
              "shaping_to_neck_details": []
            },
            "sleeve_cap_vertical_part": {
              "width_stitches": 60,
              "height_rows": 60,
              "shaping_from_arm_details": []
            }
          },
          "body_panel_hammer_armhole_shaping": {
            "shoulder_strap_width_stitches": 25,
            "armhole_cutout_width_stitches": 60,
            "armhole_depth_rows": 60,
            "bind_off_for_cutout_stitches": 60,
            "body_width_at_chest_stitches": 170
          },
          "calculation_metadata": {
            "actual_shoulder_width_cm": 45.0,
            "actual_upper_arm_width_cm": 30.0,
            "actual_armhole_depth_cm": 20.0
          }
        }
      }
    ]
  }
}
```

## Calculation Logic

### Sleeve Cap Extension (Horizontal Part)

The horizontal extension forms the shoulder part of the garment:

- **Width**: `(total_shoulder_width_cm - neckline_width_cm) / 2`
- **Length**: Default height for joining neckline (currently 10 rows)
- **Shaping**: Rectangular (future enhancement for shaped joining)

### Sleeve Cap Vertical Part

The vertical part rises along the arm:

- **Width**: Equals upper arm width in stitches
- **Height**: Equals armhole depth in rows
- **Shaping**: Straight (future enhancement for shaped transitions)

### Body Panel Armhole Shaping

The body panels are shaped to accommodate the hammer sleeve:

- **Shoulder Strap Width**: `neckline_width_cm / 2` converted to stitches
- **Armhole Cutout Width**: Equals upper arm width in stitches
- **Armhole Cutout Depth**: Equals armhole depth in rows
- **Bind-off Stitches**: Equals cutout width (creates rectangular cutout)
- **Total Body Width**: `(shoulder_strap_width * 2) + (armhole_cutout_width * 2)`

## Validation and Compatibility

### Input Validation

The calculator validates:
- All dimensions are positive numbers
- Neckline width is smaller than total shoulder width
- Reasonable dimension ranges (warnings for extreme values)
- Required gauge information is present

### Geometric Compatibility

The calculator ensures:
- Sleeve vertical part width matches body cutout width
- Sleeve vertical part height matches body cutout depth
- All calculations use consistent gauge conversions

## Example Calculations

### Standard Adult Sweater

Given:
- Total shoulder width: 45cm
- Upper arm width: 30cm
- Armhole depth: 20cm
- Neckline width: 25cm
- Gauge: 20 stitches, 30 rows per 10cm

Results:
- Sleeve extension: 20 stitches × 10 rows
- Sleeve vertical: 60 stitches × 60 rows
- Body shoulder strap: 25 stitches each side
- Body armhole cutout: 60 stitches × 60 rows
- Total body width: 170 stitches

### Fine Gauge Sweater

Given:
- Same dimensions as above
- Gauge: 30 stitches, 40 rows per 10cm

Results (proportionally more stitches/rows):
- Sleeve extension: 30 stitches × 13 rows
- Sleeve vertical: 90 stitches × 80 rows
- Body shoulder strap: 38 stitches each side
- Body armhole cutout: 90 stitches × 80 rows
- Total body width: 256 stitches

## Error Handling

The calculator handles various error conditions:

### Missing Required Dimensions
```json
{
  "success": false,
  "error": "Invalid input data",
  "validationErrors": [
    "Total shoulder width must be a positive number"
  ]
}
```

### Geometric Inconsistencies
```json
{
  "success": true,
  "warnings": [
    "Shoulder extension width (3.0cm) is too small. Minimum: 5cm"
  ]
}
```

### Component Extraction Errors
```json
{
  "success": false,
  "error": "Unable to extract hammer sleeve input from component data"
}
```

## Integration with Other Systems

### Pattern Definition (US 4.x)
The hammer sleeve option should be available in construction method selectors.

### Instruction Generation (US 12.4)
The calculation results will feed into the instruction generator for step-by-step knitting instructions.

### Future Enhancements
- Shaped shoulder extensions for curved necklines
- Gradual transitions from arm to extension
- Integration with different neckline styles
- Seaming vs. seamless construction options

## Testing

The implementation includes comprehensive tests covering:
- All acceptance criteria (AC1-AC4)
- Helper function calculations
- Component detection and extraction
- Edge cases and error handling
- Different gauge scenarios

Run tests with:
```bash
npm test hammer-sleeve-calculator.test.ts
``` 