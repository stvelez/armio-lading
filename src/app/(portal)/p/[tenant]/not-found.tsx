import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

/** Genérico: no revela si la inmobiliaria o la propiedad existen. */
export default function PortalNotFound() {
  return (
    <div className="state">
      <p className="eyebrow-plain">Error 404</p>
      <h1>No encontramos esta página</h1>
      <p>
        Es posible que el enlace esté incompleto, que la propiedad ya no esté disponible o que la
        dirección haya cambiado.
      </p>
      <a href="https://armio.co" className="btn btn-primary btn-lg">
        Ir a armio.co
      </a>
    </div>
  );
}
