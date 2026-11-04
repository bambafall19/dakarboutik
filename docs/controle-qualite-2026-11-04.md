# Contrôles du 4 novembre 2026

## Corrections préparées

- Catalogue mobile : bannière d'introduction masquée sur petits écrans, catégories défilables et en-tête des résultats raccourci. Carrousel public compact, introduction des boutiques réduite.
- Image de catégorie : photo d'un produit de la sélection, avec fond de secours en cas d'échec de chargement.
- Page /suivi : saisie du numéro, validation de format, aide dédiée ; suppression de la redirection vers Contact.
- Commandes : validation des données, quantités entières positives et cumul des doublons comparé au stock, prix recalculés depuis la base. Numéro UUID côté serveur. Enregistrement de la commande et de son suivi dans une instruction SQL atomique.
- Formulaires publics : contrôle d'origine, limites persistantes, taille des corps bornée, erreurs contrôlées. Table merchant_auth_limits déjà présente.
- Médias administrateur : refus SVG, décodage réel, taille/pixels limités, réencodage WebP sans métadonnées ; CSP restrictive sur les anciens médias.
- FAQ : rendu texte échappé au lieu du HTML brut. Les anciens textes HTML peuvent nécessiter un nettoyage éditorial.
- Build : erreurs TypeScript à nouveau bloquantes.

## Validation

TypeScript sans erreur. ESLint des composants modifiés : aucune erreur, avertissements préexistants sur useEffect/useForm et imports. Tests marketplace et sécurité : 14 tests réussis, dont une exécution réelle de l'instruction de création de commande dans PostgreSQL embarqué PGlite.
Pas de commande commerciale créée en production. Vérification visuelle et build Vercel à terminer après publication de la branche.

## Sauvegarde et restauration

Projet Neon dakarboutik, branche main, endpoint ep-bold-smoke-ar0nuyiv. Historique disponible : six heures. Snapshot manuel créé le 4 novembre 2026 à 11:44:39 UTC, sans expiration affichée. Restauration multi-step effectuée dans br-tiny-resonance-arvxaddc ; main inchangée.
Lecture sur la copie restaurée : 25 produits, 2 boutiques, 3 annonces, 0 commande. Ce test vérifie la restauration des tables interrogées, pas tous les objets ni les fichiers externes Vercel Blob.
Les tables media et contact_messages manquaient ; migration additive scripts/security-support-tables.sql testée sur la copie puis appliquée sur main. RLS activée sur ces deux nouvelles tables.
Neon demande une mise à niveau pour programmer les snapshots. Aucun abonnement souscrit et aucune sauvegarde automatique nouvellement activée. La branche restaurée est conservée pour inspection.

## Limites et suite nécessaire

- Analyse des dépendances via le registre npm : plusieurs avis de sécurité, dont des transitifs. Le résultat brut est conservé localement dans dependency-audit.json. Un avis ne démontre pas que son chemin vulnérable est accessible dans cette application. Mise à jour et tests de compatibilité requis avant de clore ce chantier.
- Les tables des comptes/sessions téléphoniques ont RLS ; aucune permission directe trouvée pour les rôles anonymous/authenticated/anon dans la requête de contrôle sur la copie. Les droits hérités, PUBLIC, le rôle de connexion et la Data API demandent encore une revue complète.
- Le stock est contrôlé au moment du calcul, sans réservation atomique : des commandes simultanées peuvent dépasser le stock disponible. Décider du moment de réservation et du traitement des annulations avant modification métier.
- Les anciens numéros de commande restent compatibles ; ils ne bénéficient pas de l'entropie UUID des nouvelles commandes. Ne jamais placer de donnée personnelle dans les notes publiques du suivi.
- Le mot de passe commerçant conserve le minimum de six caractères demandé par le propriétaire. La vérification de possession du téléphone, la MFA administrateur et la limitation des consultations publiques restent à renforcer.
- Journal d'administration, historique des produits, alertes et sauvegarde indépendante des fichiers Blob non implémentés dans ce lot.

## Restauration en cas d'incident

Dans Neon, ouvrir main > Backup & Restore > snapshot > Restore > Multi-step restore. Contrôler les compteurs et les données utiles sur la nouvelle branche avant toute bascule. Ne pas utiliser One-step restore sur main pour un simple exercice. Pour le code, redéployer la précédente version Vercel stable. Une restauration du code seule ne restaure ni la base ni les fichiers externes.
