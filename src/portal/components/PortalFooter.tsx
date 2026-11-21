import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { PortalProfile } from "../types";
import {
  formatPhoneDisplay,
  httpsUrl,
  samePhoneDigits,
  telHref,
  whatsappHref,
} from "../lib/format";
import { portalPath } from "../lib/urls";
import { cookiesUrl, statusUrl } from "@/lib/legal";

export default function PortalFooter({ profile }: { profile: PortalProfile | null }) {
  const instagram = httpsUrl(profile?.social.instagram);
  const facebook = httpsUrl(profile?.social.facebook);
  const wa = profile
    ? whatsappHref(profile.contact.whatsapp, `Hola ${profile.name}, quiero más información.`)
    : null;
  const tel = profile ? telHref(profile.contact.phone) : null;
  // Mismo número en WhatsApp y teléfono: un solo canal en el pie.
  const sameChannel = profile
    ? samePhoneDigits(profile.contact.whatsapp, profile.contact.phone)
    : false;
  const waLabel = formatPhoneDisplay(profile?.contact.whatsapp) ?? profile?.contact.whatsapp;
  const telLabel = formatPhoneDisplay(profile?.contact.phone) ?? profile?.contact.phone;

  return (
    <footer id="contacto" className="mt-16 border-t border-[var(--portal-border)] bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        {profile && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-lg font-bold text-[var(--portal-text)]">{profile.name}</p>
              {profile.tagline && (
                <p className="mt-1 text-sm text-[var(--portal-muted)]">{profile.tagline}</p>
              )}
              {(instagram || facebook) && (
                <div className="mt-4 flex gap-2">
                  {instagram && (
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="rounded-lg border border-[var(--portal-border)] p-2 hover:bg-[var(--portal-section)]"
                    >
                      <Instagram className="h-5 w-5" aria-hidden />
                    </a>
                  )}
                  {facebook && (
                    <a
                      href={facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="rounded-lg border border-[var(--portal-border)] p-2 hover:bg-[var(--portal-section)]"
                    >
                      <Facebook className="h-5 w-5" aria-hidden />
                    </a>
                  )}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-[var(--portal-muted)] uppercase">
                Contacto
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--portal-text)]">
                {wa && (
                  <li>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp {waLabel}
                    </a>
                  </li>
                )}
                {!sameChannel && profile.contact.phone && (
                  <li>
                    {tel ? (
                      <a href={tel} className="inline-flex items-center gap-2 hover:underline">
                        <Phone className="h-4 w-4" aria-hidden /> {telLabel}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4" aria-hidden /> {telLabel}
                      </span>
                    )}
                  </li>
                )}
                {profile.contact.email && (
                  <li>
                    <a
                      href={`mailto:${profile.contact.email}`}
                      className="inline-flex items-center gap-2 break-all hover:underline"
                    >
                      <Mail className="h-4 w-4 shrink-0" aria-hidden /> {profile.contact.email}
                    </a>
                  </li>
                )}
                {profile.office_address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{" "}
                    {profile.office_address}
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-[var(--portal-muted)] uppercase">
                Enlaces
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--portal-text)]">
                <li>
                  <Link href={portalPath("/propiedades")} className="hover:underline">
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link href={portalPath("/privacidad")} className="hover:underline">
                    Aviso de privacidad
                  </Link>
                </li>
                <li>
                  {/* Vive en armio.co (otro origen): enlace externo, no next/link. */}
                  <a
                    href={cookiesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Política de cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--portal-border)] pt-6 text-sm text-[var(--portal-muted)]">
          <p>{profile ? `© ${new Date().getFullYear()} ${profile.name}` : "Portal inmobiliario"}</p>
          {/* La lista «Enlaces» solo existe con perfil; aquí el enlace está siempre disponible. */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={cookiesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Política de cookies
            </a>
            <a
              href={statusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Estado del servicio
            </a>
            <a
              href="https://armio.co"
              target="_blank"
              rel="noopener"
              className="font-medium text-[var(--portal-muted)] hover:underline"
            >
              Hecho con Armio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
