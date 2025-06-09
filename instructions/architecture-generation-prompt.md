# Prompt pour Générer le Document d'Architecture Initial

## 🎯 OBJECTIF
Analyser le projet "malaine" existant et générer un document d'architecture complet (`./docs/architecture.md`) qui servira de référence pour toutes les futures implémentations.

## 📋 INSTRUCTIONS

Tu vas analyser l'ensemble du projet et créer un document d'architecture exhaustif. Ce document doit capturer l'état actuel du projet et servir de guide pour les développements futurs.

### 1. ANALYSE REQUISE

Examine en détail:
1. **Structure des dossiers** - Liste tous les dossiers et leur rôle
2. **Fichiers de configuration** - package.json, tsconfig.json, next.config.js, etc.
3. **Composants existants** - Catalogue de tous les composants réutilisables
4. **Services et Contextes** - Liste des services, contexts, et leur responsabilité
5. **Routes API** - Toutes les routes existantes et leur fonction
6. **Modèles de données** - Schéma de base de données Supabase
7. **Patterns utilisés** - Patterns architecturaux identifiés
8. **Dépendances** - Libraries principales et leur utilisation

### 2. STRUCTURE DU DOCUMENT À GÉNÉRER

```markdown
# Architecture du Projet Malaine

## 📁 Structure du Projet

### Vue d'Ensemble
[Arborescence complète avec descriptions]

### Dossiers Principaux
- `/src` - [Description]
  - `/components` - [Description et conventions]
  - `/contexts` - [Description et liste]
  - `/services` - [Description et liste]
  - `/lib` - [Utilitaires et helpers]
  - `/styles` - [Styles globaux et Tailwind]
  - `/types` - [Types TypeScript partagés]
- `/pages` - [Pages Next.js]
  - `/api` - [Routes API]
- `/public` - [Assets statiques]

## 🏗️ Architecture Technique

### Stack Technique
- **Frontend**: Next.js 14 (Pages Router), React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Backend**: Supabase (PostgreSQL), Next.js API Routes
- **State Management**: React Context API
- **Authentication**: Supabase Auth avec cookies HttpOnly
- **Internationalization**: i18next

### Patterns Architecturaux

#### 1. Flux de Données
```
Pages/Components → Services/Contexts → API Routes → Supabase
```

#### 2. Pattern BFF (Backend for Frontend)
[Description du pattern et exemples]

#### 3. Authentication Flow
[Diagramme et explication du flux d'auth]

## 🧩 Composants Réutilisables

### Composants UI
| Composant | Localisation | Description | Props | Exemple d'usage |
|-----------|--------------|-------------|-------|-----------------|
| Button | /components/ui/Button.tsx | Bouton réutilisable | variant, size, onClick | `<Button variant="primary">` |
| [etc...] | | | | |

### Composants Métier
| Composant | Localisation | Description | Dépendances |
|-----------|--------------|-------------|-------------|
| [etc...] | | | |

## 🔌 Services et Contextes

### Contexts
| Context | Fichier | Responsabilité | État géré | Méthodes principales |
|---------|---------|----------------|-----------|---------------------|
| AuthContext | /contexts/AuthContext.tsx | Gestion auth | user, loading | signIn(), signOut() |
| [etc...] | | | | |

### Services
| Service | Fichier | Responsabilité | Méthodes principales |
|---------|---------|----------------|---------------------|
| [etc...] | | | |

## 🛣️ Routes API

### Endpoints d'Authentification
| Route | Méthode | Description | Auth Required | Request/Response |
|-------|---------|-------------|---------------|------------------|
| /api/auth/signin | POST | Connexion | Non | {email, password} → {user} |
| [etc...] | | | | |

### Endpoints Métier
[Tableau similaire]

## 💾 Base de Données

### Schéma Supabase
```sql
-- Tables principales avec relations
```

### Conventions
- Toutes les tables ont `id`, `created_at`, `updated_at`
- Foreign keys suivent le pattern `[table]_id`
- [Autres conventions]

## 🔧 Helpers et Utilitaires

### Helpers d'Authentification
| Helper | Localisation | Usage | Exemple |
|--------|--------------|-------|---------|
| getSupabaseSessionApi | /lib/getSupabaseSession.ts | Récupérer session dans API | `const session = await getSupabaseSessionApi(req, res)` |
| [etc...] | | | |

## 📝 Conventions de Code

### Nommage
- **Composants**: PascalCase (`UserProfile.tsx`)
- **Helpers/Utils**: camelCase (`getUserData.ts`)
- **API Routes**: kebab-case (`/api/user-profile`)
- **Types/Interfaces**: PascalCase avec préfixe I (`IUserProfile`)

### Structure des Composants
```typescript
// Template standard d'un composant
```

### Structure des API Routes
```typescript
// Template standard d'une route API
```

## 🚀 Guides d'Implémentation

### Comment Ajouter une Nouvelle Page
1. Créer le fichier dans `/pages`
2. [Étapes détaillées]

### Comment Ajouter une Route API
1. Créer le fichier dans `/pages/api`
2. Utiliser le template standard
3. [Étapes détaillées]

### Comment Utiliser Supabase
```typescript
// Dans une route API
const session = await getSupabaseSessionApi(req, res);
if (!session) return res.status(401).json({error: 'Unauthorized'});
const { supabase, user } = session;
// Utiliser supabase...
```

### Comment Gérer les Traductions
1. Ajouter la clé dans `/public/locales/en/common.json`
2. Utiliser avec `t('key')`

## 🔄 État du Projet

### Fonctionnalités Implémentées
- [ ] Authentification (signin, signup, logout)
- [ ] Gestion du profil utilisateur
- [ ] [Autres fonctionnalités]

### Dépendances Principales
```json
{
  "next": "version",
  "@supabase/supabase-js": "version",
  [etc...]
}
```

## 📌 Points d'Attention

### Pièges à Éviter
1. Ne jamais utiliser le client Supabase directement dans les pages
2. [Autres pièges]

### Bonnes Pratiques
1. Toujours tester l'existence d'un composant avant d'en créer un nouveau
2. [Autres pratiques]

## 🔍 Référence Rapide

### Commandes Utiles
```bash
npm run dev          # Développement
npm run type-check   # Vérification TypeScript
[etc...]
```

### Variables d'Environnement
| Variable | Description | Exemple |
|----------|-------------|---------|
| NEXT_PUBLIC_SUPABASE_URL | URL Supabase | https://xxx.supabase.co |
| [etc...] | | |

---

**Dernière mise à jour**: [Date]
**Version**: 1.0.0
```

### 3. ÉLÉMENTS SPÉCIFIQUES À DOCUMENTER

Assure-toi d'inclure:
- **Tous les composants existants** avec leurs props et usage
- **Tous les patterns de code** récurrents
- **Toutes les routes API** avec leur signature exacte
- **Tous les helpers** et leur utilisation
- **Toutes les conventions** implicites du projet
- **Les erreurs communes** et comment les éviter

### 4. FORMAT DE SORTIE

Génère le document en Markdown, prêt à être sauvegardé dans `./docs/architecture.md`. Le document doit être:
- **Exhaustif** mais concis
- **Pratique** avec des exemples de code
- **Navigable** avec une table des matières
- **Maintenable** avec des sections claires pour les ajouts futurs

---

**Analyse maintenant le projet et génère le document d'architecture complet.**