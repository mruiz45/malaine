# User Story US_002: Configuration Dynamique des Parties Obligatoires/Optionnelles

## 📋 METADATA
- **Story ID**: US_002
- **Epic**: Fondations du Patron - Paramètres Essentiels
- **Priority**: High
- **Estimated Effort**: M (4-8h)
- **Dependencies**: US_001

## USER STORY STATEMENT
**As a** système de création de patrons  
**I want** configurer automatiquement les éléments constitutifs du vêtement selon le type sélectionné  
**So that** seules les options pertinentes et techniquement cohérentes sont proposées à l'utilisateur

## CONTEXT & BACKGROUND
Après la sélection du type de vêtement (US_001), l'application doit dynamiquement adapter l'interface pour ne présenter que les parties constitutives réellement applicables au type choisi. Cette configuration automatique :

- **Évite la confusion** : Empêche de proposer des "manches" pour une écharpe ou un "talon" pour un pull
- **Guide l'utilisateur** : Clarifie quelles parties sont essentielles vs optionnelles
- **Optimise l'UX** : Réduit la complexité visuelle en masquant les options non pertinentes
- **Assure la cohérence** : Garantit que les combinaisons proposées sont techniquement réalisables

Cette logique de configuration servira de base pour toutes les étapes suivantes du wizard, notamment pour :
- La définition des mensurations requises (étape 2)
- Les options de style disponibles (étape 3)  
- La génération du patron final (étape 5)

## ACCEPTANCE CRITERIA ✅

**Scenario 1: Configuration automatique pour un Pull**
- **GIVEN** l'utilisateur a sélectionné "Pull" comme type de vêtement
- **WHEN** la système charge la configuration des parties
- **THEN** les parties obligatoires sont : dos, devant, encolure, bordures
- **AND** les parties optionnelles sont : manches, torsades, motifs texturés
- **AND** les parties non-applicables sont masquées (ex: talon, calotte, franges)
- **AND** chaque partie affiche un indicateur visuel "obligatoire" ou "optionnel"

**Scenario 2: Configuration automatique pour une Écharpe**
- **GIVEN** l'utilisateur a sélectionné "Écharpe" comme type de vêtement
- **WHEN** le système charge la configuration des parties
- **THEN** les parties obligatoires sont : corps principal, bordures
- **AND** les parties optionnelles sont : franges, motifs décoratifs
- **AND** les parties non-applicables sont masquées (ex: manches, encolure, emmanchures)

**Scenario 3: Configuration automatique pour un Bonnet**
- **GIVEN** l'utilisateur a sélectionné "Bonnet" comme type de vêtement  
- **WHEN** le système charge la configuration des parties
- **THEN** les parties obligatoires sont : calotte, bordure/bord
- **AND** les parties optionnelles sont : pompon, rabats d'oreilles, motifs
- **AND** les parties non-applicables sont masquées (ex: manches, emmanchures, talon)

**Scenario 4: Configuration automatique pour des Chaussettes**
- **GIVEN** l'utilisateur a sélectionné "Chaussettes" comme type de vêtement
- **WHEN** le système charge la configuration des parties  
- **THEN** les parties obligatoires sont : jambe, talon, pied
- **AND** les parties optionnelles sont : motifs sur jambe, motifs sur pied
- **AND** les parties non-applicables sont masquées (ex: encolure, emmanchures, pompon)

**Scenario 5: Dépendances logiques entre parties**
- **GIVEN** un type de vêtement avec des dépendances (ex: Pull avec manches)
- **WHEN** l'utilisateur active une partie optionnelle "manches"  
- **THEN** les sous-parties dépendantes deviennent disponibles (ex: poignets, emmanchures)
- **AND** la désactivation des manches masque automatiquement les sous-parties
- **AND** les contraintes techniques sont respectées (ex: pas de manches sans emmanchures)

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

**Règles de Configuration par Type** :

**Pull/Sweater**:
- Obligatoires : `dos`, `devant`, `encolure`, `bordures_base`
- Optionnelles : `manches`, `poignets`, `emmanchures`, `torsades`, `motifs_textures`
- Dépendances : manches → (poignets, emmanchures)

**Écharpe/Scarf** :
- Obligatoires : `corps_principal`, `bordures_laterales`
- Optionnelles : `franges`, `motifs_decoratifs`, `bordures_terminales`

**Bonnet/Beanie** :
- Obligatoires : `calotte`, `bordure_base`
- Optionnelles : `pompon`, `rabats_oreilles`, `motifs_surface`, `doublure`
- Dépendances : rabats_oreilles → (attaches, bordures_rabats)

**Chaussettes/Socks** :
- Obligatoires : `jambe`, `talon`, `pied`, `orteils`
- Optionnelles : `motifs_jambe`, `motifs_pied`, `renforcement_talon`

