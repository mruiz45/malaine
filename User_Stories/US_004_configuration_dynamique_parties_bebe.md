# User Story US_004: Configuration Dynamique des Parties Obligatoires/Optionnelles pour Vêtements Bébé

## 📋 METADATA
- **Story ID**: US_004
- **Epic**: Fondations du Patron - Paramètres Essentiels Bébé
- **Priority**: High
- **Estimated Effort**: M (4-8h)
- **Dependencies**: US_002, US_003

## USER STORY STATEMENT
**As a** système de création de patrons pour vêtements bébé  
**I want** configurer automatiquement les éléments constitutifs spécifiques aux vêtements de layette selon le type sélectionné  
**So that** seules les options pertinentes aux besoins des bébés et techniquement cohérentes sont proposées à l'utilisateur

## CONTEXT & BACKGROUND
Suite à l'implémentation de US_002 pour la section "general" et US_003 pour la section "baby", cette US étend la configuration des parties aux vêtements spécifiques à la layette et aux bébés. Après la sélection d'un type de vêtement bébé (section "baby"), l'application doit dynamiquement adapter l'interface pour ne présenter que les parties constitutives réellement applicables aux spécificités des vêtements de layette.

Les vêtements pour bébés ont des contraintes et besoins spécifiques :
- **Sécurité** : Éviter les parties détachables dangereuses (boutons, petits éléments)
- **Confort** : Privilégier la douceur et l'absence de coutures irritantes
- **Praticité** : Faciliter l'habillage/déshabillage (ouvertures, pressions)
- **Croissance** : Permettre l'adaptabilité aux changements de taille rapides

Cette configuration spécialisée pour bébés assure :
- **Sécurité enfant** : Empêche les parties potentiellement dangereuses
- **Guidance parentale** : Clarifie les éléments essentiels pour le confort bébé
- **Optimisation layette** : Propose uniquement les options pertinentes pour chaque âge
- **Cohérence technique** : Garantit des combinaisons sûres et réalisables

## ACCEPTANCE CRITERIA ✅

**Scenario 1: Configuration automatique pour une Brassière Bébé**
- **GIVEN** l'utilisateur a sélectionné "Brassière" comme type de vêtement bébé
- **WHEN** le système charge la configuration des parties
- **THEN** les parties obligatoires sont : dos, devant, emmanchures, bordures_encolure
- **AND** les parties optionnelles sont : manches_courtes, bordures_finition, motifs_simples
- **AND** les parties non-applicables sont masquées (ex: boutons, fermetures_eclair, col_monte)
- **AND** chaque partie affiche un indicateur visuel "obligatoire" ou "optionnel"

**Scenario 2: Configuration automatique pour une Combinaison Bébé**
- **GIVEN** l'utilisateur a sélectionné "Combinaison Bébé" comme type de vêtement
- **WHEN** le système charge la configuration des parties
- **THEN** les parties obligatoires sont : corps_principal, jambes, emmanchures, entrejambe
- **AND** les parties optionnelles sont : manches, pressions_epaules, bordures_jambes, motifs_poitrine
- **AND** les parties non-applicables sont masquées (ex: boutons_petits, fermetures_complexes)

**Scenario 3: Configuration automatique pour des Chaussons Bébé**
- **GIVEN** l'utilisateur a sélectionné "Chaussons Bébé" comme type de vêtement  
- **WHEN** le système charge la configuration des parties
- **THEN** les parties obligatoires sont : semelle, dessus_pied, cheville
- **AND** les parties optionnelles sont : sangles_douces, motifs_dessus, bordures_chevilles
- **AND** les parties non-applicables sont masquées (ex: lacets, semelles_dures, talons_hauts)

**Scenario 4: Configuration automatique pour une Couverture Bébé**
- **GIVEN** l'utilisateur a sélectionné "Couverture Bébé" comme type de vêtement
- **WHEN** le système charge la configuration des parties  
- **THEN** les parties obligatoires sont : corps_central, bordures_perimetriques
- **AND** les parties optionnelles sont : motifs_centraux, franges_douces, coins_renforces
- **AND** les parties non-applicables sont masquées (ex: manches, encolures, emmanchures)

