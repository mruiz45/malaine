'use client';

import React, { useState } from 'react';
import { PatternProvider } from '@/contexts/PatternContext';
import { SchematicPreview2D } from '@/components/pattern/SchematicPreview2D';
import { GarmentType, MeasurementsData, NecklineData } from '@/types/pattern';

/**
 * Page de test pour PD_PH2_US003: Neckline Type Selection
 * Validation des critères d'acceptation
 */
export default function TestNecklinePage() {
  // State for test garment and measurements
  const [garmentType, setGarmentType] = useState<GarmentType>('sweater');
  const [measurements, setMeasurements] = useState<MeasurementsData>({
    isSet: true,
    chestCircumference: 96,
    bodyLength: 60,
    shoulderWidth: 42,
    sleeveLength: 58,
    length: null,
    width: null,
    armholeDepth: null,
    headCircumference: null,
    hatHeight: null,
    scarfLength: null,
    scarfWidth: null
  });

  // State for neckline testing
  const [neckline, setNeckline] = useState<NecklineData>({
    isSet: false,
    necklineType: null,
    necklineDepth: null,
    necklineWidth: null
  });

  // Test scenarios for validation
  const testScenarios = [
    {
      name: 'Round Neck Test',
      necklineType: 'round' as const,
      necklineDepth: 8,
      necklineWidth: 20
    },
    {
      name: 'V-Neck Test',
      necklineType: 'v_neck' as const,
      necklineDepth: 12,
      necklineWidth: 18
    },
    {
      name: 'Boat Neck Test',
      necklineType: 'boat_neck' as const,
      necklineDepth: 6,
      necklineWidth: 25
    },
    {
      name: 'Square Neck Test',
      necklineType: 'square_neck' as const,
      necklineDepth: 10,
      necklineWidth: 18
    },
    {
      name: 'Scoop Neck Test',
      necklineType: 'scoop' as const,
      necklineDepth: 12,
      necklineWidth: 22
    },
    {
      name: 'Turtleneck Test',
      necklineType: 'turtleneck' as const,
      necklineDepth: 15,
      necklineWidth: 20
    },
    {
      name: 'Cowl Neck Test',
      necklineType: 'cowl' as const,
      necklineDepth: 18,
      necklineWidth: 28
    }
  ];

  const applyTestScenario = (scenario: typeof testScenarios[0]) => {
    setNeckline({
      isSet: true,
      necklineType: scenario.necklineType,
      necklineDepth: scenario.necklineDepth,
      necklineWidth: scenario.necklineWidth
    });
  };

  const clearNeckline = () => {
    setNeckline({
      isSet: false,
      necklineType: null,
      necklineDepth: null,
      necklineWidth: null
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test PD_PH2_US003: Neckline Type Selection
          </h1>
          <p className="text-gray-600">
            Validation de la prévisualisation 2D avec sélection du type d'encolure
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Controls */}
          <div className="space-y-6">
            {/* Garment Type Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Type de Vêtement</h2>
              <select
                value={garmentType || ''}
                onChange={(e) => setGarmentType(e.target.value as GarmentType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sweater">Sweater</option>
                <option value="cardigan">Cardigan</option>
                <option value="vest">Vest</option>
                <option value="scarf">Scarf (Test: No Neckline)</option>
                <option value="hat">Hat (Test: No Neckline)</option>
              </select>
            </div>

            {/* Neckline Test Scenarios */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Test d'Encolures</h2>
              <div className="space-y-3">
                <button
                  onClick={clearNeckline}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Clear Neckline (Test Default)
                </button>
                
                {testScenarios.map((scenario, index) => (
                  <button
                    key={index}
                    onClick={() => applyTestScenario(scenario)}
                    className={`w-full px-4 py-2 rounded-md transition-colors text-left ${
                      neckline.necklineType === scenario.necklineType
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                    }`}
                  >
                    {scenario.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Current State Display */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">État Actuel</h2>
              <div className="space-y-2 text-sm">
                <div><strong>Garment Type:</strong> {garmentType}</div>
                <div><strong>Neckline Type:</strong> {neckline.necklineType || 'None'}</div>
                <div><strong>Neckline Depth:</strong> {neckline.necklineDepth || 'Default'} cm</div>
                <div><strong>Neckline Width:</strong> {neckline.necklineWidth || 'Default'} cm</div>
              </div>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Prévisualisation 2D</h2>
            <div className="flex justify-center">
              <SchematicPreview2D
                garmentType={garmentType}
                measurements={measurements}
                neckline={neckline}
                width={400}
                height={500}
                className="border border-gray-200 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Acceptance Criteria Checklist */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Critères d'Acceptation - PD_PH2_US003</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3" />
                <label className="text-sm">
                  <strong>AC1:</strong> Sweater schématique affiché avec Round Neck → courbe
                </label>
              </div>
              <div className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3" />
                <label className="text-sm">
                  <strong>AC2:</strong> Changement vers V-Neck → forme en V
                </label>
              </div>
              <div className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3" />
                <label className="text-sm">
                  <strong>AC3:</strong> Mise à jour visuellement immédiate
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3" />
                <label className="text-sm">
                  <strong>AC4:</strong> Scarf → pas d'encolure dessinée
                </label>
              </div>
              <div className="flex items-start">
                <input type="checkbox" className="mt-1 mr-3" />
                <label className="text-sm">
                  <strong>AC5:</strong> Tous les types d'encolure visiblement différents
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 