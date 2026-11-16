"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <main style={{ padding: "4rem 1rem", textAlign: "center", fontFamily: "sans-serif" }}>
          <h1>Algo salió mal</h1>
          <p>Estamos al tanto del problema. Recarga la página e inténtalo de nuevo.</p>
        </main>
      </body>
    </html>
  );
}
