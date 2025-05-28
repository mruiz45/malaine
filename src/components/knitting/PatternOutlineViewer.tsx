'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PatternOutline } from '@/types/patternDefinition';
import PatternOutlineSection from './PatternOutlineSection';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Pattern Outline Viewer Component (US_5.3)
 * Displays a structured overview of the pattern definition
 */
interface PatternOutlineViewerProps {
  /** The pattern outline data */
  outline: PatternOutline;
  /** Whether the viewer is open */
  isOpen: boolean;
  /** Callback to close the viewer */
  onClose: () => void;
}

export default function PatternOutlineViewer({ outline, isOpen, onClose }: PatternOutlineViewerProps) {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  /**
   * Handle print functionality
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const generatedDate = formatDate(outline.generated_at);
  const lastUpdatedDate = formatDate(outline.session_info.last_updated);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-50 border-b border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-blue-900">
                  {t('patternDefinition.outline.title', 'Pattern Outline')}
                </h2>
                <p className="text-blue-700">
                  {t('patternDefinition.outline.subtitle', 'Structured overview of your pattern definition')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>{t('patternDefinition.outline.printButton', 'Print Outline')}</span>
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>{t('patternDefinition.outline.closeButton', 'Close Outline')}</span>
              </button>
            </div>
          </div>

          {/* Session Info */}
          <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">
                  {t('patternDefinition.outline.sessionInfo.name', 'Session Name')}:
                </span>
                <span className="ml-2 text-gray-900">
                  {outline.session_info.name || t('patternDefinition.untitledSession', 'Untitled Session')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  {t('patternDefinition.outline.sessionInfo.status', 'Status')}:
                </span>
                <span className="ml-2 text-gray-900">
                  {t(`patternDefinition.status.${outline.session_info.status}`, outline.session_info.status)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  {t('patternDefinition.outline.sessionInfo.lastUpdated', 'Last Updated')}:
                </span>
                <span className="ml-2 text-gray-900">
                  {lastUpdatedDate.date} {lastUpdatedDate.time}
                </span>
              </div>
            </div>
          </div>

          {/* Completion Status */}
          <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {outline.completion_status.completed_sections === outline.completion_status.total_sections ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-medium text-gray-700">
                  {t('patternDefinition.outline.completion.status', 'Completion Status')}:
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {outline.completion_status.completed_sections === outline.completion_status.total_sections ? (
                    t('patternDefinition.outline.completion.allComplete', 'All sections completed!')
                  ) : (
                    t('patternDefinition.outline.completion.sectionsCompleted', 
                      '{{completed}} of {{total}} sections completed', {
                        completed: outline.completion_status.completed_sections,
                        total: outline.completion_status.total_sections
                      })
                  )}
                </div>
                {outline.completion_status.missing_sections.length > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    {t('patternDefinition.outline.completion.missingSections', 
                      'Missing sections: {{sections}}', {
                        sections: outline.completion_status.missing_sections.join(', ')
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-300px)] p-6">
          <div className="space-y-6">
            {/* Pattern Foundations */}
            <PatternOutlineSection
              title={t('patternDefinition.outline.sections.foundations', 'Pattern Foundations')}
              icon={<DocumentTextIcon className="h-5 w-5" />}
            >
              <FoundationsSection foundations={outline.foundations} />
            </PatternOutlineSection>

            {/* Garment Overview */}
            <PatternOutlineSection
              title={t('patternDefinition.outline.sections.garmentOverview', 'Garment Overview')}
              icon={<DocumentTextIcon className="h-5 w-5" />}
            >
              <GarmentOverviewSection garmentOverview={outline.garment_overview} />
            </PatternOutlineSection>

            {/* Component Breakdown */}
            <PatternOutlineSection
              title={t('patternDefinition.outline.sections.components', 'Component Breakdown')}
              icon={<DocumentTextIcon className="h-5 w-5" />}
            >
              <ComponentsSection components={outline.components} />
            </PatternOutlineSection>

            {/* Color Scheme (Optional) */}
            {outline.color_scheme && (
              <PatternOutlineSection
                title={t('patternDefinition.outline.sections.colorScheme', 'Color Scheme')}
                icon={<DocumentTextIcon className="h-5 w-5" />}
              >
                <ColorSchemeSection colorScheme={outline.color_scheme} />
              </PatternOutlineSection>
            )}

            {/* Morphology Notes (Optional) */}
            {outline.morphology_notes && (
              <PatternOutlineSection
                title={t('patternDefinition.outline.sections.morphologyNotes', 'Morphology Notes')}
                icon={<DocumentTextIcon className="h-5 w-5" />}
              >
                <MorphologyNotesSection morphologyNotes={outline.morphology_notes} />
              </PatternOutlineSection>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="text-center text-sm text-gray-600">
            {t('patternDefinition.outline.generatedAt', 
              'Generated on {{date}} at {{time}}', {
                date: generatedDate.date,
                time: generatedDate.time
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Foundations Section Component
 */
function FoundationsSection({ foundations }: { foundations: any }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {foundations.gauge && (
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.foundations.gauge', 'Gauge')}:
          </span>
          <span className="text-gray-900">
            {t('patternDefinition.outline.foundations.gaugeDetails', 
              '{{stitches}} sts, {{rows}} rows per {{unit}}', {
                stitches: foundations.gauge.stitch_count,
                rows: foundations.gauge.row_count,
                unit: foundations.gauge.unit
              })}
            {foundations.gauge.profile_name && ` (${foundations.gauge.profile_name})`}
          </span>
        </div>
      )}

      {foundations.measurements && (
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.foundations.measurements', 'Measurements')}:
          </span>
          <span className="text-gray-900">
            {foundations.measurements.set_name ? 
              t('patternDefinition.outline.foundations.measurementSet', 
                'Measurement set: {{name}}', { name: foundations.measurements.set_name }) :
              t('patternDefinition.outline.notDefined', 'Not yet defined')
            }
          </span>
        </div>
      )}

      {foundations.ease && (
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.foundations.ease', 'Ease Preferences')}:
          </span>
          <span className="text-gray-900">
            {t('patternDefinition.outline.foundations.easeDetails', 
              '{{type}} ({{value}}{{unit}})', {
                type: foundations.ease.type,
                value: foundations.ease.value_bust || 0,
                unit: foundations.ease.unit || ''
              })}
          </span>
        </div>
      )}

      {foundations.yarn && (
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.foundations.yarn', 'Yarn')}:
          </span>
          <span className="text-gray-900">
            {foundations.yarn.name ? 
              t('patternDefinition.outline.foundations.yarnDetails', 
                '{{name}} - {{weight}} weight, {{fiber}}', {
                  name: foundations.yarn.name,
                  weight: foundations.yarn.weight || 'Unknown',
                  fiber: foundations.yarn.fiber || 'Unknown'
                }) :
              t('patternDefinition.outline.notDefined', 'Not yet defined')
            }
          </span>
        </div>
      )}

      {foundations.stitch_pattern && (
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.foundations.stitchPattern', 'Stitch Pattern')}:
          </span>
          <span className="text-gray-900">
            {foundations.stitch_pattern.name || t('patternDefinition.outline.notDefined', 'Not yet defined')}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Garment Overview Section Component
 */
function GarmentOverviewSection({ garmentOverview }: { garmentOverview: any }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {garmentOverview.type && (
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.garmentOverview.type', 'Garment Type')}:
          </span>
          <span className="text-gray-900">{garmentOverview.type.name}</span>
        </div>
      )}

      {garmentOverview.construction_method && (
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.garmentOverview.construction', 'Construction Method')}:
          </span>
          <span className="text-gray-900">
            {garmentOverview.construction_method.replace('_', ' ')}
          </span>
        </div>
      )}

      {garmentOverview.type?.difficulty && (
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.garmentOverview.difficulty', 'Difficulty Level')}:
          </span>
          <span className="text-gray-900">
            {String(t(`garmentType.difficulty.${garmentOverview.type.difficulty}`, garmentOverview.type.difficulty))}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Components Section Component
 */
function ComponentsSection({ components }: { components: any[] }) {
  const { t } = useTranslation();

  if (components.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        {t('patternDefinition.outline.components.noComponents', 'No components defined yet')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {components.map((component, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-700">
                  {t('patternDefinition.outline.components.component', 'Component')}:
                </span>
                <span className="text-gray-900">{component.label}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-700">
                  {t('patternDefinition.outline.components.type', 'Type')}:
                </span>
                <span className="text-gray-900">{component.type}</span>
              </div>
              {component.style && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    {t('patternDefinition.outline.components.style', 'Style')}:
                  </span>
                  <span className="text-gray-900">{component.style.replace('_', ' ')}</span>
                </div>
              )}
            </div>
            <div>
              {component.parameters && Object.keys(component.parameters).length > 0 && (
                <div className="mb-2">
                  <span className="font-medium text-gray-700">
                    {t('patternDefinition.outline.components.parameters', 'Parameters')}:
                  </span>
                  <div className="mt-1 text-sm text-gray-600">
                    {Object.entries(component.parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key.replace('_', ' ')}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {component.notes && (
                <div>
                  <span className="font-medium text-gray-700">
                    {t('patternDefinition.outline.components.notes', 'Notes')}:
                  </span>
                  <div className="mt-1 text-sm text-gray-600">{component.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Color Scheme Section Component
 */
function ColorSchemeSection({ colorScheme }: { colorScheme: any }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {colorScheme.name && (
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.colorScheme.name', 'Scheme Name')}:
          </span>
          <span className="text-gray-900">{colorScheme.name}</span>
        </div>
      )}

      {colorScheme.color_count && (
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.colorScheme.colors', 'Colors')}:
          </span>
          <span className="text-gray-900">
            {t('patternDefinition.outline.colorScheme.colorCount', 
              '{{count}} color', { count: colorScheme.color_count })}
          </span>
        </div>
      )}

      {colorScheme.distribution && (
        <div className="flex justify-between">
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.colorScheme.distribution', 'Distribution')}:
          </span>
          <span className="text-gray-900">{colorScheme.distribution}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Morphology Notes Section Component
 */
function MorphologyNotesSection({ morphologyNotes }: { morphologyNotes: any }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {morphologyNotes.characteristics && morphologyNotes.characteristics.length > 0 && (
        <div>
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.morphologyNotes.characteristics', 'Body Characteristics')}:
          </span>
          <div className="mt-1 text-gray-900">
            {morphologyNotes.characteristics.join(', ')}
          </div>
        </div>
      )}

      {morphologyNotes.advice_summary && (
        <div>
          <span className="font-medium text-gray-700">
            {t('patternDefinition.outline.morphologyNotes.advice', 'Key Advice Points')}:
          </span>
          <div className="mt-1 text-gray-900">{morphologyNotes.advice_summary}</div>
        </div>
      )}
    </div>
  );
} 