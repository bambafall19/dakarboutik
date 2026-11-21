import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
// Preview/local builds stay read-only unless a migration is explicitly requested.
if (process.env.VERCEL_ENV !== 'production' && process.env.ADVERTISING_ORDER_MIGRATE !== '1') {
 console.log('Ordre publicitaire : migration ignorée hors production.');
} else {
 const url=process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL;
 if(!url)throw Error('Ordre publicitaire : connexion à la base absente.');
 const sql=neon(url);
 const migration=readFileSync(new URL('./advertising-order.sql',import.meta.url),'utf8').replace(/^BEGIN;\s*$/m,'').replace(/^COMMIT;\s*$/m,'');
 await sql.transaction([sql.query(migration,[])]);
 console.log('Ordre publicitaire prêt. Dates, activations et statistiques conservées.');
}
