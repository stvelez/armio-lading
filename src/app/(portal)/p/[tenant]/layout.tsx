import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/portal/portal.css";
import PortalFooter from "@/portal/components/PortalFooter";
import PortalHeader from "@/portal/components/PortalHeader";
import { loadProfile } from "@/portal/lib/api";
import { onColor, safeColor } from "@/portal/lib/format";
import { portalOrigin } from "@/portal/lib/urls";

const inter = Inter({
  variable: "--font-portal",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant } = await params;
  return {
    metadataBase: new URL(portalOrigin(tenant)),
    title: "Portal inmobiliario",
    openGraph: { type: "website", locale: "es_CO" },
  };
}

/**
 * Layout raíz del portal público. Es independiente del sitio de marketing: sin analítica de terceros ni
 * proveedores de Armio: el único conteo es el contador propio, agregado y anónimo (`VisitBeacon`,
 * ver armio-api/docs/PORTAL_ANALYTICS_PLAN.md).
 * Nunca lanza 404 por sí mismo: eso lo hace cada página (así `not-found.tsx` se muestra dentro del layout).
 */
export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const result = await loadProfile(tenant);
  const profile = result.kind === "ok" ? result.data : null;
  const primary = safeColor(profile?.primary_color);

  return (
    <html lang="es-CO">
      <body
        className={`${inter.variable} flex min-h-dvh flex-col antialiased`}
        style={
          {
            "--portal-primary": primary,
            "--portal-on-primary": onColor(primary),
          } as React.CSSProperties
        }
      >
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Saltar al contenido
        </a>
        <PortalHeader profile={profile} />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <PortalFooter profile={profile} />
      </body>
    </html>
  );
}
