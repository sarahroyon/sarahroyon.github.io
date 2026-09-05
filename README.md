# sarahroyon.github.io

Site personnel de Sarah Royon et entraînement aux QCM de questions européennes du concours de secrétaire des affaires étrangères.

La page [questions.html](questions.html), accessible depuis l’accueil, fonctionne entièrement dans le navigateur, en HTML, CSS et JavaScript natifs. Elle charge la [base de questions](data/annales/questions-europeennes-2026.json) et propose trois sujets : les annales externes 2026 des cadres d’Orient (SAEO) et général (SAEG), soit 60 QCM chacune, et le « Sujet SAEG 3 », un entraînement personnel de Sarah Royon contenant 40 QCM. Les 6 QRC sont conservées dans la base et ne font pas partie du questionnaire interactif.

L’index permet de retrouver chaque question et de voir les choix renseignés. Il reste à gauche sur ordinateur et se replie sur mobile. Les réponses et l’état du bilan sont sauvegardés dans `localStorage`, séparément pour chaque sujet. Ils restent sur l’appareil de l’étudiant ; aucun compte ni serveur applicatif n’est nécessaire. Le bouton « Modifier mes réponses » permet de reprendre un questionnaire terminé.

Les sujets sont proposés automatiquement à partir des sources de la base contenant des QCM. Les sources `annale` et `creation` sont présentées distinctement. « Sujet SAEG 3 » impose une seule réponse par question : ses choix utilisent des boutons radio. Le PDF ne donne pas de corrigé ni de barème QCM ; cet entraînement n’est donc pas noté. Les deux QRC de ce sujet valent chacune 5 points, conformément au document.

Le bilan utilise les corrigés disponibles : actuellement les dix premiers QCM SAEO. Les questions sans corrigé sont accessibles en entraînement libre et exclues du score. Le score est présenté sur le maximum des seules questions notées, sans conversion en note de concours sur 20. Les pénalités proviennent du barème de la base ; une sélection strictement partielle reste non notée lorsque son barème n’est pas renseigné. Voir la [documentation des annales](data/annales/README.md).

Pour prévisualiser le site, ouvrir directement `index.html` ou `questions.html` dans le navigateur en conservant l’arborescence du dossier. La page fonctionne aussi depuis un serveur HTTP statique ou GitHub Pages. Aucun serveur ni dépendance externe n’est nécessaire pour l’ouverture locale.

En HTTP(S), la page lit le JSON. En ouverture directe (`file://`), elle charge son équivalent JavaScript [questions-europeennes-2026.js](data/annales/questions-europeennes-2026.js), car les navigateurs bloquent la lecture du JSON par `fetch` dans ce contexte. Les scripts de la page sont des scripts classiques, également compatibles avec cette ouverture.

Le JSON reste la seule base à modifier. Après une modification des questions ou des corrigés, actualiser son équivalent local avec :

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-annales.ps1
```

Ajouter `-Check` à cette commande pour vérifier que les deux fichiers sont synchronisés. Le fichier généré est inclus dans le site : cette commande sert uniquement à la maintenance des données.
