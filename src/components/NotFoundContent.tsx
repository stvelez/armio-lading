import Link from "next/link";
import { APP_ORIGIN } from "@/lib/app-links";

/**
 * Contenido compartido de la 404 del sitio.
 *
 * Vive aparte porque este proyecto tiene dos root layouts (marketing y portal): `not-found.tsx`
 * cubre los 404 de segmento y `global-not-found.tsx` las URLs sin coincidencia, que Next resuelve
 * fuera de cualquier layout. `Link` solo para la navegación interna; el portal es otro origen.
 */
export default function NotFoundContent() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0D1117] px-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(0,196,122,0.14) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <Link
          href="/"
          className="text-2xl font-semibold tracking-[-0.02em] text-white select-none"
          aria-label="Armio, volver al inicio"
        >
          armio
        </Link>

        <p className="mt-10 text-sm font-semibold tracking-[0.18em] text-[#00C47A] uppercase">
          Error 404
        </p>
        <h1
          className="mt-3 text-4xl leading-tight font-semibold tracking-[-0.01em] text-white sm:text-5xl"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Esta página no existe
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-[#8B949E]">
          Puede que el enlace esté incompleto o que la dirección haya cambiado. Revisa la URL o
          vuelve a empezar desde el inicio.
        </p>

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#00C47A] px-6 text-sm font-semibold text-[#0D1117] transition-colors hover:bg-[#4DDBA0] sm:w-auto"
          >
            Volver al inicio
          </Link>
          <a
            href={APP_ORIGIN}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#30363D] px-6 text-sm font-semibold text-[#F0F6FC] transition-colors hover:border-[#00C47A] hover:text-[#00C47A] sm:w-auto"
          >
            Ir al portal
          </a>
        </div>
      </div>
    </main>
  );
}