**Scenario 5: Dépendances logiques entre parties (spécifiques bébé)**
- **GIVEN** un vêtement bébé avec des dépendances (ex: Combinaison avec manches)
- **WHEN** l'utilisateur active une partie optionnelle "manches"  
- **THEN** les sous-parties dépendantes deviennent disponibles (ex: poignets_doux, emmanchures_larges)
- **AND** la désactivation des manches masque automatiquement les sous-parties
- **AND** les contraintes de sécurité bébé sont respectées (ex: pas de manches sans emmanchures larges)

**Scenario 6: Indicateurs visuels des parties**
- **GIVEN** une configuration de parties est chargée
- **WHEN** l'utilisateur visualise la liste des parties
- **THEN** chaque partie obligatoire affiche un badge rouge "Obligatoire"
- **AND** chaque partie optionnelle affiche un badge vert "Optionnel"  
- **AND** les parties obligatoires ne peuvent pas être désactivées
- **AND** les parties optionnelles peuvent être cochées/décochées

## FUNCTIONAL REQUIREMENTS 📝

### UI Requirements
**Page/Component Location**: `/dashboard/patterns/new` (étape 2 du wizard, après sélection type)

**Visual Elements**:
- [ ] **Section "Configuration du Projet"** : Titre h3 avec description explicative
- [ ] **Liste des parties** : Cards organisées en deux groupes "Obligatoires" et "Optionnelles"
- [ ] **Card de partie** : Pour chaque partie, afficher :
  - Nom de la partie (ex: "Dos", "Manches", "Calotte")
  - Description courte de la fonction (ex: "Partie arrière du pull")
  - Badge de statut : "Obligatoire" (rouge, non-cliquable) ou "Optionnel" (vert, checkbox)
  - Icône représentative si disponible
- [ ] **Zone de dépendances** : Sous-parties qui apparaissent quand une partie optionnelle est activée
- [ ] **Aperçu schématique** : Diagramme simple du vêtement avec parties surlignées
- [ ] **Bouton "Continuer vers Mensurations"** : Actif par défaut (parties obligatoires pré-sélectionnées)

**User Interactions**:
- [ ] **Clic sur partie optionnelle** → Toggle activation/désactivation avec animation
- [ ] **Clic sur partie obligatoire** → Aucun effet, tooltip explicatif
- [ ] **Activation partie avec dépendances** → Affichage progressif des sous-parties
- [ ] **Hover sur partie** → Affichage détails et impact sur le patron final
- [ ] **Clic "Continuer"** → Validation et navigation vers étape mensurations

### Business Logic
**Configuration des Types** :
```typescript
interface GarmentPartConfiguration {
  type_key: string;
  obligatory_parts: GarmentPart[];
  optional_parts: GarmentPart[];
  part_dependencies: PartDependency[];
}

interface GarmentPart {
  part_key: string;
  technical_impact: string[];
  measurement_requirements?: string[];
}

interface PartDependency {
  parent_part: string;
  dependent_parts: string[];
  activation_condition: "optional_selected" | "always" | "conditional";
}
```

**Règles de Configuration par Type (Vêtements Bébé)** :

**Brassière Bébé** :
- Obligatoires : `dos`, `devant`, `emmanchures`, `bordures_encolure`
- Optionnelles : `manches_courtes`, `bordures_finition`, `motifs_simples`
- Dépendances : manches_courtes → (poignets_doux, emmanchures_larges)

**Combinaison Bébé** :
- Obligatoires : `corps_principal`, `jambes`, `emmanchures`, `entrejambe`
- Optionnelles : `manches`, `pressions_epaules`, `bordures_jambes`, `motifs_poitrine`
- Dépendances : manches → (poignets_doux, emmanchures_larges)

