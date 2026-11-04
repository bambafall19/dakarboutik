import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions légales | DakarBoutik',
  description: 'Identité et coordonnées de l’exploitant de DakarBoutik : M.M.D - TECHNOLOGIES.',
};

export default function LegalNoticePage() {
  return (
    <main className="container max-w-3xl py-8 md:py-12">
      <Link href="/" className="text-sm font-semibold text-primary underline underline-offset-4">Retour à l’accueil</Link>
      <section className="mt-6 rounded-2xl border bg-card p-6 text-card-foreground shadow-sm md:p-10">
        <h1 className="font-headline text-3xl font-bold">Mentions légales</h1>
        <h2 className="mt-8 text-xl font-semibold">Exploitant du site DakarBoutik</h2>
        <p className="mt-4 leading-relaxed">
          DakarBoutik est une plateforme exploitée par Mouhamadou Moustapha DIOUF,
          entrepreneur individuel exerçant sous l’enseigne <strong>M.M.D - TECHNOLOGIES</strong>.
        </p>
        <dl className="mt-6 space-y-5 break-words">
          <div><dt className="font-semibold">RCCM</dt><dd>SN.DKR.2022.A.8773</dd></div>
          <div><dt className="font-semibold">NINEA</dt><dd>008565973</dd></div>
          <div><dt className="font-semibold">Adresse professionnelle</dt><dd>Gueule Tapée, rue 63 × 50, Dakar, Sénégal</dd></div>
          <div><dt className="font-semibold">E-mail</dt><dd><a className="text-primary underline underline-offset-4" href="mailto:contact@dakarboutik.net">contact@dakarboutik.net</a></dd></div>
          <div><dt className="font-semibold">Téléphone</dt><dd><a className="text-primary underline underline-offset-4" href="tel:+221771203536">+221 77 120 35 36</a></dd></div>
        </dl>
        <nav aria-label="Informations complémentaires" className="mt-8 flex flex-wrap gap-4 border-t pt-6 text-sm font-semibold text-primary">
          <Link className="underline underline-offset-4" href="/conditions-generales">Conditions générales</Link>
          <Link className="underline underline-offset-4" href="/politique-de-confidentialite">Politique de confidentialité</Link>
        </nav>
      </section>
    </main>
  );
}
