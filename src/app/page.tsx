import ComingSoon from "@/components/ComingSoon";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Armio",
  url: "https://armio.co",
  logo: "https://armio.co/og-image.png",
  description:
    "El sistema operativo de tu agencia inmobiliaria. Software para centralizar propiedades, leads y contratos en agencias inmobiliarias de Colombia.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "hola@armio.co",
    contactType: "customer support",
    availableLanguage: "Spanish",
  },
  areaServed: {
    "@type": "Country",
    name: "Colombia",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ComingSoon />
    </>
  );
}
