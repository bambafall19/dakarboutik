import { NextResponse } from "next/server";
import { z } from "zod";
import { publicMarketplace } from "@/lib/marketplace-server";
import { answerMarji, MARJI_SHOP_ID } from "@/lib/marji-assistant";

export const dynamic = "force-dynamic";
const schema = z.object({ question: z.string().trim().min(1).max(300), productId: z.string().uuid().optional() }).strict();
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 2000) return json({ error: "Question trop longue." }, 400);
    input = schema.parse(JSON.parse(raw));
  } catch { return json({ error: "Écrivez une question de 1 à 300 caractères." }, 400); }
  try {
    const { shops, listings } = await publicMarketplace();
    const answer = answerMarji(shops.find(shop => shop.id === MARJI_SHOP_ID), listings, input.question, input.productId);
    return answer ? json(answer) : json({ error: "L’assistant MARJI est momentanément indisponible." }, 404);
  } catch {
    return json({ error: "Le catalogue ne répond pas. Réessayez dans un instant." }, 503);
  }
}