**Gigoteuse** :
- Obligatoires : `corps_principal`, `bretelles`, `fermeture_cotes`, `entrejambe_large`
- Optionnelles : `doublure_chaude`, `motifs_devant`, `bordures_emmanchures`, `renforts_fermeture`

**Barboteuse** :
- Obligatoires : `corps_principal`, `jambes_courtes`, `emmanchures`, `entrejambe`
- Optionnelles : `manches_courtes`, `pressions_entrejambe`, `bordures_jambes`, `motifs_poitrine`
- Dépendances : manches_courtes → (emmanchures_confortables)

**Chaussons Bébé** :
- Obligatoires : `semelle`, `dessus_pied`, `cheville`
- Optionnelles : `sangles_douces`, `motifs_dessus`, `bordures_chevilles`, `semelle_antiderapante`

**Bonnet Bébé** :
- Obligatoires : `calotte`, `bordure_base`
- Optionnelles : `rabats_oreilles`, `attaches_douces`, `motifs_surface`, `doublure_chaude`
- Dépendances : rabats_oreilles → (attaches_douces, bordures_rabats)

**Moufles Bébé** :
- Obligatoires : `paume`, `dos_main`, `poignet`
- Optionnelles : `cordon_securite`, `doublure_chaude`, `motifs_dos`, `poignet_elastique`
- Dépendances : cordon_securite → (attaches_vetement)

**Bavoir Tricoté** :
- Obligatoires : `corps_principal`, `attaches_cou`
- Optionnelles : `poche_recuperation`, `bordures_renforcees`, `motifs_decoratifs`, `doublure_impermeable`

**Couverture Bébé** :
- Obligatoires : `corps_central`, `bordures_perimetriques`
- Optionnelles : `motifs_centraux`, `franges_douces`, `coins_renforces`, `doublure_polaire`

**Cape de Bain** :
- Obligatoires : `corps_principal`, `capuche`, `ouverture_devant`
- Optionnelles : `poches_devant`, `ceinture_douce`, `bordures_capuche`, `motifs_dos`
- Dépendances : ceinture_douce → (passants_ceinture)

**Doudou Tricoté** :
- Obligatoires : `corps_principal`, `tete`, `membres_attaches`
- Optionnelles : `yeux_brodes`, `bouche_brodee`, `vetements_amovibles`, `hochet_integre`
- Dépendances : vetements_amovibles → (attaches_securisees)

**Nid d'Ange** :
- Obligatoires : `corps_principal`, `fermeture_centrale`, `capuche`, `fond_ferme`
- Optionnelles : `manches_detachables`, `doublure_chaude`, `motifs_exterieurs`, `poches_interieures`
- Dépendances : manches_detachables → (attaches_securisees, emmanchures_renforcees)

**Validation Rules (Spécifiques Bébé)**:
- **Parties obligatoires** : Toujours activées, non-modifiables (sécurité bébé prioritaire)
- **Cohérence dépendances** : Impossible d'activer une partie dépendante sans son parent
- **Contraintes sécurité bébé** : Certaines combinaisons interdites (ex: cordons sans attaches sécurisées)
- **Normes de sécurité** : Respect des standards CE pour jouets et vêtements bébé
- **Contraintes âge** : Adaptation selon les tranches d'âge (0-6 mois, 6-12 mois, 12-24 mois)

### Data Requirements
- **Input** : Type de vêtement bébé sélectionné (depuis US_003, section "baby")
- **Processing** : Chargement configuration spécifique bébé depuis base + calcul dépendances sécurisées
- **Output** : Configuration validée des parties sélectionnées avec contraintes de sécurité bébé
- **Storage** : Persistance dans session pattern pour étapes suivantes (extension du context US_002)

## TECHNICAL SPECIFICATIONS 🔧

### Architecture References
- **Patterns à utiliser** : Extension des configurations existantes US_002, React Context pour état
- **Composants existants** : GarmentPartConfigurator (US_002), Layout wizard, système sections (US_003)
- **Services/Helpers disponibles** : API garment-parts/configuration existante, système de traduction i18n étendu

