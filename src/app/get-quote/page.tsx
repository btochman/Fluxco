import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbSchema } from "@/components/SchemaOrg";
import QuoteForm from "./QuoteForm";

export const metadata: Metadata = {
  title: "Request a Transformer Quote | RFQ | FluxCo",
  description:
    "Submit a transformer RFQ and get quotes from 100+ global suppliers in one step. Padmount, substation, distribution, and dry-type transformers with competitive lead times.",
  keywords: [
    "transformer RFQ",
    "transformer quote",
    "request for quote transformer",
    "transformer pricing",
    "buy transformer quote",
    "padmount transformer quote",
    "power transformer RFQ",
    "transformer procurement",
    "get transformer quote",
  ],
  openGraph: {
    title: "Request a Transformer Quote | FluxCo",
    description:
      "Submit one RFQ, get quotes from 100+ global suppliers. Padmount, substation, distribution, and dry-type transformers.",
    type: "website",
  },
};

export default function GetQuotePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://fluxco.com" },
          { name: "Get Quote", url: "https://fluxco.com/get-quote" },
        ]}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            <span>/</span>
            <span className="text-foreground">Get Quote</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              Request a Transformer Quote
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              One RFQ. 100+ suppliers. Tell us what you need and we&apos;ll
              find the right transformer at the best price with the fastest
              delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Form + Benefits Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left: Benefits */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl text-foreground mb-6">
                  Why Source Through FluxCo?
                </h2>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">
                        One Call, Global Access
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Instead of contacting 5+ suppliers individually, we
                        search our entire network to find the best match for
                        your specs, timeline, and budget.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">
                        In-Stock Inventory
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Many standard configurations available for immediate
                        delivery — 1-2 weeks from our stockyard network vs.
                        months for new builds.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">
                        Full EPC Services
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Engineering, procurement, logistics, installation,
                        commissioning, and lifetime support — all through a
                        single partner.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">
                        Compliance Ready
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        DOE 2027 efficiency standards, FEOC compliance, and
                        domestic content documentation — we handle the
                        regulatory complexity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">100+</div>
                  <div className="text-muted-foreground text-sm">
                    Global Suppliers
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">1,200+</div>
                  <div className="text-muted-foreground text-sm">
                    RFQs Processed
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">24hr</div>
                  <div className="text-muted-foreground text-sm">
                    Response Time
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">1-2 wk</div>
                  <div className="text-muted-foreground text-sm">
                    In-Stock Delivery
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
