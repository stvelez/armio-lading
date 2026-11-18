/** Sentry limita el nombre del release a 200 caracteres; un valor absurdo rompería el build. */
export const RELEASE_MAX_LENGTH = 200;

/**
 * Formato único de release: el mismo en build (`next.config.ts`) y en runtime (`beforeSend`).
 * Admite SHA, semver con metadatos (`1.2.3+abc123`) y nombres con `@`/`/` (p. ej.
 * `armio-landing@1.2.3`). Cualquier otro carácter se rechaza para que el release no sea texto
 * libre que pueda arrastrar PII.
 */
export const RELEASE_RE = /^[\w.@/+-]{1,200}$/;

/**
 * Nombre del release de Sentry: el SHA del commit desplegado.
 *
 * Debe ser el MISMO valor en build (`withSentryConfig`, que sube los source maps) y en runtime
 * (`sentryOptions`), o los eventos no se simbolizan. Se resuelve en cada llamada para que build,
 * servidor y tests usen el valor vigente del proceso.
 *
 * Prioridad:
 *  1. `SENTRY_RELEASE` explícito (builds fuera de Vercel o releases con nombre propio).
 *  2. `VERCEL_GIT_COMMIT_SHA`, que Vercel inyecta tanto en build como en runtime.
 *  3. `globalThis.SENTRY_RELEASE`: constante que `withSentryConfig` inyecta en el bundle al
 *     compilar (`{ id }` como lo lee el SDK de navegador). En el cliente no existe `process.env`,
 *     así que esta es la única forma de validar contra el release del build sin aceptar el valor
 *     que traiga el evento. No es entrada de usuario: es el mismo candado que usa el SDK.
 *
 * Sin ninguno —o si el valor no cumple `RELEASE_RE`— devuelve `undefined`: no se fuerza release y
 * Sentry usa el que haya inyectado el build (o ninguno). El valor no es secreto: el SHA ya viaja
 * en el bundle. `SENTRY_RELEASE` es una variable de build/servidor, nunca entrada de usuario.
 */
export function sentryRelease(): string | undefined {
  const release = (
    process.env.SENTRY_RELEASE?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    injectedRelease()?.trim()
  )?.slice(0, RELEASE_MAX_LENGTH);
  return release && RELEASE_RE.test(release) ? release : undefined;
}

/** Valor inyectado en build por el plugin de Sentry (`globalThis.SENTRY_RELEASE`). */
function injectedRelease(): string | undefined {
  const injected = (globalThis as { SENTRY_RELEASE?: unknown }).SENTRY_RELEASE;
  if (typeof injected === "string") return injected;
  if (injected && typeof injected === "object") {
    const id = (injected as { id?: unknown }).id;
    if (typeof id === "string") return id;
  }
  return undefined;
}
