Parfait, je vais intégrer tes clarifications (gestion fine des rôles, multilingue dynamique, etc.) dans le cahier des charges technique et te fournir un plan de développement séquentiel.
Ce plan comprendra, pour chaque étape de développement :

* une description précise du périmètre technique à mettre en œuvre,
* un prompt détaillé pour la génération automatisée du code (par ex. via un LLM ou outil de scaffolding),
* une checklist de contraintes et tests à valider.
  Je te reviens très vite avec ce plan structuré pour guider la mise en œuvre par itérations claires et validables.


# Plan de développement séquentiel d’une application web de tricot/crochet avec IA

## 1. Squelette initial minimal de l’application

**Périmètre :** Cette première étape consiste à créer la structure de base du projet Next.js en TypeScript, sur laquelle toutes les fonctionnalités futures viendront se greffer. On initialise une application Next.js (idéalement via l’App Router de Next 13+ pour profiter des dernières fonctionnalités) avec un composant principal de layout et une page d’accueil minimale. On configure le projet pour le TypeScript strict et on intègre les outils de base (ex: configuration ESLint/Prettier) pour maintenir une bonne qualité de code. On implémente un layout responsive par défaut, par exemple en utilisant du CSS moderne (Flexbox/Grid) afin que la mise en page s’adapte aux mobiles et aux desktops. On inclut dès le départ les balises meta nécessaires (`<meta name="viewport" content="width=device-width, initial-scale=1">`) pour le responsive. A ce stade, l’application affichera simplement une page d’accueil avec un message de bienvenue, et possiblement des routes vides pour les sections futures (par ex. `/dashboard` pour l’espace utilisateur, `/login` pour l’authentification) afin de préparer le routing. **Aucune intégration de Supabase ou d’intelligence artificielle n’est encore faite** – on se concentre sur l’ossature (pages, composants principaux, navigation). On veille dès le départ à la cohérence du design sur différentes tailles d’écran : l’objectif est d’assurer une expérience utilisateur cohérente sur mobile, tablette et desktop en utilisant le responsive design (approche mobile-first, utilisation de Flexbox/Grid pour ajuster dynamiquement le contenu).

**Prompt de génération de code :**

```markdown
Vous allez créer l’ossature initiale d’une application Next.js en TypeScript pour un site de tricot/crochet.  
Tâches à réaliser :  
- Un nouveau projet Next.js (`npx create-next-app`) avec TypeScript, appelé "Malaine" vient d'être créé.  
- Mettre en place un layout principal commun à toutes les pages (header fixe avec titre du site, zone de contenu principale, footer). Le header peut contenir un titre provisoire du site et un menu de navigation vide (liens placeholder).  
- Créer une page d’accueil (`app/page.tsx` si App Router, ou `pages/index.tsx` si Pages Router) affichant un message de bienvenue du style "Bienvenue sur Malaine – votre assistant tricot/crochet".  
- S’assurer que la mise en page est **responsive** : utiliser du CSS (Flexbox ou Grid) afin que le header, le contenu et le footer s’adaptent aux différentes tailles d’écran (mobile, tablette, desktop). Par exemple, le header devrait être une barre horizontale en desktop et se replier en menu hamburger en mobile.  
- Inclure la balise meta viewport dans le document HTML (via `_app.tsx` ou le layout par défaut) pour activer le responsive.  
- Configurer les dossiers standards : un dossier `components/` pour les composants réutilisables (vous pouvez y mettre un composant `Header` et `Footer` par exemple), un dossier `styles/` pour les feuilles de style globales ou modules CSS si utilisés.  
- Vérifier que le site se lance sans erreur (`npm run dev`) et que la page d’accueil s’affiche correctement avec le layout.
```

**Checklist de tests/validation :**

* Vérifier que le projet Next.js démarre sans erreur et affiche la page d’accueil minimale.
* Contrôler que le layout de base (header, footer, contenu) s’affiche correctement sur desktop **et mobile** (le contenu doit se redimensionner ou se réorganiser, pas de barre de défilement horizontale sur mobile).
* S’assurer que la structure des dossiers est en place (`components/`, `pages/` ou `app/`, etc.) et que les fichiers TypeScript de base sont créés.
* Valider que le code est bien en TypeScript et qu’aucune erreur de typage n’apparaît lors du build.
* Vérifier que les liens de navigation (même factices) du header/footer fonctionnent ou pointent vers des pages existantes (ou seront implementées plus tard) pour éviter les 404 dès le départ.

## 2. Internationalisation (i18n) dynamique du contenu

**Périmètre :** Une fois le squelette en place, on introduit le multilingue dynamique dans l’application. Le but est de permettre à l’utilisateur de changer la langue de l’interface **sans recharger la page**, avec l’anglais par défaut et au moins une seconde langue (français par exemple). Techniquement, on intègre une librairie d’i18n pour Next.js (`react-i18next` avec le contexte React) afin de charger les traductions des libellés de l’UI depuis des fichiers de langue (JSON ou JS). On ajoute un sélecteur de langue (par exemple un menu déroulant ou des boutons "EN/FR") dans le header ou une barre dédiée. Le changement de langue met à jour les textes affichés dynamiquement côté client, sans rechargement global de la page. On configure la langue par défaut du site en anglais, et on s’assure que cette préférence peut être stockée (dans un cookie `NEXT_LOCALE` ou dans le state local) pour être retenue lors de la navigation suivante. Par exemple, en utilisant Next.js App Router avec `react-i18next`, on peut mettre en place un middleware qui lit un cookie de langue et sert les traductions adéquates sans redirection. On prépare des fichiers de traduction minimalistes pour commencer (par ex. `en.json` et `fr.json`) contenant les quelques textes de l’interface (le message de bienvenue, les libellés du menu, etc.) dans chaque langue. Le système doit être capable d’extension pour de futures langues. **Important :** le multilingue concerne initialement l’interface statique; la gestion des données métiers multilingues (ex: descriptions de types de fil) viendra dans une étape ultérieure (avec des tables dédiées dans la base de données).

