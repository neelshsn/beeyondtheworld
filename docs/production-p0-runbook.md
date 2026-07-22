# Beeyondtheworld — activation du correctif P0

Ce correctif est préparé sur la branche locale `codex/p0-platform-reliability`. Il ne doit pas être considéré comme actif tant que la migration, la configuration et les tests de préproduction ci-dessous ne sont pas terminés.

## Ordre d'activation

1. Configurer `DATABASE_URL` dans l'environnement cible, sans copier sa valeur dans Git ou dans le vault.
2. Exécuter `npm run db:migrate:leads` une seule fois sur la base cible.
3. Configurer `SUPABASE_CONTACT_NOTIFICATION_FUNCTION` avec le nom de la fonction de notification existante.
4. Dans une préproduction, soumettre un faux lead Contact et un faux booking Philippines.
5. Vérifier les deux références dans `/admin/leads`, puis confirmer la réception des deux notifications.
6. Après validation humaine, intégrer la branche à `main`, puis faire pointer la production Vercel sur `main`.

## Contrôles bloquants

- Aucun succès ne doit être affiché si le lead n'est pas présent dans la base.
- `/admin` et `/admin/leads` doivent exiger une session administrateur.
- Le premier compte administrateur en production doit exiger `ADMIN_BOOTSTRAP_TOKEN`.
- Les variables Supabase absentes ou invalides doivent fermer l'accès privé, jamais créer une session de démonstration.
- Les deux soumissions de test doivent être récupérables dans l'inbox même si la notification échoue.

## Retour arrière

Avant tout déploiement, conserver l'identifiant du déploiement Vercel actif. En cas de régression, restaurer ce déploiement, puis diagnostiquer la branche sans supprimer les leads déjà écrits.
