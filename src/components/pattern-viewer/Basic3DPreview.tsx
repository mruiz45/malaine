/**
 * Basic 3D Preview Component (US_12.10)
 * Displays a simple wireframe 3D preview of garment shape
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import type {
  Basic3DPreviewProps,
  GarmentWireframe3D,
  GarmentComponent3D,
  DEFAULT_3D_CONFIG
} from '@/types/garment-3d';
import {
  convertMeasurementsTo3D,
  estimateMeasurementsFromCalculations
} from '@/services/garment3DModelService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Simple 3D Canvas using CSS transforms (fallback approach)
 * This provides a basic pseudo-3D visualization without Three.js complexity
 */
function Simple3DVisualization({ 
  model, 
  className = '' 
}: { 
  model: GarmentWireframe3D;
  className?: string;
}) {
  const { t } = useTranslation();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  // Mouse interaction handlers (FR3)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01
    }));
    
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate scale for components
  const scale = 0.8; // Scale factor for visualization
  const centerX = 200; // Canvas center X
  const centerY = 200; // Canvas center Y

  return (
    <div className={`relative overflow-hidden bg-gray-50 ${className}`}>
      <svg
        width="400"
        height="400"
        viewBox="0 0 400 400"
        className="w-full h-full cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `perspective(800px) rotateX(${rotation.x}rad) rotateY(${rotation.y}rad)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Grid reference */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#grid)" />
        
        {/* Render garment components as wireframe shapes (FR1, FR2) */}
        {model.components.map((component) => {
          const geometry = component.geometry;
          const transform = geometry.transform;
          
          // Calculate position with scaling and offset
          const x = centerX + (transform.position.x * scale);
          const y = centerY - (transform.position.y * scale); // Flip Y for SVG
          const width = geometry.radiusTop * 2 * scale;
          const height = geometry.height * scale;
          
          // Different shapes based on component type
          if (component.type === 'body') {
            // Body as rectangle with rounded corners
            return (
              <g key={component.id}>
                <rect
                  x={x - width/2}
                  y={y - height/2}
                  width={width}
                  height={height}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  rx="8"
                  opacity="0.8"
                />
                <text
                  x={x}
                  y={y + height/2 + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6B7280"
                >
                  {component.name}
                </text>
              </g>
            );
          } else if (component.type === 'sleeve') {
            // Sleeves as ellipses
            const sleeveLength = geometry.height * scale;
            const sleeveWidth = geometry.radiusTop * 1.5 * scale;
            
            return (
              <g key={component.id}>
                <ellipse
                  cx={x}
                  cy={y}
                  rx={sleeveLength/2}
                  ry={sleeveWidth/2}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  opacity="0.6"
                  transform={`rotate(${component.id.includes('left') ? -30 : 30} ${x} ${y})`}
                />
                <text
                  x={x}
                  y={y + sleeveWidth/2 + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#6B7280"
                >
                  {component.name}
                </text>
              </g>
            );
          } else if (component.type === 'neck') {
            // Neck as small circle
            return (
              <g key={component.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={width/2}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </g>
            );
          }
          
          return null;
        })}
        
        {/* Center point */}
        <circle cx={centerX} cy={centerY} r="2" fill="#9CA3AF" />
      </svg>
      
      {/* Interaction hint */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
        {t('3dPreview.controls', 'Drag to rotate')}
      </div>
    </div>
  );
}

/**
 * Main Basic 3D Preview Component
 */
export default function Basic3DPreview({
  measurements,
  garmentType,
  printMode = false,
  onModelLoad,
  onError,
  className = ''
}: Basic3DPreviewProps) {
  const { t } = useTranslation();
  const [model, setModel] = useState<GarmentWireframe3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWarnings, setShowWarnings] = useState(true);
  
  // Generate 3D model from measurements
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const inferredGarmentType = garmentType || 'sweater';
      const result = convertMeasurementsTo3D(measurements, inferredGarmentType);
      
      if (result.success && result.model) {
        setModel(result.model);
        onModelLoad?.(result.model);
      } else {
        const errorMsg = result.error || 'Failed to generate 3D model';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = `3D model generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [measurements, garmentType, onModelLoad, onError]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">
              {t('3dPreview.generating', 'Generating 3D preview...')}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              {t('3dPreview.error.title', '3D Preview Error')}
            </h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <p className="text-xs text-red-600">
              {t('3dPreview.error.suggestion', 'Please check that all required measurements (chest, length, arm length, upper arm) are provided.')}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // No model state
  if (!model) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('3dPreview.noData.title', 'No 3D Preview Available')}
        </h3>
        <p className="text-gray-600">
          {t('3dPreview.noData.description', 'Insufficient measurement data to generate 3D preview.')}
        </p>
      </div>
    );
  }
  
  const hasWarnings = model.metadata.warnings.length > 0;
  
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header with controls - Hidden in print mode */}
      {!printMode && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {t('3dPreview.title', 'Basic 3D Wireframe Preview')}
              <span className="ml-2 text-sm text-gray-500">
                ({model.components.length} {t('3dPreview.components', 'components')})
              </span>
            </h3>
            
            {/* Warnings toggle */}
            {hasWarnings && (
              <button
                onClick={() => setShowWarnings(!showWarnings)}
                className="inline-flex items-center px-3 py-1 border border-yellow-300 shadow-sm text-sm font-medium rounded text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {showWarnings ? t('3dPreview.hideWarnings', 'Hide Warnings') : t('3dPreview.showWarnings', 'Show Warnings')}
              </button>
            )}
          </div>
          
          {/* Warnings section (FR5) */}
          {hasWarnings && showWarnings && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    {t('3dPreview.approximation.title', 'Approximation Notice')}
                  </h4>
                  <p className="text-xs text-yellow-700 mb-2">
                    {t('3dPreview.approximation.description', 'This is a very basic wireframe representation and not a realistic rendering of the final garment.')}
                  </p>
                  <ul className="text-xs text-yellow-600 space-y-1">
                    {model.metadata.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 3D Visualization */}
      <div className="relative" style={{ height: printMode ? '300px' : '400px' }}>
        <Simple3DVisualization 
          model={model} 
          className="w-full h-full"
        />
      </div>
      
      {/* Model info - Hidden in print mode */}
      {!printMode && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {t('3dPreview.generated', 'Generated')}: {new Date(model.metadata.generatedAt).toLocaleString()}
            </span>
            <span>
              {t('3dPreview.algorithm', 'Algorithm')}: v{model.metadata.algorithmVersion}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}