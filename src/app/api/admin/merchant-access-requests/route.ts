import { NextRequest, NextResponse, after } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { query,queryOne } from '@/lib/db';
import { shopEmailConfig } from '@/lib/shop-notifications';
import { sendRecoveryAlert } from '@/lib/merchant-recovery-alert';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET() {
  if(!(await getSession())?.isAdmin)return json({error:'Accès refusé.'},403);
  try {
    const requests=await query(`select r.id,r.phone,r.shop_name,r.reason,r.created_at,r.email_status,s.id as shop_id,s.profile->>'name' as registered_name
      from merchant_access_requests r left join lateral (
        select id,profile from marketplace_shops where '+' || (profile->>'whatsapp')=r.phone order by id limit 1
      ) s on true where r.resolved_at is null order by r.created_at desc limit 50`);
    const count=await queryOne<{count:number}>('select count(*)::int as count from merchant_access_requests where resolved_at is null');
    return json({requests,pendingCount:count?.count||0,emailConfigured:!!shopEmailConfig()});
  }catch{return json({error:'Demandes d’accès indisponibles.'},503);}
}
export async function POST(req:NextRequest) {
  if(req.headers.get('origin')!==req.nextUrl.origin)return json({error:'Origine refusée.'},403);
  const session=await getSession();if(!session?.isAdmin)return json({error:'Accès refusé.'},403);
  try {
    const raw=await req.text();if(raw.length>512)return json({error:'Requête trop longue.'},413);
    const input=z.object({id:z.string().uuid(),action:z.enum(['resolve','retry'])}).strict().safeParse(JSON.parse(raw));
    if(!input.success)return json({error:'Demande invalide.'},400);
    if(input.data.action==='resolve') {
      await queryOne('update merchant_access_requests set resolved_at=now(),resolved_by=$2 where id=$1 and resolved_at is null returning id',[input.data.id,session.uid]);
    }else {
      if(!shopEmailConfig())return json({error:'Configurez le service e-mail et le destinataire avant de relancer.'},409);
      const row=await queryOne(`select id from merchant_access_requests where id=$1 and resolved_at is null and
        ((email_status in ('queued','failed','unconfigured') and (last_attempt_at is null or last_attempt_at<now()-interval '1 minute'))
        or (email_status='sending' and last_attempt_at<now()-interval '5 minutes'))`,[input.data.id]);
      if(!row)return json({error:'Envoi déjà traité, en cours ou trop récent.'},409);
      after(()=>sendRecoveryAlert(input.data.id));
    }
    return json({ok:true});
  }catch{return json({error:'Action indisponible.'},503);}
}
