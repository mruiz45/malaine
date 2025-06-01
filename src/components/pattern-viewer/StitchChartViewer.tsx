/**
 * Stitch Chart Viewer Component (US_12.8)
 * Complete viewer with chart display and style customization controls
 * Combines StitchChartDisplay with StitchChartStyleControls
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import StitchChartDisplay from './StitchChartDisplay';
import StitchChartStyleControls from './StitchChartStyleControls';
import { useStitchChartStylePreferences } from '@/hooks/useStitchChartStylePreferences';
import type { StitchChartData } from '@/types/stitchChart';

interface StitchChartViewerProps {
  /** Chart data to display */
  chartData: StitchChartData;
  /** Size of each cell in pixels */
  cellSize?: number;
  /** Whether to show row numbers */
  showRowNumbers?: boolean;
  /** Whether to show stitch numbers */
  showStitchNumbers?: boolean;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether in print mode */
  printMode?: boolean;
  /** Whether to show style controls */
  showStyleControls?: boolean;
  /** Whether style controls start collapsed */
  styleControlsCollapsed?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Complete stitch chart viewer with customization
 */
export default function StitchChartViewer({
  chartData,
  cellSize = 32,
  showRowNumbers = true,
  showStitchNumbers = true,
  showLegend = true,
  printMode = false,
  showStyleControls = true,
  styleControlsCollapsed = true,
  className = ''
}: StitchChartViewerProps) {
  const { t } = useTranslation();
  const [styleControlsExpanded, setStyleControlsExpanded] = useState(!styleControlsCollapsed);
  
  const { getStyleOptions, isLoading } = useStitchChartStylePreferences();
  
  // Get current style options
  const styleOptions = getStyleOptions();
  
  // Determine chart characteristics
  const isMonochrome = !chartData.metadata.has_colorwork;
  const hasRepeats = !!(chartData.metadata.stitch_repeat_width && chartData.metadata.stitch_repeat_height);
  
  const handleStyleControlsToggle = () => {
    setStyleControlsExpanded(!styleControlsExpanded);
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-96 mb-4"></div>
        {showStyleControls && (
          <div className="bg-gray-200 rounded-lg h-32"></div>
        )}
      </div>
    );
  }

  return (
    <div className={`stitch-chart-viewer space-y-4 ${className}`}>
      {/* Main Chart Display */}
      <StitchChartDisplay
        chartData={chartData}
        cellSize={cellSize}
        showRowNumbers={showRowNumbers}
        showStitchNumbers={showStitchNumbers}
        showLegend={showLegend}
        styleOptions={styleOptions}
        printMode={printMode}
        className="stitch-chart-main"
      />
      
      {/* Style Controls (hidden in print mode) */}
      {showStyleControls && !printMode && (
        <div className="style-controls-section">
          {/* Toggle Button for Collapsed Mode */}
          {styleControlsCollapsed && (
            <div className="mb-2">
              <button
                onClick={handleStyleControlsToggle}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {styleControlsExpanded ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
                <span>
                  {styleControlsExpanded 
                    ? t('stitchChart.styleControls.hideOptions', 'Hide Style Options')
                    : t('stitchChart.styleControls.showOptions', 'Show Style Options')
                  }
                </span>
              </button>
            </div>
          )}
          
          {/* Style Controls Component */}
          {(!styleControlsCollapsed || styleControlsExpanded) && (
            <StitchChartStyleControls
              isMonochrome={isMonochrome}
              hasRepeats={hasRepeats}
              compact={styleControlsCollapsed}
              className="style-controls"
            />
          )}
        </div>
      )}
    </div>
  );
} 