**Validation Rules**:
- **Parties obligatoires** : Toujours activées, non-modifiables
- **Cohérence dépendances** : Impossible d'activer une partie dépendante sans son parent
- **Contraintes techniques** : Certaines combinaisons interdites (ex: manches sans emmanchures)

### Data Requirements
- **Input** : Type de vêtement sélectionné (depuis US_001)
- **Processing** : Chargement configuration depuis JSON/base + calcul dépendances  
- **Output** : Configuration validée des parties sélectionnées
- **Storage** : Persistance dans session pattern pour étapes suivantes

## TECHNICAL SPECIFICATIONS 🔧

### Architecture References
- **Patterns à utiliser** : Configuration JSON pour flexibilité, React Context pour état
- **Composants existants** : Layout wizard (depuis US_001), Header navigation
- **Services/Helpers disponibles** : Types Database, système de traduction i18n

### Database Schema
```sql
-- Nouvelle table pour configurations des parties par type
CREATE TABLE IF NOT EXISTS garment_part_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garment_type_key VARCHAR(50) NOT NULL REFERENCES garment_types(type_key),
  part_key VARCHAR(50) NOT NULL,
  is_obligatory BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  technical_impact JSONB DEFAULT '[]',
  measurement_requirements JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(garment_type_key, part_key)
);

-- Table pour les dépendances entre parties
CREATE TABLE IF NOT EXISTS garment_part_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garment_type_key VARCHAR(50) NOT NULL REFERENCES garment_types(type_key),
  parent_part_key VARCHAR(50) NOT NULL,
  dependent_part_key VARCHAR(50) NOT NULL,
  activation_condition VARCHAR(20) DEFAULT 'optional_selected',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(garment_type_key, parent_part_key, dependent_part_key)
);

-- Données initiales pour Pull
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order) VALUES
('pull', 'dos', true, 1),
('pull', 'devant', true, 2),
('pull', 'encolure', true, 3),
('pull', 'bordures_base', true, 4),
('pull', 'manches', false, 5),
('pull', 'poignets', false, 6),
('pull', 'emmanchures', false, 7);

-- Données initiales pour Écharpe
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order) VALUES
('echarpe', 'corps_principal', true, 1),
('echarpe', 'bordures_laterales', true, 2),
('echarpe', 'franges', false, 3),
('echarpe', 'motifs_decoratifs', false, 4),
('echarpe', 'bordures_terminales', false, 5);

-- Données initiales pour Bonnet
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order) VALUES
('bonnet', 'calotte', true, 1),
('bonnet', 'bordure_base', true, 2),
('bonnet', 'pompon', false, 3),
('bonnet', 'rabats_oreilles', false, 4),
('bonnet', 'attaches', false, 5),
('bonnet', 'bordures_rabats', false, 6),
('bonnet', 'motifs_surface', false, 7),
('bonnet', 'doublure', false, 8);

-- Données initiales pour Chaussettes
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order) VALUES
('chaussettes', 'jambe', true, 1),
('chaussettes', 'talon', true, 2),
('chaussettes', 'pied', true, 3),
('chaussettes', 'orteils', true, 4),
('chaussettes', 'motifs_jambe', false, 5),
('chaussettes', 'motifs_pied', false, 6),
('chaussettes', 'renforcement_talon', false, 7);

-- Dépendances pour Pull
INSERT INTO garment_part_dependencies (garment_type_key, parent_part_key, dependent_part_key) VALUES
('pull', 'manches', 'poignets'),
('pull', 'manches', 'emmanchures');

-- Dépendances pour Bonnet
INSERT INTO garment_part_dependencies (garment_type_key, parent_part_key, dependent_part_key) VALUES
('bonnet', 'rabats_oreilles', 'attaches'),
('bonnet', 'rabats_oreilles', 'bordures_rabats');
```

