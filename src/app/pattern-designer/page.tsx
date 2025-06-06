import React from 'react';
import { PatternProvider } from '@/contexts/PatternContext';
import { PatternNavigation } from '@/components/pattern/PatternNavigation';
import { GaugeSection } from '@/components/pattern/GaugeSection';
import { MeasurementsSection } from '@/components/pattern/MeasurementsSection';
import { NecklineSection } from '@/components/pattern/NecklineSection';
import { PatternDebugger } from '@/components/pattern/PatternDebugger';
import { usePattern } from '@/hooks/usePattern';

// Force dynamic rendering for this page since it uses React Context
export const dynamic = 'force-dynamic';

/**
 * Pattern Content Component
 * Renders the appropriate section based on current navigation
 */
const PatternContent: React.FC = () => {
  const { state } = usePattern();
  const { uiSettings } = state;

  const renderCurrentSection = () => {
    switch (uiSettings.currentSection) {
      case 'gauge':
        return <GaugeSection />;
      case 'measurements':
        return <MeasurementsSection />;
      case 'neckline':
        return <NecklineSection />;
      case 'ease':
      case 'bodyStructure':
      case 'sleeves':
      case 'finishing':
        return (
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
                {uiSettings.currentSection} Section
              </h2>
              <p className="text-gray-600">
                This section is not yet implemented. It&apos;s part of future user stories.
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  For testing purposes, this demonstrates navigation between sections
                  while maintaining state in the Gauge and Measurements sections.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unknown Section</h2>
              <p className="text-gray-600">
                The selected section is not recognized.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PatternNavigation />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderCurrentSection()}
      </main>

      <PatternDebugger />
    </div>
  );
};

/**
 * Pattern Designer Page
 * Main page for pattern design functionality
 * Demonstrates PD_PH1_US002 implementation
 */
export default function PatternDesignerPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pattern Designer</h1>
              <p className="mt-2 text-gray-600">
                Create and design your knitting or crochet patterns with guided assistance.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="font-medium text-blue-900 mb-1">PD_PH1_US002 Demo</h3>
                <p className="text-blue-800">Basic In-Memory Pattern State Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Designer Content */}
      <PatternProvider>
        <PatternContent />
      </PatternProvider>

      {/* Testing Instructions */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-900 mb-3">
              🧪 Testing Instructions for PD_PH1_US002
            </h3>
            <div className="space-y-3 text-sm text-yellow-800">
              <div>
                <strong>Acceptance Criteria 1-3:</strong>
                <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                  <li>Select a garment type (e.g., &quot;Sweater&quot;)</li>
                  <li>Navigate to &quot;Gauge&quot; section and input some data (stitches, rows, etc.)</li>
                  <li>Navigate to &quot;Measurements&quot; section (data should reset for the new section)</li>
                  <li>Navigate back to &quot;Gauge&quot; section</li>
                  <li>✅ Verify that your previously entered gauge data is still present</li>
                </ol>
              </div>
              <div>
                <strong>Acceptance Criteria 4:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Click the &quot;🔍 Debug&quot; button (bottom right)</li>
                  <li>Click &quot;🖥️ Log to Console&quot; to view state in browser dev tools</li>
                  <li>✅ Verify the `patternState` object reflects all entered data</li>
                </ul>
              </div>
              <div>
                <strong>Acceptance Criteria 5:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Change the garment type from &quot;Sweater&quot; to &quot;Hat&quot;</li>
                  <li>✅ Verify that measurement fields change appropriately</li>
                  <li>✅ Verify that sweater-specific measurements are reset</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 