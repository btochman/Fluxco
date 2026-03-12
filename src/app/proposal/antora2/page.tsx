"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Zap, ArrowRight, ArrowLeft, ChevronDown, Globe, Clock,
  Factory, MapPin, Shield,
} from "lucide-react";

const TOTAL_SECTIONS = 4;

/* ------------------------------------------------------------------ */
/*  Hook: intersection observer for scroll-triggered animations        */
/* ------------------------------------------------------------------ */
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold, root: null }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/*  Animated grid background                                           */
/* ------------------------------------------------------------------ */
function GridBackground() {
  return (
    <div className="ap-grid-bg">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ap-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(45,140,255,0.06)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="ap-grid-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="ap-grid-mask">
            <rect width="100%" height="100%" fill="url(#ap-grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#ap-grid)" mask="url(#ap-grid-mask)" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */
export default function Antora2Proposal() {
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const index = Math.round(container.scrollTop / window.innerHeight);
      setCurrentSection(Math.min(index, TOTAL_SECTIONS - 1));
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        goTo(Math.min(currentSection + 1, TOTAL_SECTIONS - 1));
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(Math.max(currentSection - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSection]);

  const goTo = useCallback((index: number) => {
    containerRef.current?.scrollTo({
      top: index * window.innerHeight,
      behavior: "smooth",
    });
  }, []);

  /* Slide in-view trackers */
  const s1 = useInView(0.3);
  const s2 = useInView(0.2);
  const s3 = useInView(0.2);
  const s4 = useInView(0.2);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <style>{apStyles}</style>

      {/* ---- PROGRESS BAR ---- */}
      <div className="ap-progress">
        {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
          <button
            key={i}
            className={`ap-progress-dot ${i === currentSection ? "active" : ""} ${i < currentSection ? "past" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ---- NAV ---- */}
      <div className="ap-nav">
        <button className="ap-nav-btn" onClick={() => goTo(Math.max(currentSection - 1, 0))} aria-label="Previous">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="ap-nav-count">{String(currentSection + 1).padStart(2, "0")} / {String(TOTAL_SECTIONS).padStart(2, "0")}</span>
        <button className="ap-nav-btn" onClick={() => goTo(Math.min(currentSection + 1, TOTAL_SECTIONS - 1))} aria-label="Next">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {currentSection === 0 && (
        <div className="ap-scroll-hint" onClick={() => goTo(1)}>
          <ChevronDown className="w-5 h-5" />
        </div>
      )}

      <div ref={containerRef} className="ap-container">

        {/* ========== SLIDE 1 — TITLE ========== */}
        <section className="ap-slide" ref={s1.ref}>
          <GridBackground />
          <div className="ap-glow ap-glow-1" />
          <div className="ap-glow ap-glow-2" />
          <div className={`ap-title-content ${s1.inView ? "in" : ""}`}>
            <div className="ap-logo ap-h1-line">
              <div className="ap-logo-icon"><Zap className="w-8 h-8" /></div>
              FLUXCO
            </div>
            <div className="ap-badge ap-h1-line">Procurement Proposal</div>
            <div className="ap-h1">
              <span className="ap-h1-line ap-h1-1">Antora Energy</span>
              <span className="ap-h1-line ap-h1-2">20 MVA eBoiler</span>
            </div>
            <p className="ap-subtitle">
              Procurement update for a <strong>20 MVA eBoiler Transformer</strong> with
              delivery to <strong>Pratt, KS</strong>.
              Target delivery: <strong>November 30, 2026</strong>.
            </p>
            <div className="ap-title-meta">
              <span><MapPin className="w-3.5 h-3.5" /> Pratt, KS</span>
              <span><Clock className="w-3.5 h-3.5" /> Updated March 2026</span>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 2 — PENDING QUOTES ========== */}
        <section className="ap-slide" ref={s2.ref}>
          <div className="ap-glow ap-glow-4" />
          <div className={`ap-content ${s2.inView ? "in" : ""}`}>
            <div className="ap-slide-label">IN PROGRESS</div>
            <h2 className="ap-h2">Pending Quotes</h2>
            <p className="ap-p">Specs have been shared and are under review with the following manufacturers:</p>

            <div className="ap-pending-grid">
              {[
                { name: "Eagle Rise", country: "China", icon: <Globe className="w-5 h-5" /> },
                { name: "Shandong Fudao", country: "China", icon: <Factory className="w-5 h-5" /> },
                { name: "Howard Industries", country: "US", icon: <Factory className="w-5 h-5" /> },
                { name: "International Electric Co (IEC)", country: "South Korea", icon: <Globe className="w-5 h-5" /> },
                { name: "LS Electric", country: "South Korea", icon: <Globe className="w-5 h-5" /> },
                { name: "Bolt Electrical", country: "Mexico / South Korea", icon: <Globe className="w-5 h-5" /> },
                { name: "Toshiba", country: "India", icon: <Globe className="w-5 h-5" /> },
                { name: "Virginia Transformer", country: "US", icon: <Factory className="w-5 h-5" /> },
                { name: "Grupo Edmar", country: "Mexico", icon: <Globe className="w-5 h-5" /> },
                { name: "EFACEC", country: "Portugal", icon: <Globe className="w-5 h-5" /> },
              ].map((s) => (
                <div key={s.name} className="ap-pending-card">
                  <div className="ap-pending-icon">{s.icon}</div>
                  <div>
                    <div className="ap-pending-name">{s.name}</div>
                    <div className="ap-pending-country">{s.country}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SLIDE 3 — OTHER CANDIDATES ========== */}
        <section className="ap-slide ap-slide-table" ref={s3.ref}>
          <div className={`ap-content ${s3.inView ? "in" : ""}`}>
            <div className="ap-slide-label">APPENDIX</div>
            <h2 className="ap-h2">Other Candidates</h2>

            <div className="ap-table-wrap">
              <table className="ap-table ap-table-detail">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Overview</th>
                    <th>Certifications</th>
                    <th>Price / Lead Time</th>
                    <th>Options / Comments</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="ap-td-name">Daelim</td>
                    <td>Based in Beijing, China. Well-established manufacturer with major OEMs white labeling their offerings. Capacity to produce 15 pcs/day of this size.</td>
                    <td>Offers US based support.<br/>ISO 9001:2008, UL-US</td>
                    <td>$596,730<br/><span className="ap-td-lt">36 wks</span></td>
                    <td>UL-Witnessed Factory Acceptance Testing</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Jiangsu First Power</td>
                    <td>Based in Jiangsu, China. Established manufacturer delivering on many government contracts with stringent quality requirements. Est. annual rev. USD$1B. Capacity: 10 pcs/day.</td>
                    <td>ISO 9001:2015, UL-US<br/>US Projects: SpaceX and Antpower</td>
                    <td>$472,366 ($367,866)<br/><span className="ap-td-lt">12 wks after drawings</span></td>
                    <td>UL-Witnessed Factory Acceptance Testing</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">China Electrical Equipment Group (CEEG)</td>
                    <td>Three large facilities in China. White label option for major brands (ABB, Siemens, Schneider, Hitachi) with ~2M sq ft of manufacturing. Also does many Chinese government contracts.</td>
                    <td>ISO 9001:2015<br/>UL/c-UL XPLH</td>
                    <td>$195,500<br/><span className="ap-td-lt">8 wks after drawings</span></td>
                    <td>Have not done many US-based projects and have not established US-based servicing yet</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">HC Transformers (IEN Hanchang)</td>
                    <td>Based in South Korea.</td>
                    <td>NEMA, IEEE, KSA</td>
                    <td>$1,197,500<br/><span className="ap-td-lt">28 wks</span></td>
                    <td>&mdash;</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Delta Star</td>
                    <td>Manufacturing facilities in VA, CA, and in Canada.</td>
                    <td>ISO 9001:2015, UL-US</td>
                    <td>$2,700,000<br/><span className="ap-td-lt">210 wks</span></td>
                    <td>&mdash;</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Schneider Electric</td>
                    <td>US based in theory (USA/Mexico).</td>
                    <td>&mdash;</td>
                    <td>$2,000,000<br/><span className="ap-td-lt">156 wks</span></td>
                    <td>&mdash;</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Texas Transformers</td>
                    <td>Distributes for Telawne Transformers in India.</td>
                    <td>ISO 9001:2015<br/>UL/c-UL XPLH, NEMA, IEEE</td>
                    <td>$642,500<br/><span className="ap-td-lt">36 wks fab</span></td>
                    <td>&mdash;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 4 — CLOSING ========== */}
        <section className="ap-slide" ref={s4.ref}>
          <GridBackground />
          <div className="ap-glow ap-glow-1" />
          <div className="ap-glow ap-glow-2" />
          <div className={`ap-closing ${s4.inView ? "in" : ""}`}>
            <div className="ap-closing-logo">
              <div className="ap-logo-icon"><Zap className="w-8 h-8" /></div>
            </div>
            <h2 className="ap-closing-h2">Next Steps</h2>
            <p className="ap-closing-p">
              Ready to proceed with MFG drawings, PO negotiations, and facility reviews
              for the recommended suppliers.
            </p>
            <a href="mailto:brian@fluxco.com" className="ap-cta">
              Contact FluxCo <ArrowRight className="w-4 h-4" />
            </a>
            <div className="ap-closing-contact">
              <span>FluxCo</span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}


/* =====================================================================
   STYLES
   ===================================================================== */
const apStyles = `
  :root {
    --ap-blue: #2d8cff;
    --ap-red: #e63946;
    --ap-green: #22c55e;
    --ap-bg: #08090a;
    --ap-surface: rgba(255,255,255,0.04);
    --ap-border: rgba(255,255,255,0.08);
    --ap-text: rgba(255,255,255,0.7);
    --ap-text-dim: rgba(255,255,255,0.4);
    --ap-radius: 12px;
  }

  *, *::before, *::after { box-sizing: border-box; }
  html, body { background: var(--ap-bg) !important; overflow: hidden !important; max-width: 100vw; }

  .ap-container {
    position: fixed; inset: 0;
    overflow-y: scroll; overflow-x: hidden;
    scroll-snap-type: y mandatory;
    -webkit-overflow-scrolling: touch;
    z-index: 1;
  }

  .ap-slide {
    min-height: 100vh; min-height: 100dvh;
    width: 100%; display: flex;
    flex-direction: column; justify-content: center; align-items: center;
    scroll-snap-align: start;
    position: relative; overflow: hidden;
    background: var(--ap-bg);
  }
  .ap-slide-table {
    justify-content: flex-start;
    padding-top: 60px;
  }

  /* ---- BACKGROUNDS ---- */
  .ap-grid-bg { position: absolute; inset: 0; z-index: 0; opacity: 0.8; }

  .ap-glow {
    position: absolute; border-radius: 50%;
    filter: blur(120px); pointer-events: none; z-index: 0;
  }
  .ap-glow-1 { width: 600px; height: 600px; top: -100px; right: -100px; background: rgba(45,140,255,0.08); animation: ap-float 8s ease-in-out infinite; }
  .ap-glow-2 { width: 400px; height: 400px; bottom: -50px; left: 10%; background: rgba(230,57,70,0.05); animation: ap-float 10s ease-in-out infinite reverse; }
  .ap-glow-4 { width: 500px; height: 500px; bottom: 10%; left: -100px; background: rgba(45,140,255,0.05); animation: ap-float 11s ease-in-out infinite reverse; }

  @keyframes ap-float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -20px) scale(1.05); }
  }

  /* ---- PROGRESS BAR ---- */
  .ap-progress {
    position: fixed; right: 24px; top: 50%; transform: translateY(-50%);
    z-index: 100; display: flex; flex-direction: column; gap: 8px;
  }
  .ap-progress-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(255,255,255,0.15); border: none;
    cursor: pointer; padding: 0;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ap-progress-dot.active { background: var(--ap-blue); height: 24px; border-radius: 4px; box-shadow: 0 0 12px rgba(45,140,255,0.4); }
  .ap-progress-dot.past { background: rgba(45,140,255,0.3); }
  .ap-progress-dot:hover { background: rgba(255,255,255,0.4); }

  /* ---- NAV ---- */
  .ap-nav {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 100; display: flex; align-items: center; gap: 12px;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(20px);
    border: 1px solid var(--ap-border); border-radius: 100px;
    padding: 8px;
  }
  .ap-nav-btn {
    width: 36px; height: 36px; border-radius: 50%;
    background: transparent; border: 1px solid var(--ap-border);
    color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .ap-nav-btn:hover { background: var(--ap-blue); border-color: var(--ap-blue); }
  .ap-nav-count {
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    color: var(--ap-text-dim); padding: 0 8px; letter-spacing: 1px;
  }

  .ap-scroll-hint {
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    z-index: 100; color: var(--ap-text-dim); cursor: pointer;
    animation: ap-bounce 2s ease-in-out infinite;
  }
  @keyframes ap-bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(8px); }
  }

  /* ---- CONTENT WRAPPER ---- */
  .ap-content {
    padding: 60px 80px; width: 100%; max-width: 1300px;
    margin: 0 auto; z-index: 1;
  }

  /* ---- ANIMATIONS ---- */
  .ap-content.in .ap-slide-label,
  .ap-content.in .ap-h2,
  .ap-content.in > .ap-p,
  .ap-content.in .ap-table-wrap,
  .ap-content.in .ap-pending-grid {
    animation: ap-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .ap-content .ap-slide-label { opacity: 0; animation-delay: 0s; }
  .ap-content .ap-h2 { opacity: 0; animation-delay: 0.1s; }
  .ap-content > .ap-p { opacity: 0; animation-delay: 0.2s; }
  .ap-content .ap-table-wrap { opacity: 0; animation-delay: 0.15s; }
  .ap-content .ap-pending-grid { opacity: 0; animation-delay: 0.2s; }

  @keyframes ap-fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ---- TITLE SLIDE ---- */
  .ap-title-content {
    position: relative; z-index: 2;
    padding: 80px; max-width: 900px;
  }
  .ap-title-content .ap-logo,
  .ap-title-content .ap-badge,
  .ap-title-content .ap-h1-line,
  .ap-title-content .ap-subtitle,
  .ap-title-content .ap-title-meta {
    opacity: 0; transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ap-title-content.in .ap-logo { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
  .ap-title-content.in .ap-badge { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
  .ap-title-content.in .ap-h1-1 { opacity: 1; transform: translateY(0); transition-delay: 0.35s; }
  .ap-title-content.in .ap-h1-2 { opacity: 1; transform: translateY(0); transition-delay: 0.55s; }
  .ap-title-content.in .ap-subtitle { opacity: 1; transform: translateY(0); transition-delay: 0.7s; }
  .ap-title-content.in .ap-title-meta { opacity: 1; transform: translateY(0); transition-delay: 0.85s; }

  /* ---- LOGO ---- */
  .ap-logo {
    display: flex; align-items: center; gap: 12px;
    font-family: 'Oswald', sans-serif; font-weight: 700;
    font-size: 28px; color: #fff; letter-spacing: 3px;
    text-transform: uppercase; margin-bottom: 24px;
  }
  .ap-logo-icon {
    width: 48px; height: 48px; border-radius: 10px;
    background: linear-gradient(135deg, var(--ap-blue), rgba(45,140,255,0.3));
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    box-shadow: 0 0 30px rgba(45,140,255,0.3);
    animation: ap-pulse 3s ease-in-out infinite;
  }
  @keyframes ap-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(45,140,255,0.2); }
    50% { box-shadow: 0 0 40px rgba(45,140,255,0.4); }
  }

  .ap-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--ap-blue); letter-spacing: 4px; text-transform: uppercase;
    font-weight: 600; margin-bottom: 16px;
    padding: 6px 14px; border-radius: 100px;
    background: rgba(45,140,255,0.08); border: 1px solid rgba(45,140,255,0.2);
    display: inline-block;
  }

  /* ---- TYPOGRAPHY ---- */
  .ap-h1 { display: flex; flex-direction: column; gap: 0; margin: 0 0 32px 0; }
  .ap-h1-line {
    font-family: 'Oswald', sans-serif; font-weight: 700;
    font-size: clamp(48px, 8vw, 88px); line-height: 0.95;
    text-transform: uppercase; display: block;
  }
  .ap-h1-1 { color: #fff; }
  .ap-h1-2 { color: var(--ap-blue); }

  .ap-subtitle {
    font-family: 'Inter', sans-serif; font-size: clamp(16px, 1.8vw, 20px);
    color: var(--ap-text); max-width: 600px; line-height: 1.6; font-weight: 400;
  }
  .ap-subtitle strong { color: #fff; }

  .ap-title-meta {
    display: flex; gap: 24px; margin-top: 24px;
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    color: var(--ap-text-dim); letter-spacing: 0.5px;
  }
  .ap-title-meta span {
    display: flex; align-items: center; gap: 6px;
  }
  .ap-title-meta svg { color: var(--ap-blue); }

  .ap-slide-label {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--ap-blue); letter-spacing: 3px; text-transform: uppercase;
    font-weight: 500; margin-bottom: 12px;
  }

  .ap-h2 {
    font-family: 'Oswald', sans-serif; color: #fff;
    font-size: clamp(28px, 4vw, 44px); font-weight: 700;
    text-transform: uppercase; margin: 0 0 20px 0; line-height: 1.1;
  }

  .ap-p {
    color: var(--ap-text); font-size: 14px; line-height: 1.7;
    margin-bottom: 12px; font-family: 'Inter', sans-serif;
  }

  /* ---- TABLE ---- */
  .ap-table-wrap {
    margin-top: 16px;
    border-radius: var(--ap-radius);
    overflow: hidden;
    border: 1px solid var(--ap-border);
  }
  .ap-table {
    width: 100%; border-collapse: collapse;
    font-family: 'Inter', sans-serif; font-size: 13px;
  }
  .ap-table th {
    padding: 14px 16px; text-align: left;
    font-weight: 600; font-size: 10px;
    color: var(--ap-blue); text-transform: uppercase;
    letter-spacing: 1.5px;
    background: rgba(45,140,255,0.06);
    border-bottom: 1px solid rgba(45,140,255,0.15);
  }
  .ap-table td {
    padding: 12px 16px; color: var(--ap-text);
    border-bottom: 1px solid var(--ap-border);
    vertical-align: top;
  }
  .ap-table tr:last-child td { border-bottom: none; }
  .ap-table tr:hover td { background: rgba(255,255,255,0.02); }

  .ap-table-detail td { font-size: 12px; line-height: 1.5; }
  .ap-td-name { color: #fff !important; font-weight: 600; white-space: nowrap; }
  .ap-td-lt { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--ap-text-dim); }

  /* ---- PENDING GRID ---- */
  .ap-pending-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 14px; margin-top: 32px;
  }
  .ap-pending-card {
    display: flex; align-items: center; gap: 14px;
    padding: 18px 20px; border-radius: var(--ap-radius);
    background: var(--ap-surface); border: 1px solid var(--ap-border);
    transition: all 0.3s;
  }
  .ap-pending-card:hover { border-color: rgba(45,140,255,0.3); transform: translateX(4px); }
  .ap-pending-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(45,140,255,0.1);
    display: flex; align-items: center; justify-content: center;
    color: var(--ap-blue); flex-shrink: 0;
  }
  .ap-pending-name {
    font-family: 'Inter', sans-serif; font-size: 14px;
    color: #fff; font-weight: 600;
  }
  .ap-pending-country {
    font-family: 'Inter', sans-serif; font-size: 11px;
    color: var(--ap-text-dim); margin-top: 2px;
  }

  /* ---- CLOSING ---- */
  .ap-closing {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; z-index: 2; padding: 80px; max-width: 800px;
  }
  .ap-closing .ap-logo-icon,
  .ap-closing .ap-closing-h2,
  .ap-closing .ap-closing-p,
  .ap-closing .ap-cta,
  .ap-closing .ap-closing-contact {
    opacity: 0; transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ap-closing.in .ap-logo-icon { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
  .ap-closing.in .ap-closing-h2 { opacity: 1; transform: translateY(0); transition-delay: 0.3s; }
  .ap-closing.in .ap-closing-p { opacity: 1; transform: translateY(0); transition-delay: 0.5s; }
  .ap-closing.in .ap-cta { opacity: 1; transform: translateY(0); transition-delay: 0.7s; }
  .ap-closing.in .ap-closing-contact { opacity: 1; transform: translateY(0); transition-delay: 0.85s; }

  .ap-closing-logo { margin-bottom: 24px; }
  .ap-closing-h2 {
    font-family: 'Oswald', sans-serif; font-size: clamp(36px, 5vw, 56px);
    font-weight: 700; color: #fff; text-transform: uppercase;
    margin-bottom: 20px;
  }
  .ap-closing-p {
    font-family: 'Inter', sans-serif; font-size: 17px;
    color: var(--ap-text); line-height: 1.6; margin-bottom: 32px;
  }
  .ap-cta {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
    color: #fff; letter-spacing: 2px; text-transform: uppercase;
    padding: 16px 32px; border-radius: 100px;
    background: linear-gradient(135deg, var(--ap-blue), rgba(45,140,255,0.7));
    text-decoration: none; transition: all 0.3s;
    box-shadow: 0 0 30px rgba(45,140,255,0.2);
  }
  .ap-cta:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(45,140,255,0.4); }
  .ap-closing-contact {
    display: flex; align-items: center; gap: 16px; margin-top: 32px;
    font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ap-text-dim);
  }

  /* ---- MOBILE ---- */
  @media (max-width: 768px) {
    html, body { overflow: auto !important; }
    .ap-container {
      position: relative !important; inset: auto !important;
      overflow-y: visible !important; scroll-snap-type: none !important;
    }
    .ap-slide { min-height: auto; padding: 48px 0; scroll-snap-align: none; }
    .ap-slide:first-child, .ap-slide:last-child { min-height: 100vh; min-height: 100svh; padding: 0; }
    .ap-content { padding: 24px 20px; }
    .ap-title-content { padding: 40px 24px; }
    .ap-h2 { font-size: 28px; }
    .ap-pending-grid { grid-template-columns: 1fr; }
    .ap-progress { display: none; }
    .ap-nav { display: none; }
    .ap-scroll-hint { display: none; }
    .ap-closing { padding: 48px 24px; }
    .ap-table-wrap { overflow-x: auto; }
  }
`;
