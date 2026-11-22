import { MetadataRoute } from "next";
import { publicMarketplace } from "@/lib/marketplace-server";
export const dynamic = "force-dynamic";
const BASE_URL = "https://dakarboutik.net";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { shops } = await publicMarketplace();
  const pages = [
    "/",
    "/boutiques",
    "/forfaits",
    "/acheter-chez-les-partenaires",
    "/a-propos",
    "/contact",
    "/faq",
    "/mentions-legales",
    "/conditions-generales",
    "/politique-de-confidentialite",
  ];
  return [
    ...pages.map((path) => ({
      url: BASE_URL + path,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.6,
    })),
    ...shops.map((shop) => ({
      url: `${BASE_URL}/boutiques/${shop.id}`,
      lastModified: new Date(shop.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
