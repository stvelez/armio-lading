import type { Metadata } from "next";
import { cookiesUrl } from "@/lib/legal";
import { siteRobotsMetadata } from "@/lib/robots";

export const metadata: Metadata = {
  metadataBase: new URL("https://armio.co"),
  title: "Política de cookies",
  description:
    "¿Qué trazamos con cookies y otros identificadores al navegar por armio.co? Consulta cómo gestionamos tu consentimiento según la Ley 1581 de 2012.",
  keywords: ["cookies", "privacidad", "Ley 1581", "consentimiento", "GA4"],
  alternates: { canonical: cookiesUrl },
  robots: siteRobotsMetadata(),
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: cookiesUrl,
    siteName: "Armio",
    title: "Política de cookies",
    description:
      "¿Qué trazamos con cookies y otros identificadores? Consulta cómo gestionamos tu consentimiento según la Ley 1581 de 2012.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Política de cookies",
    description:
      "¿Qué trazamos con cookies y otros identificadores? Consulta cómo gestionamos tu consentimiento según la Ley 1581 de 2012.",
  },
};

const steps = [
  {
    title: "Cookies necesarias o estrictamente necesarias",
    text: "Permiten el funcionamiento esencial del sitio: navegación, sesiones, seguridad básica y que puedas acceder a partes reservadas. No almacenan datos de identificación personal de forma persistente y no requieren tu consentimiento.",
  },
  {
    title: "Cookies de analítica",
    text: "Usamos Google Analytics 4 (GA4) para entender cómo llegas al sitio, qué secciones visitas y dónde te quedas, con el fin de mejorar la experiencia. Solo se cargan cuando aceptas el tratamiento de analítica en el aviso de cookies del sitio. Si lo rechazas, no se envía ningún dato a GA4. Hasta hace poco también usábamos Vercel Analytics; lo retiramos en el proceso de limpieza de rastreadores, por lo que esta es la única herramienta de medición que seguimos.",
  },
  {
    title: "Cookies de funcionalidad y preferencias",
    text: "Permiten recordar opciones que personalizan la experiencia (idioma, estado de sesión, preferencias de formulario). No se usan a efectos publicitarios.",
  },
  {
    title: "Cookies publicitarias",
    text: "No configuramos cookies publicitarias ni de terceros para mostrar anuncios. No vendemos, compartimos ni transferimos tus datos de navegación a proveedores de publicidad.",
  },
];

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-stone-500">
          <li>
            <a href="https://armio.co" className="hover:text-white">
              armio.co
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-stone-700">Cookies</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold text-stone-900">Política de cookies</h1>

      <p className="mt-3 text-sm text-stone-600">
        Esta política explica qué trazamos con cookies y otros identificadores al navegar por{" "}
        <strong>armio.co</strong>, qué usamos y cómo puedes revisar o revocar tu consentimiento.
        Para cualquier asunto de datos personales, consulta nuestra{" "}
        <a href="https://armio.co/privacidad" className="underline hover:text-white">
          Política de privacidad
        </a>
        .
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">
          ¿Qué son las cookies y por qué las usamos?
        </h2>
        <p className="mt-2 text-stone-300">
          Las cookies son pequeños archivos de texto que el servidor envía a tu navegador y que se
          guardan en tu dispositivo. Nos sirven para que el sitio funcione, para entender cómo lo
          vas usando y para recordar tus preferencias. Según la <strong>Ley 1581 de 2012</strong> y
          sus decretos reglamentarios, las categorías que no requieren tu consentimiento previo
          tienen que estar bien justificadas y son estrictamente necesarias.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-stone-900">Categorías de cookies y finalidad</h2>
        <div className="mt-4 space-y-6">
          {steps.map((s) => (
            <div key={s.title} className="rounded-xl border border-stone-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-stone-900">{s.title}</h3>
              <p className="mt-2 text-stone-700">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-stone-900">
          ¿El portal inmobiliario de cada inmobiliaria?
        </h2>
        <p className="mt-2 text-stone-700">
          El portal público (donde cada inmobiliaria publica sus propiedades y recibe intereses)
          tiene un tratamiento diferente y más conservador:
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-stone-700">
          <li>No usa cookies publicitarias ni de terceros.</li>
          <li>
            Solo cuenta visitas de forma <strong>agregada y anónima</strong>: cuántas veces se vio
            cada página o inmueble por día y de qué tipo de sitio se llegó, sin guardar tu IP,
            navegador, perfil ni identificador.
          </li>
          <li>
            La cuenta se hace internamente y sin cookies; la única marca que puede quedar en tu
            navegador es técnica, de sesión y sirve para excluir las visitas del propio equipo de la
            inmobiliaria.
          </li>
        </ul>
        <p className="mt-3 text-stone-700">
          Cada portal publica su propio aviso de privacidad en{" "}
          <code>{"{inmobiliaria}"}.armio.co/privacidad</code>.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-stone-900">
          ¿Cómo gestionamos y revocamos tu consentimiento?
        </h2>
        <p className="mt-2 text-stone-700">
          El aviso de cookies que aparece la primera vez que entras te permite aceptar o rechazar
          las categorías de analítica y, en su caso, funcionalidad. Tu decisión se guarda en tu
          navegador de forma opcional y se aplica a esa visita. Puedes revocar o cambiar tu
          consentimiento en cualquier momento, por ejemplo:
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-stone-700">
          <li>
            Vía el aviso de cookies que aparece la primera vez (y en cada visita); solo allí hay un
            control activo.
          </li>
          <li>
            Usando las opciones de configuración de cookies de tu navegador (Chrome, Firefox,
            Safari, Edge, etc.).
          </li>
          <li>
            Contactando al Responsable del tratamiento, vía el email indicado en nuestra{" "}
            <a href="https://armio.co/privacidad" className="underline hover:text-white">
              Política de privacidad
            </a>
            .
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-stone-900">
          ¿Cuánto tiempo conservamos la información?
        </h2>
        <p className="mt-2 text-stone-700">
          Las cookies técnicas de sesión se borran cuando cierras el navegador. Las que deciden tu
          consentimiento persisten hasta que los borras o revocas el tratamiento. Los datos de
          analítica de GA4 se conservan según la configuración de Google según el horizonte
          recomendado y no se usan para identificar a una persona concreta.
        </p>
      </section>

      <section className="mt-10 border-t border-stone-200 pt-8 text-sm text-stone-500">
        <p>
          Esta política fue elaborada a modo orientativo y no sustituye la asesoría de un abogado.
          Para cualquier consulta sobre el tratamiento de tus datos, escríbenos a{" "}
          <a href="mailto:hola@armio.co" className="underline hover:text-white">
            hola@armio.co
          </a>
          .
        </p>
      </section>
    </div>
  );
}
