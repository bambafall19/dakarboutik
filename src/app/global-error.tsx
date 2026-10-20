'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#FAF8F4',
          color: '#0F2A22',
          padding: '2rem',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1.5rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(220,38,38,0.1)',
              color: '#DC2626',
              fontSize: '32px',
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.75rem' }}>
            Une erreur critique est survenue
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#5B6B64', margin: '0 0 2rem' }}>
            L&apos;application a rencontré un problème inattendu. Merci de recharger la page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: '#0B6E4F',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.75rem 1.75rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Recharger la page
          </button>
        </div>
      </body>
    </html>
  );
}
