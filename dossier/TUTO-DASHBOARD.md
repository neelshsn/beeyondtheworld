# 🐝 Tuto — Dashboard d'édition des voyages (Journeys CMS)

> Pour les éditeurs du site (ex. Eugénie). Le dashboard permet de **créer / éditer les voyages et leurs locations** : textes, dates, images/vidéos (URLs), PDF Sustainable Impact, et l'**ordre d'affichage** sur le site.

---

## 1. Activer ton compte (première fois uniquement)

1. Ouvre ton **lien d'activation personnel** (transmis en privé — il est à **usage unique**, ne le partage pas).
2. La page « **Bienvenue — choisis ton mot de passe** » s'affiche : saisis un mot de passe (8 caractères minimum), confirme-le, clique **« Activer mon compte »**.
3. C'est tout : ton compte est activé et tu es connecté·e pour 30 jours.

⚠️ Si le lien ne fonctionne plus (déjà utilisé, perdu) : demander un nouveau lien — il se régénère en une commande (`node scripts/invite-admin.mjs ton@email.com`), l'ancienne invitation est remplacée.

## 2. Se connecter (les fois suivantes)

1. Va sur **`https://beeyondtheworld.com/admin/journeys`**.
2. Écran « **Connexion éditeur** » : e-mail + ton mot de passe → **Se connecter**.
3. La session dure 30 jours ; bouton **Déconnexion** en haut à droite.

## 3. Éditer les voyages

- **La liste** montre tous les voyages dans l'ordre du site. Les flèches **↑ ↓** changent cet ordre (répercuté immédiatement sur la page `/journeys`).
- **Clique sur un voyage** pour le déplier et éditer :
  - **Slug** (URL du voyage — ne pas toucher sans raison), **Titre**, **Saison** (Spring Summer / Fall Winter), **Lieu** ;
  - **Libellé de dates** (ex. « From 1st May to 30th September ») + champs **From** / **To** ;
  - **Image** et **Vidéo de fond** : coller l'URL du média (ex. `/assets/journeys/...` pour un fichier du site, ou une URL complète) ;
  - **PDF Sustainable Impact** : URL du PDF (ex. `/pdfs/philippines-lighting-oceans-wonders.pdf`) — laisser vide s'il n'y en a pas (le bouton sera masqué sur le site).
  - Clique **« Enregistrer le voyage »**.
- **Locations** (dans chaque voyage) : ajouter (nom + « Ajouter »), éditer (nom, sous-titre, image, vidéo, « Titre gauche » — 1 ligne du titre par ligne de texte —, narratif), réordonner **↑ ↓**, ou **Supprimer**.
- **Nouveau voyage** : slug + titre dans la carte « Actions », puis complète les champs en dépliant.
- **Seed depuis le contenu du site** : ré-importe les voyages codés en dur (utile pour repartir de la base d'origine — écrase les champs des voyages existants, conserve ceux créés à la main).

## 4. Bon à savoir

- La page **`/journeys`** du site lit ces données en direct (si la base est vide ou injoignable, le site retombe sur son contenu d'origine — il ne casse jamais).
- Les **pages détail** de chaque voyage (`/journeys/nom-du-voyage`) sont encore sur le contenu codé en dur — leur branchement au CMS est la prochaine étape.
- Sécurité : comptes et sessions stockés dans Neon (mots de passe hashés), cookie sécurisé httpOnly. Un éditeur connecté peut créer d'autres comptes ; personne d'autre ne peut s'inscrire.
