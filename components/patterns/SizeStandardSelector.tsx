'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StandardMeasurements, SizeEquivalences } from '@/lib/types';
import RegionSelector from './RegionSelector';
import SizeGrid from './SizeGrid';
import SizeEquivalenceDisplay from './SizeEquivalenceDisplay';
import DemographicSelector from './DemographicSelector';

interface SizeStandardSelectorProps {
  onMeasurementsLoaded: (measurements: StandardMeasurements, standardInfo: {
    region: string;
    demographic: string;
    size: string;
    equivalences: SizeEquivalences;
  }) => void;
  className?: string;
}

export default function SizeStandardSelector({
  onMeasurementsLoaded,
  className = ''
}: SizeStandardSelectorProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  
  // État de sélection cascadée
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [availableDemographics, setAvailableDemographics] = useState<string[]>([]);
  const [selectedDemographic, setSelectedDemographic] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedEquivalences, setSelectedEquivalences] = useState<SizeEquivalences>({});
  
  // État des étapes de sélection
  const [currentStep, setCurrentStep] = useState<'region' | 'demographic' | 'size' | 'complete'>('region');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRegionSelect = (region: string, demographics: string[]) => {
    setSelectedRegion(region);
    setAvailableDemographics(demographics);
    setSelectedDemographic('');
    setSelectedSize('');
    setSelectedEquivalences({});
    setCurrentStep('demographic');
  };

  const handleDemographicSelect = (demographic: string) => {
    setSelectedDemographic(demographic);
    setSelectedSize('');
    setSelectedEquivalences({});
    setCurrentStep('size');
  };

  const handleSizeSelect = (size: string, measurements: StandardMeasurements) => {
    // Récupérer les équivalences depuis les données de SizeGrid
    // Pour l'instant, simulation basée sur les données de test
    let equivalences: SizeEquivalences = {};
    
    if (selectedRegion === 'europe' && selectedDemographic === 'adult_female') {
      const sizeEquivalences: Record<string, SizeEquivalences> = {
        'XS': { eu: '32-34', us: '2-4', uk: '6-8' },
        'S': { eu: '36-38', us: '6-8', uk: '10-12' },
        'M': { eu: '40-42', us: '10-12', uk: '14-16' },
        'L': { eu: '44-46', us: '14-16', uk: '18-20' }
      };
      equivalences = sizeEquivalences[size] || {};
    } else if (selectedRegion === 'europe' && selectedDemographic === 'baby') {
      const babyEquivalences: Record<string, SizeEquivalences> = {
        '0-3M': { eu: '56', us: 'NB', uk: '0-3M' },
        '3-6M': { eu: '62', us: '3M', uk: '3-6M' }
      };
      equivalences = babyEquivalences[size] || {};
    }

    setSelectedSize(size);
    setSelectedEquivalences(equivalences);
    setCurrentStep('complete');

    // Transmettre les données au composant parent
    onMeasurementsLoaded(measurements, {
      region: selectedRegion,
      demographic: selectedDemographic,
      size: size,
      equivalences: equivalences
    });
  };

  const handleReset = () => {
    setSelectedRegion('');
    setAvailableDemographics([]);
    setSelectedDemographic('');
    setSelectedSize('');
    setSelectedEquivalences({});
    setCurrentStep('region');
  };

  const convertDemographicFormat = (demo: string): 'baby' | 'child' | 'adult' => {
    if (demo === 'baby') return 'baby';
    if (demo === 'child') return 'child';
    return 'adult'; // adult_female et adult_male deviennent 'adult'
  };

  const convertGenderFormat = (demo: string): 'male' | 'female' | 'neutral' => {
    if (demo === 'adult_male') return 'male';
    if (demo === 'adult_female') return 'female';
    return 'neutral'; // child et baby
  };

  if (!isClient) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-96 ${className}`}>
        <div className="p-6">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-6 w-3/4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-300 rounded"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* En-tête */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('size_standards_selector_title')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('size_standards_selector_description')}
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep === 'region' ? 'text-blue-600' : selectedRegion ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'region' ? 'border-blue-600 bg-blue-50' :
                selectedRegion ? 'border-green-600 bg-green-50' : 'border-gray-300'
              }`}>
                {selectedRegion ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">1</span>
                )}
              </div>
              <span className="ml-2 text-sm font-medium">{t('size_standards_step_region')}</span>
            </div>

            <div className={`w-8 h-0.5 ${selectedRegion ? 'bg-green-600' : 'bg-gray-300'}`}></div>

            <div className={`flex items-center ${currentStep === 'demographic' ? 'text-blue-600' : selectedDemographic ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'demographic' ? 'border-blue-600 bg-blue-50' :
                selectedDemographic ? 'border-green-600 bg-green-50' : 'border-gray-300'
              }`}>
                {selectedDemographic ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">2</span>
                )}
              </div>
              <span className="ml-2 text-sm font-medium">{t('size_standards_step_demographic')}</span>
            </div>

            <div className={`w-8 h-0.5 ${selectedDemographic ? 'bg-green-600' : 'bg-gray-300'}`}></div>

            <div className={`flex items-center ${currentStep === 'size' ? 'text-blue-600' : selectedSize ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'size' || currentStep === 'complete' ? 'border-blue-600 bg-blue-50' :
                selectedSize ? 'border-green-600 bg-green-50' : 'border-gray-300'
              }`}>
                {selectedSize ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">3</span>
                )}
              </div>
              <span className="ml-2 text-sm font-medium">{t('size_standards_step_size')}</span>
            </div>
          </div>
        </div>

        {/* Étape 1: Sélection de région */}
        {currentStep === 'region' && (
          <RegionSelector
            selectedRegion={selectedRegion}
            onRegionSelect={handleRegionSelect}
            className="mb-6"
          />
        )}

        {/* Étape 2: Sélection de démographie */}
        {currentStep === 'demographic' && selectedRegion && (
          <div className="mb-6">
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-600">{t('size_standards_selected_region')}: </span>
              <span className="text-sm font-medium text-gray-900">{selectedRegion.toUpperCase()}</span>
            </div>
            
            <DemographicSelector
              selectedCategory={convertDemographicFormat(selectedDemographic)}
              selectedGender={convertGenderFormat(selectedDemographic)}
              onCategoryChange={(category) => {
                // Conversion de retour selon la catégorie
                if (category === 'baby') {
                  handleDemographicSelect('baby');
                } else if (category === 'child') {
                  handleDemographicSelect('child');
                } else {
                  // Adulte - utiliser female par défaut, peut être affiné plus tard
                  handleDemographicSelect('adult_female');
                }
              }}
              onGenderChange={(gender) => {
                if (convertDemographicFormat(selectedDemographic) === 'adult') {
                  const newDemo = gender === 'male' ? 'adult_male' : 'adult_female';
                  handleDemographicSelect(newDemo);
                }
              }}
            />
          </div>
        )}

        {/* Étape 3: Sélection de taille */}
        {currentStep === 'size' && selectedRegion && selectedDemographic && (
          <div className="mb-6">
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-600">{t('size_standards_selected_region')}: </span>
              <span className="text-sm font-medium text-gray-900">{selectedRegion.toUpperCase()}</span>
              <span className="text-sm text-gray-600 ml-4">{t('size_standards_selected_demographic')}: </span>
              <span className="text-sm font-medium text-gray-900">{selectedDemographic}</span>
            </div>
            
            <SizeGrid
              region={selectedRegion}
              demographic={selectedDemographic}
              selectedSize={selectedSize}
              onSizeSelect={handleSizeSelect}
            />
          </div>
        )}

        {/* Étape 4: Complète - Affichage des équivalences */}
        {currentStep === 'complete' && selectedSize && (
          <div className="mb-6">
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-green-900">
                  {t('size_standards_selection_complete')}: {selectedRegion.toUpperCase()} - {selectedDemographic} - {selectedSize}
                </span>
              </div>
            </div>

            <SizeEquivalenceDisplay
              equivalences={selectedEquivalences}
              selectedSize={selectedSize}
              className="mb-4"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          {selectedRegion && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('size_standards_reset_selection')}
            </button>
          )}
          
          {currentStep === 'complete' && (
            <div className="ml-auto">
              <div className="text-sm text-green-600 font-medium">
                {t('size_standards_measurements_loaded')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 