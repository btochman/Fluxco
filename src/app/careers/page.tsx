import Navbar from "@/components/Navbar";
import JobsSection from "@/components/JobsSection";
import Footer from "@/components/Footer";

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="fixed bottom-4 right-4 z-50 text-2xl" title="Made in USA">🇺🇸</div>
      <div className="pt-20">
        <JobsSection />
      </div>
      <Footer />
    </main>
  );
}
