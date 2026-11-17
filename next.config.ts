import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { securityHeaders } from "./src/lib/security-headers";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
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
      {
        source: "/(.*)",
        headers: securityHeaders(),
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
