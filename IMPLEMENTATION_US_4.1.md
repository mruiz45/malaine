# Implémentation US_4.1 : Modèles de Données pour Types de Vêtements

## Vue d'ensemble

Cette implémentation définit les modèles de données robustes et extensibles pour représenter différents types de vêtements (Pull, Cardigan, Écharpe, Bonnet) et leurs composants structurels fondamentaux (Corps, Manches, Encolure, Côtes). Ces modèles s'intègrent parfaitement avec le système de sessions de définition de patron existant.

## Architecture Implémentée

### 1. Modèles de Base de Données

#### Tables Créées

1. **`garment_types`** - Types de vêtements disponibles
   - `id` (UUID) - Identifiant unique
   - `type_key` (VARCHAR) - Clé unique (ex: 'sweater_pullover', 'cardigan')
   - `display_name` (VARCHAR) - Nom d'affichage
   - `description` (TEXT) - Description du type
   - `metadata` (JSONB) - Métadonnées (méthodes de construction, niveau de difficulté)

2. **`garment_component_templates`** - Modèles de composants disponibles
   - `id` (UUID) - Identifiant unique
   - `component_key` (VARCHAR) - Clé unique (ex: 'body_panel', 'sleeve')
   - `display_name` (VARCHAR) - Nom d'affichage
   - `description` (TEXT) - Description du composant
   - `configurable_attributes` (JSONB) - Attributs configurables

3. **`pattern_definition_components`** - Composants dans les sessions utilisateur
   - `id` (UUID) - Identifiant unique
   - `pattern_definition_session_id` (UUID) - Référence à la session
   - `component_template_id` (UUID) - Référence au modèle de composant
   - `component_label` (VARCHAR) - Libellé personnalisé
   - `selected_attributes` (JSONB) - Attributs sélectionnés par l'utilisateur
   - `measurement_overrides` (JSONB) - Surcharges de mesures
   - `ease_overrides` (JSONB) - Surcharges d'aisance

4. **`garment_type_components`** - Table de liaison types/composants
   - `garment_type_id` (UUID) - Référence au type de vêtement
   - `component_template_id` (UUID) - Référence au composant
   - `is_required` (BOOLEAN) - Composant obligatoire ou optionnel
   - `default_quantity` (INT) - Quantité par défaut (ex: 2 manches)

#### Données Initiales

**Types de vêtements :**
- Pull-over (sweater_pullover) - Débutant
- Cardigan (cardigan) - Intermédiaire  
- Écharpe (scarf) - Débutant
- Bonnet (beanie) - Débutant

**Composants :**
- Corps (body_panel) - Options : longueur, forme, construction
- Manches (sleeve) - Options : longueur, style, poignets
- Encolure (neckband) - Options : style, construction, profondeur
- Côtes du bas (bottom_ribbing) - Options : style, longueur
- Bande boutonnière (button_band) - Pour cardigans
- Panneau principal (main_panel) - Pour écharpes
- Calotte (crown) - Pour bonnets
- Bord (brim) - Pour bonnets

### 2. Types TypeScript

#### Fichier `src/types/garment.ts`

Définit toutes les interfaces TypeScript pour :
- `GarmentType` - Type de vêtement de base
- `GarmentComponentTemplate` - Modèle de composant
- `PatternDefinitionComponent` - Instance de composant dans une session
- `GarmentTypeComponent` - Liaison type/composant
- Interfaces étendues avec données populées
- Types de réponse API

#### Mise à jour `src/types/patternDefinition.ts`

- Ajout de l'import des types de vêtements
- Extension de `PatternDefinitionSessionWithData` avec `components`
- Ajout de l'étape 'garment-structure' dans `DefinitionStep`

### 3. Services Backend

#### `src/services/garmentTypeService.ts`

Service pour la gestion des types de vêtements :
- `getAllGarmentTypes()` - Récupère tous les types
- `getGarmentTypeByKey()` - Récupère un type spécifique
- `getGarmentTypeWithComponents()` - Type avec ses composants
- `getComponentTemplatesForGarmentType()` - Composants pour un type
- `validateGarmentTypeKey()` - Validation d'existence
- `getGarmentTypesByDifficulty()` - Filtrage par difficulté

#### `src/services/garmentComponentService.ts`

