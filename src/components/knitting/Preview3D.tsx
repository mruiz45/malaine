/**
 * 3D Preview Component (PD_PH5_US001 + PD_PH5_US002)
 * Main component for real-time 3D garment preview with controls and interactions
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { use3DPreview } from '@/hooks/use3DPreview';
import { CameraViewPreset, GarmentComponent } from '@/types/3d-preview';
import InteractiveGarmentScene from '@/components/knitting/3d/InteractiveGarmentScene';
import ModelVisibilityPanel from '@/components/knitting/3d/ModelVisibilityPanel';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowPathIcon, 
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

/**
 * Temporary 3D placeholder component while we resolve React Three Fiber issues
 */
function GarmentScenePlaceholder({
  dimensions,
  neckline,
  sleeves,
  meshConfig,
  sceneConfig,
  currentView
}: {
  dimensions: any;
  neckline: any;
  sleeves: any;
  meshConfig: any;
  sceneConfig: any;
  currentView: CameraViewPreset;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center"
         style={{ backgroundColor: sceneConfig.backgroundColor }}>
      <div className="text-center p-8">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Front Body */}
          {meshConfig.visibility.frontBody && (
            <div 
              className="w-16 h-24 rounded mx-auto shadow-lg"
              style={{ backgroundColor: meshConfig.colors.frontBody }}
              title="Front Body"
            />
          )}
          
          {/* Back Body */}
          {meshConfig.visibility.backBody && (
            <div 
              className="w-16 h-24 rounded mx-auto shadow-lg"
              style={{ backgroundColor: meshConfig.colors.backBody }}
              title="Back Body"
            />
          )}
          
          {/* Neckline Detail */}
          {meshConfig.visibility.necklineDetail && neckline.type !== 'crew' && (
            <div 
              className="w-12 h-4 rounded mx-auto shadow-lg mt-2"
              style={{ backgroundColor: meshConfig.colors.necklineDetail }}
              title="Neckline Detail"
            />
          )}
        </div>
        
        {/* Sleeves */}
        {sleeves.enabled && dimensions.sleeveLength && (
          <div className="flex justify-center gap-8 mb-6">
            {meshConfig.visibility.leftSleeve && (
              <div 
                className="w-8 h-16 rounded shadow-lg"
                style={{ backgroundColor: meshConfig.colors.leftSleeve }}
                title="Left Sleeve"
              />
            )}
            {meshConfig.visibility.rightSleeve && (
              <div 
                className="w-8 h-16 rounded shadow-lg"
                style={{ backgroundColor: meshConfig.colors.rightSleeve }}
                title="Right Sleeve"
              />
            )}
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p>Interactive 3D Preview</p>
          <p className="text-xs mt-1">
            {dimensions.bust}×{dimensions.length}{dimensions.unit}
            {dimensions.sleeveLength && ` • Sleeves: ${dimensions.sleeveLength}${dimensions.unit}`}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * View control buttons
 */
interface ViewControlsProps {
  currentView: CameraViewPreset;
  onViewChange: (view: CameraViewPreset) => void;
}

function ViewControls({ currentView, onViewChange }: ViewControlsProps) {
  const { t } = useTranslation();

  const views: { key: CameraViewPreset; label: string }[] = [
    { key: 'perspective', label: t('3dPreview.views.perspective', 'Perspective') },
    { key: 'front', label: t('3dPreview.views.front', 'Front') },
    { key: 'back', label: t('3dPreview.views.back', 'Back') },
    { key: 'side', label: t('3dPreview.views.side', 'Side') }
  ];

  return (
    <div className="flex items-center space-x-1">
      {views.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onViewChange(key)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            currentView === key
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={label}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * Preview controls
 */
interface PreviewControlsProps {
  enabled: boolean;
  autoUpdate: boolean;
  onTogglePreview: (enabled: boolean) => void;
  onToggleAutoUpdate: (autoUpdate: boolean) => void;
  onRefresh: () => void;
  onReset: () => void;
}

function PreviewControls({
  enabled,
  autoUpdate,
  onTogglePreview,
  onToggleAutoUpdate,
  onRefresh,
  onReset
}: PreviewControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-2">
      {/* Enable/disable preview */}
      <button
        onClick={() => onTogglePreview(!enabled)}
        className={`p-2 rounded-md transition-colors ${
          enabled
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }`}
        title={enabled ? t('3dPreview.disable', 'Disable preview') : t('3dPreview.enable', 'Enable preview')}
      >
        {enabled ? (
          <EyeIcon className="w-4 h-4" />
        ) : (
          <EyeSlashIcon className="w-4 h-4" />
        )}
      </button>

      {/* Auto-update toggle */}
      <button
        onClick={() => onToggleAutoUpdate(!autoUpdate)}
        className={`px-3 py-1 text-xs rounded-md transition-colors ${
          autoUpdate
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={t('3dPreview.autoUpdate', 'Auto-update')}
      >
        {t('3dPreview.auto', 'Auto')}
      </button>

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        title={t('3dPreview.refresh', 'Refresh preview')}
      >
        <ArrowPathIcon className="w-4 h-4" />
      </button>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        title={t('3dPreview.reset', 'Reset to defaults')}
      >
        <Cog6ToothIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Status indicator
 */
interface StatusIndicatorProps {
  isAvailable: boolean;
  isLoading: boolean;
  statusMessage: string;
  error: string | null;
}

function StatusIndicator({ isAvailable, isLoading, statusMessage, error }: StatusIndicatorProps) {
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600 text-sm">
        <ExclamationTriangleIcon className="w-4 h-4" />
        <span>{statusMessage}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-blue-600 text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>{statusMessage}</span>
      </div>
    );
  }

  return (
    <div className={`text-sm ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
      {statusMessage}
    </div>
  );
}

/**
 * Main Preview3D component
 */
interface Preview3DProps {
  className?: string;
}

export default function Preview3D({ className = '' }: Preview3DProps) {
  const { t } = useTranslation();
  
  const {
    previewState,
    isPreviewAvailable,
    statusMessage,
    necklineParams,
    sleeveParams,
    garmentType,
    togglePreview,
    changeView,
    updateComponentVisibility,
    toggleAutoUpdate,
    refreshPreview,
    resetToDefaults
  } = use3DPreview();

  // State for visibility panel
  const [showVisibilityPanel, setShowVisibilityPanel] = useState(false);

  const {
    enabled,
    isLoading,
    error,
    currentView,
    dimensions,
    meshConfig,
    sceneConfig,
    autoUpdate
  } = previewState;

  /**
   * Handle component visibility change
   */
  const handleVisibilityChange = (component: GarmentComponent, visible: boolean) => {
    updateComponentVisibility(component, visible);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('3dPreview.title', '3D Preview')}
            </h3>
            <StatusIndicator
              isAvailable={isPreviewAvailable}
              isLoading={isLoading}
              statusMessage={statusMessage}
              error={error}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Visibility Panel Toggle */}
            {isPreviewAvailable && (
              <button
                onClick={() => setShowVisibilityPanel(!showVisibilityPanel)}
                className={`p-2 rounded-md transition-colors ${
                  showVisibilityPanel
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={t('3dPreview.toggleVisibilityPanel', 'Toggle visibility controls')}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
              </button>
            )}

            <ViewControls
              currentView={currentView}
              onViewChange={changeView}
            />
            
            <PreviewControls
              enabled={enabled}
              autoUpdate={autoUpdate}
              onTogglePreview={togglePreview}
              onToggleAutoUpdate={toggleAutoUpdate}
              onRefresh={refreshPreview}
              onReset={resetToDefaults}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex">
        {/* 3D Scene */}
        <div className={`relative ${showVisibilityPanel ? 'flex-1' : 'w-full'}`}>
          {/* 3D Scene Container */}
          <div className="h-96">
            {enabled && isPreviewAvailable && dimensions && garmentType ? (
              <InteractiveGarmentScene
                garmentType={garmentType as any}
                dimensions={dimensions}
                neckline={{ type: 'crew', ...necklineParams }}
                sleeves={{ enabled: false, ...sleeveParams }}
                meshConfig={meshConfig}
                sceneConfig={sceneConfig}
                currentView={currentView}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  {!enabled ? (
                    <div>
                      <EyeSlashIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        {t('3dPreview.disabled', '3D Preview Disabled')}
                      </p>
                    </div>
                  ) : !isPreviewAvailable ? (
                    <div>
                      <Cog6ToothIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        {t('3dPreview.notAvailable', 'Complete pattern data to view preview')}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-500">
                        {t('3dPreview.loading', 'Loading preview...')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visibility Control Panel */}
        {showVisibilityPanel && isPreviewAvailable && (
          <div className="w-80 border-l border-gray-200">
            <ModelVisibilityPanel
              meshConfig={meshConfig}
              onVisibilityChange={handleVisibilityChange}
              className="h-96 overflow-y-auto"
            />
          </div>
        )}
      </div>

      {/* Footer with info */}
      {isPreviewAvailable && dimensions && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">{t('3dPreview.dimensions', 'Dimensions')}:</span>
                <div className="mt-1">
                  {t('3dPreview.bust', 'Bust')}: {dimensions.bust}{dimensions.unit} •{' '}
                  {t('3dPreview.length', 'Length')}: {dimensions.length}{dimensions.unit}
                  {dimensions.sleeveLength && (
                    <> • {t('3dPreview.sleeves', 'Sleeves')}: {dimensions.sleeveLength}{dimensions.unit}</>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium">{t('3dPreview.components', 'Components')}:</span>
                <div className="mt-1">
                  {Object.entries(meshConfig.visibility)
                    .filter(([, visible]) => visible)
                    .map(([component]) => component)
                    .join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 