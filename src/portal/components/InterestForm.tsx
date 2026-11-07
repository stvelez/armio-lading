"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { PRIVACY_CONSENT_VERSION } from "../lib/format";
import { turnstileSiteKey } from "../lib/turnstile";
import TurnstileField, { TurnstileFlowError, type TurnstileHandle } from "./TurnstileField";

const schema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(150, "Máximo 150 caracteres"),
  phone: z
    .string()
    .trim()
    .min(7, "Escribe un teléfono válido")
    .max(30, "Máximo 30 caracteres")
    .regex(/^[+()\d][\d\s()+-]*$/, "Usa solo números, espacios o +"),
  email: z.union([z.literal(""), z.string().trim().email("Correo no válido").max(100)]),
  message: z.string().max(1000, "Máximo 1000 caracteres"),
  consent: z.literal(true, { message: "Debes autorizar el tratamiento de tus datos para enviar" }),
  marketing_consent: z.boolean(),
  website: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  tenant: string;
  responsibleName: string;
  propertyCode?: number;
  propertyTitle?: string;
}

type Status =
  | "idle"
  | "sent"
  | "limited"
  | "error"
  | "verify_load"
  | "verify_browser"
  | "verify_config"
  | "verify_generic"
  | "verify_timeout";

const VERIFY_MESSAGES: Partial<Record<Status, string>> = {
  verify_load:
    "No pudimos cargar la verificación de seguridad. Revisa tu conexión o desactiva el bloqueador de contenido y vuelve a intentarlo. También puedes escribirnos por WhatsApp.",
  verify_browser:
    "No pudimos verificar tu navegador. Recarga la página o prueba con otro navegador.",
  verify_config:
    "La verificación de seguridad no está disponible en este momento. Escríbenos por WhatsApp.",
  verify_generic: "Hubo un problema con la verificación. Recarga la página e intenta de nuevo.",
  verify_timeout: "La verificación tardó demasiado. Vuelve a intentarlo.",
};

function verifyStatus(error: unknown): Status {
  const kind = error instanceof TurnstileFlowError ? error.kind : "generic";
  return `verify_${kind}` as Status;
}

const input =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400";

