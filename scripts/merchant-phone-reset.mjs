// Staff-only recovery after independently verifying the merchant via WhatsApp.
// DATABASE_URL must target the correct database. No credentials in command arguments.
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";
const { DATABASE_URL, MERCHANT_RESET_PHONE, MERCHANT_RESET_PASSWORD, MERCHANT_RECOVERY_VERIFIED } = process.env;
if (!DATABASE_URL || MERCHANT_RECOVERY_VERIFIED !== "yes" || !/^\+[1-9]\d{7,14}$/.test(MERCHANT_RESET_PHONE || "") || !MERCHANT_RESET_PASSWORD || MERCHANT_RESET_PASSWORD.length < 6 || Buffer.byteLength(MERCHANT_RESET_PASSWORD) > 72)
  throw Error("Renseigner la base, le numéro international, un nouveau mot de passe et MERCHANT_RECOVERY_VERIFIED=yes après vérification du propriétaire.");
const sql = neon(DATABASE_URL);
const passwordHash = await hash(MERCHANT_RESET_PASSWORD, 12);
const rows = await sql.query(`with changed as (
 update merchant_phone_accounts set password_hash=$1 where phone=$2 returning id
), revoked as (
 delete from merchant_phone_sessions where account_id in(select id from changed)
) select id from changed`, [passwordHash, MERCHANT_RESET_PHONE]);
if (rows.length !== 1) throw Error("Aucun compte téléphone correspondant. Aucun compte e-mail n’a été modifié.");
console.log("Mot de passe remplacé et anciennes sessions révoquées. Aucun secret n’est affiché.");
