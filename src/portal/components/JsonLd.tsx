import { safeJsonLd } from "../lib/format";

/** JSON-LD con `<` escapado (`<`) para que ningún dato pueda cerrar la etiqueta script. */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}
