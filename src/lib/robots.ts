import type { Metadata, MetadataRoute } from "next";
import { isProductionDeployment } from "./deployment-env";

export const SITEMAP_URL = "https://armio.co/sitemap.xml";

/**
 * `robots.txt` del sitio: solo producción permite rastrear y anuncia el sitemap. En preview y
 * local se bloquea todo y se omite el sitemap (no hay contenido público que anunciar).
 */
export function siteRobots(indexable: boolean = isProductionDeployment()): MetadataRoute.Robots {
  return indexable
    ? { rules: { userAgent: "*", allow: "/" }, sitemap: SITEMAP_URL }
    : { rules: { userAgent: "*", disallow: "/" } };
}

/**
 * Directiva `robots` del metadata de marketing. Mismo criterio que `robots.txt`: fuera de
 * producción no se indexa nada, ni siquiera las páginas que declaren metadata propia.
 */
export function siteRobotsMetadata(
  indexable: boolean = isProductionDeployment()
): Metadata["robots"] {
  return indexable
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : { index: false, follow: false };
}
