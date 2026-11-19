import { z } from "zod";
export const attributionSchema = z.object({
  audience: z.enum(["partner", "support", "legacy"]).optional(),
  shopId: z.string().uuid().optional(),
});
export type Attribution = z.infer<typeof attributionSchema>;
export function contactAttribution(
  audience?: string | null,
  shopId?: string | null,
): Attribution {
  if (audience === "partner" && z.string().uuid().safeParse(shopId).success)
    return { audience: "partner", shopId: shopId! };
  if (audience === "support" || audience === "legacy") return { audience };
  return {};
}