### Database Schema
```sql
-- Extension des tables existantes US_002 pour les vêtements bébé
-- Les tables garment_part_configurations et garment_part_dependencies existent déjà

-- Ajout d'un index pour optimiser les requêtes par section
CREATE INDEX IF NOT EXISTS idx_garment_types_section ON garment_types(section) WHERE section = 'baby';

-- Extension des contraintes de sécurité pour vêtements bébé
ALTER TABLE garment_part_configurations 
ADD COLUMN IF NOT EXISTS safety_constraints JSONB DEFAULT '[]';

ALTER TABLE garment_part_configurations 
ADD COLUMN IF NOT EXISTS age_restrictions JSONB DEFAULT '{"min_age_months": 0, "max_age_months": 24}';

-- Nouveaux types d'activation condition pour sécurité bébé
ALTER TABLE garment_part_dependencies 
DROP CONSTRAINT IF EXISTS garment_part_dependencies_activation_condition_check;

ALTER TABLE garment_part_dependencies 
ADD CONSTRAINT garment_part_dependencies_activation_condition_check 
CHECK (activation_condition IN ('optional_selected', 'always', 'conditional', 'safety_required'));

-- Données initiales pour Brassière Bébé
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order, safety_constraints) VALUES
('brassiere', 'dos', true, 1, '["coutures_plates", "tissus_doux"]'),
('brassiere', 'devant', true, 2, '["coutures_plates", "tissus_doux"]'),
('brassiere', 'emmanchures', true, 3, '["bordures_larges", "sans_elastiques_serres"]'),
('brassiere', 'bordures_encolure', true, 4, '["finition_douce", "sans_boutons"]'),
('brassiere', 'manches_courtes', false, 5, '["coutures_plates", "ouverture_large"]'),
('brassiere', 'bordures_finition', false, 6, '["sans_elements_detachables"]'),
('brassiere', 'motifs_simples', false, 7, '["sans_relief", "couleurs_non_toxiques"]');

-- Données initiales pour Combinaison Bébé
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order, safety_constraints) VALUES
('combinaison_bebe', 'corps_principal', true, 1, '["coutures_plates", "tissus_respirants"]'),
('combinaison_bebe', 'jambes', true, 2, '["ouverture_facile", "pressions_qualite"]'),
('combinaison_bebe', 'emmanchures', true, 3, '["bordures_larges", "confortables"]'),
('combinaison_bebe', 'entrejambe', true, 4, '["pressions_securisees", "acces_facile"]'),
('combinaison_bebe', 'manches', false, 5, '["coutures_plates", "mobilite_preservee"]'),
('combinaison_bebe', 'pressions_epaules', false, 6, '["pressions_qualite", "ouverture_large"]'),
('combinaison_bebe', 'bordures_jambes', false, 7, '["elastiques_doux"]'),
('combinaison_bebe', 'motifs_poitrine', false, 8, '["sans_relief_dur"]');

-- Données initiales pour Chaussons Bébé
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order, safety_constraints) VALUES
('chaussons_bebe', 'semelle', true, 1, '["souple", "antiderapante", "respirante"]'),
('chaussons_bebe', 'dessus_pied', true, 2, '["ajustement_doux", "sans_pression"]'),
('chaussons_bebe', 'cheville', true, 3, '["maintien_sans_serrer", "elastique_doux"]'),
('chaussons_bebe', 'sangles_douces', false, 4, '["sans_boucles_dures", "velcro_qualite"]'),
('chaussons_bebe', 'motifs_dessus', false, 5, '["sans_elements_detachables"]'),
('chaussons_bebe', 'bordures_chevilles', false, 6, '["finition_douce"]'),
('chaussons_bebe', 'semelle_antiderapante', false, 7, '["materiau_non_toxique"]');

-- Données initiales pour Couverture Bébé
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order, safety_constraints) VALUES
('couverture_bebe', 'corps_central', true, 1, '["taille_securisee", "tissus_respirants"]'),
('couverture_bebe', 'bordures_perimetriques', true, 2, '["finition_douce", "sans_fils_laches"]'),
('couverture_bebe', 'motifs_centraux', false, 3, '["sans_elements_detachables"]'),
('couverture_bebe', 'franges_douces', false, 4, '["longueur_securisee", "bien_fixees"]'),
('couverture_bebe', 'coins_renforces', false, 5, '["coutures_solides"]'),
('couverture_bebe', 'doublure_polaire', false, 6, '["hypoallergenique", "respirante"]');

-- Dépendances pour Brassière Bébé
INSERT INTO garment_part_dependencies (garment_type_key, parent_part_key, dependent_part_key, activation_condition) VALUES
('brassiere', 'manches_courtes', 'bordures_finition', 'safety_required'),
('brassiere', 'manches_courtes', 'emmanchures', 'always');

-- Dépendances pour Combinaison Bébé
INSERT INTO garment_part_dependencies (garment_type_key, parent_part_key, dependent_part_key, activation_condition) VALUES
('combinaison_bebe', 'manches', 'emmanchures', 'always'),
('combinaison_bebe', 'pressions_epaules', 'bordures_finition', 'safety_required');
```

