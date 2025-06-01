/**
 * Pattern Viewer Component (US_9.1 + US_11.7)
 * Main component for displaying assembled pattern documents with progress tracking
 */

'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PrinterIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ListBulletIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { AssembledPattern } from '@/types/assembled-pattern';
import PatternHeader from './PatternHeader';
import MaterialsSection from './MaterialsSection';
import AbbreviationsSection from './AbbreviationsSection';
import MeasurementsSection from './MeasurementsSection';
import ComponentInstructionsSection from './ComponentInstructionsSection';
import AssemblySection from './AssemblySection';
import PatternWarnings from './PatternWarnings';
import PatternProgressControls from './PatternProgressControls';
import GarmentAssemblyViewer from './GarmentAssemblyViewer';
import Basic3DPreview from './Basic3DPreview';
import { usePatternProgressContext } from '@/contexts/PatternProgressContext';

interface PatternViewerProps {
  /** The assembled pattern to display */
  pattern: AssembledPattern;
  /** Whether to show in print mode */
  printMode?: boolean;
  /** Callback when print mode changes */
  onPrintModeChange?: (printMode: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Table of contents section data
 */
interface TableOfContentsSection {
  id: string;
  title: string;
  subsections?: { id: string; title: string; }[];
}

/**
 * Main Pattern Viewer component
 */
export default function PatternViewer({
  pattern,
  printMode = false,
  onPrintModeChange,
  className = ''
}: PatternViewerProps) {
  const { t } = useTranslation();
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Get pattern progress context (will be null if not wrapped in provider)
  const progressContext = usePatternProgressContext();

  // Generate table of contents
  const tableOfContents: TableOfContentsSection[] = [
    { id: 'materials', title: t('patternViewer.sections.materials', 'Materials & Tools') },
    { id: 'abbreviations', title: t('patternViewer.sections.abbreviations', 'Abbreviations') },
    { id: 'measurements', title: t('patternViewer.sections.measurements', 'Finished Measurements') },
    {
      id: 'components',
      title: t('patternViewer.sections.components', 'Instructions'),
      subsections: pattern.components.map(component => ({
        id: `component-${component.componentName.toLowerCase().replace(/\s+/g, '-')}`,
        title: component.componentName
      }))
    },
    { id: 'assembly', title: t('patternViewer.sections.assembly', 'Assembly & Finishing') },
    { id: 'assembly-visualization', title: t('patternViewer.sections.assemblyVisualization', '2D Assembly View') },
    { id: '3d-preview', title: t('patternViewer.sections.3dPreview', '3D Wireframe Preview') }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleTogglePrintMode = () => {
    const newPrintMode = !printMode;
    onPrintModeChange?.(newPrintMode);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowTableOfContents(false);
    }
  };

  const baseClasses = `max-w-none mx-auto bg-white ${printMode ? 'print:max-w-none print:mx-0' : ''} ${className}`;

  return (
    <div className={baseClasses}>
      {/* Action Bar - Hidden in print mode */}
      {!printMode && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 print:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {pattern.patternTitle}
            </h1>
            
            <div className="flex items-center space-x-3">
              {/* Table of Contents Toggle */}
              <button
                onClick={() => setShowTableOfContents(!showTableOfContents)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ListBulletIcon className="h-4 w-4 mr-2" />
                {t('patternViewer.tableOfContents', 'Contents')}
              </button>

              {/* Print Preview Toggle */}
              <button
                onClick={handleTogglePrintMode}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                {t('patternViewer.printPreview', 'Print Preview')}
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                {t('patternViewer.print', 'Print')}
              </button>
            </div>
          </div>

          {/* Table of Contents Dropdown */}
          {showTableOfContents && (
            <div className="absolute right-6 top-full mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1">
                <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">
                  {t('patternViewer.tableOfContents', 'Table of Contents')}
                </div>
                {tableOfContents.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {section.title}
                    </button>
                    {section.subsections?.map((subsection) => (
                      <button
                        key={subsection.id}
                        onClick={() => scrollToSection(subsection.id)}
                        className="block w-full text-left px-8 py-1 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        {subsection.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Controls - Only show if progress context is available and not in print mode */}
      {progressContext && !printMode && (
        <div className="sticky top-[73px] z-10 bg-gray-50 border-b border-gray-200 px-6 py-3 print:hidden">
          <PatternProgressControls
            navigation={progressContext.navigation}
            isEnabled={true}
            onPreviousStep={progressContext.goToPreviousStep}
            onNextStep={progressContext.goToNextStep}
            onResetProgress={progressContext.clearProgress}
            compact={true}
          />
        </div>
      )}

      {/* Main Content */}
      <div
        ref={contentRef}
        className={`space-y-8 ${printMode ? 'p-8 print:p-0' : 'p-6'}`}
      >
        {/* Pattern Header */}
        <PatternHeader 
          pattern={pattern}
          printMode={printMode}
        />

        {/* Pattern Warnings */}
        {pattern.pattern_notes.length > 0 && (
          <PatternWarnings 
            notes={pattern.pattern_notes}
            printMode={printMode}
          />
        )}

        {/* Materials & Tools */}
        <MaterialsSection 
          id="materials"
          pattern={pattern}
          printMode={printMode}
        />

        {/* Abbreviations */}
        {pattern.abbreviations.length > 0 && (
          <AbbreviationsSection 
            id="abbreviations"
            abbreviations={pattern.abbreviations}
            specialStitches={pattern.special_stitches}
            printMode={printMode}
          />
        )}

        {/* Finished Measurements */}
        <MeasurementsSection 
          id="measurements"
          measurements={pattern.finished_measurements}
          printMode={printMode}
        />

        {/* Component Instructions */}
        <ComponentInstructionsSection 
          id="components"
          components={pattern.components}
          printMode={printMode}
          sessionId={pattern.session_id}
          progressContext={progressContext}
        />

        {/* Assembly & Finishing */}
        {pattern.assembly_instructions.length > 0 && (
          <AssemblySection 
            id="assembly"
            instructions={pattern.assembly_instructions}
            printMode={printMode}
          />
        )}

        {/* 2D Assembly Visualization (US_12.9) */}
        {pattern.assembly_2d && (
          <section id="assembly-visualization" className="section">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('patternViewer.sections.assemblyVisualization', '2D Assembly View')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('patternViewer.assemblyVisualizationDescription', 
                  'Interactive 2D layout showing how pattern components fit together. Click on pieces to select them and hover over connection lines for assembly instructions.')}
              </p>
            </div>
            
            <GarmentAssemblyViewer
              session_id={pattern.session_id}
              print_mode={printMode}
              className="mb-6"
              on_component_select={(componentKey) => {
                console.log('Component selected:', componentKey);
                // Optional: Could scroll to that component's instructions
              }}
              on_connection_click={(connectionId) => {
                console.log('Connection clicked:', connectionId);
                // Optional: Could show more detailed assembly instructions
              }}
            />
          </section>
        )}

        {/* Alternative: Show assembly visualization even if not pre-generated */}
        {!pattern.assembly_2d && !printMode && (
          <section id="assembly-visualization" className="section">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('patternViewer.sections.assemblyVisualization', '2D Assembly View')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('patternViewer.assemblyVisualizationDescription', 
                  'Interactive 2D layout showing how pattern components fit together.')}
              </p>
            </div>
            
            <GarmentAssemblyViewer
              session_id={pattern.session_id}
              print_mode={printMode}
              className="mb-6"
              on_component_select={(componentKey) => {
                console.log('Component selected:', componentKey);
              }}
              on_connection_click={(connectionId) => {
                console.log('Connection clicked:', connectionId);
              }}
            />
          </section>
        )}

        {/* 3D Wireframe Preview (US_12.10) */}
        <section id="3d-preview" className="section">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('patternViewer.sections.3dPreview', '3D Wireframe Preview')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('patternViewer.3dPreviewDescription', 
                'Basic 3D wireframe visualization showing the approximate shape and proportions of the finished garment. This is a simplified representation for reference only.')}
            </p>
          </div>
          
          <Basic3DPreview
            measurements={pattern.finished_measurements}
            garmentType={pattern.craftType === 'knitting' ? 'sweater' : 'pullover'}
            printMode={printMode}
            className="mb-6"
            onModelLoad={(model) => {
              console.log('3D model loaded:', model);
            }}
            onError={(error) => {
              console.error('3D preview error:', error);
            }}
          />
        </section>

        {/* Pattern Footer - Only in print mode */}
        {printMode && (
          <div className="border-t border-gray-200 pt-6 mt-12 text-sm text-gray-600 print:block hidden">
            <div className="flex justify-between">
              <div>
                <p>{t('patternViewer.generatedOn', 'Generated on')}: {new Date(pattern.generated_at).toLocaleDateString()}</p>
                <p>{t('patternViewer.sessionId', 'Session')}: {pattern.session_id}</p>
              </div>
              <div className="text-right">
                <p>{t('patternViewer.craftType', 'Craft')}: {pattern.craftType}</p>
                <p>{t('patternViewer.size', 'Size')}: {pattern.targetSizeLabel}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close table of contents */}
      {showTableOfContents && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowTableOfContents(false)}
        />
      )}
    </div>
  );
} 