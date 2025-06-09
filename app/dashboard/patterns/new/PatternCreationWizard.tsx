'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { PatternCreationProvider } from '@/lib/contexts/PatternCreationContext';
import GarmentTypeSelector from '@/components/patterns/GarmentTypeSelector';

type GarmentType = Database['public']['Tables']['garment_types']['Row'];

interface PatternCreationWizardProps {
  initialGarmentTypes: GarmentType[];
}

function PatternCreationWizardContent({ initialGarmentTypes }: PatternCreationWizardProps) {
  const router = useRouter();

  const handleContinue = () => {
    // Navigation vers l'étape suivante (saisie des mensurations)
    router.push('/dashboard/patterns/new/measurements');
  };

  return (
    <GarmentTypeSelector
      types={initialGarmentTypes}
      onContinue={handleContinue}
    />
  );
}

export default function PatternCreationWizard({ initialGarmentTypes }: PatternCreationWizardProps) {
  return (
    <PatternCreationProvider>
      <PatternCreationWizardContent initialGarmentTypes={initialGarmentTypes} />
    </PatternCreationProvider>
  );
} 