import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/portal/portal.css";
import { IconSprite } from "@/portal/components/Icon";
import PortalEffects from "@/portal/components/PortalEffects";
import PortalFooter from "@/portal/components/PortalFooter";
import PortalHeader from "@/portal/components/PortalHeader";
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
import { loadProfile } from "@/portal/lib/api";
import { onColor, safeColor } from "@/portal/lib/format";
import { portalOrigin } from "@/portal/lib/urls";

const jakarta = Plus_Jakarta_Sans({
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
  const onPrimary = onColor(primary);
  // Sobre el color de marca el texto secundario del hero es el verde claro del prototipo; si la
  // marca es clara (texto oscuro encima), se atenúa el propio color del texto.
  const onHeroMuted = onPrimary === "#FFFFFF" ? "#D8ECE3" : "rgba(17, 24, 39, 0.78)";

  return (
    // data-hero="color": el API no expone imagen de portada, así que solo existe la variante color.
    <html lang="es-CO" data-hero="color">
      <body
        className={jakarta.variable}
        style={
          {
            "--portal-primary": primary,
            "--portal-on-primary": onPrimary,
            "--on-hero-muted": onHeroMuted,
          } as React.CSSProperties
        }
      >
        <IconSprite />
        <a className="skip" href="#contenido">
          Saltar al contenido
        </a>
        <PortalHeader profile={profile} />
        <main id="contenido">{children}</main>
        <PortalFooter profile={profile} />
        {/*
         * Variante informativa: en el portal no hay analítica de terceros ni cookies que consentir,
         * así que el aviso declara la marca técnica de sesión y enlaza la política, sin pedir un
         * permiso que no activaría nada. Es un componente de cliente: no afecta la estaticidad.
         */}
        <CookieConsentBanner variant="notice" />
        <PortalEffects />
      </body>
    </html>
  );
}