**Prompt de génération de code :**

```markdown
Intégrez la prise en charge multilingue (internationalisation) dans le projet Next.js existant, avec **changement de langue dynamique sans rechargement de page**.  
Tâches précises :  
- Installer une bibliothèque d’i18n compatible Next.js (`react-i18n`).  
- Créer des fichiers de traduction pour au moins deux langues, par exemple `public/locales/en.json` et `public/locales/fr.json`. Ces fichiers contiendront les chaînes de caractères de l’UI, par ex : `{ "welcome": "Welcome to Malaine", "welcome": "Bienvenue sur Malaine" }` ainsi que d’autres libellés utilisés dans l’interface (menu, titres...).  
- Configurer Next.js pour l’i18n :  comme `react-i18next` est préféré, configurer un `I18nextProvider` englobant l’application dans `_app.tsx` ou le layout, et charger les ressources de traduction.  
- Implémenter un composant `LanguageSwitcher` (par exemple dans le header) avec des boutons ou un dropdown pour passer de EN à FR. Le clic sur un bouton doit mettre à jour la langue active en utilisant l’API de la librairie choisie (par ex. `useLocale` de next-intl ou une fonction de changement de langue de i18next), **sans recharger la page**.  
- Veiller à ce que la langue par défaut de l’app soit l’anglais (en) si l’utilisateur n’a pas de préférence. Si un cookie de langue existe (par ex. `NEXT_LOCALE`), l’appliquer pour initialiser la bonne langue.  
- Remplacer les textes en dur de l’interface par des clés de traduction. Par exemple, le texte de bienvenue doit venir du fichier de langue via un hook `t("welcome")`.  
- Tester le fonctionnement : en mode dev, vérifier que passer de EN à FR modifie immédiatement les textes à l’écran (le message de bienvenue, etc.) sans recharger toute la page. 
```

**Checklist de tests/validation :**

* Vérifier que l’application affiche bien l’interface en anglais par défaut (textes correspondent aux entrées du fichier `en.json`).
* Tester le sélecteur de langue : lorsque l’utilisateur choisit Français, tous les libellés de l’UI basculent en français instantanément (par ex. le message de bienvenue, titres de sections, etc. changent).
* Confirmer qu’aucune navigation complète ou rechargement n’est effectué lors du changement de langue (la transition doit être fluide).
* S’assurer que la préférence de langue est conservée lors de la navigation : par exemple, si l’utilisateur change la langue puis navigue vers une autre page, la langue choisie reste appliquée. De même, en rechargeant manuellement le navigateur, vérifier que la langue précédente est retenue (via cookie ou stockage).
* Tester le fallback : si une clé de traduction manque dans la langue sélectionnée, le système doit fallback soit sur la langue par défaut soit afficher un message explicite (pas de crash de l’application).
* Valider que l’ajout d’une nouvelle langue se fait en ajoutant un fichier de traductions et en l’enregistrant dans la config, sans modification lourde du code.

## 3. Intégration de Supabase et authentification utilisateur (email/password)

**Périmètre :** Cette étape vise à connecter l’application à la base de données Supabase (PostgreSQL) et à implémenter l’**authentification des utilisateurs** via email/mot de passe. On commence par configurer Supabase dans notre projet Next.js : ajout de la clé URL du projet et la clé publique anonyme (env. `SUPABASE_URL` et `SUPABASE_ANON_KEY`) dans un fichier d’environnement sécurisé, et initialisation du client Supabase côté frontend (par ex. un module `utils/supabaseClient.ts` qui exporte `createClient(SUPABASE_URL, SUPABASE_KEY)`). Sur le backend Supabase, on vérifie que l’auth (Email/Password) est activé. On n’a pas encore besoin de tables personnalisées pour l’auth (Supabase gère une table `auth.users` avec identifiants UUID pour chaque utilisateur inscrit). On crée dans Next.js les pages d’**inscription** et de **connexion** : chacune contenant un formulaire (email, mot de passe, + confirmation de mot de passe pour l’inscription). En soumettant, on appelle les méthodes de Supabase Auth (`supabase.auth.signUp` et `supabase.auth.signInWithPassword` du SDK JavaScript) pour créer un compte ou se connecter. On implémente aussi la **déconnexion** (`supabase.auth.signOut`). Après connexion, l’utilisateur doit recevoir un jeton (géré par Supabase, stocké dans local storage ou via cookies). On peut utiliser le mécanisme de session de Supabase pour savoir si un utilisateur est connecté globalement (par exemple en stockant l’objet user ou en utilisant un contexte React pour le user courant). À ce stade, tous les utilisateurs authentifiés auront par défaut le rôle « user » (on introduira les rôles custom à l’étape suivante). On n’oublie pas de rendre l’application bilingue : les formulaires de login/signup doivent utiliser les textes multilingues (placés dans les fichiers de trad).

*Note:* Les identifiants des utilisateurs (`id` dans `auth.users`) sont des UUID générés par Supabase, conformément aux contraintes (on utilisera ces UUID comme clé étrangère dans nos tables plus tard). Aucune interface d’administration n’est prévue ici (les comptes admin seront créés en BDD manuellement ultérieurement).

**Prompt de génération de code :**

