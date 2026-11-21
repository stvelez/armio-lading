import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import type { PortalProfile } from "../types";
import { httpsUrl, imageProps, telHref, whatsappHref } from "../lib/format";
import { portalPath } from "../lib/urls";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

export default function PortalHeader({ profile }: { profile: PortalProfile | null }) {
  const logo = httpsUrl(profile?.logo_url);
  const wa = profile
    ? whatsappHref(profile.contact.whatsapp, `Hola ${profile.name}, quiero más información.`)
    : null;
  const tel = profile ? telHref(profile.contact.phone) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--portal-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6">
        {profile ? (
          <Link
            href={portalPath()}
            className="flex min-w-0 items-center gap-3"
            aria-label={`${profile.name} – inicio`}
          >
            {logo ? (
              <Image
                {...imageProps(logo)}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-lg object-contain"
              />
            ) : (
              <span
                aria-hidden="true"
                className="bg-portal text-on-portal grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold"
              >
                {initials(profile.name)}
              </span>
            )}
            <span className="truncate text-lg font-bold tracking-tight text-[var(--portal-text)]">
              {profile.name}
            </span>
          </Link>
        ) : (
          <span className="text-lg font-bold text-[var(--portal-text)]">Portal inmobiliario</span>
        )}
        {profile && (
          <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
            <Link
              href={portalPath("/propiedades")}
              className="inline-flex rounded-lg px-2 py-2 text-sm font-medium text-[var(--portal-muted)] hover:bg-[var(--portal-section)] hover:text-[var(--portal-text)] sm:px-3"
            >
              Inmuebles
            </Link>
            <Link
              href={`${portalPath()}#contacto-home`}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--portal-muted)] hover:bg-[var(--portal-section)] hover:text-[var(--portal-text)] sm:inline-flex"
            >
              Contacto
            </Link>
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-portal text-on-portal inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
              </a>
            ) : tel ? (
              <a
                href={tel}
                className="bg-portal text-on-portal inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
              >
                <Phone className="h-4 w-4" aria-hidden /> Llamar
              </a>
            ) : null}
          </nav>
        )}
      </div>
    </header>
  );
}
