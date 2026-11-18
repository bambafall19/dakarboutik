# Forfaits partenaires — préparation

Tarifs acceptés : Essentiel, 10 produits pour 2 000 FCFA ; Commerce, 30 produits pour 5 000 FCFA ; Pro, 100 produits pour 10 000 FCFA. Durée : un mois civil à compter de l’activation, heure de Dakar ; pas de débit ni renouvellement automatique. Un renouvellement du même forfait prolonge sa date d’expiration. Un changement de formule attend l’expiration du forfait actif.

## Ce qui est prêt

- `/forfaits` présente les trois offres et deux options publicitaires, à la une ou bannière pendant sept jours, sur devis.
- Dans l’espace commerçant : choix du forfait, publicité facultative et demande liée au propriétaire connecté. Aucun numéro de paiement ni passerelle n’est inventé.
- Dans Commerçants et publicités : demandes, confirmation explicite du règlement, montant exact et référence. L’activation dure un mois. Une demande et une référence de règlement ne peuvent pas servir deux fois.
- Les fiches en attente ou approuvées occupent le quota. Les fiches suspendues ne l’occupent pas. Les vérifications de création et de publication sont sérialisées dans PostgreSQL pour empêcher un dépassement par requêtes simultanées.
- À expiration, la boutique et ses fiches disparaissent du catalogue public ; elles restent dans l’espace commerçant et l’admin. La modération reste indépendante du paiement.
- Les boutiques présentes avant la migration conservent leur accès existant. Toute mise en forfait payant nécessite une demande et sa validation.
- La publicité n’est jamais activée par la validation d’un forfait. Après devis et règlement séparés, utiliser la date de sponsoring de la boutique ou une campagne dans Espaces publicitaires. Les emplacements et dates doivent être validés, sans promettre de ventes ou de classement organique.

## Ouverture différée

La publication de la page d’offres se fait en mode préparation, avec `MARKETPLACE_BILLING_ENABLED=false` en Production. Aucune migration des abonnements n’est nécessaire tant que ce mode est conservé. Les tables d’abonnement restent réservées à la future ouverture payante.

`MARKETPLACE_BILLING_ENABLED` est absent ou `false` par défaut. Les offres sont alors marquées « en préparation », aucune demande ni facturation n’est ouverte et aucun quota payant n’est appliqué. Les nouvelles tables ne sont pas consultées dans ce mode. Ne pas activer cette variable avant la migration et la validation des modalités commerciales.

1. Choisir une branche de base Neon et un déploiement Preview. Appliquer `scripts/merchant-billing.sql` dans la console SQL de cette base (script complet, fonctions comprises). La migration est additive et réexécutable ; elle ne supprime ni produits ni commandes.
2. Sur ce Preview uniquement, définir `MARKETPLACE_BILLING_ENABLED=true`. Tester les deux comptes commerçants, le refus d’une demande étrangère, une activation et un renouvellement, les 10 places, une expiration, et une suspension de modération. Utiliser uniquement des références de paiement fictives sur cette base de test.
3. Confirmer les canaux de règlement réellement utilisés, les coordonnées bénéficiaires, la procédure de vérification, les conditions de remboursement et le statut des tarifs/mentions fiscales. Finaliser les conditions commerciales et leur acceptation avant encaissement. Aucun prélèvement automatique n’est intégré.
4. Après validation, appliquer la même migration à la production, puis activer la variable en Production et redéployer. Prévenir les boutiques avant toute transition de leur accès existant.
5. Pour fermer temporairement les inscriptions payantes, remettre la variable à `false` et redéployer ; cela rétablit aussi l’affichage des boutiques modérées sans tenir compte de l’abonnement. Les historiques restent conservés. Il ne s’agit donc pas d’un mode de recouvrement.

Tests : `node --test scripts/merchant-billing.test.cjs scripts/marketplace.test.cjs scripts/partner-market.test.cjs scripts/security.test.cjs` et `node node_modules/typescript/lib/tsc.js --noEmit`.

Limites : devis publicitaire et encaissement manuels, aucun reçu fiscal/PDF automatique, pas de passerelle Wave/Orange Money, pas de rappel d’expiration automatique. Les droits SQL sont ceux du compte applicatif existant, les accès HTTP sont contrôlés par session/administrateur et propriétaire.

## Correctif Next.js associé

Next.js et `eslint-config-next` sont fixés à 16.4.6 dans le manifeste et le verrou npm. Les avis GHSA-mfr8-8qww-v76h et GHSA-vc7v-qv4w-wrv8 indiquent une correction à partir de 16.4.5. Le contrôle npm ne signale plus d’avis pour Next.js après cette mise à jour. Cela ne constitue pas une correction de toutes les autres dépendances : l’audit complet conserve des alertes distinctes, notamment sur `better-auth` et `proxy-addr`, à examiner séparément avant l’ouverture des paiements.
