# Prompt pour Mise à Jour du Document d'Architecture

## 🎯 OBJECTIF
Mettre à jour le document `./docs/architecture.md` après l'implémentation de la User Story US_[NUMBER] pour maintenir la documentation à jour et faciliter les futures implémentations.

## 📋 INSTRUCTIONS

### 1. ÉLÉMENTS À VÉRIFIER ET METTRE À JOUR

#### 1.1 Nouveaux Composants
Pour chaque nouveau composant créé, ajouter dans la section appropriée :
```markdown
| ComponentName | /path/to/Component.tsx | Description claire | Props avec types | `<Component prop="value" />` |
```

#### 1.2 Nouvelles Routes API
Pour chaque nouvelle route API, ajouter :
```markdown
| /api/path | METHOD | Description | Oui/Non | Req: `{structure}` → Res: `{structure}` |
```

#### 1.3 Nouveaux Services/Helpers
Pour chaque nouveau service ou helper :
```markdown
| serviceName | /path/to/service.ts | Description du rôle | `method1()`, `method2()` |
```

#### 1.4 Modifications du Schéma de Base de Données
Si des tables ont été ajoutées ou modifiées :
```sql
-- Ajouter la définition SQL complète
-- Inclure les policies RLS si applicable
```

#### 1.5 Nouveaux Patterns ou Conventions
Si de nouveaux patterns ont été introduits, les documenter dans la section appropriée.

### 2. SECTIONS À METTRE À JOUR SYSTÉMATIQUEMENT

- [ ] **État du Projet** : Cocher les fonctionnalités implémentées
- [ ] **Dernière mise à jour** : Mettre à jour la date
- [ ] **Version** : Incrémenter si changement majeur

### 3. FORMAT DE MISE À JOUR

Utilise ce format pour tes mises à jour :

```markdown
## 📝 Mises à jour architecture.md suite à US_[NUMBER]

### Composants Ajoutés
- **ComponentName** (`/path/to/Component.tsx`)
  - Description: [Rôle du composant]
  - Props: `{prop1: type, prop2: type}`
  - Usage: `<Component prop1={value} />`
  - Section mise à jour: "Composants UI" ou "Composants Métier"

### Routes API Ajoutées
- **POST /api/resource/action**
  - Description: [Ce que fait l'endpoint]
  - Auth Required: Oui/Non
  - Request: `{field1: type, field2: type}`
  - Response: `{success: boolean, data?: type}`
  - Section mise à jour: "Routes API > [Catégorie]"

### Services/Helpers Ajoutés
- **serviceName** (`/path/to/service.ts`)
  - Méthodes: `method1()`, `method2()`
  - Description: [Rôle du service]
  - Section mise à jour: "Services" ou "Helpers"

### Autres Modifications
- [Toute autre modification importante]

### État du Projet Mis à Jour
- [x] Nouvelle fonctionnalité implémentée
```

### 4. VÉRIFICATIONS FINALES

Avant de finaliser la mise à jour :
1. ✅ Vérifier que tous les nouveaux éléments sont documentés
2. ✅ Vérifier que les exemples de code sont corrects
3. ✅ Vérifier que les chemins de fichiers sont exacts
4. ✅ Vérifier la cohérence avec le reste du document
5. ✅ Mettre à jour la date et version si nécessaire

### 5. EXEMPLE DE MISE À JOUR COMPLÈTE

```markdown
## 📝 Mises à jour architecture.md suite à US_5 (Pattern Definition Session)

### Composants Ajoutés

1. **PatternDefinitionWorkspace** (`/src/components/patterns/PatternDefinitionWorkspace.tsx`)
   - Description: Interface principale pour la définition d'un nouveau patron
   - Props: `{sessionId?: string}`
   - Usage: `<PatternDefinitionWorkspace />`
   - Section mise à jour: "Composants Métier"

2. **DefinitionStepper** (`/src/components/patterns/DefinitionStepper.tsx`)
   - Description: Navigation par étapes pour la définition
   - Props: `{currentStep: number, onStepChange: (step: number) => void}`
   - Usage: `<DefinitionStepper currentStep={1} onStepChange={handleStepChange} />`
   - Section mise à jour: "Composants UI"

### Routes API Ajoutées

1. **POST /api/pattern-sessions/create**
   - Description: Créer une nouvelle session de définition de patron
   - Auth Required: Oui
   - Request: `{sessionName?: string}`
   - Response: `{success: boolean, sessionId: string}`
   - Section mise à jour: "Routes API > Pattern Management"

2. **PUT /api/pattern-sessions/[id]**
   - Description: Mettre à jour une session existante
   - Auth Required: Oui
   - Request: `{gaugeProfileId?: string, measurementSetId?: string, ...}`
   - Response: `{success: boolean, session: PatternSession}`
   - Section mise à jour: "Routes API > Pattern Management"

### Base de Données Modifiée

```sql
CREATE TABLE IF NOT EXISTS pattern_definition_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_name VARCHAR(255),
    selected_gauge_profile_id UUID REFERENCES gauge_profiles(id),
    selected_measurement_set_id UUID REFERENCES measurement_sets(id),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### État du Projet Mis à Jour
- ✅ Authentification (signin, signup, signout)
- ✅ Gestion du profil utilisateur
- ✅ Protection des routes
- ✅ Interface de définition de patron (NEW)
- ⬜ Calculs de tricot
- ⬜ Export PDF

### Dernière mise à jour: [DATE DU JOUR]
```

---

**Procède maintenant à la mise à jour du document architecture.md en suivant ces instructions.**