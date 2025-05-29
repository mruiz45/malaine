/**
 * Stitch Pattern Integration Demo Page (US_8.3)
 * Demonstrates the integration of complex stitch patterns in pattern calculation
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PatternCalculationRequest,
  PatternCalculationInput,
  ComponentStitchPatternIntegrationData
} from '@/types/pattern-calculation';

export default function StitchPatternDemoPage() {
  const router = useRouter();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sample calculation request with stitch pattern integration
   */
  const createSampleRequest = (): PatternCalculationRequest => {
    // Sample stitch pattern integration data (would come from US_8.2 in practice)
    const sampleIntegration: ComponentStitchPatternIntegrationData = {
      stitchPatternId: 'e19b956e-7617-411a-a17d-ff14751c4ef0', // UUID from database
      appliedStitchPatternName: 'Cable and Ribbing',
      adjustedComponentStitchCount: 96, // Adjusted to accommodate pattern repeat
      edgeStitchesEachSide: 4,
      centeringOffsetStitches: 0,
      integrationType: 'center_with_stockinette',
      stockinetteStitchesEachSide: 8,
      fullRepeatsCount: 4 // 4 repeats of the pattern across the width
    };

    const input: PatternCalculationInput = {
      version: '1.0',
      sessionId: 'demo-session-' + Date.now(),
      units: {
        dimensionUnit: 'cm',
        gaugeUnit: 'cm'
      },
      gauge: {
        stitchesPer10cm: 20,
        rowsPer10cm: 28,
        unit: 'cm',
        profileName: 'Worsted Weight Gauge'
      },
      yarn: {
        name: 'Sample Worsted Yarn',
        weightCategory: 'Worsted',
        fiber: 'Wool',
        metadata: {}
      },
      stitchPattern: {
        name: 'Cable and Ribbing Pattern',
        horizontalRepeat: 16,
        verticalRepeat: 8,
        patternType: 'cable',
        stitchPatternId: 'e19b956e-7617-411a-a17d-ff14751c4ef0'
      },
      garment: {
        typeKey: 'rectangular_scarf',
        displayName: 'Cabled Scarf',
        constructionMethod: 'flat',
        bodyShape: 'rectangular',
        measurements: {
          finishedChestCircumference: 0,
          finishedLength: 160, // 160cm long scarf
        },
        components: [
          {
            componentKey: 'main_panel',
            displayName: 'Main Scarf Panel',
            targetWidth: 20, // 20cm wide
            targetLength: 160, // 160cm long
            stitchPatternIntegration: sampleIntegration, // US_8.3 integration data
            attributes: {
              isMainComponent: true
            }
          }
        ],
        attributes: {}
      },
      requestedAt: new Date().toISOString()
    };

    return { input };
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      const request = createSampleRequest();
      
      const response = await fetch('/api/pattern-calculator/calculate-pattern', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Calculation failed');
      }
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const renderStitchPatternResult = (component: any) => {
    if (!component.detailedInstructions) {
      return <p className="text-gray-500">No detailed pattern instructions generated.</p>;
    }

    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-lg">Pattern Instructions (US_8.3)</h4>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 max-h-96 overflow-y-auto">
          {component.detailedInstructions.map((instruction: any, index: number) => (
            <div key={index} className="border-b pb-2 last:border-b-0">
              <div className="flex justify-between items-start">
                <span className="font-medium">Step {instruction.step}:</span>
                {instruction.stitchPatternRowIndex !== undefined && (
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Pattern Row {instruction.stitchPatternRowIndex + 1}
                  </span>
                )}
              </div>
              <p className="text-sm mt-1">{instruction.text}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                {instruction.rowNumber && <span>Row {instruction.rowNumber}</span>}
                {instruction.stitchCount && <span>{instruction.stitchCount} sts</span>}
                {instruction.isShapingRow && <span className="text-orange-600">Shaping Row</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Stitch Pattern Integration Demo
            </h1>
            <p className="text-gray-600">
              Demonstration of US_8.3: Complex stitch pattern integration in pattern calculation.
              This demo shows how the system generates detailed row-by-row instructions with integrated 
              cable and ribbing patterns, including edge stitches and pattern tracking.
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Demo Configuration:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Component:</strong> 20cm × 160cm cabled scarf</li>
              <li>• <strong>Pattern:</strong> Cable and Ribbing (16 st × 8 row repeat)</li>
              <li>• <strong>Integration:</strong> 4 full pattern repeats with 4 edge stitches each side</li>
              <li>• <strong>Gauge:</strong> 20 sts × 28 rows per 10cm</li>
              <li>• <strong>Total Stitches:</strong> 96 (adjusted for pattern compatibility)</li>
            </ul>
          </div>

          <div className="mb-6">
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {isCalculating ? 'Calculating...' : 'Run Stitch Pattern Demo'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Calculation Successful!</h3>
                <p className="text-green-700">
                  Pattern calculated with stitch pattern integration. Details below.
                </p>
              </div>

              {result.components && result.components.map((component: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">{component.displayName}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold mb-2">Basic Calculations</h4>
                      <ul className="text-sm space-y-1">
                        <li><strong>Stitch Count:</strong> {component.stitchCount}</li>
                        <li><strong>Row Count:</strong> {component.rowCount}</li>
                        <li><strong>Pattern Integration:</strong> {component.metadata?.hasStitchPatternIntegration ? 'Yes' : 'No'}</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Shaping Information</h4>
                      <ul className="text-sm space-y-1">
                        <li><strong>Has Shaping:</strong> {component.metadata?.hasShaping ? 'Yes' : 'No'}</li>
                        <li><strong>Calculation Type:</strong> {component.metadata?.calculationType}</li>
                      </ul>
                    </div>
                  </div>

                  {renderStitchPatternResult(component)}

                  {component.warnings && component.warnings.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <h4 className="font-semibold text-yellow-800 mb-2">Warnings:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {component.warnings.map((warning: string, idx: number) => (
                          <li key={idx}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {component.errors && component.errors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {component.errors.map((error: string, idx: number) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              ← Back to previous page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 