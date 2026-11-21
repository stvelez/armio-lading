import { samePhoneDigits, telHref, whatsappHref } from "../lib/format";
import Icon from "./Icon";

interface Props {
  agencyName: string;
  title: string;
  /** URL absoluta de la ficha, incluida en el mensaje de WhatsApp. */
  url: string;
  whatsapp: string | null;
  phone: string | null;
  agentName?: string;
}

export function contactLinks(p: Pick<Props, "title" | "url" | "whatsapp" | "phone">) {
  const wa = whatsappHref(p.whatsapp, `Hola, me interesa "${p.title}". ${p.url}`);
  const tel = telHref(p.phone);
  // Mismo número en WhatsApp y teléfono: se muestra una sola vez.
  return { wa, tel: samePhoneDigits(p.whatsapp, p.phone) ? null : tel };
}

/** `.detail-actions` + `.detail-note` del prototipo: WhatsApp primero, luego llamar. */
export default function ContactCard(props: Props) {
  const { wa, tel } = contactLinks(props);
  if (!wa && !tel) return null;
  return (
    <>
      <div className="detail-actions" role="group" aria-label={`Contactar a ${props.agencyName}`}>
        {wa && (
          <a className="btn btn-primary btn-lg" href={wa} target="_blank" rel="noopener noreferrer">
            <Icon name="chat" />
            Preguntar por WhatsApp
          </a>
        )}
        {tel && (
          <a className="btn btn-secondary btn-lg" href={tel}>
            <Icon name="phone" />
            Llamar
          </a>
        )}
      </div>
      {props.agentName && <p className="detail-note">Te atiende {props.agentName}.</p>}
    </>
  );
}

/** Barra fija en móvil con las dos vías de contacto rápido. */
export function MobileContactBar(props: Pick<Props, "title" | "url" | "whatsapp" | "phone">) {
  const { wa, tel } = contactLinks(props);
  if (!wa && !tel) return null;
  return (
    <div className="mobile-bar">
      {wa && (
        <a className="btn btn-primary" href={wa} target="_blank" rel="noopener noreferrer">
          <Icon name="chat" />
          WhatsApp
        </a>
      )}
      {tel && (
        <a className="btn btn-secondary" href={tel}>
          <Icon name="phone" />
          Llamar
        </a>
      )}
    </div>
  );
}
