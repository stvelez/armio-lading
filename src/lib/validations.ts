import { z } from 'zod';

/**
 * Newsletter signup validation schema
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, 'Email es requerido')
    .email('Email inválido'),
  name: z.string().optional(),
});

/**
 * Type for newsletter form data
 */
export type NewsletterFormData = z.infer<typeof newsletterSchema>;

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
  const firstError = error.errors[0];
  if (firstError) {
    return firstError.message;
  }
  return 'Error de validación';
};
