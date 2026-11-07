import type { Metadata } from "next";
import Breadcrumbs from "@/portal/components/Breadcrumbs";
import { getProfile, loadProfile } from "@/portal/lib/api";
import { httpsUrl } from "@/portal/lib/format";
import { portalPath, portalUrl } from "@/portal/lib/urls";
import { buildMetadata } from "@/portal/lib/seo";
import { turnstileSiteKey } from "@/portal/lib/turnstile";

type Props = { params: Promise<{ tenant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params;
  const result = await loadProfile(tenant);
  if (result.kind !== "ok") return { robots: { index: false, follow: false } };
  return buildMetadata({
    title: `Aviso de privacidad | ${result.data.name}`,
    description: `Cómo ${result.data.name} trata tus datos personales conforme a la Ley 1581 de 2012.`,
    url: portalUrl(result.data.slug, "/privacidad"),
    siteName: result.data.name,
  });
}

const RIGHTS = [
  "Conocer, actualizar y rectificar tus datos personales.",
  "Solicitar prueba de la autorización que nos diste.",
  "Ser informado sobre el uso que se ha dado a tus datos.",
  "Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.",
  "Revocar la autorización y/o solicitar la supresión de tus datos cuando no se respeten los principios, derechos y garantías legales.",
  "Acceder en forma gratuita a tus datos personales que hayan sido objeto de tratamiento.",
];

export default async function PrivacyPage({ params }: Props) {
  const { tenant } = await params;
  const profile = await getProfile(tenant, (slug) => portalUrl(slug, "/privacidad"));
  const responsible = profile.privacy.responsible_name || profile.name;
  const email = profile.privacy.contact_email || profile.contact.email;
  const policyUrl = httpsUrl(profile.privacy.policy_url);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[{ label: "Inicio", href: portalPath() }, { label: "Aviso de privacidad" }]}
      />
      <h1 className="mt-4 text-3xl font-bold text-stone-900">Aviso de privacidad</h1>
      <p className="mt-2 text-sm text-stone-600">
        Tratamiento de datos personales conforme a la Ley 1581 de 2012 y sus decretos
        reglamentarios.
      </p>

      <div className="mt-8 space-y-8 text-stone-800 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-stone-900 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        <section>
          <h2>Responsable del tratamiento</h2>
          <p>
            El Responsable del tratamiento de tus datos personales es <strong>{responsible}</strong>
            {email ? (
              <>
                , con correo de contacto para asuntos de datos personales{" "}
                <a href={`mailto:${email}`} className="underline">
                  {email}
                </a>
                .
              </>
            ) : (
              "."
            )}
          </p>
          <p>
            Armio (armio.co) actúa como <strong>Encargado del tratamiento</strong>: provee la
            plataforma tecnológica donde se almacenan y gestionan tus datos, siguiendo las
            instrucciones del Responsable.
          </p>
        </section>

        <section>
          <h2>Datos que recolectamos</h2>
          <p>
            Cuando completas el formulario de interés recolectamos tu nombre, teléfono, correo
            electrónico (opcional) y el mensaje que decidas escribir, junto con la propiedad por la
            que preguntas. Este sitio no usa herramientas de analítica ni cookies publicitarias.
          </p>
        </section>

        {turnstileSiteKey() && (
          <section>
            <h2>Seguridad del formulario</h2>
            <p>
              Para proteger este formulario contra envíos automatizados usamos Cloudflare Turnstile,
              un servicio de Cloudflare, Inc. Cuando interactúas con el formulario, Cloudflare
              recibe datos técnicos de tu navegador y de tu conexión (como la dirección IP, el tipo
              de navegador y otras señales del dispositivo) con el único fin de comprobar que el
              envío lo hace una persona. Estos datos no se usan para publicidad ni para crear
              perfiles, y no se comparten con la inmobiliaria. Cloudflare actúa como Encargado del
              tratamiento para esta finalidad y puede procesar los datos fuera de Colombia, con las
              garantías descritas en su{" "}
              <a
                href="https://www.cloudflare.com/turnstile-privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                aviso de privacidad de Turnstile
              </a>
              . Si la verificación no se puede completar, puedes contactar a la inmobiliaria por
              WhatsApp o teléfono.
            </p>
          </section>
        )}

        <section>
          <h2>Finalidades</h2>
          <ul>
            <li>
              Atender tu consulta y contactarte por teléfono, WhatsApp o correo sobre el inmueble de
              tu interés.
            </li>
            <li>
              Gestionar la relación comercial derivada de tu consulta (visitas, ofertas,
              negociación).
            </li>
            <li>Llevar el registro de tu autorización y cumplir obligaciones legales.</li>
            <li>
              Solo si lo autorizas de forma separada: enviarte ofertas y novedades de propiedades de
              esta inmobiliaria.
            </li>
          </ul>
        </section>

        <section>
          <h2>Tus derechos como titular</h2>
          <p>Como titular de los datos tienes derecho a:</p>
          <ul>
            {RIGHTS.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p>
            Para ejercerlos, escribe a{" "}
            {email ? (
              <a href={`mailto:${email}`} className="underline">
                {email}
              </a>
            ) : (
              "la inmobiliaria por los canales de contacto de este sitio"
            )}{" "}
            indicando tu nombre, tu teléfono y lo que solicitas. En este sitio no se solicitan datos
            sensibles.
          </p>
        </section>

        <section>
          <h2>Conservación</h2>
          <p>
            Conservamos tus datos mientras sea necesario para las finalidades descritas o mientras
            la ley lo exija. Puedes solicitar su supresión en cualquier momento, salvo que exista un
            deber legal o contractual de mantenerlos.
          </p>
        </section>

        {policyUrl && (
          <section>
            <h2>Política de tratamiento completa</h2>
            <p>
              Puedes consultar la política completa de {responsible} en{" "}
              <a
                href={policyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline"
              >
                {policyUrl}
              </a>
              .
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
