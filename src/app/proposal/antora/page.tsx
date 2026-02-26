"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Zap, ArrowRight, ArrowLeft, ChevronDown, Globe, Clock,
  DollarSign, CheckCircle, Factory, Search, FileText, Shield,
  Award, MapPin, Users, AlertTriangle, Package,
} from "lucide-react";

const TOTAL_SECTIONS = 9;

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
/*  Hook: animate numbers counting up                                  */
/* ------------------------------------------------------------------ */
function useCountUp(end: number, duration = 2000, trigger = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) { setValue(0); return; }
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setValue(end); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, end, duration]);
  return value;
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
/*  World map background with OEM location pins                         */
/*  Equirectangular projection: x = (lon+180)/360*1000, y = (90-lat)/180*500 */
/* ------------------------------------------------------------------ */
function lonLatToXY(lon: number, lat: number): [number, number] {
  return [(lon + 180) / 360 * 1000, (90 - lat) / 180 * 500];
}

const OEM_LOCATIONS: { lon: number; lat: number; label: string }[] = [
  // China
  { lon: 113.3, lat: 23.1, label: "Guangdong" },
  { lon: 119.4, lat: 32.4, label: "Jiangsu/Yawei" },
  { lon: 118.8, lat: 32.1, label: "Nanjing/CEEG" },
  { lon: 116.4, lat: 39.9, label: "Beijing/Daelim" },
  { lon: 114.1, lat: 22.5, label: "Shenzhen/VaOpto" },
  { lon: 120.6, lat: 28.0, label: "Wenzhou" },
  { lon: 117.0, lat: 36.7, label: "Shandong/Fudao" },
  // South Korea
  { lon: 127.0, lat: 37.6, label: "South Korea" },
  // Japan
  { lon: 139.7, lat: 35.7, label: "Japan/Toshiba" },
  // India
  { lon: 77.2, lat: 28.6, label: "India/TX Xfmr" },
  // Pakistan
  { lon: 74.3, lat: 31.5, label: "Lahore/PEL" },
  // UAE
  { lon: 55.3, lat: 25.3, label: "Dubai/Bolt" },
  // Turkey
  { lon: 29.0, lat: 41.0, label: "Turkey/Astor" },
  // Portugal
  { lon: -8.6, lat: 41.2, label: "Porto/EFACEC" },
  // Mexico
  { lon: -99.1, lat: 19.4, label: "Mexico/Edmar" },
  // US
  { lon: -79.9, lat: 37.3, label: "Virginia/VTC" },
  { lon: -96.7, lat: 44.0, label: "SD/T&R" },
  { lon: -97.7, lat: 30.3, label: "Texas" },
];

