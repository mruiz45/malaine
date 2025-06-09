# Architecture du Projet Malaine

## 📁 Structure du Projet

### Vue d'Ensemble
```
malaine/
├── app/                          # App Router Next.js 15 - Pages et API routes
│   ├── api/                      # Routes API serveur
│   ├── dashboard/                # Zone protégée utilisateur
│   ├── admin/                    # Zone administration
│   ├── login/                    # Authentification
│   ├── signup/                   # Inscription
│   ├── unauthorized/             # Page d'accès refusé
│   ├── layout.tsx                # Layout principal avec auth
│   ├── page.tsx                  # Page d'accueil
│   └── globals.css               # Styles globaux
├── components/                   # Composants React réutilisables
│   ├── auth/                     # Composants d'authentification
│   ├── dashboard/                # Composants spécifiques au dashboard
│   ├── Header.tsx                # En-tête principal avec navigation
│   ├── Footer.tsx                # Pied de page
│   ├── LanguageSwitcher.tsx      # Sélecteur de langue i18n
│   └── Providers.tsx             # Providers React globaux
├── lib/                          # Utilitaires et configuration
│   ├── supabase/                 # Configuration Supabase client/serveur
│   ├── database.types.ts         # Types TypeScript générés depuis Supabase
│   ├── types.ts                  # Types personnalisés
│   ├── i18n.ts                   # Configuration internationalisation
│   └── garmentTranslations.ts    # Utilitaires traduction vêtements
├── public/                       # Assets statiques
│   ├── locales/                  # Fichiers de traduction JSON
│   │   ├── en/                   # Traductions anglaises
│   │   └── fr/                   # Traductions françaises
│   └── *.svg                     # Icônes et images
├── middleware.ts                 # Middleware Next.js pour auth et routing
├── package.json                  # Dépendances et scripts
├── tsconfig.json                 # Configuration TypeScript
└── next.config.ts                # Configuration Next.js
```

### Dossiers Principaux

- **`/app`** - App Router Next.js 15 avec pages et API routes intégrées
  - **`/api`** - Routes API backend avec pattern serveur Supabase
  - **`/dashboard`** - Interface utilisateur protégée
  - **`/admin`** - Interface administration (rôle admin requis)
  - **`/login`, `/signup`** - Pages d'authentification avec Server Actions
  - **`layout.tsx`** - Layout racine avec récupération session utilisateur

- **`/components`** - Composants React modulaires et réutilisables
  - **`/auth`** - Composants spécifiques à l'authentification
  - **`/dashboard`** - Composants métier pour le dashboard

- **`/lib`** - Configuration, utilitaires et types
  - **`/supabase`** - Clients Supabase (serveur/navigateur)
  - **`database.types.ts`** - Types auto-générés depuis schéma Supabase
  - **`types.ts`** - Types métier personnalisés
  - **`i18n.ts`** - Configuration i18next
  - **`garmentTranslations.ts`** - Système de traduction des vêtements

- **`/public/locales`** - Fichiers de traduction i18next par langue

## 🏗️ Architecture Technique

### Stack Technique
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, CSS natives
- **Backend**: Supabase (PostgreSQL), Next.js API Routes
- **State Management**: React Context API, Server Components
- **Authentication**: Supabase Auth avec middleware Next.js
- **Internationalization**: i18next avec détection automatique de langue + traductions dynamiques des vêtements
- **Dev Tools**: ESLint, TypeScript strict mode

### Patterns Architecturaux

#### 1. Flux de Données (App Router)
```
Server Components → Supabase (serveur) → Database
Client Components → API Routes → Supabase (serveur) → Database
```

#### 2. Pattern d'Authentification
```
Middleware.ts → Vérification session → Redirection conditionnelle
Layout.tsx → Récupération user/profile → Props vers composants
API Routes → getUser() via Supabase serveur → Autorisation
```

#### 3. Architecture Client/Serveur
- **Server Components** : Accès direct à Supabase serveur (lecture)
- **Client Components** : Communication via API routes (mutations)
- **Middleware** : Gestion des redirections et protection des routes
- **Server Actions** : Actions serveur pour formulaires (login/signup)

#### 4. Gestion des Rôles
```
User (table auth.users) → Profile (table profiles) → Role (string)
Middleware → Vérification rôle → Protection routes /admin
```

#### 5. Système de Traduction des Vêtements
```
Base de données (FR) → garmentTranslations.ts → Clés i18n → Traductions (EN/FR)
```

## 🧩 Composants Réutilisables

