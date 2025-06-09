# User Story US_003: Sections distinctes "Layette & Bébé" et "Enfant / Adulte"

## 📋 METADATA
- **Story ID**: US_003
- **Epic**: Pattern Creation Wizard
- **Priority**: Medium
- **Estimated Effort**: M(4-8h)
- **Dependencies**: US_001 (GarmentTypeSelector existant), US_002 (Configuration des parties)

## USER STORY STATEMENT
**As a** utilisateur créant un patron  
**I want** choisir entre deux sections distinctes "Layette & Bébé" et "Enfant / Adulte"  
**So that** je puisse accéder à une sélection de types de vêtements adaptée à mon projet de couture/tricot

## CONTEXT & BACKGROUND
L'écran de sélection du type de vêtement doit être réorganisé en deux sections principales distinctes plutôt qu'un système de filtres. L'utilisateur choisira d'abord sa section cible ("Layette & Bébé" pour les 0-24 mois, ou "Enfant / Adulte" pour tout le reste), puis accèdera aux filtres par catégorie et à la grille de types correspondante. Cette approche simplifie l'expérience utilisateur en créant des parcours spécialisés et évite la confusion entre les différents publics cibles.

## ACCEPTANCE CRITERIA ✅

**Scenario 1: Sélection de section au démarrage**
- **GIVEN** je suis sur l'écran de sélection de type de vêtement
- **WHEN** j'arrive sur la page
- **THEN** je vois deux grandes cartes de section : "Layette & Bébé" et "Enfant / Adulte"
- **AND** chaque carte affiche un aperçu du nombre de types disponibles et des exemples

**Scenario 2: Navigation dans la section "Layette & Bébé"**
- **GIVEN** je clique sur la section "Layette & Bébé"
- **WHEN** j'accède à cette section
- **THEN** je vois uniquement les types de vêtements pour bébés (0-24 mois)
- **AND** les filtres par catégorie sont adaptés au contexte bébé (Vêtements, Accessoires, Literie/Confort)
- **AND** je vois un breadcrumb ou un moyen de revenir à la sélection de section

**Scenario 3: Navigation dans la section "Enfant / Adulte"**
- **GIVEN** je clique sur la section "Enfant / Adulte"
- **WHEN** j'accède à cette section
- **THEN** je vois tous les autres types de vêtements (enfants, adultes, accessoires généraux)
- **AND** les filtres par catégorie standards sont disponibles
- **AND** je peux naviguer entre les sous-démographies si nécessaire

**Scenario 4: Filtrage dans chaque section**
- **GIVEN** je suis dans une section spécifique
- **WHEN** j'utilise les filtres par catégorie
- **THEN** seuls les types de la section courante et de la catégorie sélectionnée sont affichés
- **AND** les compteurs reflètent uniquement le contexte de la section active

## FUNCTIONAL REQUIREMENTS 📝

### UI Requirements
**Page/Component Location**: /dashboard/patterns/new (GarmentTypeSelector.tsx)

**Visual Elements**:
- [ ] **Écran de sélection de section**: Deux grandes cartes visuelles avec illustrations représentatives
- [ ] **Section "Layette & Bébé"**: 
  - Icônes et couleurs douces (pastels)
  - Exemples : "Brassière, Gigoteuse, Chaussons..."
  - Compteur de types disponibles
- [ ] **Section "Enfant / Adulte"**:
  - Design plus mature et polyvalent
  - Exemples : "Pull, Robe, Veste, Accessoires..."
  - Compteur de types disponibles
- [ ] **Navigation contextuelle**: Breadcrumb ou bouton retour vers sélection de section
- [ ] **Filtres adaptés**: Catégories spécialisées selon la section choisie

**User Interactions**:
- [ ] **Click sur carte de section** → Navigation vers la grille de types correspondante avec animation
- [ ] **Filtrage par catégorie** → Mise à jour instantanée dans le contexte de la section
- [ ] **Bouton retour section** → Retour à l'écran de choix des deux sections
- [ ] **Sélection type** → Panel de description adapté au contexte de section

