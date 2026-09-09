# Questions européennes

Site de préparation aux QCM de questions européennes du concours de secrétaire des affaires étrangères. La page [questions.html](questions.html) fonctionne en HTML, CSS et JavaScript natifs, sans compte ni serveur applicatif.

## Choisir un quiz

La sélection présente uniquement **Catégories**, puis **Quiz aléatoire**. Les cinq catégories proposent chacune de 1 à 75 questions corrigées. Le quiz aléatoire puise dans les 475 QCM de la banque, toutes sources confondues. Le nombre proposé par défaut est 20. Les tirages sont uniformes et sans répétition au sein d’un quiz.

Les anciens sujets officiels et d’entraînement alimentent toujours les questions, mais ne sont plus proposés séparément. Les 12 QRC restent conservées dans les données et sont exclues des quiz. La provenance, le contexte temporel et le mode de réponse de chaque question restent affichés. Voir le [catalogue des 375 questions par catégorie](data/categories/CATALOGUE.md).

## Barème commun

Tous les quiz utilisent le même barème : **1 point par réponse exacte, 0 pour une réponse incorrecte, partielle ou absente**. Pour les questions à choix multiples, il faut sélectionner toutes les bonnes réponses et aucune autre. Les sélections partielles sont détaillées dans le corrigé et comptées parmi les réponses incorrectes dans le bilan.

Le score est affiché sur le nombre de questions notées. Seules les éventuelles questions neutralisées ou sans corrigé sont exclues du maximum. Les barèmes historiques conservés dans les données décrivent les documents d’origine ; ils ne servent plus à noter les quiz. Le barème de l’application est défini une seule fois dans `QcmCore.quizBareme` et annoncé avant le quiz ainsi que dans le bilan. Les corrigés sont pédagogiques.

## Chronomètre et reprise

Le chronomètre démarre avec le quiz et compte le temps passé sur sa page. Il se met en pause lorsqu’on change de quiz, masque l’onglet, quitte la page ou affiche le bilan. « Modifier mes réponses » reprend le chronomètre. Le temps total figure dans le bilan ; au-delà d’une heure, l’affichage passe de `mm:ss` à `hh:mm:ss`.

Le tirage, son ordre, les réponses, l’état du bilan et le temps écoulé sont sauvegardés dans `localStorage`, séparément pour chaque catégorie et pour le quiz aléatoire. Le temps est enregistré toutes les cinq secondes et lors des interactions ou de la mise en pause. Les anciennes sauvegardes restent compatibles ; leur temps initial vaut zéro. Les données restent dans le navigateur de l’utilisateur.

- **Remettre à zéro** efface les réponses, le bilan et le temps, puis redémarre le même quiz en gardant l’ordre des questions.
- **Nouveau tirage** tire un nouveau quiz de même longueur et remet les réponses, le bilan et le temps à zéro.
- **Changer de quiz** revient à la sélection pour choisir une catégorie ou modifier le nombre de questions.

## Prévisualisation et maintenance

Ouvrir `index.html` ou `questions.html` dans un navigateur en conservant l’arborescence du dossier, ou servir le site en HTTP, notamment avec GitHub Pages. En HTTP(S), la page lit les fichiers JSON ; en ouverture directe (`file://`), elle charge leurs équivalents JavaScript.

Les JSON restent les sources à modifier. Après modification, synchroniser les fichiers générés :

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-annales.ps1
powershell -ExecutionPolicy Bypass -File scripts/sync-categories.ps1
```

Ajouter `-Check` pour contrôler la synchronisation sans modifier les fichiers. Voir la [documentation des annales](data/annales/README.md) et celle des [catégories](data/categories/README.md).

Ouvrir [scripts/check-quiz.html](scripts/check-quiz.html) pour vérifier le barème, les tirages, les corrigés, le chronomètre, la remise à zéro, la sauvegarde et l’affichage mobile. Ce contrôle fonctionne en ouverture locale ou en HTTP et restaure les sauvegardes présentes au lancement.
