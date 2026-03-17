import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://armio.co"),
  title: "Armio — El sistema operativo de tu agencia inmobiliaria",
  description:
    "Armio centraliza propiedades, leads y contratos para agencias inmobiliarias en Colombia. Deja atrás el Excel y el WhatsApp. Muy pronto.",
  keywords: [
    "software inmobiliario Colombia",
    "CRM inmobiliario",
    "gestión agencia inmobiliaria",
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
    title: "Armio — El sistema operativo de tu agencia inmobiliaria",
    description:
      "Armio centraliza propiedades, leads y contratos para agencias inmobiliarias en Colombia. Deja atrás el Excel y el WhatsApp. Muy pronto.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Armio — El sistema operativo de tu agencia inmobiliaria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Armio — El sistema operativo de tu agencia inmobiliaria",
    description:
      "Software para agencias inmobiliarias en Colombia. Propiedades, leads y contratos en un solo lugar.",
    images: ["/og-image.png"],
    creator: "@armioapp",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${plusJakartaSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
