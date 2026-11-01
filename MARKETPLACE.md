# DakarBoutik : boutiques physiques et annonces

## Parcours

- `/boutiques` : annuaire, recherche par produit/boutique/quartier, ville et catégorie, nouveautés.
- `/boutiques/[id]` : présentation, adresse, horaires, produits et contact WhatsApp.
- `/commercant` : inscription Neon Auth, boutique personnelle, annonces et disponibilités.
- `/admin/marketplace` : validation, suspension et dates de mise en avant sponsorisée.

Chaque compte possède une boutique. Toute modification de contenu repasse en attente et retire temporairement le contenu de la vue publique. Les disponibilités seules changent immédiatement. Les annonces d’une boutique suspendue restent invisibles. Les mises en avant expirent automatiquement ; aucun paiement publicitaire n’est encaissé par ce module.

## Déploiement

1. Utiliser d’abord une branche de base de données et un déploiement de prévisualisation avec les variables Neon existantes. Ne pas publier de données de test en production.
2. Appliquer `scripts/marketplace.sql` dans la console SQL de cette base, ou exécuter `node scripts/marketplace-migrate.mjs` avec `DATABASE_URL`/`DATABASE_URL_UNPOOLED` fourni par l’environnement. La migration crée uniquement deux nouvelles tables et leurs index.
3. Vérifier inscription, connexion, déconnexion, création de boutique et produit avec deux comptes commerçants distincts. Vérifier la validation avec le compte administrateur existant.
4. Vérifier les pages sur mobile et ordinateur et le lien WhatsApp. Confirmer au moins une véritable boutique avant le lancement public.
5. Après validation, appliquer la migration en production et déployer. Définir `MARKETPLACE_ENABLED=true` pour rediriger l’accueil vers `/boutiques`.

Les tables et commandes historiques sont conservées. Le nouveau catalogue n’intègre pas de panier : les conditions de vente se conviennent directement avec le commerçant. Désactiver `MARKETPLACE_ENABLED` rétablit l’ancien accueil ; les nouvelles pages restent accessibles tant que le nouveau code est déployé.

## Sécurité

L’identité du propriétaire provient de la session serveur, jamais du formulaire. Les mises à jour sont filtrées par propriétaire en SQL. La modération exige un administrateur. Les requêtes d’écriture contrôlent aussi l’origine.

La route historique `become-admin` ne peut plus promouvoir le premier visiteur inscrit. Une initialisation exceptionnelle exige `ADMIN_BOOTSTRAP_EMAIL` correspondant à la session et aucune présence d’un autre administrateur. Ne pas définir cette variable pour un site disposant déjà d’un administrateur.

## Validation locale

`node --test scripts/marketplace.test.cjs` exécute les routes et les requêtes réelles sur PostgreSQL embarqué (PGlite), sans accès à la production : isolation entre commerçants, modération, suspension, visibilité publique, expiration du sponsoring et disponibilités.

`npm run typecheck` vérifie TypeScript. Les tests d’authentification réelle et la vérification visuelle exigent un environnement de prévisualisation configuré avec Neon.

## Limites de cette première version

Les photos sont ajoutées par URL HTTPS ; le téléversement depuis le téléphone reste à intégrer à un stockage d’images. Les paiements publicitaires, statistiques par boutique, récupération de mot de passe dédiée et pagination ne sont pas inclus. Aucun ancien produit n’est attribué automatiquement à un commerçant.
