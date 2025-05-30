/**
 * Test Schematics Page (US_9.3)
 * Test page for validating schematic generation functionality
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SchematicDisplay from '@/components/knitting/SchematicDisplay';
import { schematicGeneratorService } from '@/lib/services/SchematicGeneratorService';
import { SchematicGenerationConfig, SchematicDiagram } from '@/types/schematics';

export default function TestSchematicsPage() {
  const { t } = useTranslation();
  const [schematics, setSchematics] = useState<SchematicDiagram[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Generate test schematics based on US_9.3 acceptance criteria
   */
  const generateTestSchematics = () => {
    setIsGenerating(true);
    
    try {
      // AC1: Rectangular back panel (50cm wide, 60cm long)
      const backPanelConfig: SchematicGenerationConfig = {
        componentName: t('testSchematics.components.backPanel', 'Back Panel'),
        dimensions: {
          bottomWidth: 50,
          topWidth: 50,
          length: 60
        },
        shape: 'rectangle'
      };

      // AC2: Tapered sleeve (20cm cuff, 30cm upper arm, 45cm length)
      const sleeveConfig: SchematicGenerationConfig = {
        componentName: t('testSchematics.components.sleeve', 'Sleeve'),
        dimensions: {
          bottomWidth: 20,
          topWidth: 30,
          length: 45
        },
        shape: 'trapezoid'
      };

      // Additional test: Front panel
      const frontPanelConfig: SchematicGenerationConfig = {
        componentName: t('testSchematics.components.frontPanel', 'Front Panel'),
        dimensions: {
          bottomWidth: 50,
          topWidth: 50,
          length: 60
        },
        shape: 'rectangle'
      };

      const configs = [backPanelConfig, sleeveConfig, frontPanelConfig];
      const generatedSchematics = schematicGeneratorService.generateMultipleSchematics(configs);
      
      setSchematics(generatedSchematics);
    } catch (error) {
      console.error(t('testSchematics.errors.generating', 'Error generating test schematics:'), error);
      alert(t('testSchematics.errors.failed', 'Error generating schematics: ') + (error instanceof Error ? error.message : t('testSchematics.errors.unknown', 'Unknown error')));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t('testSchematics.title', 'Schematic Generation Test (US_9.3)')}
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('testSchematics.acceptanceCriteria.title', 'Acceptance Criteria Validation')}
          </h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">{t('testSchematics.testCases.title', 'Test Cases:')}</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('testSchematics.testCases.ac1', 'AC1: Rectangular back panel (50cm × 60cm) with labeled dimensions')}</li>
              <li>• {t('testSchematics.testCases.ac2', 'AC2: Tapered sleeve (20cm → 30cm width, 45cm length) as trapezoid')}</li>
              <li>• {t('testSchematics.testCases.ac3', 'AC3: Schematics are proportional to dimensions')}</li>
              <li>• {t('testSchematics.testCases.ac4', 'AC4: Labels are legible')}</li>
              <li>• {t('testSchematics.testCases.ac5', 'AC5: Schematics for all major garment pieces')}</li>
            </ul>
          </div>

          <button
            onClick={generateTestSchematics}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? t('testSchematics.generating', 'Generating...') : t('testSchematics.generateButton', 'Generate Test Schematics')}
          </button>
        </div>

        {/* Display Generated Schematics */}
        {schematics.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('testSchematics.results.title', 'Generated Schematics')}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {schematics.map((schematic, index) => (
                <div key={schematic.id} className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {schematic.componentName}
                  </h3>
                  
                  <SchematicDisplay
                    schematic={schematic}
                    compact={false}
                    showDownload={true}
                    showZoomControls={true}
                    printMode={false}
                    maxWidth="100%"
                  />
                  
                  {/* Validation Info */}
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                    <div><strong>{t('testSchematics.validation.shape', 'Shape')}:</strong> {schematic.shape}</div>
                    <div><strong>{t('testSchematics.validation.generated', 'Generated')}:</strong> {new Date(schematic.generatedAt).toLocaleString()}</div>
                    <div><strong>{t('testSchematics.validation.dimensions', 'Dimensions')}:</strong> 
                      {schematic.componentName === t('testSchematics.components.sleeve', 'Sleeve')
                        ? t('testSchematics.dimensions.sleeve', '20cm (cuff) → 30cm (upper arm), 45cm length')
                        : t('testSchematics.dimensions.panel', '50cm × 60cm')
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw SVG Preview */}
        {schematics.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('testSchematics.rawSvg.title', 'Raw SVG Output (for debugging)')}
            </h2>
            
            {schematics.map((schematic, index) => (
              <div key={`raw-${schematic.id}`} className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {t('testSchematics.rawSvg.componentSvg', '{{component}} SVG:', { component: schematic.componentName })}
                </h3>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                  {schematic.svgContent}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 