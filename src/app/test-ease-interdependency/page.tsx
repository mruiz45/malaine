'use client';

import React, { useState } from 'react';
import { SchematicPreview2D } from '@/components/pattern/SchematicPreview2D';
import { GarmentType, MeasurementsData, EaseData } from '@/types/pattern';

/**
 * Test page for PD_PH4_US001: Basic Interdependency - Ease Affecting Finished Dimensions
 * Validates acceptance criteria for ease affecting schematic dimensions
 */
export default function TestEaseInterdependencyPage() {
  const [garmentType, setGarmentType] = useState<GarmentType>('sweater');
  const [measurements, setMeasurements] = useState<MeasurementsData>({
    isSet: true,
    mode: 'custom',
    standardSizeId: null,
    standardSizeLabel: null,
    length: null,
    width: null,
    chestCircumference: 90,
    bodyLength: 60,
    sleeveLength: 58,
    shoulderWidth: 42,
    armholeDepth: 20,
    headCircumference: 56,
    hatHeight: 20,
    scarfLength: 150,
    scarfWidth: 20
  });
  
  const [ease, setEase] = useState<EaseData>({
    isSet: false,
    chestEase: null,
    lengthEase: null,
    sleeveEase: null,
    easeType: null
  });

  // Test scenarios based on acceptance criteria
  const testScenarios = [
    {
      name: 'AC1: Sweater 90cm chest → shows original',
      garmentType: 'sweater' as GarmentType,
      measurements: { chestCircumference: 90, bodyLength: 60 },
      ease: { chestEase: null, lengthEase: null },
      expectedResult: 'Schematic reflects 90cm chest circumference'
    },
    {
      name: 'AC2: Add +5cm chest ease → shows 95cm',
      garmentType: 'sweater' as GarmentType,
      measurements: { chestCircumference: 90, bodyLength: 60 },
      ease: { chestEase: 5, lengthEase: null },
      expectedResult: 'Schematic width visibly increases for 95cm finished'
    },
    {
      name: 'AC3: Change to -2cm ease → shows 88cm',
      garmentType: 'sweater' as GarmentType,
      measurements: { chestCircumference: 90, bodyLength: 60 },
      ease: { chestEase: -2, lengthEase: null },
      expectedResult: 'Schematic width decreases for 88cm finished'
    },
    {
      name: 'AC4: Zero ease → uses raw measurements',
      garmentType: 'sweater' as GarmentType,
      measurements: { chestCircumference: 90, bodyLength: 60 },
      ease: { chestEase: 0, lengthEase: 0 },
      expectedResult: 'Schematic uses 90cm raw measurements'
    }
  ];

  const applyTestScenario = (scenario: typeof testScenarios[0]) => {
    setGarmentType(scenario.garmentType);
    
    // Update measurements
    setMeasurements(prev => ({
      ...prev,
      ...scenario.measurements
    }));
    
    // Update ease
    setEase(prev => ({
      ...prev,
      ...scenario.ease,
      isSet: true
    }));
  };

  const handleEaseChange = (field: keyof EaseData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setEase(prev => ({
      ...prev,
      [field]: numValue,
      isSet: true
    }));
  };

  const handleMeasurementChange = (field: keyof MeasurementsData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setMeasurements(prev => ({
      ...prev,
      [field]: numValue,
      isSet: true
    }));
  };

  // Calculate finished dimensions for display
  const getFinishedDimensions = () => {
    const results: Record<string, number | null> = {};
    
    if (garmentType === 'sweater' || garmentType === 'cardigan' || garmentType === 'vest') {
      results.finishedChest = measurements.chestCircumference && ease.chestEase !== null 
        ? measurements.chestCircumference + (ease.chestEase || 0)
        : measurements.chestCircumference;
        
      results.finishedLength = measurements.bodyLength && ease.lengthEase !== null
        ? measurements.bodyLength + (ease.lengthEase || 0)
        : measurements.bodyLength;
    }
    
    return results;
  };

  const finishedDims = getFinishedDimensions();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test PD_PH4_US001: Ease Affecting Finished Dimensions
          </h1>
          <p className="text-gray-600">
            Validation que l'aisance affecte les dimensions finies dans le schéma 2D
          </p>
        </div>

        {/* Test Scenarios */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Scénarios de Test - Critères d'Acceptation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testScenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => applyTestScenario(scenario)}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
              >
                <h3 className="font-medium text-gray-900 mb-2">{scenario.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{scenario.expectedResult}</p>
                <div className="text-xs text-gray-500">
                  <div>Chest: {scenario.measurements.chestCircumference || 'N/A'}cm</div>
                  <div>Ease: {scenario.ease.chestEase === null ? 'None' : `${scenario.ease.chestEase}cm`}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Controls */}
          <div className="space-y-6">
            {/* Garment Type */}
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
                <option value="scarf">Scarf</option>
                <option value="hat">Hat</option>
              </select>
            </div>

            {/* Measurements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Mesures Corporelles</h2>
              <div className="space-y-4">
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
                        onChange={(e) => handleMeasurementChange('chestCircumference', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="90"
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
                        onChange={(e) => handleMeasurementChange('bodyLength', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="60"
                      />
                    </div>
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
                        onChange={(e) => handleMeasurementChange('scarfLength', e.target.value)}
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
                        onChange={(e) => handleMeasurementChange('scarfWidth', e.target.value)}
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
                        onChange={(e) => handleMeasurementChange('headCircumference', e.target.value)}
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
                        onChange={(e) => handleMeasurementChange('hatHeight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="20"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Ease Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Aisance (PD_PH4_US001)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aisance poitrine (cm) - peut être négative
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={ease.chestEase === null ? '' : ease.chestEase}
                    onChange={(e) => handleEaseChange('chestEase', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5 (positif) ou -2 (négatif)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aisance longueur (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={ease.lengthEase === null ? '' : ease.lengthEase}
                    onChange={(e) => handleEaseChange('lengthEase', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Finished Dimensions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-900">Dimensions Finies Calculées</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Mesure brute poitrine:</span>
                  <span>{measurements.chestCircumference || 'N/A'} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Aisance poitrine:</span>
                  <span>{ease.chestEase === null ? 'Aucune' : `${ease.chestEase > 0 ? '+' : ''}${ease.chestEase} cm`}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-green-900">
                  <span>Dimension finie poitrine:</span>
                  <span>{finishedDims.finishedChest || 'N/A'} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Mesure brute longueur:</span>
                  <span>{measurements.bodyLength || 'N/A'} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Aisance longueur:</span>
                  <span>{ease.lengthEase === null ? 'Aucune' : `${ease.lengthEase > 0 ? '+' : ''}${ease.lengthEase} cm`}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-green-900">
                  <span>Dimension finie longueur:</span>
                  <span>{finishedDims.finishedLength || 'N/A'} cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Schematic Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Prévisualisation 2D avec Aisance</h2>
            <div className="flex justify-center">
              <SchematicPreview2D
                garmentType={garmentType}
                measurements={measurements}
                ease={ease}
                width={400}
                height={500}
                className="border border-gray-200 rounded-md"
              />
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              Le schéma utilise les dimensions finies (mesures + aisance)
            </div>
          </div>
        </div>

        {/* Acceptance Criteria Validation */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Validation des Critères d'Acceptation - PD_PH4_US001</h2>
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <input type="checkbox" className="mt-1 mr-3" />
              <div>
                <label className="text-sm font-medium">
                  <strong>AC1:</strong> Utilisateur entre 90cm de circonférence poitrine pour un sweater
                </label>
                <p className="text-xs text-gray-600 mt-1">Le schéma reflète cette mesure</p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <input type="checkbox" className="mt-1 mr-3" />
              <div>
                <label className="text-sm font-medium">
                  <strong>AC2:</strong> Ajouter 5cm d'aisance positive poitrine
                </label>
                <p className="text-xs text-gray-600 mt-1">La largeur du sweater augmente visiblement pour représenter 95cm fini</p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <input type="checkbox" className="mt-1 mr-3" />
              <div>
                <label className="text-sm font-medium">
                  <strong>AC3:</strong> Changer vers -2cm d'aisance
                </label>
                <p className="text-xs text-gray-600 mt-1">La largeur du schéma diminue pour représenter 88cm fini</p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <input type="checkbox" className="mt-1 mr-3" />
              <div>
                <label className="text-sm font-medium">
                  <strong>AC4:</strong> Aisance à 0 ou section Aisance non applicable
                </label>
                <p className="text-xs text-gray-600 mt-1">Le schéma utilise les mesures brutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 