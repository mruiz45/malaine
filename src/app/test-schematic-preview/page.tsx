'use client';

import React, { useState } from 'react';
import { SchematicPreview2D } from '@/components/pattern/SchematicPreview2D';
import { GarmentType, MeasurementsData } from '@/types/pattern';

interface TestScenario {
  name: string;
  garmentType: GarmentType;
  measurements: Partial<MeasurementsData>;
}

/**
 * Page de test pour SchematicPreview2D
 * Valide les critères d'acceptation de PD_PH2_US002
 */
export default function TestSchematicPreviewPage() {
  const [garmentType, setGarmentType] = useState<GarmentType>('sweater');
  const [measurements, setMeasurements] = useState<MeasurementsData>({
    isSet: false,
    mode: 'custom',
    standardSizeId: null,
    standardSizeLabel: null,
    length: null,
    width: null,
    chestCircumference: 90,
    bodyLength: 60,
    sleeveLength: 60,
    shoulderWidth: 42,
    armholeDepth: 20,
    headCircumference: null,
    hatHeight: null,
    scarfLength: null,
    scarfWidth: null
  });

  const handleMeasurementChange = (field: keyof MeasurementsData, value: number | null) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value,
      isSet: true
    }));
  };

  const testScenarios: TestScenario[] = [
    {
      name: 'Acceptance Criteria 1 & 2: Scarf with dimensions',
      garmentType: 'scarf',
      measurements: {
        scarfLength: 150,
        scarfWidth: 20
      }
    },
    {
      name: 'Acceptance Criteria 3 & 4: Sweater with dimensions', 
      garmentType: 'sweater',
      measurements: {
        chestCircumference: 96,
        bodyLength: 60,
        sleeveLength: 58,
        shoulderWidth: 42
      }
    },
    {
      name: 'Test: Hat with dimensions',
      garmentType: 'hat',
      measurements: {
        headCircumference: 56,
        hatHeight: 20
      }
    },
    {
      name: 'Test: Cardigan with center opening',
      garmentType: 'cardigan',
      measurements: {
        chestCircumference: 100,
        bodyLength: 65,
        sleeveLength: 60,
        shoulderWidth: 44
      }
    }
  ];

  const applyTestScenario = (scenario: TestScenario) => {
    setGarmentType(scenario.garmentType);
    
    // Reset all measurements
    const newMeasurements: MeasurementsData = {
      isSet: true,
      mode: 'custom',
      standardSizeId: null,
      standardSizeLabel: null,
      length: null,
      width: null,
      chestCircumference: null,
      bodyLength: null,
      sleeveLength: null,
      shoulderWidth: null,
      armholeDepth: null,
      headCircumference: null,
      hatHeight: null,
      scarfLength: null,
      scarfWidth: null
    };

    // Apply scenario measurements
    Object.keys(scenario.measurements).forEach(key => {
      const typedKey = key as keyof MeasurementsData;
      const value = scenario.measurements[typedKey];
      if (value !== undefined) {
        (newMeasurements as any)[typedKey] = value;
      }
    });

    setMeasurements(newMeasurements);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test Schematic Preview 2D (PD_PH2_US002)
          </h1>
          <p className="text-gray-600">
            Test des critères d'acceptation pour la prévisualisation 2D en temps réel
          </p>
        </div>

        {/* Test Scenarios */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Scénarios de test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testScenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => applyTestScenario(scenario)}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
              >
                <h3 className="font-medium text-gray-900 mb-2">{scenario.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{scenario.garmentType}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {Object.entries(scenario.measurements).map(([key, value]) => (
                    <div key={key}>{key}: {value}</div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Contrôles</h2>
            
            {/* Garment Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de vêtement
              </label>
              <select
                value={garmentType || ''}
                onChange={(e) => setGarmentType(e.target.value as GarmentType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner...</option>
                <option value="sweater">Sweater</option>
                <option value="cardigan">Cardigan</option>
                <option value="vest">Vest</option>
                <option value="scarf">Scarf</option>
                <option value="hat">Hat</option>
              </select>
            </div>

            {/* Dynamic measurement inputs based on garment type */}
            {garmentType && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Mesures</h3>
                
                {(garmentType === 'sweater' || garmentType === 'cardigan' || garmentType === 'vest') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Circonférence poitrine (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={measurements.chestCircumference || ''}
                        onChange={(e) => handleMeasurementChange('chestCircumference', 
                          e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="96"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longueur corps (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={measurements.bodyLength || ''}
                        onChange={(e) => handleMeasurementChange('bodyLength', 
                          e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Largeur épaules (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={measurements.shoulderWidth || ''}
                        onChange={(e) => handleMeasurementChange('shoulderWidth', 
                          e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="42"
                      />
                    </div>
                    {garmentType !== 'vest' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longueur manches (cm)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={measurements.sleeveLength || ''}
                          onChange={(e) => handleMeasurementChange('sleeveLength', 
                            e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="58"
                        />
                      </div>
                    )}
                  </>
                )}

                {garmentType === 'scarf' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longueur écharpe (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={measurements.scarfLength || ''}
                        onChange={(e) => handleMeasurementChange('scarfLength', 
                          e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="150"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Largeur écharpe (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={measurements.scarfWidth || ''}
                        onChange={(e) => handleMeasurementChange('scarfWidth', 
                          e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="20"
                      />
                    </div>
                  </>
                )}

                {garmentType === 'hat' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Circonférence tête (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={measurements.headCircumference || ''}
                        onChange={(e) => handleMeasurementChange('headCircumference', 
                          e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="56"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hauteur chapeau (cm)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={measurements.hatHeight || ''}
                        onChange={(e) => handleMeasurementChange('hatHeight', 
                          e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="20"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Prévisualisation 2D</h2>
            <SchematicPreview2D
              garmentType={garmentType}
              measurements={measurements}
              neckline={undefined}
              width={400}
              height={500}
            />
          </div>
        </div>

        {/* Acceptance Criteria Checklist */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Critères d'acceptation</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <label className="text-sm">
                <strong>AC1:</strong> Quand l'utilisateur sélectionne "Scarf", un rectangle 2D est affiché dans la zone de prévisualisation
              </label>
            </div>
            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <label className="text-sm">
                <strong>AC2:</strong> Quand l'utilisateur entre 150cm de longueur et 20cm de largeur pour l'écharpe, le rectangle se met à jour pour refléter ces proportions
              </label>
            </div>
            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <label className="text-sm">
                <strong>AC3:</strong> Quand l'utilisateur sélectionne "Sweater", une forme en T ou similaire est affichée
              </label>
            </div>
            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <label className="text-sm">
                <strong>AC4:</strong> Quand l'utilisateur entre bodyLength et chestCircumference, le schéma du sweater se met à jour avec les proportions du corps principal
              </label>
            </div>
            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <label className="text-sm">
                <strong>AC5:</strong> La mise à jour est visuellement immédiate lors du changement des valeurs d'entrée
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 