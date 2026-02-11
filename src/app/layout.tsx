import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { OrganizationSchema, WebSiteSchema } from "@/components/SchemaOrg";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fluxco.com"),
  title: {
    default: "FluxCo | In-Stock Padmount & Substation Transformers | Transformer Broker",
    template: "%s | FluxCo",
  },
  description:
    "America's transformer marketplace. Buy in-stock padmount, substation, and distribution transformers from 100+ global suppliers. Full EPC services, DOE 2027 compliant, fast delivery.",
  keywords: [
    "buy transformers",
    "padmount transformer for sale",
    "substation transformer supplier",
    "distribution transformer for sale",
    "power transformer broker",
    "transformer marketplace",
    "transformer RFQ",
    "in-stock transformers",
    "DOE 2027 compliant transformers",
    "FEOC compliant transformers",
    "transformer procurement",
    "EPC transformer services",
    "data center transformers",
    "renewable energy transformers",
    "transformer lead times",
    "Made in USA transformers",
  ],
  openGraph: {
    title: "FluxCo | America's Transformer Marketplace",
    description:
      "Buy in-stock padmount, substation, and distribution transformers from 100+ global suppliers. Full EPC services with fast delivery.",
    type: "website",
    locale: "en_US",
    siteName: "FluxCo",
    url: "https://fluxco.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "FluxCo | In-Stock Transformers",
    description:
      "America's transformer marketplace. In-stock inventory from 100+ global suppliers.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://fluxco.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <OrganizationSchema />
        <WebSiteSchema />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
