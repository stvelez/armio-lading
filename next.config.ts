import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  turbopack: {
    root: __dirname,
  },
};

export default withBundleAnalyzer(nextConfig);
