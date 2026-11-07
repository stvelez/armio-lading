import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import type { PortalProfile } from "../types";
import { httpsUrl, imageProps, telHref, whatsappHref } from "../lib/format";
import { portalPath } from "../lib/urls";

export default function PortalHeader({ profile }: { profile: PortalProfile | null }) {
  const logo = httpsUrl(profile?.logo_url);
  const wa = profile
    ? whatsappHref(profile.contact.whatsapp, `Hola ${profile.name}, quiero más información.`)
    : null;
  const tel = profile ? telHref(profile.contact.phone) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {profile ? (
          <Link
            href={portalPath()}
            className="flex min-w-0 items-center gap-3"
            aria-label={`${profile.name} – inicio`}
          >
            {logo && (
              <Image
                {...imageProps(logo)}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-md object-contain"
              />
            )}
            <span className="truncate text-lg font-bold text-stone-900">{profile.name}</span>
          </Link>
        ) : (
          <span className="text-lg font-bold text-stone-900">Portal inmobiliario</span>
        )}
        {profile && (
          <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
            <Link
              href={portalPath("/propiedades")}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Propiedades
            </Link>
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-portal text-on-portal hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold sm:inline-flex"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
              </a>
            ) : tel ? (
              <a
                href={tel}
                className="bg-portal text-on-portal hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold sm:inline-flex"
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
