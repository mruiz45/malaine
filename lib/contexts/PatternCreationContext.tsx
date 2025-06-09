'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Database } from '@/lib/database.types';

type GarmentType = Database['public']['Tables']['garment_types']['Row'];

interface PatternCreationState {
  selectedGarmentType: GarmentType | null;
  // Futures étapes du wizard seront ajoutées ici
  // selectedMeasurements: MeasurementSet | null;
  // selectedGaugeProfile: GaugeProfile | null;
  // etc.
}

interface PatternCreationContextType {
  state: PatternCreationState;
  setSelectedGarmentType: (type: GarmentType | null) => void;
  resetWizard: () => void;
}

const PatternCreationContext = createContext<PatternCreationContextType | undefined>(undefined);

const initialState: PatternCreationState = {
  selectedGarmentType: null,
};

export function PatternCreationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PatternCreationState>(initialState);

  const setSelectedGarmentType = (type: GarmentType | null) => {
    setState(prev => ({
      ...prev,
      selectedGarmentType: type
    }));
  };

  const resetWizard = () => {
    setState(initialState);
  };

  return (
    <PatternCreationContext.Provider value={{
      state,
      setSelectedGarmentType,
      resetWizard
    }}>
      {children}
    </PatternCreationContext.Provider>
  );
}

export function usePatternCreation() {
  const context = useContext(PatternCreationContext);
  if (context === undefined) {
    throw new Error('usePatternCreation must be used within a PatternCreationProvider');
  }
  return context;
} 