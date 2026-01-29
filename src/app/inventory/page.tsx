import Navbar from "@/components/Navbar";
import InventorySection from "@/components/InventorySection";
import Footer from "@/components/Footer";

export default function InventoryPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <InventorySection />
      </div>
      <Footer />
    </main>
  );
}
