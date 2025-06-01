/**
 * Stitch Chart Display Component (US_11.6 + US_12.8)
 * Renders stitch charts from StitchChartData as interactive SVG diagrams
 * with customizable appearance options
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StitchChartData, ChartLegendSymbol } from '@/types/stitchChart';
import { DiagramStyleOptions } from '@/types/stitchChartStyles';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface StitchChartDisplayProps {
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
  /** Theme configuration (legacy - use styleOptions instead) */
  theme?: {
    backgroundColor?: string;
    gridColor?: string;
    noStitchColor?: string;
    textColor?: string;
  };
  /** Style options for customization (US_12.8) */
  styleOptions?: DiagramStyleOptions;
  /** Whether in print mode */
  printMode?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default theme configuration
 */
const DEFAULT_THEME = {
  backgroundColor: '#ffffff',
  gridColor: '#333333',
  noStitchColor: '#e5e5e5',
  textColor: '#333333'
};

/**
 * Stitch Chart Display Component
 */
export default function StitchChartDisplay({
  chartData,
  cellSize = 32,
  showRowNumbers = true,
  showStitchNumbers = true,
  showLegend = true,
  theme = {},
  styleOptions,
  printMode = false,
  className = ''
}: StitchChartDisplayProps) {
  const { t } = useTranslation();
  const [hoveredCell, setHoveredCell] = useState<{ row: number; stitch: number } | null>(null);
  
  // Merge legacy theme with new style options and defaults
  const appliedTheme = useMemo(() => {
    const baseTheme = { ...DEFAULT_THEME, ...theme };
    
    if (styleOptions?.colors) {
      return {
        backgroundColor: styleOptions.colors.backgroundColor || baseTheme.backgroundColor,
        gridColor: styleOptions.colors.gridColor || baseTheme.gridColor,
        noStitchColor: styleOptions.colors.noStitchColor || baseTheme.noStitchColor,
        textColor: styleOptions.colors.textColor || baseTheme.textColor,
        symbolColor: styleOptions.colors.symbolColor || baseTheme.textColor
      };
    }
    
    return { ...baseTheme, symbolColor: baseTheme.textColor };
  }, [theme, styleOptions]);
  
  // Grid display options
  const gridOptions = useMemo(() => ({
    showGrid: styleOptions?.grid?.showGrid ?? true,
    gridLineWidth: styleOptions?.grid?.gridLineWidth ?? 1,
    gridLineStyle: styleOptions?.grid?.gridLineStyle ?? 'solid'
  }), [styleOptions]);
  
  // Repeat highlighting options
  const repeatOptions = useMemo(() => ({
    highlightRepeats: styleOptions?.repeats?.highlightRepeats ?? false,
    repeatHighlightColor: styleOptions?.repeats?.repeatHighlightColor ?? '#3b82f6',
    repeatHighlightOpacity: styleOptions?.repeats?.repeatHighlightOpacity ?? 0.2,
    repeatBorderStyle: styleOptions?.repeats?.repeatBorderStyle ?? 'dashed',
    repeatBorderWidth: styleOptions?.repeats?.repeatBorderWidth ?? 2
  }), [styleOptions]);
  
  // Chart dimensions
  const { width: chartWidth, height: chartHeight } = chartData.dimensions;
  
  // Calculate SVG dimensions
  const numberSpacing = 20;
  const svgWidth = chartWidth * cellSize + (showStitchNumbers ? numberSpacing * 2 : 0);
  const svgHeight = chartHeight * cellSize + (showRowNumbers ? numberSpacing * 2 : 0);
  
  // Check if the chart has colorwork (non-monochrome)
  const isMonochrome = useMemo(() => {
    return !chartData.metadata.has_colorwork;
  }, [chartData.metadata.has_colorwork]);
  
  // Check if the chart has pattern repeats
  const hasRepeats = useMemo(() => {
    // Check if stitch pattern has repeat dimensions
    return !!(chartData.metadata.stitch_repeat_width && chartData.metadata.stitch_repeat_height);
  }, [chartData.metadata]);
  
  /**
   * Get symbol URL for a symbol key
   */
  const getSymbolUrl = (symbolKey: string): string => {
    const legendSymbol = chartData.legend.find(l => l.symbol_key === symbolKey);
    return legendSymbol?.graphic_ref || `/assets/symbols/${symbolKey}.svg`;
  };
  
  /**
   * Get symbol definition for tooltip
   */
  const getSymbolDefinition = (symbolKey: string): string => {
    const legendSymbol = chartData.legend.find(l => l.symbol_key === symbolKey);
    return legendSymbol?.definition || symbolKey;
  };
  
  /**
   * Generate row number for display
   */
  const getDisplayRowNumber = (rowIndex: number): number => {
    // In knitting charts, usually bottom row is row 1
    return chartHeight - rowIndex;
  };
  
  /**
   * Get reading direction for a specific row
   */
  const getRowReadingDirection = (rowIndex: number): 'left_to_right' | 'right_to_left' => {
    const displayRowNumber = getDisplayRowNumber(rowIndex);
    const isRightSideRow = displayRowNumber % 2 === 1; // Odd rows are typically RS in flat knitting
    
    return isRightSideRow 
      ? chartData.reading_directions.rs 
      : chartData.reading_directions.ws;
  };
  
  /**
   * Get stroke style for grid lines
   */
  const getGridStrokeStyle = (): string => {
    switch (gridOptions.gridLineStyle) {
      case 'dashed':
        return `${gridOptions.gridLineWidth * 3},${gridOptions.gridLineWidth}`;
      case 'dotted':
        return `${gridOptions.gridLineWidth},${gridOptions.gridLineWidth}`;
      default:
        return 'none';
    }
  };
  
  /**
   * Check if a cell is within a pattern repeat area
   */
  const isInRepeatArea = (rowIndex: number, stitchIndex: number): boolean => {
    if (!hasRepeats || !repeatOptions.highlightRepeats) return false;
    
    const repeatWidth = chartData.metadata.stitch_repeat_width;
    const repeatHeight = chartData.metadata.stitch_repeat_height;
    
    if (!repeatWidth || !repeatHeight) return false;
    
    // Check if the cell is within the repeat boundaries
    return stitchIndex < repeatWidth && (chartHeight - rowIndex - 1) < repeatHeight;
  };
  
  /**
   * Render pattern repeat highlighting overlay
   */
  const RepeatHighlightOverlay = useMemo(() => {
    if (!hasRepeats || !repeatOptions.highlightRepeats) return null;
    
    const repeatWidth = chartData.metadata.stitch_repeat_width;
    const repeatHeight = chartData.metadata.stitch_repeat_height;
    
    if (!repeatWidth || !repeatHeight) return null;
    
    const x = showStitchNumbers ? numberSpacing : 0;
    const y = (chartHeight - repeatHeight) * cellSize + (showRowNumbers ? numberSpacing : 0);
    const width = repeatWidth * cellSize;
    const height = repeatHeight * cellSize;
    
    const strokeDashArray = repeatOptions.repeatBorderStyle === 'dashed' 
      ? `${repeatOptions.repeatBorderWidth * 3},${repeatOptions.repeatBorderWidth}`
      : repeatOptions.repeatBorderStyle === 'dotted'
      ? `${repeatOptions.repeatBorderWidth},${repeatOptions.repeatBorderWidth}`
      : 'none';
    
    return (
      <g className="repeat-highlight-overlay">
        {/* Highlight background */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={repeatOptions.repeatHighlightColor}
          fillOpacity={repeatOptions.repeatHighlightOpacity}
          stroke="none"
        />
        {/* Highlight border */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="none"
          stroke={repeatOptions.repeatHighlightColor}
          strokeWidth={repeatOptions.repeatBorderWidth}
          strokeDasharray={strokeDashArray}
        />
      </g>
    );
  }, [hasRepeats, repeatOptions, chartData.metadata, cellSize, chartHeight, showStitchNumbers, showRowNumbers, numberSpacing]);
  
  /**
   * Legend component
   */
  const Legend = useMemo(() => {
    if (!showLegend || chartData.legend.length === 0) return null;
    
    return (
      <div className={`mt-6 ${printMode ? 'print:mt-4' : ''}`}>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <InformationCircleIcon className="h-4 w-4 mr-1" />
          {t('stitchChart.legend', 'Symbol Legend')}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {chartData.legend.map((symbolDef) => (
            <div 
              key={symbolDef.symbol_key} 
              className="flex items-center space-x-3 p-2 bg-gray-50 rounded border"
            >
              <div className="flex-shrink-0">
                <img
                  src={getSymbolUrl(symbolDef.symbol_key)}
                  alt={symbolDef.symbol_key}
                  width={24}
                  height={24}
                  className="block"
                  style={isMonochrome ? { filter: `hue-rotate(0deg) contrast(1) brightness(0) saturate(0) drop-shadow(0 0 0 ${appliedTheme.symbolColor})` } : {}}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {symbolDef.symbol_key}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {symbolDef.definition}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [chartData.legend, showLegend, printMode, t, isMonochrome, appliedTheme.symbolColor]);
  
  return (
    <div className={`stitch-chart-display ${className}`}>
      {/* Chart Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('stitchChart.title', 'Stitch Chart')}: {chartData.metadata.stitch_pattern_name}
        </h3>
        <div className="text-sm text-gray-600 space-x-4">
          <span>
            {t('stitchChart.dimensions', 'Size')}: {chartWidth} × {chartHeight}
          </span>
          <span>
            {t('stitchChart.craftType', 'Type')}: {t(`craftType.${chartData.metadata.craft_type}`, chartData.metadata.craft_type)}
          </span>
          {hasRepeats && (
            <span>
              {t('stitchChart.repeat', 'Repeat')}: {chartData.metadata.stitch_repeat_width} × {chartData.metadata.stitch_repeat_height}
            </span>
          )}
        </div>
      </div>
      
      {/* Chart SVG */}
      <div className="chart-container bg-white border border-gray-200 rounded-lg p-4 overflow-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="block mx-auto"
          style={{ backgroundColor: appliedTheme.backgroundColor }}
        >
          {/* Pattern repeat highlighting (render behind grid) */}
          {RepeatHighlightOverlay}
          
          {/* Grid and cells */}
          <g className="chart-grid">
            {chartData.grid.map((row, rowIndex) => (
              <g key={`row-${rowIndex}`}>
                {row.map((cell, stitchIndex) => {
                  const x = stitchIndex * cellSize + (showStitchNumbers ? numberSpacing : 0);
                  const y = rowIndex * cellSize + (showRowNumbers ? numberSpacing : 0);
                  const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.stitch === stitchIndex;
                  
                  return (
                    <g 
                      key={`cell-${rowIndex}-${stitchIndex}`}
                      className="chart-cell"
                      onMouseEnter={() => !printMode && setHoveredCell({ row: rowIndex, stitch: stitchIndex })}
                      onMouseLeave={() => !printMode && setHoveredCell(null)}
                    >
                      {/* Cell background */}
                      <rect
                        x={x}
                        y={y}
                        width={cellSize}
                        height={cellSize}
                        fill={cell.is_no_stitch ? appliedTheme.noStitchColor : appliedTheme.backgroundColor}
                        stroke={gridOptions.showGrid ? appliedTheme.gridColor : 'none'}
                        strokeWidth={gridOptions.showGrid ? gridOptions.gridLineWidth : 0}
                        strokeDasharray={gridOptions.showGrid ? getGridStrokeStyle() : 'none'}
                        className={isHovered ? 'opacity-80' : ''}
                      />
                      
                      {/* Symbol image */}
                      {!cell.is_no_stitch && (
                        <image
                          x={x + 4}
                          y={y + 4}
                          width={cellSize - 8}
                          height={cellSize - 8}
                          href={getSymbolUrl(cell.symbol_key)}
                          className="pointer-events-none"
                          style={isMonochrome ? { filter: `hue-rotate(0deg) contrast(1) brightness(0) saturate(0) drop-shadow(0 0 0 ${appliedTheme.symbolColor})` } : {}}
                        />
                      )}
                      
                      {/* Hover tooltip (web only) */}
                      {isHovered && !printMode && (
                        <g className="tooltip">
                          <rect
                            x={x + cellSize + 5}
                            y={y - 10}
                            width="120"
                            height="40"
                            fill="rgba(0,0,0,0.8)"
                            rx="4"
                          />
                          <text
                            x={x + cellSize + 15}
                            y={y + 5}
                            fill="white"
                            fontSize="12"
                            className="font-medium"
                          >
                            {cell.symbol_key}
                          </text>
                          <text
                            x={x + cellSize + 15}
                            y={y + 20}
                            fill="white"
                            fontSize="10"
                          >
                            {getSymbolDefinition(cell.symbol_key)}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            ))}
          </g>
          
          {/* Row numbers */}
          {showRowNumbers && (
            <g className="row-numbers">
              {Array.from({ length: chartHeight }, (_, rowIndex) => {
                const y = rowIndex * cellSize + (numberSpacing / 2) + (cellSize / 2);
                const displayRowNumber = getDisplayRowNumber(rowIndex);
                const readingDirection = getRowReadingDirection(rowIndex);
                
                return (
                  <g key={`row-num-${rowIndex}`}>
                    {/* Left side row number */}
                    <text
                      x={numberSpacing / 2}
                      y={y + numberSpacing}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill={appliedTheme.textColor}
                      className="font-medium"
                    >
                      {displayRowNumber}
                    </text>
                    
                    {/* Right side row number */}
                    <text
                      x={svgWidth - (numberSpacing / 2)}
                      y={y + numberSpacing}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fill={appliedTheme.textColor}
                      className="font-medium"
                    >
                      {displayRowNumber}
                    </text>
                    
                    {/* Reading direction arrow */}
                    {!printMode && (
                      <path
                        d={readingDirection === 'left_to_right' 
                          ? `M${numberSpacing + 5} ${y + numberSpacing} L${numberSpacing + 15} ${y + numberSpacing - 3} L${numberSpacing + 15} ${y + numberSpacing + 3} Z`
                          : `M${svgWidth - numberSpacing - 5} ${y + numberSpacing} L${svgWidth - numberSpacing - 15} ${y + numberSpacing - 3} L${svgWidth - numberSpacing - 15} ${y + numberSpacing + 3} Z`
                        }
                        fill={appliedTheme.textColor}
                        opacity="0.6"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}
          
          {/* Stitch numbers */}
          {showStitchNumbers && (
            <g className="stitch-numbers">
              {Array.from({ length: chartWidth }, (_, stitchIndex) => {
                const x = stitchIndex * cellSize + (cellSize / 2) + (showRowNumbers ? numberSpacing : 0);
                
                return (
                  <g key={`stitch-num-${stitchIndex}`}>
                    {/* Top stitch number */}
                    <text
                      x={x}
                      y={numberSpacing / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fill={appliedTheme.textColor}
                    >
                      {stitchIndex + 1}
                    </text>
                    
                    {/* Bottom stitch number */}
                    <text
                      x={x}
                      y={svgHeight - (numberSpacing / 2)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fill={appliedTheme.textColor}
                    >
                      {stitchIndex + 1}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>
      
      {/* Reading Direction Info */}
      <div className="mt-3 text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>
            {t('stitchChart.rightSideReading', 'Right side rows')}: 
            {chartData.reading_directions.rs === 'left_to_right' 
              ? t('stitchChart.leftToRight', ' left to right')
              : t('stitchChart.rightToLeft', ' right to left')
            }
          </span>
          <span>
            {t('stitchChart.wrongSideReading', 'Wrong side rows')}: 
            {chartData.reading_directions.ws === 'left_to_right' 
              ? t('stitchChart.leftToRight', ' left to right')
              : t('stitchChart.rightToLeft', ' right to left')
            }
          </span>
        </div>
      </div>
      
      {/* Legend */}
      {Legend}
    </div>
  );
} 