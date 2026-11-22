import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { migrationStatements } from './sql-migration-statements.mjs';
// Preview/local builds stay read-only unless a migration is explicitly requested.
if (process.env.VERCEL_ENV !== 'production' && process.env.ADVERTISING_ORDER_MIGRATE !== '1') {
 console.log('Ordre publicitaire : migration ignorée hors production.');
} else {
 const url=process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL;
 if(!url)throw Error('Ordre publicitaire : connexion à la base absente.');
 const sql=neon(url);
 const migrations=['./advertising-order.sql','./advertising-auto-products.sql','./merchant-phone-auth.sql','./merchant-access.sql','./merchant-access-requests.sql'].flatMap(file=>migrationStatements(readFileSync(new URL(file,import.meta.url),'utf8')));
 await sql.transaction(migrations.map(migration=>sql.query(migration,[])));
 console.log('Publicités et récupération des accès commerçants prêtes. Données existantes conservées.');
}
