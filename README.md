# Malaine - Knitting/Crochet Assistant

A web application to help knitters and crocheters create, customize, and complete their projects with the help of AI.

## Features

- Multilingual support (English and French)
- User authentication and profiles
- Project management for knitting and crochet patterns
- Pattern customization and adaptation
- Material management and tracking

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Supabase (Authentication, Database)
- i18next for internationalization

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
/src
  /app - Next.js App Router pages
  /components - Reusable React components
  /styles - Global styles and Tailwind config
  /types - TypeScript type definitions
  /utils - Utility functions and configuration
/public
  /locales - Translation files
```

## Internationalization

The application supports multiple languages using i18next. Translation files are located in `/public/locales/{language}/common.json`.

Currently supported languages:
- English (en)
- French (fr)

## Database Schema

The application uses Supabase with the following tables:
- profiles - User profiles
- projects - Knitting/crochet projects
- patterns - Pattern data and versions
- materials - Yarn, hooks, needles, and accessories
- project_materials - Junction table for project materials

## Architecture de sécurité

L'application utilise une architecture sécurisée pour les appels à Supabase:

### API Interne

Tous les appels vers Supabase passent par une API interne (`/api`) au lieu d'être effectués directement depuis le navigateur. Cette approche présente plusieurs avantages:

1. **Sécurité renforcée**: Les clés d'API sensibles de Supabase ne sont jamais exposées au navigateur
2. **Gestion des sessions via cookies HTTP-only**: Les tokens d'authentification sont stockés dans des cookies HTTP-only, inaccessibles par JavaScript
3. **Contrôle d'accès centralisé**: Toutes les requêtes passent par un point central où les autorisations peuvent être vérifiées

### Structure de l'API

- `/api/auth/*` - Endpoints pour l'authentification (signin, signout, session)
- `/api/supabase` - Endpoint générique pour relayer les requêtes vers Supabase

### Utilisation

Pour effectuer des appels à la base de données, utilisez le client modifié `supabaseClient` qui redirige automatiquement les requêtes vers l'API interne:

```typescript
import supabaseClient from '@/utils/supabaseClient';

// Exemple d'utilisation
const { data, error } = await supabaseClient
  .from('table_name')
  .select('*')
  .execute();
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
