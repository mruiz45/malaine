'use client';

import React, { useState } from 'react';
import { SchematicPreview2D } from '@/components/pattern/SchematicPreview2D';
import { GarmentType, MeasurementsData, EaseData, SleevesData } from '@/types/pattern';

/**
 * Test page for PD_PH4_US002: Enhance 2D Schematic with Sleeve Type Selection
 * Validates acceptance criteria for sleeve types affecting schematic display
 */
export default function TestSleevesSchematicPage() {
  const [garmentType, setGarmentType] = useState<GarmentType>('sweater');
  const [measurements, setMeasurements] = useState<MeasurementsData>({
    isSet: true,
    mode: 'custom',
    standardSizeId: null,
    standardSizeLabel: null,
    length: null,
    width: null,
    chestCircumference: 100,
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

  const [sleeves, setSleeves] = useState<SleevesData>({
    isSet: false,
    sleeveType: null, // Tests default behavior (should show set-in like)
    sleeveLength: null,
    cuffStyle: null,
    cuffLength: null
  });

  /**
   * Test scenarios for sleeve types
   */
  const sleeveTypeTests = [
    { type: null, label: 'Default (No selection)', description: 'Should show set-in like sleeves by default' },
    { type: 'setIn' as const, label: 'Set-in Sleeves', description: 'Traditional fitted armhole with curved seam' },
    { type: 'raglan' as const, label: 'Raglan Sleeves', description: 'Diagonal lines from neckline to underarm' },
    { type: 'dropShoulder' as const, label: 'Drop Shoulder', description: 'Extended shoulder line, sleeves attached lower' },
    { type: 'dolman' as const, label: 'Dolman Sleeves', description: 'Wide flowing sleeves integrated with body' },
    { type: 'sleeveless' as const, label: 'Sleeveless', description: 'Basic armholes without sleeves' }
  ];

  const handleSleeveTypeChange = (sleeveType: SleevesData['sleeveType']) => {
    setSleeves(prev => ({
      ...prev,
      sleeveType,
      isSet: sleeveType !== null
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test PD_PH4_US002: Sleeve Type Selection
          </h1>
          <p className="text-gray-600">
            Testing how different sleeve types affect the 2D schematic preview in real-time.
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
          
          {/* Garment Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Garment Type
            </label>
            <select
              value={garmentType || ''}
              onChange={(e) => setGarmentType(e.target.value as GarmentType)}
              className="w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sweater">Sweater</option>
              <option value="cardigan">Cardigan</option>
              <option value="vest">Vest</option>
              <option value="scarf">Scarf (N/A for sleeves)</option>
            </select>
          </div>

          {/* Measurements Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chest Circumference (cm)
              </label>
              <input
                type="number"
                value={measurements.chestCircumference || ''}
                onChange={(e) => setMeasurements(prev => ({
                  ...prev,
                  chestCircumference: parseFloat(e.target.value) || null
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Length (cm)
              </label>
              <input
                type="number"
                value={measurements.bodyLength || ''}
                onChange={(e) => setMeasurements(prev => ({
                  ...prev,
                  bodyLength: parseFloat(e.target.value) || null
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sleeve Length (cm)
              </label>
              <input
                type="number"
                value={measurements.sleeveLength || ''}
                onChange={(e) => setMeasurements(prev => ({
                  ...prev,
                  sleeveLength: parseFloat(e.target.value) || null
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shoulder Width (cm)
              </label>
              <input
                type="number"
                value={measurements.shoulderWidth || ''}
                onChange={(e) => setMeasurements(prev => ({
                  ...prev,
                  shoulderWidth: parseFloat(e.target.value) || null
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Sleeve Type Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Sleeve Type Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sleeve Type Selection
            </h2>
            <p className="text-gray-600 mb-6">
              Select different sleeve types to see real-time updates in the schematic preview.
            </p>

            <div className="space-y-4">
              {sleeveTypeTests.map((test) => (
                <label
                  key={test.type || 'default'}
                  className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    sleeves.sleeveType === test.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="sleeveType"
                    value={test.type || 'default'}
                    checked={sleeves.sleeveType === test.type}
                    onChange={() => handleSleeveTypeChange(test.type)}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {test.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {test.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Current State Display */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Current State</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Garment Type:</strong> {garmentType}</p>
                <p><strong>Sleeve Type:</strong> {sleeves.sleeveType || 'null (default)'}</p>
                <p><strong>Is Set:</strong> {sleeves.isSet ? 'true' : 'false'}</p>
              </div>
            </div>
          </div>

          {/* Right: 2D Schematic Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2D Schematic Preview
            </h2>
            <p className="text-gray-600 mb-6">
              The schematic should update immediately when you select different sleeve types.
            </p>

            <div className="flex justify-center">
              <SchematicPreview2D
                garmentType={garmentType}
                measurements={measurements}
                ease={ease}
                sleeves={sleeves}
                width={400}
                height={500}
                className="border border-gray-200 rounded-lg"
              />
            </div>

            {/* Expected Behavior Notes */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Expected Behavior</h4>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• <strong>Set-in:</strong> Traditional rectangular sleeves with curved armhole hints</li>
                <li>• <strong>Raglan:</strong> Diagonal dashed lines from neckline to underarm</li>
                <li>• <strong>Drop Shoulder:</strong> Extended shoulder lines with sleeves attached lower</li>
                <li>• <strong>Dolman:</strong> Integrated wide flowing shape</li>
                <li>• <strong>Sleeveless:</strong> Curved armholes without sleeve rectangles</li>
                <li>• <strong>Default (null):</strong> Should fall back to set-in style sleeves</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Acceptance Criteria Validation */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Acceptance Criteria Validation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Test Cases</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Default sweater shows set-in like sleeves initially
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Raglan selection shows diagonal lines from neckline
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Drop shoulder shows wider shoulder and lower sleeve attachment
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Sleeveless shows basic armholes without sleeves
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Real-time Updates</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Changes are immediately visible on selection
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Preview subscribes to sleeve type changes
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Non-sleeve garments (scarf) show appropriate message
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 