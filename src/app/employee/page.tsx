import Navbar from "@/components/Navbar";
import EmployeeDashboard from "@/components/employee/EmployeeDashboard";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Employee Portal | FluxCo",
  description: "FluxCo employee dashboard for managing transformer projects, quotes, and orders.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmployeePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="fixed bottom-4 right-4 z-50 text-2xl" title="Made in USA">🇺🇸</div>
      <div className="pt-20">
        <EmployeeDashboard />
      </div>
      <Footer />
    </main>
  );
}
