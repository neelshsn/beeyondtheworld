# Horizon — style validé, structure guidée par les sources

Le 10 octobre 2026, l’utilisateur valide le style Horizon (A), puis corrige la portée de cette validation : les écrans détaillés du dossier Drive priment pour les fonctionnalités, composants, compositions et interactions, notamment les carrousels. Horizon harmonise les couleurs, typographies, icônes et assets. La demande suivante autorise explicitement la reconstruction fonctionnelle puis la publication en production.

Référence : catalogue de décision, screen.css SHA-256 3d8e5af38c5db1ed56b258d3287abc943aa2c1d7eeaabd0d2f93331db191ea02.

Contrat graphique : Cannia / Avenir, fond atmosphérique bleu, or fin, photographie immersive, hiérarchie sobre. Les positions des rails et compositions simplifiées du catalogue ne sont pas imposées aux écrans métier.

## Priorité des références

1. Instructions et décisions métier confirmées par l’utilisateur.
2. Écrans et annotations du dossier original, indexés dans `work/reference-index.json` à la racine du workspace, y compris les variantes par métier.
3. Horizon A pour harmoniser la direction artistique.
4. Composants du dépôt puis références ciblées de 21st.dev, choisis pour reproduire les sources.

Le catalogue de 94 pages et 501 vues par métier est un inventaire de parcours, pas une preuve de couverture fonctionnelle. La validation d’Horizon ne valide pas une réduction des fonctionnalités.

## Invariants de fidélité

- Carrousel navigable, plan actif, miniatures synchronisées, agrandissement et commandes réelles lorsque présents dans les sources.
- Compositions spécifiques : scouting à onglets, allocations par plan et métier, stylisme à panneaux liés, réservations par personne, calendrier de postproduction, tableaux de suivi et preuves d’impact.
- Changer de plan ou de marque charge les données associées. Les cartes ne doivent pas toutes ouvrir le même formulaire générique.
- Portefeuille de tous les projets attribués au métier. Changement de rôle réservé aux comptes de test.
- Scouting entre Bee et Flower. Validation créative Bee puis marque ; budgets Bee ; revue experte selon type d’indicateur et risque.
- Brief découpé sans perte des champs, variantes ni pièces jointes documentés.
- Assets par voyage. Les visuels IA illustrent un concept ; les portraits de l’équipe réelle, produits exacts, repérages validés et preuves terrain utilisent leurs sources réelles.
- Même système graphique pour tous les métiers ; outils et permissions dépendent du métier et de l’objet sélectionné.

## État et preuve attendue

Les composants spécialisés, les formulaires par étape et les objets persistants sont construits. Les essais QA couvrent 12 rôles et 489 vues accessibles, ainsi que sauvegardes, fichiers, validations, invitations et conflits. La preuve de production est consignée séparément dans le rapport de livraison.

Rapport et matrice : `outputs/beeyond-source-audit/` à la racine du workspace. Avant reprise, reconstruire les écrans métier à partir de cette matrice et vérifier interactions et rendu contre les originaux. Une page navigable et des champs sauvegardés ne suffisent pas à la déclarer fidèle.
