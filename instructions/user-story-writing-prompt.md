# Prompt pour Rédaction de User Story

## 🎯 OBJECTIF
Rédiger une User Story complète et détaillée pour le projet "malaine" à partir des requirements fournis, en suivant le format standard et en anticipant tous les besoins d'implémentation.

## 📋 CONTEXTE DU PROJET
Le projet "malaine" est une application web de gestion de patrons de tricot utilisant:
- **Frontend**: Next.js (Pages Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), API Routes Next.js
- **Architecture**: Page → Service → API → Supabase
- **Auth**: Gestion des sessions via cookies HttpOnly

## 🔧 INSTRUCTIONS POUR LA RÉDACTION

### 1. ANALYSE DES REQUIREMENTS
Avant de rédiger, tu dois:
0. **Lire** le document `./docs/requirements_all.md` pour comprendre:
   - L'ensemble du projet
   - Les particularités relatives à la User Story à rédiger
1. **Lire** le document `./docs/architecture.md` pour comprendre:
   - Les composants et services existants
   - Les patterns et conventions établis
   - Les helpers et utilitaires disponibles
2. **Identifier** le besoin utilisateur principal
3. **Décomposer** en fonctionnalités atomiques si nécessaire
4. **Évaluer** la complexité (simple US ou besoin de plusieurs US)
5. **Vérifier** les dépendances avec les fonctionnalités existantes documentées
6. **Identifier** les éléments réutilisables depuis architecture.md

### 2. RÈGLES DE RÉDACTION

#### 2.1 Granularité
- **Une US = Une fonctionnalité testable indépendamment**
- Si trop complexe → Diviser en plusieurs US
- Si trop simple → Regrouper avec des fonctionnalités connexes

#### 2.2 Clarté et Précision
- **Spécifier** exactement ce qui doit être visible/cliquable
- **Détailler** chaque interaction utilisateur
- **Définir** tous les cas d'erreur
- **Anticiper** les questions d'implémentation

#### 2.3 Contraintes Techniques
- **Respecter** l'architecture existante documentée dans architecture.md
- **Réutiliser** les composants/patterns existants (vérifier dans architecture.md)
- **Minimiser** les modifications du code existant
- **Éviter** d'introduire de nouvelles dépendances
- **Référencer** explicitement les éléments de architecture.md à réutiliser

### 3. STRUCTURE DE LA USER STORY

Utilise EXACTEMENT ce template:

```markdown
# User Story [ID]: [Titre Descriptif]

## 📋 METADATA
- **Story ID**: US_[numéro séquentiel]
- **Epic**: [Epic parent si applicable]
- **Priority**: [Critical/High/Medium/Low]
- **Estimated Effort**: [XS(1-2h)/S(2-4h)/M(4-8h)/L(1-2j)/XL(>2j)]
- **Dependencies**: [US_X, US_Y] ou "None"

## USER STORY STATEMENT
**As a** [type d'utilisateur précis]  
**I want** [action/fonctionnalité spécifique]  
**So that** [bénéfice métier mesurable]

## CONTEXT & BACKGROUND
[Expliquer pourquoi cette fonctionnalité est nécessaire, comment elle s'intègre dans le flux global de l'application, et tout contexte métier pertinent]

## ACCEPTANCE CRITERIA ✅
[Utiliser le format Gherkin - minimum 3-5 critères]

**Scenario 1: [Nom du scénario]**
- **GIVEN** [état initial]
- **WHEN** [action utilisateur]
- **THEN** [résultat attendu]
- **AND** [condition supplémentaire si nécessaire]

[Répéter pour chaque scénario]

## FUNCTIONAL REQUIREMENTS 📝

### UI Requirements
**Page/Component Location**: [Chemin exact: ex. /patterns/new]

**Visual Elements**:
- [ ] [Élément 1]: [Description détaillée incluant position, style, contenu]
- [ ] [Élément 2]: [Description détaillée]

**User Interactions**:
- [ ] [Click sur bouton X] → [Comportement Y avec détails]
- [ ] [Saisie dans champ Z] → [Validation et feedback]

### Business Logic
**Validation Rules**:
- [Champ/Donnée]: [Règle précise] → [Message d'erreur exact]

**Calculations/Transformations**:
- [Si applicable, formules ou logique métier]

### Data Requirements
- **Input**: [Structure exacte des données entrantes]
- **Processing**: [Transformations nécessaires]
- **Output**: [Structure exacte des données sortantes]
- **Storage**: [Ce qui doit être persisté et où]

## TECHNICAL SPECIFICATIONS 🔧

### Architecture References
- **Patterns à utiliser**: [Référencer patterns depuis architecture.md]
- **Composants existants**: [Lister depuis architecture.md]
- **Services/Helpers disponibles**: [Lister depuis architecture.md]

### Database Schema
[SEULEMENT si nouvelles tables/colonnes nécessaires]
```sql
-- Commenter si modification de table existante
ALTER TABLE existing_table ADD COLUMN IF NOT EXISTS ...

