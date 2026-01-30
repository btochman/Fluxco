import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbSchema } from "@/components/SchemaOrg";
import { getArticleBySlug, getAllArticles, Article } from "@/data/articles";
import { ArrowLeft, BookOpen, Wrench, TrendingUp, Calendar, Clock } from "lucide-react";

// Generate static params for all articles
export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// Generate metadata for each article
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found | FluxCo",
    };
  }

  return {
    title: `${article.title} | FluxCo`,
    description: article.description,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
    },
  };
}

const categoryInfo = {
  guides: {
    label: "Buyer's Guide",
    icon: BookOpen,
    color: "bg-primary",
  },
  technical: {
    label: "Technical",
    icon: Wrench,
    color: "bg-blue-600",
  },
  industry: {
    label: "Industry",
    icon: TrendingUp,
    color: "bg-green-600",
  },
};

// Simple markdown-like content renderer
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-6 mb-6 space-y-2">
          {listItems.map((item, i) => (
            <li key={i} className="text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(2); // Skip header and separator
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {header.map((cell, i) => (
                  <th
                    key={i}
                    className="text-left py-3 px-4 font-medium text-foreground"
                  >
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, i) => (
                <tr key={i} className="border-b border-border">
                  {row.map((cell, j) => (
                    <td key={j} className="py-3 px-4 text-muted-foreground">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.startsWith("|")) {
      flushList();
      inTable = true;
      const cells = line.split("|").filter((c) => c.trim() !== "");
      if (!line.includes("---")) {
        tableRows.push(cells);
      } else {
        tableRows.push(cells); // Keep separator for processing
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={`h2-${i}`}
          className="font-display text-2xl text-foreground mt-10 mb-4"
        >
          {line.replace("## ", "")}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={`h3-${i}`}
          className="font-display text-xl text-foreground mt-8 mb-3"
        >
          {line.replace("### ", "")}
        </h3>
      );
      continue;
    }

    // Bold text handling
    const processBold = (text: string) => {
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    // List items
    if (line.startsWith("- ")) {
      inList = true;
      listItems.push(line.replace("- ", ""));
      continue;
    } else if (inList && line.trim() === "") {
      flushList();
      continue;
    } else if (inList) {
      flushList();
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, "");
      elements.push(
        <p key={`num-${i}`} className="text-muted-foreground mb-2 pl-6">
          {processBold(text)}
        </p>
      );
      continue;
    }

    // Links
    if (line.includes("[") && line.includes("](")) {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = line.split(linkRegex);
      elements.push(
        <p key={`p-${i}`} className="text-muted-foreground mb-4">
          {parts.map((part, j) => {
            if (j % 3 === 1) {
              const href = parts[j + 1];
              return (
                <Link
                  key={j}
                  href={href}
                  className="text-primary hover:underline"
                >
                  {part}
                </Link>
              );
            } else if (j % 3 === 2) {
              return null;
            }
            return processBold(part);
          })}
        </p>
      );
      continue;
    }

    // Regular paragraphs
    if (line.trim() !== "") {
      elements.push(
        <p key={`p-${i}`} className="text-muted-foreground mb-4">
          {processBold(line)}
        </p>
      );
    }
  }

  flushList();
  flushTable();

  return elements;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const category = categoryInfo[article.category];
  const CategoryIcon = category.icon;

  // Get related articles (same category, excluding current)
  const relatedArticles = getAllArticles()
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  // Article schema for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Organization",
      name: "FluxCo",
    },
    publisher: {
      "@type": "Organization",
      name: "FluxCo",
      url: "https://fluxco.com",
    },
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://fluxco.com" },
          { name: "Resources", url: "https://fluxco.com/resources" },
          { name: article.title, url: `https://fluxco.com/resources/${article.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Article Header */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/resources"
              className="hover:text-primary transition-colors"
            >
              Resources
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">
              {article.title}
            </span>
          </nav>

          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Link>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 ${category.color} text-white text-xs font-medium px-2.5 py-1 rounded-full`}
              >
                <CategoryIcon className="w-3 h-3" />
                {category.label}
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              {article.title}
            </h1>

            <p className="text-muted-foreground text-lg mb-6">
              {article.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <article className="prose-custom">
              {renderContent(article.content)}
            </article>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <h2 className="font-display text-2xl text-foreground mb-8">
              Related Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/resources/${related.slug}`}
                  className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
                >
                  <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {related.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Our team can help you find the right transformer for your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/inventory"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Browse Inventory
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-3 rounded-lg font-medium hover:border-primary/50 transition-colors"
            >
              Request Quote
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
