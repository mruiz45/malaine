
# Plan de développement séquentiel d’une application web de tricot/crochet avec IA, appelée: 'Malaine'

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