export default function InterestForm({
  tenant,
  responsibleName,
  propertyCode,
  propertyTitle,
}: Props) {
  const mountedAt = useRef(0);
  const [status, setStatus] = useState<Status>("idle");
  const [phase, setPhase] = useState<"idle" | "verifying" | "sending">("idle");
  // Sin site key el formulario no espera nunca por Turnstile
  const siteKey = turnstileSiteKey();
  const turnstile = useRef<TurnstileHandle>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: propertyTitle ? `Hola, me interesa "${propertyTitle}".` : "",
      consent: undefined as unknown as true, // sin marcar por defecto
      marketing_consent: false,
      website: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setStatus("idle");
    let turnstileToken: string | undefined;
    if (siteKey) {
      setPhase("verifying");
      try {
        turnstileToken = await turnstile.current?.getToken();
        if (!turnstileToken) throw new TurnstileFlowError("generic");
      } catch (error) {
        // Sin token el API descartaría el envío en silencio: mejor no enviar y avisar
        setStatus(verifyStatus(error));
        setPhase("idle");
        return;
      }
    }
    setPhase("sending");
    let delivered = false;
    try {
      const res = await fetch("/api/portal/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: tenant,
          property_code: propertyCode,
          name: values.name,
          phone: values.phone,
          email: values.email || undefined,
          message: values.message || undefined,
          consent: true,
          consent_version: PRIVACY_CONSENT_VERSION,
          marketing_consent: values.marketing_consent,
          website: values.website,
          elapsed_ms: Math.max(0, Date.now() - mountedAt.current),
          page_url: `${window.location.origin}${window.location.pathname}`,
          ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
        }),
      });
      if (res.status === 202) {
        delivered = true;
        setStatus("sent");
      } else if (res.status === 429) setStatus("limited");
      else setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setPhase("idle");
      // El token es de un solo uso: tras cualquier intento fallido se pide otro
      if (siteKey && !delivered) turnstile.current?.reset();
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <CheckCircle2 className="text-portal h-8 w-8" aria-hidden />
        <h2 className="mt-2 text-lg font-semibold text-stone-900">¡Gracias por tu interés!</h2>
        <p className="mt-1 text-sm text-stone-700">
          Recibimos tu mensaje. La inmobiliaria se pondrá en contacto contigo lo antes posible.
        </p>
      </div>
    );
  }

  const err = (msg?: string) =>
    msg ? (
      <p role="alert" className="mt-1 text-xs text-red-700">
        {msg}
      </p>
    ) : null;

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      onFocusCapture={siteKey ? () => turnstile.current?.start() : undefined}
      onPointerDownCapture={siteKey ? () => turnstile.current?.start() : undefined}
      noValidate
      className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-stone-900">Quiero más información</h2>
      <p className="mt-1 text-sm text-stone-600">Déjanos tus datos y te contactamos.</p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="lead-name" className="mb-1 block text-sm font-medium text-stone-800">
            Nombre
          </label>
          <input
            id="lead-name"
            autoComplete="name"
            className={input}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {err(errors.name?.message)}
        </div>
        <div>
          <label htmlFor="lead-phone" className="mb-1 block text-sm font-medium text-stone-800">
            Teléfono o WhatsApp
          </label>
          <input
            id="lead-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={input}
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          {err(errors.phone?.message)}
        </div>
        <div>
          <label htmlFor="lead-email" className="mb-1 block text-sm font-medium text-stone-800">
            Correo <span className="font-normal text-stone-500">(opcional)</span>
          </label>
          <input
            id="lead-email"
            type="email"
            autoComplete="email"
            className={input}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {err(errors.email?.message)}
        </div>
        <div>
          <label htmlFor="lead-message" className="mb-1 block text-sm font-medium text-stone-800">
            Mensaje <span className="font-normal text-stone-500">(opcional)</span>
          </label>
          <textarea
            id="lead-message"
            rows={3}
            maxLength={1000}
            className={input}
            aria-invalid={!!errors.message}
            {...register("message")}
          />
          {err(errors.message?.message)}
        </div>

        {/* Honeypot: oculto para personas; los bots suelen llenarlo */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="lead-website">No llenar este campo</label>
          <input id="lead-website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-start gap-2">
            <input
              id="lead-consent"
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0"
              aria-invalid={!!errors.consent}
              {...register("consent")}
            />
            <label htmlFor="lead-consent" className="text-xs leading-relaxed text-stone-700">
              Autorizo a <strong>{responsibleName}</strong>, como Responsable, a tratar mis datos
              personales para contactarme sobre este inmueble, conforme a la Ley 1581 de 2012 y a su{" "}
              <Link href={"/privacidad"} target="_blank" className="underline">
                aviso de privacidad
              </Link>
              . Armio actúa como Encargado del tratamiento.
            </label>
          </div>
          {err(errors.consent?.message)}
          <div className="flex items-start gap-2">
            <input
              id="lead-marketing"
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0"
              {...register("marketing_consent")}
            />
            <label htmlFor="lead-marketing" className="text-xs leading-relaxed text-stone-700">
              (Opcional) Quiero recibir ofertas y novedades de propiedades de esta inmobiliaria.
            </label>
          </div>
        </div>
      </div>

      {siteKey && (
        <div className="mt-4">
          <TurnstileField siteKey={siteKey} ref={turnstile} />
        </div>
      )}

      {VERIFY_MESSAGES[status] && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {VERIFY_MESSAGES[status]}
        </p>
      )}
      {status === "limited" && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          Has enviado varias solicitudes seguidas. Intenta de nuevo más tarde o escríbenos por
          WhatsApp.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          No pudimos enviar tu mensaje. Revisa los datos e intenta de nuevo.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="bg-portal text-on-portal mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg px-4 font-semibold disabled:opacity-60"
      >
        {phase === "verifying" ? "Verificando…" : isSubmitting ? "Enviando…" : "Enviar"}
      </button>
      {siteKey && (
        <p className="mt-3 text-xs leading-relaxed text-stone-600">
          Este formulario está protegido por Cloudflare Turnstile para evitar envíos automatizados.
          Consulta el{" "}
          <Link href={"/privacidad"} target="_blank" className="underline">
            aviso de privacidad
          </Link>
          .
        </p>
      )}
    </form>
  );
}