### API Endpoints
```typescript
// Extension de l'API existante pour les vêtements bébé
// GET /api/garment-parts/configuration?type_key=brassiere
interface GarmentPartConfigResponse {
  success: boolean;
  data: {
    type_key: string;
    obligatory_parts: GarmentPartConfig[];
    optional_parts: GarmentPartConfig[];
    dependencies: PartDependency[];
    safety_info?: BabySafetyInfo; // Nouveau pour vêtements bébé
  };
  error?: string;
}

interface GarmentPartConfig {
  part_key: string;
  is_obligatory: boolean;
  display_order: number;
  technical_impact: string[];
  measurement_requirements: string[];
  safety_constraints?: string[]; // Nouveau pour vêtements bébé
  age_restrictions?: AgeRestrictions; // Nouveau pour vêtements bébé
}

interface BabySafetyInfo {
  compliance_standards: string[]; // Ex: ["CE", "Oeko-Tex"]
  safety_warnings: string[];
  age_recommendations: AgeRestrictions;
}

interface AgeRestrictions {
  min_age_months: number;
  max_age_months: number;
  safety_notes?: string[];
}
```

### Système de Traduction des Parties (Pattern garment_types)
Le système suit le même pattern que `garment_types` : utilise `part_key` comme base pour générer automatiquement les clés de traduction i18n :

```typescript
// Base de données (clé stable)
part_key: "manches"

// Génération automatique des clés i18n
part_manches_name → "Sleeves" (EN) / "Manches" (FR)
part_manches_desc → "Arm coverage" (EN) / "Couverture des bras" (FR)
```

**Fonctions utilitaires** (à ajouter dans `lib/garmentTranslations.ts`) :
```typescript
// Fonction pour obtenir la clé de traduction du nom d'une partie
export function getPartNameKey(partKey: string): string {
  return `part_${partKey}_name`;
}

// Fonction pour obtenir la clé de traduction de la description d'une partie
export function getPartDescKey(partKey: string): string {
  return `part_${partKey}_desc`;
}

// Fonction pour obtenir le nom traduit d'une partie
export function getTranslatedPartName(partKey: string, t: (key: string) => string): string {
  const nameKey = getPartNameKey(partKey);
  return t(nameKey);
}

// Fonction pour obtenir la description traduite d'une partie
export function getTranslatedPartDesc(partKey: string, t: (key: string) => string): string {
  const descKey = getPartDescKey(partKey);
  return t(descKey);
}
```

