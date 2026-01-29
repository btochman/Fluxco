import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ProductsSection from '@/components/ProductsSection';
import InventoryPreview from '@/components/InventoryPreview';
import TechnologySection from '@/components/TechnologySection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="fixed bottom-4 right-4 z-50 text-2xl" title="Made in USA">🇺🇸</div>
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <InventoryPreview />
      <TechnologySection />
      <ContactSection />
      <Footer />
    </main>
  );
}
