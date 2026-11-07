import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
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
};

export default withBundleAnalyzer(nextConfig);
