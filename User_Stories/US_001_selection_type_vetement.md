# User Story US_001: Sélection du Type de Vêtement

## 📋 METADATA
- **Story ID**: US_001
- **Epic**: Fondations du Patron - Paramètres Essentiels
- **Priority**: Critical
- **Estimated Effort**: S (2-4h)
- **Dependencies**: None

## USER STORY STATEMENT
**As a** utilisateur souhaitant créer un patron de tricot personnalisé  
**I want** sélectionner un type de vêtement parmi une liste visuelle et organisée  
**So that** l'application puisse adapter l'interface et les paramètres spécifiques au type de projet choisi

## CONTEXT & BACKGROUND
Cette fonctionnalité constitue la première étape essentielle du parcours de création de patron. Le choix du type de vêtement détermine :
- Les parties constitutives du patron (ex: dos/devant/manches pour un pull)
- Les paramètres de mensurations requis
- Les options de construction disponibles
- La logique de calcul spécifique

Selon les requirements, la V1 se concentrera sur les pulls, mais l'architecture doit permettre l'extension future vers d'autres types. La table `garment_types` existe déjà dans le schéma Supabase comme base référentielle.

## ACCEPTANCE CRITERIA ✅

**Scenario 1: Affichage de la sélection de type de vêtement**
- **GIVEN** un utilisateur authentifié accède à la page de création de patron
- **WHEN** la page se charge
- **THEN** une interface de sélection des types de vêtements s'affiche
- **AND** les types supportés sont visibles avec vignettes illustrées
- **AND** chaque type affiche un nom et une description courte
- **AND** aucun type n'est présélectionné par défaut

**Scenario 2: Sélection d'un type de vêtement**
- **GIVEN** l'interface de sélection est affichée
- **WHEN** l'utilisateur clique sur un type de vêtement (ex: "Pull")
- **THEN** le type est visuellement sélectionné (border colorée, checkmark)
- **AND** la description détaillée du type s'affiche
- **AND** un bouton "Continuer" devient actif
- **AND** les autres types restent cliquables pour changement de sélection

**Scenario 3: Filtrage par catégorie**
- **GIVEN** l'interface de sélection contient plusieurs types
- **WHEN** l'utilisateur utilise les filtres de catégorie ("Vêtements", "Accessoires", "Tous")
- **THEN** seuls les types correspondant à la catégorie sélectionnée s'affichent
- **AND** le compteur de types affichés se met à jour
- **AND** la sélection en cours est préservée si visible, sinon effacée

