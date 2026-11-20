# Alertes de nouvelle boutique

- Appliquer `scripts/shop-notifications.sql` avant de déployer la route de création. La migration est réexécutable et n’envoie aucun e-mail aux boutiques existantes.
- En Production, renseigner `SHOP_ALERT_EMAIL_TO` avec un seul destinataire, ainsi que `RESEND_API_KEY` et `ORDER_EMAIL_FROM` (déjà utilisés pour les commandes). Aucun secret ne doit être exposé au navigateur.
- La création de la boutique et la mise en attente de son alerte sont atomiques. Une modification de profil ne crée pas de nouvelle alerte. Le traitement e-mail utilise `after()` pour ne pas bloquer la réponse d’inscription.
- La cloche est présente dans toutes les pages admin. Le compteur et la liste des dix boutiques en attente les plus récentes sont actualisés toutes les 15 secondes lorsque la page est visible. La validation retire la boutique de cette liste sans supprimer le journal d’envoi.
- L’état « E-mail accepté par le service d’envoi » confirme l’acceptation par Resend, pas la réception dans la boîte de messagerie. Un échec ou une configuration absente conserve l’alerte et permet une relance manuelle (une minute entre les tentatives ; cinq minutes pour reprendre un envoi interrompu).
- Une clé d’idempotence stable identifie l’e-mail de chaque boutique. Aucun paiement ni publication automatique n’est déclenché.

Tests : `node --test scripts/shop-notifications.test.cjs scripts/marketplace.test.cjs scripts/merchant-billing.test.cjs`.