### Composants UI
| Composant | Localisation | Description | Props | Exemple d'usage |
|-----------|--------------|-------------|-------|-----------------|
| Header | /components/Header.tsx | En-tête avec navigation et auth | user: UserDetails \| null | `<Header user={userDetails} />` |
| Footer | /components/Footer.tsx | Pied de page simple | Aucune | `<Footer />` |
| LanguageSwitcher | /components/LanguageSwitcher.tsx | Sélecteur de langue i18n | Aucune | `<LanguageSwitcher />` |
| Providers | /components/Providers.tsx | Provider i18n global | children: ReactNode | `<Providers>{children}</Providers>` |

### Composants d'Authentification
| Composant | Localisation | Description | Props/Usage |
|-----------|--------------|-------------|-------------|
| LogoutButton | /components/auth/LogoutButton.tsx | Bouton de déconnexion | Aucune prop |

### Composants Métier
| Composant | Localisation | Description | Dépendances |
|-----------|--------------|-------------|-------------|
| ProfileSection | /components/dashboard/ProfileSection.tsx | Affichage profil utilisateur | Types Database |
| PreferencesSection | /components/dashboard/PreferencesSection.tsx | Gestion préférences utilisateur | API routes |
| PatternCreationCTA | /components/dashboard/PatternCreationCTA.tsx | Call-to-action création patron avec traductions i18n | Next.js Link, useTranslation |
| NewPatternClient | /app/dashboard/patterns/new/NewPatternClient.tsx | Composant client pour traductions de création patron | i18n, PatternCreationWizard |

### Composants Pattern Creation
| Composant | Localisation | Description | Props | Exemple d'usage |
|-----------|--------------|-------------|-------|-----------------|
| GarmentTypeSelector | /components/patterns/GarmentTypeSelector.tsx | Interface principale de sélection de types avec traductions complètes et filtrage par section | types: GarmentType[], onContinue: () => void | `<GarmentTypeSelector types={types} onContinue={handleNext} />` |
| GarmentTypeCard | /components/patterns/GarmentTypeCard.tsx | Card individuelle pour un type avec traductions noms/descriptions | type: GarmentType, selected: boolean, onClick: (type) => void | `<GarmentTypeCard type={type} selected={false} onClick={handleSelect} />` |
| CategoryFilter | /components/patterns/CategoryFilter.tsx | Filtres par catégorie incluant support "bedding" pour section bébé | selectedCategory: string, onCategoryChange: (cat) => void, itemCounts: object | `<CategoryFilter selectedCategory="all" onCategoryChange={setFilter} itemCounts={{all: 8, clothing: 4, accessories: 4, bedding: 4}} />` |
| SectionToggle | /components/patterns/SectionToggle.tsx | Toggle pour basculer entre sections "Layette & Bébé" et "Enfant / Adulte" | selectedSection: 'baby' \| 'general', onSectionChange: (section) => void | `<SectionToggle selectedSection="general" onSectionChange={handleSectionChange} />` |
| GarmentPartConfigurator | /components/patterns/GarmentPartConfigurator.tsx | Interface principale de configuration des parties avec gestion dépendances | selectedType: GarmentType, onContinue: () => void | `<GarmentPartConfigurator selectedType={type} onContinue={handleNext} />` |
| GarmentPartCard | /components/patterns/GarmentPartCard.tsx | Card individuelle pour une partie avec toggle et statut | partKey: string, isObligatory: boolean, isSelected: boolean, onToggle?: (key) => void | `<GarmentPartCard partKey="manches" isObligatory={false} isSelected={true} onToggle={handleToggle} />` |

## 🔌 Configuration et Providers

### Configuration Supabase
| Fichier | Responsabilité | Usage | Exemple |
|---------|----------------|-------|---------|
| lib/supabase/server.ts | Client Supabase serveur | Server Components, API routes | `const supabase = createClient()` |
| lib/supabase/client.ts | Client Supabase navigateur | Client Components (rare) | `const supabase = createClient()` |

### Configuration i18n
| Fichier | Responsabilité | Configuration |
|---------|----------------|---------------|
| lib/i18n.ts | Configuration i18next | Langues: en (défaut), fr ; Détection automatique |
| components/Providers.tsx | Provider i18n global | I18nextProvider wrapper |
| public/locales/en/translation.json | Traductions anglaises | 60+ clés pour dashboard, pattern wizard et vêtements |
| public/locales/fr/translation.json | Traductions françaises | 60+ clés complètes pour toute l'interface |
| lib/garmentTranslations.ts | Utilitaire traduction vêtements | Mapping noms/descriptions BDD vers clés i18n |

