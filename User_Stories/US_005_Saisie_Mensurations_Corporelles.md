# User Story US_005: Saisie manuelle des mensurations corporelles complètes

## 📋 METADATA
- **Story ID**: US_005
- **Epic**: Collecte des données utilisateur pour génération de patrons
- **Priority**: High
- **Estimated Effort**: L (1-2j)
- **Dependencies**: None

## USER STORY STATEMENT
**As a** utilisateur souhaitant créer un patron personnalisé  
**I want** saisir manuellement toutes mes mensurations corporelles nécessaires avec validation démographique  
**So that** j'obtienne un patron parfaitement ajusté à ma morphologie et conforme aux standards anatomiques

## CONTEXT & BACKGROUND
La saisie des mensurations corporelles est une étape critique dans la génération de patrons personnalisés. Cette fonctionnalité permet aux utilisateurs de fournir 15 mesures corporelles standards qui serviront de base au calcul des dimensions du patron. Le système doit s'adapter aux différents types d'utilisateurs (bébé, enfant, adulte) et aux différences anatomiques (homme/femme, garçon/fille) tout en validant la cohérence des valeurs saisies. Les mesures peuvent être exprimées en centimètres ou en pouces avec conversion automatique, et certaines mesures sont conditionnelles selon le type de vêtement à confectionner.

## ACCEPTANCE CRITERIA ✅

**Scenario 1: Saisie complète des mensurations avec validation réussie**
- **GIVEN** un utilisateur sur l'interface de saisie des mensurations
- **WHEN** il saisit les 15 mesures requises avec des valeurs cohérentes
- **THEN** le système valide toutes les mesures en temps réel
- **AND** sauvegarde automatiquement les données saisies
- **AND** affiche les mesures obligatoires/optionnelles selon le type de vêtement

**Scenario 2: Conversion automatique d'unités**
- **GIVEN** un utilisateur saisissant des mesures
- **WHEN** il sélectionne l'unité "pouces" et saisit une valeur
- **THEN** le système convertit automatiquement en centimètres
- **AND** affiche les deux valeurs (cm et pouces)
- **AND** stocke la valeur métrique comme référence

**Scenario 3: Validation démographique échouée**
- **GIVEN** un utilisateur sélectionnant "enfant" comme catégorie
- **WHEN** il saisit des mesures correspondant à un adulte (ex: tour de poitrine 120cm)
- **THEN** le système affiche un avertissement de cohérence démographique
- **AND** suggère de vérifier la catégorie ou les valeurs saisies
- **AND** empêche la validation tant que l'incohérence persiste

**Scenario 4: Champs conditionnels selon le type de vêtement**
- **GIVEN** un utilisateur créant un patron de chaussettes
- **WHEN** il accède à l'interface de mensurations
- **THEN** seules les mesures pertinentes sont affichées (pointure, tour de cheville, longueur de jambe)
- **AND** les autres mesures sont masquées ou marquées comme optionnelles

**Scenario 5: Sauvegarde progressive sans perte de données**
- **GIVEN** un utilisateur saisissant des mensurations
- **WHEN** il ferme accidentellement le navigateur après avoir saisi 5 mesures
- **THEN** à la reconnexion, les 5 mesures déjà saisies sont restaurées
- **AND** il peut continuer la saisie où il s'était arrêté

## FUNCTIONAL REQUIREMENTS 📝

### UI Requirements
**Page/Component Location**: /dashboard/patterns/new/measurements

**Visual Elements**:
- [ ] **Sélecteur d'unité**: Toggle cm/pouces en haut à droite avec conversion en temps réel
- [ ] **Indicateur de progression**: Barre de progression montrant le nombre de champs complétés sur le total
- [ ] **Formulaire principal**: 15 champs de saisie organisés en sections logiques (Torse, Bras, Taille/Hanches, Autres)
- [ ] **Aide contextuelle**: Icônes "?" avec tooltips explicatifs pour chaque mesure
- [ ] **Validation visuelle**: Indicateurs verts/rouges en temps réel à côté de chaque champ
- [ ] **Aperçu des valeurs**: Affichage simultané en cm et pouces pour chaque mesure saisie
- [ ] **Champs obligatoires/optionnels**: Marquage visuel clair avec astérisques et couleurs différenciées

**User Interactions**:
- [ ] **Saisie numérique**: Champs acceptant valeurs décimales avec validation format (xx.x)
- [ ] **Toggle unités**: Clic sur cm/pouces → conversion automatique de toutes les valeurs affichées
- [ ] **Validation temps réel**: Chaque saisie → vérification cohérence démographique immédiate
- [ ] **Aide contextuelle**: Hover sur icône "?" → affichage tooltip avec illustration de la mesure
- [ ] **Sauvegarde auto**: Toute modification → sauvegarde automatique après 2 secondes d'inactivité
- [ ] **Navigation**: Boutons "Précédent" et "Continuer" avec validation complète avant passage à l'étape suivante

