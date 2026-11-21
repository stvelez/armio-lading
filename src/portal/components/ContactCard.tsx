import { MessageCircle, Phone } from "lucide-react";
import { samePhoneDigits, telHref, whatsappHref } from "../lib/format";

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

export default function ContactCard(props: Props) {
  const { wa, tel } = contactLinks(props);
  if (!wa && !tel) return null;
  return (
    <div className="rounded-xl border border-[var(--portal-border)] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--portal-text)]">
        Habla con {props.agencyName}
      </h2>
      {props.agentName && (
        <p className="mt-1 text-sm text-[var(--portal-muted)]">Te atiende {props.agentName}.</p>
      )}
      <div className="mt-4 flex flex-col gap-2">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-portal text-on-portal inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 font-semibold"
          >
            <MessageCircle className="h-5 w-5" aria-hidden /> Escribir por WhatsApp
          </a>
        )}
        {tel && (
          <a
            href={tel}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[var(--portal-control-border)] bg-white px-4 font-semibold text-[var(--portal-text)] hover:bg-[var(--portal-section)]"
          >
            <Phone className="h-5 w-5" aria-hidden /> Llamar
          </a>
        )}
      </div>
    </div>
  );
}

/** Barra fija en móvil con las dos vías de contacto rápido. */
export function MobileContactBar(props: Pick<Props, "title" | "url" | "whatsapp" | "phone">) {
  const { wa, tel } = contactLinks(props);
  if (!wa && !tel) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-[var(--portal-border)] bg-white/95 p-3 backdrop-blur lg:hidden">
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-portal text-on-portal inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg font-semibold"
        >
          <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp
        </a>
      )}
      {tel && (
        <a
          href={tel}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--portal-control-border)] font-semibold text-[var(--portal-text)]"
        >
          <Phone className="h-5 w-5" aria-hidden /> Llamar
        </a>
      )}
    </div>
  );
}
