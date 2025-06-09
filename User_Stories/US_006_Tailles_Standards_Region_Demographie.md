# User Story US_006: Sélection de Tailles Standards par Région et Démographie

## 📋 METADATA
- **Story ID**: US_006
- **Epic**: Collecte des données utilisateur pour génération de patrons
- **Priority**: Medium
- **Estimated Effort**: L (1-2j)
- **Dependencies**: US_005

## USER STORY STATEMENT
**As a** utilisateur souhaitant créer un patron sans prendre de mesures manuelles  
**I want** sélectionner des tailles standards selon la région et la démographie  
**So that** je puisse partir d'une base cohérente basée sur les standards internationaux du tricot

## CONTEXT & BACKGROUND
Cette fonctionnalité suit l'implémentation de US_005 et offre une alternative à la saisie manuelle des mensurations corporelles. Elle permet aux utilisateurs de sélectionner des tailles standards basées sur les références officielles du Craft Yarn Council et les systèmes de mesure internationaux. Cette approche est particulièrement utile lorsqu'on tricote pour autrui sans disposer de mesures exactes, ou lorsqu'on souhaite partir d'une base standardisée avant de faire des ajustements personnalisés.

Le système propose des tableaux de correspondance complets couvrant quatre régions principales (Europe, États-Unis, Royaume-Uni, Asie) et quatre démographies (Adulte Femme, Adulte Homme, Enfant 2-16 ans, Bébé 0-24 mois). Chaque combinaison région/démographie offre une gamme complète de tailles (XS à XXL pour adultes, tailles numériques pour enfants) avec toutes les 15 mesures corporelles standards de l'application.

L'interface guide l'utilisateur à travers des sélecteurs cascadés et affiche les équivalences entre systèmes. Un avertissement clair informe sur l'approximation inhérente aux tailles standards et encourage la prise de mesures personnalisées pour un ajustement optimal.

## ACCEPTANCE CRITERIA ✅

**Scenario 1: Sélection cascadée complète d'une taille standard**
- **GIVEN** un utilisateur sur l'interface de saisie des mensurations
- **WHEN** il clique sur "Utiliser une taille standard" au lieu de saisir manuellement
- **THEN** des sélecteurs cascadés apparaissent : Région → Démographie → Taille
- **AND** chaque sélection filtre dynamiquement les options suivantes
- **AND** la sélection finale charge automatiquement les 15 mesures corporelles correspondantes

**Scenario 2: Affichage des équivalences entre systèmes**
- **GIVEN** un utilisateur ayant sélectionné "Europe" comme région et "Adulte Femme" comme démographie
- **WHEN** il sélectionne la taille "M"
- **THEN** le système affiche les équivalences : EU 38-40, US 8-10, UK 12-14
- **AND** toutes les mesures sont affichées avec les valeurs en cm et en pouces
- **AND** un tableau de correspondance complet est accessible en un clic

**Scenario 3: Adaptation automatique selon le type de vêtement**
- **GIVEN** un utilisateur créant un patron de chaussons bébé
- **WHEN** il sélectionne une taille standard "Bébé 12 mois"
- **THEN** seules les mesures pertinentes pour des chaussons sont préremplies (pointure, tour de cheville, longueur de jambe)
- **AND** les mesures non pertinentes restent optionnelles ou masquées
- **AND** un message explique l'adaptation selon le type de vêtement

**Scenario 4: Possibilité de surcharger les valeurs standards**
- **GIVEN** un utilisateur ayant chargé une taille standard "Adulte Femme EU M"
- **WHEN** il modifie manuellement le tour de poitrine de 94cm à 98cm
- **THEN** la valeur modifiée remplace la valeur standard
- **AND** un indicateur visuel montre que cette mesure a été personnalisée
- **AND** les autres mesures restent aux valeurs standards sauf modification manuelle

**Scenario 5: Avertissement sur l'approximation des tailles standards**
- **GIVEN** un utilisateur sélectionnant des tailles standards
- **WHEN** il valide son choix de taille
- **THEN** un avertissement s'affiche : "Les tailles standards sont des approximations. Pour un ajustement optimal, nous recommandons la prise de mesures personnalisées."
- **AND** des options "Continuer avec les standards" et "Prendre mes mesures" sont proposées
- **AND** l'avertissement est enregistré pour ne plus apparaître si l'utilisateur choisit "Ne plus afficher"

