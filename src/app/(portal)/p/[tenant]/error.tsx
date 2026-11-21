"use client";

export default function PortalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="state">
      <h1>Algo salió mal</h1>
      <p>No pudimos cargar esta página. Intenta de nuevo en unos segundos.</p>
      <button type="button" onClick={reset} className="btn btn-primary btn-lg">
        Reintentar
      </button>
    </div>
  );
}
