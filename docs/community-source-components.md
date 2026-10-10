# Références harmonisées et composants

Les références canoniques se trouvent dans outputs/beeyond-horizon-source-images du workspace, accompagnées de manifest.json (SHA-256).

## Direction artistique — carrousel et affectations

Source : 044.png

Choisir un plan → choisir le périmètre marque → affecter looks, stylisme, décor, attitude, beauté, réalisation et talents → préparer la revue du plan.

- **FrameCoverflow** — React + Embla + CSS perspective. Glisser, cliquer les flèches, un repère ou une carte ; le plan centré devient actif. Identifiant frame dans la navigation ; aucune rotation automatique.
- **FrameAllocationTray** — React + sept disciplines. La galerie sous le carrousel suit le plan choisi. Chaque + ouvre son contexte métier. studio:reference relie frameId, catégorie et éventuellement lookId.
- **RecordEditor** — Radix Dialog + formulaire contrôlé. Choisir une référence, joindre un fichier, enregistrer et commenter. Version attendue contrôlée ; erreurs visibles ; brouillon protégé à la fermeture.
- **FrameReview** — Transitions serveur. Bee examine le plan, puis la marque approuve ou demande des changements. Les références, looks et produits liés sont verrouillés pendant la revue. Le contexte de marque est celui du projet.

## Scouting — fiche immersive d'un lieu

Source : 001.png

Ouvrir un lieu → parcourir ses plans → agrandir un plan ou accéder à ses informations → consulter les notes et fichiers du lieu → ajouter une référence au bon endroit.

- **LocationGallery** — React + Embla. Sélectionner une vignette remplace la vue principale ; les flèches parcourent les plans. Plans filtrés par placeId.
- **LocationTabs** — Radix Tabs. Frames, Notes et Files changent le panneau actif au clavier ou à la souris. Pièces et notes du lieu conservées.
- **ImageLightbox** — Radix Dialog. Agrandir le plan et fermer avec Échap. Titre et source du plan sélectionné.
- **AddFrame** — RecordEditor React. Ajouter un plan avec lieu prérempli, image, lumière et cadrage. Sauvegarde réelle, fichier authentifié, refus serveur en cas de droit insuffisant.

## Scouting — tableau détaillé de préparation

Source : 049.png

Sélectionner un lieu → comparer ses plans et contraintes → consulter logistique et notes → préparer la revue Bee → ouvrir ensuite la revue marque.

- **LocationNavigator** — Boutons React + état URL. Choisir un lieu synchronise les plans et le panneau latéral. Chaque lieu garde ses informations et pièces.
- **ScoutingWorkbench** — Radix Tabs + CSS Grid. Comparer trois plans à la fois, parcourir les suivants, ouvrir un plan ou les informations du lieu. Données de lumière, permis, accès et logistique saisies par la production.
- **ReviewPanel** — React + transitions serveur. Ouvrir la revue et suivre les validations internes et marque. Aucun clic de navigation ne valide une étape.
- **LocationMap** — Lien cartographique / Leaflet sur la page itinéraire. Afficher les coordonnées lorsqu’elles sont renseignées. Ni météo ni GPS inventés ; liste accessible si la carte est indisponible.

## Stylisme — lieux, plans et looks associés

Source : 072.png

Choisir le jour et le lieu → choisir un plan → affecter un look → inspecter ses quatre vues et produits → suivre essayage et préparation.

- **StylingWorkspace** — React + CSS Grid. Choisir le lieu, le plan puis le look ; les trois panneaux restent synchronisés. Identifiants partagés dans la navigation.
- **FrameLookAssignments** — Relations studio:reference. Affecter un look ou retirer son association à un plan. Le look et ses autres associations restent conservés.
- **LookViews** — Quatre boutons image + Radix Dialog. Ouvrir les vues Front, Side, Back et Detail. Une vue manquante reste vide ; les images téléversées priment sur les concepts IA.
- **FittingChecklist** — Contrôles React persistants. Mettre à jour fit, movement, alterations et packed selon son rôle. Sauvegarde serveur et contrôle des créations en revue.
- **LookItems** — Galerie produits + RecordEditor. Ouvrir chemise, pantalon, sac ou sandales et modifier leur fiche. Produits liés par lookId ; concepts IA distingués des fiches réelles.

