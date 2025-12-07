# Docta – Next.js (App Router)

Docta est une application de gestion sanitaire avec des tableaux de bord orientés rôles (`admin`, `médecin`, `infirmière`, `patient`). Elle utilise Next.js (App Router), TypeScript, Tailwind CSS et Supabase.

## Barres latérales repliables (nouveau)
- Les barres latérales de chaque rôle (Admin, Infirmière, Médecin, Patient) peuvent être repliées/étendues via un bouton toggle en haut du panneau.
- En mode replié, la largeur passe à `sm:w-16` et les libellés des liens sont masqués visuellement (accessibles via `title`/`aria-label`).
- L’état de repli est persistant par rôle grâce à `localStorage` (`sidebar:<role>:collapsed`).
- Les layouts restent des Client Components uniquement pour l’interactivité; les pages et données continuent d’utiliser des Server Components et des Server Actions.

## Aperçu du projet
- App Router: pages par fonctionnalités (patients, rendez-vous, messages, notifications, planning, soins, hospitalisations)
- Auth & sessions: Supabase (`@supabase/supabase-js`) côté client, `proxy.ts` pour la protection des segments sensibles
- UI: composants réutilisables (inputs, select, textarea, button), Navbar & Footer avec menu utilisateur
- API: routes sous `app/api/*` (prêtes pour intégration avec `CRON_SECRET` pour les jobs planifiés)

## Prérequis
- Node.js >= 18 (recommandé: 20+)
- npm >= 9
- Compte Supabase pour activer l’authentification et la persistance

## Installation
- Local
  - `npm install`
  - Créez `.env.local` à partir de `.env.local.example`
  - `npm run dev` puis ouvrez `http://localhost:3000`
- Production (Vercel)
  - Liez le projet et ajoutez les variables d’environnement (voir ci-dessous)
  - Vérifiez `vercel.json` et les jobs cron
  - Déployez en Production; les jobs cron ne s’exécutent pas sur les previews

### Variables d’environnement sur Vercel
- Obligatoires (Production):
  - `NEXT_PUBLIC_SUPABASE_URL` (Dashboard Supabase → Settings → API → Project URL)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Anon Key)
  - `SUPABASE_SECRET_KEY` (Service Role Key – ne pas exposer côté client)
  - `CRON_SECRET` (pour autoriser les endpoints cron)
- Optionnelles:
  - `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ADMIN_EMAIL`, `NEXT_PUBLIC_ENV`

Après configuration, relancez un déploiement en Production afin d’enregistrer les jobs cron et éviter les erreurs de prerender liées à Supabase.

## Démarrage & Exemple d’usage
1) Inscription: ouvrez `/auth/register`, saisissez email + mot de passe + confirmation
   - Si l’email existe déjà, vous serez redirigé vers `/auth/login`
   - Après inscription, vous êtes redirigé vers `/auth/login` (confirmation email possible selon réglages Supabase)
2) Connexion: ouvrez `/auth/login`, saisissez email + mot de passe
   - Une fois connecté, le Navbar affiche votre avatar/initiale avec un menu (Préférences, Logout, Administration si admin)
3) Navigation: consultez les tableaux de bord (`/admin`, `/medecin`, `/infirmiere`, `/patient`) selon votre rôle (assigné par un administrateur)

### Détail patient (nouveau)
- Un lien vers la page de détail est disponible dans la liste des patients et les suggestions de recherche.
- Route: `/admin/patients/[id]`
- Affiche: nom, contact, date de naissance, genre, groupe sanguin, utilisateur lié, gestion par staff, dates de création/mise à jour.
- Accès: réservé aux rôles staff (`admin`, `medecin`, `infirmiere`).

### Soins (nouveau)
- Pages: `/admin/soins` (administration) et `/infirmiere/soins` (infirmière)
- Composants: `SoinForm` (création) et `SoinList` (liste + mise à jour statut)
- Actions serveur: `lib/actions/soins.ts` — `createSoinAction`, `updateSoinStatusAction`, `deleteSoinAction`
- Champs: patient (via `PatientAutocomplete`), titre, description, date & heure planifiées, statut (`planned` | `in_progress` | `done`), infirmière assignée (si rôle staff)
- RBAC:
  - Création & mise à jour statut: staff (`admin`, `medecin`, `infirmiere`)
  - Suppression: `admin` uniquement
- Persistance: Supabase (`public.soins`) avec RLS attendu pour respecter les rôles ci-dessus
- Flux:
  - L’infirmière voit ses soins assignés; l’admin voit tous les soins
  - Mise à jour du statut inline; suppression via modale de confirmation côté admin
  - Les formulaires utilisent des Server Actions (pas de `fetch` client)

