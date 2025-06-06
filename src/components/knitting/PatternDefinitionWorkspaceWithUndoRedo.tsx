/**
 * Pattern Definition Workspace with Undo/Redo (PD_PH3_US001)
 * Enhanced workspace that demonstrates undo/redo functionality
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInMemoryPatternDefinitionWithUndoRedo } from '@/contexts/InMemoryPatternDefinitionWithUndoRedoContext';
import { PatternDefinitionSection } from '@/types/garmentTypeConfig';
import { SECTION_METADATA } from '@/utils/garmentTypeConfig';
import UndoRedoControls, { UndoRedoStatusBadge } from './UndoRedoControls';
import { RestorePointManager } from './RestorePointManager';
import GarmentTypeSelector from './GarmentTypeSelector';
import { GarmentType } from '@/types/garment';

/**
 * Enhanced Section Content with Undo/Redo Demo
 */
interface DemoSectionContentProps {
  section: PatternDefinitionSection;
  garmentTypeKey: string;
}

function DemoSectionContent({ section, garmentTypeKey }: DemoSectionContentProps) {
  const { t } = useTranslation();
  const { currentPattern, navigation, updateSectionData, markSectionCompleted } = useInMemoryPatternDefinitionWithUndoRedo();
  const [demoValue, setDemoValue] = useState('');

  // Get section metadata
  const isRequired = navigation.requiredSections.includes(section);
  const isCompleted = navigation.completedSections.includes(section);
  const metadata = SECTION_METADATA[section];

  // Handle demo field changes (creates snapshots on every change)
  const handleDemoFieldChange = (value: string) => {
    setDemoValue(value);
    updateSectionData(section, { 
      demoField: value,
      lastModified: new Date().toISOString() 
    });
  };

  // Handle marking section as completed
  const handleMarkCompleted = () => {
    markSectionCompleted(section);
  };

  // Get current section data
  const currentSectionData = currentPattern?.[section as keyof typeof currentPattern];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{metadata.displayName}</h2>
          <div className="flex items-center space-x-2">
            {isRequired && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {t('common.required', 'Required')}
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {t('common.completed', 'Completed')}
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-600 mt-2">{metadata.description}</p>
      </div>

      {/* Demo Form Fields */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('demo.undoRedoTesting', 'Undo/Redo Testing')}
        </h3>
        
        <div className="space-y-4">
          {/* Demo Text Field */}
          <div>
            <label htmlFor="demo-field" className="block text-sm font-medium text-gray-700 mb-2">
              {t('demo.testField', 'Test Field (changes create snapshots)')}
            </label>
            <input
              id="demo-field"
              type="text"
              value={demoValue}
              onChange={(e) => handleDemoFieldChange(e.target.value)}
              placeholder={t('demo.typeHere', 'Type here to test undo/redo...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('demo.fieldInstruction', 'Each keystroke creates an undo point')}
            </p>
          </div>

          {/* Demo Number Field */}
          <div>
            <label htmlFor="demo-number" className="block text-sm font-medium text-gray-700 mb-2">
              {t('demo.numberField', 'Number Field')}
            </label>
            <input
              id="demo-number"
              type="number"
              onChange={(e) => updateSectionData(section, { demoNumber: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Demo Select Field */}
          <div>
            <label htmlFor="demo-select" className="block text-sm font-medium text-gray-700 mb-2">
              {t('demo.selectField', 'Select Field')}
            </label>
            <select
              id="demo-select"
              onChange={(e) => updateSectionData(section, { demoSelect: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('demo.selectOption', 'Select an option...')}</option>
              <option value="option1">{t('demo.option1', 'Option 1')}</option>
              <option value="option2">{t('demo.option2', 'Option 2')}</option>
              <option value="option3">{t('demo.option3', 'Option 3')}</option>
            </select>
          </div>

          {/* Demo Checkbox */}
          <div className="flex items-center">
            <input
              id="demo-checkbox"
              type="checkbox"
              onChange={(e) => updateSectionData(section, { demoCheckbox: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="demo-checkbox" className="ml-2 block text-sm text-gray-900">
              {t('demo.checkboxLabel', 'Demo checkbox option')}
            </label>
          </div>
        </div>

        {/* Section Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {t('demo.currentData', 'Current section data')}: {JSON.stringify(currentSectionData || {})}
            </div>
            
            {!isCompleted && (
              <button
                onClick={handleMarkCompleted}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                {t('demo.markCompleted', 'Mark Section Completed')}
              </button>
            )}
            
            {isCompleted && (
              <div className="text-sm text-green-600 font-medium">
                {t('demo.alreadyCompleted', 'Section already completed')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Workspace Component
 */
export default function PatternDefinitionWorkspaceWithUndoRedo() {
  const { t } = useTranslation();
  const {
    currentPattern,
    navigation,
    error,
    undoRedoState,
    createPattern,
    selectGarmentType,
    navigateToSection,
    undo,
    redo,
    clearHistory,
    createSnapshot,
    updateUndoRedoConfig,
  } = useInMemoryPatternDefinitionWithUndoRedo();

  const [currentSection, setCurrentSection] = useState<PatternDefinitionSection | null>(null);
  const [showUndoRedoConfig, setShowUndoRedoConfig] = useState(false);

  // Handle creating new pattern
  const handleCreatePattern = () => {
    const sessionName = `Pattern ${new Date().toLocaleDateString()}`;
    createPattern(sessionName, 'knitting');
  };

  // Handle garment type selection
  const handleGarmentTypeSelect = (garmentType: GarmentType) => {
    selectGarmentType(garmentType.type_key);
    // Navigate to first available section
    if (navigation.availableSections.length > 0) {
      setCurrentSection(navigation.availableSections[0]);
    }
  };

  // Handle section navigation
  const handleSectionClick = (section: PatternDefinitionSection) => {
    setCurrentSection(section);
    navigateToSection(section);
  };

  // Handle undo/redo configuration
  const handleConfigureUndoRedo = () => {
    setShowUndoRedoConfig(!showUndoRedoConfig);
  };

  // Handle configuration updates
  const handleUpdateConfig = (maxHistory: number, enabled: boolean) => {
    updateUndoRedoConfig({ maxHistorySize: maxHistory, enabled });
  };

  // If no pattern exists, show pattern creation
  if (!currentPattern) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">
              {t('undoRedoDemo.title', 'Pattern Definition with Undo/Redo')}
            </h1>
            
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {t('undoRedoDemo.getStarted', 'Get Started with Undo/Redo Demo')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('undoRedoDemo.description', 'This demo showcases the undo/redo functionality for pattern definition changes. Every field modification creates an undo point.')}
              </p>
              
              <button
                onClick={handleCreatePattern}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                {t('undoRedoDemo.createPattern', 'Create Demo Pattern')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no garment type selected, show garment type selector
  if (!currentPattern.garmentType) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header with Undo/Redo Controls */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">
              {t('undoRedoDemo.selectGarment', 'Select Garment Type')}
            </h1>
            <div className="flex items-center space-x-4">
              <UndoRedoStatusBadge undoRedoState={undoRedoState} />
              <UndoRedoControls
                undoRedoState={undoRedoState}
                onUndo={undo}
                onRedo={redo}
                onConfigure={handleConfigureUndoRedo}
                showConfiguration={true}
              />
            </div>
          </div>

          <GarmentTypeSelector
            onGarmentTypeSelect={handleGarmentTypeSelect}
          />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main workspace view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentPattern.sessionName}
            </h1>
            <p className="text-gray-600 capitalize">
              {currentPattern.craftType} • {currentPattern.garmentType}
            </p>
          </div>
          
          {/* Undo/Redo Controls */}
          <div className="flex items-center space-x-4">
            <UndoRedoStatusBadge undoRedoState={undoRedoState} showDetails={true} />
            <UndoRedoControls
              undoRedoState={undoRedoState}
              onUndo={undo}
              onRedo={redo}
              onConfigure={handleConfigureUndoRedo}
              showConfiguration={true}
              size="lg"
            />
          </div>
        </div>

        {/* Undo/Redo Configuration Panel */}
        {showUndoRedoConfig && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">{t('undoRedoDemo.configuration', 'Undo/Redo Configuration')}</h3>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <span className="text-sm mr-2">{t('undoRedoDemo.historySize', 'History Size')}:</span>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={undoRedoState.config.maxHistorySize}
                  onChange={(e) => handleUpdateConfig(parseInt(e.target.value), undoRedoState.config.enabled)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={undoRedoState.config.enabled}
                  onChange={(e) => handleUpdateConfig(undoRedoState.config.maxHistorySize, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">{t('undoRedoDemo.enabled', 'Enabled')}</span>
              </label>
              <button
                onClick={clearHistory}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                {t('undoRedoDemo.clearHistory', 'Clear History')}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="col-span-3 space-y-6">
            {/* Section Navigation */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold mb-4">{t('navigation.sections', 'Sections')}</h3>
              <nav className="space-y-2">
                {navigation.availableSections.map((section) => {
                  const metadata = SECTION_METADATA[section];
                  const isCompleted = navigation.completedSections.includes(section);
                  const isRequired = navigation.requiredSections.includes(section);
                  const isActive = currentSection === section;

                  return (
                    <button
                      key={section}
                      onClick={() => handleSectionClick(section)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{metadata.displayName}</span>
                        <div className="flex items-center space-x-1">
                          {isRequired && <span className="text-red-500 text-xs">*</span>}
                          {isCompleted && <span className="text-green-500 text-xs">✓</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Restore Point Manager (PD_PH3_US002) */}
            <RestorePointManager />
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {currentSection ? (
              <DemoSectionContent
                section={currentSection}
                garmentTypeKey={currentPattern.garmentType}
              />
            ) : (
              <div className="bg-white rounded-lg border p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">
                  {t('navigation.selectSection', 'Select a Section')}
                </h2>
                <p className="text-gray-600">
                  {t('navigation.selectSectionDescription', 'Choose a section from the navigation to start configuring your pattern.')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 