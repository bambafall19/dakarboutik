export function measurementAllowed() { return typeof navigator !== 'undefined' && navigator.doNotTrack !== '1' && !(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl; }
export function recordEngagement(kind:'ad_view'|'ad_click'|'whatsapp_click'|'shop_view'|'checkout_open',placement:'home'|'catalog'|'shops'|'other',campaignId?:string) {
 if(!measurementAllowed()) return;
 void fetch('/api/engagement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID(),kind,placement,...(campaignId?{campaignId}:{})}),keepalive:true}).catch(()=>{});
}
