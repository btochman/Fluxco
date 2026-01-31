import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbSchema } from "@/components/SchemaOrg";
import { getAllArticles, Article } from "@/data/articles";
import { ArrowRight, BookOpen, Wrench, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Transformer Resources & Guides | FluxCo",
  description:
    "Educational resources for transformer buyers: sizing guides, technical specifications, industry trends, and expert advice on selecting and procuring transformers.",
  keywords: [
    "transformer guide",
    "transformer resources",
    "transformer sizing",
    "transformer specifications",
    "transformer buying guide",
  ],
  openGraph: {
    title: "Transformer Resources & Guides | FluxCo",
    description:
      "Educational resources for transformer buyers: sizing guides, technical specifications, and industry trends.",
    type: "website",
  },
};

const categoryInfo = {
  guides: {
    label: "Buyer's Guides",
    icon: BookOpen,
    description: "Step-by-step guides for selecting and specifying transformers",
    color: "bg-primary",
  },
  technical: {
    label: "Technical Resources",
    icon: Wrench,
    description: "Deep dives into transformer specifications and standards",
    color: "bg-blue-600",
  },
  industry: {
    label: "Industry Insights",
    icon: TrendingUp,
    description: "Market trends, supply chain updates, and industry news",
    color: "bg-[hsl(348,74%,40%)]",
  },
};

function ArticleCard({ article }: { article: Article }) {
  const category = categoryInfo[article.category];
  const CategoryIcon = category.icon;

  return (
    <Link
      href={`/resources/${article.slug}`}
      className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1.5 ${category.color} text-white text-xs font-medium px-2.5 py-1 rounded-full`}
        >
          <CategoryIcon className="w-3 h-3" />
          {category.label}
        </span>
        <span className="text-muted-foreground text-xs">{article.readTime}</span>
      </div>
      <h3 className="font-display text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
        {article.title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {article.description}
      </p>
      <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
        Read article <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}

export default function ResourcesPage() {
  const articles = getAllArticles();
  const guides = articles.filter((a) => a.category === "guides");
  const technical = articles.filter((a) => a.category === "technical");
  const industry = articles.filter((a) => a.category === "industry");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://fluxco.com" },
          { name: "Resources", url: "https://fluxco.com/resources" },
        ]}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Resources</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              Transformer Resources & Guides
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Expert guidance on selecting, specifying, and procuring
              transformers. Whether you&apos;re new to transformer procurement or a
              seasoned engineer, our resources help you make informed decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Category Overview */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(categoryInfo).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <a
                  key={key}
                  href={`#${key}`}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 hover:border-primary/50 border border-transparent transition-all cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 ${info.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{info.label}</h3>
                    <p className="text-muted-foreground text-sm">
                      {info.description}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Buyer's Guides */}
      {guides.length > 0 && (
        <section id="guides" className="py-16 scroll-mt-24">
          <div className="container mx-auto px-6">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">
              Buyer&apos;s Guides
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Technical Resources */}
      {technical.length > 0 && (
        <section id="technical" className="py-16 bg-muted/30 scroll-mt-24">
          <div className="container mx-auto px-6">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">
              Technical Resources
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {technical.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Industry Insights */}
      {industry.length > 0 && (
        <section id="industry" className="py-16 scroll-mt-24">
          <div className="container mx-auto px-6">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">
              Industry Insights
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {industry.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl text-foreground mb-4">
            Need Expert Advice?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Our engineering team is ready to help with your specific transformer
            questions. Get personalized guidance for your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-3 rounded-lg font-medium hover:border-primary/50 transition-colors"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
