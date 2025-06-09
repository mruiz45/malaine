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
│   └── i18n.ts                   # Configuration internationalisation
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

- **`/public/locales`** - Fichiers de traduction i18next par langue

## 🏗️ Architecture Technique

### Stack Technique
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, CSS natives
- **Backend**: Supabase (PostgreSQL), Next.js API Routes
- **State Management**: React Context API, Server Components
- **Authentication**: Supabase Auth avec middleware Next.js
- **Internationalization**: i18next avec détection automatique de langue
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
| `/admin` | app/admin/page.tsx | Interface administration | Oui | admin |

### API Routes
| Endpoint | Méthode | Description | Auth Required | Fichier |
|----------|---------|-------------|---------------|---------|
| `/api/user/profile` | PATCH | Mise à jour profil utilisateur | Oui | app/api/user/profile/route.ts |

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
| `garment_types` | Types de vêtements disponibles | type_key, display_name | Base référentielle |
| `stitch_patterns` | Bibliothèque de motifs de points | stitch_name, craft_type, difficulty | Base référentielle |

### Conventions de Schéma
- Toutes les tables ont `id` (UUID), `created_at`, `updated_at`
- Foreign keys suivent le pattern `[table]_id`
- Colonnes JSON pour données flexibles (`Json` type)
- Soft deletes non implémentés (suppression physique)
- RLS (Row Level Security) configuré pour sécurité

### Types TypeScript Générés
Le fichier `lib/database.types.ts` est auto-généré depuis le schéma Supabase :
```typescript
// Types principaux
export type Database = { public: { Tables: {...}, Views: {...} } }
export type Tables<T> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T> = Database['public']['Tables'][T]['Update']
```

## 🔧 Helpers et Utilitaires

### Types Personnalisés
| Type | Localisation | Usage | Définition |
|------|--------------|-------|------------|
| UserDetails | /lib/types.ts | Utilisateur avec rôle | `User & { role: string }` |

### Patterns de Code Récurrents

#### Template API Route Authentifiée
```typescript
// app/api/example/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createServerClient(/* config */);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Logique métier
  return NextResponse.json(data);
}
```

#### Template Server Component avec Auth
```typescript
// app/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Accès direct aux données
  const { data } = await supabase.from('table').select('*');
  
  return <div>{/* Rendu */}</div>;
}
```

## 📝 Conventions de Code

### Nommage
- **Composants**: PascalCase (`UserProfile.tsx`)
- **Fichiers utils**: camelCase (`formatDate.ts`)
- **API Routes**: Segments kebab-case dans URL
- **Types/Interfaces**: PascalCase (`UserDetails`)
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Structure des Composants
```typescript
// Template composant client
"use client";

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function ComponentName() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      {isClient ? t('translation_key') : 'Fallback'}
    </div>
  );
}
```

### Structure des Server Actions
```typescript
// app/*/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function actionName(formData: FormData) {
  const supabase = createClient();
  // Logique
  revalidatePath('/', 'layout');
  redirect('/destination');
}
```

## 🚀 Guides d'Implémentation

### Comment Ajouter une Nouvelle Page Protégée
1. Créer le fichier dans `/app/nouvelle-page/page.tsx`
2. Ajouter la protection dans `middleware.ts` si nécessaire
3. Ajouter le lien de navigation dans `Header.tsx`
4. Ajouter les traductions dans `/public/locales/*/translation.json`

### Comment Ajouter une Route API
1. Créer le fichier dans `/app/api/route-name/route.ts`
2. Utiliser le template d'authentification Supabase
3. Implémenter la validation des données d'entrée
4. Gérer les erreurs avec codes HTTP appropriés
5. Documenter la route dans cette architecture

### Comment Utiliser Supabase
```typescript
// Dans un Server Component
const supabase = createClient(); // serveur
const { data } = await supabase.from('table').select('*');

// Dans une API route
const supabase = createServerClient(/* config avec cookies */);
const { data: { user } } = await supabase.auth.getUser();
```

### Comment Gérer les Traductions
1. Ajouter la clé dans `/public/locales/en/translation.json`
2. Optionnellement ajouter en français dans `/public/locales/fr/translation.json`
3. Utiliser avec `const { t } = useTranslation(); t('key')`
4. Gérer l'hydratation avec state `isClient` pour SSR

### Comment Ajouter un Nouveau Rôle
1. Modifier la colonne `role` dans la table `profiles`
2. Ajouter la logique de vérification dans `middleware.ts`
3. Mettre à jour les conditions dans `Header.tsx`
4. Créer les pages spécifiques au rôle si nécessaire

## 🔄 État du Projet