```markdown
Connectez l’application Next.js à Supabase et implémentez l’authentification par email/mot de passe.  
Tâches :  
- Installer le SDK JavaScript Supabase (`@supabase/supabase-js`).  
- Créer un fichier de configuration (ex: `utils/supabaseClient.ts`) initialisant le client Supabase avec l’URL et la clé anonyme du projet (les valeurs seront lues des variables d’environnement `SUPABASE_URL` et `SUPABASE_ANON_KEY`).  
- Dans Supabase (côté Dashboard), s’assurer que l’authentification par email est activée. Aucune table custom n’est encore nécessaire pour les profils car Supabase gère `auth.users`.  
- Créer une page Next.js `/login` avec un formulaire de connexion (champs email et mot de passe). À la soumission, appeler `supabase.auth.signInWithPassword({ email, password })`. Gérer les erreurs possibles (email non trouvé, mauvais mot de passe) et afficher un message d’erreur localisé en conséquence.  
- Créer une page `/signup` avec un formulaire d’inscription (champs email, mot de passe, confirmation mot de passe). À la soumission, vérifier côté client que le mot de passe et sa confirmation correspondent, puis appeler `supabase.auth.signUp({ email, password })`. Après inscription réussie, soit rediriger l’utilisateur vers le tableau de bord, soit afficher un message invitant à vérifier ses emails (selon config Supabase, un email de confirmation peut être envoyé).  
- Ajouter dans le header (ou un menu utilisateur) une option "Logout" pour se déconnecter. Au clic, appeler `supabase.auth.signOut()` et mettre à jour l’état de l’application (par exemple via un contexte Auth) pour refléter que l’utilisateur n’est plus connecté.  
- Mettre en place un contexte ou un hook (ex: `useUser`) pour fournir les informations de l’utilisateur courant à l’application (utile pour protéger les routes plus tard). Ce contexte utilise `supabase.auth.getUser()` ou un listener (`supabase.auth.onAuthStateChange`) pour savoir si un user est connecté.  
- Veiller à ce que les pages `/login` et `/signup` ne soient accessibles **que** si l’utilisateur n’est pas déjà authentifié (par exemple, si un user connecté tente d’y accéder, le rediriger vers son dashboard). Inversement, prévoir une redirection vers `/login` si un visiteur non authentifié tente d’accéder à une page réservée (ce sera affiné avec les rôles à l’étape suivante).  
- Internationaliser les pages d’auth: utiliser les textes traduits pour les labels des champs, les boutons ("Se connecter" / "Sign In", etc.) et messages d’erreur.
```

**Checklist de tests/validation :**

* **Inscription:** Tester qu’un nouvel utilisateur peut créer un compte avec un email et mot de passe valides. Vérifier dans le dashboard Supabase que l’utilisateur apparaît bien dans `auth.users` (avec un `id` en UUID). S’assurer qu’aucune donnée sensible (mot de passe en clair) n’est stockée côté client.
* **Connexion:** Tester qu’un utilisateur peut se connecter avec des identifiants valides. Après login, vérifier que l’état auth de l’application est bien mis à jour (par ex., le contexte utilisateur est peuplé, le token est stocké par Supabase). Tester qu’une tentative de connexion avec un mauvais mot de passe ou un email inconnu affiche un message d’erreur approprié (et localisé).
* **Redirections:** Vérifier qu’un utilisateur non authentifié ne peut pas accéder aux pages protégées (ex: tableau de bord utilisateur) – il doit être redirigé vers `/login`. Inversement, un utilisateur connecté qui va sur `/login` ou `/signup` doit être redirigé vers son dashboard (pour éviter qu’il revoie les formulaires de login).
* **Déconnexion:** Après avoir cliqué sur "Logout", vérifier que l’utilisateur est bien déconnecté (le contexte auth est réinitialisé, le token Supabase supprimé) et qu’il est éventuellement redirigé vers la page publique d’accueil ou de login.
* Vérifier que tous les textes des formulaires et messages d’erreur apparaissent dans la langue choisie (en changeant de langue dans l’UI avant de naviguer sur ces pages, ou en testant les deux langues).
* Confirmer que la configuration Supabase (clés, URL) n’est pas exposée de manière inadéquate : la clé anon publique peut être visible côté client, c’est normal, mais aucune clé secrète ne doit figurer dans le code frontend.

## 4. Gestion des rôles (guest/user/admin) et routage protégé

**Périmètre :** Maintenant que l’authentification de base fonctionne, on introduit une couche d’**autorisation par rôles** pour différencier les permissions. Trois rôles sont envisagés : *guest* (visiteur non connecté), *user* (utilisateur authentifié classique), *admin* (utilisateur administrateur). Côté **base de données**, on doit prévoir de stocker le rôle de chaque utilisateur. Pour cela, on crée une table `profiles` publique liée aux utilisateurs d’auth (recommandation Supabase) avec un champ `role`. Par exemple :

```sql
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  role text not null default 'user',
  primary key (id)
);
alter table public.profiles enable row level security;
```

Chaque profil est identifié par le même UUID que l’utilisateur dans `auth.users`. On peut initialiser tous les nouveaux inscrits avec `role='user'` par défaut (via une fonction trigger sur `auth.users` qui insère dans `profiles`, ou manuellement pour l’instant). On décide que le rôle *admin* ne sera attribué qu’en base manuellement (par exemple en modifiant le champ role d’un utilisateur via le dashboard Supabase) au départ. Côté **frontend**, on met en place un système de **routing protégé par rôle**. Concrètement :

* Les pages publiques (accessibles aux guests) : page d’accueil, pages d’authentification, etc. restent accessibles à tous.
* Les pages réservées aux utilisateurs connectés (rôle user ou admin) : par ex. le tableau de bord utilisateur, certaines fonctionnalités communautaires, etc., redirigent vers `/login` si un guest tente d’y accéder.
* Les pages réservées aux admins (ex: une future page d’administration) ne sont accessibles qu’aux admins authentifiés – un utilisateur non admin sera redirigé (voire un message "Access Denied").

