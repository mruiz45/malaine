/**
 * Model Visibility Panel Component (PD_PH5_US002)
 * Provides toggles to control visibility of garment parts in 3D preview
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { use3DInteraction } from '@/hooks/use3DInteraction';
import {
  GarmentComponent,
  MeshConfiguration
} from '@/types/3d-preview';
import {
  EyeIcon,
  EyeSlashIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ModelVisibilityPanelProps {
  /** Current mesh configuration */
  meshConfig: MeshConfiguration;
  /** Callback when visibility changes */
  onVisibilityChange: (component: GarmentComponent, visible: boolean) => void;
  /** Whether the panel is in compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Toggle switch component for individual garment parts
 */
interface VisibilityToggleProps {
  component: GarmentComponent;
  visible: boolean;
  disabled: boolean;
  onToggle: (component: GarmentComponent, visible: boolean) => void;
  showClickHint?: boolean;
  clickHint?: string | null;
}

function VisibilityToggle({
  component,
  visible,
  disabled,
  onToggle,
  showClickHint = false,
  clickHint
}: VisibilityToggleProps) {
  const { t } = useTranslation();

  // Component display names for i18n
  const componentDisplayNames: Record<GarmentComponent, string> = {
    frontBody: t('3dPreview.components.frontBody', 'Front Body'),
    backBody: t('3dPreview.components.backBody', 'Back Body'),
    leftSleeve: t('3dPreview.components.leftSleeve', 'Left Sleeve'),
    rightSleeve: t('3dPreview.components.rightSleeve', 'Right Sleeve'),
    necklineDetail: t('3dPreview.components.necklineDetail', 'Neckline'),
    cuffDetail: t('3dPreview.components.cuffDetail', 'Cuffs'),
    hemDetail: t('3dPreview.components.hemDetail', 'Hem')
  };

  const displayName = componentDisplayNames[component];

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${
          disabled ? 'text-gray-400' : 'text-gray-700'
        }`}>
          {displayName}
        </span>
        {showClickHint && clickHint && (
          <span className="text-xs text-gray-500 italic">
            ({t('3dPreview.clickable', 'clickable')})
          </span>
        )}
      </div>
      
      <button
        type="button"
        onClick={() => onToggle(component, !visible)}
        disabled={disabled}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          visible ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        title={visible 
          ? t('3dPreview.hideComponent', 'Hide {{component}}', { component: displayName })
          : t('3dPreview.showComponent', 'Show {{component}}', { component: displayName })
        }
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            visible ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

/**
 * Main Model Visibility Panel Component
 */
export default function ModelVisibilityPanel({
  meshConfig,
  onVisibilityChange,
  compact = false,
  className = ''
}: ModelVisibilityPanelProps) {
  const { t } = useTranslation();
  
  const {
    availableComponents,
    handleVisibilityToggle,
    getClickHintForComponent,
    canNavigateToComponent
  } = use3DInteraction();

  /**
   * Handle individual component toggle
   */
  const handleComponentToggle = (component: GarmentComponent, visible: boolean) => {
    onVisibilityChange(component, visible);
    handleVisibilityToggle(component, visible, 'user');
  };

  /**
   * Show all components
   */
  const handleShowAll = () => {
    availableComponents.forEach(component => {
      if (!meshConfig.visibility[component]) {
        onVisibilityChange(component, true);
        handleVisibilityToggle(component, true, 'auto');
      }
    });
  };

  /**
   * Hide all components
   */
  const handleHideAll = () => {
    availableComponents.forEach(component => {
      if (meshConfig.visibility[component]) {
        onVisibilityChange(component, false);
        handleVisibilityToggle(component, false, 'auto');
      }
    });
  };

  /**
   * Reset to default visibility
   */
  const handleReset = () => {
    availableComponents.forEach(component => {
      // Default to visible for main components
      const defaultVisible = ['frontBody', 'backBody', 'leftSleeve', 'rightSleeve', 'necklineDetail'].includes(component);
      if (meshConfig.visibility[component] !== defaultVisible) {
        onVisibilityChange(component, defaultVisible);
        handleVisibilityToggle(component, defaultVisible, 'auto');
      }
    });
  };

  // Group components by category for better organization
  const bodyComponents = availableComponents.filter(c => 
    c === 'frontBody' || c === 'backBody'
  );
  const sleeveComponents = availableComponents.filter(c => 
    c === 'leftSleeve' || c === 'rightSleeve' || c === 'cuffDetail'
  );
  const detailComponents = availableComponents.filter(c => 
    c === 'necklineDetail' || c === 'hemDetail'
  );

  if (availableComponents.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <p className="text-sm text-gray-500 text-center">
          {t('3dPreview.noComponentsAvailable', 'No components available for this garment type')}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
            <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
              {t('3dPreview.visibilityControls', 'Visibility Controls')}
            </h3>
          </div>
          
          {/* Quick actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleShowAll}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title={t('3dPreview.showAll', 'Show all')}
            >
              <EyeIcon className="h-3 w-3 mr-1" />
              {t('common.all', 'All')}
            </button>
            <button
              onClick={handleHideAll}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title={t('3dPreview.hideAll', 'Hide all')}
            >
              <EyeSlashIcon className="h-3 w-3 mr-1" />
              {t('common.none', 'None')}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              title={t('3dPreview.resetVisibility', 'Reset to default')}
            >
              <ArrowPathIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Body Components */}
        {bodyComponents.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              {t('3dPreview.componentGroups.body', 'Body')}
            </h4>
            <div className="space-y-1">
              {bodyComponents.map(component => (
                <VisibilityToggle
                  key={component}
                  component={component}
                  visible={meshConfig.visibility[component]}
                  disabled={false}
                  onToggle={handleComponentToggle}
                  showClickHint={canNavigateToComponent(component)}
                  clickHint={getClickHintForComponent(component)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sleeve Components */}
        {sleeveComponents.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              {t('3dPreview.componentGroups.sleeves', 'Sleeves')}
            </h4>
            <div className="space-y-1">
              {sleeveComponents.map(component => (
                <VisibilityToggle
                  key={component}
                  component={component}
                  visible={meshConfig.visibility[component]}
                  disabled={false}
                  onToggle={handleComponentToggle}
                  showClickHint={canNavigateToComponent(component)}
                  clickHint={getClickHintForComponent(component)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Detail Components */}
        {detailComponents.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              {t('3dPreview.componentGroups.details', 'Details')}
            </h4>
            <div className="space-y-1">
              {detailComponents.map(component => (
                <VisibilityToggle
                  key={component}
                  component={component}
                  visible={meshConfig.visibility[component]}
                  disabled={false}
                  onToggle={handleComponentToggle}
                  showClickHint={canNavigateToComponent(component)}
                  clickHint={getClickHintForComponent(component)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            {t('3dPreview.visibilityHelp', 'Toggle parts on/off to focus on specific areas. Click on visible parts to navigate to their configuration sections.')}
          </p>
        </div>
      </div>
    </div>
  );
} 