import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "react-hot-toast";
import MotionProvider from "@/components/providers/MotionProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://armio.co"),
  title: "Armio — Propiedades, leads y contratos en un solo lugar",
  description:
    "Armio centraliza propiedades, leads y contratos para independientes y agencias inmobiliarias en Colombia. Deja atrás el Excel y el WhatsApp.",
  keywords: [
    "software inmobiliario Colombia",
    "CRM inmobiliario",
    "gestión agencia inmobiliaria",
    "software para asesores inmobiliarios",
    "proptech Colombia",
    "sistema inmobiliario",
    "Armio",
  ],
  authors: [{ name: "Armio", url: "https://armio.co" }],
  creator: "Armio",
  publisher: "Armio",
  alternates: {
    canonical: "https://armio.co",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://armio.co",
    siteName: "Armio",
    title: "Armio — Propiedades, leads y contratos en un solo lugar",
    description:
      "Armio centraliza propiedades, leads y contratos para independientes y agencias inmobiliarias en Colombia. Deja atrás el Excel y el WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Armio — Propiedades, leads y contratos en un solo lugar",
    description:
      "Software para independientes y agencias inmobiliarias en Colombia. Propiedades, leads y contratos en un solo lugar.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Armio",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://armio.co",
  offers: {
    "@type": "Offer",
    price: "49",
    priceCurrency: "USD",
    priceValidUntil: "2026-12-31",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "100",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Armio",
  url: "https://armio.co",
  logo: "https://armio.co/opengraph-image",
  contactPoint: {
    "@type": "ContactPoint",
    email: "hola@armio.co",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
  sameAs: ["https://instagram.com/armioapp"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className={`${plusJakartaSans.variable} ${fraunces.variable} antialiased`}>
        <MotionProvider>{children}</MotionProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#161B22",
              color: "#F0F6FC",
              border: "1px solid #21262D",
            },
          }}
        />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
    </html>
  );
}