-- Ou nouvelle table
CREATE TABLE IF NOT EXISTS ... (
  -- Définition complète
);
```

### API Endpoints
[Spécifier clairement méthode, route, payload, response]
```typescript
// POST /api/[resource]/[action]
interface RequestBody {
  field1: string;
  field2: number;
}
interface ResponseBody {
  success: boolean;
  data?: {...};
  error?: string;
}
```

### Components Architecture
**NEW Components**:
- `ComponentName.tsx` - [Localisation et responsabilité exacte]

**REUSE Existing** (from architecture.md):
- `ExistingComponent` from [path] - [Comment le réutiliser]

**Modifications Required**:
- `FileToModify.tsx` - [Modification précise et pourquoi]

### Architecture Documentation Updates
**À ajouter dans architecture.md après implémentation**:
- Section Composants: [Nouveaux composants]
- Section Routes API: [Nouvelles routes]
- Section Services: [Nouveaux services]
- Autres sections: [Si applicable]

## IMPLEMENTATION CONSTRAINTS ⚠️

### DO NOT MODIFY
- [Liste explicite des fichiers/fonctionnalités à NE PAS toucher]

### MUST REUSE (from architecture.md)
- [Composants existants documentés dans architecture.md]
- [Services existants documentés dans architecture.md]
- [Patterns établis dans architecture.md]

### TECHNICAL CONSTRAINTS
- Respecter pattern Page → Service → API → Supabase
- Utiliser `getSupabaseSessionApi` pour les routes authentifiées
- Suivre les conventions documentées dans architecture.md
- Gérer tous les cas d'erreur
- Maintenir la compatibilité avec l'existant

## TESTING SCENARIOS 🧪

### Happy Path
1. [Étape détaillée 1]
2. [Étape détaillée 2]
→ **Résultat**: [État final attendu]

### Error Cases
1. **[Type d'erreur]**: [Reproduction] → [Comportement attendu]

### Edge Cases
1. **[Cas limite]**: [Scénario] → [Gestion attendue]

## DELIVERABLES 📦
- [ ] Component(s): [Liste précise]
- [ ] API Endpoint(s): [Liste précise]
- [ ] Database Changes: [Si applicable]
- [ ] Documentation: `./implementation/US_[X]_implementation.md`

## VALIDATION CHECKLIST ✓
[Liste de vérification pour confirmer que l'implémentation est complète]

---
**Note**: Cette US doit être implémentée en respectant strictement les règles définies dans `malaine-rules.mdc` et l'architecture documentée dans `./docs/architecture.md`
```

### 4. PROCESS DE RÉDACTION

1. **DRAFT INITIAL**
   - Rédiger une première version complète
   - Vérifier la cohérence avec l'architecture existante

2. **REVUE TECHNIQUE**
   - Valider la faisabilité technique
   - Identifier les risques/difficultés
   - Optimiser pour la réutilisation de code

3. **FINALISATION**
   - Ajouter tous les détails d'implémentation
   - Vérifier qu'aucune ambiguïté ne subsiste
   - S'assurer que tous les cas sont couverts

### 5. ANTI-PATTERNS À ÉVITER ❌

1. **User Story trop vague**
   ```
   ❌ "L'utilisateur peut gérer ses patrons"
   ✅ "L'utilisateur peut créer un nouveau patron en saisissant nom, catégorie et description"
   ```

2. **Mélanger plusieurs fonctionnalités**
   ```
   ❌ Une US qui inclut création + édition + suppression
   ✅ Trois US séparées (CRUD découpé)
   ```

3. **Oublier les cas d'erreur**
   ```
   ❌ "L'utilisateur sauvegarde le patron"
   ✅ "L'utilisateur sauvegarde le patron. Si erreur réseau → message 'Connexion perdue'. Si validation échoue → afficher erreurs par champ"
   ```

4. **Spécifications techniques incomplètes**
   ```
   ❌ "Créer une API pour sauvegarder"
   ✅ "POST /api/patterns/create avec body {name: string, category_id: number} retourne {success: boolean, pattern_id?: string}"
   ```

## 🎯 OUTPUT ATTENDU

Fournis la User Story complète en suivant exactement le template, avec:
- Tous les champs remplis
- Aucune ambiguïté
- Détails techniques suffisants pour implémenter sans questions
- Cas d'erreur et edge cases anticipés
- Le fichier créé se trouvera dans le folder: ´./User_Stories/´

---

**Requirements à transformer en User Story:**
Voici une partie des réquirements qui doivent être complémentés et enrichis, sur base de la compréhension du document `./docs/requirements_all.md`.

### **US2.3 : Saisie manuelle des mensurations corporelles complètes**
**En tant qu'** utilisateur  
**Je veux** saisir manuellement toutes les mensurations nécessaires  
**Pour** obtenir un patron parfaitement ajusté à la morphologie et la démographie

**Détail fonctionnel :**
**13 mesures standards selon le PDF + 2 nouvelles :**
1. **Tour de Poitrine** (Chest/Bust)
2. **Longueur Dos du Col au Poignet** (Center Back Neck-to-Wrist)
3. **Longueur Taille Dos** (Back Waist Length)
4. **Carrure Dos** (Cross Back)
5. **Longueur de Manche** (Arm Length to Underarm)
6. **Tour de Bras** (Upper Arm)
7. **Profondeur d'Emmanchure** (Armhole Depth)
8. **Tour de Taille** (Waist)
9. **Tour de Hanches** (Hip)
10. **Tour de Tête** (Head Circumference)
11. **Hauteur Totale du Pull** (Overall Garment Length)
12. **Largeur d'Épaule** (Shoulder Width)
13. **Tour de Poignet** (Wrist Circumference)
14. **Longueur de Jambe** (Leg Length) -- A n'utiliser que dans la partie "babé / layette"
15. **Pointure** (Shoe Size)

- Saisie en cm et pouces avec conversion automatique (sauf pour la pointure des pieds)
- Validation des valeurs (cohérence anatomique et démographique (enfants, adultes, bébé, homme/femme, garçon/fille))
- Champs conditionnels selon le type de vêtement
- Sauvegarde progressive (pas de perte de données)

**Critères d'acceptation :**
- ✅ Interface de saisie claire avec unités sélectionnables
- ✅ Validation en temps réel des valeurs saisies
- ✅ Masquage des mesures non nécessaires selon le type
- ✅ Calculs automatiques de mesures dérivées quand possible
- ✅ Indicateurs visuels des champs obligatoires/optionnels
