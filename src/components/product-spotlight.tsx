'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import type { Banner, Product } from '@/lib/types';
export function ProductSpotlight({ products, banners }: { products: Product[]; banners: Banner[] }) {
  const available = products.filter(p => p.stock > 0 && p.images?.[0]?.imageUrl);
  const configured = banners.filter(b => b.isActive && b.position === 'hero').sort((a,b) => a.order-b.order)
    .flatMap(b => { const p = available.find(p => b.linkUrl === '/products/' + p.slug || b.linkUrl === 'https://dakarboutik.net/products/' + p.slug); return p ? [{product:p, subtitle:b.subtitle}] : []; });
  const defaults = ['batterie-lithium-50-kwh','iphone-16-pro-max','routeur-wifi-intelligent-tenda-wifi-6-ax3000'];
  const slides = (configured.length ? configured : defaults.flatMap(slug => {const p=available.find(p=>p.slug===slug);return p ? [{product:p,subtitle:undefined}] : [];})).slice(0,6);
  const [ref, api] = useEmblaCarousel({loop:true});
  const [selected,setSelected] = useState(0);
  const [paused,setPaused] = useState(false);
  const hovered = useRef(false);
  const focused = useRef(false);
  useEffect(() => {
    if (!api) return;
    const select = () => setSelected(api.selectedScrollSnap());
    api.on('select',select);
    const stop = () => setPaused(true);
    api.on('pointerDown',stop);
    return () => {api.off('select',select);api.off('pointerDown',stop);};
  },[api]);
  useEffect(() => {
    if (!api || paused || slides.length < 2) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer = window.setInterval(() => {
      if (!reduced.matches && !document.hidden && !hovered.current && !focused.current) api.scrollNext();
    },6000);
    return () => window.clearInterval(timer);
  },[api,paused,slides.length]);
  if (!slides.length) return null;
  const go = (index:number) => {setPaused(true);api?.scrollTo(index);};
  return <section className="spotlight" aria-label="Produits à la une" aria-roledescription="carrousel" onMouseEnter={()=>{hovered.current=true;}} onMouseLeave={()=>{hovered.current=false;}} onFocusCapture={()=>{focused.current=true;}} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget)) focused.current=false;}}>
    <div className="window" ref={ref}><div className="track">{slides.map(({product:p,subtitle},i)=><div className={'slide tone'+i%3} key={p.id+'-'+i} role="group" aria-roledescription="diapositive" aria-label={(i+1)+' sur '+slides.length} aria-hidden={i!==selected}>
      <div className="copy"><span className="badge">LA SÉLECTION DAKARBOUTIK</span><h2>{p.title}</h2><p>{subtitle || 'À découvrir dans notre boutique officielle.'}</p><strong className="price">{(p.salePrice && p.salePrice>0 && p.salePrice<p.price ? p.salePrice:p.price).toLocaleString('fr-FR')} <small>FCFA</small></strong><Link tabIndex={i===selected?0:-1} href={'/products/'+p.slug}>Découvrir le produit <ArrowRight size={18}/></Link></div>
      <div className="visual"><img src={p.images[0].imageUrl} alt={p.title} width={500} height={360} loading={i===0?'eager':'lazy'} onError={e=>{e.currentTarget.style.visibility='hidden';}}/></div>
    </div>)}</div></div>
    {slides.length>1 && <div className="controls"><button aria-label="Produit précédent" onClick={()=>{setPaused(true);api?.scrollPrev();}}><ArrowLeft size={20}/></button><div className="dots">{slides.map(({product:p},i)=><button key={i} aria-label={'Afficher '+p.title} aria-pressed={selected===i} onClick={()=>go(i)}><span/></button>)}</div><button aria-label="Produit suivant" onClick={()=>{setPaused(true);api?.scrollNext();}}><ArrowRight size={20}/></button><button aria-label={paused?'Reprendre le défilement':'Mettre le défilement en pause'} onClick={()=>setPaused(!paused)}>{paused?<Play size={18}/>:<Pause size={18}/>}</button></div>}
    <style jsx>{`.spotlight{width:min(1200px,calc(100% - 2rem));margin:0 auto 1.5rem;border:1px solid #dce9df;border-radius:26px;overflow:hidden;background:#f0f8f3;color:#142b24}.window{overflow:hidden}.track{display:flex;touch-action:pan-y pinch-zoom}.slide{flex:0 0 100%;min-width:0;display:grid;grid-template-columns:1fr 1fr;gap:2rem;padding:2.5rem;align-items:center;background:linear-gradient(120deg,#e4f6eb,#fff9d7)}.tone1{background:linear-gradient(120deg,#f3f5ff,#fcefe3)}.tone2{background:linear-gradient(120deg,#e4f5fa,#eef9ed)}.badge{font-size:.7rem;font-weight:800;letter-spacing:.14em;color:#176347}.copy h2{font-size:clamp(1.6rem,3vw,2.6rem);font-weight:800;line-height:1.15;margin:1rem 0;overflow-wrap:anywhere}.copy p{color:#53685b;line-height:1.6;font-size:.9rem}.price{display:block;font-size:1.8rem;color:#076944;margin:1.2rem 0}.price small{font-size:.85rem}.copy :global(a){display:inline-flex;align-items:center;gap:.7rem;background:#08754d;color:white;border-radius:12px;padding:.9rem 1.2rem;font-size:.9rem;font-weight:700}.visual{height:300px;background:#ffffffbd;border-radius:22px;padding:1rem;display:grid;place-items:center}.visual img{width:100%;height:268px;object-fit:contain;min-width:0}.controls{display:flex;align-items:center;justify-content:center;gap:.5rem;background:white;padding:.4rem}.controls button{width:44px;height:44px;display:grid;place-items:center;border-radius:50%;color:#126b48}.controls button:hover{background:#edf7ee}.dots{display:flex}.dots span{width:8px;height:8px;border-radius:50%;background:#afc4b6}.dots [aria-pressed=true] span{width:22px;border-radius:6px;background:#08754d}.controls button:focus-visible,.copy :global(a:focus-visible){outline:3px solid #d29b00;outline-offset:2px}@media(max-width:600px){.spotlight{margin-bottom:.75rem;border-radius:18px}.slide{grid-template-columns:minmax(0,1fr) 100px;gap:.75rem;padding:1rem}.copy h2{font-size:1.05rem;margin:.4rem 0}.copy p{display:none}.price{font-size:1.15rem;margin:.5rem 0}.visual{height:120px;padding:.4rem;border-radius:12px}.visual img{height:105px}.copy :global(a){font-size:.75rem;padding:.65rem .75rem}.badge{font-size:.55rem;letter-spacing:.06em}.controls{gap:0;padding:0}}`}</style>
  </section>;
}
