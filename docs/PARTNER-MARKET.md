# DakarBoutik : première étape du marché de partenaires

Le catalogue officiel est retiré du site public. L'administration conserve ses produits et stocks ; les commandes passées et leur suivi restent accessibles. Les nouvelles commandes directes sont refusées côté serveur, y compris depuis un ancien panier.

L'accueil affiche les produits des partenaires, leurs boutiques et des catégories générales. La recherche est commune à ces produits, accepte les mots dans un ordre différent et ignore les accents. Elle filtre par ville, catégorie et disponibilité. Les boutiques actives sont classées par nombre de fiches publiées, sans confondre ce classement avec une note de qualité. Les publicités et boutiques sponsorisées gardent une présentation séparée.

Les anciens favoris et le catalogue redirigent vers les partenaires. Une ancienne fiche produit officielle n'est plus publiée. Le panier explique la fermeture des ventes directes et propose le suivi des anciennes commandes.

Aucun produit, stock ou historique n'est supprimé par cette mise à jour. La fermeture des ventes est déclarée dans `src/lib/catalog-mode.ts`. Aucun tarif, abonnement ou paiement commerçant n'est activé dans cette première étape.

Vérifications : `node --test scripts/partner-market.test.cjs scripts/security.test.cjs scripts/marketplace.test.cjs`, TypeScript et compilation Next.js.
