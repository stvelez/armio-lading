"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import NewsletterForm from "@/components/forms/NewsletterForm";
import Countdown from "@/components/ui/Countdown";
import { useExitIntent } from "@/lib/exit-intent";
import { trackExitIntentSignup } from "@/lib/analytics";
import { EARLY_ACCESS_CLAIMED_SPOTS, EARLY_ACCESS_TOTAL_SPOTS } from "@/lib/early-access";

export default function ExitIntent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleTrigger = useCallback(() => {
    setIsOpen(true);
  }, []);

  useExitIntent(handleTrigger);

  const handleClose = () => setIsOpen(false);

  const handleSuccess = () => {
    trackExitIntentSignup();
    setTimeout(() => setIsOpen(false), 2500);
  };

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
            Antes de irte, reserva tu acceso preferencial
          </h2>
          <p className="text-sm text-neutral-400">
            Déjanos tu correo y asegura{" "}
            <span className="font-semibold text-[#1D9E75]">50% OFF de por vida</span> con precio
            fundador, sin tarjeta y sin cobro hoy.
          </p>
        </div>

        {/* Scarcity */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full border border-neutral-700 bg-neutral-800 px-4 py-2">
            <Countdown spots={EARLY_ACCESS_TOTAL_SPOTS} spotsTaken={EARLY_ACCESS_CLAIMED_SPOTS} />
          </div>
        </div>

        {/* Form */}
        <NewsletterForm
          location="popup"
          placeholder="tu@email.com"
          buttonText="Reservar mi acceso"
          successTitle="Acceso preferencial reservado"
          successDescription="Te contactaremos cuando abramos el onboarding con tu precio fundador."
          className="flex flex-col gap-3"
          onSuccess={handleSuccess}
        />

        <p className="mt-4 text-center text-xs text-neutral-600">
          Sin tarjeta · Sin pagos hoy · Sin compromiso
        </p>
      </div>
    </div>
  );
}