Pour implémenter cela, on utilise les infos de l’utilisateur courant : dans le contexte Auth introduit à l’étape précédente, on étend pour y inclure le `role` de l’utilisateur (qu’on peut récupérer soit via le JWT Supabase s’il contient un custom claim, soit en faisant un appel au backend pour lire la table `profiles`). Le plus simple : après login, effectuer une requête Supabase (RPC ou SELECT) pour lire `profiles.role` du user connecté. On stocke ce rôle dans le contexte.

On applique ensuite des gardes sur les routes : par exemple, si on utilise le App Router Next.js, on peut créer un composant de haut niveau pour les routes protégées qui checke le rôle et soit affiche le contenu, soit fait un redirect. Avec Pages Router, on peut utiliser Next.js middleware (`middleware.ts`) pour intercepter toute requête vers `/dashboard` ou `/admin` et vérifier le token de session + rôle.

Côté **RLS (Row Level Security)** dans Supabase, on active et écrit des politiques pour renforcer les autorisations côté base de données également. Pour chaque table de données sensibles (par ex. une table des projets tricot de l’utilisateur), on ajoute une règle du style : « Un utilisateur authentifié ne peut SELECT/UPDATE que ses propres enregistrements (où `created_by = auth.uid()`) ou bien s’il a le rôle admin il peut tout voir ». Une politique SQL exemple pourrait être :

```sql
create policy "User can view own or admin" on public.projects 
  for select using (
    projects.user_id = auth.uid() 
    or (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  );
```

Ainsi, un admin bypassera la restriction et verra tous les projets. Des politiques similaires s’appliquent pour l’INSERT/UPDATE/DELETE selon les besoins (typiquement, un user ne peut modifier que ses données, un admin peut tout modifier).

**Note :** L’application n’ayant pas encore d’interface d’admin dédiée (on a le rôle admin en base mais l’admin gérera la plupart des données via le dashboard Supabase au départ), on peut néanmoins créer une page `/admin` basique qui affiche un message "Espace administrateur" pour vérifier la protection. Elle servira de gabarit pour de futures fonctionnalités d’admin.

**Prompt de génération de code :**

```markdown
Mettez en place la gestion des rôles utilisateur (guest, user, admin) et protégez les routes en fonction de ces rôles.  
Tâches Backend (Supabase) :  
- Créer une table `profiles` dans la base (schéma public) avec les colonnes : `id UUID` (clé primaire, référence à `auth.users(id)`), `role text` (par défaut "user"), etc. Veiller à activer RLS sur `profiles`. (Vous pouvez fournir le script SQL de création de table et de politique RLS).  
- (Optionnel) Mettre en place un trigger Supabase pour insérer automatiquement un profil avec rôle "user" lors de chaque nouvelle inscription. Par exemple, une function `handle_new_user()` qui insère dans `profiles(id, role)` values (`new.id, 'user'`).  
- Dans la table `profiles`, définir manuellement via le Dashboard Supabase un utilisateur admin (modifier son role à "admin").  

Tâches Frontend :  
- Adapter le contexte/Auth pour inclure le rôle de l’utilisateur. Après la connexion (ou à l’init de l’app si le user a déjà une session), récupérer le rôle : par exemple, faire `const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()` juste après le login. Stocker `profile.role` dans le state global.  
- Créer un composant ou une fonction utilitaire de **Route Guard**. Par exemple, une fonction `withAuth(Component, requiredRole)` qui, selon le `user.role` courant, rend soit le `<Component/>` si le rôle convient, soit redirige vers une page d’accès refusé ou la page de login. Utiliser cette guard pour protéger les pages :  
  - Pour la page `Dashboard` utilisateur (profile), requiredRole = "user" (ce qui inclut aussi "admin" éventuellement, car admin est un user plus privilégié).  
  - Pour la page `Admin` (si elle existe ou un placeholder), requiredRole = "admin".  
  - Les pages comme `/login` ou `/signup` peuvent spécifier requiredRole = "guest" (ce qui signifie que si un user est connecté, on le redirige par ex vers `/dashboard`).  
- Au niveau du routing Next.js, appliquer ces guards. En App Router, on peut utiliser des conditions dans le composant page : ex `if (userRole < requiredRole) redirect(...)`. En Pages Router, utiliser un `<PrivateRoute>` wrapper ou le fichier `middleware.ts` global pour intercepter.  
- Implémenter une page d’accès refusé ou un composant `<Unauthorized>` affichant un message poli si jamais un utilisateur tente d’accéder sans le bon rôle (par exemple "Vous n’avez pas la permission d’accéder à cette page").  
- Côté Supabase, écrire des politiques RLS simples pour sécuriser les données : Par exemple, sur la table `profiles` elle-même, créer une policy qui permet à chaque utilisateur de sélectionner sa propre ligne et aux admins de sélectionner toutes les lignes (afin que l’admin puisse éventuellement lister tous les utilisateurs si besoin). Fournir le SQL d’exemple d’une policy SELECT sur `profiles` utilisant `auth.uid()` et le champ role.  
- Tester les différents scénarios de navigation avec rôles (voir section tests). 
```

**Checklist de tests/validation :**

