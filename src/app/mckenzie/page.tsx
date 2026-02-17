"use client";

export default function McKenziePage() {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80",
      alt: "Vintage golf clubs on grass",
    },
    {
      src: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80",
      alt: "Classic golf club heads",
    },
    {
      src: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&q=80",
      alt: "Antique golf equipment",
    },
    {
      src: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=800&q=80",
      alt: "Wooden golf clubs close-up",
    },
    {
      src: "https://images.unsplash.com/photo-1632932693684-b tried0b4e3c1?w=800&q=80",
      alt: "Hickory shafted irons",
    },
    {
      src: "https://images.unsplash.com/photo-1600178596850-45790389daab?w=800&q=80",
      alt: "Golf club collection display",
    },
    {
      src: "https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=800&q=80",
      alt: "Vintage golf bag with hickory clubs",
    },
    {
      src: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&q=80",
      alt: "Old golf club wooden shafts",
    },
    {
      src: "https://images.unsplash.com/photo-1542766788-a2f588f447ee?w=800&q=80",
      alt: "Classic golf scene",
    },
    {
      src: "https://images.unsplash.com/photo-1580109672840-4730c0686b59?w=800&q=80",
      alt: "Antique golf club set",
    },
    {
      src: "https://images.unsplash.com/photo-1633078654544-61b3455b9161?w=800&q=80",
      alt: "Hickory golf wood club",
    },
    {
      src: "https://images.unsplash.com/photo-1591491634056-f10e9081b72d?w=800&q=80",
      alt: "Vintage golf equipment detail",
    },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="mck-page">
        <header className="mck-header">
          <h1 className="mck-title">Hickory Golf Clubs</h1>
          <p className="mck-subtitle">A collection of beautiful hickory-shafted golf clubs</p>
        </header>
        <div className="mck-grid">
          {images.map((img, i) => (
            <div key={i} className="mck-card">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="mck-caption">{img.alt}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const styles = `
  .mck-page {
    min-height: 100vh;
    background: #0a0a0a;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 60px 24px 80px;
  }

  .mck-header {
    text-align: center;
    margin-bottom: 48px;
  }

  .mck-title {
    font-size: 48px;
    font-weight: 700;
    margin: 0 0 12px;
    letter-spacing: -1px;
  }

  .mck-subtitle {
    font-size: 18px;
    color: rgba(255,255,255,0.5);
    margin: 0;
  }

  .mck-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .mck-card {
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    transition: transform 0.3s, border-color 0.3s;
  }

  .mck-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255,255,255,0.2);
  }

  .mck-card img {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
  }

  .mck-caption {
    padding: 14px 16px;
    font-size: 14px;
    color: rgba(255,255,255,0.6);
  }

  @media (max-width: 640px) {
    .mck-page { padding: 40px 16px 60px; }
    .mck-title { font-size: 32px; }
    .mck-grid { grid-template-columns: 1fr; }
  }
`;
