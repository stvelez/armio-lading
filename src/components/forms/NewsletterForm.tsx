"use client";

import { useState } from "react";
import { Mail, Check, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newsletterFormSchema,
  type NewsletterFormData,
  type NewsletterSignupSource,
} from "@/lib/validations";
import { trackNewsletterSignup, trackNewsletterSignupResult } from "@/lib/analytics";
import toast from "react-hot-toast";
import { PRIVACY_CONTACT_EMAIL, PRIVACY_POLICY_VERSION, privacyUrl } from "@/lib/legal";

interface NewsletterFormProps {
  location?: NewsletterSignupSource;
  showEmailField?: boolean;
  className?: string;
  placeholder?: string;
  buttonText?: string;
  onSuccess?: () => void;
  successTitle?: string;
  successDescription?: string;
}

interface NewsletterSignupResponse {
  success?: boolean;
  status?: "created" | "duplicate";
  message?: string;
  error?: string;
}

export default function NewsletterForm({
  location = "hero",
  showEmailField = true,
  className = "",
  placeholder = "tu@email.com",
  buttonText = "Únete a la lista de espera",
  onSuccess,
  successTitle = "¡Reservaste tu acceso!",
  successDescription = "Te escribiremos cuando abramos el onboarding con tu precio fundador.",
}: NewsletterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterFormSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          source: location,
          consent: data.consent,
          policyVersion: PRIVACY_POLICY_VERSION,
        }),
      });

      const result: NewsletterSignupResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al procesar tu solicitud");
      }

      const isDuplicate = result.status === "duplicate";
      const nextState = isDuplicate
        ? {
            title: "Este correo ya está reservado",
            description: "Ya tienes tu lugar en early access. Te escribiremos cuando abramos.",
          }
        : {
            title: successTitle,
            description: successDescription,
          };

      setSubmissionState(nextState);
      trackNewsletterSignup(location);
      trackNewsletterSignupResult(location, isDuplicate ? "duplicate" : "created");
      toast.success(result.message || nextState.title);

      // Trigger confetti celebration — dynamic import so confetti is not in initial bundle
      if (!isDuplicate) {
        import("canvas-confetti").then(({ default: confetti }) => {
          confetti({
            particleCount: 250,
            spread: 80,
            origin: { x: 0.5, y: 0.6 },
            ticks: 300,
            colors: ["#00C47A", "#4DDBA0", "#ffffff"],
          });
        });
      }

      if (onSuccess) {
        onSuccess();
      }

      // Reset success state after 5 seconds
      setTimeout(() => {
        setSubmissionState(null);
        reset();
      }, 5000);
    } catch (error) {
      console.error("Newsletter form error:", error);
      trackNewsletterSignupResult(location, "error");
      toast.error(error instanceof Error ? error.message : "Error al procesar tu solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionState) {
    return (
      <div className={className} role="status" aria-live="polite">
        <div className="animate-in slide-in-from-bottom-2 flex items-center gap-2 text-[#00C47A]">
          <Check size={20} strokeWidth={2.5} aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">{submissionState.title}</p>
            <p className="text-xs text-[#8B949E]">{submissionState.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <div className="flex flex-col gap-2 sm:flex-row">
        {showEmailField && (
          <div className="relative flex-1">
            <label htmlFor={`newsletter-email-${location}`} className="sr-only">
              Correo electrónico
            </label>
            <input
              id={`newsletter-email-${location}`}
              type="email"
              autoComplete="email"
              placeholder={placeholder}
              {...register("email")}
              aria-describedby={errors.email ? `newsletter-email-error-${location}` : undefined}
              aria-invalid={errors.email ? "true" : undefined}
              className={`w-full rounded-md border bg-[#161B22] px-4 py-3 text-base text-white placeholder:text-[#484F58] focus:ring-2 focus:ring-[#00C47A] focus:outline-none ${
                errors.email ? "border-red-500" : "border-[#21262D]"
              }`}
              disabled={isSubmitting}
            />
            {errors.email && (
              <div
                id={`newsletter-email-error-${location}`}
                role="alert"
                className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-red-400"
              >
                <AlertCircle size={12} aria-hidden="true" />
                <span>{errors.email.message}</span>
              </div>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !isDirty || !isValid}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#00C47A] px-5 py-3 text-sm font-medium whitespace-nowrap text-[#0D1117] transition-colors duration-150 hover:bg-[#4DDBA0] disabled:cursor-not-allowed disabled:bg-[#21262D] disabled:text-[#484F58] sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Mail size={16} />
              <span>{buttonText}</span>
            </>
          )}
        </button>
      </div>

      {/* Autorización de tratamiento de datos personales (Ley 1581 de 2012) */}
      <div className="mt-3">
        <label
          htmlFor={`newsletter-consent-${location}`}
          className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-[#8B949E]"
        >
          <input
            id={`newsletter-consent-${location}`}
            type="checkbox"
            {...register("consent")}
            aria-invalid={errors.consent ? "true" : undefined}
            disabled={isSubmitting}
            className="mt-1 h-4 w-4 flex-shrink-0 rounded border-[#21262D] bg-[#161B22] accent-[#00C47A]"
          />
          <span>
            Autorizo a Armio a usar mi correo para informarme sobre el lanzamiento y las novedades,
            según la{" "}
            {privacyUrl ? (
              <a href={privacyUrl} className="underline transition-colors hover:text-white">
                Política de privacidad
              </a>
            ) : (
              "Política de privacidad"
            )}
            . Puedo retirar mi autorización escribiendo a {PRIVACY_CONTACT_EMAIL}.
          </span>
        </label>
        {errors.consent && (
          <p role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-400">
            <AlertCircle size={12} aria-hidden="true" />
            <span>{errors.consent.message}</span>
          </p>
        )}
      </div>
    </form>
  );
}
