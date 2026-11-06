import type { MetadataRoute } from "next";
import { getPortalIndex } from "@/portal/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketing: MetadataRoute.Sitemap = [
    {
      url: "https://armio.co",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  // Inicio de cada portal habilitado; si el API falla o no hay llave, solo marketing.
  const portals = await getPortalIndex();
  return [
    ...marketing,
    ...portals.map((p) => ({
      url: `https://armio.co/p/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
