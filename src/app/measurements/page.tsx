'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MeasurementSet } from '@/types/measurements';
import { 
  MeasurementSetList, 
  MeasurementSetForm 
} from '@/components/measurements';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

/**
 * Measurements page - Main page for managing measurement sets
 * Corresponds to User Story 1.2 - User Measurements (Mensurations) Input and Management
 */
export default function MeasurementsPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedMeasurementSet, setSelectedMeasurementSet] = useState<MeasurementSet | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle navigation between views
  const handleCreateNew = () => {
    setSelectedMeasurementSet(null);
    setViewMode('create');
  };

  const handleEdit = (measurementSet: MeasurementSet) => {
    setSelectedMeasurementSet(measurementSet);
    setViewMode('edit');
  };

  const handleView = (measurementSet: MeasurementSet) => {
    setSelectedMeasurementSet(measurementSet);
    setViewMode('view');
  };

  const handleBackToList = () => {
    setSelectedMeasurementSet(null);
    setViewMode('list');
  };

  const handleSuccess = (measurementSet: MeasurementSet) => {
    // Refresh the list and go back to list view
    setRefreshTrigger(prev => prev + 1);
    handleBackToList();
  };

  const renderViewModeContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <MeasurementSetForm
            onSuccess={handleSuccess}
            onCancel={handleBackToList}
          />
        );

      case 'edit':
        return (
          <MeasurementSetForm
            measurementSet={selectedMeasurementSet || undefined}
            onSuccess={handleSuccess}
            onCancel={handleBackToList}
          />
        );

      case 'view':
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedMeasurementSet?.set_name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {t('measurements.form.measurement_unit')}: {selectedMeasurementSet?.measurement_unit === 'cm' ? t('measurements.view.unit_cm') : t('measurements.view.unit_inch')}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => selectedMeasurementSet && handleEdit(selectedMeasurementSet)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {t('measurements.edit_button')}
                </button>
                <button
                  onClick={handleBackToList}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {t('measurements.view.back_to_list')}
                </button>
              </div>
            </div>

            {/* Display all measurements */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {selectedMeasurementSet?.chest_circumference && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.chest_circumference')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.chest_circumference} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
              {selectedMeasurementSet?.waist_circumference && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.waist_circumference')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.waist_circumference} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
              {selectedMeasurementSet?.hip_circumference && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.hip_circumference')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.hip_circumference} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
              {selectedMeasurementSet?.shoulder_width && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.shoulder_width')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.shoulder_width} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
              {selectedMeasurementSet?.arm_length && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.arm_length')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.arm_length} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
              {selectedMeasurementSet?.inseam_length && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.inseam_length')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.inseam_length} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
              {selectedMeasurementSet?.torso_length && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.torso_length')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.torso_length} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
              {selectedMeasurementSet?.head_circumference && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.head_circumference')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.head_circumference} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
              {selectedMeasurementSet?.neck_circumference && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.neck_circumference')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.neck_circumference} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
              {selectedMeasurementSet?.wrist_circumference && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.wrist_circumference')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.wrist_circumference} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
              {selectedMeasurementSet?.ankle_circumference && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.ankle_circumference')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.ankle_circumference} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
              {selectedMeasurementSet?.foot_length && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">{t('measurements.fields.foot_length')}</div>
                  <div className="text-lg font-semibold">
                    {selectedMeasurementSet.foot_length} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </div>
                </div>
              )}
            </div>

            {/* Custom measurements */}
            {selectedMeasurementSet?.custom_measurements && Object.keys(selectedMeasurementSet.custom_measurements).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('measurements.view.custom_measurements_title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selectedMeasurementSet.custom_measurements).map(([key, value]) => (
                    <div key={key} className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-600">{key}</div>
                      <div className="text-lg font-semibold">
                        {value} {selectedMeasurementSet.measurement_unit === 'cm' ? 'cm' : 'in'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedMeasurementSet?.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('measurements.view.notes_title')}</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedMeasurementSet.notes}</p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t pt-4 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>{t('measurements.view.created')}: {selectedMeasurementSet && new Date(selectedMeasurementSet.created_at).toLocaleDateString()}</span>
                {selectedMeasurementSet && selectedMeasurementSet.updated_at !== selectedMeasurementSet.created_at && (
                  <span>{t('measurements.view.updated')}: {new Date(selectedMeasurementSet.updated_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'list':
      default:
        return (
          <MeasurementSetList
            onEdit={handleEdit}
            onView={handleView}
            onCreateNew={handleCreateNew}
            refreshTrigger={refreshTrigger}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <button
                onClick={handleBackToList}
                className="hover:text-gray-700"
              >
                {t('measurements.breadcrumb.measurements')}
              </button>
            </li>
            {viewMode !== 'list' && (
              <>
                <li>/</li>
                <li className="text-gray-900">
                  {viewMode === 'create' && t('measurements.breadcrumb.create_new')}
                  {viewMode === 'edit' && t('measurements.breadcrumb.edit')}
                  {viewMode === 'view' && selectedMeasurementSet?.set_name}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Main content */}
        {renderViewModeContent()}
      </div>
    </div>
  );
} 