### Business Logic
**Validation Rules**:
- **Format numérique**: Valeurs positives uniquement, maximum 2 décimales → "Veuillez saisir un nombre positif"
- **Cohérence anatomique bébé**: Tour de poitrine 30-60cm, hauteur totale 35-80cm → "Ces mesures semblent inadaptées pour un bébé"
- **Cohérence anatomique enfant**: Tour de poitrine 50-90cm, hauteur totale 80-160cm → "Ces mesures semblent inadaptées pour un enfant"
- **Cohérence anatomique adulte**: Tour de poitrine 70-150cm, hauteur totale 140-200cm → "Ces mesures semblent inadaptées pour un adulte"
- **Ratios cohérents**: Tour de taille < Tour de poitrine + 20cm → "Le tour de taille semble incohérent avec le tour de poitrine"
- **Pointure vs âge**: Pointure enfant < 38, adulte > 32 → "La pointure semble incohérente avec la catégorie d'âge"

**Calculations/Transformations**:
- Conversion cm ↔ pouces: `cm = pouces × 2.54` et `pouces = cm ÷ 2.54`
- Arrondi à 1 décimale pour affichage: `Math.round(value * 10) / 10`
- Validation ranges dynamiques selon démographie sélectionnée

### Data Requirements
- **Input**: 15 mesures numériques + unité + catégorie démographique + type de vêtement
- **Processing**: Conversion unités + validation ranges + sauvegarde progressive
- **Output**: Objet MeasurementsData avec toutes les mesures en cm (référence) + unité utilisateur
- **Storage**: Sauvegarde dans table `user_measurements` avec timestamp et référence au projet

## TECHNICAL SPECIFICATIONS 🔧

### Architecture References
- **Patterns à utiliser**: Form component avec validation temps réel (architecture.md)
- **Composants existants**: Aucun composant de mesures existant dans architecture.md
- **Services/Helpers disponibles**: Types Database depuis `lib/database.types.ts`

### Database Schema
```sql
-- Nouvelle table pour stocker les mensurations utilisateur
CREATE TABLE IF NOT EXISTS user_measurements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  project_id uuid REFERENCES projects(id), -- optionnel, pour lier à un projet spécifique
  -- Les 15 mesures principales (en cm comme référence)
  chest_bust_cm numeric(5,2), -- Tour de Poitrine
  back_neck_to_wrist_cm numeric(5,2), -- Longueur Dos du Col au Poignet  
  back_waist_length_cm numeric(5,2), -- Longueur Taille Dos
  cross_back_cm numeric(5,2), -- Carrure Dos
  arm_length_to_underarm_cm numeric(5,2), -- Longueur de Manche
  upper_arm_cm numeric(5,2), -- Tour de Bras
  armhole_depth_cm numeric(5,2), -- Profondeur d'Emmanchure
  waist_cm numeric(5,2), -- Tour de Taille
  hip_cm numeric(5,2), -- Tour de Hanches
  head_circumference_cm numeric(5,2), -- Tour de Tête
  overall_garment_length_cm numeric(5,2), -- Hauteur Totale du Pull
  shoulder_width_cm numeric(5,2), -- Largeur d'Épaule
  wrist_circumference_cm numeric(5,2), -- Tour de Poignet
  leg_length_cm numeric(5,2), -- Longueur de Jambe (bébé/layette)
  shoe_size varchar(10), -- Pointure (string car différents systèmes)
  -- Métadonnées
  preferred_unit varchar(10) DEFAULT 'cm' CHECK (preferred_unit IN ('cm', 'inches')),
  demographic_category varchar(20) CHECK (demographic_category IN ('baby', 'child', 'adult')),
  gender_category varchar(20) CHECK (gender_category IN ('male', 'female', 'neutral')),
  garment_type varchar(50), -- Type de vêtement pour mesures conditionnelles
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_measurements_user_id ON user_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_measurements_project_id ON user_measurements(project_id);

-- RLS pour sécurité
ALTER TABLE user_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own measurements" ON user_measurements
  FOR ALL USING (auth.uid() = user_id);
```

### API Endpoints
```typescript
// POST /api/measurements/save
interface RequestBody {
  measurements: {
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
  };
  preferred_unit: 'cm' | 'inches';
  demographic_category: 'baby' | 'child' | 'adult';
  gender_category: 'male' | 'female' | 'neutral';
  garment_type?: string;
  project_id?: string;
}
interface ResponseBody {
  success: boolean;
  data?: { measurement_id: string; saved_at: string };
  error?: string;
}

// GET /api/measurements/[user_id]
interface ResponseBody {
  success: boolean;
  data?: UserMeasurement[];
  error?: string;
}
```

