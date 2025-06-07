/**
 * Preview Panel Component
 * Combines 2D and 3D previews with tabs for switching between views
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInMemoryPatternDefinition } from '@/contexts/InMemoryPatternDefinitionContext';
import Preview3D from './Preview3D';
import { SchematicPreview2D } from '@/components/pattern/SchematicPreview2D';
import type { 
  MeasurementsSectionData, 
  EaseSectionData, 
  BodyStructureSectionData,
  NecklineSectionData,
  SleevesSectionData 
} from '@/types/patternDefinitionInMemory';
import type { GarmentType as PatternGarmentType, MeasurementsData, EaseData } from '@/types/pattern';

type PreviewTab = '2d' | '3d';

interface PreviewPanelProps {
  className?: string;
}

export default function PreviewPanel({ className = '' }: PreviewPanelProps) {
  const { t } = useTranslation();
  const { state } = useInMemoryPatternDefinition();
  const { currentPattern } = state;
  
  const [activeTab, setActiveTab] = useState<PreviewTab>('2d');

  /**
   * Convert pattern data for 2D preview
   */
  const preview2DData = useMemo(() => {
    console.log('🔧 Raw currentPattern:', currentPattern);
    
    if (!currentPattern) {
      console.log('❌ No current pattern');
      return {
        garmentType: null,
        measurements: {} as any,
        ease: {} as any,
        bodyStructure: undefined,
        neckline: undefined,
        sleeves: undefined
      };
    }

    // Convert garment type - SchematicPreview2D expects a simple string type
    const garmentType: PatternGarmentType = currentPattern.garmentType as PatternGarmentType;
    console.log('🏷️ Garment type:', garmentType);

    // Simplify measurements for now - just pass raw data
    const measurements = (currentPattern.measurements as any) || {};
    console.log('📏 Measurements section:', measurements);

    // Simplify ease for now
    const ease = (currentPattern.ease as any) || {};
    console.log('📐 Ease section:', ease);

    // Check body structure
    const bodyStructure = currentPattern.bodyStructure as any;
    console.log('🏗️ Body structure:', bodyStructure);

    const result = {
      garmentType,
      measurements,
      ease,
      bodyStructure,
      neckline: undefined,
      sleeves: undefined
    };
    
    console.log('📦 Final preview2DData:', result);
    return result;
  }, [currentPattern]);

  /**
   * Check if preview data is available
   */
  const hasPreviewData = useMemo(() => {
    const hasGarment = !!preview2DData.garmentType;
    const hasMeasurements = !!preview2DData.measurements && Object.keys(preview2DData.measurements).length > 0;
    
    console.log('🔍 Preview data check:', {
      garmentType: preview2DData.garmentType,
      hasGarment,
      measurements: preview2DData.measurements,
      hasMeasurements,
      measurementsKeys: Object.keys(preview2DData.measurements || {}),
      result: hasGarment && hasMeasurements
    });
    
    return hasGarment && hasMeasurements;
  }, [preview2DData]);

  /**
   * Tab button component
   */
  const TabButton = ({ tab, label, isActive, onClick }: {
    tab: PreviewTab;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header with tabs */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('preview.title', 'Pattern Preview')}
          </h3>
          
          <div className="flex space-x-2">
            <TabButton
              tab="2d"
              label={t('preview.tab2d', '2D Schematic')}
              isActive={activeTab === '2d'}
              onClick={() => setActiveTab('2d')}
            />
            <TabButton
              tab="3d"
              label={t('preview.tab3d', '3D Wireframe')}
              isActive={activeTab === '3d'}
              onClick={() => setActiveTab('3d')}
            />
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="mt-2">
          {hasPreviewData ? (
            <div className="flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              {t('preview.ready', 'Preview ready')}
            </div>
          ) : (
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2" />
              {t('preview.needsData', 'Complete pattern data to view preview')}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {activeTab === '2d' && (
          <div className="p-4">
            {hasPreviewData ? (
              <SchematicPreview2D
                garmentType={preview2DData.garmentType}
                measurements={preview2DData.measurements}
                ease={preview2DData.ease}
                bodyStructure={preview2DData.bodyStructure}
                neckline={preview2DData.neckline}
                sleeves={preview2DData.sleeves}
                width={350}
                height={450}
                className="mx-auto"
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-50">
                <div className="text-center">
                  <svg 
                    className="w-16 h-16 text-gray-300 mx-auto mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1}
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" 
                    />
                  </svg>
                  <p className="text-gray-500 font-medium">
                    {t('preview.2d.noData', 'Select garment type and add measurements')}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {t('preview.2d.description', 'to see 2D schematic preview')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === '3d' && (
          <div className="h-[500px]">
            <Preview3D className="h-full" />
          </div>
        )}
      </div>

      {/* Footer info when data is available */}
      {hasPreviewData && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div>
              <span className="font-medium">{t('preview.garmentType', 'Type')}:</span>{' '}
              {preview2DData.garmentType || 'Unknown'}
            </div>
            
            {Object.keys(preview2DData.measurements).length > 0 && (
              <div>
                <span className="font-medium">{t('preview.measurements', 'Measurements')}:</span>{' '}
                {preview2DData.measurements.bust ? `${preview2DData.measurements.bust}${preview2DData.measurements.unit || 'cm'}` : 'N/A'}
              </div>
            )}
            
            <div>
              <span className="font-medium">{t('preview.updated', 'Updated')}:</span>{' '}
              {currentPattern?.updatedAt.toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 