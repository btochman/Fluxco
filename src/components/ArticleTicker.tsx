"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const article = articles[currentIndex];

  return (
    <section className="bg-muted/50 border-b border-border py-3">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center gap-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:block">
            Latest Insights
          </span>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <Link
            href={`/resources/${article.slug}`}
            className="group flex items-center gap-3 overflow-hidden"
          >
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${categoryColors[article.category]}`}
            >
              {categoryLabels[article.category]}
            </span>
            <span
              className={`text-sm text-foreground group-hover:text-primary transition-all duration-300 ${
                isAnimating
                  ? "opacity-0 translate-y-2"
                  : "opacity-100 translate-y-0"
              }`}
            >
              {article.title}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </section>
  );
}
