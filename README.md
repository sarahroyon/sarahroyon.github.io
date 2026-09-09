# Questions européennes

Site de préparation aux QCM de questions européennes du concours de secrétaire des affaires étrangères. La page [questions.html](questions.html) fonctionne en HTML, CSS et JavaScript natifs, sans compte ni serveur applicatif.

## Choisir un quiz

La sélection présente trois sections, dans cet ordre : **Annales**, **Catégories**, puis **Quiz aléatoire**. Les annales proposent **SAEG** (60 QCM), **SAEO** (60 QCM) et **V0 — Sujet zéro officiel** (10 QCM), dans l’ordre de chaque sujet, avec un lien vers le document original. Les cinq catégories proposent chacune de 1 à 75 questions corrigées. Le quiz aléatoire puise dans les 475 QCM de la banque, toutes sources confondues. Le nombre proposé par défaut pour les tirages est 20. Les tirages sont uniformes et sans répétition au sein d’un quiz.

Les anciens sujets d’entraînement alimentent toujours les questions, mais ne sont plus proposés séparément. Les 12 QRC restent conservées dans les données et sont exclues des quiz. La provenance, le contexte temporel et le mode de réponse de chaque question restent affichés. Voir le [catalogue des 375 questions par catégorie](data/categories/CATALOGUE.md).

## Barème commun

Tous les quiz utilisent le barème des véritables annales **SAEO et SAEG 2026** : **+0,20 point par réponse exacte, −0,10 par réponse incorrecte et −0,05 sans réponse**. Pour les questions à choix multiples, il faut sélectionner toutes les bonnes réponses et aucune autre. Une sélection comportant un choix faux est incorrecte. Une sélection incomplète ne comportant que des choix corrects reste non notée, car les annales ne précisent pas ce cas ; elle est signalée séparément dans le bilan et le corrigé.

Le maximum vaut 0,20 point par question notée : par exemple, 60 questions notées donnent un score sur 12 points, et 20 sur 4 points. Les réponses partielles, les questions neutralisées et les questions sans corrigé sont exclues du score et de son maximum. Les scores négatifs sont conservés, sans conversion en note sur 20. Le barème commun est défini dans `QcmCore.quizBareme` et contrôlé par les tests contre les valeurs des annales dans les données. Il est annoncé avant le quiz ainsi que dans le bilan. Les autres barèmes historiques restent des métadonnées des documents d’origine. Les corrigés sont pédagogiques.

## Chronomètre et reprise

Le chronomètre démarre avec le quiz et compte le temps passé sur sa page. Il se met en pause lorsqu’on change de quiz, masque l’onglet, quitte la page ou affiche le bilan. « Modifier mes réponses » reprend le chronomètre. Le temps total figure dans le bilan ; au-delà d’une heure, l’affichage passe de `mm:ss` à `hh:mm:ss`.

Le tirage, son ordre, les réponses, l’état du bilan et le temps écoulé sont sauvegardés dans `localStorage`, séparément pour chaque annale, chaque catégorie et le quiz aléatoire. Le temps est enregistré toutes les cinq secondes et lors des interactions ou de la mise en pause. Les anciennes sauvegardes restent compatibles ; leur temps initial vaut zéro. Les données restent dans le navigateur de l’utilisateur.

- **Remettre à zéro** efface les réponses, le bilan et le temps, puis redémarre le même quiz en gardant l’ordre des questions.
- **Nouveau tirage**, disponible pour les catégories et le quiz aléatoire, tire un nouveau quiz de même longueur et remet les réponses, le bilan et le temps à zéro. Les annales gardent toujours les questions dans l’ordre du sujet original.
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
