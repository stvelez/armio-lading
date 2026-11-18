import type { MetadataRoute } from "next";
import { siteRobots } from "@/lib/robots";

/** Producción: allow + sitemap. Preview/local: disallow total y sin sitemap. */
export default function robots(): MetadataRoute.Robots {
  return siteRobots();
}
