import { NextResponse } from "next/server";
import { portalUrl } from "@/portal/lib/urls";

const SLUG = /^[a-z0-9-]{1,100}$/;

/**
 * robots.txt de cada subdominio de portal (`{slug}.armio.co/robots.txt`, vía la reescritura
 * del proxy; `/p/` es interno y no se expone). Permite todo y apunta al sitemap del tenant.
 * No consulta el API: el 404 de un tenant inexistente lo da el resto del portal.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const slug = tenant.toLowerCase();
  if (!SLUG.test(slug)) {
    return new NextResponse("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  }
  const body = `User-Agent: *\nAllow: /\n\nSitemap: ${portalUrl(slug, "/sitemap.xml")}\n`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