* Vérifier en base (dans `profiles`) que chaque nouvel utilisateur dispose d’une entrée avec le bon UUID et `role='user'` par défaut. Tester l’ajout manuel d’un rôle admin pour un utilisateur donné et s’assurer que c’est bien pris en compte (par ex. via une requête Supabase de récupération du profile).
* **Protection frontend des routes :** tenter d’accéder à une page utilisateur (ex: `/dashboard`) en étant **non connecté** → le système doit vous rediriger vers `/login` (ou une page "Veuillez vous connecter").
* Se connecter en tant qu’utilisateur normal, puis tenter d’accéder à la page admin : on doit obtenir soit une redirection vers une page "non autorisé" soit le contenu du dashboard standard, mais **pas** le contenu admin. Si une page spéciale "Access Denied" est prévue, vérifier qu’elle s’affiche.
* Se connecter en tant qu’utilisateur admin (après avoir défini son rôle en base). Accéder à la page admin → le contenu admin (même minimal) doit s’afficher, prouvant que l’autorisation fonctionne.
* Vérifier que les pages publiques restent accessibles à tous (ex: la page d’accueil doit être visible même si connecté ou non).
* **RLS côté base :** via le Supabase Dashboard ou des appels API, tester qu’un utilisateur non admin ne peut récupérer que ses propres données. Par exemple, si on a une table de test avec une policy utilisant `auth.uid()`, faire un `supabase.from('table_test').select(*)` côté frontend avec deux comptes différents : chacun ne doit voir que ses lignes. Un admin, lui, doit voir toutes les lignes. S’assurer que ces règles fonctionnent en direct.
* S’assurer que le rôle est bien synchronisé avec le front : si on change manuellement le rôle d’un user en base (via Supabase) de 'user' à 'admin', vérifier que lors de sa prochaine connexion, l’application le reconnaît comme admin (et lui donne accès aux pages correspondantes).

## 5. Tableau de bord utilisateur (espace profil)

**Périmètre :** À ce stade, on peut proposer à l’utilisateur connecté un **dashboard** basique, qui servira de page d’accueil personnalisée après login. Le tableau de bord (*dashboard utilisateur*) affichera quelques informations du profil et servira de point d’entrée aux fonctionnalités métier. Techniquement, on crée une page accessible aux rôles *user* et *admin* (protégée via les mécanismes de l’étape 4). Sur cette page, on peut afficher par exemple le **profil** de l’utilisateur : son adresse email (issue de `auth.users` ou du contexte supabase), sa langue préférée (initialement on peut utiliser la langue courante de l’UI comme préférence), et éventuellement d’autres informations provenant de la table `profiles` (plus tard on pourrait y ajouter un pseudo, avatar, etc.). On donne la possibilité à l’utilisateur de **mettre à jour certaines infos** de profil basiques : par exemple, choisir sa langue par défaut pour l’application (en enregistrant ce choix dans `profiles` table, champ supplémentaire `language_preference` par ex.). Cela impliquerait un petit formulaire de préférence de langue sur le dashboard, qui envoie une requête `update` à Supabase (`update profiles set language_preference = ... where id = ...`). Comme on a activé RLS, cette requête ne sera autorisée que pour l’utilisateur sur sa propre ligne (policy à vérifier).

En dehors du profil, le dashboard peut aussi afficher un **aperçu des fonctionnalités** : par exemple un message de bienvenue personnalisé ("Bonjour \[prenom]") si on avait le prénom, ou une liste vide en attendant les projets de tricot de l’utilisateur. L’idée est d’établir la structure pour les données futures. On peut créer un composant `UserDashboard` qui regroupe ces éléments.

Étant donné que pour l’instant on n’a pas encore de fonctionnalités métier (projets, patterns, etc.), le contenu restera sommaire : "Bienvenue, \[email]" et "Votre rôle : \[role]" par exemple pour que l’admin voie qu’il est admin. On pourra aussi intégrer un rappel de la documentation ("Consultez nos derniers modèles de tricot..." lien factice) pour simuler du contenu.

Côté implementation, on utilise le contexte ou le hook Supabase pour obtenir l’utilisateur courant et son profile (rôle, préférences) afin d’afficher ces infos. On veille à ce que cette page soit bien réactive à la langue de l’UI (tous les libellés traduits).

**Prompt de génération de code :**

```markdown
Implémentez le tableau de bord utilisateur (page `/dashboard`) pour les utilisateurs connectés.  
Tâches :  
- Créer la page ou le composant `Dashboard` (selon l’architecture Next) qui n’est rendu que si l’utilisateur est authentifié (utiliser la protection mise en place précédemment). Cette page doit accueillir l’utilisateur par un message de bienvenue personnalisé, par exemple "Bonjour [email]" (ou mieux, un prénom si disponible dans le profil). Utiliser les traductions pour ce message ("Welcome" / "Bienvenue").  
- Afficher les informations de profil de base de l’utilisateur : son email (récupéré via `supabase.auth.getUser()` ou le contexte), et son rôle (ex: "Role : user/admin"). Ces données peuvent être obtenues du contexte global où on a stocké `user` et `user.role`.  
- Ajouter dans ce dashboard une section "Paramètres" ou "Préférences". À minima, inclure une option de changer la langue préférée. Par exemple, un dropdown avec les langues disponibles (Anglais, Français) qui, lorsqu’on en sélectionne une, enregistre ce choix. Pour l’exercice, stocker ce choix côté base de données : ajouter si besoin une colonne `language_preference` (varchar) dans `profiles` (défaut null ou 'en'). Mettre à jour cette colonne via Supabase (ex: `supabase.from('profiles').update({ language_preference: 'fr' }).eq('id', user.id)`).  
- S’assurer que le changement de préférence de langue met aussi à jour l’interface courante sans recharger (on peut appeler la même fonction de changement de langue que le sélecteur global, puis éventuellement recharger les données si nécessaire).  
- (Optionnel) Préparer la section où seront listés les projets ou modèles de tricot de l’utilisateur. Pour l’instant, affichez un simple message du style "Vous n’avez pas encore de projet. Créez-en un !" (ou en anglais) pour montrer l’emplacement. Ce sera alimenté à la prochaine étape.  
- Soigner la présentation : comme le site doit être responsive, s’assurer que le dashboard s’affiche correctement sur mobile (les sections peuvent s’empiler verticalement). Utiliser des classes CSS ou un framework (selon ce qui a été mis en place) pour une mise en page propre (ex: une grille ou des cartes pour chaque section de profil, préférences, etc.).  
- Garder à l’esprit la distinction user/admin : pour un admin, on peut par exemple afficher un badge "Admin" à côté du rôle ou un message particulier ("Vous avez les droits administrateur"). Cela reste léger car l’interface admin complète n’est pas développée ici.
```

