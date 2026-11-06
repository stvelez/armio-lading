import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

/** Genérico: no revela si la inmobiliaria o la propiedad existen. */
export default function PortalNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold tracking-wide text-stone-500 uppercase">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold text-stone-900">No encontramos esta página</h1>
      <p className="mt-3 text-stone-700">
        Es posible que el enlace esté incompleto, que la propiedad ya no esté disponible o que la
        dirección haya cambiado.
      </p>
      <a
        href="https://armio.co"
        className="bg-portal text-on-portal mt-8 inline-flex h-11 items-center rounded-lg px-5 font-semibold"
      >
        Ir a armio.co
      </a>
    </div>
  );
}
