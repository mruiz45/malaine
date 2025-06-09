'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import MeasurementField from './MeasurementField';
import UnitToggle from './UnitToggle';
import DemographicSelector from './DemographicSelector';

interface MeasurementData {
  chest_bust_cm?: number;
  back_neck_to_wrist_cm?: number;
  back_waist_length_cm?: number;
  cross_back_cm?: number;
  arm_length_to_underarm_cm?: number;
  upper_arm_cm?: number;
  armhole_depth_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  head_circumference_cm?: number;
  overall_garment_length_cm?: number;
  shoulder_width_cm?: number;
  wrist_circumference_cm?: number;
  leg_length_cm?: number;
  shoe_size?: string;
}

interface MeasurementFormData {
  measurements: MeasurementData;
  preferred_unit: 'cm' | 'inches';
  demographic_category: 'baby' | 'child' | 'adult';
  gender_category: 'male' | 'female' | 'neutral';
  garment_type?: string;
  project_id?: string;
}

interface MeasurementFormProps {
  initialData?: Partial<MeasurementFormData>;
  onSubmit: (data: MeasurementFormData) => Promise<void>;
  onSave?: (data: MeasurementFormData) => Promise<void>; // Sauvegarde progressive
  isSubmitting?: boolean;
  className?: string;
}

