# Pattern Calculation API Documentation (US_6.1)

## Overview

The Pattern Calculation API provides a standardized interface for transforming pattern definition session data into calculation engine input format and performing pattern calculations. This API serves as the bridge between the user interface data collection and the core pattern calculation engine.

## Version

Current API Version: `1.0.0`
Schema Version: `1.0.0`

## Architecture

The Pattern Calculation system follows a layered architecture:

```
UI Components → PatternCalculatorService → API Route → Core Calculation Engine
                     ↓
            PatternCalculationInputBuilderService
                     ↓
            Validation & Transformation Utilities
```

## API Endpoints

### POST `/api/pattern-calculator/calculate-pattern`

Calculates pattern specifications from input data.

#### Authentication
Requires valid user session (authenticated via cookies).

#### Request Body

```typescript
interface PatternCalculationRequest {
  input: PatternCalculationInput;
  options?: {
    includeShaping?: boolean;
    includeYarnEstimate?: boolean;
    instructionFormat?: 'text' | 'chart' | 'both';
  };
}
```

#### Response

```typescript
interface PatternCalculationResponse {
  success: boolean;
  data?: PatternCalculationResult;
  error?: string;
  validationErrors?: string[];
}
```

#### Example Request

```json
{
  "input": {
    "version": "1.0.0",
    "sessionId": "session_abc123",
    "units": {
      "dimensionUnit": "cm",
      "gaugeUnit": "cm"
    },
    "gauge": {
      "stitchesPer10cm": 22,
      "rowsPer10cm": 30,
      "unit": "cm",
      "profileName": "DK Cotton Gauge"
    },
    "yarn": {
      "name": "Cotton Classic",
      "weightCategory": "DK",
      "fiber": "Cotton 100%"
    },
    "stitchPattern": {
      "name": "Stockinette Stitch",
      "horizontalRepeat": 1,
      "verticalRepeat": 1,
      "patternType": "basic"
    },
    "garment": {
      "typeKey": "basic_sweater",
      "displayName": "Basic Pullover Sweater",
      "constructionMethod": "drop_shoulder",
      "bodyShape": "straight",
      "measurements": {
        "finishedChestCircumference": 100,
        "finishedLength": 60
      },
      "components": [
        {
          "componentKey": "front_body_panel",
          "displayName": "Front Body Panel",
          "targetWidth": 50,
          "targetLength": 60,
          "attributes": {}
        }
      ]
    },
    "requestedAt": "2025-01-27T10:30:00Z"
  },
  "options": {
    "includeShaping": true,
    "instructionFormat": "text"
  }
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "calculationId": "calc_1706356200000_abc123def",
    "sessionId": "session_abc123",
    "calculatedAt": "2025-01-27T10:30:00Z",
    "input": { /* original input data */ },
    "components": [
      {
        "componentKey": "front_body_panel",
        "displayName": "Front Body Panel",
        "stitchCount": 110,
        "rowCount": 180,
        "shapingInstructions": [
          "Cast on 110 stitches",
          "Work in pattern for 180 rows",
          "Bind off all stitches"
        ],
        "metadata": {
          "targetDimensions": {
            "width": 50,
            "length": 60
          },
          "calculatedDimensions": {
            "actualWidth": 50,
            "actualLength": 60
          }
        }
      }
    ],
    "patternMetadata": {
      "totalStitches": 110,
      "estimatedTime": "1 hours",
      "difficultyLevel": "beginner"
    },
    "status": "success",
    "warnings": []
  }
}
```

## Data Structures

### PatternCalculationInput

The core input structure for pattern calculations. See [pattern-calculation-schema.json](./pattern-calculation-schema.json) for the complete JSON Schema definition.

#### Required Fields

- `version`: Schema version (e.g., "1.0.0")
- `sessionId`: Unique session identifier
- `units`: Measurement units configuration
- `gauge`: Gauge data (stitches and rows per unit)
- `yarn`: Yarn profile information
- `stitchPattern`: Stitch pattern details
- `garment`: Garment definition with measurements and components
- `requestedAt`: ISO 8601 timestamp

#### Key Components

##### Units Configuration
```typescript
interface CalculationUnits {
  dimensionUnit: 'cm' | 'inches';
  gaugeUnit: 'cm' | 'inches';
}
```

##### Gauge Data
```typescript
interface CalculationGaugeData {
  stitchesPer10cm: number;
  rowsPer10cm: number;
  unit: string;
  profileName?: string;
}
```

##### Finished Measurements
```typescript
interface CalculationMeasurements {
  finishedChestCircumference: number;
  finishedLength: number;
  finishedWaistCircumference?: number;
  finishedHipCircumference?: number;
  finishedShoulderWidth?: number;
  finishedArmLength?: number;
  finishedUpperArmCircumference?: number;
  finishedNeckCircumference?: number;
  additionalMeasurements?: Record<string, number>;
}
```

##### Component Definition
```typescript
interface CalculationComponentDefinition {
  componentKey: string;
  displayName: string;
  targetWidth?: number;
  targetLength?: number;
  targetCircumference?: number;
  attributes: Record<string, any>;
}
```

## Services

### PatternCalculatorService

Client-side service for pattern calculation operations.

#### Methods

##### `calculatePatternFromSession(sessionData, options)`
Transforms session data and calculates pattern.

##### `calculatePattern(input, options)`
Calculates pattern from prepared input data.

