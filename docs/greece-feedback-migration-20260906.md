# Grèce — migration du feedback du 6 septembre 2026

Migration ponctuelle de `content_documents`, exclusivement pour la campagne `veganboost-greece`. Les médias et textes autorisés sont définis dans `scripts/migrate-greece-feedback-20260906.mjs`. Aucune autre campagne n'est créée, publiée ou modifiée.

## Exécution en deux étapes

1. Déployer le code et les dix médias `feedback-20260906-*`, puis vérifier le déploiement et les fichiers dans le navigateur.
2. Après cette vérification, déployer le raccordement `postbuild` de `package.json`. Il exécute `scripts/run-production-content-migrations.mjs`, qui lance la migration avec `--apply` uniquement en production Vercel. Ce second déploiement applique le contenu après la réussite du build.

```text
node scripts/migrate-greece-feedback-20260906.mjs            # lecture seule
node scripts/migrate-greece-feedback-20260906.mjs --dry-run  # même résultat
node scripts/migrate-greece-feedback-20260906.mjs --apply    # production Vercel uniquement
```

Le hook ignore les builds locaux et preview, et ne lance `--apply` que si `VERCEL_ENV` vaut `production`. Le script vérifie aussi ce prérequis avant toute connexion. `DATABASE_URL` est fournie exclusivement par le serveur ; aucun fichier `.env`, argument de connexion, export de secret ou endpoint public n'est ajouté. Le préflight contrôle l'existence, la taille non nulle et le SHA-256 des dix médias présents dans le checkout. Il ne fait aucune requête HTTP vers le site public : la disponibilité du premier déploiement est vérifiée séparément avant la seconde étape.

## Périmètre exact

- Saison d'affichage : Spring Summer 2024, filtre `spring-summer`.
- Vignette du carrousel et son texte alternatif, vidéo de fond de carte et poster.
- Vidéo et poster du hero.
- Vidéo hero, vidéo story et six images du Tale.
- Les seules références remplacées dans la liste des vidéos sont celles du hero et de la story précédents ; les vidéos supplémentaires restent présentes, y compris dans le brouillon.

Le titre **Memory of the moon**, le récit, l'année de prise de vue, la galerie, les crédits, les CTA et les autres champs restent inchangés. Les structures `draft` et `published` sont transformées séparément, chacune depuis son propre contenu. Un brouillon distinct n'est jamais copié dans la version publiée. Les deux compteurs de révision augmentent de 1 lorsqu'un changement est nécessaire : leur écart, et donc l'indicateur de brouillon non publié, est conservé. Si les médias sont déjà corrects mais qu'aucune trace de migration n'existe, le script enregistre la migration sans augmenter ces compteurs ni modifier les dates éditoriales.

## Atomicité et concurrence

La lecture initiale prépare une proposition limitée à une liste explicite de chemins JSON. L'application utilise une transaction PostgreSQL `Serializable` comprenant :

1. La création additive du registre `public.content_migration_ledger` s'il n'existe pas.
2. La vérification que `migration_key` est bien l'unique colonne de sa clé primaire. Un registre existant non conforme bloque l'exécution.
3. Une seule instruction SQL qui verrouille et vérifie la ligne cible, applique la proposition, puis insère sa sauvegarde dans le registre via `RETURNING`.

La garde vérifie l'identifiant, le type, le slug, l'état non archivé, les deux révisions et l'égalité JSON des deux versions. Une sauvegarde CMS intervenue entre la lecture et l'application provoque un refus ou un conflit de sérialisation ; le script ne recalcule pas puis n'applique pas silencieusement un nouveau contenu. Un conflit de clé dans le registre annule la transaction entière : il n'y a pas de `ON CONFLICT DO NOTHING` après la mise à jour.

Le registre conserve la ligne complète avant et après modification, les chemins modifiés, les empreintes des médias, l'empreinte du script et la date d'application. La sauvegarde reste dans la même base serveur. Aucune sauvegarde contenant des brouillons n'est écrite dans les logs, le dépôt ou un fichier téléchargeable.

## Idempotence durable

Clé permanente : `campaign:veganboost-greece:eugenie-feedback:2026-09-06:v1`.

Si cette clé est présente, toute nouvelle exécution retourne `already-applied` sans relire ni modifier le document de campagne. Des corrections ultérieures dans l'administration sont donc conservées, même si le hook demeure dans les builds suivants. Ne pas supprimer la clé ni la réutiliser pour un nouveau changement. Un correctif ultérieur doit avoir sa propre migration revue et sa propre clé.

Le mode par défaut ne crée aucune table et n'appelle aucun helper de seed ou de création de schéma. Il affiche seulement les chemins à modifier, les révisions et le nombre de médias locaux. Une erreur réseau après l'envoi de la transaction ne permet pas de conclure que rien n'a été écrit : le script relit le registre quand c'est possible, sinon signale une exécution non confirmée. Relancer le mode lecture seule permet de vérifier la présence du reçu avant toute reprise.

## Validation et maintenance

```text
node --test scripts/__tests__/migrate-greece-feedback-20260906.node-test.mjs
```

Les tests couvrent la conservation des deux récits indépendants, les champs non ciblés, les vidéos supplémentaires, les révisions, le dry-run sans écriture, le refus hors production, le registre permanent, le refus d'un instantané périmé et les dix médias locaux. Le suffixe `node-test.mjs` évite l'exécution accidentelle de ces tests Node par la suite Vitest/jsdom de l'application.

À la préparation de ce changement, aucune connexion ni écriture sur une vraie base n'a été exécutée. Les tests de concurrence utilisent un transport simulé ; ils ne remplacent pas la vérification du reçu serveur à l'application réelle. Les autorisations de création du registre et les contraintes actuelles de la base seront vérifiées lors de l'exécution serveur. Un échec doit faire échouer le hook, sans poursuivre comme si la migration était appliquée.

Le script n'offre pas de rollback automatique. Si un retour est nécessaire, préparer une migration distincte depuis `before_state`, vérifier que le contenu courant correspond encore à `after_state`, puis appliquer une garde équivalente. Restaurer aveuglément une ancienne sauvegarde risquerait d'effacer des éditions ultérieures. Le registre doit rester intact après la migration ; le hook peut être retiré une fois l'application et le site vérifiés.
