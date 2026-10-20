import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local');
}

export const sql = neon(connectionString);

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  return (await sql.query(text, params)) as T[];
}

export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
