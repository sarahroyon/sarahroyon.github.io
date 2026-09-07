# sarahroyon.github.io

Site personnel de Sarah Royon et entraînement aux QCM de questions européennes du concours de secrétaire des affaires étrangères.

La page [questions.html](questions.html), accessible depuis l’accueil, fonctionne entièrement dans le navigateur, en HTML, CSS et JavaScript natifs. Elle charge la [base de questions](data/annales/questions-europeennes-2026.json) et propose six sujets dans deux sections : les annales officielles des cadres d’Orient (SAEO) et général (SAEG), soit 60 QCM chacune, accompagnées du sujet V0 officiel (10 QCM), puis « Entraînement 1 », « Entraînement 2 » et « Entraînement 3 », contenant chacun 40 QCM. Les 12 QRC sont conservées dans la base et ne font pas partie du questionnaire interactif.

L’index permet de retrouver chaque question et de voir les choix renseignés. Il reste à gauche sur ordinateur et se replie sur mobile. Les réponses et l’état du bilan sont sauvegardés dans `localStorage`, séparément pour chaque sujet. Ils restent sur l’appareil de l’étudiant ; aucun compte ni serveur applicatif n’est nécessaire. Le bouton « Modifier mes réponses » permet de reprendre un questionnaire terminé.

Les sujets sont proposés automatiquement à partir des sources de la base contenant des QCM. Les sources `annale` et `sujet_zero` sont regroupées dans les sujets officiels ; les sources `creation` figurent dans les sujets d’entraînement. Les trois entraînements imposent une seule réponse par question : leurs choix utilisent des boutons radio. Leurs PDF, nommés `entrainement-1.pdf`, `entrainement-2.pdf` et `entrainement-3.pdf`, ne précisent pas de barème QCM : le bilan valide les réponses sans note chiffrée. Les deux QRC de chaque entraînement valent chacune 5 points, conformément aux documents.

Le bilan des sujets existants utilise les corrigés d’entraînement des 250 QCM d’origine. Les 12 questions initialement neutralisées ont été adaptées à la demande de l’autrice pour permettre une réponse unique, puis leurs corrigés ont été mis à jour. Lorsqu’un barème est disponible, le score est présenté sur le maximum des seules questions notées, sans conversion en note de concours sur 20. Les pénalités proviennent du barème de la base ; une sélection strictement partielle reste non notée lorsque son barème n’est pas renseigné. Voir la [documentation des annales](data/annales/README.md).

La section « Sujet aléatoire », sous les sujets d’entraînement, permet de choisir de 1 au nombre total de QCM de la banque (475 actuellement). Le quiz est tiré uniformément sans remise dans l’ensemble des QCM, toutes sources confondues, par un mélange partiel de Fisher–Yates. Chaque entrée de la banque a la même probabilité d’être sélectionnée ; les QRC sont exclues. Le nombre proposé par défaut est 20. Le bouton « Régénérer le quiz » effectue un nouveau tirage du même nombre de questions et remet les réponses à zéro ; « Changer de sujet » permet de modifier ce nombre. Le dernier tirage, son ordre, les réponses et l’état du bilan sont sauvegardés séparément des autres sujets. Chaque question conserve son mode de réponse d’origine, avec sa provenance affichée, et la numérotation du quiz va de 1 au nombre choisi. Les corrigés sont affichés sans note chiffrée, les barèmes des sujets d’origine étant différents.

La section « Entraînement par catégorie » propose **75 questions corrigées pour chacun des cinq thèmes**, soit 375 questions sélectionnées (150 reprises et 225 nouvelles). Choisir entre 1 et 75 questions génère un tirage uniforme sans répétition dans la catégorie ; il est possible de le régénérer, de le reprendre ou d’en modifier la longueur. La sauvegarde est indépendante pour chaque thème. Les questions reprises conservent leur provenance et leur contexte temporel. Voir le [catalogue des questions et corrigés](data/categories/CATALOGUE.md) et la [documentation de la banque thématique](data/categories/README.md).

Pour prévisualiser le site, ouvrir directement `index.html` ou `questions.html` dans le navigateur en conservant l’arborescence du dossier. La page fonctionne aussi depuis un serveur HTTP statique ou GitHub Pages. Aucun serveur ni dépendance externe n’est nécessaire pour l’ouverture locale.

En HTTP(S), la page lit les JSON des annales et des catégories, puis fusionne les questions sans dupliquer les entrées reprises. En ouverture directe (`file://`), elle charge les équivalents JavaScript des catégories et des annales, dont [questions-europeennes-2026.js](data/annales/questions-europeennes-2026.js), car les navigateurs bloquent la lecture du JSON par `fetch` dans ce contexte. Les scripts de la page sont des scripts classiques, également compatibles avec cette ouverture.

Les JSON restent les sources à modifier. Après une modification des questions ou des corrigés, actualiser son équivalent local avec :

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-annales.ps1
```

Ajouter `-Check` à cette commande pour vérifier que les deux fichiers sont synchronisés. Le fichier généré est inclus dans le site : cette commande sert uniquement à la maintenance des données.

Après une modification des catégories ou des corrigés repris dans le catalogue, exécuter aussi `powershell -ExecutionPolicy Bypass -File scripts/sync-categories.ps1` (ou `-Check` pour contrôler la synchronisation).

Ouvrir [scripts/check-quiz.html](scripts/check-quiz.html) pour vérifier les tirages, les cinq catégories, les corrigés, la sauvegarde et les parcours existants dans un navigateur. Le contrôle fonctionne en ouverture locale ou depuis un serveur HTTP et restaure les sauvegardes présentes à son lancement.
