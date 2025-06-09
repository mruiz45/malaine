'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Database } from '@/lib/database.types';
import { usePatternCreation } from '@/lib/contexts/PatternCreationContext';
import GarmentPartCard from './GarmentPartCard';

type GarmentType = Database['public']['Tables']['garment_types']['Row'];

interface GarmentPartConfig {
  part_key: string;
  is_obligatory: boolean;
  display_order: number;
  technical_impact: string[];
  measurement_requirements: string[];
}

interface PartDependency {
  parent_part_key: string;
  dependent_part_key: string;
  activation_condition: string;
}

interface GarmentPartConfiguration {
  type_key: string;
  obligatory_parts: GarmentPartConfig[];
  optional_parts: GarmentPartConfig[];
  dependencies: PartDependency[];
}

interface GarmentPartConfiguratorProps {
  selectedType: GarmentType;
  onContinue: () => void;
}

export default function GarmentPartConfigurator({ selectedType, onContinue }: GarmentPartConfiguratorProps) {
  const { t } = useTranslation();
  const { setSelectedParts } = usePatternCreation();
  
  const [configuration, setConfiguration] = useState<GarmentPartConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartKeys, setSelectedPartKeys] = useState<string[]>([]);

  // Chargement de la configuration depuis l'API
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/garment-parts/configuration?type_key=${selectedType.type_key}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to load configuration');
        }

        setConfiguration(result.data);
        
        // Initialiser la sélection avec toutes les parties obligatoires
        const obligatoryParts = result.data.obligatory_parts.map((part: GarmentPartConfig) => part.part_key);
        setSelectedPartKeys(obligatoryParts);
        setSelectedParts(obligatoryParts);

      } catch (err) {
        console.error('Error loading part configuration:', err);
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };

    if (selectedType.type_key && !configuration) {
      loadConfiguration();
    }
  }, [selectedType.type_key, setSelectedParts, configuration]);

  // Gestion des dépendances entre parties
  const getDependentParts = useCallback((partKey: string): string[] => {
    if (!configuration) return [];
    
    return configuration.dependencies
      .filter(dep => dep.parent_part_key === partKey)
      .map(dep => dep.dependent_part_key);
  }, [configuration]);

  const getParentParts = useCallback((partKey: string): string[] => {
    if (!configuration) return [];
    
    return configuration.dependencies
      .filter(dep => dep.dependent_part_key === partKey)
      .map(dep => dep.parent_part_key);
  }, [configuration]);

  // Vérifier si une partie peut être désactivée (pas de dépendants actifs)
  const canDeactivatePart = useCallback((partKey: string): boolean => {
    const dependentParts = getDependentParts(partKey);
    return !dependentParts.some(depPart => selectedPartKeys.includes(depPart));
  }, [getDependentParts, selectedPartKeys]);

  // Gestion du toggle des parties optionnelles
  const handlePartToggle = useCallback((partKey: string) => {
    const isCurrentlySelected = selectedPartKeys.includes(partKey);
    
    let newSelection: string[];
    
    if (isCurrentlySelected) {
      // Désactivation : retirer la partie et tous ses dépendants
      if (!canDeactivatePart(partKey)) {
        return; // Ne peut pas désactiver si des dépendants sont actifs
      }
      
      const dependentParts = getDependentParts(partKey);
      const toRemove = [partKey, ...dependentParts];
      newSelection = selectedPartKeys.filter(key => !toRemove.includes(key));
      
    } else {
      // Activation : ajouter la partie et ses parents requis
      const parentParts = getParentParts(partKey);
      const requiredParents = parentParts.filter(parentKey => !selectedPartKeys.includes(parentKey));
      newSelection = [...selectedPartKeys, partKey, ...requiredParents];
    }

    setSelectedPartKeys(newSelection);
    setSelectedParts(newSelection);
  }, [selectedPartKeys, canDeactivatePart, getDependentParts, getParentParts, setSelectedParts]);

  // Vérifier si une partie est désactivée (dépend d'une partie non sélectionnée)
  const isPartDisabled = useCallback((partKey: string): boolean => {
    const parentParts = getParentParts(partKey);
    return parentParts.some(parentKey => !selectedPartKeys.includes(parentKey));
  }, [getParentParts, selectedPartKeys]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {t('part_config_error_title')}
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('part_config_retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!configuration) {
    return null;
  }

      return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {t('part_config_title')}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {t('part_config_description')}
        </p>
      </div>

      {/* Parties obligatoires */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-3"></span>
          {t('part_config_obligatory_title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configuration.obligatory_parts.map((part) => (
            <GarmentPartCard
              key={part.part_key}
              partKey={part.part_key}
              isObligatory={true}
              isSelected={true}
              isDisabled={false}
            />
          ))}
        </div>
      </div>

      {/* Parties optionnelles */}
      {configuration.optional_parts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            {t('part_config_optional_title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configuration.optional_parts.map((part) => (
              <GarmentPartCard
                key={part.part_key}
                partKey={part.part_key}
                isObligatory={false}
                isSelected={selectedPartKeys.includes(part.part_key)}
                isDisabled={isPartDisabled(part.part_key)}
                onToggle={handlePartToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Résumé de sélection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">
          {t('part_config_summary_title')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-blue-800">
              {t('part_config_summary_obligatory')}:
            </span>
            <span className="ml-2 text-blue-700">
              {configuration.obligatory_parts.length}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-blue-800">
              {t('part_config_summary_optional')}:
            </span>
            <span className="ml-2 text-blue-700">
              {configuration.optional_parts.filter(part => selectedPartKeys.includes(part.part_key)).length}/{configuration.optional_parts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Bouton continuer */}
      <div className="flex justify-end">
        <button
          onClick={onContinue}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t('part_config_continue')}
        </button>
      </div>
    </div>
  );
} 