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

export const newsletterRequestSchema = z.object({
  email: z.string().min(1, "Email es requerido").email("Email inválido"),
  source: z.enum(newsletterSignupSources).default("hero"),
});

/**
 * Type for newsletter form data
 */
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
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
