'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Database } from '@/lib/database.types';

type GarmentType = Database['public']['Tables']['garment_types']['Row'];

interface PatternCreationState {
  selectedGarmentType: GarmentType | null;
  selectedParts: string[]; // Ajout pour US_002 - liste des part_key sélectionnées
  selectedSection: 'baby' | 'general'; // Ajout pour US_003 - section sélectionnée
  // Futures étapes du wizard seront ajoutées ici
  // selectedMeasurements: MeasurementSet | null;
  // selectedGaugeProfile: GaugeProfile | null;
  // etc.
}

interface PatternCreationContextType {
  state: PatternCreationState;
  setSelectedGarmentType: (type: GarmentType | null) => void;
  setSelectedParts: (parts: string[]) => void; // Ajout pour US_002
  setSelectedSection: (section: 'baby' | 'general') => void; // Ajout pour US_003
  resetWizard: () => void;
}

const PatternCreationContext = createContext<PatternCreationContextType | undefined>(undefined);

const initialState: PatternCreationState = {
  selectedGarmentType: null,
  selectedParts: [], // Initialisation pour US_002
  selectedSection: 'general', // Défaut sur "Enfant / Adulte" selon US_003
};

export function PatternCreationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PatternCreationState>(initialState);

  const setSelectedGarmentType = useCallback((type: GarmentType | null) => {
    setState(prev => ({
      ...prev,
      selectedGarmentType: type
    }));
  }, []);

  const setSelectedParts = useCallback((parts: string[]) => {
    setState(prev => ({
      ...prev,
      selectedParts: parts
    }));
  }, []);

  const setSelectedSection = useCallback((section: 'baby' | 'general') => {
    setState(prev => ({
      ...prev,
      selectedSection: section,
      // Reset du type sélectionné car les types changent selon la section
      selectedGarmentType: null
    }));
  }, []);

  const resetWizard = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <PatternCreationContext.Provider value={{
      state,
      setSelectedGarmentType,
      setSelectedParts,
      setSelectedSection,
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