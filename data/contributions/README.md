# Contributions et demandes de retrait par e-mail

La page [contributions.html](../../contributions.html) prépare un message que le visiteur envoie depuis sa propre messagerie. Aucune base de données ni aucun service d’envoi n’est nécessaire.

## Configurer l’adresse dédiée

L’adresse de réception configurée est **qcmqesroyon@gmail.com**. Pour la modifier, changer uniquement cette valeur dans [contributions-config.js](../../contributions-config.js) :

```js
window.ContributionsConfig = Object.freeze({
  recipientEmail: "qcmqesroyon@gmail.com"
});
```

Publier les fichiers du site après modification. Aucun mot de passe de messagerie ne doit être ajouté au dépôt. L’adresse de réception est visible aux visiteurs, avec un lien permettant également de rédiger directement un e-mail.

Tant que cette valeur est vide ou invalide, la page indique que l’adresse sera annoncée prochainement. Les visiteurs peuvent déjà préparer, copier ou télécharger leur message ; le lien vers la messagerie reste masqué.

## Parcours du visiteur

- **Proposer des questions** : entre 5 et 20 QCM distincts, avec quatre choix, une seule bonne réponse, une explication et une référence par question.
- **Demander un retrait** : sélectionner une question de la banque et rédiger un motif d’au moins 30 caractères. Le lien sur chaque QCM préremplit la question concernée.

Le nom ou le pseudonyme est obligatoire. Une adresse de réponse peut être précisée ; à défaut, vous pourrez répondre à l’adresse d’envoi du message.

Le formulaire reprend la consigne de modération des pseudonymes. Après validation des champs, **Préparer mon e-mail** affiche le message complet, l’objet et l’adresse de réception. Le visiteur doit ensuite :

1. Copier le message avec **Copier le message**, ou le sélectionner pour le copier manuellement.
2. Cliquer sur **Ouvrir ma messagerie**, ou ouvrir son webmail et créer un message à l’adresse indiquée.
3. Coller le message puis l’envoyer. Il peut aussi utiliser **Télécharger le message** et joindre le fichier `.txt` obtenu.

Le lien `mailto:` contient seulement le destinataire et l’objet. Le contenu complet reste à copier ou à joindre : cette méthode évite de tronquer les contributions longues dans les liens de messagerie. Le fichier texte inclut tous les énoncés, choix, corrigés et références, ou l’identifiant et la copie de la question signalée avec son motif.

Préparer, copier, télécharger ou ouvrir la messagerie ne signifie pas que le message a été envoyé. Le site n’affiche jamais de confirmation de réception. Si aucune application de messagerie n’est associée au navigateur, l’adresse, l’objet et le message restent disponibles pour un envoi manuel depuis un webmail.

## Examiner les demandes et créditer les personnes

Les demandes arrivent dans votre boîte dédiée. Vous pouvez les classer dans des dossiers « À examiner », « Acceptées » et « Refusées », et noter vos décisions dans votre messagerie. Les contrôles du formulaire ne dispensent pas de vérifier les messages reçus directement par e-mail.

1. Vérifier les questions, leurs sources et le nom ou pseudonyme proposé. Les pseudonymes à caractère sexuel, insultant, discriminatoire, diffamatoire, manifestement fantaisiste ou utilisés à des fins de provocation ne sont pas retenus. Si nécessaire, demander un autre nom avant publication.
2. Pour une demande de retrait, vérifier l’identifiant dans les JSON du site et examiner le motif. La copie envoyée est une aide à la vérification, pas une preuve du contenu actuel.
3. Ajouter les questions acceptées dans les JSON des [catégories](../categories/README.md). Sur chaque question retenue, ajouter uniquement le crédit public que vous avez validé :

   ```json
   "contribution": {
     "nom": "Camille M.",
     "validee": true
   }
   ```

   Le quiz affiche « Question proposée par Camille M. ». Le nom est aussi repris dans le catalogue. Le générateur des catégories refuse un crédit non validé ou contenant des propriétés supplémentaires. **Ne jamais copier une adresse e-mail, un message privé ou vos notes de modération dans les fichiers publics.**
4. Synchroniser les fichiers, vérifier les quiz et publier les changements. Les nouvelles questions destinées aux catégories ou au tirage aléatoire ont une seule bonne réponse. Les annales conservent leurs questions originales.
5. Après publication effective, répondre à la personne pour confirmer l’intégration, en utilisant l’adresse de réponse indiquée ou celle de son message. Exemple :

   > Bonjour, merci pour votre contribution. Les questions [identifiants ou titres] sont désormais disponibles sur [lien], avec le crédit « [nom validé] ». Merci de votre participation !

Aucun message reçu ni aucune décision prise dans votre messagerie ne modifie automatiquement les quiz. Le crédit ne devient public qu’après votre modification des données du site.

## Saisie et vérification

La saisie reste dans la page, sans enregistrement dans `localStorage` et sans transmission à un serveur. La page avertit avant de quitter une saisie qui n’a pas encore été copiée avec succès ou téléchargée. Toute modification après préparation invalide le message préparé pour éviter l’envoi d’une ancienne version. Un rechargement ne restaure pas la saisie.

Les messages effectivement envoyés sont conservés dans votre messagerie. Le fichier téléchargé contient aussi l’adresse de réponse si le visiteur l’a renseignée. Seul le crédit approuvé est destiné à être publié sur le site.

Servir le dépôt en HTTP local et ouvrir [scripts/check-contributions.html](../../scripts/check-contributions.html) pour vérifier les champs obligatoires, les deux types de message, la copie de secours, le téléchargement et l’absence d’envoi réseau. Ces contrôles n’ouvrent pas de messagerie et n’envoient aucun e-mail.
