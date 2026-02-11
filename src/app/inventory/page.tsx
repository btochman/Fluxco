import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import InventorySection from "@/components/InventorySection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "In-Stock Transformer Inventory | Padmount, Substation & Distribution | FluxCo",
  description:
    "Browse FluxCo's real-time transformer inventory. In-stock padmount, substation, distribution, and dry-type transformers with fast delivery. Get a quote today.",
  keywords: [
    "buy padmount transformer",
    "transformer inventory",
    "in-stock transformers",
    "padmount transformer for sale",
    "distribution transformer for sale",
    "substation transformer in stock",
    "transformer supplier",
    "transformers for sale",
  ],
  openGraph: {
    title: "In-Stock Transformer Inventory | FluxCo",
    description:
      "Browse real-time transformer inventory. In-stock padmount, substation, and distribution transformers with fast delivery.",
    type: "website",
  },
};

export default function InventoryPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="fixed bottom-4 right-4 z-50 text-2xl" title="Made in USA">🇺🇸</div>
      <div className="pt-20">
        <InventorySection />
      </div>
      <Footer />
    </main>
  );
}