**Scenario 4: Navigation vers l'étape suivante**
- **GIVEN** un type de vêtement est sélectionné
- **WHEN** l'utilisateur clique sur "Continuer"
- **THEN** l'application navigue vers l'étape suivante (saisie d'échantillon)
- **AND** le type sélectionné est persisté dans la session
- **AND** l'interface s'adapte au type choisi

**Scenario 5: Retour et modification du choix**
- **GIVEN** l'utilisateur a progressé dans le parcours de création
- **WHEN** il revient à l'étape de sélection du type
- **THEN** son choix précédent est affiché comme sélectionné
- **AND** il peut modifier sa sélection
- **AND** les données des étapes suivantes sont préservées si compatible

## FUNCTIONAL REQUIREMENTS 📝

### UI Requirements
**Page/Component Location**: `/dashboard/patterns/new` (première étape du wizard)

**Visual Elements**:
- [ ] **Titre de section**: "Quel type de projet souhaitez-vous créer ?" - positionné en haut, style h2
- [ ] **Grille de sélection**: Layout en grid responsive (3 colonnes desktop, 2 colonnes tablet, 1 colonne mobile)
- [ ] **Cards de type**: Pour chaque type disponible, carte avec :
  - Image/icône représentative (150x100px minimum)
  - Nom du type (ex: "Pull", "Gilet")
  - Description courte (1-2 lignes)
  - Border état normal/hover/selected avec couleurs différenciées
  - Checkmark visible uniquement si sélectionné
- [ ] **Filtres de catégorie**: Boutons toggle horizontaux au-dessus de la grille
- [ ] **Panel de description**: Zone latérale ou en bas affichant détails du type sélectionné
- [ ] **Bouton Continuer**: Désactivé par défaut, activé uniquement si sélection faite
- [ ] **Indicateur de progression**: Step 1/5 du wizard de création

**User Interactions**:
- [ ] **Clic sur card de type** → Sélection exclusive (dé-sélection des autres)
- [ ] **Clic sur filtre catégorie** → Filtrage immédiat avec animation fade
- [ ] **Hover sur card** → Effet de survol avec légère élévation
- [ ] **Clic "Continuer"** → Navigation vers `/dashboard/patterns/new/gauge`
- [ ] **Clic breadcrumb/retour** → Retour possible avec préservation des données

### Business Logic
**Validation Rules**:
- **Sélection**: Obligatoire - Une et une seule sélection requise pour continuer
- **Type disponible**: Le type doit exister dans `garment_types` et être actif

**Data Flow**:
- Chargement des types depuis API `/api/garment-types` 
- Persistance de la sélection dans état du wizard (React Context)
- Validation côté client et serveur avant navigation

### Data Requirements
- **Input**: Aucune donnée initiale requise
- **Processing**: Récupération des types depuis base référentielle + filtrage
- **Output**: Objet type sélectionné avec propriétés complètes
- **Storage**: Sélection stockée dans session pattern création (temporaire)

## TECHNICAL SPECIFICATIONS 🔧

### Architecture References
- **Patterns à utiliser**: App Router Next.js 15, Server Components pour chargement initial
- **Composants existants**: Header navigation, Layout dashboard (architecture.md)
- **Services/Helpers disponibles**: Types Database générés, Client Supabase serveur

### Database Schema
```sql
-- Table existante dans architecture.md, vérifier structure actuelle
-- Si besoin d'ajout de colonnes pour catégories ou images
ALTER TABLE garment_types 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'clothing',
ADD COLUMN IF NOT EXISTS description_short TEXT,
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Données initiales si table vide
INSERT INTO garment_types (type_key, display_name, category, description_short, is_active) VALUES
('pull', 'Pull', 'clothing', 'Vêtement tricoté couvrant le torse et les bras', true),
('gilet', 'Gilet', 'clothing', 'Vêtement sans manches, avec ou sans boutonnage', true),
('echarpe', 'Écharpe', 'accessories', 'Accessoire long et étroit pour le cou', true),
('chale_poncho', 'Châle/Poncho', 'accessories', 'Pièce ample pour les épaules', true),
('bonnet', 'Bonnet', 'accessories', 'Couvre-chef ajusté pour la tête', true),
('chaussettes', 'Chaussettes', 'accessories', 'Accessoire pour les pieds', true),
('sac', 'Sac', 'accessories', 'Accessoire de transport et rangement', true),
('accessoires_deco', 'Accessoires/Déco', 'accessories', 'Objets décoratifs ou utilitaires', true);
```

### API Endpoints
```typescript
// GET /api/garment-types
interface GarmentType {
  type_key: string;
  display_name: string;
  category: 'clothing' | 'accessories';
  description_short: string;
  image_url?: string;
  is_active: boolean;
}

interface ResponseBody {
  success: boolean;
  data: GarmentType[];
  error?: string;
}
```

### Components Architecture
**NEW Components**:
- `GarmentTypeSelector.tsx` - Composant principal de sélection (client component)
- `GarmentTypeCard.tsx` - Card individuelle pour chaque type (réutilisable)
- `CategoryFilter.tsx` - Composant de filtrage par catégorie

**REUSE Existing** (from architecture.md):
- `Header` - Navigation existante
- Layout dashboard - Structure de page
- Providers - Context i18n

**Modifications Required**:
- Nouveau page `/app/dashboard/patterns/new/page.tsx` - Point d'entrée wizard création
- Context wizard de création pour gestion d'état multi-étapes

### Architecture Documentation Updates
**À ajouter dans architecture.md après implémentation**:
- Section Composants: GarmentTypeSelector, GarmentTypeCard, CategoryFilter
- Section Routes: /dashboard/patterns/new, API /api/garment-types
- Section Contexts: PatternCreationContext pour état wizard

## IMPLEMENTATION CONSTRAINTS ⚠️

### DO NOT MODIFY
- Table `garment_types` structure existante (seulement ajout de colonnes)
- Header.tsx et composants navigation existants
- Configuration Supabase et middleware d'auth
- Layout dashboard principal

### MUST REUSE (from architecture.md)
- Pattern d'authentification : protection route via middleware
- Types Database générés depuis Supabase
- Client Supabase serveur pour API routes
- Structure layout dashboard existante

### TECHNICAL CONSTRAINTS
- Respecter pattern App Router : Server Component pour chargement initial, Client Components pour interactivité
- Utiliser TypeScript strict avec types générés Database
- Interface responsive compatible mobile/desktop
- Accessibilité : labels appropriés, navigation clavier
- Performance : optimisation images, lazy loading si nécessaire
- Gestion d'erreur : états de chargement, erreurs réseau, types inexistants

## TESTING SCENARIOS 🧪

### Happy Path
1. **Accès page création** → Route protégée accessible si authentifié
2. **Chargement types** → API répond avec liste complète des types actifs
3. **Affichage interface** → Grille responsive avec cards visuelles
4. **Filtrage catégorie** → Filtres fonctionnels avec animations fluides
5. **Sélection type** → Visual feedback immédiat, bouton Continuer activé
6. **Navigation suivante** → Transition vers étape échantillon avec données persistées
→ **Résultat**: Type sélectionné stocké, progression wizard fonctionnelle

### Error Cases
1. **Erreur API garment-types**: API indisponible → Message "Impossible de charger les types, veuillez réessayer" + bouton retry
2. **Aucun type actif**: Base vide → Message informatif "Aucun type disponible actuellement"
3. **Erreur de navigation**: Transition échoue → Reste sur page avec message d'erreur
4. **Session expirée**: Auth expirée → Redirection automatique vers login via middleware

### Edge Cases
1. **Changement de sélection**: Multiple sélections rapides → Seulement la dernière prise en compte
2. **Navigation arrière**: Retour depuis étape suivante → Sélection précédente correctement restaurée
3. **Refresh page**: F5 en cours de sélection → Retour état initial (pas de persistance)
4. **Responsive breakpoints**: Redimensionnement fenêtre → Layout s'adapte fluidement

## DELIVERABLES 📦
- [ ] Component: `GarmentTypeSelector.tsx` - Composant principal
- [ ] Component: `GarmentTypeCard.tsx` - Card individuelle
- [ ] Component: `CategoryFilter.tsx` - Filtres catégorie
- [ ] Page: `/app/dashboard/patterns/new/page.tsx` - Point d'entrée
- [ ] API Route: `/app/api/garment-types/route.ts` - Endpoint types
- [ ] Context: Pattern creation wizard state management
- [ ] Database: Migration colonnes garment_types si nécessaire
- [ ] Documentation: `./implementation/US_001_implementation.md`

## VALIDATION CHECKLIST ✓
- [ ] Interface de sélection affichée avec tous les types actifs
- [ ] Sélection exclusive fonctionnelle avec feedback visuel
- [ ] Filtres par catégorie opérationnels
- [ ] Navigation vers étape suivante avec persistance données
- [ ] Gestion d'erreurs API et cas limites
- [ ] Interface responsive desktop/mobile
- [ ] Accessibilité : navigation clavier, screen readers
- [ ] Performance : chargement rapide, animations fluides
- [ ] Tests manuels : parcours complet création patron
- [ ] Code review : respect conventions TypeScript et architecture

---
**Note**: Cette US doit être implémentée en respectant strictement les règles définies dans `malaine-rules.mdc` et l'architecture documentée dans `./docs/architecture.md` 