### Conventions i18n
- **Hydratation SSR** : Tous les composants clients utilisent `useState` + `useEffect` pour éviter les erreurs d'hydratation
- **Fallbacks** : Texte par défaut en français affiché avant hydratation côté client
- **Clés organisées** : Préfixe par section (`dashboard_`, `pattern_wizard_`, `pattern_cta_`, `garment_`, etc.)
- **Couverture complète** : Dashboard, breadcrumbs, wizard, CTA, badges de catégorie tous traduits
- **Traductions dynamiques** : Noms et descriptions de vêtements traduits depuis BDD française vers anglais

### Système de Traduction des Vêtements (Optimisé)
Le système utilise `type_key` comme base pour générer automatiquement les clés de traduction i18n, éliminant les mappings complexes :

```typescript
// Base de données (clé stable)
type_key: "chale_poncho"

// Génération automatique des clés i18n
garment_chale_poncho_name → "Shawl/Poncho" (EN) / "Châle/Poncho" (FR)
garment_chale_poncho_desc → "Loose garment for shoulders" (EN) / "Pièce ample pour les épaules" (FR)
```

**Fonctions utilitaires optimisées** :
- `getGarmentNameKey(typeKey)` - Génère la clé i18n pour un nom
- `getGarmentDescKey(typeKey)` - Génère la clé i18n pour une description
- `getTranslatedGarmentName(garmentType, t)` - Traduit directement le nom
- `getTranslatedGarmentDesc(garmentType, t)` - Traduit directement la description

**Avantages** :
- ✅ Plus simple : Pas de mapping complexe, utilise `type_key` directement
- ✅ Plus maintenable : Nouveau vêtement = 2 clés i18n seulement  
- ✅ Plus stable : `type_key` est une clé unique, pas de dépendance aux textes
- ✅ Évite la redondance : `display_name` et `description` ne sont plus nécessaires

### Système de Traduction des Parties (US_002)
Le système utilise le même pattern que `garment_types` pour les parties de vêtements :

```typescript
// Base de données (clé stable)
part_key: "manches"

// Génération automatique des clés i18n
part_manches_name → "Sleeves" (EN) / "Manches" (FR)
part_manches_desc → "Arm coverage" (EN) / "Couverture des bras" (FR)
```

**Fonctions utilitaires étendues** (dans `lib/garmentTranslations.ts`) :
- `getPartNameKey(partKey)` - Génère la clé i18n pour un nom de partie
- `getPartDescKey(partKey)` - Génère la clé i18n pour une description de partie
- `getTranslatedPartName(partKey, t)` - Traduit directement le nom d'une partie
- `getTranslatedPartDesc(partKey, t)` - Traduit directement la description d'une partie

## 🛣️ Routes et Navigation

### Pages Publiques
| Route | Fichier | Description | Authentification |
|-------|---------|-------------|------------------|
| `/` | app/page.tsx | Page d'accueil | Non requise |
| `/login` | app/login/page.tsx | Connexion utilisateur | Redirect si connecté |
| `/signup` | app/signup/page.tsx | Inscription utilisateur | Redirect si connecté |
| `/unauthorized` | app/unauthorized/page.tsx | Accès refusé | Non requise |

### Pages Protégées
| Route | Fichier | Description | Auth Required | Rôle |
|-------|---------|-------------|---------------|------|
| `/dashboard` | app/dashboard/page.tsx | Tableau de bord utilisateur | Oui | user/admin |
| `/dashboard/patterns/new` | app/dashboard/patterns/new/page.tsx | Wizard création de patron - étape 1 | Oui | user/admin |
| `/dashboard/patterns/new/parts` | app/dashboard/patterns/new/parts/page.tsx | Wizard création de patron - étape 2 (configuration parties) | Oui | user/admin |
| `/admin` | app/admin/page.tsx | Interface administration | Oui | admin |

### API Routes
| Endpoint | Méthode | Description | Auth Required | Fichier |
|----------|---------|-------------|---------------|---------|
| `/api/user/profile` | PATCH | Mise à jour profil utilisateur | Oui | app/api/user/profile/route.ts |
| `/api/garment-types` | GET | Récupération types de vêtements actifs avec filtrage optionnel par section (?section=baby\|general) | Oui | app/api/garment-types/route.ts |
| `/api/garment-parts/configuration` | GET | Configuration des parties par type de vêtement | Oui | app/api/garment-parts/configuration/route.ts |

### Server Actions
| Action | Fichier | Description | Usage |
|--------|---------|-------------|-------|
| login | app/login/actions.ts | Authentification utilisateur | Formulaires de connexion |

## 💾 Base de Données Supabase

