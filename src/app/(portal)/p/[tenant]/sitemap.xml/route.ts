import { NextResponse } from "next/server";
import { getSitemapEntries } from "@/portal/lib/api";
import { portalUrl, propertyPath } from "@/portal/lib/urls";

const xmlEscape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const SLUG = /^[a-z0-9-]{1,100}$/;

export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const notFound = () =>
    new NextResponse("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  if (!SLUG.test(tenant.toLowerCase())) return notFound();

  let result;
  try {
    result = await getSitemapEntries(tenant.toLowerCase());
  } catch {
    return new NextResponse("Service unavailable", {
      status: 503,
      headers: { "X-Robots-Tag": "noindex" },
    });
  }
  if (result.kind === "notfound") return notFound();
  if (result.kind === "redirect") {
    return NextResponse.redirect(portalUrl(result.slug, "/sitemap.xml"), 308);
  }

  const slug = tenant.toLowerCase();
  const latest = result.data.reduce<string | null>(
    (max, e) => (!max || e.updated_at > max ? e.updated_at : max),
    null
  );
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: portalUrl(slug), lastmod: latest ?? undefined },
    { loc: portalUrl(slug, "/propiedades"), lastmod: latest ?? undefined },
    { loc: portalUrl(slug, "/privacidad") },
    ...result.data.map((e) => ({
      loc: portalUrl(slug, propertyPath(e.code, e.slug)),
      lastmod: e.updated_at,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ""}</url>`
  )
  .join("\n")}
</urlset>
`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