**Scenario 6: Tableaux complets pour toutes les combinaisons**
- **GIVEN** l'interface de sélection de tailles standards
- **WHEN** l'utilisateur explore différentes combinaisons région/démographie
- **THEN** chaque combinaison offre une gamme complète de tailles disponibles
- **AND** toutes les mesures sont disponibles pour chaque taille proposée
- **AND** aucune combinaison ne génère d'erreur ou de données manquantes

## FUNCTIONAL REQUIREMENTS 📝

### UI Requirements
**Page/Component Location**: /dashboard/patterns/new/measurements (extension de l'interface US_005)

**Visual Elements**:
- [ ] **Toggle "Tailles Standards"** : Bouton pour basculer entre saisie manuelle et tailles standards
- [ ] **Sélecteur Région** : Dropdown avec 4 options (Europe, États-Unis, Royaume-Uni, Asie) et drapeaux
- [ ] **Sélecteur Démographie** : Cards cliquables avec icônes (Adulte Femme, Adulte Homme, Enfant, Bébé)
- [ ] **Sélecteur Taille** : Grille de boutons avec tailles disponibles selon la région/démographie sélectionnée
- [ ] **Aperçu des mesures** : Tableau compact montrant les 15 mesures avec valeurs cm/pouces
- [ ] **Indicateur d'équivalences** : Zone affichant les correspondances entre systèmes (EU/US/UK/Asie)
- [ ] **Bouton "Tableau complet"** : Accès à un modal avec tous les tableaux de correspondance
- [ ] **Avertissement standards** : Banner d'information sur l'approximation des tailles

**User Interactions**:
- [ ] **Toggle saisie/standards** → Bascule entre interface manuelle et sélection standards
- [ ] **Sélection région** → Filtre dynamique des démographies et tailles disponibles
- [ ] **Sélection démographie** → Filtre dynamique des tailles et adaptation des mesures
- [ ] **Sélection taille** → Chargement automatique des 15 mesures dans le formulaire
- [ ] **Modification mesure** → Passage en mode "personnalisé" avec indicateur visuel
- [ ] **Clic "Tableau complet"** → Ouverture modal avec tous les standards organisés par région
- [ ] **Validation** → Confirmation avec avertissement si nécessaire

### Business Logic
**Structure des Données Standards**:
```typescript
interface SizeStandards {
  [region: string]: {
    [demographic: string]: {
      [size: string]: {
        // Équivalences entre systèmes
        equivalences: {
          eu?: string;
          us?: string;
          uk?: string;
          asia?: string;
        };
        // Les 15 mesures standards en cm
        measurements: {
          chest_bust_cm: number;
          back_neck_to_wrist_cm: number;
          back_waist_length_cm: number;
          cross_back_cm: number;
          arm_length_to_underarm_cm: number;
          upper_arm_cm: number;
          armhole_depth_cm: number;
          waist_cm: number;
          hip_cm: number;
          head_circumference_cm: number;
          overall_garment_length_cm: number;
          shoulder_width_cm: number;
          wrist_circumference_cm: number;
          leg_length_cm?: number; // Optionnel selon démographie
          shoe_size?: string; // Système de la région
        };
      };
    };
  };
}
```

**Règles de Configuration par Région/Démographie** :

**Europe - Adulte Femme** :
- Tailles : XS, S, M, L, XL, XXL
- Équivalences US/UK incluses
- Système métrique (cm) comme référence

**Europe - Adulte Homme** :
- Tailles : XS, S, M, L, XL, XXL, XXXL
- Tours de cou et épaules ajustés pour morphologie masculine
- Profondeurs d'emmanchure plus importantes

**Europe - Enfant (2-16 ans)** :
- Tailles : 2, 4, 6, 8, 10, 12, 14, 16 ans
- Mesures adaptées à la croissance
- Proportions enfant pour emmanchures et longueurs

**Europe - Bébé (0-24 mois)** :
- Tailles : 0-3M, 3-6M, 6-9M, 9-12M, 12-18M, 18-24M
- Mesures spécialisées bébé avec sécurité
- Focus sur tour de tête et longueurs adaptées

**États-Unis, Royaume-Uni, Asie** :
- Adaptations des valeurs selon les standards locaux
- Conversions automatiques vers le système métrique
- Équivalences croisées entre tous les systèmes

**Validation Rules**:
- **Cohérence région/taille** : Les tailles proposées correspondent aux standards de la région
- **Adaptation vêtement** : Mesures conditionnelles selon le type de vêtement (hérité US_005)
- **Conversion unités** : Toutes les valeurs stockées en cm, affichage selon préférence utilisateur
- **Intégrité données** : Toutes les mesures requises présentes pour chaque taille standard

### Data Requirements
- **Input** : Région + Démographie + Taille sélectionnées par l'utilisateur
- **Processing** : Chargement des standards + conversion d'unités + adaptation au type de vêtement
- **Output** : MeasurementsData pré-rempli avec flag "is_standard_size" + possibilité de modification
- **Storage** : Même table user_measurements (US_005) avec champs additionnels pour tracking des standards

## TECHNICAL SPECIFICATIONS 🔧

### Architecture References
- **Patterns à utiliser** : Extension du MeasurementForm (US_005), système de traduction i18n
- **Composants existants** : MeasurementForm, MeasurementField, UnitToggle, DemographicSelector (US_005)
- **Services/Helpers disponibles** : Types Database, conversion d'unités, validation démographique

### Database Schema
```sql
-- Extension de la table user_measurements (US_005) pour les standards
ALTER TABLE user_measurements 
ADD COLUMN IF NOT EXISTS is_standard_size BOOLEAN DEFAULT false;
ALTER TABLE user_measurements 
ADD COLUMN IF NOT EXISTS standard_region VARCHAR(20);
ALTER TABLE user_measurements 
ADD COLUMN IF NOT EXISTS standard_size VARCHAR(10);
ALTER TABLE user_measurements 
ADD COLUMN IF NOT EXISTS modified_measurements JSONB DEFAULT '[]'; -- Liste des mesures modifiées depuis le standard

-- Nouvelle table pour stocker les standards de tailles
CREATE TABLE IF NOT EXISTS size_standards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  region VARCHAR(20) NOT NULL CHECK (region IN ('europe', 'us', 'uk', 'asia')),
  demographic VARCHAR(20) NOT NULL CHECK (demographic IN ('adult_female', 'adult_male', 'child', 'baby')),
  size_key VARCHAR(10) NOT NULL,
  
  -- Équivalences entre systèmes
  eu_equivalent VARCHAR(10),
  us_equivalent VARCHAR(10),
  uk_equivalent VARCHAR(10),
  asia_equivalent VARCHAR(10),
  
  -- Les 15 mesures standards (en cm)
  chest_bust_cm NUMERIC(5,2) NOT NULL,
  back_neck_to_wrist_cm NUMERIC(5,2),
  back_waist_length_cm NUMERIC(5,2),
  cross_back_cm NUMERIC(5,2),
  arm_length_to_underarm_cm NUMERIC(5,2),
  upper_arm_cm NUMERIC(5,2),
  armhole_depth_cm NUMERIC(5,2),
  waist_cm NUMERIC(5,2),
  hip_cm NUMERIC(5,2),
  head_circumference_cm NUMERIC(5,2),
  overall_garment_length_cm NUMERIC(5,2),
  shoulder_width_cm NUMERIC(5,2),
  wrist_circumference_cm NUMERIC(5,2),
  leg_length_cm NUMERIC(5,2), -- Pour bébé/enfant
  shoe_size_reference VARCHAR(10), -- Pointure de référence selon région
  
  -- Métadonnées
  source_reference VARCHAR(100), -- Référence Craft Yarn Council ou autre
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(region, demographic, size_key)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_size_standards_region_demo ON size_standards(region, demographic);

-- Données initiales pour Europe - Adulte Femme (basées sur Craft Yarn Council)
INSERT INTO size_standards (region, demographic, size_key, eu_equivalent, us_equivalent, uk_equivalent, chest_bust_cm, waist_cm, hip_cm, back_waist_length_cm, cross_back_cm, arm_length_to_underarm_cm, upper_arm_cm, armhole_depth_cm, shoulder_width_cm, wrist_circumference_cm, head_circumference_cm, overall_garment_length_cm, source_reference) VALUES
('europe', 'adult_female', 'XS', '32-34', '2-4', '6-8', 81, 66, 86, 39.5, 35, 41, 25, 16.5, 11.5, 15, 55, 55, 'Craft Yarn Council Standards'),
('europe', 'adult_female', 'S', '36-38', '6-8', '10-12', 86, 71, 91, 40.5, 37, 42, 26, 17, 12, 15.5, 55.5, 58, 'Craft Yarn Council Standards'),
('europe', 'adult_female', 'M', '40-42', '10-12', '14-16', 94, 76, 99, 43.5, 39.5, 43, 28, 18, 13, 16, 56, 61, 'Craft Yarn Council Standards'),
('europe', 'adult_female', 'L', '44-46', '14-16', '18-20', 104, 84, 109, 44.5, 42, 44, 30, 19, 14, 16.5, 56.5, 64, 'Craft Yarn Council Standards'),
('europe', 'adult_female', 'XL', '48-50', '18-20', '22-24', 114, 94, 119, 45.5, 44.5, 45, 32, 20, 15, 17, 57, 67, 'Craft Yarn Council Standards'),
('europe', 'adult_female', 'XXL', '52-54', '22-24', '26-28', 124, 104, 129, 46.5, 47, 46, 34, 21, 16, 17.5, 57.5, 70, 'Craft Yarn Council Standards');

-- Données pour Europe - Adulte Homme
INSERT INTO size_standards (region, demographic, size_key, eu_equivalent, us_equivalent, uk_equivalent, chest_bust_cm, waist_cm, hip_cm, back_waist_length_cm, cross_back_cm, arm_length_to_underarm_cm, upper_arm_cm, armhole_depth_cm, shoulder_width_cm, wrist_circumference_cm, head_circumference_cm, overall_garment_length_cm, source_reference) VALUES
('europe', 'adult_male', 'S', '44-46', 'S', 'S', 91, 76, 91, 46, 42, 45, 30, 23, 14, 17, 58, 66, 'Craft Yarn Council Standards'),
('europe', 'adult_male', 'M', '48-50', 'M', 'M', 99, 84, 99, 47, 44, 46, 32, 24, 15, 17.5, 58.5, 68, 'Craft Yarn Council Standards'),
('europe', 'adult_male', 'L', '52-54', 'L', 'L', 109, 94, 109, 48, 47, 47, 34, 25, 16, 18, 59, 71, 'Craft Yarn Council Standards'),
('europe', 'adult_male', 'XL', '56-58', 'XL', 'XL', 119, 104, 119, 49, 49.5, 48, 36, 26, 17, 18.5, 59.5, 73, 'Craft Yarn Council Standards'),
('europe', 'adult_male', 'XXL', '60-62', 'XXL', 'XXL', 129, 114, 129, 50, 52, 49, 38, 27, 18, 19, 60, 76, 'Craft Yarn Council Standards');

-- Données pour Europe - Enfant (exemples pour quelques tailles)
INSERT INTO size_standards (region, demographic, size_key, eu_equivalent, us_equivalent, uk_equivalent, chest_bust_cm, waist_cm, hip_cm, back_waist_length_cm, cross_back_cm, arm_length_to_underarm_cm, upper_arm_cm, armhole_depth_cm, shoulder_width_cm, wrist_circumference_cm, head_circumference_cm, overall_garment_length_cm, leg_length_cm, source_reference) VALUES
('europe', 'child', '4', '4', '4', '4', 58, 55, 60, 25, 24, 25, 18, 12, 8, 13, 50, 35, 48, 'Craft Yarn Council Standards'),
('europe', 'child', '6', '6', '6', '6', 63, 57, 65, 28, 26, 28, 19, 13, 8.5, 13.5, 51, 38, 55, 'Craft Yarn Council Standards'),
('europe', 'child', '8', '8', '8', '8', 68, 60, 70, 31, 28, 31, 20, 14, 9, 14, 52, 41, 62, 'Craft Yarn Council Standards'),
('europe', 'child', '10', '10', '10', '10', 73, 63, 75, 34, 30, 34, 21, 15, 9.5, 14.5, 53, 44, 69, 'Craft Yarn Council Standards');

-- Données pour Europe - Bébé (exemples)
INSERT INTO size_standards (region, demographic, size_key, eu_equivalent, us_equivalent, uk_equivalent, chest_bust_cm, waist_cm, hip_cm, back_waist_length_cm, cross_back_cm, arm_length_to_underarm_cm, upper_arm_cm, armhole_depth_cm, shoulder_width_cm, wrist_circumference_cm, head_circumference_cm, overall_garment_length_cm, leg_length_cm, shoe_size_reference, source_reference) VALUES
('europe', 'baby', '0-3M', '56', 'NB', '0-3M', 41, 41, 44, 17, 19, 17, 14, 8, 6, 10, 37, 28, 24, '16', 'Craft Yarn Council Standards'),
('europe', 'baby', '3-6M', '62', '3M', '3-6M', 44, 44, 47, 19, 20, 19, 15, 9, 6.5, 10.5, 39, 31, 28, '17', 'Craft Yarn Council Standards'),
('europe', 'baby', '6-9M', '68', '6M', '6-9M', 47, 47, 50, 21, 21, 21, 16, 10, 7, 11, 41, 34, 32, '18', 'Craft Yarn Council Standards'),
('europe', 'baby', '12M', '74', '12M', '9-12M', 50, 50, 53, 23, 22, 23, 17, 11, 7.5, 11.5, 43, 37, 36, '19', 'Craft Yarn Council Standards');
```

### API Endpoints
```typescript
// GET /api/size-standards/regions
interface RegionsResponse {
  success: boolean;
  data: {
    region_key: string;
    region_name: string; // Traduit selon locale
    available_demographics: string[];
  }[];
  error?: string;
}

// GET /api/size-standards/sizes?region=europe&demographic=adult_female
interface SizesResponse {
  success: boolean;
  data: {
    size_key: string;
    equivalences: {
      eu?: string;
      us?: string;
      uk?: string;
      asia?: string;
    };
    measurements: StandardMeasurements;
  }[];
  error?: string;
}

// GET /api/size-standards/chart
interface SizeChartResponse {
  success: boolean;
  data: {
    [region: string]: {
      [demographic: string]: {
        [size: string]: {
          equivalences: EquivalenceData;
          measurements: StandardMeasurements;
        };
      };
    };
  };
  error?: string;
}

interface StandardMeasurements {
  chest_bust_cm: number;
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
  shoe_size_reference?: string;
}
```

### Components Architecture
**NEW Components**:
- `SizeStandardSelector.tsx` - Interface principale de sélection région/démographie/taille
- `RegionSelector.tsx` - Sélecteur de région avec drapeaux et descriptions
- `SizeGrid.tsx` - Grille des tailles disponibles avec équivalences
- `SizeEquivalenceDisplay.tsx` - Affichage des correspondances entre systèmes
- `SizeStandardModal.tsx` - Modal avec tableaux complets de tous les standards
- `StandardSizeToggle.tsx` - Toggle entre saisie manuelle et standards

**REUSE Existing** (from US_005):
- `MeasurementForm.tsx` - Formulaire principal étendu avec option standards
- `MeasurementField.tsx` - Champs individuels avec indicateur "standard/personnalisé"
- `UnitToggle.tsx` - Conversion cm/pouces pour affichage standards
- `DemographicSelector.tsx` - Peut être réutilisé pour cohérence

**Modifications Required**:
- Extension de `MeasurementForm.tsx` pour intégrer la sélection de standards
- Modification de `MeasurementField.tsx` pour indiquer les valeurs modifiées depuis le standard
- Extension du service API measurements pour gérer les standards

### Architecture Documentation Updates
**À ajouter dans architecture.md après implémentation**:
- Section Composants: SizeStandardSelector, RegionSelector, SizeGrid, SizeEquivalenceDisplay, SizeStandardModal, StandardSizeToggle
- Section Routes API: `/api/size-standards/*` (regions, sizes, chart)
- Section Base de données: Table `size_standards` avec schéma complet et données initiales
- Section Helpers: Utilitaires de conversion d'unités et mapping d'équivalences

## IMPLEMENTATION CONSTRAINTS ⚠️

### DO NOT MODIFY
- Table `user_measurements` existante (US_005) - seulement extension avec nouvelles colonnes
- Composants MeasurementForm, MeasurementField, UnitToggle (US_005) - seulement extension fonctionnelle
- API `/api/measurements/save` existante (US_005) - seulement extension pour gérer les standards
- Validation démographique existante (US_005) - conservée pour cohérence

### MUST REUSE (from US_005)
- Système de validation démographique avec ranges existants
- Pattern de conversion d'unités cm/pouces
- Interface MeasurementForm avec sections et progression
- API d'authentification avec `getSupabaseSessionApi`
- Types Database et interfaces de mesures existants

### TECHNICAL CONSTRAINTS
- Respecter pattern Page → Service → API → Supabase
- Utiliser `getSupabaseSessionApi` pour les routes authentifiées 
- Stocker tous les standards en cm comme unité de référence
- Maintenir la compatibilité avec l'interface de saisie manuelle US_005
- Gérer les équivalences bidirectionnelles entre tous les systèmes de tailles
- Performance optimisée : chargement des standards en une seule requête avec mise en cache

## TESTING SCENARIOS 🧪

### Happy Path
1. **Accès interface standards** → Toggle "Tailles Standards" activé sur page mensurations
2. **Sélection cascadée** → Europe → Adulte Femme → Taille M → Chargement automatique des 15 mesures
3. **Affichage équivalences** → EU 40-42, US 10-12, UK 14-16 affichées clairement
4. **Modification personnalisée** → Tour de poitrine modifié de 94cm à 98cm → Indicateur "personnalisé"
5. **Sauvegarde hybride** → Données sauvées avec flag standard + mesures modifiées trackées
→ **Résultat**: Profil complet basé sur standards avec personnalisations trackées

### Error Cases
1. **Standards indisponibles**: API non disponible → Fallback vers saisie manuelle avec message
2. **Région/taille incompatible**: Combinaison non supportée → Message explicatif + suggestions alternatives
3. **Données incomplètes**: Standard sans certaines mesures → Chargement partiel + champs vides éditables

### Edge Cases
1. **Basculement après saisie**: Standards sélectionnés après saisie manuelle → Confirmation avant écrasement
2. **Standards puis modification**: Toutes les mesures modifiées → Propose de repasser en mode manuel
3. **Équivalences multiples**: Taille à cheval sur deux systèmes → Affichage des deux options avec indication

## DELIVERABLES 📦
- [ ] Component: `SizeStandardSelector.tsx` - Interface principale sélection standards
- [ ] Component: `RegionSelector.tsx` - Sélecteur région avec drapeaux
- [ ] Component: `SizeGrid.tsx` - Grille tailles avec équivalences
- [ ] Component: `SizeEquivalenceDisplay.tsx` - Affichage correspondances systèmes
- [ ] Component: `SizeStandardModal.tsx` - Modal tableaux complets
- [ ] Component: `StandardSizeToggle.tsx` - Toggle manuel/standards
- [ ] API Endpoint: `/api/size-standards/regions` - Liste régions disponibles
- [ ] API Endpoint: `/api/size-standards/sizes` - Tailles selon région/démographie
- [ ] API Endpoint: `/api/size-standards/chart` - Tableaux complets pour modal
- [ ] Database Extension: Table `size_standards` avec données Craft Yarn Council
- [ ] Database Extension: Colonnes `user_measurements` pour tracking standards
- [ ] Translations: Nouvelles clés i18n pour régions, équivalences, avertissements
- [ ] Documentation: `./implementation/US_006_implementation.md`

## VALIDATION CHECKLIST ✓
- [ ] Sélecteurs cascadés région → démographie → taille fonctionnent sans erreur
- [ ] Équivalences entre systèmes (EU/US/UK/Asie) affichées correctement pour toutes les tailles
- [ ] Chargement automatique des 15 mesures depuis les standards sélectionnés
- [ ] Possibilité de modifier individuellement chaque mesure avec tracking des modifications
- [ ] Avertissement sur l'approximation des standards affiché et fonctionnel
- [ ] Modal des tableaux complets accessible et bien organisé par région/démographie
- [ ] Adaptation automatique des mesures selon le type de vêtement (hérité US_005)
- [ ] Toggle entre saisie manuelle et standards fonctionne bidirectionnellement
- [ ] Sauvegarde hybride avec standards + modifications personnalisées opérationnelle
- [ ] Performance acceptable : chargement standards < 2s, navigation fluide
- [ ] Interface responsive et accessible sur mobile/tablet/desktop
- [ ] Traductions complètes pour toutes les nouvelles fonctionnalités
- [ ] Aucune régression sur fonctionnalités de saisie manuelle US_005

---
**Note**: Cette US doit être implémentée en respectant strictement les règles définies dans `malaine-rules.mdc` et l'architecture documentée dans `./docs/architecture.md`