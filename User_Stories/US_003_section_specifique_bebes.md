# User Story US_003: Toggle de section "Layette & Bébé" / "Enfant / Adulte"

## 📋 METADATA
- **Story ID**: US_003
- **Epic**: Pattern Creation Wizard
- **Priority**: Medium
- **Estimated Effort**: S (2-4h)
- **Dependencies**: US_001 (GarmentTypeSelector existant)

## USER STORY STATEMENT
**As a** utilisateur créant un patron  
**I want** avoir un toggle pour choisir entre "Layette & Bébé" et "Enfant / Adulte"  
**So that** je puisse voir uniquement les types de vêtements adaptés à mon projet

## CONTEXT & BACKGROUND
Ajout d'un simple toggle à deux positions sur l'écran de sélection du type de vêtement pour filtrer dynamiquement entre les sections "Layette & Bébé" (0-24 mois) et "Enfant / Adulte". Le filtrage se fait via une colonne `section` dans la table `garment_types`.

## ACCEPTANCE CRITERIA ✅

**Scenario 1: Toggle de section**
- **GIVEN** je suis sur l'écran de sélection de type de vêtement
- **WHEN** j'arrive sur la page
- **THEN** je vois un toggle avec deux options : "Layette & Bébé" et "Enfant / Adulte"
- **AND** la section "Enfant / Adulte" est sélectionnée par défaut

**Scenario 2: Filtrage dynamique**
- **GIVEN** je change la position du toggle
- **WHEN** je sélectionne "Layette & Bébé"
- **THEN** seuls les types de vêtements avec `section = 'baby'` sont affichés
- **AND** les filtres de catégorie se mettent à jour selon les catégories disponibles pour les types bébé

**Scenario 3: Retour à la section générale**
- **GIVEN** je suis en mode "Layette & Bébé"
- **WHEN** je bascule vers "Enfant / Adulte"
- **THEN** tous les types avec `section = 'general'` sont affichés
- **AND** les filtres de catégorie reviennent aux catégories standard

## FUNCTIONAL REQUIREMENTS 📝

### UI Requirements
**Page/Component Location**: /dashboard/patterns/new (GarmentTypeSelector.tsx)

**Visual Elements**:
- [ ] **Toggle simple** : Composant switch/toggle avec deux labels
- [ ] **Position par défaut** : "Enfant / Adulte" sélectionné au chargement
- [ ] **Mise à jour instantanée** : Grille et filtres se mettent à jour immédiatement

**User Interactions**:
- [ ] **Click toggle** → Filtrage instantané des types de vêtements
- [ ] **Filtres adaptatifs** → Les catégories disponibles changent selon la section

### Data Requirements
- **Input**: Toggle position ('baby' | 'general')
- **Processing**: Filtrage des garment_types selon section
- **Output**: Liste filtrée des types + catégories disponibles
- **Storage**: Section sélectionnée dans le PatternCreationContext

## TECHNICAL SPECIFICATIONS 🔧

### Database Schema
```sql
-- Ajout d'une colonne section dans garment_types
ALTER TABLE garment_types ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'general' CHECK (section IN ('baby', 'general'));

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
```

### API Endpoints
```typescript
// Extension de GET /api/garment-types
interface GarmentTypesQuery {
  section?: 'baby' | 'general';
  category?: string;
}
```

### Components
**MODIFY Existing**:
- `GarmentTypeSelector.tsx` - Ajouter le toggle et gérer le filtrage par section
- `CategoryFilter.tsx` - Adapter les catégories selon la section active

**NEW Components**:
- `SectionToggle.tsx` - Composant toggle simple pour la sélection de section

### State Management
```typescript
// Extension du PatternCreationContext
interface PatternCreationState {
  // ... existing state
  selectedSection: 'baby' | 'general';
}
```

## IMPLEMENTATION CONSTRAINTS ⚠️

### MUST REUSE
- Système de filtrage existant dans CategoryFilter
- Structure de state du PatternCreationContext
- Pattern Page → Service → API → Supabase

### TECHNICAL CONSTRAINTS
- Maintenir rétrocompatibilité : types existants restent 'general'
- Toggle responsive mobile/desktop
- Traductions EN/FR pour nouveaux types bébé

## TESTING SCENARIOS 🧪

### Happy Path
1. Chargement initial → Toggle sur "Enfant / Adulte", types généraux affichés
2. Clic toggle vers "Layette & Bébé" → Affichage types bébé uniquement
3. Filtrage par catégorie → Catégories adaptées à la section
4. Retour toggle "Enfant / Adulte" → Retour aux types généraux

## DELIVERABLES 📦
- [ ] Component: `SectionToggle.tsx`
- [ ] Modification: `GarmentTypeSelector.tsx` (ajout toggle + filtrage)
- [ ] Modification: `CategoryFilter.tsx` (catégories adaptatives)
- [ ] API: Extension `/api/garment-types` avec paramètre section
- [ ] Database: Colonne section + données types bébé
- [ ] Translation Keys: Nouvelles clés pour types bébé

## VALIDATION CHECKLIST ✓
- [ ] Toggle fonctionne et filtre correctement
- [ ] Filtrage par catégorie adaptatif selon section
- [ ] Types bébé correctement affichés en mode "Layette & Bébé"
- [ ] Interface responsive
- [ ] Aucune régression sur fonctionnalités existantes
- [ ] PatternCreationContext gère selectedSection 