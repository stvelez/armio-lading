import Image from "next/image";
import Link from "next/link";
import type { PortalProfile } from "../types";
import { httpsUrl, imageProps, telHref, whatsappHref } from "../lib/format";
import { portalPath } from "../lib/urls";
import Icon from "./Icon";

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

/** Marca del tenant: logotipo si lo tiene; si no, las iniciales del prototipo. */
export function BrandMark({ profile }: { profile: PortalProfile }) {
  const logo = httpsUrl(profile.logo_url);
  if (!logo) {
    return (
      <span className="brand-mark" aria-hidden="true">
        {initials(profile.name)}
      </span>
    );
  }
  return (
    <span className="brand-mark has-logo" aria-hidden="true">
      <Image {...imageProps(logo)} alt="" width={36} height={36} />
    </span>
  );
}

export default function PortalHeader({ profile }: { profile: PortalProfile | null }) {
  const wa = profile
    ? whatsappHref(
        profile.contact.whatsapp,
        `Hola ${profile.name}, vengo del portal web y quiero más información.`
      )
    : null;
  const tel = profile ? telHref(profile.contact.phone) : null;

  return (
    <header className="site-header" id="header">
      <div className="header-inner container">
        {profile ? (
          <Link className="brand" href={portalPath()} aria-label={`${profile.name} – inicio`}>
            <BrandMark profile={profile} />
            <span className="brand-name">{profile.name}</span>
          </Link>
        ) : (
          <span className="brand">
            <span className="brand-name">Portal inmobiliario</span>
          </span>
        )}
        {profile && (
          <nav className="nav" aria-label="Principal">
            <Link className="nav-link" href={portalPath("/propiedades")}>
              Inmuebles
            </Link>
            <Link className="nav-link" href={`${portalPath()}#contacto`}>
              Contacto
            </Link>
            {wa ? (
              <a className="btn btn-primary" href={wa} target="_blank" rel="noopener noreferrer">
                <Icon name="chat" />
                WhatsApp
              </a>
            ) : tel ? (
              <a className="btn btn-primary" href={tel}>
                <Icon name="phone" />
                Llamar
              </a>
            ) : null}
          </nav>
        )}
      </div>
    </header>
  );
}