**Avantages** :
- ✅ Plus simple : Pas de mapping complexe, utilise `part_key` directement
- ✅ Plus maintenable : Nouvelle partie = 2 clés i18n seulement  
- ✅ Plus stable : `part_key` est une clé unique, pas de dépendance aux textes
- ✅ Cohérent : Même pattern que `garment_types` déjà implémenté
- ✅ Évite la redondance : `part_name` et `part_description` ne sont plus nécessaires

**Exemples de clés à ajouter dans locales/en/translation.json (Parties Bébé)** :
```json
{
  "part_bordures_encolure_name": "Neckline edges",
  "part_bordures_encolure_desc": "Soft neck edge finishing for baby comfort",
  "part_manches_courtes_name": "Short sleeves",
  "part_manches_courtes_desc": "Baby-friendly short arm coverage",
  "part_bordures_finition_name": "Finishing edges",
  "part_bordures_finition_desc": "Gentle edge finishing without irritation",
  "part_motifs_simples_name": "Simple patterns",
  "part_motifs_simples_desc": "Safe decorative elements for babies",
  "part_jambes_name": "Legs",
  "part_jambes_desc": "Leg sections of baby garment",
  "part_entrejambe_name": "Crotch area",
  "part_entrejambe_desc": "Diaper access area with snaps",
  "part_pressions_epaules_name": "Shoulder snaps",
  "part_pressions_epaules_desc": "Easy-access shoulder openings",
  "part_bordures_jambes_name": "Leg edges",
  "part_bordures_jambes_desc": "Comfortable leg opening finishing",
  "part_motifs_poitrine_name": "Chest patterns",
  "part_motifs_poitrine_desc": "Decorative chest area designs",
  "part_semelle_name": "Sole",
  "part_semelle_desc": "Soft baby shoe bottom",
  "part_dessus_pied_name": "Foot top",
  "part_dessus_pied_desc": "Upper foot covering",
  "part_cheville_name": "Ankle",
  "part_cheville_desc": "Ankle support area",
  "part_sangles_douces_name": "Soft straps",
  "part_sangles_douces_desc": "Gentle securing straps",
  "part_motifs_dessus_name": "Top patterns",
  "part_motifs_dessus_desc": "Decorative top surface designs",
  "part_bordures_chevilles_name": "Ankle edges",
  "part_bordures_chevilles_desc": "Comfortable ankle finishing",
  "part_semelle_antiderapante_name": "Non-slip sole",
  "part_semelle_antiderapante_desc": "Safety grip sole bottom",
  "part_corps_central_name": "Central body",
  "part_corps_central_desc": "Main blanket area",
  "part_bordures_perimetriques_name": "Perimeter edges",
  "part_bordures_perimetriques_desc": "All-around edge finishing",
  "part_motifs_centraux_name": "Central patterns",
  "part_motifs_centraux_desc": "Decorative central designs",
  "part_franges_douces_name": "Soft fringes",
  "part_franges_douces_desc": "Safe decorative edge fringes",
  "part_coins_renforces_name": "Reinforced corners",
  "part_coins_renforces_desc": "Durable corner reinforcement",
  "part_doublure_polaire_name": "Fleece lining",
  "part_doublure_polaire_desc": "Warm inner fleece layer"
}
```

