import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs/config";
import { securityHeaders } from "./src/lib/security-headers";
import { sentryRelease } from "./src/lib/sentry-release";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // 404 global propia: el proyecto tiene dos root layouts (marketing y portal) y un
    // `not-found.tsx` suelto se renderizaría sin `globals.css` ni fuentes.
    globalNotFound: true,
  },
  images: {
    // Las URLs de fotos y logos llevan un UUID nuevo en cada subida (nunca se reemplaza un archivo con la
    // misma URL), así que cachear 31 días la imagen optimizada es seguro y reduce transformaciones.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "media.armio.co" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  turbopack: {
    root: __dirname,
  },
  // Fuente única de cabeceras: aquí viven las de seguridad. `vercel.json` ya no declara ninguna
  // para que no se dupliquen ni se pisen. El caché de `/_next/static` lo pone Next por defecto
  // (`public, max-age=31536000, immutable` sobre assets con hash).
  async headers() {
    return [
      // El optimizador de imágenes responde con su propio `Content-Type`; `nosniff`
      // evita que el navegador lo reinterprete si algún día cambia.
      {
        source: "/_next/image",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
      {
        source: "/(.*)",
        headers: securityHeaders(),
      },
    ];
  },
};

/** Subida de source maps: exige token, org y proyecto. Si falta algo, se compila sin Sentry. */
const sentryUploadEnabled = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
);

const release = sentryRelease();

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // Source maps + release. Sin credenciales no se sube nada y el build sigue igual:
  // Sentry solo intenta crear el release/upload si hay auth token (y avisa, no falla).
  // `silent` calla los logs del plugin en local; en CI se dejan visibles para diagnosticar.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  ...(release ? { release: { name: release } } : {}),
  // Stack traces legibles también dentro de Next/React: solo afecta a la subida, no al bundle.
  widenClientFileUpload: true,
  // Nada de telemetría del propio plugin a Sentry desde este proyecto.
  telemetry: false,
  silent: !process.env.CI,
  // Sin credenciales ni se generan source maps ni se inyectan debug IDs (no-op real).
  // Con credenciales, el plugin los genera ocultos y los borra tras subirlos.
  sourcemaps: { disable: !sentryUploadEnabled },
  // Un fallo de Sentry (red, token vencido) no debe tumbar el deploy.
  errorHandler: (error) => {
    console.warn(`[sentry] no se pudieron subir los source maps: ${error.message}`);
  },
});
