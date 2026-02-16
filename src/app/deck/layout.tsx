import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FluxCo | Rebuilding American Power",
  description: "FluxCo pitch deck — rebuilding American power infrastructure.",
  robots: { index: false, follow: false },
};

export default function DeckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
