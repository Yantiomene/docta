# Règles de développement – Docta

Ces règles visent à garder une base de code cohérente, lisible et sécurisée.

## Code & Style
- TypeScript obligatoire pour tous les fichiers (TS/TSX).
- Strict mode activé, pas d'any implicite.
- Respect des alias `@/components`, `@/lib`, `@/app`.
- Pas de commentaires inutiles, privilégier des noms explicites.
- Préférer des fonctions pures et des composants sans état quand c’est possible.
- Utiliser `cn` pour composer des classes Tailwind.

## Structure
- `app/` pour pages (App Router) et API routes.
- `components/ui/` pour composants génériques; `components/features/` pour métier.
- `lib/` pour utilitaires, validation, types, supabase, rbac.

## Commits & PR
- Messages de commit clairs (fr: verbe à l’infinitif, ex: "Ajouter …").
- PR petite et atomique; inclure description, captures d’écran si UI.
- Revue obligatoire pour les changements sensibles (auth, sécurité, DB).

## Environnements
- Ne JAMAIS commiter `.env.local` en production.
- Maintenir `.env.local.example` à jour.
- Utiliser `CRON_SECRET` pour sécuriser les endpoints de tâches planifiées.

## Tests & Qualité
- Ajouter des tests unitaires pour la logique critique (lib, rbac, utils).
- Vérifier l’accessibilité (labels, contrastes, navigation clavier).
- Éviter les régressions: tester manuellement les pages impactées.

## Sécurité
- Valider les données avec schémas (zod/yup) côté serveur.
- Ne pas exposer des secrets côté client.
- Vérifier le rôle et les permissions dans les API sensibles.

## Dépendances
- Éviter les dépendances non essentielles.
- Tenir à jour `README.md` quand une dépendance nécessite une config.

## Déploiement & Cron
- Définir les jobs dans `vercel.json` et documenter les endpoints.
- Les routes de cron doivent vérifier un header secret (ex: `Authorization: Bearer ${CRON_SECRET}`).

## Performance
- Mémoïser les composants lourds.
- Fragmenter le bundle via le App Router (segmentations, edge si pertinent).

