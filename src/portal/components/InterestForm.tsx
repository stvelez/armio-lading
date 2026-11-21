"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PRIVACY_CONSENT_VERSION, PRIVACY_CONSENT_VERSION_GENERAL } from "../lib/format";
import { turnstileSiteKey } from "../lib/turnstile";
import Icon from "./Icon";
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
    reset,
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

  function sendAnother() {
    reset();
    setStatus("idle");
  }

  if (status === "sent") {
    return (
      <div className="form-card">
        <div className="success" role="status" ref={successRef} tabIndex={-1}>
          <span className="success-ico">
            <Icon name="check" />
          </span>
          <h3>¡Gracias por tu interés!</h3>
          <p>
            Recibimos tu mensaje. La inmobiliaria se pondrá en contacto contigo lo antes posible.
          </p>
          <button type="button" className="btn btn-secondary" onClick={sendAnother}>
            Enviar otro mensaje
          </button>
        </div>
      </div>
    );
  }

  const err = (id: string, msg?: string) =>
    msg ? (
      <p id={id} role="alert" className="err">
        <Icon name="alert" />
        <span>{msg}</span>
      </p>
    ) : null;
  const required = (
    <span className="req" aria-hidden="true">
      *
    </span>
  );
  const optional = <span className="opt">(opcional)</span>;
  const alertText = VERIFY_MESSAGES[status];

  return (
    <div className="form-card">
      <h3 id={fieldId("title")}>{general ? "Escríbenos" : "Quiero más información"}</h3>
      <p>
        {general
          ? "Cuéntanos qué buscas y te contactamos en horario hábil."
          : "Déjanos tus datos y te contactamos."}
      </p>
      <form
        className="form"
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        onFocusCapture={siteKey ? () => turnstile.current?.start() : undefined}
        onPointerDownCapture={siteKey ? () => turnstile.current?.start() : undefined}
        noValidate
        aria-labelledby={fieldId("title")}
      >
        <div className="form-row">
          <div className="field">
            <label htmlFor={fieldId("name")}>Nombre {required}</label>
            <input
              id={fieldId("name")}
              className="input"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? fieldId("name-error") : undefined}
              {...register("name")}
            />
            {err(fieldId("name-error"), errors.name?.message)}
          </div>
          <div className="field">
            <label htmlFor={fieldId("phone")}>Teléfono o WhatsApp {required}</label>
            <input
              id={fieldId("phone")}
              className="input"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={
                errors.phone
                  ? `${fieldId("phone-help")} ${fieldId("phone-error")}`
                  : fieldId("phone-help")
              }
              {...register("phone")}
            />
            <p className="help" id={fieldId("phone-help")}>
              Celular o fijo. Si es celular, podemos responderte por WhatsApp.
            </p>
            {err(fieldId("phone-error"), errors.phone?.message)}
          </div>
        </div>
        {!general && (
          <div className="field">
            <label htmlFor={fieldId("email")}>Correo {optional}</label>
            <input
              id={fieldId("email")}
              className="input"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? fieldId("email-error") : undefined}
              {...register("email")}
            />
            {err(fieldId("email-error"), errors.email?.message)}
          </div>
        )}
        <div className="field">
          <label htmlFor={fieldId("message")}>
            {general ? "¿Qué buscas?" : "Mensaje"} {optional}
          </label>
          <textarea
            id={fieldId("message")}
            className="input"
            rows={3}
            maxLength={1000}
            placeholder={
              general ? "Ej.: apartamento de 2 habitaciones en arriendo en Laureles" : undefined
            }
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? fieldId("message-error") : undefined}
            {...register("message")}
          />
          {err(fieldId("message-error"), errors.message?.message)}
        </div>

        {/* Honeypot: oculto para personas; los bots suelen llenarlo */}
        <div aria-hidden="true" className="hp">
          <label htmlFor={fieldId("website")}>No llenar este campo</label>
          <input
            id={fieldId("website")}
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </div>

        <div className="checks">
          <div className="field">
            <label className="check" htmlFor={fieldId("consent")}>
              <input
                id={fieldId("consent")}
                type="checkbox"
                required
                aria-required="true"
                aria-invalid={!!errors.consent}
                aria-describedby={errors.consent ? fieldId("consent-error") : undefined}
                {...register("consent")}
              />
              <span>
                Autorizo a <strong>{responsibleName}</strong>, como Responsable, a tratar mis datos
                personales para contactarme {general ? "sobre mi búsqueda" : "sobre este inmueble"},
                conforme a la Ley 1581 de 2012 y a su{" "}
                <Link href={"/privacidad"} target="_blank">
                  aviso de privacidad
                </Link>
                . Armio actúa como Encargado del tratamiento. {required}
              </span>
            </label>
            {err(fieldId("consent-error"), errors.consent?.message)}
          </div>
          <div className="field">
            <label className="check" htmlFor={fieldId("marketing")}>
              <input id={fieldId("marketing")} type="checkbox" {...register("marketing_consent")} />
              <span>
                <span className="opt">(Opcional)</span> Quiero recibir ofertas y novedades de
                propiedades de esta inmobiliaria.
              </span>
            </label>
          </div>
        </div>

        {siteKey && <TurnstileField siteKey={siteKey} ref={turnstile} />}

        {(alertText || status === "limited" || status === "error") && (
          <div className="form-alert">
            <p role="alert">
              {alertText ??
                (status === "limited"
                  ? "Has enviado varias solicitudes seguidas. Intenta de nuevo más tarde o escríbenos por WhatsApp."
                  : "No pudimos enviar tu mensaje. Revisa los datos e intenta de nuevo.")}
            </p>
            {status === "error" && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void handleSubmit(onSubmit)()}
              >
                Reintentar
              </button>
            )}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {phase === "verifying" ? (
              "Verificando…"
            ) : isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true" /> Enviando…
              </>
            ) : (
              "Enviar mensaje"
            )}
          </button>
          <span className="help">{required} Campos obligatorios</span>
        </div>
        {siteKey && (
          <p className="help legal">
            Este formulario está protegido por Cloudflare Turnstile para evitar envíos
            automatizados. Consulta el{" "}
            <Link href={"/privacidad"} target="_blank">
              aviso de privacidad
            </Link>
            .
          </p>
        )}
      </form>
    </div>
  );
}
