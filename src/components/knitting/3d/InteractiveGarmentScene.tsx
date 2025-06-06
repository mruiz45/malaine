/**
 * Interactive Garment Scene Component (PD_PH5_US002)
 * Extends the 3D scene with clickable garment parts for navigation
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { use3DInteraction } from '@/hooks/use3DInteraction';
import {
  FinishedDimensions,
  MeshConfiguration,
  CameraViewPreset,
  GarmentType,
  NecklineParams,
  SleeveParams,
  SceneConfiguration,
  GarmentComponent
} from '@/types/3d-preview';
import {
  ExclamationTriangleIcon,
  CursorArrowRippleIcon
} from '@heroicons/react/24/outline';

interface InteractiveGarmentSceneProps {
  /** Garment type */
  garmentType: GarmentType;
  /** Finished dimensions */
  dimensions: FinishedDimensions;
  /** Neckline parameters */
  neckline: NecklineParams;
  /** Sleeve parameters */
  sleeves: SleeveParams;
  /** Mesh configuration with visibility */
  meshConfig: MeshConfiguration;
  /** Scene configuration */
  sceneConfig: SceneConfiguration;
  /** Current camera view */
  currentView: CameraViewPreset;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Clickable garment part component
 */
interface ClickablePartProps {
  component: GarmentComponent;
  position: [number, number];
  size: [number, number];
  color: string;
  shape: 'rectangle' | 'ellipse' | 'circle';
  rotation?: number;
  visible: boolean;
  clickable: boolean;
  hoverColor?: string;
  onPartClick: (component: GarmentComponent, position: { x: number; y: number }) => void;
  onHover?: (component: GarmentComponent, hovering: boolean) => void;
  title?: string;
}

