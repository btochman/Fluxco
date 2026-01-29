import Navbar from "@/components/Navbar";
import JobsSection from "@/components/JobsSection";
import Footer from "@/components/Footer";

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <JobsSection />
      </div>
      <Footer />
    </main>
  );
}