### Fonctionnalités Implémentées
- ✅ **Authentification** : Login/Signup avec Server Actions
- ✅ **Gestion des rôles** : user/admin avec middleware de protection
- ✅ **Profils utilisateurs** : Extension auth avec préférences
- ✅ **Internationalisation** : i18next avec détection automatique (en/fr)
- ✅ **Protection des routes** : Middleware pour auth et rôles
- ✅ **Interface de base** : Header, Footer, navigation responsive
- ✅ **Dashboard utilisateur** : Interface protégée de base
- ✅ **Interface admin** : Zone administration protégée

### Architecture de Base de Données
- ✅ **Tables métier** : Profiles, gauge_profiles, measurement_sets, yarn_profiles
- ✅ **Tables référentielles** : garment_types, stitch_patterns, morphology_advisories
- ✅ **Sessions de travail** : pattern_definition_sessions avec composants
- ✅ **Types TypeScript** : Génération automatique depuis schéma

### Fonctionnalités en Cours/Prochaines
- 🔄 **Workspace de définition de patrons** : Interface principale métier
- 🔄 **Gestion des échantillons** : CRUD gauge profiles
- 🔄 **Gestion des mesures** : CRUD measurement sets
- 🔄 **Bibliothèque de fils** : CRUD yarn profiles
- 🔄 **Génération de patrons** : Calculs et export

### Dépendances Principales
```json
{
  "next": "15.3.3",
  "@supabase/ssr": "^0.6.1",
  "@supabase/supabase-js": "^2.50.0",
  "react": "^19.0.0",
  "react-i18next": "^15.5.2",
  "i18next": "^25.2.1",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

## 📌 Points d'Attention

### Sécurité
1. **RLS Supabase** : Row Level Security configuré sur toutes les tables utilisateur
2. **Middleware** : Protection systématique des routes sensibles
3. **Server Components** : Pas d'exposition d'API keys côté client
4. **Validation** : Validation des inputs dans toutes les API routes

### Performance
1. **Server Components** : Utilisation par défaut pour réduire le JavaScript client
2. **Streaming** : Layout avec Suspense pour chargement progressif
3. **Types générés** : Éviter la duplication de définitions de schéma

### Pièges à Éviter
1. **Client Supabase** : Ne jamais utiliser le client navigateur pour données authentifiées
2. **Hydratation SSR** : Toujours gérer l'état `isClient` pour i18n
3. **Middleware** : Éviter la logique métier complexe dans le middleware
4. **Types Database** : Ne jamais modifier manuellement `database.types.ts`

### Bonnes Pratiques
1. **Composants** : Vérifier l'existence avant création de nouveaux composants
2. **API Routes** : Utiliser systématiquement le pattern d'authentification
3. **Traductions** : Ajouter uniquement en anglais sauf demande explicite
4. **Types** : Utiliser les types générés Supabase pour cohérence

## 🔍 Référence Rapide

### Commandes Utiles
```bash
npm run dev          # Développement avec Turbopack
npm run build        # Build production
npm run lint         # Vérification ESLint
npm start           # Serveur production
```

### Variables d'Environnement Requises
| Variable | Description | Exemple |
|----------|-------------|---------|
| NEXT_PUBLIC_SUPABASE_URL | URL publique Supabase | https://xxx.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Clé anonyme Supabase | eyJ... |
| SUPABASE_SERVICE_ROLE_KEY | Clé service admin Supabase | eyJ... |

### Flux d'Authentification
```
1. Utilisateur → /login (page)
2. Form submit → login() (Server Action)
3. Supabase.auth.signInWithPassword()
4. Middleware → vérification session
5. Redirection → /dashboard ou /admin selon rôle
```

### Structure des Données Principales
```
User (Supabase Auth)
└── Profile (table profiles)
    ├── GaugeProfiles (échantillons)
    ├── MeasurementSets (mesures)
    ├── YarnProfiles (fils)
    └── PatternDefinitionSessions (sessions de travail)
        └── PatternDefinitionComponents (composants de patron)
```

---

**Dernière mise à jour** : Date de génération de ce document  
**Version** : 1.0.0  
**Contributeurs** : Analyse automatique du projet Malaine

---

## 📋 Checklist de Maintenance

Lors d'ajouts/modifications, s'assurer de :
- [ ] Mettre à jour ce document d'architecture
- [ ] Respecter les conventions de nommage
- [ ] Ajouter les traductions nécessaires
- [ ] Vérifier la sécurité des nouvelles routes
- [ ] Tester l'authentification et les rôles
- [ ] Valider le bon fonctionnement en SSR
- [ ] Documenter les nouveaux patterns le cas échéant