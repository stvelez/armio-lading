"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { useExitIntent } from "@/lib/exit-intent";
import { trackCTAClick } from "@/lib/analytics";
import { REGISTER_URL } from "@/lib/app-links";

export default function ExitIntent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleTrigger = useCallback(() => {
    setIsOpen(true);
  }, []);

  useExitIntent(handleTrigger);

  const handleClose = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Popup */}
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-500 transition-colors hover:text-white"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="mb-6 text-center">
          <p className="mb-2 text-2xl">👋</p>
          <h2 className="mb-2 text-xl font-semibold text-white">
            Antes de irte: prueba Armio 3 meses gratis
          </h2>
          <p className="text-sm text-neutral-400">
            Crea tu cuenta en minutos, elige el plan que necesitas y úsalo{" "}
            <span className="font-semibold text-[#1D9E75]">sin pagar nada</span> durante 3 meses.
            Sin tarjeta.
          </p>
        </div>

        <a
          href={REGISTER_URL}
          onClick={() => trackCTAClick("exit-intent")}
          className="flex w-full items-center justify-center rounded-lg bg-[#00C47A] px-6 py-3 text-sm font-semibold text-[#0D1117] transition-colors hover:bg-[#4DDBA0]"
        >
          Crear mi cuenta gratis
        </a>

        <p className="mt-4 text-center text-xs text-neutral-600">
          Sin tarjeta · Sin compromiso · Sin cobro automático
        </p>
      </div>
    </div>
  );
}
