import { NextRequest, NextResponse, after } from 'next/server';
import { z } from 'zod';
import { normalizePhone, consumePhoneLimit } from '@/lib/merchant-phone-auth';
import { queryOne } from '@/lib/db';
import { sendRecoveryAlert } from '@/lib/merchant-recovery-alert';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export async function POST(req:NextRequest) {
  if(req.headers.get('origin')!==req.nextUrl.origin)return json({error:'Origine refusée.'},403);
  try {
    if(Number(req.headers.get('content-length')||0)>1024)return json({error:'Requête trop longue.'},413);
    const raw=await req.text();if(raw.length>1024)return json({error:'Requête trop longue.'},413);
    const input=z.object({phone:z.string().max(25),shopName:z.string().trim().min(2).max(100),reason:z.enum(['forgot','first-access'])}).strict().safeParse(JSON.parse(raw));
    if(!input.success)return json({error:'Vérifiez le nom de la boutique et le téléphone.'},400);
    const phone=normalizePhone(input.data.phone);if(!phone)return json({error:'Vérifiez le téléphone : 9 chiffres au Sénégal, ou un indicatif international (+…).'},400);
    const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
    if(!await consumePhoneLimit(`recovery-request-ip:${ip}`,5,3600)||!await consumePhoneLimit(`recovery-request-phone:${phone}`,3,3600))return json({error:'Trop de demandes. Réessayez dans une heure.'},429);
    // Never disclose whether this phone owns an account or shop. Pending requests deduplicate atomically.
    const row=await queryOne<{id:string}>(`insert into merchant_access_requests(phone,shop_name,reason) values($1,$2,$3)
      on conflict(phone) where resolved_at is null do nothing returning id`,[phone,input.data.shopName,input.data.reason]);
    if(row)after(()=>sendRecoveryAlert(row.id));
    return json({ok:true});
  } catch(error) {
    return json({error:error instanceof SyntaxError?'Demande invalide.':'Demande momentanément indisponible. Réessayez plus tard.'},error instanceof SyntaxError?400:503);
  }
}
