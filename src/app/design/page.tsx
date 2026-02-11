import type { Metadata } from "next";
import { TransformerDesigner } from '@/components/transformer/TransformerDesigner';

export const metadata: Metadata = {
  title: "Transformer Designer Tool | Spec & Size Your Transformer | FluxCo",
  description:
    "Use FluxCo's interactive transformer designer to spec and size the right transformer for your project. Select voltage, kVA rating, cooling class, and more.",
  keywords: [
    "transformer sizing tool",
    "transformer specification builder",
    "transformer designer",
    "what size transformer do I need",
    "transformer kVA calculator",
    "transformer spec sheet",
  ],
  openGraph: {
    title: "Transformer Designer Tool | FluxCo",
    description:
      "Spec and size the right transformer for your project with FluxCo's interactive designer.",
    type: "website",
  },
};

export default function DesignPage() {
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 text-2xl" title="Made in USA">🇺🇸</div>
      <TransformerDesigner />
    </>
  );
}
