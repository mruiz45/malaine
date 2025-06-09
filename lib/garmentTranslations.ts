import { Database } from './database.types';

type GarmentType = Database['public']['Tables']['garment_types']['Row'];

// Fonction pour obtenir la clé de traduction du nom basée sur type_key
export function getGarmentNameKey(typeKey: string): string {
  return `garment_${typeKey}_name`;
}

// Fonction pour obtenir la clé de traduction de la description basée sur type_key
export function getGarmentDescKey(typeKey: string): string {
  return `garment_${typeKey}_desc`;
}

// Fonction pour obtenir le nom traduit d'un vêtement
export function getTranslatedGarmentName(garmentType: GarmentType, t: (key: string) => string): string {
  const nameKey = getGarmentNameKey(garmentType.type_key);
  return t(nameKey);
}

// Fonction pour obtenir la description traduite d'un vêtement
export function getTranslatedGarmentDesc(garmentType: GarmentType, t: (key: string) => string): string {
  const descKey = getGarmentDescKey(garmentType.type_key);
  return t(descKey);
} 