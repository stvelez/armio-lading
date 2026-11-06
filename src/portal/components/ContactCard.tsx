import { MessageCircle, Phone } from "lucide-react";
import { telHref, whatsappHref } from "../lib/format";

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
  return {
    wa: whatsappHref(p.whatsapp, `Hola, me interesa "${p.title}". ${p.url}`),
    tel: telHref(p.phone ?? p.whatsapp),
  };
}

export default function ContactCard(props: Props) {
  const { wa, tel } = contactLinks(props);
  if (!wa && !tel) return null;
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Habla con {props.agencyName}</h2>
      {props.agentName && (
        <p className="mt-1 text-sm text-stone-600">Te atiende {props.agentName}.</p>
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 font-semibold text-stone-900 hover:bg-stone-50"
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
    <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-stone-200 bg-white/95 p-3 backdrop-blur lg:hidden">
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
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-stone-300 font-semibold text-stone-900"
        >
          <Phone className="h-5 w-5" aria-hidden /> Llamar
        </a>
      )}
    </div>
  );
}