function ClickablePart({
  component,
  position,
  size,
  color,
  shape,
  rotation = 0,
  visible,
  clickable,
  hoverColor = '#60A5FA',
  onPartClick,
  onHover,
  title
}: ClickablePartProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [clickFeedback, setClickFeedback] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (clickable) {
      setIsHovered(true);
      onHover?.(component, true);
    }
  }, [clickable, component, onHover]);

  const handleMouseLeave = useCallback(() => {
    if (clickable) {
      setIsHovered(false);
      onHover?.(component, false);
    }
  }, [clickable, component, onHover]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!clickable) return;
    
    event.stopPropagation();
    
    // Visual feedback
    setClickFeedback(true);
    setTimeout(() => setClickFeedback(false), 300);
    
    // Get click position relative to the component
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    onPartClick(component, { x, y });
  }, [clickable, component, onPartClick]);

  if (!visible) return null;

  const [x, y] = position;
  const [width, height] = size;
  const effectiveColor = isHovered && clickable ? hoverColor : color;
  const cursor = clickable ? 'pointer' : 'default';

  // Apply click feedback effect
  const transform = `translate(${x - width/2}, ${y - height/2}) ${rotation ? `rotate(${rotation} ${width/2} ${height/2})` : ''}`;
  const scale = clickFeedback ? 'scale(1.05)' : 'scale(1)';

  return (
    <g
      style={{ cursor }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={clickable ? 'transition-all duration-200' : ''}
    >
      {shape === 'rectangle' && (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="none"
          stroke={effectiveColor}
          strokeWidth={isHovered ? 3 : 2}
          rx="8"
          opacity={isHovered ? 1 : 0.8}
          transform={`${transform} ${scale}`}
          style={{ 
            transformOrigin: `${width/2}px ${height/2}px`,
            transition: 'all 0.2s ease'
          }}
        />
      )}

      {shape === 'ellipse' && (
        <ellipse
          cx={width/2}
          cy={height/2}
          rx={width/2}
          ry={height/2}
          fill="none"
          stroke={effectiveColor}
          strokeWidth={isHovered ? 3 : 2}
          opacity={isHovered ? 1 : 0.6}
          transform={`${transform} ${scale}`}
          style={{ 
            transformOrigin: `${width/2}px ${height/2}px`,
            transition: 'all 0.2s ease'
          }}
        />
      )}

      {shape === 'circle' && (
        <circle
          cx={width/2}
          cy={height/2}
          r={Math.min(width, height)/2}
          fill="none"
          stroke={effectiveColor}
          strokeWidth={isHovered ? 2 : 1}
          opacity={isHovered ? 1 : 0.5}
          transform={`${transform} ${scale}`}
          style={{ 
            transformOrigin: `${width/2}px ${height/2}px`,
            transition: 'all 0.2s ease'
          }}
        />
      )}

      {/* Hover indicator */}
      {isHovered && clickable && (
        <g transform={transform}>
          <text
            x={width/2}
            y={height + 20}
            textAnchor="middle"
            fontSize="10"
            fill="#374151"
            fontWeight="bold"
          >
            {title || component}
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * Main Interactive Garment Scene Component
 */
export default function InteractiveGarmentScene({
  garmentType,
  dimensions,
  neckline,
  sleeves,
  meshConfig,
  sceneConfig,
  currentView,
  className = ''
}: InteractiveGarmentSceneProps) {
  const { t } = useTranslation();
  
  const {
    handlePartClick,
    canNavigateToComponent,
    getClickHintForComponent,
    shouldShowHoverEffect,
    interactiveConfig
  } = use3DInteraction();

  const [hoveredComponent, setHoveredComponent] = useState<GarmentComponent | null>(null);

  // Calculate scale and positions for the garment visualization
  const scale = 0.8;
  const centerX = 200;
  const centerY = 200;

  // Convert dimensions to visualization scale
  const bodyWidth = (dimensions.bust / 100) * scale * 50;
  const bodyHeight = (dimensions.length / 100) * scale * 60;
  const sleeveLength = dimensions.sleeveLength ? (dimensions.sleeveLength / 100) * scale * 40 : 0;
  const sleeveWidth = bodyWidth * 0.3;

  /**
   * Handle part click with navigation
   */
  const handlePartClickWithNavigation = useCallback((
    component: GarmentComponent,
    screenPosition: { x: number; y: number }
  ) => {
    handlePartClick(component, screenPosition);
  }, [handlePartClick]);

  /**
   * Handle part hover
   */
  const handlePartHover = useCallback((
    component: GarmentComponent,
    hovering: boolean
  ) => {
    setHoveredComponent(hovering ? component : null);
  }, []);

  return (
    <div className={`relative overflow-hidden bg-gray-50 ${className}`}>
      <svg
        width="400"
        height="400"
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{
          background: sceneConfig.backgroundColor || '#f8fafc'
        }}
      >
        {/* Grid reference */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#grid)" />

        {/* Front Body */}
        <ClickablePart
          component="frontBody"
          position={[centerX, centerY]}
          size={[bodyWidth, bodyHeight]}
          color={meshConfig.colors.frontBody}
          shape="rectangle"
          visible={meshConfig.visibility.frontBody}
          clickable={canNavigateToComponent('frontBody')}
          hoverColor={interactiveConfig.hoverColor}
          onPartClick={handlePartClickWithNavigation}
          onHover={handlePartHover}
          title={t('3dPreview.components.frontBody', 'Front Body')}
        />

        {/* Back Body */}
        <ClickablePart
          component="backBody"
          position={[centerX + 10, centerY + 5]}
          size={[bodyWidth * 0.95, bodyHeight * 0.95]}
          color={meshConfig.colors.backBody}
          shape="rectangle"
          visible={meshConfig.visibility.backBody}
          clickable={canNavigateToComponent('backBody')}
          hoverColor={interactiveConfig.hoverColor}
          onPartClick={handlePartClickWithNavigation}
          onHover={handlePartHover}
          title={t('3dPreview.components.backBody', 'Back Body')}
        />

        {/* Left Sleeve */}
        {sleeves.enabled && dimensions.sleeveLength && (
          <ClickablePart
            component="leftSleeve"
            position={[centerX - bodyWidth/2 - sleeveLength/2 - 10, centerY - bodyHeight/4]}
            size={[sleeveLength, sleeveWidth]}
            color={meshConfig.colors.leftSleeve}
            shape="ellipse"
            rotation={-30}
            visible={meshConfig.visibility.leftSleeve}
            clickable={canNavigateToComponent('leftSleeve')}
            hoverColor={interactiveConfig.hoverColor}
            onPartClick={handlePartClickWithNavigation}
            onHover={handlePartHover}
            title={t('3dPreview.components.leftSleeve', 'Left Sleeve')}
          />
        )}

        {/* Right Sleeve */}
        {sleeves.enabled && dimensions.sleeveLength && (
          <ClickablePart
            component="rightSleeve"
            position={[centerX + bodyWidth/2 + sleeveLength/2 + 10, centerY - bodyHeight/4]}
            size={[sleeveLength, sleeveWidth]}
            color={meshConfig.colors.rightSleeve}
            shape="ellipse"
            rotation={30}
            visible={meshConfig.visibility.rightSleeve}
            clickable={canNavigateToComponent('rightSleeve')}
            hoverColor={interactiveConfig.hoverColor}
            onPartClick={handlePartClickWithNavigation}
            onHover={handlePartHover}
            title={t('3dPreview.components.rightSleeve', 'Right Sleeve')}
          />
        )}

        {/* Neckline Detail */}
        {neckline.type !== 'crew' && (
          <ClickablePart
            component="necklineDetail"
            position={[centerX, centerY - bodyHeight/2 + 20]}
            size={[bodyWidth * 0.6, 20]}
            color={meshConfig.colors.necklineDetail}
            shape="circle"
            visible={meshConfig.visibility.necklineDetail}
            clickable={canNavigateToComponent('necklineDetail')}
            hoverColor={interactiveConfig.hoverColor}
            onPartClick={handlePartClickWithNavigation}
            onHover={handlePartHover}
            title={t('3dPreview.components.necklineDetail', 'Neckline')}
          />
        )}

        {/* Center reference point */}
        <circle cx={centerX} cy={centerY} r="2" fill="#9CA3AF" />
      </svg>

      {/* Interactive feedback overlay */}
      {interactiveConfig.enabled && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          {hoveredComponent ? (
            <span>
              {getClickHintForComponent(hoveredComponent) || 
               t('3dPreview.clickToNavigate', 'Click to navigate to {{component}}', { 
                 component: hoveredComponent 
               })}
            </span>
          ) : (
            <span>
              {t('3dPreview.hoverToInteract', 'Hover over parts to interact')}
            </span>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="absolute top-2 left-2 z-10 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
          <span className="text-xs text-yellow-800">
            {t('3dPreview.disclaimer', 'Approximate preview for visualization')}
          </span>
        </div>
      </div>
    </div>
  );
} 