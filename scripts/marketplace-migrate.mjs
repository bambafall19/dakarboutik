import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url)
  throw new Error(
    "DATABASE_URL est nécessaire. Exécuter uniquement sur la base choisie pour le déploiement.",
  );
const sql = neon(url);
const statements = readFileSync(
  new URL("./marketplace.sql", import.meta.url),
  "utf8",
)
  .replace(/--[^\n]*/g, "")
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s && !["BEGIN", "COMMIT"].includes(s));
await sql.transaction(statements.map((statement) => sql.query(statement, [])));
console.log(
  "Tables marketplace créées. Les données existantes sont conservées.",
);
