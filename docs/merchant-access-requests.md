# Demandes d’accès commerçants

- Connexion : « Mot de passe oublié ou premier accès ? » ouvre `/recuperer-acces` (nom boutique, téléphone WhatsApp, motif).
- Le formulaire enregistre une demande durable et prévient l’admin par e-mail avec les paramètres existants `SHOP_ALERT_EMAIL_TO`, `ORDER_EMAIL_FROM`, `RESEND_API_KEY`. Aucun lien secret ni mot de passe dans ces alertes. Sans configuration ou en cas d’échec, la demande reste dans l’admin avec son statut e-mail et une relance.
- Cloche admin : compteur et raccourci. Liste dans **Boutiques et produits → Demandes d’accès commerçants** ; actualisation toutes les 15 secondes lorsque la page est visible.
- Une demande par téléphone en attente ; limites par IP et par téléphone. Réponse publique identique même sans compte connu. Le nom déclaré n’est pas une preuve et ne sert jamais à transférer un compte.
- L’administrateur vérifie directement l’identité et le contrôle du numéro enregistré. Il ouvre la fiche correspondante, confirme la vérification puis génère le lien personnel à usage unique de 30 minutes. Il le transmet lui-même au propriétaire via WhatsApp.
- « Marquer comme traitée » classe la demande sans la supprimer et sans toucher aux accès ; ne le faire qu’après vérification/traitement. Une nouvelle demande est alors possible.
- Le commerçant connecté conserve un accès direct à **Modifier mon mot de passe** (actuel, nouveau, confirmation). La récupération est également accessible si l’actuel est oublié.
- La migration additive est incluse dans le hook de build production. Aucun produit, compte, campagne ou historique existant n’est modifié par la migration.

Vérification : `node --test scripts/merchant-access-requests.test.cjs scripts/merchant-access.test.cjs`.
