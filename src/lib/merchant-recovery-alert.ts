import 'server-only';
import { queryOne } from '@/lib/db';
import { shopEmailConfig } from '@/lib/shop-notifications';

export async function sendRecoveryAlert(id: string) {
  try {
    const row = await queryOne<{id:string;shop_name:string;phone:string;reason:string}>(`update merchant_access_requests set email_status='sending',last_attempt_at=now()
      where id=$1 and resolved_at is null and (
        (email_status in ('queued','failed','unconfigured') and (last_attempt_at is null or last_attempt_at<now()-interval '1 minute'))
        or (email_status='sending' and last_attempt_at<now()-interval '5 minutes')) returning id,shop_name,phone,reason`,[id]);
    if (!row) return;
    const config = shopEmailConfig();
    let status = 'unconfigured';
    if (config) {
      const clean = (s:string) => s.replace(/[\r\n]/g,' ').slice(0,100);
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method:'POST',signal:AbortSignal.timeout(7000),
          headers:{Authorization:`Bearer ${config.key}`,'Content-Type':'application/json','Idempotency-Key':`merchant-recovery/${id}`},
          body:JSON.stringify({from:config.from,to:[config.to],subject:`DakarBoutik — Demande d’accès : ${clean(row.shop_name)}`,
            text:`Un commerçant demande ${row.reason === 'forgot' ? 'la réinitialisation de son mot de passe' : 'son premier accès'}.\nBoutique déclarée : ${clean(row.shop_name)}\nTéléphone déclaré : ${row.phone}\n\nCette demande ne prouve pas son identité. Vérifiez le propriétaire et le numéro enregistré avant de générer un lien personnel.\nConsultez les demandes dans l’admin : https://dakarboutik.net/admin/boutiques#demandes-acces\nAucun mot de passe n’a été changé et aucun lien d’accès n’est inclus dans cet e-mail.`})
        });
        status = res.ok ? 'sent' : 'failed';
      } catch { status='failed'; }
    }
    await queryOne("update merchant_access_requests set email_status=$2 where id=$1 and email_status='sending' returning id",[id,status]);
  } catch { console.error('Merchant recovery notification unavailable'); }
}
