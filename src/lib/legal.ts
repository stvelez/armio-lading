/** Dirección pública de la app, donde viven /terminos y /privacidad. Sin definir, no se enlazan. */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

export const privacyUrl = APP_URL ? `${APP_URL}/privacidad` : undefined;
export const termsUrl = APP_URL ? `${APP_URL}/terminos` : undefined;

/**
 * Sitio de marketing. `/cookies` vive aquí (no en la app), así que la URL es estática y
 * siempre se puede enlazar, también desde el portal (otro origen) y aunque falte APP_URL.
 */
export const MARKETING_ORIGIN = "https://armio.co";
export const cookiesUrl = `${MARKETING_ORIGIN}/cookies`;

/** Versión de la Política de Privacidad vigente; se guarda con la autorización de cada suscriptor. */
export const PRIVACY_POLICY_VERSION = "1.0";

export const PRIVACY_CONTACT_EMAIL = "soporte@armio.co";
