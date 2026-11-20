import "server-only";
import { queryOne } from "@/lib/db";
export function shopEmailConfig() {
  const to = process.env.SHOP_ALERT_EMAIL_TO?.trim();
  const from = process.env.ORDER_EMAIL_FROM?.trim();
  const key = process.env.RESEND_API_KEY;
  return to && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) && from && key
    ? { to, from, key }
    : null;
}
export async function sendShopAlert(shopId: string) {
  try {
    const row = await queryOne<{
      shop_id: string;
      profile: { name: string; category: string; city: string };
      created_at: string;
    }>(
      `with claimed as (
        update marketplace_shop_alerts set email_status='sending',attempts=attempts+1,last_attempt_at=now()
        where shop_id=$1 and (
          (email_status in ('queued','failed','unconfigured') and (last_attempt_at is null or last_attempt_at < now()-interval '1 minute'))
          or (email_status='sending' and last_attempt_at < now()-interval '5 minutes')
        ) returning shop_id,created_at
      ) select c.*,s.profile from claimed c join marketplace_shops s on s.id=c.shop_id`,
      [shopId],
    );
    if (!row) return;
    const config = shopEmailConfig();
    if (!config) {
      await queryOne(
        "update marketplace_shop_alerts set email_status='unconfigured' where shop_id=$1 and email_status='sending' returning shop_id",
        [shopId],
      );
      return;
    }
    const p = row.profile;
    const clean = (s: string) =>
      String(s)
        .replace(/[\r\n]+/g, " ")
        .slice(0, 150);
    let accepted = false;
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(7000),
        headers: {
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `new-partner-shop/${shopId}`,
        },
        body: JSON.stringify({
          from: config.from,
          to: [config.to],
          subject: `DakarBoutik — Nouvelle boutique : ${clean(p.name)}`,
          text: `Une nouvelle boutique a été soumise sur DakarBoutik.\n\nNom : ${clean(p.name)}\nCatégorie : ${clean(p.category)}\nVille : ${clean(p.city)}\n\nElle attend votre validation avant publication.\nConsulter les boutiques dans l’admin : https://dakarboutik.net/admin/boutiques#boutiques\nIdentifiant boutique : ${shopId}\n\nCet e-mail ne confirme aucun paiement.`,
        }),
      });
      accepted = response.ok;
    } catch {
      accepted = false;
    }
    await queryOne(
      "update marketplace_shop_alerts set email_status=$2,sent_at=case when $2='sent' then now() else sent_at end where shop_id=$1 and email_status='sending' returning shop_id",
      [shopId, accepted ? "sent" : "failed"],
    );
  } catch {
    console.error("Shop notification could not be processed", shopId);
  }
}
