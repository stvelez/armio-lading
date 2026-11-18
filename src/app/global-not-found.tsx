import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import NotFoundContent from "@/components/NotFoundContent";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Página no encontrada — Armio",
  description:
    "La dirección que buscas no existe o cambió. Vuelve al inicio o entra al portal de Armio.",
  robots: { index: false, follow: false },
};

/**
 * 404 global para URLs sin coincidencia. Next lo renderiza FUERA de los layouts, así que aquí se
 * importan los estilos y las fuentes hermanas de `(marketing)/layout.tsx` (no se pueden usar sus
 * layouts: el proyecto tiene dos root layouts, marketing y portal).
 */
export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body className={`${plusJakartaSans.variable} ${fraunces.variable} antialiased`}>
        <NotFoundContent />
      </body>
    </html>
  );
}