### API Endpoints
```typescript
// GET /api/garment-parts/configuration?type_key=pull
interface GarmentPartConfigResponse {
  success: boolean;
  data: {
    type_key: string;
    obligatory_parts: GarmentPartConfig[];
    optional_parts: GarmentPartConfig[];
    dependencies: PartDependency[];
  };
  error?: string;
}

interface GarmentPartConfig {
  part_key: string;
  is_obligatory: boolean;
  display_order: number;
  technical_impact: string[];
  measurement_requirements: string[];
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

**Exemples de clés à ajouter dans locales/en/translation.json** :
```json
{
  "part_dos_name": "Back",
  "part_dos_desc": "Back part of the garment",
  "part_devant_name": "Front", 
  "part_devant_desc": "Front part of the garment",
  "part_encolure_name": "Neckline",
  "part_encolure_desc": "Neck opening",
  "part_bordures_base_name": "Basic edges",
  "part_bordures_base_desc": "Edge finishing",
  "part_manches_name": "Sleeves",
  "part_manches_desc": "Arm coverage",
  "part_poignets_name": "Cuffs",
  "part_poignets_desc": "Sleeve finishing",
  "part_emmanchures_name": "Armholes",
  "part_emmanchures_desc": "Sleeve/body junction",
  "part_corps_principal_name": "Main body",
  "part_corps_principal_desc": "Primary scarf section",
  "part_bordures_laterales_name": "Side edges",
  "part_bordures_laterales_desc": "Side edge finishing",
  "part_franges_name": "Fringes",
  "part_franges_desc": "Decorative thread endings",
  "part_motifs_decoratifs_name": "Decorative patterns",
  "part_motifs_decoratifs_desc": "Ornamental design elements",
  "part_bordures_terminales_name": "End borders",
  "part_bordures_terminales_desc": "Terminal edge finishing",
  "part_calotte_name": "Crown",
  "part_calotte_desc": "Main hat section",
  "part_bordure_base_name": "Base edge",
  "part_bordure_base_desc": "Bottom edge finishing",
  "part_pompon_name": "Pompom",
  "part_pompon_desc": "Decorative top ornament",
  "part_rabats_oreilles_name": "Ear flaps",
  "part_rabats_oreilles_desc": "Side ear covering",
  "part_attaches_name": "Ties",
  "part_attaches_desc": "Connecting straps",
  "part_bordures_rabats_name": "Flap edges",
  "part_bordures_rabats_desc": "Ear flap edge finishing",
  "part_motifs_surface_name": "Surface patterns",
  "part_motifs_surface_desc": "Decorative surface designs",
  "part_doublure_name": "Lining",
  "part_doublure_desc": "Inner layer protection",
  "part_jambe_name": "Leg",
  "part_jambe_desc": "Sock leg section",
  "part_talon_name": "Heel",
  "part_talon_desc": "Heel reinforcement",
  "part_pied_name": "Foot",
  "part_pied_desc": "Foot covering section",
  "part_orteils_name": "Toes",
  "part_orteils_desc": "Toe covering section",
  "part_motifs_jambe_name": "Leg patterns",
  "part_motifs_jambe_desc": "Decorative leg designs",
  "part_motifs_pied_name": "Foot patterns",
  "part_motifs_pied_desc": "Decorative foot designs",
  "part_renforcement_talon_name": "Heel reinforcement",
  "part_renforcement_talon_desc": "Additional heel strength"
}
```

**Exemples de clés à ajouter dans locales/fr/translation.json** :
```json
{
  "part_dos_name": "Dos",
  "part_dos_desc": "Partie arrière du vêtement",
  "part_devant_name": "Devant", 
  "part_devant_desc": "Partie avant du vêtement",
  "part_encolure_name": "Encolure",
  "part_encolure_desc": "Ouverture pour le cou",
  "part_bordures_base_name": "Bordures de base",
  "part_bordures_base_desc": "Finitions des bords",
  "part_manches_name": "Manches",
  "part_manches_desc": "Couverture des bras",
  "part_poignets_name": "Poignets",
  "part_poignets_desc": "Finition des manches",
  "part_emmanchures_name": "Emmanchures",
  "part_emmanchures_desc": "Jonction manches/corps",
  "part_corps_principal_name": "Corps principal",
  "part_corps_principal_desc": "Section principale de l'écharpe",
  "part_bordures_laterales_name": "Bordures latérales",
  "part_bordures_laterales_desc": "Finition des bords latéraux",
  "part_franges_name": "Franges",
  "part_franges_desc": "Terminaisons décoratives",
  "part_motifs_decoratifs_name": "Motifs décoratifs",
  "part_motifs_decoratifs_desc": "Éléments ornementaux",
  "part_bordures_terminales_name": "Bordures terminales",
  "part_bordures_terminales_desc": "Finition des extrémités",
  "part_calotte_name": "Calotte",
  "part_calotte_desc": "Section principale du bonnet",
  "part_bordure_base_name": "Bordure de base",
  "part_bordure_base_desc": "Finition du bord inférieur",
  "part_pompon_name": "Pompon",
  "part_pompon_desc": "Ornement décoratif supérieur",
  "part_rabats_oreilles_name": "Rabats d'oreilles",
  "part_rabats_oreilles_desc": "Protection latérale des oreilles",
  "part_attaches_name": "Attaches",
  "part_attaches_desc": "Sangles de connexion",
  "part_bordures_rabats_name": "Bordures de rabats",
  "part_bordures_rabats_desc": "Finition des bords de rabats",
  "part_motifs_surface_name": "Motifs de surface",
  "part_motifs_surface_desc": "Designs décoratifs de surface",
  "part_doublure_name": "Doublure",
  "part_doublure_desc": "Protection de la couche intérieure",
  "part_jambe_name": "Jambe",
  "part_jambe_desc": "Section jambe de la chaussette",
  "part_talon_name": "Talon",
  "part_talon_desc": "Renforcement du talon",
  "part_pied_name": "Pied",
  "part_pied_desc": "Section de couverture du pied",
  "part_orteils_name": "Orteils",
  "part_orteils_desc": "Section de couverture des orteils",
  "part_motifs_jambe_name": "Motifs de jambe",
  "part_motifs_jambe_desc": "Designs décoratifs de jambe",
  "part_motifs_pied_name": "Motifs de pied",
  "part_motifs_pied_desc": "Designs décoratifs de pied",
  "part_renforcement_talon_name": "Renforcement talon",
  "part_renforcement_talon_desc": "Renforcement supplémentaire du talon"
}
```

### Components Architecture
**NEW Components**:
- `GarmentPartConfigurator.tsx` - Composant principal de configuration (client component)
- `GarmentPartCard.tsx` - Card individuelle pour chaque partie avec toggle
- `PartDependencyTree.tsx` - Visualisation des dépendances entre parties
- `GarmentSchematicView.tsx` - Aperçu schématique du vêtement avec parties surlignées

**REUSE Existing** (from architecture.md):
- Layout wizard existant depuis US_001
- Context PatternCreation pour persistance état multi-étapes
- Système de traduction i18n pour noms/descriptions des parties (pattern garment_types)
- Fonctions utilitaires `lib/garmentTranslations.ts` (extension)

**Modifications Required**:
- Extension du Context PatternCreation pour inclure `selectedParts: string[]`
- Extension de `lib/garmentTranslations.ts` avec fonctions pour parties
- Ajout traductions pour parties de vêtements dans locales/en et locales/fr

### Architecture Documentation Updates
**À ajouter dans architecture.md après implémentation**:
- Section Composants : GarmentPartConfigurator, GarmentPartCard, PartDependencyTree, GarmentSchematicView
- Section Routes API : /api/garment-parts/configuration
- Section Base de données : garment_part_configurations, garment_part_dependencies
- Section Context : Extension PatternCreationContext avec selectedParts

## IMPLEMENTATION CONSTRAINTS ⚠️

### DO NOT MODIFY
- Structure existante de `garment_types` (seulement ajout de nouvelles tables)
- Context PatternCreation existant (seulement extension)
- Composants de navigation et layout du wizard US_001
- Middleware d'authentification et protection des routes

### MUST REUSE (from architecture.md)
- Système de traduction i18n avec clés organisées (`part_*_name`, `part_*_desc`)
- Pattern d'authentification pour route `/dashboard/patterns/new`
- Types Database générés depuis Supabase pour typage strict
- Context PatternCreation existant pour persistance état wizard
- Pattern de traduction `garment_types` (utilisation de `type_key` → clés i18n)

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
- [ ] Component: `GarmentPartConfigurator.tsx` avec logique de configuration dynamique
- [ ] Component: `GarmentPartCard.tsx` pour affichage parties individuelles
- [ ] Component: `PartDependencyTree.tsx` pour gestion dépendances visuelles  
- [ ] API Endpoint: `/api/garment-parts/configuration` avec authentification
- [ ] Database: Tables `garment_part_configurations` et `garment_part_dependencies`
- [ ] Data: Configurations initiales pour Pull, Écharpe, Bonnet, Chaussettes
- [ ] Translations: Clés i18n pour toutes les parties en FR/EN (pattern `part_*_name` et `part_*_desc`)
- [ ] Documentation: `./implementation/US_002_implementation.md`

## VALIDATION CHECKLIST ✓
- [ ] Configuration automatique fonctionne pour tous les types supportés  
- [ ] Parties obligatoires non-désactivables, optionnelles modifiables
- [ ] Dépendances entre parties respectées et validées
- [ ] Interface responsive et accessible (clavier, screen readers)
- [ ] Traductions complètes et contextuellement appropriées
- [ ] État persisté correctement dans session pour étapes suivantes
- [ ] Performance acceptable sur connexions lentes (<3s chargement)
- [ ] Gestion d'erreurs gracieuse avec fallbacks appropriés
- [ ] Tests unitaires couvrent logique métier complexe (dépendances)
- [ ] Tests d'intégration valident flux complet wizard étapes 1→2

---
**Note**: Cette US doit être implémentée en respectant strictement les règles définies dans `malaine-rules.mdc` et l'architecture documentée dans `./docs/architecture.md`