**Checklist de tests/validation :**

* Se connecter en tant qu’utilisateur normal, naviguer vers `/dashboard` : vérifier que la page s’affiche avec le message de bienvenue contenant son email (ou nom) et que son rôle est indiqué comme "user" (éventuellement traduit).
* Tester la modification de langue préférée sur le dashboard : choisir "Français" dans la liste des préférences. Vérifier en base que la colonne `language_preference` du profil de cet utilisateur passe à "fr". Vérifier que l’interface change bien de langue suite à cette action (et si on recharge la page, grâce au cookie ou au contexte, la langue reste en français).
* Vérifier que les textes du dashboard (titres, labels de préférences, message de bienvenue) se traduisent correctement en fonction de la langue de l’UI courante.
* Tester l’affichage sur mobile : réduire la fenêtre ou utiliser un simulateur mobile, et s’assurer que les éléments du tableau de bord se réorganisent de manière lisible (le menu de préférences reste accessible, pas de chevauchement de textes, etc.).
* Se connecter en tant qu’admin et accéder au dashboard : le contenu doit être en gros le même (peut-être le message de bienvenue indique "Vous êtes administrateur"). Vérifier qu’aucune erreur n’apparaît et que l’admin voit bien son rôle "admin".
* S’assurer que la protection de la page est effective : un utilisateur non connecté qui tente d’accéder à `/dashboard` doit toujours être redirigé (ce comportement hérité de l’étape 4 doit rester valable).

## 6. Données de référence multilingues (types de fil, etc.)

**Périmètre :** Cette étape introduit la gestion des données métiers *multilingues* dans l’application, en l’occurrence l’exemple mentionné est les **types de fil** (catégories de laine/coton, etc.). On veut stocker ces métadonnées de façon à pouvoir afficher leur nom dans la langue de l’utilisateur. Pour cela, on utilise une approche par table de traduction (traduction des ref data) pour éviter de dupliquer les colonnes pour chaque langue. Concrètement, on crée deux tables :

* `ref_yarn_types` (table principale) avec par exemple `id` (BIGINT auto-incrément) et éventuellement un code interne ou champ non traduit. Chaque entrée représente un type de fil (ex: Mohair, Laine mérinos, Coton, etc.) indépendamment de la langue.
* `ref_yarn_types_ml` (table des traductions, ML pour Multi-Language) avec colonnes : `yarn_type_id` (FK vers `ref_yarn_types.id`), `language` (code langue, ex 'en' ou 'fr'), et `name` (texte traduit). On peut définir la PK composite `(yarn_type_id, language)` pour éviter les doublons. Cette table contient par exemple une ligne (1,'en','Wool') et (1,'fr','Laine') pour traduire le type de fil d’ID 1.

On insère quelques données exemples dans ces tables (via script SQL ou via Supabase GUI) pour disposer de contenu.

Côté application, on crée une page ou une section (par exemple sur le Dashboard ou dans un menu "Référentiel de fils") qui affiche la liste des types de fil disponibles, dans la langue courante de l’utilisateur. Cela implique de faire une requête Supabase pour joindre les deux tables : sélectionner depuis `ref_yarn_types` en joignant `ref_yarn_types_ml` filtré sur la langue = langue de l’UI (ou langue préférée de l’utilisateur). Par exemple : `select yt.id, ml.name from ref_yarn_types yt join ref_yarn_types_ml ml on yt.id=ml.yarn_type_id where ml.language = 'fr';`. Grâce à cette structure, l’ajout d’une nouvelle langue se fait en insérant des nouvelles lignes dans la table de traduction, sans modifier le schéma.

On affiche donc cette liste dans l’interface, de manière propre (par ex. une liste à puces ou un tableau). Si l’utilisateur change la langue via le sélecteur, la liste doit se mettre à jour pour afficher les noms dans la nouvelle langue (on peut réutiliser le mécanisme de changement de langue pour refetch les données).

On teste ce concept avec les types de fil, mais c’est généralisable à d’autres entités (patrons, catégories de patrons, etc.). À ce stade, on n’implémente pas encore l’ajout/édition de ces ref data depuis l’UI (on suppose que l’admin pourrait gérer ça depuis Supabase directement, conformément aux contraintes).

**Prompt de génération de code :**

