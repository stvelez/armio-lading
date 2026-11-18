/** Variables de entorno (o un objeto equivalente, p. ej. en tests). */
export type DeploymentEnv = Record<string, string | undefined>;

/**
 * ¿Es un despliegue de producción indexable?
 *
 * Solo Vercel producción (`VERCEL_ENV=production` o, si se usa, `NEXT_PUBLIC_VERCEL_ENV`).
 * Fallback SEGURO: preview, development, tests y builds locales (`next build && next start`)
 * no se indexan. La ausencia de `VERCEL_ENV` nunca habilita indexación.
 */
export function isProductionDeployment(env: DeploymentEnv = process.env): boolean {
  return (env.VERCEL_ENV ?? env.NEXT_PUBLIC_VERCEL_ENV) === "production";
}
