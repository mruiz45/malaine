'use client';

import React, { useState, useEffect } from 'react';
import { PatternProvider } from '@/contexts/PatternContext';
import { usePatternLogger } from '@/hooks/usePatternLogger';
import { getPatternDependencyService } from '@/services/PatternDependencyService';
import { getLoggingService } from '@/services/LoggingService';
import { 
  PatternState, 
  SleevesData, 
  BodyStructureData, 
  GarmentType 
} from '@/types/pattern';

/**
 * Test Component for Pattern Dependencies (PD_PH4_US003)
 * Tests interdependency between sleeve type and body structure (armhole calculations)
 */
function SleeveDependencyTestComponent() {
  const logger = usePatternLogger({ componentName: 'SleeveDependencyTest' });
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentSleeveType, setCurrentSleeveType] = useState<SleevesData['sleeveType']>('setIn');
  const [bodyStructureFlags, setBodyStructureFlags] = useState<BodyStructureData>({
    isSet: false,
    construction: null,
    shaping: null,
    frontStyle: null,
    armholeRequiresRecalculation: false
  });

  // Test pattern state
  const [testState, setTestState] = useState<PatternState>({
    version: '1.0.0',
    metadata: {
      patternId: null,
      createdAt: null,
      updatedAt: null,
      designName: 'Test Pattern - Sleeve Dependencies',
      description: 'Testing PD_PH4_US003 acceptance criteria',
      tags: ['test', 'dependencies']
    },
    garmentType: 'sweater' as GarmentType,
    uiSettings: {
      currentSection: 'sleeves',
      completedSections: [],
      sidebarCollapsed: false
    },
    gauge: { isSet: false, stitchesPer10cm: null, rowsPer10cm: null, yarnUsed: null, needleSize: null, tensionNotes: null },
    measurements: { isSet: false, mode: 'custom', standardSizeId: null, standardSizeLabel: null, length: null, width: null, chestCircumference: null, bodyLength: null, sleeveLength: null, shoulderWidth: null, armholeDepth: null, headCircumference: null, hatHeight: null, scarfLength: null, scarfWidth: null },
    ease: { isSet: false, chestEase: null, lengthEase: null, sleeveEase: null, easeType: null },
    bodyStructure: bodyStructureFlags,
    neckline: { isSet: false, necklineType: null, necklineDepth: null, necklineWidth: null },
    sleeves: {
      isSet: true,
      sleeveType: currentSleeveType,
      sleeveLength: null,
      cuffStyle: null,
      cuffLength: null
    },
    finishing: { isSet: false, edgeTreatment: null, buttonhole: false, buttonholeCount: null, closureType: null }
  });

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  /**
   * Test Case 1: Change sleeve type from "Set-in" to "Raglan"
   * Expected: Event fired and flag set for armhole recalculation
   */
  const testSleeveTypeChange = async () => {
    addTestResult('🧪 Starting Test Case 1: Set-in → Raglan');
    
    const loggingService = getLoggingService();
    const dependencyService = getPatternDependencyService(loggingService);
    
    // Set initial state
    const oldSleeves: SleevesData = {
      isSet: true,
      sleeveType: 'setIn',
      sleeveLength: null,
      cuffStyle: null,
      cuffLength: null
    };
    
    const newSleeves: SleevesData = {
      isSet: true,
      sleeveType: 'raglan',
      sleeveLength: null,
      cuffStyle: null,
      cuffLength: null
    };

    // Test the dependency service
    const updatedState = dependencyService.handleSleevesUpdate(oldSleeves, newSleeves, testState);

    // Verify results
    if (updatedState.bodyStructure.armholeRequiresRecalculation) {
      addTestResult('✅ PASS: armholeRequiresRecalculation flag set to true');
      logger.logSleeveTypeDependencyDetected('setIn', 'raglan', ['bodyStructure']);
    } else {
      addTestResult('❌ FAIL: armholeRequiresRecalculation flag not set');
    }

    // Update local state
    setCurrentSleeveType('raglan');
    setBodyStructureFlags(updatedState.bodyStructure);
    setTestState(updatedState);
  };

  /**
   * Test Case 2: Change sleeve type from "Raglan" to "Drop Shoulder"
   * Expected: Event fired and flag remains set for armhole recalculation
   */
  const testAnotherSleeveTypeChange = async () => {
    addTestResult('🧪 Starting Test Case 2: Raglan → Drop Shoulder');
    
    const loggingService = getLoggingService();
    const dependencyService = getPatternDependencyService(loggingService);
    
    const oldSleeves: SleevesData = {
      isSet: true,
      sleeveType: 'raglan',
      sleeveLength: null,
      cuffStyle: null,
      cuffLength: null
    };
    
    const newSleeves: SleevesData = {
      isSet: true,
      sleeveType: 'dropShoulder',
      sleeveLength: null,
      cuffStyle: null,
      cuffLength: null
    };

    const updatedState = dependencyService.handleSleevesUpdate(oldSleeves, newSleeves, testState);

    if (updatedState.bodyStructure.armholeRequiresRecalculation) {
      addTestResult('✅ PASS: armholeRequiresRecalculation flag remains/set to true');
      logger.logSleeveTypeDependencyDetected('raglan', 'dropShoulder', ['bodyStructure']);
    } else {
      addTestResult('❌ FAIL: armholeRequiresRecalculation flag not set');
    }

    setCurrentSleeveType('dropShoulder');
    setBodyStructureFlags(updatedState.bodyStructure);
    setTestState(updatedState);
  };

  /**
   * Test Case 3: Check pending recalculations summary
   */
  const testPendingRecalculations = () => {
    addTestResult('🧪 Starting Test Case 3: Check Pending Recalculations');
    
    const loggingService = getLoggingService();
    const dependencyService = getPatternDependencyService(loggingService);
    
    const pending = dependencyService.getPendingRecalculationSummary(testState);
    
    if (pending.includes('bodyStructure.armhole')) {
      addTestResult('✅ PASS: bodyStructure.armhole found in pending recalculations');
    } else {
      addTestResult(`❌ FAIL: bodyStructure.armhole not found. Pending: ${pending.join(', ')}`);
    }
  };

  /**
   * Test Case 4: Clear recalculation flags
   */
  const testClearFlags = () => {
    addTestResult('🧪 Starting Test Case 4: Clear Recalculation Flags');
    
    const loggingService = getLoggingService();
    const dependencyService = getPatternDependencyService(loggingService);
    
    const clearedState = dependencyService.clearRecalculationFlags(testState, 'bodyStructure');
    
    if (!clearedState.bodyStructure.armholeRequiresRecalculation) {
      addTestResult('✅ PASS: armholeRequiresRecalculation flag cleared');
    } else {
      addTestResult('❌ FAIL: armholeRequiresRecalculation flag not cleared');
    }

    setBodyStructureFlags(clearedState.bodyStructure);
    setTestState(clearedState);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          PD_PH4_US003: Sleeve Type Dependencies Test
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Test Objective</h2>
          <p className="text-sm text-gray-700">
            Validate that changing sleeve type triggers dependency detection and sets 
            appropriate flags for armhole recalculation in body structure.
          </p>
        </div>

        {/* Current State Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Current Sleeve State</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {currentSleeveType || 'null'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Set:</span>
                <span className={`px-2 py-1 rounded text-sm ${testState.sleeves.isSet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {testState.sleeves.isSet ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Body Structure Flags</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Armhole Recalc:</span>
                <span className={`px-2 py-1 rounded text-sm ${bodyStructureFlags.armholeRequiresRecalculation ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                  {bodyStructureFlags.armholeRequiresRecalculation ? 'Required' : 'Not Required'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Test Controls</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={testSleeveTypeChange}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Test: Set-in → Raglan
            </button>
            <button
              onClick={testAnotherSleeveTypeChange}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Test: Raglan → Drop
            </button>
            <button
              onClick={testPendingRecalculations}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              Check Pending
            </button>
            <button
              onClick={testClearFlags}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Clear Flags
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <div className="max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 italic">No tests run yet. Click the test buttons above.</p>
            ) : (
              <ul className="space-y-2">
                {testResults.map((result, index) => (
                  <li
                    key={index}
                    className={`p-2 rounded text-sm ${
                      result.includes('✅ PASS') 
                        ? 'bg-green-50 text-green-800' 
                        : result.includes('❌ FAIL')
                        ? 'bg-red-50 text-red-800'
                        : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {result}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {testResults.length > 0 && (
            <button
              onClick={() => setTestResults([])}
              className="mt-4 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Clear Results
            </button>
          )}
        </div>

        {/* Acceptance Criteria */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Acceptance Criteria (PD_PH4_US003)</h3>
          <ol className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
              <span>Given a user changes the sleeve type from "Set-in" to "Raglan"</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
              <span>Verify through logging or internal state inspection that an event is fired or a flag is set indicating that body/armhole calculations are potentially affected</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
              <span>(Optional) If a user notification is implemented, verify it appears</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
              <span>The final pattern generation logic would eventually consume this information to adjust armhole shaping</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

/**
 * Test Page for PD_PH4_US003
 * Wraps the test component in the necessary providers
 */
export default function TestSleeveDependenciesPage() {
  return (
    <PatternProvider>
      <SleeveDependencyTestComponent />
    </PatternProvider>
  );
} 