## Variables d'environnement
Créez un fichier `.env.local` (exemple dans `.env.local.example`).

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
CRON_SECRET=change-me
NEXT_PUBLIC_ADMIN_EMAIL=admin@gmail.com
NODE_ENV=development
NEXT_PUBLIC_ENV=local
```

## Migrations Supabase (CLI)
- Installation du CLI:
  - `brew install supabase/tap/supabase`
- Connexion:
  - `supabase login`
- Lier ce projet au ref Supabase:
  - `supabase link --project-ref dvzaybtbjdpugwepaiuy`
- Format des fichiers de migration requis:
  - `YYYYMMDDHHMMSS_name.sql` (ex.: `20251202090000_create_patients_with_rls.sql`)
- Appliquer les migrations vers la base distante du projet lié:
  - `supabase migration up --linked`
- Si le CLI se plaint du format de nom, renommez vos fichiers sous `supabase/migrations/` avec le timestamp conforme.

### Schéma `public.patients` (nouveau)
- Table: `public.patients` avec colonnes: `id`, `first_name`, `last_name`, `email`, `phone`, `dob`, `gender`, `blood_type`, `created_at`, `updated_at`, `user_id`, `managed_by_staff`.
- RLS activée avec politiques:
  - Staff (`admin`, `medecin`, `infirmiere`): `INSERT`, `SELECT`, `UPDATE` (tous).
  - Patient: `INSERT`/`SELECT`/`UPDATE` uniquement sur son propre dossier (`user_id = auth.uid()`), et pas d’`UPDATE` si `managed_by_staff = true`.
  - `DELETE` réservé à `admin`.
- Index:
  - `patients_last_name_idx` sur `last_name`.
  - `patients_user_id_idx` sur `user_id`.
  - Index uniques partiels: `patients_unique_email` (`email is not null`) et `patients_unique_phone` (`phone is not null`).

### Vérifications après migration
- Confirmer que les politiques RLS existent et que le patient ne peut pas modifier si `managed_by_staff=true`.
- Créer un dossier patient avec et sans `user_id` pour valider les règles.
- Tester l’unicité `email`/`phone` en insérant des doublons non-null (doit échouer).

### Commandes utiles
- Lister l’état des migrations locales: `supabase migration status`
- Rejouer vers local (si besoin de test): `supabase migration up` (par défaut local)
- Appliquer à la prod liée: `supabase migration up --linked`

## Authentification et RBAC
- L’attribution de rôle est réservée à l’administrateur (pas de choix de rôle à l’inscription)
- Le layout est enveloppé par un `AuthProvider` pour exposer l’utilisateur courant
- `proxy.ts` protège l’accès aux routes sensibles; un contrôle côté serveur est recommandé pour les mutations critiques
- Le menu utilisateur (Navbar) montre: Préférences, Logout et Administration (visible si `role=admin` ou `email == NEXT_PUBLIC_ADMIN_EMAIL`)

## Structure du projet
```
app/
  admin|medecin|infirmiere|patient/ ... tableaux de bord et pages
  api/ ... endpoints
  auth/login|register ... pages d’auth
components/
  ui/ ... composants génériques
  features/ ... composants métier (listes, formulaires)
lib/ ... schémas, utils, supabase, rbac, types
```

## Dépendances & Outils
- Next.js (App Router) + React
- TypeScript
- Tailwind CSS + shadcn/ui (config via `components.json`)
- Supabase (`@supabase/supabase-js`)

## Cron jobs (Vercel)
Le fichier `vercel.json` configure des tâches cron. Plan Hobby actuel:
- `/api/notifications/daily` chaque jour à 08:00
- `/api/planning/shift-reminders` chaque jour à 07:00
 - Le nettoyage des messages est exécuté dans le job `shift-reminders` (pour rester à 2 jobs)

Assurez-vous que chaque route existe et vérifie `Authorization: Bearer <CRON_SECRET>`.

### Déploiement Vercel & Sécurisation
- Ajoutez `CRON_SECRET` dans Vercel > Project Settings > Environment Variables
- Les jobs cron s’exécutent uniquement en Production
- `vercel.json` utilise la clé `crons`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "crons": [
    { "path": "/api/notifications/daily", "schedule": "0 8 * * *" },
    { "path": "/api/planning/shift-reminders", "schedule": "0 7 * * *" }
  ]
}
```

### Tests
- Pas de tests unitaires à ce stade.
- Vérifications manuelles:
  - Auth: inscription/connexion sur `/auth/register` et `/auth/login`
  - Cron local: `curl -i -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/notifications/daily`
  - Cron local: `curl -i -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/planning/shift-reminders`
- Production: vérifiez l’onglet Settings > Cron Jobs et les logs d’invocation

### Limites du plan Hobby
- 2 cron jobs max par équipe, exécution quotidienne uniquement
- Pour des fréquences/volumes plus élevés:
  - Passer au plan Pro
  - Regrouper les traitements dans un job quotidien
  - Utiliser un scheduler externe (Supabase scheduled functions, GitHub Actions, service de queue)

## Scripts NPM
- `dev`: lance le serveur de développement
- `build`: build de production
- `start`: démarre le build

## Documentation & Roadmap
- Règles projet: `.trae/rules/project_rules.md`
- Créez des issues/roadmap dans votre dépôt (GitHub/GitLab) pour suivre les fonctionnalités et corrections

## Notes
- Next.js `14.2.7` + React `18.3.1`
- Mise à niveau possible (Next 16/React 19) une fois Node 20+ disponible

## Licence
Projet interne (usage privé). Contactez l’équipe pour les droits d’utilisation.
