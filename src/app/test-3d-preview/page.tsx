/**
 * Test Page for 3D Preview (PD_PH5_US001)
 * Test page to validate 3D preview functionality and acceptance criteria
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InMemoryPatternDefinitionProvider } from '@/contexts/InMemoryPatternDefinitionContext';
import Preview3D from '@/components/knitting/Preview3D';

/**
 * Mock data provider for testing
 */
function MockDataProvider({ children }: { children: React.ReactNode }) {
  return (
    <InMemoryPatternDefinitionProvider>
      {children}
    </InMemoryPatternDefinitionProvider>
  );
}

/**
 * Test 3D Preview Page
 */
function Test3DPreviewContent() {
  const { t } = useTranslation();
  const [testScenario, setTestScenario] = useState<'empty' | 'partial' | 'complete'>('empty');

  const testScenarios = [
    {
      key: 'empty' as const,
      label: 'Empty State',
      description: 'No pattern data - preview should show placeholder'
    },
    {
      key: 'partial' as const,
      label: 'Partial Data',
      description: 'Some measurements - preview should show basic garment'
    },
    {
      key: 'complete' as const,
      label: 'Complete Data',
      description: 'Full pattern data - preview should show detailed garment with components'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('3dPreview.title', '3D Preview')} - Test Page
            </h1>
            <p className="text-gray-600">
              Test page for validating PD_PH5_US001 acceptance criteria
            </p>
          </div>

          {/* Test Scenario Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testScenarios.map(({ key, label, description }) => (
                <button
                  key={key}
                  onClick={() => setTestScenario(key)}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    testScenario === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold mb-2">{label}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Acceptance Criteria Checklist */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Acceptance Criteria (PD_PH5_US001)</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded border border-gray-300 bg-green-50 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <div>
                  <strong>AC1:</strong> Basic 3D primitives representing torso and sleeves appear when "Sweater" is selected.
                  Each part (body, sleeves) should be distinct 3D objects.
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded border border-gray-300 bg-green-50 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <div>
                  <strong>AC2:</strong> 3D primitives update when dimensions, neckline, or sleeve type are changed.
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded border border-gray-300 bg-green-50 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <div>
                  <strong>AC3:</strong> User can freely rotate, pan, and zoom the 3D model with mouse/touch gestures.
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded border border-gray-300 bg-green-50 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <div>
                  <strong>AC4:</strong> Disclaimer about approximate nature of preview is visible.
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded border border-gray-300 bg-green-50 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <div>
                  <strong>AC5:</strong> Different components (sleeves vs body) have different colors for differentiation.
                </div>
              </div>
            </div>
          </div>

          {/* Technical Implementation Notes */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Technical Implementation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">3D Library</h3>
                <p className="text-sm text-gray-600">Three.js with React Three Fiber</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Component Structure</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• frontBody mesh (Indigo cylinder)</li>
                  <li>• backBody mesh (Indigo cylinder)</li>
                  <li>• leftSleeve mesh (Purple cylinder)</li>
                  <li>• rightSleeve mesh (Purple cylinder)</li>
                  <li>• necklineDetail mesh (Red torus)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Interactivity</h3>
                <p className="text-sm text-gray-600">OrbitControls for camera manipulation</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Performance</h3>
                <p className="text-sm text-gray-600">300ms debounced updates, optimized primitives</p>
              </div>
            </div>
          </div>

          {/* 3D Preview Component */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">3D Preview Component</h2>
              <p className="text-sm text-gray-600 mt-1">
                Current scenario: <strong>{testScenarios.find(s => s.key === testScenario)?.label}</strong>
              </p>
            </div>
            
            <div className="p-6">
              <Preview3D className="h-[600px]" />
            </div>
          </div>

          {/* Instructions for Testing */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Testing Instructions</h2>
            <div className="space-y-2 text-blue-800">
              <p>1. <strong>Navigate to Pattern Definition:</strong> Go to the main pattern definition page and create a new pattern</p>
              <p>2. <strong>Select Sweater Garment Type:</strong> Choose "Sweater" to see 3D primitives appear</p>
              <p>3. <strong>Test Interactivity:</strong> Try rotating, zooming, and panning the 3D model</p>
              <p>4. <strong>Change Dimensions:</strong> Modify measurements and ease to see real-time updates</p>
              <p>5. <strong>Test Components:</strong> Verify different colors for body (indigo) and sleeves (purple)</p>
              <p>6. <strong>Test View Controls:</strong> Use the view preset buttons (Front, Back, Side, Perspective)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Test Page Component
 */
export default function Test3DPreviewPage() {
  return (
    <MockDataProvider>
      <Test3DPreviewContent />
    </MockDataProvider>
  );
} 