'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import MeasurementForm from '@/components/patterns/MeasurementForm';
import type { User } from '@supabase/supabase-js';

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

interface Profile {
  id: string;
  role: string;
  language_preference: string | null;
}

interface MeasurementsPageClientProps {
  user: User;
  profile: Profile | null;
}

export default function MeasurementsPageClient({ user, profile }: MeasurementsPageClientProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingMeasurements, setExistingMeasurements] = useState<MeasurementFormData | null>(null);

  // Charger les mesures existantes de l'utilisateur
  useEffect(() => {
    const loadExistingMeasurements = async () => {
      try {
        const response = await fetch(`/api/measurements/${user.id}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Prendre la mesure la plus récente
          const latest = data.data[0];
          setExistingMeasurements({
            measurements: {
              chest_bust_cm: latest.chest_bust_cm,
              back_neck_to_wrist_cm: latest.back_neck_to_wrist_cm,
              back_waist_length_cm: latest.back_waist_length_cm,
              cross_back_cm: latest.cross_back_cm,
              arm_length_to_underarm_cm: latest.arm_length_to_underarm_cm,
              upper_arm_cm: latest.upper_arm_cm,
              armhole_depth_cm: latest.armhole_depth_cm,
              waist_cm: latest.waist_cm,
              hip_cm: latest.hip_cm,
              head_circumference_cm: latest.head_circumference_cm,
              overall_garment_length_cm: latest.overall_garment_length_cm,
              shoulder_width_cm: latest.shoulder_width_cm,
              wrist_circumference_cm: latest.wrist_circumference_cm,
              leg_length_cm: latest.leg_length_cm,
              shoe_size: latest.shoe_size,
            },
            preferred_unit: latest.preferred_unit,
            demographic_category: latest.demographic_category,
            gender_category: latest.gender_category,
            garment_type: latest.garment_type,
            project_id: latest.project_id,
          });
        }
      } catch (error) {
        console.error('Failed to load existing measurements:', error);
        // Ne pas afficher d'erreur, c'est OK si il n'y a pas de mesures existantes
      }
    };

    loadExistingMeasurements();
  }, [user.id]);

  const handleSave = async (data: MeasurementFormData) => {
    try {
      const response = await fetch('/api/measurements/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save measurements');
      }

      return result;
    } catch (error) {
      console.error('Error saving measurements:', error);
      throw error;
    }
  };

  const handleSubmit = async (data: MeasurementFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await handleSave(data);
      
      // Redirection vers l'étape suivante (ou confirmation)
      // TODO: Adapter selon l'architecture du wizard
      router.push('/dashboard/patterns/new/finalization');
    } catch (error) {
      setError(error instanceof Error ? error.message : t('measurement_save_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/dashboard" className="hover:text-gray-700">
                Dashboard
              </a>
            </li>
            <li>
              <span aria-hidden="true">›</span>
            </li>
            <li>
              <a href="/dashboard/patterns/new" className="hover:text-gray-700">
                {t('patterns_new')}
              </a>
            </li>
            <li>
              <span aria-hidden="true">›</span>
            </li>
            <li className="text-gray-900 font-medium">
              {t('measurement_page_title')}
            </li>
          </ol>
        </nav>

        {/* En-tête de page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('measurement_page_title')}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {t('measurement_page_subtitle')}
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="flex items-center text-sm">
              <div className="flex items-center text-green-600">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  ✓
                </div>
                <span className="ml-2">{t('step_garment_type')}</span>
              </div>
              <div className="mx-4 h-0.5 w-8 bg-gray-300"></div>
              <div className="flex items-center text-green-600">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  ✓
                </div>
                <span className="ml-2">{t('step_configuration')}</span>
              </div>
              <div className="mx-4 h-0.5 w-8 bg-gray-300"></div>
              <div className="flex items-center text-blue-600">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  3
                </div>
                <span className="ml-2">{t('step_measurements')}</span>
              </div>
              <div className="mx-4 h-0.5 w-8 bg-gray-300"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                  4
                </div>
                <span className="ml-2">{t('step_finalization')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Affichage d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {t('error_occurred')}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire principal */}
        <MeasurementForm
          initialData={existingMeasurements || undefined}
          onSubmit={handleSubmit}
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
} 