### Components Architecture
**NEW Components**:
- `MeasurementForm.tsx` - Composant principal de saisie des 15 mesures avec validation
- `MeasurementField.tsx` - Champ individuel avec validation et conversion d'unités
- `UnitToggle.tsx` - Sélecteur cm/pouces avec conversion globale
- `MeasurementHelp.tsx` - Composant d'aide contextuelle avec tooltips
- `DemographicSelector.tsx` - Sélecteur de catégorie démographique
- `MeasurementProgress.tsx` - Indicateur de progression du formulaire

**REUSE Existing** (from architecture.md):
- Aucun composant existant directement réutilisable pour cette fonctionnalité spécifique

**Modifications Required**:
- Aucune modification de composants existants nécessaire

### Architecture Documentation Updates
**À ajouter dans architecture.md après implémentation**:
- Section Composants: Nouveaux composants MeasurementForm, MeasurementField, UnitToggle, MeasurementHelp, DemographicSelector, MeasurementProgress
- Section Routes API: `/api/measurements/save` et `/api/measurements/[user_id]`
- Section Base de données: Table `user_measurements` avec schéma et politiques RLS

## IMPLEMENTATION CONSTRAINTS ⚠️

### DO NOT MODIFY
- Aucun fichier existant à ne pas modifier (nouvelle fonctionnalité)

### MUST REUSE (from architecture.md)
- Pattern d'authentification avec `getSupabaseSessionApi` pour les routes API
- Types Database depuis `lib/database.types.ts` pour les types TypeScript
- Configuration i18n existante pour les labels et messages d'erreur

### TECHNICAL CONSTRAINTS
- Respecter pattern Page → Service → API → Supabase
- Utiliser `getSupabaseSessionApi` pour les routes authentifiées
- Gérer tous les cas d'erreur avec messages explicites
- Maintenir la compatibilité avec les futures fonctionnalités de génération de patrons
- Stocker toutes les mesures en cm comme unité de référence
- Validation côté client ET serveur pour la sécurité

## TESTING SCENARIOS 🧪

### Happy Path
1. Utilisateur accède à `/dashboard/patterns/new/measurements`
2. Sélectionne "adulte" et "femme" comme catégorie démographique
3. Toggle l'unité vers "pouces"
4. Saisit tour de poitrine: 36 pouces → conversion automatique 91.4 cm
5. Continue la saisie des 14 autres mesures avec validation temps réel
6. Clique "Continuer" → Sauvegarde réussie et passage à l'étape suivante
→ **Résultat**: Toutes les mesures sont sauvegardées en base avec les conversions correctes

### Error Cases
1. **Valeurs incohérentes**: Saisie tour de poitrine 200cm pour un enfant → Message "Ces mesures semblent inadaptées pour un enfant"
2. **Format invalide**: Saisie "abc" dans un champ numérique → Message "Veuillez saisir un nombre positif"
3. **Erreur réseau**: Problème de connexion lors de la sauvegarde → Message "Erreur de connexion, vos données sont conservées localement"

### Edge Cases
1. **Fermeture accidentelle**: Fermeture du navigateur après 8 champs saisis → Restauration automatique à la reconnexion
2. **Valeurs limites**: Saisie de valeurs aux limites des ranges de validation → Validation correcte sans erreur
3. **Navigation rapide**: Clic rapide sur "Continuer" sans attendre la sauvegarde → Attente automatique de la sauvegarde avant navigation

## DELIVERABLES 📦
- [ ] Component: `MeasurementForm.tsx` - Interface principale de saisie
- [ ] Component: `MeasurementField.tsx` - Champ individuel avec validation
- [ ] Component: `UnitToggle.tsx` - Sélecteur d'unités
- [ ] Component: `MeasurementHelp.tsx` - Aide contextuelle
- [ ] Component: `DemographicSelector.tsx` - Sélecteur de catégorie
- [ ] Component: `MeasurementProgress.tsx` - Indicateur de progression
- [ ] API Endpoint: `/api/measurements/save` - Sauvegarde des mesures
- [ ] API Endpoint: `/api/measurements/[user_id]` - Récupération des mesures
- [ ] Database Migration: Table `user_measurements` avec schéma complet
- [ ] Documentation: `./implementation/US_005_implementation.md`

## VALIDATION CHECKLIST ✓
- [ ] Les 15 mesures standards sont toutes présentes et configurables
- [ ] La validation démographique fonctionne pour bébé/enfant/adulte
- [ ] La conversion cm/pouces est bidirectionnelle et précise
- [ ] Les champs conditionnels s'affichent selon le type de vêtement
- [ ] La sauvegarde progressive fonctionne sans perte de données
- [ ] Les messages d'erreur sont clairs et informatifs
- [ ] L'interface est intuitive avec aide contextuelle
- [ ] Les performances sont optimales (sauvegarde < 2s)
- [ ] La sécurité est assurée avec validation côté serveur
- [ ] La compatibilité mobile est fonctionnelle

---
**Note**: Cette US doit être implémentée en respectant strictement les règles définies dans `malaine-rules.mdc` et l'architecture documentée dans `./docs/architecture.md` 