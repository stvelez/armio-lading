/** Dirección de la app. Sin NEXT_PUBLIC_APP_URL se usa la de producción. */
const APP = (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.armio.co").replace(/\/$/, "");

/** Crear cuenta: lleva al registro de la app (3 meses gratis, sin tarjeta). */
export const REGISTER_URL = `${APP}/register`;