### Business Logic
**Validation Rules**:
- Champ `section`: Enum {'baby', 'general'} → Message "Section non supportée"
- Combinaison `section + category`: Validation que la combinaison existe → Message "Aucun type disponible pour cette combinaison"

**Calculations/Transformations**:
- Comptage des types par section au chargement initial
- Filtrage en cascade : section → catégorie → types affichés
- Gestion des catégories spécialisées par section

### Data Requirements
- **Input**: Sélection utilisateur de section ('baby' | 'general')
- **Processing**: Filtrage des garment_types selon section + category
- **Output**: Liste filtrée des types avec métadonnées de section
- **Storage**: Persistance de la section sélectionnée dans le PatternCreationContext

## TECHNICAL SPECIFICATIONS 🔧

### Architecture References
- **Patterns à utiliser**: Navigation par étapes + système de filtrage existant de CategoryFilter.tsx
- **Composants existants**: GarmentTypeSelector, GarmentTypeCard, CategoryFilter (à adapter)
- **Services/Helpers disponibles**: getTranslatedGarmentName, getTranslatedGarmentDesc, PatternCreationContext

### Database Schema
```sql
-- Ajout d'une colonne section dans garment_types
ALTER TABLE garment_types ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'general' CHECK (section IN ('baby', 'general'));

-- Mise à jour des types existants (tous comme 'general' par défaut)
UPDATE garment_types SET section = 'general' WHERE section IS NULL;

-- Insertion des nouveaux types pour section bébé
INSERT INTO garment_types (type_key, category, section, is_active) VALUES
  ('brassiere', 'clothing', 'baby', true),
  ('combinaison_bebe', 'clothing', 'baby', true),
  ('gigoteuse', 'clothing', 'baby', true),
  ('barboteuse', 'clothing', 'baby', true),
  ('chaussons_bebe', 'accessories', 'baby', true),
  ('bonnet_bebe', 'accessories', 'baby', true),
  ('moufles_bebe', 'accessories', 'baby', true),
  ('bavoir_tricote', 'accessories', 'baby', true),
  ('couverture_bebe', 'bedding', 'baby', true),
  ('cape_bain', 'bedding', 'baby', true),
  ('doudou_tricote', 'bedding', 'baby', true),
  ('nid_ange', 'bedding', 'baby', true);

-- Ajout des nouvelles catégories spécialisées pour bébé
-- Note: 'bedding' pour Literie/Confort bébé
```

### API Endpoints
```typescript
// GET /api/garment-types?section=baby&category=clothing
interface GarmentTypesQuery extends NextRequest {
  searchParams: {
    section?: 'baby' | 'general' | 'all';
    category?: 'clothing' | 'accessories' | 'bedding' | 'all';
  }
}
interface GarmentTypesResponse {
  success: boolean;
  data: GarmentType[];
  counts: {
    total: number;
    bySection: { baby: number; general: number };
    byCategory: { 
      clothing: number; 
      accessories: number; 
      bedding?: number; // Spécifique section bébé
    };
  };
  availableCategories: string[]; // Catégories disponibles pour la section
}

// GET /api/garment-types/sections - Nouvel endpoint pour données des sections
interface SectionsResponse {
  success: boolean;
  data: {
    baby: {
      count: number;
      exampleTypes: string[];
      categories: string[];
    };
    general: {
      count: number;
      exampleTypes: string[];
      categories: string[];
    };
  };
}
```

### Components Architecture
**NEW Components**:
- `SectionSelector.tsx` - /components/patterns/SectionSelector.tsx : Écran de choix entre les deux sections
- `SectionBreadcrumb.tsx` - /components/patterns/SectionBreadcrumb.tsx : Navigation contextuelle avec retour

**REUSE Existing** (from architecture.md):
- `GarmentTypeSelector` - Refactorer pour gérer la navigation par section
- `CategoryFilter` - Adapter pour catégories contextuelles par section
- `GarmentTypeCard` - Adapter affichage selon contexte de section

