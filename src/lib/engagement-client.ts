const internalTestKey = 'dakarboutik.internal-test';

export function internalTestEnabled() {
  try {
    return typeof window !== 'undefined' && window.sessionStorage.getItem(internalTestKey) === '1';
  } catch {
    return false;
  }
}

export function setInternalTestEnabled(enabled: boolean) {
  if (enabled) window.sessionStorage.setItem(internalTestKey, '1');
  else window.sessionStorage.removeItem(internalTestKey);
}

export function measurementAllowed() { return typeof navigator !== 'undefined' && navigator.doNotTrack !== '1' && !(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl; }
export function recordEngagement(kind:'ad_view'|'ad_click'|'whatsapp_click'|'shop_view'|'checkout_open',placement:'home'|'catalog'|'shops'|'other',campaignId?:string) {
 if (kind === 'checkout_open' && internalTestEnabled()) return;
 if(!measurementAllowed()) return;
 void fetch('/api/engagement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID(),kind,placement,...(campaignId?{campaignId}:{})}),keepalive:true}).catch(()=>{});
}
