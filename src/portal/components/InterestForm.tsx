"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { PRIVACY_CONSENT_VERSION, PRIVACY_CONSENT_VERSION_GENERAL } from "../lib/format";
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
  /** `property`: ficha de un inmueble. `general`: home, captura la búsqueda. */
  context?: "property" | "general";
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

const inputBase =
  "w-full min-h-11 rounded-lg border px-3 py-2.5 text-base text-[var(--portal-text)] placeholder:text-[#6B7F79] sm:text-sm";
const inputValid = `${inputBase} border-[var(--portal-control-border)] bg-white`;
const inputInvalid = `${inputBase} border-[var(--portal-danger)] bg-[#FFFAFB]`;

/** El campo inválido se distingue por borde y fondo, no solo por el texto del error. */
const fieldClass = (invalid?: boolean) => (invalid ? inputInvalid : inputValid);

export default function InterestForm({
  tenant,
  responsibleName,
  propertyCode,
  propertyTitle,
  context = "property",
}: Props) {
  const general = context === "general";
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;
  const mountedAt = useRef(0);
  const successRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [phase, setPhase] = useState<"idle" | "verifying" | "sending">("idle");
  // Sin site key el formulario no espera nunca por Turnstile
  const siteKey = turnstileSiteKey();
  const turnstile = useRef<TurnstileHandle>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "sent") successRef.current?.focus();
  }, [status]);

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
      message:
        context === "property" && propertyTitle ? `Hola, me interesa "${propertyTitle}".` : "",
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
          consent_version: general ? PRIVACY_CONSENT_VERSION_GENERAL : PRIVACY_CONSENT_VERSION,
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
      <div
        role="status"
        ref={successRef}
        tabIndex={-1}
        className="rounded-2xl border border-[var(--portal-border)] bg-white p-5 shadow-[0_1px_2px_rgba(29,48,45,.06),0_4px_16px_rgba(29,48,45,.06)]"
      >
        <CheckCircle2 className="text-portal h-8 w-8" aria-hidden />
        <h2 className="mt-2 text-lg font-semibold text-[var(--portal-text)]">
          ¡Gracias por tu interés!
        </h2>
        <p className="mt-1 text-sm text-[var(--portal-muted)]">
          Recibimos tu mensaje. La inmobiliaria se pondrá en contacto contigo lo antes posible.
        </p>
      </div>
    );
  }

  const err = (id: string, msg?: string) =>
    msg ? (
      <p id={id} role="alert" className="mt-1 text-xs text-red-700">
        {msg}
      </p>
    ) : null;

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      onFocusCapture={siteKey ? () => turnstile.current?.start() : undefined}
      onPointerDownCapture={siteKey ? () => turnstile.current?.start() : undefined}
      noValidate
      aria-labelledby={fieldId("title")}
      className="rounded-2xl border border-[var(--portal-border)] bg-white p-5 shadow-[0_1px_2px_rgba(29,48,45,.06),0_4px_16px_rgba(29,48,45,.06)]"
    >
      <h2 id={fieldId("title")} className="text-lg font-semibold text-[var(--portal-text)]">
        {general ? "Cuéntanos qué buscas" : "Quiero más información"}
      </h2>
      <p className="mt-1 text-sm text-[var(--portal-muted)]">
        {general
          ? "Déjanos tus datos y te ayudamos a encontrar el inmueble que buscas."
          : "Déjanos tus datos y te contactamos."}
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label
            htmlFor={fieldId("name")}
            className="mb-1 block text-sm font-medium text-[var(--portal-text)]"
          >
            Nombre{" "}
            <span aria-hidden="true" className="text-red-700">
              *
            </span>
          </label>
          <input
            id={fieldId("name")}
            autoComplete="name"
            required
            aria-required="true"
            className={fieldClass(!!errors.name)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? fieldId("name-error") : undefined}
            {...register("name")}
          />
          {err(fieldId("name-error"), errors.name?.message)}
        </div>
        <div>
          <label
            htmlFor={fieldId("phone")}
            className="mb-1 block text-sm font-medium text-[var(--portal-text)]"
          >
            Teléfono o WhatsApp{" "}
            <span aria-hidden="true" className="text-red-700">
              *
            </span>
          </label>
          <input
            id={fieldId("phone")}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            aria-required="true"
            className={fieldClass(!!errors.phone)}
            aria-invalid={!!errors.phone}
            aria-describedby={
              errors.phone
                ? `${fieldId("phone-help")} ${fieldId("phone-error")}`
                : fieldId("phone-help")
            }
            {...register("phone")}
          />
          <p id={fieldId("phone-help")} className="mt-1 text-xs text-[var(--portal-muted)]">
            Celular o fijo. Si es celular, podemos responderte por WhatsApp.
          </p>
          {err(fieldId("phone-error"), errors.phone?.message)}
        </div>
        {!general && (
          <div>
            <label
              htmlFor={fieldId("email")}
              className="mb-1 block text-sm font-medium text-[var(--portal-text)]"
            >
              Correo <span className="font-normal text-[var(--portal-muted)]">(opcional)</span>
            </label>
            <input
              id={fieldId("email")}
              type="email"
              autoComplete="email"
              className={fieldClass(!!errors.email)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? fieldId("email-error") : undefined}
              {...register("email")}
            />
            {err(fieldId("email-error"), errors.email?.message)}
          </div>
        )}
        <div>
          <label
            htmlFor={fieldId("message")}
            className="mb-1 block text-sm font-medium text-[var(--portal-text)]"
          >
            Mensaje <span className="font-normal text-[var(--portal-muted)]">(opcional)</span>
          </label>
          <textarea
            id={fieldId("message")}
            rows={3}
            maxLength={1000}
            placeholder={
              general ? "Ej.: apartamento de 2 habitaciones en arriendo en Laureles" : undefined
            }
            className={fieldClass(!!errors.message)}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? fieldId("message-error") : undefined}
            {...register("message")}
          />
          {err(fieldId("message-error"), errors.message?.message)}
        </div>

        {/* Honeypot: oculto para personas; los bots suelen llenarlo */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={fieldId("website")}>No llenar este campo</label>
          <input
            id={fieldId("website")}
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-start gap-2">
            <input
              id={fieldId("consent")}
              type="checkbox"
              required
              aria-required="true"
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--portal-primary)]"
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? fieldId("consent-error") : undefined}
              {...register("consent")}
            />
            <label
              htmlFor={fieldId("consent")}
              className="text-xs leading-relaxed text-[var(--portal-muted)]"
            >
              Autorizo a <strong>{responsibleName}</strong>, como Responsable, a tratar mis datos
              personales para contactarme {general ? "sobre mi búsqueda" : "sobre este inmueble"},
              conforme a la Ley 1581 de 2012 y a su{" "}
              <Link href={"/privacidad"} target="_blank" className="underline">
                aviso de privacidad
              </Link>
              . Armio actúa como Encargado del tratamiento.{" "}
              <span aria-hidden="true" className="text-red-700">
                *
              </span>
            </label>
          </div>
          {err(fieldId("consent-error"), errors.consent?.message)}
          <div className="flex items-start gap-2">
            <input
              id={fieldId("marketing")}
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--portal-primary)]"
              {...register("marketing_consent")}
            />
            <label
              htmlFor={fieldId("marketing")}
              className="text-xs leading-relaxed text-[var(--portal-muted)]"
            >
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
      <p className="mt-2 text-xs text-[var(--portal-muted)]">
        <span aria-hidden="true" className="text-red-700">
          *
        </span>{" "}
        Campos obligatorios
      </p>
      {siteKey && (
        <p className="mt-3 text-xs leading-relaxed text-[var(--portal-muted)]">
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
