# Docta – Monorepo Next.js (App Router)

Docta est une application de gestion sanitaire avec des tableaux de bord pour les rôles `admin`, `médecin`, `infirmière` et `patient`. Elle est construite avec Next.js (App Router), TypeScript, Tailwind CSS et intégrations Supabase.

## Aperçu
- App Router avec pages de fonctionnalités: patients, rendez-vous, messages, notifications, planning, soins, hospitalisations
- RBAC simple via cookie `role` et middleware
- UI réutilisable (inputs, select, textarea, button) + Navbar & Footer
- API routes sous `app/api/*` (placeholders prêts pour intégration)

## Prérequis
- Node.js >= 18 (recommandé: 20+)
- npm >= 9
- Compte Supabase si vous souhaitez la persistance

## Démarrage
```bash
npm install
npm run dev
# http://localhost:3000
```

## Variables d'environnement
Créez un fichier `.env.local` (exemple dans `.env.local.example`).

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=change-me
NODE_ENV=development
NEXT_PUBLIC_ENV=local
```

## Authentification et RBAC
- Le cookie `role` détermine la redirection initiale:
  - `/admin`, `/medecin`, `/infirmiere`, `/patient`
- Sans rôle, redirection vers `/auth/login`.
- Le middleware (`middleware.ts`) protège l'accès aux routes par rôle.

## Structure du projet
```
app/
  admin|medecin|infirmiere|patient/ ... tableaux de bord et pages
  api/ ... endpoints (à implémenter)
  auth/login/ ... page de connexion minimale
components/
  ui/ ... composants génériques
  features/ ... composants métier (listes, formulaires)
lib/ ... schémas, utils, supabase, rbac, types
```

## Shadcn/ui
- Fichier `components.json` ajouté pour configurer le chemin des composants et utilitaires.
- Tailwind CSS v4 actif via `app/globals.css`.
- Pour ajouter des composants shadcn:
```bash
# Exemple
npx shadcn-ui@latest add button input textarea select
```

## Cron jobs (Vercel)
Le fichier `vercel.json` configure des tâches cron (planification côté Vercel). Exemple:
- `/api/notifications/daily` chaque jour à 08:00
- `/api/planning/shift-reminders` toutes les 15 minutes
- `/api/messages/cleanup` chaque dimanche à 03:00

Assurez-vous que chaque route existe et vérifie le header/secrets (ex: `CRON_SECRET`).

## Scripts NPM
- `dev`: lance le serveur de développement
- `build`: build de production
- `start`: démarre le build

## Notes
- Next.js `14.2.7` + React `18.3.1` pour compatibilité Node 18 locale.
- Mise à niveau possible (Next 16/React 19) une fois Node 20+ disponible.

## Licence
Projet interne (usage privé). Contactez l'équipe pour les droits d'utilisation.