export default function MeasurementForm({
  initialData,
  onSubmit,
  onSave,
  isSubmitting = false,
  className = ''
}: MeasurementFormProps) {
  const { t } = useTranslation();
  
  // Définition des 15 mesures selon l'US - maintenant avec les clés de traduction
  const measurementFields = [
    // Section Torse
    {
      id: 'chest_bust_cm',
      label: t('measurement_chest_bust'),
      description: t('measurement_chest_bust_help'),
      type: 'numeric' as const,
      isRequired: true,
      section: t('measurement_section_torso')
    },
    {
      id: 'back_neck_to_wrist_cm',
      label: t('measurement_back_neck_to_wrist'),
      description: t('measurement_back_neck_to_wrist_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_torso')
    },
    {
      id: 'back_waist_length_cm',
      label: t('measurement_back_waist_length'),
      description: t('measurement_back_waist_length_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_torso')
    },
    {
      id: 'cross_back_cm',
      label: t('measurement_cross_back'),
      description: t('measurement_cross_back_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_torso')
    },
    {
      id: 'waist_cm',
      label: t('measurement_waist'),
      description: t('measurement_waist_help'),
      type: 'numeric' as const,
      isRequired: true,
      section: t('measurement_section_torso')
    },
    {
      id: 'hip_cm',
      label: t('measurement_hip'),
      description: t('measurement_hip_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_torso')
    },
    
    // Section Bras
    {
      id: 'arm_length_to_underarm_cm',
      label: t('measurement_arm_length_to_underarm'),
      description: t('measurement_arm_length_to_underarm_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_arms')
    },
    {
      id: 'upper_arm_cm',
      label: t('measurement_upper_arm'),
      description: t('measurement_upper_arm_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_arms')
    },
    {
      id: 'armhole_depth_cm',
      label: t('measurement_armhole_depth'),
      description: t('measurement_armhole_depth_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_arms')
    },
    {
      id: 'wrist_circumference_cm',
      label: t('measurement_wrist_circumference'),
      description: t('measurement_wrist_circumference_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_arms')
    },
    
    // Section Autres
    {
      id: 'head_circumference_cm',
      label: t('measurement_head_circumference'),
      description: t('measurement_head_circumference_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_other')
    },
    {
      id: 'overall_garment_length_cm',
      label: t('measurement_overall_garment_length'),
      description: t('measurement_overall_garment_length_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_other')
    },
    {
      id: 'shoulder_width_cm',
      label: t('measurement_shoulder_width'),
      description: t('measurement_shoulder_width_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_other')
    },
    {
      id: 'leg_length_cm',
      label: t('measurement_leg_length'),
      description: t('measurement_leg_length_help'),
      type: 'numeric' as const,
      isRequired: false,
      section: t('measurement_section_other')
    },
    {
      id: 'shoe_size',
      label: t('measurement_shoe_size'),
      description: t('measurement_shoe_size_help'),
      type: 'text' as const,
      isRequired: false,
      section: t('measurement_section_other')
    },
  ];

  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState<MeasurementFormData>({
    measurements: {},
    preferred_unit: 'cm',
    demographic_category: 'adult',
    gender_category: 'neutral',
    ...initialData
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Restauration depuis localStorage si disponible
    const savedData = localStorage.getItem('measurement_form_data');
    if (savedData && !initialData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error restoring saved data:', error);
      }
    }
  }, [initialData]);

  // Sauvegarde progressive automatique
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Sauvegarde locale aussi
      localStorage.setItem('measurement_form_data', JSON.stringify(formData));
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, hasUnsavedChanges, onSave]);

  // Déclencher auto-save après 2 secondes d'inactivité
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [autoSave, hasUnsavedChanges]);

  const updateMeasurement = (fieldId: string, value: number | string | undefined) => {
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [fieldId]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const updateValidation = (fieldId: string, isValid: boolean, errors: string[]) => {
    setValidationErrors(prev => ({
      ...prev,
      [fieldId]: isValid ? [] : errors
    }));
  };

  const handleUnitChange = (unit: 'cm' | 'inches') => {
    setFormData(prev => ({ ...prev, preferred_unit: unit }));
    setHasUnsavedChanges(true);
  };

  const handleDemographicChange = (category: 'baby' | 'child' | 'adult') => {
    setFormData(prev => ({ ...prev, demographic_category: category }));
    setHasUnsavedChanges(true);
  };

  const handleGenderChange = (gender: 'male' | 'female' | 'neutral') => {
    setFormData(prev => ({ ...prev, gender_category: gender }));
    setHasUnsavedChanges(true);
  };

  const isFormValid = () => {
    const hasErrors = Object.values(validationErrors).some(errors => errors.length > 0);
    const hasRequiredFields = measurementFields
      .filter(field => field.isRequired)
      .every(field => {
        const value = formData.measurements[field.id as keyof MeasurementData];
        return value !== undefined && value !== null && value !== '';
      });
    
    return !hasErrors && hasRequiredFields;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    await onSubmit(formData);
    
    // Nettoyer la sauvegarde locale après soumission réussie
    localStorage.removeItem('measurement_form_data');
  };

  const getCompletionProgress = () => {
    const requiredFields = measurementFields.filter(field => field.isRequired);
    const completedRequired = requiredFields.filter(field => 
      formData.measurements[field.id as keyof MeasurementData] !== undefined &&
      formData.measurements[field.id as keyof MeasurementData] !== null &&
      formData.measurements[field.id as keyof MeasurementData] !== ''
    ).length;
    
    return {
      progress: Math.round((completedRequired / requiredFields.length) * 100),
      completed: completedRequired,
      required: requiredFields.length
    };
  };

  const getSectionFields = (sectionName: string) => {
    return measurementFields.filter(field => field.section === sectionName);
  };

  const getUniqueSections = () => {
    return [...new Set(measurementFields.map(field => field.section))];
  };

  if (!isClient) {
    return <div className={`animate-pulse bg-gray-200 rounded-lg h-96 ${className}`}></div>;
  }

  const progressData = getCompletionProgress();

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        {/* En-tête du formulaire */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('measurement_form_title')}
            </h2>
            <UnitToggle
              selectedUnit={formData.preferred_unit}
              onUnitChange={handleUnitChange}
            />
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            {t('measurement_progress', { 
              progress: progressData.progress, 
              required: progressData.required 
            })}
          </div>
          
          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressData.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Sélecteurs démographiques */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('measurement_general_info')}
          </h3>
                     <DemographicSelector
             selectedCategory={formData.demographic_category}
             selectedGender={formData.gender_category}
             onCategoryChange={handleDemographicChange}
             onGenderChange={handleGenderChange}
           />
        </div>

        {/* Sections de mesures */}
        {getUniqueSections().map((sectionName) => (
          <div key={sectionName} className="mb-8 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {sectionName}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getSectionFields(sectionName).map((field) => (
                                 <MeasurementField
                   key={field.id}
                   id={field.id}
                   label={field.label}
                   description={field.description}
                   type={field.type}
                   isRequired={field.isRequired}
                   value={formData.measurements[field.id as keyof MeasurementData]}
                   unit={formData.preferred_unit}
                   onChange={(value) => updateMeasurement(field.id, value)}
                   onValidation={(isValid: boolean, errors: string[]) => updateValidation(field.id, isValid, errors)}
                 />
              ))}
            </div>
          </div>
        ))}

        {/* Indicateur de sauvegarde */}
        <div className="mb-6">
          {isSaving && (
            <div className="text-sm text-blue-600 flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('measurement_saving')}
            </div>
          )}
          
          {hasUnsavedChanges && !isSaving && (
            <div className="text-sm text-amber-600">
              {t('measurement_unsaved_changes')}
            </div>
          )}
          
          {lastSaved && !hasUnsavedChanges && !isSaving && (
            <div className="text-sm text-green-600">
              {t('measurement_saved_at', { time: lastSaved.toLocaleTimeString() })}
            </div>
          )}
        </div>

        {/* Messages d'information */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            {t('measurement_auto_saved')}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('measurement_previous_step')}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid()}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('measurement_saving') : t('measurement_continue')}
          </button>
        </div>

        {/* Message d'erreur si le formulaire n'est pas valide */}
        {!isFormValid() && Object.keys(validationErrors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              {t('measurement_fix_errors')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 