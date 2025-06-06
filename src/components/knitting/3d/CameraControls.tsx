/**
 * Camera Controls Component (PD_PH5_US001)
 * Interactive camera controls for 3D scene
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { CameraViewPreset } from '@/types/3d-preview';
import { 
  ArrowsPointingOutIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * Props for CameraControls
 */
interface CameraControlsProps {
  currentView: CameraViewPreset;
  onViewChange: (view: CameraViewPreset) => void;
  onReset?: () => void;
  className?: string;
}

/**
 * Camera Controls Component
 */
export default function CameraControls({
  currentView,
  onViewChange,
  onReset,
  className = ''
}: CameraControlsProps) {
  const { t } = useTranslation();

  const viewButtons: Array<{
    key: CameraViewPreset;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'perspective',
      label: t('3dPreview.views.perspective', 'Perspective'),
      icon: <ArrowsPointingOutIcon className="w-4 h-4" />
    },
    {
      key: 'front',
      label: t('3dPreview.views.front', 'Front'),
      icon: <EyeIcon className="w-4 h-4" />
    },
    {
      key: 'back',
      label: t('3dPreview.views.back', 'Back'),
      icon: <EyeIcon className="w-4 h-4" />
    },
    {
      key: 'side',
      label: t('3dPreview.views.side', 'Side'),
      icon: <EyeIcon className="w-4 h-4" />
    }
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* View preset buttons */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {viewButtons.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              currentView === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
            title={label}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Reset button */}
      {onReset && (
        <button
          onClick={onReset}
          className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          title={t('3dPreview.reset', 'Reset camera')}
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
} 