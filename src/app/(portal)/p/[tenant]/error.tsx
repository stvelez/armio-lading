"use client";

export default function PortalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-[var(--portal-text)]">Algo salió mal</h1>
      <p className="mt-3 text-[var(--portal-muted)]">
        No pudimos cargar esta página. Intenta de nuevo en unos segundos.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-portal text-on-portal mt-6 inline-flex h-11 items-center rounded-lg px-5 font-semibold"
      >
        Reintentar
      </button>
    </div>
  );
}
