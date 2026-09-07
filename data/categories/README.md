# Entraînements par catégorie

La banque thématique contient **375 QCM corrigés**, soit 75 pour chacune des cinq rubriques du programme. Le [catalogue complet](CATALOGUE.md) réunit les énoncés, choix, réponses, explications et références, avec la provenance des questions reprises.

| Catégorie | Questions reprises | Questions nouvelles | Total |
| --- | ---: | ---: | ---: |
| [Histoire de la construction européenne](histoire.json) | 22 | 53 | 75 |
| [Institutions de l’Union européenne](institutions.json) | 27 | 48 | 75 |
| [Fonctionnement de l’Union européenne](fonctionnement.json) | 36 | 39 | 75 |
| [Politiques internes et externes prévues par le TFUE et le TUE](politiques.json) | 48 | 27 | 75 |
| [Relations extérieures de l’Union européenne](relations.json) | 17 | 58 | 75 |
| **Total** | **150** | **225** | **375** |

## Choix pédagogiques

Les questions reprises proviennent des annales SAEO et SAEG 2026, du sujet zéro officiel et des trois entraînements déjà présents sur le site. Elles sont référencées par leur identifiant existant et ne sont pas dupliquées dans la banque générale. Une question ne figure que dans une catégorie. Les formulations ambiguës ou tributaires d’une précision absente de l’énoncé ont été écartées de cette sélection.

Les nouvelles questions abordent les repères historiques, les compétences et la composition des institutions, les procédures de décision et de contrôle, les politiques communes et les partenariats extérieurs. Elles proposent quatre choix et une seule bonne réponse. Les corrigés donnent une explication et un lien vers un traité, une décision de justice ou une publication institutionnelle. Ce sont des corrigés pédagogiques, pas des corrigés officiels du jury.

La distinction entre les deux dernières catégories suit le sujet principal de la question : les bases juridiques et instruments de l’action extérieure relèvent des **politiques** ; les relations avec des partenaires, accords, organisations et missions concrètes relèvent des **relations extérieures**. Certains thèmes sont transversaux.

Les faits d’actualité sont datés dans les nouveaux énoncés. Pour les questions reprises, l’application affiche la date de l’épreuve ou, à défaut, celle du document PDF ; une date explicite dans l’énoncé prévaut. Les réponses attendues correspondent à ce contexte, même lorsque la situation a changé depuis. La révision de cette sélection est datée du 7 septembre 2026.

La nomenclature reprend les cinq catégories demandées, à rapprocher de la [fiche officielle de l’épreuve de questions européennes](https://www.diplomatie.gouv.fr/files/files/je-rejoins-le-ministere/concours-a/Secr%C3%A9taire%20des%20Affaires%20%C3%A9trang%C3%A8res%20(cadre%20g%C3%A9n%C3%A9ral)/saeg_ext_2_qe.pdf). Les références précises de chaque corrigé figurent dans les données et le catalogue.

## Maintenance

Modifier les cinq fichiers JSON de catégorie : `question_ids` contient uniquement les identifiants des questions reprises ; `questions` contient les nouvelles questions complètes. Pour modifier une question reprise, utiliser la banque des annales et son script de synchronisation.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-categories.ps1
powershell -ExecutionPolicy Bypass -File scripts/sync-categories.ps1 -Check
```

Le script contrôle les comptes, l’unicité des identifiants, les appartenances, les réponses attendues et la présence d’explications et de références HTTPS. Il génère `questions-europeennes.json` pour HTTP(S), `questions-europeennes.js` pour l’ouverture locale et `CATALOGUE.md`. Ces trois fichiers générés doivent être inclus dans le site. Les contrôles de structure ne remplacent pas la vérification pédagogique des réponses ou la lecture des références.

Chaque catégorie permet un tirage uniforme sans remise de 1 à 75 questions. Le dernier tirage et les réponses sont conservés séparément par catégorie. Un nouveau tirage peut contenir des questions déjà rencontrées lors d’un quiz précédent. Les 225 questions nouvelles sont également disponibles dans le quiz aléatoire général, qui compte désormais 475 QCM.
