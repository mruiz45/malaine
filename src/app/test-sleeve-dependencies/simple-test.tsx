'use client';

import React, { useState } from 'react';
import { PatternProvider, usePattern } from '@/contexts/PatternContext';
import { SleevesData } from '@/types/pattern';

/**
 * Simple Test Component to validate PD_PH4_US003 implementation
 */
function SleeveTestComponent() {
  const { state, updateSleeves } = usePattern();
  const [testLog, setTestLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setTestLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSleeveChange = (newType: SleevesData['sleeveType']) => {
    const oldType = state.sleeves.sleeveType;
    addLog(`Changing sleeve type from ${oldType || 'null'} to ${newType || 'null'}`);
    
    updateSleeves({ sleeveType: newType });
    
    // Check if flag was set after state update
    setTimeout(() => {
      if (state.bodyStructure.armholeRequiresRecalculation) {
        addLog('✅ SUCCESS: armholeRequiresRecalculation flag is set');
      } else {
        addLog('❌ FAIL: armholeRequiresRecalculation flag is NOT set');
      }
    }, 100);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">PD_PH4_US003 Simple Test</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Current State</h2>
        <p><strong>Sleeve Type:</strong> {state.sleeves.sleeveType || 'null'}</p>
        <p><strong>Armhole Recalc Flag:</strong> {state.bodyStructure.armholeRequiresRecalculation ? 'TRUE' : 'FALSE'}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => testSleeveChange('setIn')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Set: Set-in
        </button>
        <button
          onClick={() => testSleeveChange('raglan')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Set: Raglan
        </button>
        <button
          onClick={() => testSleeveChange('dropShoulder')}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Set: Drop Shoulder
        </button>
        <button
          onClick={() => testSleeveChange('dolman')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Set: Dolman
        </button>
      </div>
      
      <div className="bg-white border rounded p-4">
        <h3 className="font-semibold mb-2">Test Log</h3>
        <div className="max-h-40 overflow-y-auto">
          {testLog.length === 0 ? (
            <p className="text-gray-500">No tests run yet...</p>
          ) : (
            testLog.map((log, index) => (
              <div key={index} className="text-sm mb-1">
                {log}
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => setTestLog([])}
          className="mt-2 px-2 py-1 bg-gray-400 text-white rounded text-sm"
        >
          Clear Log
        </button>
      </div>
    </div>
  );
}

export default function SimpleTestPage() {
  return (
    <PatternProvider>
      <SleeveTestComponent />
    </PatternProvider>
  );
} 