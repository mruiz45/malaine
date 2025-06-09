'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { PatternCreationProvider, usePatternCreation } from '@/lib/contexts/PatternCreationContext';
import GarmentTypeSelector from '@/components/patterns/GarmentTypeSelector';

type GarmentType = Database['public']['Tables']['garment_types']['Row'];

interface PatternCreationWizardProps {
  initialGarmentTypes: GarmentType[];
}

function PatternCreationWizardContent({ initialGarmentTypes }: PatternCreationWizardProps) {
  const router = useRouter();
  const { state } = usePatternCreation();

  const handleContinue = () => {
    // Navigation vers l'étape suivante (configuration des parties) avec le type dans l'URL
    if (state.selectedGarmentType) {
      router.push(`/dashboard/patterns/new/parts?type=${state.selectedGarmentType.type_key}`);
    }
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