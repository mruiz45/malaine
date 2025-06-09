'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Database } from '@/lib/database.types';
import GarmentTypeCard from './GarmentTypeCard';
import CategoryFilter from './CategoryFilter';
import SectionToggle from './SectionToggle';
import { usePatternCreation } from '@/lib/contexts/PatternCreationContext';
import { getTranslatedGarmentName, getTranslatedGarmentDesc } from '@/lib/garmentTranslations';

type GarmentType = Database['public']['Tables']['garment_types']['Row'];

interface GarmentTypeSelectorProps {
  types: GarmentType[];
  onContinue: () => void;
}

export default function GarmentTypeSelector({ types, onContinue }: GarmentTypeSelectorProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'clothing' | 'accessories' | 'bedding'>('all');
  const { state, setSelectedGarmentType, setSelectedSection } = usePatternCreation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filtrage des types selon la section sélectionnée dans le contexte
  const sectionFilteredTypes = useMemo(() => {
    console.log('🔍 GarmentTypeSelector DEBUG:', {
      selectedSection: state.selectedSection,
      totalTypes: types.length,
      typesHaveSection: types.length > 0 ? !!types[0].section : false,
      sectionCounts: types.reduce((acc, type) => {
        acc[type.section || 'undefined'] = (acc[type.section || 'undefined'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });
    
    const filtered = types.filter(type => type.section === state.selectedSection);
    console.log('🎯 Filtered result:', {
      filteredCount: filtered.length,
      filteredKeys: filtered.map(t => t.type_key)
    });
    
    return filtered;
  }, [types, state.selectedSection]);

  // Filtrage des types selon la catégorie sélectionnée
  const filteredTypes = useMemo(() => {
    if (selectedCategory === 'all') {
      return sectionFilteredTypes;
    }
    return sectionFilteredTypes.filter(type => type.category === selectedCategory);
  }, [sectionFilteredTypes, selectedCategory]);

  // Compteurs pour les filtres - basés sur les types de la section sélectionnée
  const itemCounts = useMemo(() => {
    const clothing = sectionFilteredTypes.filter(type => type.category === 'clothing').length;
    const accessories = sectionFilteredTypes.filter(type => type.category === 'accessories').length;
    const bedding = sectionFilteredTypes.filter(type => type.category === 'bedding').length;
    return {
      all: sectionFilteredTypes.length,
      clothing,
      accessories,
      bedding: bedding > 0 ? bedding : undefined
    };
  }, [sectionFilteredTypes]);

  const handleSectionChange = (section: 'baby' | 'general') => {
    setSelectedSection(section);
    // Reset du filtre de catégorie quand on change de section
    setSelectedCategory('all');
  };

  const handleTypeSelect = (type: GarmentType) => {
    setSelectedGarmentType(type);
  };

  const handleContinue = () => {
    if (state.selectedGarmentType) {
      onContinue();
    }
  };

  const getSelectedGarmentName = () => {
    if (!state.selectedGarmentType || !isClient) return state.selectedGarmentType?.type_key || '';
    return getTranslatedGarmentName(state.selectedGarmentType, t);
  };

  const getSelectedGarmentDescription = () => {
    if (!state.selectedGarmentType || !isClient) {
      return t('garment_default_description');
    }
    return getTranslatedGarmentDesc(state.selectedGarmentType, t);
  };

  const getCategoryText = () => {
    if (!state.selectedGarmentType || !isClient) {
      return state.selectedGarmentType?.category === 'clothing' ? 'Vêtement' : 'Accessoire';
    }
    return state.selectedGarmentType.category === 'clothing' ? t('garment_type_clothing') : t('garment_type_accessory');
  };

  if (!isClient) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6"></div>
        <div className="h-12 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Titre de section */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t('pattern_wizard_title')}
      </h2>

      {/* Toggle de section */}
      <SectionToggle
        selectedSection={state.selectedSection}
        onSectionChange={handleSectionChange}
      />

      {/* Filtres de catégorie */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        itemCounts={itemCounts}
      />

      {/* Message si aucun type */}
      {filteredTypes.length === 0 ? (
        <div className="text-center py-12">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8L12 1 5 5v8"></path>
          </svg>
          <p className="text-gray-500">
            {t('pattern_wizard_no_types')}
          </p>
        </div>
      ) : (
        <>
          {/* Grille de sélection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredTypes.map((type) => (
              <GarmentTypeCard
                key={type.id}
                type={type}
                selected={state.selectedGarmentType?.id === type.id}
                onClick={handleTypeSelect}
              />
            ))}
          </div>

          {/* Panel de description */}
          {state.selectedGarmentType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    {getSelectedGarmentName()}
                  </h3>
                  <p className="text-blue-700 mb-4">
                    {getSelectedGarmentDescription()}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <span className="inline-flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {getCategoryText()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bouton Continuer */}
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!state.selectedGarmentType}
              className={`
                px-6 py-3 rounded-lg font-medium transition-colors
                ${state.selectedGarmentType
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {t('pattern_wizard_continue')}
            </button>
          </div>
        </>
      )}
    </div>
  );
} 