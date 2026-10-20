'use client';

import { useEffect, useState } from 'react';

type Check = { name: string; ok: boolean; detail: string };

export default function NeonServicesPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      const results: Check[] = [];

      try {
        const r = await fetch('/api/products', { cache: 'no-store' });
        const data = await r.json();
        results.push({
          name: 'Postgres (produits)',
          ok: r.ok && Array.isArray(data) && data.length > 0,
          detail: `${Array.isArray(data) ? data.length : 0} produits`,
        });
      } catch (e) {
        results.push({ name: 'Postgres (produits)', ok: false, detail: String(e) });
      }

      try {
        const r = await fetch('/api/faq', { cache: 'no-store' });
        const data = await r.json();
        results.push({
          name: 'Postgres (FAQ)',
          ok: r.ok && Array.isArray(data) && data.length > 0,
          detail: `${Array.isArray(data) ? data.length : 0} entrées`,
        });
      } catch (e) {
        results.push({ name: 'Postgres (FAQ)', ok: false, detail: String(e) });
      }

      try {
        const r = await fetch('/api/auth/neon', { cache: 'no-store' });
        const data = await r.json();
        results.push({
          name: 'Neon Auth',
          ok: r.ok && data.configured && data.reachable && data.keys > 0,
          detail: data.reachable ? `JWKS joignable, ${data.keys} clé(s)` : 'JWKS injoignable',
        });
      } catch (e) {
        results.push({ name: 'Neon Auth', ok: false, detail: String(e) });
      }

      const fnUrl = process.env.NEXT_PUBLIC_NEON_FUNCTION_HELLO_URL;
      if (fnUrl) {
        try {
          const r = await fetch(fnUrl, { cache: 'no-store' });
          const data = await r.json();
          results.push({
            name: 'Neon Functions',
            ok: r.ok && data?.postgres?.connected,
            detail: data?.postgres
              ? `Function -> Postgres : ${data.postgres.connected}, ${data.postgres.products} produits`
              : 'pas de réponse Postgres',
          });
        } catch (e) {
          results.push({ name: 'Neon Functions', ok: false, detail: String(e) });
        }
      } else {
        results.push({
          name: 'Neon Functions',
          ok: true,
          detail: 'URL publique non définie (testée côté serveur via CLI)',
        });
      }

      setChecks(results);
      setLoading(false);
    }
    run();
  }, []);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold mb-4">État des services Neon</h1>
      {loading ? (
        <p>Vérification…</p>
      ) : (
        <ul className="space-y-3">
          {checks.map((c) => (
            <li key={c.name} className="flex items-center gap-3 border rounded-lg p-4">
              <span className={c.ok ? 'text-green-600' : 'text-red-600'}>{c.ok ? 'OK' : 'ÉCHEC'}</span>
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground ml-auto">{c.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
