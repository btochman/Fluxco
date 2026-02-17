import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "FluxCo | Rebuilding American Power",
  description: "FluxCo pitch deck — rebuilding American power infrastructure.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function DeckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
