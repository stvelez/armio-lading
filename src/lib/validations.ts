import { z } from "zod";

export const newsletterSignupSources = [
  "hero",
  "footer",
  "popup",
  "pricing",
  "cta",
  "cta-mobile",
] as const;

export type NewsletterSignupSource = (typeof newsletterSignupSources)[number];

/**
 * Newsletter signup validation schema
 */
export const newsletterSchema = z.object({
  email: z.string().min(1, "Email es requerido").email("Email inválido"),
  name: z.string().optional(),
});

const CONSENT_MESSAGE = "Debes autorizar el uso de tu correo para unirte a la lista";

/** Formulario: el correo y la autorización de tratamiento de datos (Ley 1581 de 2012) */
export const newsletterFormSchema = newsletterSchema.extend({
  consent: z.literal(true, { message: CONSENT_MESSAGE }),
});

export const newsletterRequestSchema = z.object({
  email: z.string().min(1, "Email es requerido").email("Email inválido"),
  source: z.enum(newsletterSignupSources).default("hero"),
  consent: z.literal(true, { message: CONSENT_MESSAGE }),
  policyVersion: z.string().min(1).max(20),
});

/**
 * Type for newsletter form data
 */
export type NewsletterFormData = z.infer<typeof newsletterFormSchema>;
export type NewsletterRequestData = z.infer<typeof newsletterRequestSchema>;

/**
 * Validate email address
 */
export const validateEmail = (email: string) => {
  return newsletterSchema.safeParse({ email });
};

/**
 * Generic form validation helper
 */
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  return schema.safeParse(data);
};

/**
 * Get formatted error message from Zod error
 */
export const getErrorMessage = (error: z.ZodError): string => {
  const firstError = error.issues[0];
  if (firstError) {
    return firstError.message;
  }
  return "Error de validación";
};