##### `buildCalculationInput(sessionData, options)`
Transforms session data to calculation input format.

##### `estimateCalculationComplexity(sessionData)`
Estimates calculation complexity and time.

### PatternCalculationInputBuilderService

Service for transforming pattern definition session data into calculation engine input format.

#### Methods

##### `buildCalculationInput(sessionData, options)`
Main transformation method that:
1. Validates session data completeness
2. Builds calculation units from session data
3. Constructs gauge data
4. Builds yarn and stitch pattern profiles
5. Calculates finished measurements by applying ease
6. Constructs garment definition with components

## Validation

### Input Validation

The API performs comprehensive validation on input data:

1. **Schema Validation**: Ensures all required fields are present and correctly typed
2. **Business Logic Validation**: Validates measurement ranges, gauge values, and component definitions
3. **Consistency Validation**: Checks for logical consistency between related fields

### Validation Utilities

#### `validatePatternCalculationInput(input)`
Validates complete calculation input structure.

#### `applyEaseToMeasurements(bodyMeasurements, easePreference, garmentType)`
Applies ease to body measurements to calculate finished garment dimensions.

## Error Handling

### HTTP Status Codes

- `200`: Successful calculation
- `400`: Invalid request data or validation errors
- `401`: Authentication required
- `500`: Internal server error

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  validationErrors?: string[];
}
```

### Common Validation Errors

- Missing required fields (sessionId, gauge data, measurements)
- Invalid measurement ranges
- Inconsistent units
- Missing garment components
- Invalid gauge values

## Usage Examples

### Basic Usage with Service

```typescript
import { PatternCalculatorService } from '@/services/patternCalculatorService';

const calculatorService = new PatternCalculatorService();

// Calculate pattern from session data
try {
  const result = await calculatorService.calculatePatternFromSession(
    sessionData,
    {
      includeShaping: true,
      instructionFormat: 'text',
      validateInput: true
    }
  );
  
  console.log('Pattern calculated successfully:', result);
  console.log('Total stitches:', result.patternMetadata.totalStitches);
  console.log('Estimated time:', result.patternMetadata.estimatedTime);
  
} catch (error) {
  console.error('Calculation failed:', error.message);
}
```

### Complexity Estimation

```typescript
// Estimate calculation complexity before running
const complexity = await calculatorService.estimateCalculationComplexity(sessionData);

console.log('Estimated components:', complexity.estimatedComponents);
console.log('Estimated stitches:', complexity.estimatedStitches);
console.log('Complexity level:', complexity.estimatedComplexity);
console.log('Estimated time:', complexity.estimatedTime);

if (complexity.warnings.length > 0) {
  console.warn('Warnings:', complexity.warnings);
}
```

### Direct API Usage

```typescript
// Direct API call (not recommended - use service instead)
const response = await fetch('/api/pattern-calculator/calculate-pattern', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: calculationInput,
    options: {
      includeShaping: true,
      instructionFormat: 'text'
    }
  }),
});

const result = await response.json();
```

## Versioning and Compatibility

### Schema Versioning

The calculation input schema uses semantic versioning:
- **Major version**: Breaking changes to required fields or data types
- **Minor version**: New optional fields or non-breaking enhancements
- **Patch version**: Bug fixes and clarifications

### Backward Compatibility

The API maintains backward compatibility within major versions by:
- Supporting older schema versions in input validation
- Providing default values for new optional fields
- Graceful handling of deprecated fields

## Performance Considerations

### Calculation Complexity

Pattern calculation complexity depends on:
- Number of garment components
- Total stitch count
- Stitch pattern complexity
- Shaping requirements

### Optimization Tips

1. **Validate Early**: Use input validation before expensive calculations
2. **Estimate First**: Use complexity estimation for large patterns
3. **Cache Results**: Consider caching calculation results for identical inputs
4. **Batch Processing**: For multiple calculations, consider batching requests

## Security

### Authentication

All calculation endpoints require valid user authentication via session cookies.

### Input Sanitization

All input data is validated and sanitized to prevent:
- SQL injection (though this API doesn't directly access database)
- XSS attacks in stored calculation results
- Resource exhaustion from malformed input

### Rate Limiting

Consider implementing rate limiting for calculation endpoints to prevent abuse.

## Monitoring and Debugging

### Logging

The API logs:
- Calculation requests and responses
- Validation errors and warnings
- Performance metrics
- Error conditions

### Debug Information

Enable debug information in development:

```typescript
const result = await calculatorService.calculatePatternFromSession(
  sessionData,
  {
    includeDebugInfo: true
  }
);

console.log('Debug info:', result.debugInfo);
```

## Future Enhancements

The current implementation (US_6.1) provides the foundation for:

1. **Advanced Shaping Calculations**: More sophisticated shaping algorithms
2. **Yarn Estimation**: Accurate yarn quantity calculations
3. **Chart Generation**: Visual pattern charts
4. **Pattern Export**: Multiple output formats (PDF, text, etc.)
5. **Collaborative Features**: Sharing and versioning of calculations

## Related Documentation

- [Pattern Definition Session Types](../types/patternDefinition.md)
- [Measurement Management](../types/measurements.md)
- [Ease Preferences](../types/ease.md)
- [Gauge Profiles](../types/gauge.md)
- [Yarn Profiles](../types/yarn.md) 