import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { PortalProfile } from "../types";
import { httpsUrl, portalPath, telHref, whatsappHref } from "../lib/format";

export default function PortalFooter({
  profile,
  slug,
}: {
  profile: PortalProfile | null;
  slug: string;
}) {
  const instagram = httpsUrl(profile?.social.instagram);
  const facebook = httpsUrl(profile?.social.facebook);
  const wa = profile
    ? whatsappHref(profile.contact.whatsapp, `Hola ${profile.name}, quiero más información.`)
    : null;
  const tel = profile ? telHref(profile.contact.phone) : null;

  return (
    <footer id="contacto" className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {profile && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-lg font-bold text-stone-900">{profile.name}</p>
              {profile.tagline && <p className="mt-1 text-sm text-stone-600">{profile.tagline}</p>}
              {(instagram || facebook) && (
                <div className="mt-4 flex gap-2">
                  {instagram && (
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="rounded-lg border border-stone-300 p-2 hover:bg-stone-50"
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
                      className="rounded-lg border border-stone-300 p-2 hover:bg-stone-50"
                    >
                      <Facebook className="h-5 w-5" aria-hidden />
                    </a>
                  )}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                Contacto
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-stone-800">
                {wa && (
                  <li>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                    </a>
                  </li>
                )}
                {tel && profile.contact.phone && (
                  <li>
                    <a href={tel} className="inline-flex items-center gap-2 hover:underline">
                      <Phone className="h-4 w-4" aria-hidden /> {profile.contact.phone}
                    </a>
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
              <h2 className="text-sm font-semibold tracking-wide text-stone-500 uppercase">
                Enlaces
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-stone-800">
                <li>
                  <Link href={portalPath(slug, "/propiedades")} className="hover:underline">
                    Propiedades
                  </Link>
                </li>
                <li>
                  <Link href={portalPath(slug, "/privacidad")} className="hover:underline">
                    Aviso de privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-6 text-sm text-stone-600">
          <p>{profile ? `© ${new Date().getFullYear()} ${profile.name}` : "Portal inmobiliario"}</p>
          <a
            href="https://armio.co"
            target="_blank"
            rel="noopener"
            className="font-medium text-stone-700 hover:underline"
          >
            Hecho con Armio
          </a>
        </div>
      </div>
    </footer>
  );
}
