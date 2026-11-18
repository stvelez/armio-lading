import type { Metadata } from "next";
import NotFoundContent from "@/components/NotFoundContent";

export const metadata: Metadata = {
  title: "Página no encontrada — Armio",
  description:
    "La dirección que buscas no existe o cambió. Vuelve al inicio o entra al portal de Armio.",
  robots: { index: false, follow: false },
};

/** 404 de segmento (cuando una página llama a `notFound()`). */
export default function NotFound() {
  return <NotFoundContent />;
}