**Exemples de clés à ajouter dans locales/fr/translation.json (Parties Bébé)** :
```json
{
  "part_bordures_encolure_name": "Bordures d'encolure",
  "part_bordures_encolure_desc": "Finition douce du cou pour le confort bébé",
  "part_manches_courtes_name": "Manches courtes",
  "part_manches_courtes_desc": "Couverture de bras adaptée aux bébés",
  "part_bordures_finition_name": "Bordures de finition",
  "part_bordures_finition_desc": "Finition douce sans irritation",
  "part_motifs_simples_name": "Motifs simples",
  "part_motifs_simples_desc": "Éléments décoratifs sécurisés pour bébés",
  "part_jambes_name": "Jambes",
  "part_jambes_desc": "Sections jambes du vêtement bébé",
  "part_entrejambe_name": "Entrejambe",
  "part_entrejambe_desc": "Zone d'accès couche avec pressions",
  "part_pressions_epaules_name": "Pressions épaules",
  "part_pressions_epaules_desc": "Ouvertures d'accès facile aux épaules",
  "part_bordures_jambes_name": "Bordures de jambes",
  "part_bordures_jambes_desc": "Finition confortable des ouvertures jambes",
  "part_motifs_poitrine_name": "Motifs poitrine",
  "part_motifs_poitrine_desc": "Designs décoratifs de la zone poitrine",
  "part_semelle_name": "Semelle",
  "part_semelle_desc": "Dessous souple de chausson bébé",
  "part_dessus_pied_name": "Dessus du pied",
  "part_dessus_pied_desc": "Couverture supérieure du pied",
  "part_cheville_name": "Cheville",
  "part_cheville_desc": "Zone de soutien de la cheville",
  "part_sangles_douces_name": "Sangles douces",
  "part_sangles_douces_desc": "Attaches de maintien douces",
  "part_motifs_dessus_name": "Motifs du dessus",
  "part_motifs_dessus_desc": "Designs décoratifs de surface supérieure",
  "part_bordures_chevilles_name": "Bordures chevilles",
  "part_bordures_chevilles_desc": "Finition confortable des chevilles",
  "part_semelle_antiderapante_name": "Semelle antidérapante",
  "part_semelle_antiderapante_desc": "Dessous sécurisé avec adhérence",
  "part_corps_central_name": "Corps central",
  "part_corps_central_desc": "Zone principale de la couverture",
  "part_bordures_perimetriques_name": "Bordures périmétriques",
  "part_bordures_perimetriques_desc": "Finition de tous les contours",
  "part_motifs_centraux_name": "Motifs centraux",
  "part_motifs_centraux_desc": "Designs décoratifs centraux",
  "part_franges_douces_name": "Franges douces",
  "part_franges_douces_desc": "Franges décoratives sécurisées",
  "part_coins_renforces_name": "Coins renforcés",
  "part_coins_renforces_desc": "Renforcement durable des angles",
  "part_doublure_polaire_name": "Doublure polaire",
  "part_doublure_polaire_desc": "Couche intérieure chaude en polaire"
}
```

### Components Architecture
**REUSE Existing** (from US_002):
- `GarmentPartConfigurator.tsx` - Composant principal existant, fonctionnera avec vêtements bébé
- `GarmentPartCard.tsx` - Card individuelle existante, gérera les contraintes de sécurité bébé  
- API `/api/garment-parts/configuration` - Endpoint existant, supportera les nouveaux types bébé
- Context PatternCreation - Déjà étendu avec `selectedParts: string[]`

**REUSE Existing** (from US_003):
- Système de sections `'baby' | 'general'` déjà implémenté
- Filtrage par section dans sélection de types de vêtements

**Extensions Required**:
- Extension de `lib/garmentTranslations.ts` avec nouvelles fonctions pour parties bébé
- Ajout traductions pour nouvelles parties de vêtements bébé dans locales/en et locales/fr
- Extension des données de configuration en base pour types bébé
- Adaptation du composant `GarmentPartCard.tsx` pour afficher les contraintes de sécurité bébé

**Aucun nouveau composant requis** - L'architecture existante US_002 + US_003 supporte déjà cette fonctionnalité.

### Architecture Documentation Updates
**À ajouter dans architecture.md après implémentation**:
- Section Composants : GarmentPartConfigurator, GarmentPartCard, PartDependencyTree, GarmentSchematicView
- Section Routes API : /api/garment-parts/configuration
- Section Base de données : garment_part_configurations, garment_part_dependencies
- Section Context : Extension PatternCreationContext avec selectedParts

## IMPLEMENTATION CONSTRAINTS ⚠️

### DO NOT MODIFY
- Tables et composants existants de US_002 (garment_part_configurations, GarmentPartConfigurator, etc.)
- Système de sections US_003 (toggle baby/general)
- Context PatternCreation déjà étendu avec `selectedParts`
- API existante `/api/garment-parts/configuration`
- Middleware d'authentification et protection des routes

