'use client';

import React, { useState } from 'react';
import { usePattern } from '@/hooks/usePattern';

/**
 * Pattern Debugger Component
 * Provides debugging tools to inspect pattern state
 * Useful for validating acceptance criteria and development testing
 */
export const PatternDebugger: React.FC = () => {
  const { state, resetPattern, resetSection } = usePattern();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'state' | 'actions'>('state');

  /**
   * Format JSON with syntax highlighting (basic)
   */
  const formatJSON = (obj: any): string => {
    return JSON.stringify(obj, null, 2);
  };

  /**
   * Copy state to clipboard
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formatJSON(state));
      alert('Pattern state copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  /**
   * Log state to console
   */
  const logToConsole = () => {
    console.group('🧶 Pattern State Debug');
    console.log('Full State:', state);
    console.log('Metadata:', state.metadata);
    console.log('Garment Type:', state.garmentType);
    console.log('Current Section:', state.uiSettings.currentSection);
    console.log('Gauge Data:', state.gauge);
    console.log('Measurements Data:', state.measurements);
    console.groupEnd();
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          title="Open Pattern Debugger"
        >
          🔍 Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50 overflow-hidden">
      
      {/* Header */}
      <div className="bg-purple-600 text-white px-4 py-2 flex items-center justify-between">
        <h3 className="font-medium">Pattern State Debugger</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-purple-200 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('state')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'state'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          State
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'actions'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Actions
        </button>
      </div>

      <div className="h-80 overflow-auto">
        {activeTab === 'state' ? (
          <div className="p-4">
            
            {/* Quick Stats */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Quick Stats</h4>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-600">Version:</span> {state.version}
                </div>
                <div>
                  <span className="text-gray-600">Garment:</span> {state.garmentType || 'None'}
                </div>
                <div>
                  <span className="text-gray-600">Current Section:</span> {state.uiSettings.currentSection}
                </div>
                <div>
                  <span className="text-gray-600">Pattern Name:</span> {state.metadata.designName}
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>{' '}
                  {state.metadata.updatedAt ? new Date(state.metadata.updatedAt).toLocaleTimeString() : 'Never'}
                </div>
              </div>
            </div>

            {/* Section Status */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Section Status</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(state).map(([key, value]) => {
                  if (typeof value === 'object' && value !== null && 'isSet' in value) {
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="capitalize">{key}:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          value.isSet ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {value.isSet ? 'Set' : 'Empty'}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* JSON State */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Raw JSON State</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32 text-gray-800">
                {formatJSON(state)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            
            {/* State Actions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">State Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={copyToClipboard}
                  className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                >
                  📋 Copy State to Clipboard
                </button>
                <button
                  onClick={logToConsole}
                  className="w-full px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                >
                  🖥️ Log to Console
                </button>
              </div>
            </div>

            {/* Reset Actions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Reset Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => resetSection('gauge')}
                  className="w-full px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
                >
                  🧧 Reset Gauge Section
                </button>
                <button
                  onClick={() => resetSection('measurements')}
                  className="w-full px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
                >
                  📏 Reset Measurements Section
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset the entire pattern? This cannot be undone.')) {
                      resetPattern();
                    }
                  }}
                  className="w-full px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                >
                  🗑️ Reset Entire Pattern
                </button>
              </div>
            </div>

            {/* Test Scenarios */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Test Scenarios</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Fill gauge data, navigate to measurements, then back to gauge</p>
                <p>• Change garment type and verify measurement fields update</p>
                <p>• Check console logs for state changes</p>
                <p>• Verify data persistence across navigation</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 