````markdown
Implémentez la gestion des données de référence multilingues, en prenant l’exemple des types de fil (yarn types).  
Tâches base de données :  
- Écrire le script SQL pour créer la table principale `ref_yarn_types` et la table de traductions `ref_yarn_types_ml`. Par exemple :  
  ```sql
  create table public.ref_yarn_types (
    id bigint primary key generated always as identity,
    code text
  );
  create table public.ref_yarn_types_ml (
    yarn_type_id bigint references public.ref_yarn_types(id) on delete cascade,
    language varchar(5),
    name text,
    primary key (yarn_type_id, language)
  );
````

(Ici `code` est un champ optionnel pour un identifiant lisible, on peut le laisser null ou s’en servir).

* Insérer quelques types de fil exemples et leurs traductions, par ex : une entrée dans `ref_yarn_types` pour "Laine" et dans `ref_yarn_types_ml` deux lignes (une avec language='en', name='Wool'; une avec language='fr', name='Laine'), idem pour "Coton" (Cotton) etc.

Tâches frontend :

* Créer un composant ou page `YarnTypesList` qui va afficher la liste des types de fil dans la langue courante.
* Dans ce composant, utiliser le client Supabase pour faire une requête avec jointure : récupérer `ref_yarn_types_ml.name` filtré par `language = <langue courante>`, éventuellement ordonné par le code ou l’id. En TypeScript, typer les données (par ex. définir une interface YarnType { id: number; name: string }).
* Afficher le résultat sous forme de liste dans l’UI. Par exemple : une liste `<ul>` où chaque `<li>` affiche le nom du type de fil. Si aucune donnée (par ex. si table vide ou trad manquante), afficher un message "No data"/"Aucune donnée".
* Rendre ce composant visible sur une page appropriée. Vous pouvez par exemple l’intégrer au dashboard utilisateur sous une section "Types de fil disponibles :", ou créer une page dédiée `/yarn-types` liée depuis le menu. Dans tous les cas, cette page est publique (consulter les types de fil ne nécessite pas d’être authentifié a priori), donc on n’applique pas de guard de rôle ici.
* Gérer la réaction au changement de langue : quand l’utilisateur change la langue via le sélecteur (implémenté à l’étape 2), il faudrait que les noms de la liste se mettent à jour. Pour simplifier, on peut écouter le contexte de langue (si la librairie i18n en fournit un, ex: `useLocale` hook) et déclencher un refetch des données Supabase à chaque fois que la langue active change. Ainsi, la liste affichera la langue correspondante.
* Vérifier que le tout est responsive (par ex., sur mobile la liste prend bien toute la largeur, etc., ce qui devrait être naturel si on utilise des éléments HTML de base).

````

**Checklist de tests/validation :** 
- Vérifier en base que les tables `ref_yarn_types` et `ref_yarn_types_ml` ont été créées correctement avec les types de données demandés (id en BIGINT, etc.), et que des données d’exemple existent (quelques types de fil avec des noms en anglais et français).  
- Lancer l’application, naviguer vers la page ou section listant les types de fil : en **anglais**, voir par exemple "Wool, Cotton, Silk, ..." listés. Passer l’interface en **français** (via le sélecteur de langue) et vérifier que la liste se met à jour pour afficher "Laine, Coton, Soie, ..." sans avoir besoin de recharger la page.  
- Tester que le composant gère l’absence de traduction : par exemple, si pour une entrée un nom manque en français, la liste peut soit ne pas montrer cet item, soit l’afficher en anglais par défaut. Décider du comportement et vérifier qu’il fonctionne (idéalement, ajouter une contrainte NOT NULL sur ref_yarn_types_ml.name pour qu’on ait toujours quelque chose à afficher).  
- S’assurer que la requête Supabase ne renvoie que les enregistrements dans la langue filtrée. Pour un type de fil donné, on ne doit pas voir simultanément la version EN et FR en même temps dans la liste – uniquement la langue courante.  
- Vérifier l’aspect responsive sur cette liste (sur mobile, les noms des types de fil doivent éventuellement passer à la ligne s’ils sont longs, mais la liste doit rester utilisable).  
- (Sécurité) Vérifier que même un utilisateur non authentifié peut récupérer ces données de référence. Si on a activé RLS sur ces tables, il faudrait soit autoriser le rôle `anon` à sélectionner (puisque c’est des données publiques). On peut par exemple ajouter une policy `ALLOW SELECT TO anon` sur `ref_yarn_types_ml` pour ne pas bloquer les visiteurs:contentReference[oaicite:11]{index=11}. Tester cela en appelant l’API en étant déconnecté.

:contentReference[oaicite:12]{index=12} *Exemple d’une fiche de patron tricot montrant des informations multilingues (ici un patron "Ivy Blouse" disponible en anglais et français). Cela illustre la nécessité de structurer les données (ex. types de fil, descriptions) avec des traductions afin de s’adapter à la langue de l’utilisateur.*  

## 7. Intégration d’une fonctionnalité d’IA pour le tricot/crochet 
**Périmètre :** Pour couronner le MVP, on intègre une composante d’**intelligence artificielle** visant à assister les utilisateurs dans le domaine du tricot/crochet. Cette IA peut prendre plusieurs formes – par exemple un **assistant conversationnel** qui répond à des questions de tricot, ou un outil générateur de patterns (patrons) basique. Dans le cadre de ce plan, on choisit une implémentation simple : un chatbot propulsé par une API d’IA (par ex. l’API OpenAI GPT-4) qui peut aider l’utilisateur. Par exemple, l’utilisateur pourrait poser la question *« Comment adapter ce patron à une taille différente ? »* et l’IA répond en langage naturel. 

Techniquement, on ajoute une page ou une section dans le dashboard utilisateur nommée "Assistant IA". Cette section contient : 
- Un champ de saisie de question ou de prompt utilisateur. 
- Un bouton d’envoi qui va appeler une API backend (un endpoint Next.js API route, ou une fonction serverless) pour traiter la requête. 

Côté backend, on crée une route API Next.js (ex: `pages/api/ai-assistant.ts` ou en App Router `app/api/ask/route.ts`) qui reçoit la question de l’utilisateur (via req.body). Cette route utilise le SDK de l’API d’IA choisie. Par exemple, avec OpenAI, on installerait le paquet `openai` et configurerait la clé API dans un fichier d’environnement (clé non exposée au client):contentReference[oaicite:13]{index=13}:contentReference[oaicite:14]{index=14}. La fonction API enverra la question à OpenAI (par ex. `openai.createChatCompletion` avec un prompt qui éventuellement contextualise sur le tricot), et reçoit une réponse. Cette réponse est renvoyée au frontend. 

Côté frontend, dès qu’on obtient la réponse, on l’affiche dans l’interface (sous le champ de question, comme un chat). On peut conserver l’historique localement dans le state pour afficher plusieurs échanges, bien que la persistance n’est pas obligatoire dans un premier jet. 

On veille à ce que cette fonctionnalité soit **protégée** – par exemple, on la réserve aux utilisateurs connectés (on place cette UI dans le dashboard, déjà protégé). On gère aussi un temps de réponse potentiellement long en affichant un indicateur de chargement pendant la requête API. 

Enfin, puisque l’app est multilingue, on peut réfléchir à la gestion de la langue des réponses de l’IA. Idéalement, si l’utilisateur utilise l’interface en français, on pourrait formuler la requête à l’API en français pour obtenir une réponse en français. On peut aussi préciser dans le prompt système de l’AI de répondre dans la langue de la question. 

**Prompt de génération de code :**  
```markdown
Intégrez une fonctionnalité d’assistant IA basique dans l’application.  
Tâches frontend :  
- Dans le dashboard utilisateur, ajouter une nouvelle section "Assistant IA". Cette section comporte un champ texte (`<textarea>`) pour la question de l’utilisateur et un bouton "Envoyer".  
- Gérer l’état local pour l’historique des échanges : par exemple, une liste de paires { question, reponse } pour afficher sous le formulaire les questions posées et les réponses de l’IA.  
- Au clic sur "Envoyer", appeler une route API Next.js que vous allez créer (voir ci-dessous). Pendant que la réponse est en cours (appel API externe), afficher un indicateur de chargement (par ex. un spinner ou un message "Analyse en cours...").  

