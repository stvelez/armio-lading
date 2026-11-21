import Link from "next/link";
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
import { BrandMark } from "./PortalHeader";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function PortalFooter({ profile }: { profile: PortalProfile | null }) {
  const instagram = httpsUrl(profile?.social.instagram);
  const facebook = httpsUrl(profile?.social.facebook);
  const wa = profile
    ? whatsappHref(
        profile.contact.whatsapp,
        `Hola ${profile.name}, vengo del portal web y quiero más información.`
      )
    : null;
  const tel = profile ? telHref(profile.contact.phone) : null;
  // Mismo número en WhatsApp y teléfono: un solo canal en el pie.
  const sameChannel = profile
    ? samePhoneDigits(profile.contact.whatsapp, profile.contact.phone)
    : false;
  const waLabel = formatPhoneDisplay(profile?.contact.whatsapp) ?? profile?.contact.whatsapp;
  const telLabel = formatPhoneDisplay(profile?.contact.phone) ?? profile?.contact.phone;

  return (
    <footer className="footer">
      <div className="container">
        {profile && (
          <div className="footer-grid">
            <div>
              <Link className="brand" href={portalPath()}>
                <BrandMark profile={profile} />
                <span className="brand-name">{profile.name}</span>
              </Link>
              <p className="footer-note">
                {profile.tagline ||
                  `Propiedades en arriendo y venta${profile.city ? ` en ${profile.city}` : ""}.`}
              </p>
            </div>
            <div>
              <h2>Contacto</h2>
              <ul>
                {wa && (
                  <li>
                    <a className="footer-link" href={wa} {...external}>
                      WhatsApp {waLabel}
                    </a>
                  </li>
                )}
                {!sameChannel && profile.contact.phone && (
                  <li>
                    {tel ? (
                      <a className="footer-link" href={tel}>
                        Teléfono {telLabel}
                      </a>
                    ) : (
                      <span className="footer-link">Teléfono {telLabel}</span>
                    )}
                  </li>
                )}
                {profile.contact.email && (
                  <li>
                    <a className="footer-link" href={`mailto:${profile.contact.email}`}>
                      {profile.contact.email}
                    </a>
                  </li>
                )}
                {profile.office_address && (
                  <li>
                    <span className="footer-link">{profile.office_address}</span>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h2>Enlaces</h2>
              <ul>
                <li>
                  <Link className="footer-link" href={portalPath("/propiedades")}>
                    Inmuebles
                  </Link>
                </li>
                <li>
                  <Link className="footer-link" href={portalPath("/privacidad")}>
                    Aviso de privacidad
                  </Link>
                </li>
                <li>
                  {/* Vive en armio.co (otro origen): enlace externo, no next/link. */}
                  <a className="footer-link" href={cookiesUrl} {...external}>
                    Política de cookies
                  </a>
                </li>
                <li>
                  <a className="footer-link" href={statusUrl} {...external}>
                    Estado del servicio
                  </a>
                </li>
                {instagram && (
                  <li>
                    <a className="footer-link" href={instagram} {...external}>
                      Instagram
                    </a>
                  </li>
                )}
                {facebook && (
                  <li>
                    <a className="footer-link" href={facebook} {...external}>
                      Facebook
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
        <div className="footer-bottom">
          <span>
            {profile ? `© ${new Date().getFullYear()} ${profile.name}` : "Portal inmobiliario"}
          </span>
          {!profile && (
            <span className="made">
              <a className="footer-link" href={cookiesUrl} {...external}>
                Política de cookies
              </a>
              <a className="footer-link" href={statusUrl} {...external}>
                Estado del servicio
              </a>
            </span>
          )}
          <a className="made" href="https://armio.co" target="_blank" rel="noopener">
            Hecho con <b>Armio</b>
          </a>
        </div>
      </div>
    </footer>
  );
}