function WorldMapBackground() {
  const pins = OEM_LOCATIONS.map(loc => {
    const [x, y] = lonLatToXY(loc.lon, loc.lat);
    return { x, y, label: loc.label };
  });

  return (
    <div className="ap-map-bg">
      {/* Real world map from Natural Earth data (equirectangular projection) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/world-map-bg.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />
      {/* OEM location pins overlay */}
      <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {pins.map((pin, i) => (
          <g key={i}>
            {/* Outer pulse */}
            <circle cx={pin.x} cy={pin.y} r="8" fill="none" stroke="rgba(45,140,255,0.4)" strokeWidth="1">
              <animate attributeName="r" from="4" to="18" dur={`${2 + (i % 3) * 0.7}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.6" to="0" dur={`${2 + (i % 3) * 0.7}s`} repeatCount="indefinite" />
            </circle>
            {/* Pin marker */}
            <circle cx={pin.x} cy={pin.y} r="4" fill="#2d8cff" opacity="0.8" />
            <circle cx={pin.x} cy={pin.y} r="2" fill="#fff" opacity="0.9" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scatter chart data                                                  */
/* ------------------------------------------------------------------ */
const CHART_DATA = [
  { name: "CEEG", price: 195500, weeks: 20, type: "fluxco" },
  { name: "Yawei", price: 367866, weeks: 22, type: "fluxco", recommended: true },
  { name: "Omex", price: 604737, weeks: 31, type: "antora" },
  { name: "Jiangsu FP", price: 415000, weeks: 26, type: "fluxco" },
  { name: "Keyuan", price: 305500, weeks: 28, type: "fluxco", recommended: true },
  { name: "VaOpto", price: 1121100, weeks: 34, type: "fluxco" },
  { name: "HC (IEN)", price: 1197500, weeks: 35, type: "fluxco" },
  { name: "PEL", price: 572297, weeks: 40, type: "fluxco", recommended: true },
  { name: "JST", price: 852068, weeks: 40, type: "antora" },
  { name: "TX Xfmrs", price: 981875, weeks: 41, type: "antora" },
  { name: "Astor", price: 967771, weeks: 48, type: "antora" },
  { name: "TX Xfmr", price: 642000, weeks: 50, type: "fluxco" },
  { name: "Daelim", price: 596730, weeks: 51, type: "fluxco" },
  { name: "Bolt", price: 693790, weeks: 66, type: "fluxco" },
  { name: "T&R", price: 729565, weeks: 94, type: "fluxco" },
  { name: "Schneider", price: 2000000, weeks: 159, type: "fluxco" },
  { name: "Delta Star", price: 2750000, weeks: 214, type: "fluxco" },
];

function ScatterChart({ inView }: { inView: boolean }) {
  const maxPrice = 3000000;
  const maxWeeks = 220;
  const chartW = 900;
  const chartH = 400;
  const padL = 80;
  const padR = 30;
  const padT = 20;
  const padB = 50;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const x = (w: number) => padL + (w / maxWeeks) * plotW;
  const y = (p: number) => padT + plotH - (p / maxPrice) * plotH;

  const priceTicks = [0, 500000, 1000000, 1500000, 2000000, 2500000, 3000000];
  const weekTicks = [0, 50, 100, 150, 200];

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="ap-scatter-svg" style={{ width: "100%", height: "auto" }}>
      {/* Grid lines */}
      {priceTicks.map(p => (
        <g key={`p-${p}`}>
          <line x1={padL} y1={y(p)} x2={chartW - padR} y2={y(p)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <text x={padL - 8} y={y(p) + 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="Inter">
            ${(p / 1000000).toFixed(1)}M
          </text>
        </g>
      ))}
      {weekTicks.map(w => (
        <g key={`w-${w}`}>
          <line x1={x(w)} y1={padT} x2={x(w)} y2={chartH - padB} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <text x={x(w)} y={chartH - padB + 16} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="Inter">
            {w} wks
          </text>
        </g>
      ))}

      {/* Delivery deadline line */}
      <line x1={x(38)} y1={padT} x2={x(38)} y2={chartH - padB} stroke="rgba(230,57,70,0.5)" strokeWidth="1.5" strokeDasharray="4,4" />
      <text x={x(38) + 6} y={padT + 14} fill="#e63946" fontSize="8" fontFamily="JetBrains Mono" fontWeight="600">
        11/30 DELIVERY
      </text>

      {/* Axis labels */}
      <text x={chartW / 2} y={chartH - 5} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Inter" fontWeight="600" letterSpacing="1">
        TOTAL LEAD TIME (WEEKS)
      </text>
      <text x={14} y={chartH / 2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Inter" fontWeight="600" letterSpacing="1" transform={`rotate(-90, 14, ${chartH / 2})`}>
        QUOTED PRICE ($)
      </text>

      {/* Data points */}
      {CHART_DATA.map((d, i) => {
        const cx = x(d.weeks);
        const cy = y(d.price);
        const isAntora = d.type === "antora";
        const isRec = d.recommended;
        return (
          <g key={d.name} style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "scale(1)" : "scale(0)",
            transformOrigin: `${cx}px ${cy}px`,
            transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.04}s`,
          }}>
            {isRec && <circle cx={cx} cy={cy} r="12" fill="rgba(45,140,255,0.1)" stroke="rgba(45,140,255,0.3)" strokeWidth="0.5" />}
            <circle
              cx={cx} cy={cy}
              r={isRec ? "6" : "5"}
              fill={isAntora ? "#e63946" : isRec ? "#2d8cff" : "rgba(45,140,255,0.6)"}
              stroke={isRec ? "#2d8cff" : "none"}
              strokeWidth={isRec ? "1.5" : "0"}
            />
            <text
              x={cx}
              y={cy - 10}
              textAnchor="middle"
              fill={isAntora ? "#e63946" : isRec ? "#2d8cff" : "rgba(255,255,255,0.45)"}
              fontSize="7.5"
              fontFamily="Inter"
              fontWeight={isRec ? "600" : "400"}
            >
              {d.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}


/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */
export default function AntoraProposal() {
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
  const s5 = useInView(0.2);
  const s6 = useInView(0.2);
  const s7 = useInView(0.2);
  const s8 = useInView(0.2);
  const s9 = useInView(0.2);

  /* Animated counters */
  const c69 = useCountUp(69, 1800, s2.inView);
  const c15 = useCountUp(15, 1200, s2.inView);
  const c13q = useCountUp(13, 1400, s2.inView);
  const c13p = useCountUp(13, 1400, s2.inView);
  const c43 = useCountUp(43, 1800, s2.inView);

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
            <div className="ap-logo">
              <div className="ap-logo-icon"><Zap className="w-8 h-8" /></div>
              <span>FLUXCO</span>
            </div>
            <div className="ap-badge">PROCUREMENT PROPOSAL</div>
            <h1 className="ap-h1">
              <span className="ap-h1-line ap-h1-1">20 MVA eBoiler</span>
              <span className="ap-h1-line ap-h1-2">Transformer</span>
            </h1>
            <p className="ap-subtitle">
              Prepared for <strong>Antora Energy</strong> &mdash; Pratt, Kansas
            </p>
            <div className="ap-title-meta">
              <span><Clock className="w-4 h-4" /> Target Delivery: Nov 30, 2026</span>
              <span><MapPin className="w-4 h-4" /> Pratt, KS</span>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 2 — PROCESS OVERVIEW ========== */}
        <section className="ap-slide" ref={s2.ref}>
          <WorldMapBackground />
          <div className="ap-glow ap-glow-3" />
          <div className={`ap-content ${s2.inView ? "in" : ""}`}>
            <div className="ap-slide-label">PROCUREMENT PROCESS</div>
            <h2 className="ap-h2">Process Overview</h2>
            <p className="ap-p">
              Outreach for the requirement to procure a <strong>20 MVA transformer</strong> with
              target delivery <strong>Nov 30, 2026</strong>.
            </p>

            <div className="ap-stats-row">
              <div className="ap-stat-card">
                <div className="ap-stat-num">{c69}</div>
                <div className="ap-stat-label">OEMs Contacted</div>
              </div>
              <div className="ap-stat-card">
                <div className="ap-stat-num">{c15}</div>
                <div className="ap-stat-label">Countries</div>
              </div>
              <div className="ap-stat-card ap-stat-highlight">
                <div className="ap-stat-num">{c13q}</div>
                <div className="ap-stat-label">Quotes Received</div>
              </div>
              <div className="ap-stat-card">
                <div className="ap-stat-num">{c13p}</div>
                <div className="ap-stat-label">Quotes In-Process</div>
              </div>
              <div className="ap-stat-card ap-stat-dim">
                <div className="ap-stat-num">{c43}</div>
                <div className="ap-stat-label">Declined / No Bid</div>
              </div>
            </div>

            <div className="ap-grid-2">
              <div>
                <h3 className="ap-h3"><CheckCircle className="w-5 h-5" style={{ color: "#22c55e" }} /> Completed</h3>
                <ul className="ap-checklist">
                  <li>Initial Quotes</li>
                  <li>Engineering Q&A</li>
                  <li>DDP Review <span className="ap-note">(tariffs changed)</span></li>
                  <li><strong>Top 3 OEM Recommendations</strong></li>
                  <li className="ap-sub">+1-2 Wildcards</li>
                </ul>
              </div>
              <div>
                <h3 className="ap-h3"><Clock className="w-5 h-5" style={{ color: "var(--ap-blue)" }} /> To Be Completed</h3>
                <ul className="ap-checklist ap-checklist-pending">
                  <li>MFG Drawings</li>
                  <li>PO + Payment Terms Negotiation</li>
                  <li>Third Party Facility Review</li>
                  <li>NRTL Listing / FEOC Confirmation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 3 — PRICE vs LEAD TIME CHART ========== */}
        <section className="ap-slide" ref={s3.ref}>
          <div className="ap-glow ap-glow-4" />
          <div className={`ap-content ${s3.inView ? "in" : ""}`}>
            <div className="ap-slide-label">MARKET ANALYSIS</div>
            <h2 className="ap-h2">Quoted Price by Lead Time</h2>
            <p className="ap-p">
              All bids plotted by <strong>total lead time</strong> and <strong>quoted price</strong>.
              Recommended suppliers highlighted. Red dotted line marks the Nov 30 delivery deadline.
            </p>

            <div className="ap-chart-wrap">
              <div className="ap-chart-box">
                <ScatterChart inView={s3.inView} />
              </div>
              <div className="ap-chart-legend">
                <div className="ap-legend">
                  <div className="ap-legend-swatch" style={{ background: "#2d8cff" }} /> FluxCo Bid
                </div>
                <div className="ap-legend">
                  <div className="ap-legend-swatch" style={{ background: "#e63946" }} /> Antora Bid
                </div>
                <div className="ap-legend">
                  <div className="ap-legend-swatch" style={{ background: "#2d8cff", border: "2px solid #2d8cff", boxShadow: "0 0 0 3px rgba(45,140,255,0.2)" }} /> Recommended
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 4 — TOP 3 RECOMMENDATIONS ========== */}
        <section className="ap-slide" ref={s4.ref}>
          <div className="ap-glow ap-glow-5" />
          <div className={`ap-content ${s4.inView ? "in" : ""}`}>
            <div className="ap-slide-label">OUR RECOMMENDATIONS</div>
            <h2 className="ap-h2">Top 3 Candidates</h2>

            <div className="ap-rec-grid">
              {/* Keyuan */}
              <div className="ap-rec-card ap-rec-featured">
                <div className="ap-rec-badge">BEST VALUE</div>
                <div className="ap-rec-header">
                  <div className="ap-rec-icon"><Award className="w-6 h-6" /></div>
                  <div>
                    <div className="ap-rec-name">Keyuan Electric</div>
                    <div className="ap-rec-origin"><MapPin className="w-3 h-3" /> Guangdong, China</div>
                  </div>
                </div>
                <div className="ap-rec-price-row">
                  <div className="ap-rec-price">$425,500 <span>DDP US Port*</span></div>
                  <div className="ap-rec-lt"><Clock className="w-3.5 h-3.5" /> 28 wks <span>+6 for options</span></div>
                </div>
                <div className="ap-rec-body">
                  <p>Well-established manufacturer (est. 2007) with major OEMs white-labeling their products. Cooperative relations with <strong>Schneider, ABB, and GE</strong>. Awarded Chinese national projects with stringent quality requirements. US support teams in NY and Dallas.</p>
                </div>
                <div className="ap-rec-quals">
                  <span>IEC</span><span>UL</span><span>CSA</span><span>KEMA</span><span>ISO</span><span>UL/c-UL XPLH</span>
                </div>
                <div className="ap-rec-note">Est. Revenue $150M &bull; 5 units/month capacity &bull; UL-listing +$60k &bull; TUV Field Eval IEEE cert +$18k</div>
              </div>

              {/* Yawei */}
              <div className="ap-rec-card">
                <div className="ap-rec-header">
                  <div className="ap-rec-icon"><Factory className="w-6 h-6" /></div>
                  <div>
                    <div className="ap-rec-name">Jiangsu Yawei</div>
                    <div className="ap-rec-origin"><MapPin className="w-3 h-3" /> Yangzhong, Jiangsu, China</div>
                  </div>
                </div>
                <div className="ap-rec-price-row">
                  <div className="ap-rec-price">$442,366 <span>DDP US Port</span></div>
                  <div className="ap-rec-lt"><Clock className="w-3.5 h-3.5" /> 12 wks <span>after drawings</span></div>
                </div>
                <div className="ap-rec-body">
                  <p>Established manufacturer with comprehensive certifications. <strong>2.7M sq ft facility</strong>. Awarded Chinese national projects. Delivered many units to Canada and US including <strong>BGIN</strong> projects.</p>
                </div>
                <div className="ap-rec-quals">
                  <span>ISO 9001:2015</span><span>UL-Canada</span>
                </div>
                <div className="ap-rec-note">Est. Revenue $365M &bull; 30 units/month &bull; UL Witnessed FAT available</div>
              </div>

              {/* PEL */}
              <div className="ap-rec-card">
                <div className="ap-rec-header">
                  <div className="ap-rec-icon"><Shield className="w-6 h-6" /></div>
                  <div>
                    <div className="ap-rec-name">PEL (Pak Elektron)</div>
                    <div className="ap-rec-origin"><MapPin className="w-3 h-3" /> Lahore, Pakistan</div>
                  </div>
                </div>
                <div className="ap-rec-price-row">
                  <div className="ap-rec-price">$572,297 <span>DDP US Port</span></div>
                  <div className="ap-rec-lt"><Clock className="w-3.5 h-3.5" /> 40 wks</div>
                </div>
                <div className="ap-rec-body">
                  <p>Highly professional team. Acquired <strong>Ganz technology</strong> (invented transformers in 1885). Shows up with 3-6 technical reps per meeting. Past projects include <strong>Tesla data centers</strong>. ~800 transformers delivered to US in 2024-2025.</p>
                </div>
                <div className="ap-rec-quals">
                  <span>ISO 9001:2015</span><span>UL/c-UL XPLH</span><span>ISO 14001</span><span>ISO 45001</span>
                </div>
                <div className="ap-rec-note">Est. Revenue $162M &bull; 50 units/year &bull; Deep BOM + long-lead analysis provided</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 5 — RECOMMENDATION DETAILS ========== */}
        <section className="ap-slide" ref={s5.ref}>
          <div className="ap-glow ap-glow-3" />
          <div className={`ap-content ${s5.inView ? "in" : ""}`}>
            <div className="ap-slide-label">WHY THESE THREE</div>
            <h2 className="ap-h2">Detailed Recommendations</h2>

            <div className="ap-detail-grid">
              <div className="ap-detail-card">
                <h3 className="ap-h3">Keyuan Electric <span className="ap-price-tag">$305,500 FOB</span></h3>
                <p className="ap-p">
                  We believe Keyuan is a good option for a variety of reasons outside of just great pricing and
                  production timelines that fit the schedule. They have comprehensive certifications (UL-US, ISO 9001:2015, etc.).
                  Based on our conversations with other OEMs, <strong>Keyuan was a name that kept coming up as the white label manufacturer</strong>.
                  They have established cooperative relations with Schneider, ABB, and GE.
                </p>
                <p className="ap-p">
                  They have been awarded Chinese national projects which has stringent quality/performance requirements
                  and you lose access to these projects for a three year period if you do not meet quality standards.
                  They claim to have delivered directly to the US for the third year now under white labels.
                  They have support teams based out of <strong>New York and Dallas</strong>.
                </p>
              </div>
              <div className="ap-detail-card">
                <h3 className="ap-h3">Jiangsu Yawei <span className="ap-price-tag">$367,866 FOB</span></h3>
                <p className="ap-p">
                  Yawei has comprehensive certifications (UL-Canada, ISO 9001:2015, etc.). They have what appears
                  to be an organized and large operation based on our research in a <strong>2.7M square foot facility</strong>.
                  They have been awarded Chinese national projects with stringent quality requirements.
                </p>
                <p className="ap-p">
                  They have delivered many units of similar specs within the last few years including many projects in
                  Canada and in the US. We have outreach to one of their public US customers (BGIN) and are awaiting responses.
                  Rather than NRTL, they do offer <strong>UL witnessed factory acceptance testing</strong> certification.
                </p>
              </div>
              <div className="ap-detail-card">
                <h3 className="ap-h3">Jiangsu First Power <span className="ap-price-tag">$415,000 FOB</span></h3>
                <p className="ap-p">
                  JSFP has comprehensive certifications (UL-US and Canada, ISO 9001:2015, etc.). They have what appears
                  to be an organized and large operation based on our research in a <strong>2.15M square foot facility</strong>.
                  They have delivered to a few notable US projects notably a <strong>SpaceX project</strong> and a mining
                  operation by Antspace. Price still feels negotiable.
                </p>
              </div>
              <div className="ap-detail-card">
                <h3 className="ap-h3">PEL (Pak Elektron) <span className="ap-price-tag">$572,297 DDP</span></h3>
                <p className="ap-p">
                  PEL is a highly professional organization that acquired <strong>Ganz technology</strong> — the company that
                  invented transformers in 1885. They consistently show up with 3-6 technical representatives per meeting, demonstrating
                  deep engineering capability. Past projects include <strong>Tesla data centers</strong>.
                </p>
                <p className="ap-p">
                  They have delivered approximately <strong>800 transformers to the US in 2024-2025</strong> and provided a detailed
                  BOM and long-lead analysis. They hold UL/c-UL XPLH listing, ISO 9001:2015, ISO 14001, and ISO 45001 certifications.
                  Estimated revenue of $162M with 50 units/year capacity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 6 — FULL QUOTE TABLE ========== */}
        <section className="ap-slide ap-slide-table" ref={s6.ref}>
          <div className={`ap-content ${s6.inView ? "in" : ""}`}>
            <div className="ap-slide-label">ALL QUOTES</div>
            <h2 className="ap-h2">Overview of Quotes</h2>

            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>OEM</th>
                    <th>Country</th>
                    <th>Lead Time</th>
                    <th>Quoted Price</th>
                    <th>+ DDP</th>
                    <th>DDP Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="ap-row-rec"><td>Keyuan Electric</td><td>China</td><td>28 wks</td><td>$305,500</td><td>$120,000</td><td className="ap-price-cell">$425,500</td></tr>
                  <tr className="ap-row-rec"><td>Yawei Transformer</td><td>China</td><td>22 wks</td><td>$367,866</td><td>$104,500</td><td className="ap-price-cell">$472,366</td></tr>
                  <tr className="ap-row-rec"><td>PEL</td><td>Pakistan</td><td>40 wks</td><td>$572,297</td><td>$0</td><td className="ap-price-cell">$572,297</td></tr>
                  <tr><td>CEEG</td><td>China</td><td>20 wks</td><td>$195,500</td><td>$120,000</td><td>$315,500</td></tr>
                  <tr><td>Jiangsu First Power</td><td>China</td><td>26 wks</td><td>$415,000</td><td>$205,000</td><td>$620,000</td></tr>
                  <tr><td>Daelim</td><td>China</td><td>51 wks</td><td>$596,730</td><td>$0</td><td>$596,730</td></tr>
                  <tr><td>Omex</td><td>US</td><td>31 wks</td><td>$604,737</td><td>&mdash;</td><td>$604,737</td></tr>
                  <tr><td>Texas Transformer</td><td>India</td><td>50 wks</td><td>$642,000</td><td>$0</td><td>$642,000</td></tr>
                  <tr><td>Bolt Electrical</td><td>UAE</td><td>66 wks</td><td>$693,790</td><td>$113,744</td><td>$807,534</td></tr>
                  <tr><td>T&R Electric</td><td>US</td><td>94 wks</td><td>$729,565</td><td>&mdash;</td><td>$729,565</td></tr>
                  <tr><td>JST</td><td>US</td><td>40 wks</td><td>$852,068</td><td>&mdash;</td><td>$852,068</td></tr>
                  <tr><td>Astor</td><td>Turkey</td><td>48 wks</td><td>$967,771</td><td>&mdash;</td><td>$967,771</td></tr>
                  <tr><td>TX Transformers</td><td>India</td><td>41 wks</td><td>$981,875</td><td>&mdash;</td><td>$981,875</td></tr>
                  <tr><td>VaOpto</td><td>China</td><td>34 wks</td><td>$1,121,100</td><td>$0</td><td>$1,121,100</td></tr>
                  <tr><td>HC (IEN Hanchang)</td><td>South Korea</td><td>35 wks</td><td>$1,197,500</td><td>$0</td><td>$1,197,500</td></tr>
                  <tr><td>Schneider</td><td>USA/Mexico</td><td>159 wks</td><td>$2,000,000</td><td>&mdash;</td><td>$2,000,000</td></tr>
                  <tr><td>Delta Star</td><td>US</td><td>214 wks</td><td>$2,750,000</td><td>&mdash;</td><td>$2,750,000</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 7 — PENDING QUOTES ========== */}
        <section className="ap-slide" ref={s7.ref}>
          <div className="ap-glow ap-glow-4" />
          <div className={`ap-content ${s7.inView ? "in" : ""}`}>
            <div className="ap-slide-label">IN PROGRESS</div>
            <h2 className="ap-h2">Pending Quotes</h2>
            <p className="ap-p">Specs have been shared and are under review with the following manufacturers:</p>

            <div className="ap-pending-grid">
              {[
                { name: "Eagle Rise", country: "China", icon: <Globe className="w-5 h-5" /> },
                { name: "Shandong Fudao", country: "China", icon: <Factory className="w-5 h-5" /> },
                { name: "Howard Industries", country: "US", icon: <Factory className="w-5 h-5" /> },
                { name: "IEC", country: "South Korea", icon: <Globe className="w-5 h-5" /> },
                { name: "LS Electric", country: "South Korea", icon: <Globe className="w-5 h-5" /> },
                { name: "Bolt Electrical", country: "Mexico / South Korea", icon: <Globe className="w-5 h-5" /> },
                { name: "Virginia Transformer", country: "US", icon: <Factory className="w-5 h-5" /> },
                { name: "Grupo Edmar", country: "Mexico", icon: <Globe className="w-5 h-5" /> },
                { name: "EFACEC", country: "Portugal", icon: <Globe className="w-5 h-5" /> },
                { name: "Toshiba", country: "India", icon: <Globe className="w-5 h-5" /> },
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

        {/* ========== SLIDE 8 — OTHER CANDIDATES ========== */}
        <section className="ap-slide ap-slide-table" ref={s8.ref}>
          <div className={`ap-content ${s8.inView ? "in" : ""}`}>
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
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="ap-td-name">Daelim</td>
                    <td>Beijing, China. Well-established, major OEMs white-labeling. 15 pcs/day capacity.</td>
                    <td>ISO 9001:2008, UL-US</td>
                    <td>$596,730<br/><span className="ap-td-lt">36 wks</span></td>
                    <td>UL Witnessed FAT</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Jiangsu First Power</td>
                    <td>Est. revenue $1B. Government contracts. 10 pcs/day capacity.</td>
                    <td>ISO 9001:2015, UL-US</td>
                    <td>$472,366 ($367,866)<br/><span className="ap-td-lt">12 wks after drawings</span></td>
                    <td>SpaceX, Antpower projects. UL Witnessed FAT.</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">CEEG</td>
                    <td>Three large facilities in China. White label for ABB, Siemens, Schneider, Hitachi. 2M sq ft mfg.</td>
                    <td>ISO 9001:2015, UL/c-UL XPLH</td>
                    <td>$315,500<br/><span className="ap-td-lt">($195,500)</span><br/><span className="ap-td-lt">8 wks after drawings</span></td>
                    <td>Limited US project history. No established US servicing.</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">HC (IEN Hanchang)</td>
                    <td>South Korea based manufacturer.</td>
                    <td>NEMA, IEEE, KSA</td>
                    <td>$1,197,500<br/><span className="ap-td-lt">28 wks</span></td>
                    <td>&mdash;</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Delta Star</td>
                    <td>Facilities in VA, CA, and Canada.</td>
                    <td>ISO 9001:2015, UL-US</td>
                    <td>$2,700,000<br/><span className="ap-td-lt">210 wks</span></td>
                    <td>&mdash;</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Schneider</td>
                    <td>US/Mexico based.</td>
                    <td>&mdash;</td>
                    <td>$2,000,000<br/><span className="ap-td-lt">156 wks</span></td>
                    <td>&mdash;</td>
                  </tr>
                  <tr>
                    <td className="ap-td-name">Texas Transformers</td>
                    <td>Distributes for Telawne Transformers (India).</td>
                    <td>ISO 9001:2015, UL/c-UL XPLH, NEMA, IEEE</td>
                    <td>$642,500<br/><span className="ap-td-lt">36 wks fab</span></td>
                    <td>&mdash;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 9 — CLOSING ========== */}
        <section className="ap-slide" ref={s9.ref}>
          <GridBackground />
          <div className="ap-glow ap-glow-1" />
          <div className="ap-glow ap-glow-2" />
          <div className={`ap-closing ${s9.inView ? "in" : ""}`}>
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
              <span>brian@fluxco.com</span>
              <div className="ap-dot" />
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
  .ap-map-bg {
    position: absolute; inset: 0; z-index: 0;
    opacity: 0.7;
    display: flex; align-items: center; justify-content: center;
  }
  .ap-map-bg svg {
    width: 100%; height: 100%;
  }

  .ap-glow {
    position: absolute; border-radius: 50%;
    filter: blur(120px); pointer-events: none; z-index: 0;
  }
  .ap-glow-1 { width: 600px; height: 600px; top: -100px; right: -100px; background: rgba(45,140,255,0.08); animation: ap-float 8s ease-in-out infinite; }
  .ap-glow-2 { width: 400px; height: 400px; bottom: -50px; left: 10%; background: rgba(230,57,70,0.05); animation: ap-float 10s ease-in-out infinite reverse; }
  .ap-glow-3 { width: 500px; height: 500px; top: 20%; right: -100px; background: rgba(45,140,255,0.06); animation: ap-float 9s ease-in-out infinite; }
  .ap-glow-4 { width: 500px; height: 500px; bottom: 10%; left: -100px; background: rgba(45,140,255,0.05); animation: ap-float 11s ease-in-out infinite reverse; }
  .ap-glow-5 { width: 600px; height: 600px; top: 30%; left: 30%; background: rgba(45,140,255,0.04); animation: ap-float 12s ease-in-out infinite; }

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
  .ap-content.in .ap-stats-row,
  .ap-content.in .ap-grid-2,
  .ap-content.in .ap-chart-wrap,
  .ap-content.in .ap-rec-grid,
  .ap-content.in .ap-detail-grid,
  .ap-content.in .ap-table-wrap,
  .ap-content.in .ap-pending-grid {
    animation: ap-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .ap-content .ap-slide-label { opacity: 0; animation-delay: 0s; }
  .ap-content .ap-h2 { opacity: 0; animation-delay: 0.1s; }
  .ap-content > .ap-p { opacity: 0; animation-delay: 0.2s; }
  .ap-content .ap-stats-row { opacity: 0; animation-delay: 0.25s; }
  .ap-content .ap-grid-2 { opacity: 0; animation-delay: 0.35s; }
  .ap-content .ap-chart-wrap { opacity: 0; animation-delay: 0.2s; }
  .ap-content .ap-rec-grid { opacity: 0; animation-delay: 0.2s; }
  .ap-content .ap-detail-grid { opacity: 0; animation-delay: 0.2s; }
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

  .ap-h3 {
    font-family: 'Oswald', sans-serif; color: #fff;
    font-size: 18px; font-weight: 500;
    text-transform: uppercase; margin-bottom: 14px;
    letter-spacing: 0.5px;
    display: flex; align-items: center; gap: 8px;
  }

  .ap-p {
    color: var(--ap-text); font-size: 14px; line-height: 1.7;
    margin-bottom: 12px; font-family: 'Inter', sans-serif;
  }
  .ap-p strong { color: #fff; font-weight: 600; }
  .ap-note { color: var(--ap-text-dim); font-size: 12px; font-style: italic; }

  /* ---- STATS ROW ---- */
  .ap-stats-row {
    display: flex; gap: 14px; margin: 28px 0;
  }
  .ap-stat-card {
    flex: 1; text-align: center; padding: 24px 16px;
    background: var(--ap-surface); border: 1px solid var(--ap-border);
    border-radius: var(--ap-radius);
    transition: all 0.3s;
  }
  .ap-stat-card:hover { border-color: rgba(45,140,255,0.3); transform: translateY(-2px); }
  .ap-stat-highlight { border-color: rgba(45,140,255,0.3); background: rgba(45,140,255,0.06); }
  .ap-stat-dim { opacity: 0.6; }
  .ap-stat-num {
    font-family: 'Oswald', sans-serif; font-size: 42px; font-weight: 700;
    color: #fff; line-height: 1;
  }
  .ap-stat-highlight .ap-stat-num { color: var(--ap-blue); }
  .ap-stat-label {
    font-family: 'Inter', sans-serif; font-size: 11px;
    color: var(--ap-text-dim); text-transform: uppercase;
    letter-spacing: 1px; margin-top: 8px;
  }

  /* ---- GRID ---- */
  .ap-grid-2 {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 40px; margin-top: 24px;
  }

  /* ---- CHECKLIST ---- */
  .ap-checklist { list-style: none; padding: 0; margin: 16px 0; }
  .ap-checklist li {
    position: relative; padding-left: 28px; margin-bottom: 10px;
    color: var(--ap-text); font-size: 14px; line-height: 1.6;
    font-family: 'Inter', sans-serif;
  }
  .ap-checklist li::before {
    content: ''; position: absolute; left: 0; top: 4px;
    width: 16px; height: 16px; border-radius: 50%;
    background: rgba(34,197,94,0.1); border: 1.5px solid #22c55e;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2322c55e' stroke-width='3'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E");
    background-size: 10px; background-position: center; background-repeat: no-repeat;
  }
  .ap-checklist li strong { color: #fff; }
  .ap-checklist.ap-checklist-pending li::before {
    background: rgba(45,140,255,0.1); border-color: var(--ap-blue);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232d8cff' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='1'/%3E%3C/svg%3E");
  }
  .ap-sub { padding-left: 48px !important; font-size: 13px; color: var(--ap-text-dim); }
  .ap-sub::before { left: 20px !important; }

  /* ---- CHART ---- */
  .ap-chart-wrap { margin-top: 24px; }
  .ap-chart-box {
    background: rgba(255,255,255,0.02); border: 1px solid var(--ap-border);
    border-radius: var(--ap-radius) var(--ap-radius) 0 0;
    padding: 24px 16px 16px;
  }
  .ap-chart-legend {
    display: flex; justify-content: center; gap: 24px;
    padding: 10px 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--ap-border); border-top: none;
    border-radius: 0 0 var(--ap-radius) var(--ap-radius);
  }
  .ap-legend {
    font-family: 'Inter', sans-serif; font-size: 10px;
    color: var(--ap-text-dim); text-transform: uppercase; font-weight: 600;
    display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px;
  }
  .ap-legend-swatch { width: 10px; height: 10px; border-radius: 50%; }

  /* ---- RECOMMENDATION CARDS ---- */
  .ap-rec-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 20px; margin-top: 24px;
  }
  .ap-rec-card {
    padding: 28px; border-radius: var(--ap-radius);
    background: var(--ap-surface); border: 1px solid var(--ap-border);
    transition: all 0.3s; position: relative;
    display: flex; flex-direction: column; gap: 16px;
  }
  .ap-rec-card:hover { border-color: rgba(45,140,255,0.3); transform: translateY(-3px); }
  .ap-rec-featured {
    border-color: rgba(45,140,255,0.3);
    background: rgba(45,140,255,0.04);
    box-shadow: 0 0 40px rgba(45,140,255,0.08);
  }
  .ap-rec-badge {
    position: absolute; top: -1px; right: 20px;
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: #fff; letter-spacing: 2px; text-transform: uppercase;
    font-weight: 700;
    padding: 4px 12px;
    background: linear-gradient(135deg, var(--ap-blue), rgba(45,140,255,0.7));
    border-radius: 0 0 6px 6px;
  }
  .ap-rec-header { display: flex; align-items: center; gap: 14px; }
  .ap-rec-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: rgba(45,140,255,0.1);
    display: flex; align-items: center; justify-content: center;
    color: var(--ap-blue); flex-shrink: 0;
  }
  .ap-rec-name {
    font-family: 'Oswald', sans-serif; font-size: 18px; font-weight: 600;
    color: #fff; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .ap-rec-origin {
    font-family: 'Inter', sans-serif; font-size: 11px;
    color: var(--ap-text-dim); display: flex; align-items: center; gap: 4px; margin-top: 2px;
  }
  .ap-rec-price-row {
    display: flex; gap: 16px; align-items: baseline;
    padding: 12px 16px; border-radius: 8px;
    background: rgba(255,255,255,0.03);
  }
  .ap-rec-price {
    font-family: 'Oswald', sans-serif; font-size: 22px; font-weight: 700;
    color: var(--ap-blue);
  }
  .ap-rec-price span {
    font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 400;
    color: var(--ap-text-dim); text-transform: uppercase; letter-spacing: 0.5px;
    margin-left: 4px;
  }
  .ap-rec-lt {
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    color: var(--ap-text); display: flex; align-items: center; gap: 4px;
  }
  .ap-rec-lt span {
    font-size: 10px; color: var(--ap-text-dim); margin-left: 2px;
  }
  .ap-rec-body {
    font-family: 'Inter', sans-serif; font-size: 13px;
    color: var(--ap-text); line-height: 1.65; flex: 1;
  }
  .ap-rec-body p { margin: 0; }
  .ap-rec-body strong { color: #fff; font-weight: 600; }
  .ap-rec-quals {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .ap-rec-quals span {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: var(--ap-blue); letter-spacing: 0.5px;
    padding: 3px 8px; border-radius: 4px;
    background: rgba(45,140,255,0.08); border: 1px solid rgba(45,140,255,0.15);
  }
  .ap-rec-note {
    font-family: 'Inter', sans-serif; font-size: 11px;
    color: var(--ap-text-dim); line-height: 1.5;
    padding-top: 8px; border-top: 1px solid var(--ap-border);
  }

  /* ---- DETAIL CARDS ---- */
  .ap-detail-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 20px; margin-top: 24px;
  }
  .ap-detail-card {
    padding: 28px; border-radius: var(--ap-radius);
    background: var(--ap-surface); border: 1px solid var(--ap-border);
    transition: all 0.3s;
  }
  .ap-detail-card:hover { border-color: rgba(45,140,255,0.3); }
  .ap-detail-card:first-child { grid-column: 1 / -1; }
  .ap-price-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 12px;
    color: var(--ap-blue); font-weight: 500; letter-spacing: 0;
    text-transform: none; margin-left: 12px;
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

  .ap-row-rec td {
    background: rgba(45,140,255,0.03);
    border-color: rgba(45,140,255,0.1);
  }
  .ap-row-rec td:first-child {
    color: #fff; font-weight: 600;
    border-left: 3px solid var(--ap-blue);
  }
  .ap-price-cell { color: var(--ap-blue) !important; font-weight: 600 !important; font-family: 'JetBrains Mono', monospace; }

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
  .ap-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--ap-text-dim); }

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
    .ap-stats-row { flex-wrap: wrap; }
    .ap-stat-card { min-width: calc(50% - 7px); }
    .ap-grid-2 { grid-template-columns: 1fr; }
    .ap-rec-grid { grid-template-columns: 1fr; }
    .ap-detail-grid { grid-template-columns: 1fr; }
    .ap-detail-card:first-child { grid-column: auto; }
    .ap-pending-grid { grid-template-columns: 1fr; }
    .ap-progress { display: none; }
    .ap-nav { display: none; }
    .ap-scroll-hint { display: none; }
    .ap-closing { padding: 48px 24px; }
    .ap-table-wrap { overflow-x: auto; }
  }
`;
