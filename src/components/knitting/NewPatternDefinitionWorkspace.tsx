/**
 * New Pattern Definition Workspace (PD_PH1_US001)
 * Complete rewrite with garment-centric approach and dynamic section loading
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInMemoryPatternDefinition } from '@/contexts/InMemoryPatternDefinitionContext';
import { PatternDefinitionSection } from '@/types/garmentTypeConfig';
import { SECTION_METADATA } from '@/utils/garmentTypeConfig';
import PatternDefinitionNavigation from './PatternDefinitionNavigation';
import GarmentTypeSelector from './GarmentTypeSelector';
import { GarmentType } from '@/types/garment';

/**
 * Section Header Component
 */
interface SectionHeaderProps {
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
}

function SectionHeader({ title, description, isRequired, isCompleted }: SectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
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
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

/**
 * Section Content Component
 * Renders the appropriate content based on the current section
 */
interface SectionContentProps {
  section: PatternDefinitionSection;
  garmentTypeKey: string;
}

function SectionContent({ section, garmentTypeKey }: SectionContentProps) {
  const { t } = useTranslation();
  const { state, updateSectionData, markSectionCompleted } = useInMemoryPatternDefinition();
  const { currentPattern, navigation } = state;

  // Get section metadata for display
  const isRequired = navigation.requiredSections.includes(section);
  const isCompleted = navigation.completedSections.includes(section);
  const metadata = SECTION_METADATA[section];

  // Handler to update section data and mark as completed
  const handleSectionUpdate = (data: any, completed: boolean = false) => {
    updateSectionData(section, { ...data, isCompleted: completed });
    if (completed) {
      markSectionCompleted(section);
    }
  };

  // Mock complete button for demonstration
  const handleMarkCompleted = () => {
    handleSectionUpdate({}, true);
  };

  return (
    <div>
      <SectionHeader
        title={metadata.displayName}
        description={metadata.description}
        isRequired={isRequired}
        isCompleted={isCompleted}
      />
      
      {/* Placeholder content for each section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t(`sections.${section}.placeholder.title`, `${metadata.displayName} Configuration`)}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {t(`sections.${section}.placeholder.description`, 
              `This is where you would configure the ${metadata.displayName.toLowerCase()} for your ${garmentTypeKey} pattern.`
            )}
          </p>
          
          {/* Show current data if any */}
          {currentPattern && currentPattern[section as keyof typeof currentPattern] && (
            <div className="bg-white rounded p-4 mb-4">
              <h4 className="font-medium mb-2">{t('common.currentData', 'Current Data')}:</h4>
              <pre className="text-xs text-gray-600 text-left overflow-auto">
                {JSON.stringify(currentPattern[section as keyof typeof currentPattern], null, 2)}
              </pre>
            </div>
          )}
          
          {/* Mock interaction */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded p-4">
              <p className="text-sm text-gray-500 mb-3">
                {t('common.placeholderInfo', 'This is a placeholder. The actual component would be integrated here.')}
              </p>
              
              {!isCompleted && (
                <button
                  onClick={handleMarkCompleted}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {t('common.markCompleted', 'Mark as Completed')}
                </button>
              )}
              
              {isCompleted && (
                <div className="flex items-center justify-center text-green-600">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('common.completed', 'Completed')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Special handling for summary section */}
      {section === 'summary' && (
        <div className="mt-8 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('summary.patternOverview', 'Pattern Overview')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <span className="font-medium">{t('summary.garmentType', 'Garment Type')}: </span>
              <span className="capitalize">{garmentTypeKey}</span>
            </div>
            
            <div>
              <span className="font-medium">{t('summary.sessionName', 'Session Name')}: </span>
              <span>{currentPattern?.sessionName}</span>
            </div>
            
            <div>
              <span className="font-medium">{t('summary.created', 'Created')}: </span>
              <span>{currentPattern?.createdAt.toLocaleString()}</span>
            </div>
            
            <div>
              <span className="font-medium">{t('summary.lastUpdated', 'Last Updated')}: </span>
              <span>{currentPattern?.updatedAt.toLocaleString()}</span>
            </div>
            
            {/* Progress Status */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">{t('summary.progress', 'Progress')}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <span>{t('summary.completedSections', 'Completed sections')}: </span>
                  <span className="font-medium">{navigation.completedSections.length} / {navigation.availableSections.length}</span>
                </div>
                <div>
                  <span>{t('summary.requiredSections', 'Required sections')}: </span>
                  <span className="font-medium">
                    {navigation.requiredSections.filter(s => navigation.completedSections.includes(s)).length} / {navigation.requiredSections.length}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Available sections */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">{t('summary.availableSections', 'Available Sections')}</h4>
              <div className="flex flex-wrap gap-2">
                {navigation.availableSections.map((sectionKey) => {
                  const sectionMeta = SECTION_METADATA[sectionKey];
                  const completed = navigation.completedSections.includes(sectionKey);
                  const required = navigation.requiredSections.includes(sectionKey);
                  
                  return (
                    <span
                      key={sectionKey}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        completed 
                          ? 'bg-green-100 text-green-800' 
                          : required 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {sectionMeta.displayName}
                      {required && ' *'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main New Pattern Definition Workspace Component
 */
export default function NewPatternDefinitionWorkspace() {
  const { t } = useTranslation();
  const { state, selectGarmentType } = useInMemoryPatternDefinition();
  
  const { currentPattern, navigation, isLoading, error } = state;
  const { currentSection } = navigation;

  /**
   * Handle garment type selection
   */
  const handleGarmentTypeSelect = (garmentType: GarmentType) => {
    selectGarmentType(garmentType.type_key);
  };

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-red-800 mb-4">
                {t('common.error', 'Error')}
              </h2>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render garment type selection if no pattern or no garment type selected
   */
  if (!currentPattern || !currentPattern.garmentType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {t('patternDefinition.newWorkspace.title', 'Pattern Definition')}
              </h1>
              <p className="text-gray-600">
                {t('patternDefinition.newWorkspace.subtitle', 'Create your knitting pattern step by step')}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <GarmentTypeSelector
                selectedGarmentTypeId={undefined}
                onGarmentTypeSelect={handleGarmentTypeSelect}
                disabled={false}
                isLoading={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render main workspace with navigation and section content
   */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentPattern.sessionName}
                </h1>
                <p className="text-gray-600 capitalize">
                  {currentPattern.garmentType?.replace('_', ' ')}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {t('common.lastUpdated', 'Last updated')}: {currentPattern.updatedAt.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-8">
                <PatternDefinitionNavigation variant="sidebar" />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-white rounded-lg shadow-md p-8">
                {currentSection ? (
                  <SectionContent 
                    section={currentSection} 
                    garmentTypeKey={currentPattern.garmentType} 
                  />
                ) : (
                  <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {t('patternDefinition.noSectionSelected', 'No Section Selected')}
                    </h2>
                    <p className="text-gray-600">
                      {t('patternDefinition.selectSectionFromNavigation', 'Please select a section from the navigation panel to begin.')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 