Tâches backend (Next.js API route) :  
- Créer une route API (pages/api ou app/api) `/api/assistant` qui attend en POST un corps JSON avec la question de l’utilisateur. Par exemple `{ "question": "Comment tricoter une écharpe rapidement ?" }`.  
- Dans cette route, intégrer l’appel à une API d’intelligence artificielle. Par exemple, utiliser l’API d’OpenAI :  
  - Installer la bibliothèque OpenAI (`openai` via npm).  
  - Configurer la clé API OpenAI dans `.env.local` (par ex. `OPENAI_API_KEY`). Ne pas exposer cette clé au client (ne pas préfixer en NEXT_PUBLIC).  
  - Dans la route, initialiser le client OpenAI avec la clé (par ex. `new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }))`).  
  - Préparer une requête de complétion ou chat : par ex. `openai.createChatCompletion({ model: "gpt-4", messages: [{ role: "user", content: question }] })`. On peut ajouter un message système en amont du style "You are a knitting assistant..." pour contextualiser.  
  - Récupérer la réponse (`response.data.choices[0].message.content` par ex.).  
  - Renvoyer cette réponse dans le corps de la réponse de l’API route (format JSON `{ answer: "..."}`).  

- Assurer un minimum de contrôle d’accès : idéalement, vérifier que l’appel provient d’un utilisateur authentifié. On peut, par simplicité, ne pas exposer de secret côté client donc l’API route n’est appelée que via notre frontend déjà protégé. (Pour être rigoureux, on pourrait exiger un token Supabase dans l’en-tête et le valider côté API route).  

Retour au frontend :  
- À la réception de la réponse de `/api/assistant`, récupérer `data.answer` et l’ajouter à l’historique des messages affichés. Vider le champ question et arrêter l’indicateur de chargement.  
- Afficher la réponse de l’IA dans la conversation, avec une mise en forme distincte (par ex. la question en gras précédée de "Vous :", la réponse précédée de "Assistant :").  
- Veiller à ce que la section soit scrollable si le contenu devient long, pour que l’utilisateur puisse relire l’historique.  
- **Optionnel :** Permettre l’internationalisation du prompt système ou de la langue de réponse. Par exemple, si l’UI est en français, envoyer la question telle quelle en français à l’API pour que la réponse soit en français; si l’UI est en anglais, l’AI répondra en anglais.  
````

**Checklist de tests/validation :**

* Accéder à l’assistant IA en étant connecté. Taper une question simple, par exemple *"Quelle est la différence entre le tricot et le crochet ?"*. Envoyer et vérifier qu’une réponse s’affiche après quelques instants. La réponse doit être pertinente (générée par l’IA) et affichée dans l’UI de façon lisible.
* Tester plusieurs échanges consécutifs : poser une nouvelle question après la première réponse. Vérifier que l’historique affiche bien les deux questions et deux réponses dans le bon ordre, sans écraser la précédente.
* Vérifier le comportement en changeant la langue de l’interface : par exemple, passer l’UI en anglais, puis poser la question *"What is a good yarn for summer garments?"*. Attendre la réponse (devrait arriver en anglais). Repasser en français et demander *"Quel point de tricot est le plus facile pour débuter ?"*. La réponse devrait venir en français.
* Tester l’indicateur de chargement : s’assurer qu’il apparaît dès qu’on envoie la question et disparaît une fois la réponse reçue. Si possible, tester un cas où l’API met plus de temps ou échoue : par exemple en coupant internet ou en fournissant un prompt très long. Le système doit gérer un **timeout** ou une erreur proprement (afficher "Désolé, l’assistant a échoué. Réessayez plus tard.").
* Sécurité : tenter d’appeler l’endpoint `/api/assistant` depuis un client non authentifié (par ex. via cURL sans token) si possible, pour vérifier que soit l’appel est rejeté, soit n’aboutit pas (puisque pas de session). Également, regarder dans les outils de dev que la clé OpenAI n’est jamais exposée dans le code envoyé au client (elle doit rester en backend).
* Vérifier que cette nouvelle fonctionnalité n’affecte pas les performances globales de l’app : l’appel API doit se faire en arrière-plan sans geler l’UI.
* Enfin, évaluer la pertinence de l’IA sur quelques questions liées au tricot/crochet pour s’assurer que l’intégration est utile (bien que la qualité de la réponse dépende du modèle OpenAI).

**Références :** L’intégration de l’API OpenAI dans Next.js permet de doter l’application de capacités avancées de NLP et génération de contenu, ce qui répond à l’objectif d’une application de tricot/crochet enrichie par de l’intelligence artificielle.
