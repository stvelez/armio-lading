/** Dirección de la app. Sin NEXT_PUBLIC_APP_URL se usa la de producción. */
const APP = (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.armio.co").replace(/\/$/, "");

/** Crear cuenta: lleva al registro de la app (3 meses gratis, sin tarjeta). */
export const REGISTER_URL = `${APP}/register`;

/** API pública de Armio (precios, IVA). Sin NEXT_PUBLIC_API_URL se usa la de producción. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.armio.co/api/v1").replace(
  /\/$/,
  ""
);
