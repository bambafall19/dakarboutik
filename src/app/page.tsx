import { AdvertisingSlot } from '@/components/advertising-slot';
import Link from 'next/link';
import { ArrowUpRight, Search, Sun, Smartphone, Monitor, House, Store, Truck, Banknote, Headset } from 'lucide-react';
import { getProducts, getBanners } from '@/lib/data-firebase';
import { ProductSpotlight } from '@/components/product-spotlight';
import { publicMarketplace } from '@/lib/marketplace-server';
import { isSponsored } from '@/lib/marketplace-model';
import { ProductCard } from '@/components/product-card';
import styles from './home.module.css';

export const dynamic = 'force-dynamic';
const categories = [
  { slug: 'solaire', name: 'Solaire & énergie', detail: 'Batteries et onduleurs', icon: Sun, query: /solaire|batterie|onduleur/i },
  { slug: 'telephones', name: 'Téléphones', detail: 'Mobiles et accessoires', icon: Smartphone, query: /telephone|téléphone|smartphone|iphone/i },
  { slug: 'tech-complete', name: 'Informatique', detail: 'Électronique et équipements', icon: Monitor, query: /ordinateur|portable|laptop|informatique/i },
  { slug: 'maison-complete', name: 'Maison', detail: 'Électroménager et confort', icon: House, query: /maison|meuble|réfrigérateur|electromenager|électroménager/i },
];
export default async function HomePage() {
  const [products, market, banners] = await Promise.all([
    getProducts(),
    process.env.MARKETPLACE_ENABLED === 'true' ? publicMarketplace() : Promise.resolve({ shops: [], listings: [] }),
    getBanners(),
  ]);
  const latest = products.slice(0, 8);
  const offers = products.filter(p => p.stock > 0 && p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price).slice(0, 4);
  // Campaign dates are evaluated once for this dynamic server-rendered page.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const video = process.env.HOME_REALISATION_VIDEO_URL;
  const validVideo = video && /^https:\/\/[^\s]+\.(mp4|webm)(\?[^\s]*)?$/i.test(video);
  return <div className={styles.home}>
    <section className={styles.hero} aria-labelledby="home-title">
      <div>
        <span className={styles.eyebrow}>Le shopping, proche de vous</span>
        <h1 id="home-title">Vos envies. <span>Nos boutiques.</span></h1>
        <p>Les produits DakarBoutik et les nouveautés des commerçants près de chez vous, au même endroit.</p>
        <form action="/boutiques#recherche" className={styles.search} role="search">
          <label htmlFor="home-search" className="sr-only">Rechercher un produit ou une boutique</label>
          <input type="hidden" name="source" value="tous" />
          <Search size={20} aria-hidden="true" />
          <input id="home-search" name="q" placeholder="Batterie, téléphone, ordinateur…" type="search" maxLength={150} />
          <button type="submit" aria-label="Rechercher chez tous les vendeurs"><ArrowUpRight size={22} /></button>
        </form>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/products">Acheter chez DakarBoutik <ArrowUpRight size={18} /></Link>
          <Link className={styles.secondary} href="/boutiques">Explorer les boutiques <Store size={18} /></Link>
        </div>
      </div>
    </section>
    <section className={styles.section} aria-labelledby="categories-title">
      <div className={styles.heading}><div><span className={styles.eyebrow}>À chacun son univers</span><h2 id="categories-title">Qu’est-ce qui vous ferait plaisir ?</h2></div></div>
      <div className={styles.categories}>{categories.map(({slug,name,detail,icon: Icon,query}) => {
        const photo = slug === 'tech-complete' ? '/categorie-informatique.webp' : products.find(p => query.test(p.title + ' ' + p.category) && p.images?.[0]?.imageUrl)?.images[0].imageUrl;
        return <Link key={slug} href={'/products?category=' + slug} className={styles.category}>
          <div className={styles.categoryVisual}>{photo ? <img src={photo} alt="" loading="lazy" width={200} height={140} /> : <Icon size={48} aria-hidden="true" />}</div>
          <strong>{name} <ArrowUpRight size={17} /></strong><span>{detail}</span>
        </Link>;
      })}</div>
    </section>
    <section className={styles.reassurance} aria-label="Acheter chez DakarBoutik">
      <Link href="/contact"><Truck size={23} aria-hidden="true" /><div><strong>Livraison au Sénégal</strong><span>Frais selon votre localité. Confirmez le délai avec notre équipe.</span></div></Link>
      <Link href="/faq"><Banknote size={23} aria-hidden="true" /><div><strong>Paiement à la livraison</strong><span>En espèces au livreur. Autres modalités : contactez-nous.</span></div></Link>
      <Link href="/sav"><Headset size={23} aria-hidden="true" /><div><strong>Garantie & SAV</strong><span>Consultez les conditions applicables à votre produit.</span></div></Link>
    </section>
    <div className={styles.section}><ProductSpotlight products={products} banners={banners} /></div>
    <div className={styles.section}><AdvertisingSlot placement="home" /></div>
    {latest.length > 0 && <section className={styles.section} aria-labelledby="latest-title">
      <div className={styles.heading}><div><span className={styles.eyebrow}>La sélection officielle</span><h2 id="latest-title">Derniers arrivages DakarBoutik</h2></div><Link href="/products?sortBy=newest">Tout découvrir →</Link></div>
      <div className={styles.rail}>{latest.map(product => <div key={product.id}><ProductCard product={product} /></div>)}</div>
    </section>}
    <section className={styles.section} aria-labelledby="partners-title">
      <div className={styles.heading}><div><span className={styles.eyebrow}>Des commerces, des rencontres</span><h2 id="partners-title">Les boutiques près de vous</h2></div><Link href="/boutiques">Toutes les boutiques →</Link></div>
      {market.shops.length ? <div className={styles.shops}>{market.shops.slice(0,6).map(shop => {
        const listings = market.listings.filter(l => l.shop_id === shop.id).slice(0,3);
        return <article className={styles.shop} key={shop.id}>
          <div className={styles.shopIdentity}>{shop.profile.image ? <img src={shop.profile.image} alt="" width={56} height={56} loading="lazy" /> : <Store size={40} aria-hidden="true" />}<div><h3>{shop.profile.name}</h3><p>{shop.profile.district ? shop.profile.district + ', ' : ''}{shop.profile.city}</p></div></div>
          {isSponsored(shop,now) && <span className={styles.sponsor}>Sponsorisé</span>}
          <div className={styles.previews}>{listings.map(l => <Link href={'/boutiques/' + shop.id} key={l.id}>{l.details.image ? <img src={l.details.image} alt="" width={110} height={90} loading="lazy" /> : <div className={styles.noPhoto}>Photo à venir</div>}<strong>{l.details.title}</strong><span>{l.details.price.toLocaleString('fr-FR')} FCFA</span></Link>)}</div>
          {!listings.length && <p>Découvrez la présentation et les coordonnées de cette boutique.</p>}
          <Link className={styles.shopLink} href={'/boutiques/' + shop.id}>Voir la boutique <ArrowUpRight size={18} /></Link>
        </article>;
      })}</div> : <div className={styles.invitation}><Store size={36} /><h3>Votre boutique a sa place ici</h3><p>Présentez vos produits et leurs disponibilités aux clients.</p><Link className={styles.primary} href="/commercant">Rejoindre DakarBoutik →</Link></div>}
      <p className={styles.note}>Les produits partenaires sont proposés par chaque commerçant. Contactez la boutique pour confirmer la disponibilité et les modalités d’achat.</p>
    </section>
    <section className={`${styles.section} ${styles.merchant}`} aria-labelledby="merchant-title">
      <div><span className={styles.eyebrow}>Vous êtes commerçant ?</span><h2 id="merchant-title">Faites découvrir votre boutique</h2><p>Créez votre compte, présentez votre boutique et ajoutez vos produits. Votre boutique et vos annonces deviennent visibles après validation.</p></div>
      <Link className={styles.primary} href="/commercant">Inscrire ma boutique <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </section>
    {offers.length > 0 && <section className={styles.section} aria-labelledby="offers-title"><div className={styles.heading}><div><span className={styles.eyebrow}>Les prix qui font plaisir</span><h2 id="offers-title">Les offres du moment</h2></div><Link href="/products?on_sale=true">Voir les promotions →</Link></div><div className={styles.rail}>{offers.map(product => <div key={product.id}><ProductCard product={product} accent="sale" /></div>)}</div></section>}
    {validVideo && <section className={styles.section} aria-labelledby="video-title"><div className={styles.heading}><div><span className={styles.eyebrow}>Sur le terrain</span><h2 id="video-title">Nos réalisations en images</h2></div></div><video className={styles.video} controls preload="none" playsInline aria-label="Présentation d’une réalisation" src={video}>Votre navigateur ne peut pas lire cette vidéo.</video></section>}
  </div>;
}
