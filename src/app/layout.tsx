import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FluxCo | In-Stock Padmount & Substation Transformers",
  description: "Your complete transformer partner. Full engineering, procurement & construction services through a single trusted source. In-stock inventory with competitive lead times.",
  keywords: ["transformers", "padmount transformers", "substation transformers", "power transformers", "EPC services", "transformer procurement"],
  openGraph: {
    title: "FluxCo | In-Stock Padmount & Substation Transformers",
    description: "Your complete transformer partner. Full engineering, procurement & construction services.",
    type: "website",
    locale: "en_US",
    siteName: "FluxCo",
  },
  twitter: {
    card: "summary_large_image",
    title: "FluxCo | In-Stock Transformers",
    description: "Your complete transformer partner. Full EPC services.",
  },
  robots: {
    index: true,
    follow: true,
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
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