Service pour la gestion des composants dans les sessions :
- `getComponentsForSession()` - Composants d'une session
- `createComponent()` - Création d'un composant
- `updateComponent()` - Mise à jour d'un composant
- `deleteComponent()` - Suppression d'un composant
- `createComponentsFromGarmentType()` - Création en lot depuis un type
- `validateComponentAttributes()` - Validation des attributs

#### Mise à jour `src/services/patternDefinitionService.ts`

Extension avec méthodes de gestion des composants :
- `getSessionComponents()` - Récupération des composants
- `createSessionComponent()` - Création de composant
- `updateSessionComponent()` - Mise à jour de composant
- `deleteSessionComponent()` - Suppression de composant
- `createComponentsFromGarmentType()` - Création depuis type

### 4. Routes API

#### `src/app/api/garment-types/route.ts`

- `GET /api/garment-types` - Liste des types de vêtements
- Support du paramètre `?difficulty=` pour filtrage

#### `src/app/api/garment-types/[type_key]/component-templates/route.ts`

- `GET /api/garment-types/{type_key}/component-templates` - Composants pour un type

### 5. Sécurité (RLS)

#### Politiques Implémentées

**Tables publiques (lecture seule) :**
- `garment_types` - Lecture publique
- `garment_component_templates` - Lecture publique  
- `garment_type_components` - Lecture publique

**Tables utilisateur :**
- `pattern_definition_components` - Accès limité aux sessions de l'utilisateur
  - SELECT, INSERT, UPDATE, DELETE avec vérification de propriété via `pattern_definition_sessions`

## Fonctionnalités Clés

### 1. Extensibilité

- **Nouveaux types de vêtements** : Ajout facile via insertion en base
- **Nouveaux composants** : Système d'attributs configurables en JSONB
- **Métadonnées flexibles** : Stockage JSON pour propriétés spécifiques

### 2. Validation

- **Attributs de composants** : Validation contre les options configurables
- **Références** : Vérification d'existence des types et composants
- **Permissions** : RLS pour sécuriser l'accès aux données utilisateur

### 3. Intégration

- **Sessions de définition** : Liaison directe avec le système existant
- **Snapshot de paramètres** : Inclusion des composants dans les snapshots
- **Architecture en couches** : Respect du pattern Page -> Service -> API -> Supabase

## Tests de Validation

### Données Créées

✅ **4 types de vêtements** insérés avec métadonnées complètes
✅ **8 modèles de composants** avec attributs configurables  
✅ **12 liaisons type/composant** définissant les structures
✅ **Politiques RLS** actives et fonctionnelles

### Requêtes de Test

```sql
-- Vérification des types de vêtements
SELECT * FROM garment_types ORDER BY display_name;

-- Composants pour un pull-over
SELECT gct.*, gtc.is_required, gtc.default_quantity 
FROM garment_component_templates gct
JOIN garment_type_components gtc ON gct.id = gtc.component_template_id
JOIN garment_types gt ON gtc.garment_type_id = gt.id
WHERE gt.type_key = 'sweater_pullover'
ORDER BY gtc.sort_order;
```

## Prochaines Étapes

Cette implémentation fournit la base solide pour :

1. **US 4.2** - Outils interactifs de sélection de type de vêtement
2. **US 4.3** - Configuration des composants de vêtement
3. **Phase 6** - Moteur de calcul utilisant ces structures

## Conformité aux Exigences

### Exigences Fonctionnelles Satisfaites

- ✅ **FR1** : Entité `GarmentType` définie et implémentée
- ✅ **FR2** : `GarmentComponent`s associés à chaque type
- ✅ **FR3** : Attributs configurables pour les composants
- ✅ **FR4** : Architecture extensible pour futurs ajouts
- ✅ **FR5** : Liaison avec paramètres utilisateur (Phase 1)

### Critères d'Acceptation Validés

- ✅ **AC1** : Table `garment_types` opérationnelle avec données
- ✅ **AC2** : Table `garment_component_templates` avec composants
- ✅ **AC3** : Table `pattern_definition_components` avec liaisons
- ✅ **AC4** : Données initiales pour pull-over simple
- ✅ **AC5** : Documentation complète des relations et attributs

L'implémentation respecte strictement les spécifications de la US_4.1 et s'intègre parfaitement avec l'architecture existante du projet Malaine. 