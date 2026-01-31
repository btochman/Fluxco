import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ArticleTicker from '@/components/ArticleTicker';
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
      <ArticleTicker />
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border px-3 py-1.5 rounded-full shadow-lg" title="Made in USA">
        <div className="flex gap-0.5">
          <div className="w-1.5 h-4 bg-[hsl(348,74%,40%)] rounded-sm" />
          <div className="w-1.5 h-4 bg-white rounded-sm" />
          <div className="w-1.5 h-4 bg-primary rounded-sm" />
        </div>
        <span className="text-xs font-display tracking-wider text-foreground">MADE IN USA</span>
      </div>
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
