# Questions européennes — annales et sujets d’entraînement

La base [questions-europeennes-2026.json](questions-europeennes-2026.json) contient **262 questions** : 250 QCM avec leurs 959 choix, et 12 questions à réponse courte (QRC). Son nom de fichier historique est conservé ; la nature de chaque sujet est donnée par `sources[id].type`.

| Sujet | QCM | QRC | Date de l’épreuve | Document |
| --- | ---: | ---: | --- | --- |
| Secrétaire des affaires étrangères, cadre d’Orient (SAEO), session 2026 | 60 | 2 | 25 novembre 2025 | [PDF du ministère](https://www.diplomatie.gouv.fr/files/files/le-ministere/rapports-plans-et-publications/annales-et-meilleures-copies/saeo_2026-questions_europeennes_externe.pdf) |
| Secrétaire des affaires étrangères, cadre général (SAEG), session 2026 | 60 | 2 | 25 novembre 2025 | [PDF du ministère](https://www.diplomatie.gouv.fr/files/files/le-ministere/rapports-plans-et-publications/annales-et-meilleures-copies/saeg_2026-questions_europeennes_qcm-qrc_externe.pdf) |
| Entraînement 1 | 40 | 2 | Non indiquée | [PDF fourni](../qcm_qe_saeg/entrainement-1.pdf) |
| Entraînement 2 | 40 | 2 | Non indiquée | [PDF fourni](../qcm_qe_saeg/entrainement-2.pdf) |
| Sujet zéro officiel — SAEO et SAEG | 10 | 2 | Non indiquée | [PDF fourni](../qcm_qe_saeg/sujet%20v0%20officiel.pdf) |
| Entraînement 3 | 40 | 2 | 5 avril 2025 | [PDF fourni](../qcm_qe_saeg/entrainement-3.pdf) |

Les deux annales officielles portent sur l’épreuve écrite d’admissibilité n° 2, « Questions européennes » (2 heures, coefficient 3). Les sujets personnels « Entraînement 1 » et « Entraînement 2 », identifiés par `sarah-royon-saeg-3-entrainement` et `sarah-royon-saeg-concours-blanc-2-entrainement`, ne sont rattachés à aucune session de concours.

Le « Sujet zéro officiel » (V0), identifié par `meae-sujet-v0-officiel-questions-europeennes` et de type `sujet_zero`, est un sujet fictif du ministère commun aux concours externes des cadres d’Orient et général. Il présente la deuxième épreuve d’admissibilité (2 heures, coefficient 3), sans date d’épreuve ni session de concours. Le zéro est écrit en toutes lettres dans l’interface pour éviter la confusion avec la lettre O.

Le sujet « Entraînement 3 », identifié par `sarah-royon-sciences-po-entrainement`, est classé comme `creation` dans la section des sujets d’entraînement. Le fichier fourni l’attribue à Sarah Royon ; sa couverture porte la mention Sciences Po, « Galop du samedi 5 avril 2025 », « Questions européennes — MEAE SCO, SCG » et une durée de deux heures. La date du galop est conservée dans `date_epreuve`, sans lui attribuer d’année de session ni de coefficient. Les codes `SCO / SCG` reproduisent ceux de la couverture.

Les titres affichés sont « Entraînement 1 », « Entraînement 2 » et « Entraînement 3 », dans l’ordre d’ajout à la banque. Ils correspondent respectivement aux anciens « Sujet 3 », « Concours blanc 2 » et « Sciences Po ». Leurs PDF sont nommés `entrainement-1.pdf`, `entrainement-2.pdf` et `entrainement-3.pdf`. Les identifiants des sources et des questions sont conservés pour préserver les séances sauvegardées ; le contenu des PDF et leurs empreintes SHA-256 ne changent pas.

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
- `note` est une chaîne facultative qui signale une particularité de transcription ou une adaptation explicite par rapport au PDF d’origine.

Les QCM sont numérotés de 1 à 60 dans chaque annale, de 1 à 40 dans chacun des trois sujets d’entraînement et de 1 à 10 dans le sujet V0. Les QRC sont numérotées 1 et 2 dans chaque document. Les occurrences proches entre sujets restent distinctes.

## Sources et dates

Une source de type `annale` contient le concours, son code, le cadre, la voie, l’année de session, la date de l’épreuve, son intitulé et son numéro, la durée, le coefficient, l’éditeur, l’URL et l’empreinte SHA-256 du PDF. Les consignes et le mode de réponse y figurent une seule fois.

`annee_concours: 2026` désigne la session ; `date_epreuve: "2025-11-25"` désigne le jour de composition. Les questions d’actualité doivent être replacées dans ce contexte.

`page_pdf` compte toutes les pages à partir de 1, couvertures comprises. `page_imprimee` reprend le numéro visible. Pour SAEO, la page PDF 3 correspond à la page imprimée 1 ; pour SAEG, elle porte le numéro imprimé 3. Le lien vers une page se construit à partir de l’URL de la source et de `#page=N`.

Pour les QCM, `mode_reponse_qcm` vaut `une_ou_plusieurs` pour l’annale SAEO, conformément à sa consigne, `non_precise` pour l’annale SAEG et le sujet V0, et `une_seule` pour les trois sujets d’entraînement. Aucune consigne de réponse unique n’est déduite pour l’annale SAEG ou le sujet V0. Les QRC attendent du texte libre ; elles sont conservées dans la base et accessibles dans les PDF, mais ne sont pas affichées dans l’interface QCM.

Chaque sujet d’entraînement conserve son auteur, un titre court, le lien au PDF local (relatif à la racine du site), son empreinte SHA-256 et sa consigne. `date_creation_pdf` provient uniquement des métadonnées du PDF : `2025-06-26` pour l’entraînement 1 et `2025-05-08` pour l’entraînement 2. Ce n’est ni une date d’épreuve ni une année de concours. La première page de ces deux sujets ne porte pas de numéro imprimé : `page_imprimee` y est omis. Leurs autres pages portent les mêmes numéros imprimés et PDF, jusqu’à 9 pour l’entraînement 1 et 10 pour l’entraînement 2.

Le PDF de l’entraînement 3 compte dix pages. La couverture est la page PDF 1 ; les QRC, les consignes et les quatre premiers QCM sont en page PDF 2, sans numéro imprimé. Les pages PDF 3 à 10 portent les numéros imprimés 2 à 9. Aucune date de création PDF n’a été déduite de la date explicite du galop.

Le sujet V0 conserve son éditeur institutionnel, son lien local et son empreinte SHA-256. Sa date de création PDF (`2024-12-18`) provient uniquement des métadonnées. Ses trois pages ne portent pas de numéro imprimé : seul `page_pdf` est renseigné. La couverture annonce un maximum de 60 QCM pour l’épreuve ; le document fourni en contient effectivement 10.

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

**Les PDF ne fournissent aucun corrigé du jury.** Les 262 questions disposent d’un corrigé établi pour cet outil : 250 QCM avec une réponse vérifiable et 12 QRC avec des éléments de réponse. Aucune question n’est actuellement neutralisée. Chaque correction comporte ses références institutionnelles. Il s’agit de corrections établies pour l’entraînement, pas d’un corrigé officiel du concours.

Les 42 questions de l’entraînement 3 ont été corrigées le 6 septembre 2026 dans le contexte du galop du 5 avril 2025 : elles disposent désormais de 40 corrigés QCM et de 2 QRC avec des éléments de réponse et un plan possible. Les explications précisent notamment les seuils du carton jaune, les missions du Médiateur, les 24 États participant au Parquet européen, la clôture de la procédure de l’article 7 concernant la Pologne et les dérogations à la libre circulation des marchandises. Les autres précisions portent notamment sur le périmètre du CETA, les prix de 2018 de l’enveloppe NDICI et le champ d’application de la Charte. Les deux QRC s’appuient sur des éléments disponibles au 5 avril 2025, y compris les annonces douanières américaines du 2 avril. Les cinq QCM initialement neutralisés ont été adaptés comme indiqué ci-dessous.

Les 42 questions de l’entraînement 2 et les 12 questions du sujet V0 ont été corrigées le 5 septembre 2026. Les questions d’actualité sont replacées dans le contexte du printemps 2025 pour l’entraînement 2 et de la fin de 2024 pour le sujet V0, sans attribuer de date d’épreuve aux PDF. Les explications précisent les changements de période ou de périmètre : notamment le budget actualisé du FED (entraînement 2, QCM 11), les catégories de personnel de la Commission (QCM 23), les prix constants des enveloppes budgétaires et les étapes de l’adhésion à Schengen.

À la demande de l’autrice, les 12 QCM initialement neutralisés ont été adaptés le 6 septembre 2026 : QCM 4, 5, 6, 18, 20, 30 et 31 de l’entraînement 2, et QCM 16, 18, 20, 21 et 35 de l’entraînement 3. Seuls ces 12 QCM ont été modifiés lors de cette intervention ; les 250 autres entrées sont conservées à l’identique. Chaque adaptation porte sur l’énoncé ou un nombre limité de choix et est signalée dans `note`. Les PDF restent les documents d’origine ; les questions de la banque adaptées peuvent donc différer de leur page de référence. Les corrigés ont été actualisés et le champ `neutralisee` retiré de ces questions.

| Sujet | QCM | Réponse | Adaptation |
| --- | ---: | :---: | --- |
| Entraînement 2 | 4 | c | Précision de la proposition c : décision de principe non arrêtée par le collège. |
| Entraînement 2 | 5 | b | Date de référence et proposition b : seuil de 20 % après une mise aux voix récente. |
| Entraînement 2 | 6 | c | Proposition b rendue fausse ; distinction entre approbation et ratification précisée dans c. |
| Entraînement 2 | 18 | c | Proposition a limitée à tort aux seuls organismes publics. |
| Entraînement 2 | 20 | b | Proposition b : dérogation à la trajectoire de dépenses, sans exclusion comptable du déficit. |
| Entraînement 2 | 30 | b | Énoncé limité à la procédure d’approbation d’un acte adopté par le Conseil. |
| Entraînement 2 | 31 | b | Date de référence précisée ; remplacement de la Bulgarie par l’Irlande. |
| Entraînement 3 | 16 | b | Règle générale précisée ; correction du seuil et du décompte des voix dans b. |
| Entraînement 3 | 18 | b | Proposition d rendue fausse par l’attribution d’un pouvoir juridiquement contraignant. |
| Entraînement 3 | 20 | b | Date du 5 avril 2025 explicite ; remplacement de 22 par 24 États. |
| Entraînement 3 | 21 | b | Date du 5 avril 2025 explicite ; proposition b actualisée après la clôture de la procédure polonaise. |
| Entraînement 3 | 35 | b | Article 36 TFUE précisé ; remplacement de la propriété intellectuelle par un objectif protectionniste. |

Les QCM des entraînements 2 et 3 ainsi que du sujet V0 sont vérifiés automatiquement ; le bilan affiche les bonnes et mauvaises réponses sans note chiffrée, leurs PDF ne précisant pas de barème pour le QCM.

Une correction QCM renseignée doit contenir :

- `reponses` : tableau non vide des lettres correctes, par exemple `["a", "c"]`, toutes présentes dans `choix`, sauf pour une question neutralisée.
- `explication` : justification rédigée.
- `sources` : tableau non vide des références du corrigé, sous forme d’objets `{ "titre": "…", "url": "…" }`.

Pour une QRC, les corrections existantes utilisent `reponses: []`, `explication` pour les éléments de réponse rédigés et `sources` pour leurs références.

Si un futur QCM doit être neutralisé, sa correction conserve ces trois champs, avec `reponses: []`, et ajoute le champ facultatif `neutralisee: true`. Le tableau vide ne désigne pas une réponse à sélectionner. Le moteur distingue ce cas de `correction: null`, qui signifie toujours « correction indisponible ». Une QRC n’est pas neutralisée du seul fait que son tableau de réponses est vide.

Ne remplacer `null` par un objet qu’après vérification de son contenu. Un QCM peut faire l’objet d’une validation automatique seulement s’il possède des lettres correctes et n’est pas neutralisé. Pour les questions d’actualité, la vérification doit tenir compte de la date de l’épreuve ou préciser le contexte retenu lorsque celle-ci manque.

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

Les barèmes `sarah-royon-saeg-3-entrainement`, `sarah-royon-saeg-concours-blanc-2-entrainement` et `sarah-royon-sciences-po-entrainement` reprennent uniquement les points donnés dans chaque PDF d’entraînement : 5 points par QRC, soit 10 points au total. Les documents ne précisent pas le barème du QCM : `bonne_reponse`, `mauvaise_reponse`, `absence_de_reponse` et `qcm_total_points` restent à `null`. Le barème des annales officielles n’est pas appliqué à ces sujets.

Le barème `meae-sujet-v0-officiel-questions-europeennes` conserve tous ses champs à `null` : le sujet V0 ne précise aucun nombre de points, pour les QCM comme pour les QRC.

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

Actuellement, `qcmCorriges` contient 250 questions, toutes vérifiables automatiquement avec `QcmCore.hasCorrection(question)`. Aucun corrigé ne reste à `null`. Les 12 QRC et leurs éléments de réponse sont conservés dans la banque ; l’interface d’entraînement reste consacrée aux QCM.

## Transcription et migration

Extraction initiale du 5 septembre 2026 : reconnaissance de texte des PDF officiels et contrôle visuel de chaque page contenant des questions. Retours à la ligne, espaces de mise en page, apostrophes et ligatures ont été normalisés ; le gras, les couleurs et les retraits ne sont pas reproduits.

L’extraction conserve les formulations, dates, chiffres et l’ordre des choix, y compris les éventuelles coquilles. L’extraction initiale et la migration n’ont pas actualisé les énoncés. Une modification ultérieure demandée par l’autrice remplace la proposition « 705 » par « 720 » dans la question 17 de l’entraînement 1. Les 12 QCM initialement neutralisés des entraînements 2 et 3 ont ensuite été adaptés à sa demande, selon le tableau de la section Corrections. Les particularités de transcription figurent dans `note`, notamment « 15 juin 1979 » (SAEO QCM 8), « 0,5% du PNB » (SAEO QCM 22) et « à son siège » (SAEG QCM 10).

Le passage au format 2.0.0 remplace `documents` par `sources`, mutualise les barèmes, transforme les choix en objets indexés par lettre et réduit les références de chaque question à leur localisation. Les corrections absentes deviennent `null`. La langue et la méthode sont documentées ici ; les statistiques, listes de pages, noms de fichier déductibles des URL et numéros avec ponctuation ne sont plus stockés dans le JSON.

Contrôles de migration : conservation des 124 identifiants, des énoncés, des 480 choix et de leur ordre, des six notes, des numéros et pages, des métadonnées essentielles, des consignes et du barème. Les références de sources et de barèmes sont résolues et le JSON est relu après écriture.

Import de « Entraînement 1 » (PDF d’origine : « Sujet SAEG 3 ») : extraction de la couche texte du PDF avec ses tables de caractères, puis contrôle visuel des neuf pages. Les 40 QCM, leurs 146 propositions et les 2 QRC sont conservés. Les lettres A, B, C, D deviennent a, b, c, d ; les propositions présentées avec des cases sans lettre reçoivent ces identifiants dans leur ordre d’origine. Les retours à la ligne et les césures de mise en page sont supprimés, sans actualiser les formulations, les chiffres ou les choix. Les QRC précèdent le QCM dans le PDF ; leurs numéros et leur page d’origine sont conservés dans la base.

Import de « Entraînement 2 » (PDF d’origine : « SAEG — Concours blanc 2 ») : extraction de la couche texte et contrôle visuel des dix pages. Les 40 QCM, leurs 157 propositions et les 2 QRC sont conservés, avec leurs numéros et pages d’origine. Les cases sans lettre reçoivent les identifiants a à e dans leur ordre d’origine : la question 3 comporte cinq choix, les questions 19, 21, 27 et 30 en comportent trois, les autres quatre. Seuls les espaces, retours à la ligne et césures de mise en page sont normalisés. Les QRC figurent en première page avant les QCM. La consigne prévoit une seule bonne réponse par QCM ; les ambiguïtés repérées lors de la correction sont documentées ci-dessus.

Import du « Sujet V0 officiel » : transcription et contrôle visuel des trois pages du PDF. Les 10 QCM et leurs 30 propositions sont conservés dans leur ordre d’origine, avec les identifiants a, b, c pour les cases sans lettre. Les QCM 1 à 9 figurent en page PDF 2 ; le QCM 10 et les 2 QRC figurent en page PDF 3. Les espaces, retours à la ligne et apostrophes sont normalisés, sans actualiser les énoncés ni déduire de réponses des choix proposés.

Import de « Entraînement 3 » (PDF d’origine : « Sciences Po ») le 6 septembre 2026 : reconnaissance de texte et contrôle visuel des dix pages du PDF. Les 40 QCM, leurs 146 propositions et les 2 QRC sont conservés, avec leurs numéros et pages d’origine. Les cases sans lettre sont indexées a à d dans leur ordre d’apparition ; quatorze QCM ont trois choix et les vingt-six autres en ont quatre. Les retours à la ligne, césures, espaces, apostrophes et guillemets sont normalisés. Les chiffres et formulations ne sont pas actualisés. La répétition « peut (...) peut » de la question 7 est conservée et signalée dans `note`. Les 220 questions et les cinq sources déjà présentes sont conservées à l’identique lors de cet import.