## Production — plan de journée

Source : 045.png

Choisir un jour → ouvrir une activité → modifier le planning → exporter.

- **DayCarousel** — Embla. Parcourir les journées et afficher les activités associées. Tri par date et horaire.
- **ActivityTimeline** — React + Radix Tabs. Ouvrir les lignes de planning et les ressources. studio:activity : lieu, membre, heure, catégorie et statut.
- **DayPlanExport** — Export HTML imprimable. Télécharger le plan de la journée. Seulement les données accessibles de la journée choisie.

## Équipe — préparation et réservations

Source : 069.png

Trouver une personne → compléter sa préparation → inviter un membre si nécessaire.

- **TeamReadiness** — React + recherche / filtre. Ouvrir les six contrôles de préparation de chaque membre. studio:readiness lié à memberId.
- **InvitationDialog** — Radix Dialog + API. Créer un lien personnel valable sept jours, copier ou révoquer. Jeton haché, usage unique, invitation limitée au projet ; aucun email envoyé automatiquement.
- **CrewCalendar** — Tableau React Gantt. Cliquer un jour pour affecter un membre sur une période. Affectation proposée / confirmée / indisponible sauvegardée.

## Post-production — sélection et passation

Source : 023.png

Organiser les sources → sélectionner → transmettre le brief → versionner → Bee → marque → livrer.

- **MediaSelection** — Embla + Radix Dialog. Parcourir et agrandir les sources ou références. Les originaux joints priment ; les concepts ne sont pas des livrables.
- **HandoffFields** — Formulaire React. Modifier sélection, retouche, couleur, formats et échéance. Brouillon persistant et source de version identifiée.
- **ReviewNotes** — API commentaires + React. Écrire un retour et consulter l’historique. Auteur authentifié, horodatage et objet liés.
- **MediaVersions** — Filtres React + workflow serveur. Examiner une version et ses validations. Révision source contrôlée ; une ancienne validation ne valide pas une nouvelle version.

## Impact — actions et preuves

Source : 064.png

Choisir une action → déposer une preuve → revue Bee → expert selon le risque.

- **EvidenceWorkbench** — React + Radix Tabs. Choisir une action et ouvrir ses pièces. Action, Bloom et partenaire liés.
- **EvidenceEditor** — RecordEditor + fichiers authentifiés. Joindre un document ou une source HTTPS et soumettre. Une image IA décorative ne devient jamais une preuve.
- **ExpertAssignment** — Contrôle serveur. Bee affecte un expert et suit son avis. L’expert ne voit que les objets qui lui sont affectés.

## Impact — suivi du capital

Source : 055.png

Choisir un niveau de capital → examiner une allocation → enregistrer son état et ses dépenses.

- **CapitalDistribution** — React + conic-gradient CSS. Filtrer le périmètre et lire la répartition. Parts recalculées depuis les montants enregistrés ; pas de graphique chiffré fixe.
- **AllocationList** — React + RecordEditor. Ouvrir chaque allocation et ses transitions autorisées. États engagés, affectés, libérés et dépenses documentés ; aucun paiement automatique.
- **ExpenseGuard** — API transactionnelle. Vérifier les dépenses avant approbation. Allocation du bon partenaire et budget restant contrôlés.

## Impact — indicateurs et progression

Source : 054.png

Définir objectif et méthode → joindre preuves → saisir observé → valider → reporter.

- **IndicatorTable** — Tableau React. Ouvrir l’indicateur ou sa preuve, filtrer le pilier. Cibles distinctes des valeurs observées validées.
- **RiskReview** — Règles serveur. Imposer l’expert selon le risque et le type. Risque élevé, affirmation publique ou estimation à risque moyen exigent sa validation.
- **ReportExport** — Export JSON. Exporter les données accessibles de la production. Les estimations de production gardent leur méthode et leurs facteurs ; aucune certification automatique.
