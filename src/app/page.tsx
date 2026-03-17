import ComingSoon from "@/components/ComingSoon";
import { landingEnabled } from "@/lib/flags";
import Hero from "@/components/sections/Hero";
import ProblemSolution from "@/components/sections/ProblemSolution";
import ProductPreview from "@/components/sections/ProductPreview";
import HowItWorks from "@/components/sections/HowItWorks";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/layout/Footer";

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

export default async function Home() {
  const isLandingEnabled = await landingEnabled();

  if (!isLandingEnabled) {
    return <ComingSoon />;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <Hero />
        <ProblemSolution />
        <ProductPreview />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
