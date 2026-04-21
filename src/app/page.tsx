import dynamic from "next/dynamic";
import ScrollDepthTracker from "@/components/analytics/ScrollDepthTracker";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import ComingSoon from "@/components/ComingSoon";
import ExitIntentLoader from "@/components/sections/ExitIntentLoader";

// Below-the-fold sections — lazy loaded for faster initial bundle
const Features = dynamic(() => import("@/components/sections/Features"), {
  loading: () => <div className="h-96 animate-pulse bg-[#1A1A18]" />,
});
const Benefits = dynamic(() => import("@/components/sections/Benefits"), {
  loading: () => <div className="h-80 animate-pulse bg-white" />,
});
const TrustBar = dynamic(() => import("@/components/sections/TrustBar"), {
  loading: () => <div className="h-20 animate-pulse bg-[#F1EFE8]" />,
});
const ProblemSolution = dynamic(() => import("@/components/sections/ProblemSolution"), {
  loading: () => <div className="h-96 animate-pulse bg-white" />,
});
const ProductPreview = dynamic(() => import("@/components/sections/ProductPreview"), {
  loading: () => <div className="h-96 animate-pulse bg-[#1A1A18]" />,
});
const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks"), {
  loading: () => <div className="h-80 animate-pulse bg-white" />,
});
// TODO: Habilitar cuando tengamos testimonios reales
// const Testimonials = dynamic(() => import("@/components/sections/Testimonials"), {
//   loading: () => <div className="h-80 animate-pulse bg-[#F1EFE8]" />,
// });
const Pricing = dynamic(() => import("@/components/sections/Pricing"), {
  loading: () => <div className="h-96 animate-pulse bg-white" />,
});
const FAQ = dynamic(() => import("@/components/sections/FAQ"), {
  loading: () => <div className="h-80 animate-pulse bg-[#F8F7F2]" />,
});
const CTA = dynamic(() => import("@/components/sections/CTA"), {
  loading: () => <div className="h-80 animate-pulse bg-[#1D9E75]" />,
});
const Footer = dynamic(() => import("@/components/layout/Footer"), {
  loading: () => <div className="h-40 animate-pulse bg-[#1A1A18]" />,
});

// Organization + SoftwareApplication schemas are injected globally in layout.tsx (ARM-65)

export default function Home() {
  const isLandingEnabled = process.env.NEXT_PUBLIC_LANDING_ENABLED === "true";

  if (!isLandingEnabled) {
    return <ComingSoon />;
  }

  return (
    <>
      <Header />
      <main id="main-content">
        <ScrollDepthTracker />
        <Hero />
        <Features />
        <Benefits />
        <TrustBar />
        <ProblemSolution />
        <ProductPreview />
        <HowItWorks />
        {/* TODO: Habilitar cuando tengamos testimonios reales */}
        {/* <Testimonials /> */}
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <ExitIntentLoader />
    </>
  );
}
