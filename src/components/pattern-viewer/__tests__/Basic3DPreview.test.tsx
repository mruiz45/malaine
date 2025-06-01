/**
 * Tests for Basic3DPreview Component (US_12.10)
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Basic3DPreview from '../Basic3DPreview';
import { convertMeasurementsTo3D } from '@/services/garment3DModelService';
import type { FinishedMeasurements } from '@/types/assembled-pattern';

// Mock the 3D service
jest.mock('@/services/garment3DModelService', () => ({
  convertMeasurementsTo3D: jest.fn(),
  inferGarmentType: jest.fn(() => 'sweater'),
  estimateMeasurementsFromCalculations: jest.fn()
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue || key
  })
}));

// Mock LoadingSpinner
jest.mock('@/components/ui/LoadingSpinner', () => {
  return function MockLoadingSpinner({ size }: { size?: string }) {
    return <div data-testid="loading-spinner" data-size={size}>Loading...</div>;
  };
});

const mockConvertMeasurementsTo3D = convertMeasurementsTo3D as jest.MockedFunction<typeof convertMeasurementsTo3D>;

describe('Basic3DPreview', () => {
  const validMeasurements: FinishedMeasurements = {
    chest: '96 cm',
    length: '65 cm',
    arm_length: '60 cm',
    upper_arm: '32 cm',
    waist: '88 cm',
    shoulder_width: '42 cm',
    neck: '36 cm'
  };

  const mockSuccessfulModel = {
    success: true,
    model: {
      components: [
        {
          id: 'body',
          name: 'Body',
          type: 'body' as const,
          geometry: {
            radiusTop: 15.28,
            radiusBottom: 14.01,
            height: 65,
            radialSegments: 12,
            transform: {
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 }
            }
          },
          visible: true
        },
        {
          id: 'sleeve-left',
          name: 'Left Sleeve',
          type: 'sleeve' as const,
          geometry: {
            radiusTop: 5.09,
            radiusBottom: 4.07,
            height: 60,
            radialSegments: 8,
            transform: {
              position: { x: -25.6, y: 30, z: 0 },
              rotation: { x: 0, y: 0, z: Math.PI / 2 }
            }
          },
          visible: true
        }
      ],
      sceneBounds: {
        width: 100,
        height: 65,
        depth: 30
      },
      sourceMeasurements: validMeasurements,
      metadata: {
        generatedAt: '2025-01-01T00:00:00.000Z',
        algorithmVersion: '1.0.0',
        warnings: ['Shoulder width not provided - estimated from other measurements']
      }
    },
    warnings: ['Shoulder width not provided - estimated from other measurements']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful 3D Model Generation', () => {
    it('should render 3D preview with valid measurements', () => {
      mockConvertMeasurementsTo3D.mockReturnValue(mockSuccessfulModel);

      const { container } = render(<Basic3DPreview measurements={validMeasurements} />);

      // Should render the component successfully
      expect(container.firstChild).toBeInTheDocument();
      
      // Should call the conversion service
      expect(mockConvertMeasurementsTo3D).toHaveBeenCalledWith(
        validMeasurements, 
        'sweater'
      );
    });

    it('should call onModelLoad callback when model is generated', () => {
      const onModelLoad = jest.fn();
      mockConvertMeasurementsTo3D.mockReturnValue(mockSuccessfulModel);

      render(
        <Basic3DPreview 
          measurements={validMeasurements} 
          onModelLoad={onModelLoad}
        />
      );

      // Should eventually call the callback
      expect(mockConvertMeasurementsTo3D).toHaveBeenCalledWith(
        validMeasurements, 
        'sweater'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle conversion errors gracefully', () => {
      const errorResult = {
        success: false,
        error: 'Invalid measurements: Chest measurement must be at least 30cm',
        warnings: []
      };

      mockConvertMeasurementsTo3D.mockReturnValue(errorResult);

      const invalidMeasurements: FinishedMeasurements = {
        chest: '20 cm', // Too small
        length: '65 cm',
        arm_length: '60 cm',
        upper_arm: '32 cm'
      };

      const { container } = render(<Basic3DPreview measurements={invalidMeasurements} />);

      // Should render without crashing
      expect(container).toBeInTheDocument();
    });

    it('should call onError callback when generation fails', () => {
      const onError = jest.fn();
      const errorResult = {
        success: false,
        error: 'Generation failed',
        warnings: []
      };

      mockConvertMeasurementsTo3D.mockReturnValue(errorResult);

      render(
        <Basic3DPreview 
          measurements={validMeasurements} 
          onError={onError}
        />
      );

      // Should call error callback
      expect(mockConvertMeasurementsTo3D).toHaveBeenCalled();
    });

    it('should handle service exceptions gracefully', () => {
      mockConvertMeasurementsTo3D.mockImplementation(() => {
        throw new Error('Service unavailable');
      });

      const { container } = render(<Basic3DPreview measurements={validMeasurements} />);

      // Should render without crashing
      expect(container).toBeInTheDocument();
    });
  });

  describe('Print Mode', () => {
    it('should render in print mode', () => {
      mockConvertMeasurementsTo3D.mockReturnValue(mockSuccessfulModel);

      const { container } = render(
        <Basic3DPreview measurements={validMeasurements} printMode={true} />
      );

      // Should render without crashing in print mode
      expect(container).toBeInTheDocument();
    });
  });

  describe('Garment Type Inference', () => {
    it('should pass garment type to conversion service', () => {
      mockConvertMeasurementsTo3D.mockReturnValue(mockSuccessfulModel);

      render(
        <Basic3DPreview 
          measurements={validMeasurements} 
          garmentType="cardigan"
        />
      );

      expect(mockConvertMeasurementsTo3D).toHaveBeenCalledWith(
        validMeasurements, 
        'cardigan'
      );
    });

    it('should default to sweater when no garment type provided', () => {
      mockConvertMeasurementsTo3D.mockReturnValue(mockSuccessfulModel);

      render(<Basic3DPreview measurements={validMeasurements} />);

      expect(mockConvertMeasurementsTo3D).toHaveBeenCalledWith(
        validMeasurements, 
        'sweater'
      );
    });
  });
});

/**
 * Integration test - Testing the service integration
 */
describe('Basic3DPreview Service Integration', () => {
  it('should work with real conversion service', () => {
    // Reset mocks to use real service
    jest.unmock('@/services/garment3DModelService');
    
    const realConvertMeasurementsTo3D = jest.requireActual('@/services/garment3DModelService').convertMeasurementsTo3D;
    
    const result = realConvertMeasurementsTo3D({
      chest: '96 cm',
      length: '65 cm',
      arm_length: '60 cm',
      upper_arm: '32 cm'
    });

    expect(result.success).toBe(true);
    expect(result.model).toBeDefined();
    expect(result.model!.components).toHaveLength(3); // body + 2 sleeves
    expect(result.model!.components[0].type).toBe('body');
    expect(result.model!.components[1].type).toBe('sleeve');
    expect(result.model!.components[2].type).toBe('sleeve');
  });
}); 