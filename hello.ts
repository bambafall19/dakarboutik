import { neon } from '@neondatabase/serverless';

export default async function hello(): Promise<Response> {
  const url = process.env.DATABASE_URL;
  let productCount: number | null = null;
  let dbOk = false;
  if (url) {
    try {
      const sql = neon(url);
      const rows = await sql.query('select count(*)::int as n from products');
      productCount = rows[0]?.n ?? null;
      dbOk = true;
    } catch {
      dbOk = false;
    }
  }

  return Response.json({
    message: 'Hello from Neon Functions',
    function: 'hello',
    postgres: { connected: dbOk, products: productCount },
  });
}
