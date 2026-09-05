# Questions européennes — annales et sujets d’entraînement

La base [questions-europeennes-2026.json](questions-europeennes-2026.json) contient **166 questions** : 160 QCM avec leurs 626 choix, et 6 questions à réponse courte (QRC). Son nom de fichier historique est conservé ; la nature de chaque sujet est donnée par `sources[id].type`.

| Sujet | QCM | QRC | Date de l’épreuve | Document |
| --- | ---: | ---: | --- | --- |
| Secrétaire des affaires étrangères, cadre d’Orient (SAEO), session 2026 | 60 | 2 | 25 novembre 2025 | [PDF du ministère](https://www.diplomatie.gouv.fr/files/files/le-ministere/rapports-plans-et-publications/annales-et-meilleures-copies/saeo_2026-questions_europeennes_externe.pdf) |
| Secrétaire des affaires étrangères, cadre général (SAEG), session 2026 | 60 | 2 | 25 novembre 2025 | [PDF du ministère](https://www.diplomatie.gouv.fr/files/files/le-ministere/rapports-plans-et-publications/annales-et-meilleures-copies/saeg_2026-questions_europeennes_qcm-qrc_externe.pdf) |
| Sujet SAEG 3 — entraînement personnel de Sarah Royon | 40 | 2 | Non indiquée | [PDF fourni](../qcm_qe_saeg/SUJET%20-%20SAEG%203.pdf) |

Les deux annales officielles portent sur l’épreuve écrite d’admissibilité n° 2, « Questions européennes » (2 heures, coefficient 3). Le « Sujet SAEG 3 » est une création personnelle, identifiée par `sarah-royon-saeg-3-entrainement`, et n’est rattaché à aucune session de concours.

## Format 2.0.0

Le fichier est en UTF-8 sans BOM, avec une indentation de deux espaces. Il contient `version_format` et trois blocs :

| Bloc | Rôle |
| --- | --- |
| `sources` | Dictionnaire des annales ou autres origines, indexé par leur identifiant. Chaque source contient ses métadonnées et la référence à son barème. |
| `baremes` | Dictionnaire des règles de notation, indexé par identifiant. Les deux annales utilisent `questions-europeennes-2026`. |
| `questions` | Tableau des questions, de leurs choix et de leur localisation dans une source. |

Le français est la langue de cette base. Les nombres de questions et de choix se calculent à partir du tableau ; ils ne sont pas dupliqués dans le JSON.

Le fichier voisin `questions-europeennes-2026.js` est généré à partir du JSON pour permettre l’ouverture directe de la page HTML, sans serveur. Il ne doit pas être modifié à la main. Après chaque modification du JSON, lancer `powershell -ExecutionPolicy Bypass -File scripts/sync-annales.ps1` depuis la racine du site ; l’option `-Check` permet de vérifier la synchronisation. Le site servi en HTTP(S) continue à lire le JSON directement.

## Questions

Exemple réel :

```json
{
  "id": "saeo-2026-externe-questions-europeennes-qcm-001",
  "type": "qcm",
  "enonce": "Quel traité, signé le 18 avril 1951, a établi la Communauté européenne du charbon et de l’acier (CECA) ?",
  "choix": {
    "a": "Le traité de Rome",
    "b": "Le traité de Bruxelles",
    "c": "Le traité de Paris",
    "d": "Le traité de Luxembourg"
  },
  "correction": {
    "reponses": [
      "c"
    ],
    "explication": "Le traité de Paris, signé le 18 avril 1951, institue la Communauté européenne du charbon et de l’acier (CECA). Il entre en vigueur le 23 juillet 1952.",
    "sources": [
      {
        "titre": "Parlement européen — Traité de Paris",
        "url": "https://www.europarl.europa.eu/about-parliament/fr/in-the-past/the-parliament-and-the-treaties/treaty-of-paris"
      }
    ]
  },
  "source": {
    "id": "saeo-2026-externe-questions-europeennes",
    "numero": 1,
    "page_pdf": 3,
    "page_imprimee": 1
  }
}
```

- `id` est unique et stable ; les identifiants du format précédent sont conservés.
- `type` vaut `qcm` ou `qrc`.
- `enonce` contient le texte sans son numéro.
- `choix` associe chaque lettre au texte correspondant. Les lettres sont des identifiants stables ; une application peut afficher les entrées dans l’ordre alphabétique des lettres. Pour une QRC, `choix` vaut `{}`.
- `correction` vaut `null` tant que le corrigé n’est pas vérifié.
- `source.id` référence une entrée de `sources`. Les autres champs indiquent le numéro dans la partie QCM ou QRC et les pages.
- `note` est une chaîne facultative, présente uniquement lorsqu’une particularité de transcription doit être conservée.

Les QCM sont numérotés de 1 à 60 dans chaque annale, et de 1 à 40 dans le sujet personnel. Les QRC sont numérotées 1 et 2 dans chaque document. Les occurrences proches entre sujets restent distinctes.

## Sources et dates

Une source de type `annale` contient le concours, son code, le cadre, la voie, l’année de session, la date de l’épreuve, son intitulé et son numéro, la durée, le coefficient, l’éditeur, l’URL et l’empreinte SHA-256 du PDF. Les consignes et le mode de réponse y figurent une seule fois.

`annee_concours: 2026` désigne la session ; `date_epreuve: "2025-11-25"` désigne le jour de composition. Les questions d’actualité doivent être replacées dans ce contexte.

`page_pdf` compte toutes les pages à partir de 1, couvertures comprises. `page_imprimee` reprend le numéro visible. Pour SAEO, la page PDF 3 correspond à la page imprimée 1 ; pour SAEG, elle porte le numéro imprimé 3. Le lien vers une page se construit à partir de l’URL de la source et de `#page=N`.

Pour les QCM, `mode_reponse_qcm` vaut `une_ou_plusieurs` pour l’annale SAEO, conformément à sa consigne, `non_precise` pour l’annale SAEG et `une_seule` pour le sujet personnel SAEG 3. Aucune consigne de réponse unique n’est déduite pour l’annale SAEG. Les QRC attendent du texte libre.

Le sujet personnel conserve son auteur, le titre du fichier fourni, le lien au PDF local (relatif à la racine du site), son empreinte SHA-256 et sa consigne. `date_creation_pdf: "2025-06-26"` provient uniquement des métadonnées du PDF ; ce n’est ni une date d’épreuve ni une année de concours. Sa première page ne porte pas de numéro imprimé : `page_imprimee` est omis pour cette page. Les pages PDF 2 à 9 portent les mêmes numéros imprimés.

## Ajouter des questions personnelles

Ajouter une source avec un identifiant inédit. Par exemple, pour un lot créé par Sarah Royon utilisant le même barème d’entraînement :

```json
{
  "type": "creation",
  "titre": "Questions européennes — questions personnelles",
  "auteur": "Sarah Royon",
  "bareme": "questions-europeennes-2026",
  "mode_reponse_qcm": "une_ou_plusieurs"
}
```

Chaque nouvelle question doit avoir un identifiant unique et référencer cette source. Les champs `numero`, `page_pdf` et `page_imprimee` peuvent être omis lorsqu’ils ne s’appliquent pas. Le barème référencé est celui choisi pour l’entraînement, sans attribuer ces questions à un concours passé.

## Corrections

**Les PDF ne fournissent aucun corrigé du jury.** Les questions SAEO QCM 1 à 10 ont été corrigées pour cet outil le 5 septembre 2026, après vérification auprès de sources institutionnelles et de documents primaires. Chaque correction contient les lettres correctes, une explication et ses références. Il s’agit de corrections établies pour l’entraînement, pas d’un corrigé officiel du concours.

Les 156 autres entrées, dont les 42 questions du sujet personnel, conservent `correction: null`. Cette valeur signifie « correction indisponible », et non « aucun choix correct ». Le PDF « Sujet SAEG 3 » ne fournit aucun corrigé ; aucune réponse n’est déduite de la mise en forme.

Une correction QCM renseignée doit contenir :

- `reponses` : tableau non vide des lettres correctes, par exemple `["a", "c"]`, toutes présentes dans `choix`.
- `explication` : justification rédigée.
- `sources` : tableau non vide des références du corrigé, sous forme d’objets `{ "titre": "…", "url": "…" }`.

Pour une QRC, utiliser `reponse` pour la réponse rédigée et `sources` pour ses références. Cette convention servira aux futures corrections rédigées ; aucune QRC n’est actuellement corrigée.

Ne remplacer `null` par un objet qu’après vérification de son contenu. Ainsi, un QCM est utilisable dans une séance corrigée seulement si sa correction est renseignée. Pour les questions d’actualité, la vérification doit tenir compte de la date de l’épreuve.

## Barème

Les valeurs sont exprimées en points :

```json
{
  "bonne_reponse": 0.2,
  "mauvaise_reponse": -0.1,
  "absence_de_reponse": -0.05,
  "qcm_total_points": 12,
  "qrc_total_points": 8,
  "qrc_points_par_question": 4,
  "selection_partielle": null
}
```

`selection_partielle: null` indique que les sujets ne détaillent pas le calcul lorsqu’une sélection de plusieurs réponses n’est que partiellement correcte. Ce cas doit être précisé avant l’implémentation de la notation automatique ; `null` ne vaut pas zéro.

Les totaux 12 et 8 correspondent à l’épreuve complète d’origine. Le nombre N de questions, les réponses de l’étudiant et son score appartiendront à la séance d’entraînement, pas à la banque de questions.

Le barème `sarah-royon-saeg-3-entrainement` reprend uniquement les points donnés dans le PDF personnel : 5 points par QRC, soit 10 points au total. Le document ne précise pas le barème du QCM : `bonne_reponse`, `mauvaise_reponse`, `absence_de_reponse` et `qcm_total_points` restent à `null`. Le barème des annales officielles n’est pas appliqué à ce sujet.

## Utilisation

```js
const response = await fetch("/data/annales/questions-europeennes-2026.json");
if (!response.ok) throw new Error("Impossible de charger les annales");
const base = await response.json();

const qcm = base.questions.filter(question => question.type === "qcm");
const qcmOrient = qcm.filter(
  question => base.sources[question.source.id].code_concours === "SAEO"
);
const qcmCorriges = qcm.filter(question => question.correction !== null);

const question = qcm[0];
const source = base.sources[question.source.id];
const bareme = base.baremes[source.bareme];
const choix = Object.entries(question.choix).sort(([a], [b]) => a.localeCompare(b));
const lienPage = question.source.page_pdf === undefined
  ? source.url
  : source.url + "#page=" + question.source.page_pdf;
```

Actuellement, `qcmCorriges` contient les 10 premières questions SAEO. Le futur tirage devra respecter le nombre de questions corrigées disponibles.

## Transcription et migration

Extraction initiale du 5 septembre 2026 : reconnaissance de texte des PDF officiels et contrôle visuel de chaque page contenant des questions. Retours à la ligne, espaces de mise en page, apostrophes et ligatures ont été normalisés ; le gras, les couleurs et les retraits ne sont pas reproduits.

Les formulations, dates, chiffres et l’ordre des choix sont conservés, y compris les éventuelles coquilles. L’extraction initiale et la migration n’ont pas actualisé les énoncés. La vérification effectuée pour les dix premiers corrigés est présentée dans la section « Corrections » ; les énoncés d’origine restent conservés. Les six notes particulières figurent dans `note`, notamment « 15 juin 1979 » (SAEO QCM 8), « 0,5% du PNB » (SAEO QCM 22) et « à son siège » (SAEG QCM 10).

Le passage au format 2.0.0 remplace `documents` par `sources`, mutualise les barèmes, transforme les choix en objets indexés par lettre et réduit les références de chaque question à leur localisation. Les corrections absentes deviennent `null`. La langue et la méthode sont documentées ici ; les statistiques, listes de pages, noms de fichier déductibles des URL et numéros avec ponctuation ne sont plus stockés dans le JSON.

Contrôles de migration : conservation des 124 identifiants, des énoncés, des 480 choix et de leur ordre, des six notes, des numéros et pages, des métadonnées essentielles, des consignes et du barème. Les références de sources et de barèmes sont résolues et le JSON est relu après écriture.

Import de « Sujet SAEG 3 » : extraction de la couche texte du PDF avec ses tables de caractères, puis contrôle visuel des neuf pages. Les 40 QCM, leurs 146 propositions et les 2 QRC sont conservés. Les lettres A, B, C, D deviennent a, b, c, d ; les propositions présentées avec des cases sans lettre reçoivent ces identifiants dans leur ordre d’origine. Les retours à la ligne et les césures de mise en page sont supprimés, sans actualiser les formulations, les chiffres ou les choix. Les QRC précèdent le QCM dans le PDF ; leurs numéros et leur page d’origine sont conservés dans la base.