### Tables Principales
| Table | Description | Colonnes clés | Relations |
|-------|-------------|---------------|-----------|
| `profiles` | Profils utilisateurs étendus | id, role, language_preference | Liée à auth.users |
| `gauge_profiles` | Profils d'échantillons tricot | user_id, stitch_count, row_count | → profiles |
| `measurement_sets` | Jeux de mesures corporelles | user_id, set_name, mesures... | → profiles |
| `yarn_profiles` | Profils de fils à tricoter | user_id, yarn_name, properties | → profiles |
| `pattern_definition_sessions` | Sessions de définition de patrons | user_id, parameters, status | → profiles |
| `garment_types` | Types de vêtements disponibles | type_key, display_name, description_short, category | Base référentielle |
| `garment_part_configurations` | Configuration des parties par type | garment_type_key, part_key, is_obligatory, display_order | → garment_types |
| `garment_part_dependencies` | Dépendances entre parties de vêtements | garment_type_key, parent_part_key, dependent_part_key | → garment_types |
| `stitch_patterns` | Bibliothèque de motifs de points | stitch_name, craft_type, difficulty | Base référentielle |

### Conventions de Schéma
- Toutes les tables ont `id` (UUID), `created_at`, `updated_at`
- Foreign keys suivent le pattern `[table]_id`
- Colonnes JSON pour données flexibles (`Json` type)
- Soft deletes non implémentés (suppression physique)
- RLS (Row Level Security) configuré pour sécurité

### Gestion Multilingue des Données (Optimisée)
- **Stockage** : Seule la clé stable `type_key` est nécessaire dans `garment_types`
- **Traduction** : Génération automatique des clés i18n via `garmentTranslations.ts`
- **Affichage** : Texte traduit selon la langue utilisateur (EN/FR)

**Optimisation du schéma** : Les colonnes `display_name`, `description` et `description_short` peuvent être supprimées car elles sont redondantes avec le système i18n basé sur `type_key`.

### Types TypeScript Générés
Le fichier `lib/database.types.ts` est auto-généré depuis le schéma Supabase :
```typescript
// Types principaux
export type Database = { public: { Tables: {...}, Views: {...} } }
export type Tables<T> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T> = Database['public']['Tables'][T]['Update']
```

## 🌐 Internationalisation Avancée

### Couverture Traductionnelle
- ✅ **Interface utilisateur** : 100% traduite (EN/FR)
- ✅ **Navigation et menus** : Complètement traduits
- ✅ **Formulaires et boutons** : Tous traduits  
- ✅ **Messages et notifications** : Traductions complètes
- ✅ **Contenu dynamique (vêtements)** : Système de traduction automatique
- ✅ **Descriptions et labels** : Traductions contextuelles

### Types de Traductions
1. **Statiques** : Textes d'interface dans `translation.json`
2. **Dynamiques** : Contenus de base de données via `garmentTranslations.ts`
3. **Fallbacks** : Textes par défaut pendant l'hydratation SSR

### Performance i18n
- **Hydratation différée** : Évite les erreurs de mismatch SSR/Client
- **Chargement paresseux** : Traductions chargées selon la langue active
- **Cache navigateur** : Traductions mises en cache côté client

## 📋 État du Projet

### ✅ Fonctionnalités Complètes
- **Authentification** : Login/Signup avec Supabase Auth
- **Dashboard** : Interface utilisateur avec profils et préférences
- **Wizard Création** : Sélection de type de vêtement avec traductions complètes et filtrage par section (Layette & Bébé / Enfant & Adulte)
- **Configuration Parties** : Étape 2 du wizard avec gestion dépendances et parties obligatoires/optionnelles
- **Support Vêtements Bébé** : Extension US_004 avec contraintes de sécurité et traductions spécialisées pour la layette
- **Internationalisation** : Support complet EN/FR avec traductions dynamiques et 40+ nouvelles clés pour vêtements bébé
- **Navigation** : Routing complet avec protection auth
- **Base de données** : Schéma complet avec types TypeScript, support des sections et colonnes sécurité bébé

### 🚧 En Développement  
- Étape 3 du wizard (mensurations, finalisation)
- Génération de patrons de tricot
- Gestion avancée des profils utilisateur
- Interface d'administration

### 📈 Prochaines Améliorations
- Tests automatisés (Jest, Cypress)
- Monitoring et analytics
- Optimisations de performance
- Support mobile avancé

## 📋 Checklist de Maintenance

Lors d'ajouts/modifications, s'assurer de :
- [ ] Mettre à jour ce document d'architecture
- [ ] Respecter les conventions de nommage
- [ ] Ajouter les traductions nécessaires
- [ ] Vérifier la sécurité des nouvelles routes
- [ ] Tester l'authentification et les rôles
- [ ] Valider le bon fonctionnement en SSR
- [ ] Documenter les nouveaux patterns le cas échéant