### MUST REUSE (from US_002 + US_003)
- Système de traduction i18n existant avec pattern `part_*_name`, `part_*_desc`
- Composants `GarmentPartConfigurator.tsx` et `GarmentPartCard.tsx` existants
- API endpoint `/api/garment-parts/configuration` existant
- Tables `garment_part_configurations` et `garment_part_dependencies` existantes
- Système de filtrage par section `'baby' | 'general'` de US_003

### TECHNICAL CONSTRAINTS
- **Performance** : Configuration chargée une seule fois par type, mise en cache côté client
- **Cohérence** : Validation des dépendances en temps réel côté client ET serveur
- **Extensibilité** : Architecture JSON pour faciliter l'ajout de nouveaux types sans code
- **Traductions** : Toutes les parties doivent être traduites (FR/EN)
- **Accessibilité** : Navigation clavier, labels appropriés, contrastes suffisants
- **Responsive** : Interface adaptée mobile/tablet/desktop

## TESTING SCENARIOS 🧪

### Happy Path
1. **Sélection type "Pull"** → Configuration chargée avec 4 parties obligatoires + 3 optionnelles
2. **Activation "Manches"** → Poignets et emmanchures apparaissent automatiquement  
3. **Désactivation "Manches"** → Poignets et emmanchures disparaissent
4. **Clic "Continuer"** → Navigation vers étape mensurations avec parties persistées
→ **Résultat** : Configuration cohérente sauvegardée dans session

### Error Cases
1. **API indisponible** : [Chargement échoue] → Message d'erreur + configuration par défaut minimale
2. **Type inexistant** : [Type non trouvé] → Redirection vers sélection type avec message
3. **Dépendances corrompues** : [Cycle de dépendances] → Validation côté client + log erreur

### Edge Cases  
1. **Modification après retour** : [Retour étape 1, changement type] → Reset configuration + préservation compatible
2. **Activation simultanée parties** : [Clics rapides multiples] → Debounce + état cohérent final
3. **Session expirée** : [Perte context] → Rechargement configuration + message utilisateur

## DELIVERABLES 📦
- [ ] Database Extensions: Colonnes `safety_constraints` et `age_restrictions` pour garment_part_configurations
- [ ] Data: Configurations initiales pour vêtements bébé (brassiere, combinaison_bebe, chaussons_bebe, couverture_bebe)
- [ ] Data: Dépendances spécifiques bébé avec condition `safety_required`
- [ ] Translations: Nouvelles clés i18n pour parties bébé en FR/EN (pattern `part_*_name` et `part_*_desc`)
- [ ] Component Enhancement: Adaptation `GarmentPartCard.tsx` pour afficher contraintes sécurité bébé
- [ ] Testing: Validation fonctionnement avec types bébé dans configurateur existant
- [ ] Documentation: `./implementation/US_004_implementation.md`

## VALIDATION CHECKLIST ✓
- [ ] Configuration automatique fonctionne pour tous les types bébé (brassiere, combinaison_bebe, etc.)
- [ ] Contraintes de sécurité bébé affichées et respectées
- [ ] Dépendances spécifiques bébé avec condition `safety_required` fonctionnent
- [ ] Interface existante supporte les nouveaux types sans régression
- [ ] Traductions complètes pour toutes les nouvelles parties bébé
- [ ] Filtrage par section 'baby' fonctionne avec configuration de parties
- [ ] Colonnes `safety_constraints` et `age_restrictions` utilisées correctement
- [ ] Composant `GarmentPartCard.tsx` affiche les informations de sécurité bébé
- [ ] Aucune régression sur fonctionnalités existantes US_002
- [ ] Tests de bout en bout : section baby → type bébé → configuration parties

---
**Note**: Cette US étend US_002 et US_003 en respectant strictement l'architecture existante documentée dans `./docs/architecture.md`