**Modifications Required**:
- `GarmentTypeSelector.tsx` - Restructurer avec état de navigation section + grille
- `CategoryFilter.tsx` - Accepter prop availableCategories selon section
- `GarmentTypeCard.tsx` - Styling et contenu contextuel selon section

### State Management
```typescript
// Extension du PatternCreationContext
interface PatternCreationState {
  // ... existing state
  selectedSection: 'baby' | 'general' | null;
  sectionStep: 'selection' | 'types'; // Navigation state
  availableCategories: string[];
}
```

## IMPLEMENTATION CONSTRAINTS ⚠️

### DO NOT MODIFY
- Structure existante de garment_types.id (clé primaire)
- Logique de PatternCreationContext pour selectedGarmentType
- Composants GarmentPartConfigurator (US_002) - ne pas impacter
- Système de traduction i18n existant (structure des clés)

### MUST REUSE (from architecture.md)
- Système de traduction via getTranslatedGarmentName/Desc
- Pattern de filtrage existant dans CategoryFilter
- Structure de state du PatternCreationContext
- Conventions de nommage des type_key

### TECHNICAL CONSTRAINTS
- Respecter pattern Page → Service → API → Supabase
- Utiliser `getSupabaseSessionApi` pour les routes authentifiées
- Maintenir rétrocompatibilité : types existants restent 'general'
- Gérer hydratation SSR pour éviter flash de contenu
- Navigation fluide entre sélection section et grille types
- Traductions complètes EN/FR pour nouveaux types bébé + catégories

## TESTING SCENARIOS 🧪

### Happy Path
1. Chargement initial → Affichage des deux cartes de section avec compteurs
2. Clic "Layette & Bébé" → Navigation vers grille types bébé avec catégories spécialisées
3. Filtrage "Literie/Confort" → Affichage gigoteuse, couverture, doudou
4. Sélection "Gigoteuse" → Description contextuelle bébé
5. Retour section → Retour aux deux cartes, puis choix "Enfant / Adulte"
6. Navigation section générale → Grille types standards avec catégories classiques
→ **Résultat**: Navigation fluide entre sections avec contextes spécialisés

### Error Cases
1. **Section vide**: Navigation section bébé sans types → Message informatif avec redirection
2. **Problème API sections**: Chargement → Affichage placeholder avec retry
3. **Catégorie inexistante pour section**: Filtrage → Fallback gracieux

### Edge Cases
1. **Type sélectionné + changement section**: Désélection automatique avec notification
2. **Navigation rapide entre sections**: Debouncing et gestion états loading
3. **Responsive**: Cartes de section et navigation adaptées mobile/desktop

## DELIVERABLES 📦
- [ ] Component: `SectionSelector.tsx`
- [ ] Component: `SectionBreadcrumb.tsx`
- [ ] API Endpoint: Extension GET `/api/garment-types` avec paramètre section
- [ ] API Endpoint: Nouveau GET `/api/garment-types/sections`
- [ ] Database Changes: Colonne `section` + données types bébé + catégories
- [ ] Translation Keys: Nouvelles clés pour types bébé + sections + catégories
- [ ] Documentation: `./implementation/US_003_implementation.md`

## VALIDATION CHECKLIST ✓
- [ ] Navigation entre sections fonctionne correctement
- [ ] Cartes de section informatives et attractives
- [ ] Filtrage par catégorie contextuel à chaque section
- [ ] Types bébé correctement organisés par catégories spécialisées
- [ ] Interface responsive pour cartes de section et navigation
- [ ] Breadcrumb/navigation retour fonctionnelle
- [ ] Aucune régression sur fonctionnalités existantes
- [ ] PatternCreationContext gère l'état de section
- [ ] Messages d'erreur appropriés
- [ ] Performance acceptable (<1s pour navigation)
- [ ] Accessibilité clavier respectée sur tous les éléments

---
**Note**: Cette approche par sections distinctes offre une expérience plus claire et spécialisée, avec des parcours dédiés selon le type de projet de couture/tricot. 