"use client";

import { useState } from "react";
import { Mail, Check, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterFormData, getErrorMessage } from "@/lib/validations";
import { trackNewsletterSignup } from "@/lib/analytics";
import toast from "react-hot-toast";

interface NewsletterFormProps {
  location?: "hero" | "footer" | "popup" | "pricing" | "cta" | "cta-mobile";
  showEmailField?: boolean;
  className?: string;
  placeholder?: string;
  buttonText?: string;
  onSuccess?: () => void;
}

export default function NewsletterForm({
  location = "hero",
  showEmailField = true,
  className = "",
  placeholder = "tu@email.com",
  buttonText = "Únete a la lista de espera",
  onSuccess,
}: NewsletterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al procesar tu solicitud");
      }

      setIsSuccess(true);
      trackNewsletterSignup(location);
      toast.success("¡Estás en la lista! Te avisaremos pronto.");

      // Trigger confetti celebration — dynamic import so confetti is not in initial bundle
      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({
          particleCount: 250,
          spread: 80,
          origin: { x: 0.5, y: 0.6 },
          ticks: 300,
          colors: ["#1D9E75", "#0F6E56", "#ffffff"],
        });
      });

      if (onSuccess) {
        onSuccess();
      }

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
        reset();
      }, 5000);
    } catch (error) {
      console.error("Newsletter form error:", error);
      toast.error(error instanceof Error ? error.message : "Error al procesar tu solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={className} role="status" aria-live="polite">
        <div className="animate-in slide-in-from-bottom-2 flex items-center gap-2 text-[#1D9E75]">
          <Check size={20} strokeWidth={2.5} aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">¡Estás en la lista!</p>
            <p className="text-xs text-[#B4B2A9]">Te avisaremos cuando estemos listos.</p>
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
              className={`w-full rounded-md border bg-[#2C2C2A] px-4 py-3 text-base text-white placeholder:text-[#888780] focus:ring-2 focus:ring-[#1D9E75] focus:outline-none ${
                errors.email ? "border-red-500" : "border-[#3C3C3A]"
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
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#1D9E75] px-5 py-3 text-sm font-medium whitespace-nowrap text-white transition-colors duration-150 hover:bg-[#0F6E56] disabled:cursor-not-allowed disabled:bg-[#3C3C3A] sm:w-auto"
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
    </form>
  );
}
