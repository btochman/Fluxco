"use client";

import Link from "next/link";

interface Article {
  slug: string;
  title: string;
  category: "guides" | "technical" | "industry";
}

const articles: Article[] = [
  {
    slug: "why-buying-transformers-is-so-difficult",
    title: "Why Buying a Transformer Is So Damn Hard",
    category: "industry",
  },
  {
    slug: "is-your-transformer-really-made-in-america",
    title: "Is Your Transformer Really Made in America?",
    category: "industry",
  },
  {
    slug: "transformer-types-explained",
    title: "Transformers 101: Every Type Explained",
    category: "guides",
  },
  {
    slug: "doe-2027-efficiency-standards-transformer-guide",
    title: "DOE 2027: Why Your Standard Transformer Won't Be Legal",
    category: "technical",
  },
  {
    slug: "amorphous-steel-core-transformers",
    title: "Amorphous Steel Cores: The Efficiency Secret",
    category: "technical",
  },
  {
    slug: "ira-tax-credits-transformers-domestic-content",
    title: "Billions in Tax Credits You Might Be Missing",
    category: "industry",
  },
  {
    slug: "why-use-transformer-marketplace",
    title: "RFPs to 5 Suppliers vs. One Search Across 50",
    category: "guides",
  },
  {
    slug: "solid-state-transformers-future-or-hype",
    title: "Solid State Transformers: Future or Hype?",
    category: "technical",
  },
];

const categoryColors = {
  guides: "text-primary",
  technical: "text-blue-400",
  industry: "text-[hsl(348,74%,50%)]",
};

const categoryLabels = {
  guides: "GUIDE",
  technical: "TECHNICAL",
  industry: "INDUSTRY",
};

export default function ArticleTicker() {
  // Double the articles for seamless loop
  const doubledArticles = [...articles, ...articles];

  return (
    <div className="fixed top-20 left-0 right-0 z-40 bg-muted/95 backdrop-blur-sm border-b border-border overflow-hidden">
      <div className="flex items-center h-9">
        {/* Static label */}
        <div className="flex-shrink-0 bg-[hsl(348,74%,40%)] px-4 h-full flex items-center">
          <span className="text-xs font-display font-semibold text-white uppercase tracking-wider whitespace-nowrap">
            Latest Insights
          </span>
        </div>

        {/* Scrolling container */}
        <div className="flex-1 overflow-hidden">
          <div className="animate-ticker flex items-center gap-12 whitespace-nowrap">
            {doubledArticles.map((article, index) => (
              <Link
                key={`${article.slug}-${index}`}
                href={`/resources/${article.slug}`}
                className="group inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${categoryColors[article.category]}`}
                >
                  {categoryLabels[article.category]}
                </span>
                <span className="text-sm text-foreground">
                  {article.title}
                </span>
                <span className="text-muted-foreground mx-4">•</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
