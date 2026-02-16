"use client";

import { useEffect, useState, useRef } from "react";
import { Zap, ArrowRight, ArrowLeft, ChevronDown, Shield, Factory, Cpu, Building2, Globe, Clock, DollarSign, CheckCircle, TrendingUp } from "lucide-react";

export default function DeckPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalSections = 11;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const sectionHeight = window.innerHeight;
      const index = Math.round(scrollTop / sectionHeight);
      setCurrentSection(Math.min(index, totalSections - 1));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        goTo(Math.min(currentSection + 1, totalSections - 1));
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(Math.max(currentSection - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSection]);

  const goTo = (index: number) => {
    containerRef.current?.scrollTo({
      top: index * window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Font Awesome for icons used in original deck */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />

      <style>{deckStyles}</style>

      {/* Navigation Controls */}
      <div className="deck-controls">
        <button
          className="control-btn"
          onClick={() => goTo(Math.max(currentSection - 1, 0))}
          aria-label="Previous section"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="slide-counter">
          {currentSection + 1} / {totalSections}
        </div>
        <button
          className="control-btn"
          onClick={() => goTo(Math.min(currentSection + 1, totalSections - 1))}
          aria-label="Next section"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll indicator on first slide */}
      {currentSection === 0 && (
        <div className="scroll-hint" onClick={() => goTo(1)}>
          <ChevronDown className="w-5 h-5 animate-bounce" />
          <span>Scroll</span>
        </div>
      )}

      {/* Main scrollable container */}
      <div ref={containerRef} className="deck-scroll-container">

        {/* ========== SLIDE 1: TITLE ========== */}
        <section className="deck-section title-section">
          <div className="title-bg" />
          <div className="title-overlay">
            <div className="flux-logo-large">
              <Zap className="w-14 h-14 text-[#2d8cff]" />
              <span>FLUXCO</span>
            </div>
            <h1 className="title-headline">
              Rebuilding.<br />
              <span className="text-[#2d8cff]">American Power.</span>
            </h1>
            <p className="subtitle">
              The US electrical grid is undergoing its largest expansion of all
              time, and transformers are its backbone.
            </p>
          </div>
        </section>

        {/* ========== SLIDE 2: MARKET TRANSFORMATION ========== */}
        <section className="deck-section">
          <div className="content-area">
            <h2 className="slide-title">Market Transformation</h2>
            <div className="two-col">
              <div className="text-col">
                <h3 className="section-h3">From Stagnation to Explosion</h3>
                <p className="deck-p">
                  For 20 years, the market was flat. Now, three massive forces
                  are converging to create a vertical demand shock.
                </p>
                <ul className="deck-ul">
                  <li>
                    <strong>New Demand:</strong> AI Data Centers, EV Charging,
                    and Industrial Onshoring are driving unprecedented load growth.
                  </li>
                  <li>
                    <strong>Replacement:</strong> The "replacement cliff" of
                    aging 20th-century hardware compounds this shortage.
                  </li>
                </ul>
                <div className="chart-legend-inline">
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: "#2d8cff" }} />
                    New Demand (GW)
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: "#444" }} />
                    Replacement (GW)
                  </div>
                  <div className="legend-item">
                    <div className="legend-color legend-line" style={{ background: "#ccff00" }} />
                    Market Value ($B)
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                  {/* Grid */}
                  <line x1="60" y1="350" x2="540" y2="350" stroke="#333" strokeWidth="2" />
                  <line x1="60" y1="50" x2="540" y2="50" stroke="#333" strokeWidth="1" strokeDasharray="2" />

                  {/* Y Axis Left (GW) */}
                  <text x="50" y="355" fill="#888" fontFamily="Inter" fontSize="10" textAnchor="end">0</text>
                  <text x="50" y="295" fill="#888" fontFamily="Inter" fontSize="10" textAnchor="end">50</text>
                  <text x="50" y="235" fill="#888" fontFamily="Inter" fontSize="10" textAnchor="end">100</text>
                  <text x="50" y="175" fill="#888" fontFamily="Inter" fontSize="10" textAnchor="end">150</text>
                  <text x="50" y="115" fill="#888" fontFamily="Inter" fontSize="10" textAnchor="end">200</text>
                  <text x="50" y="55" fill="#888" fontFamily="Inter" fontSize="10" textAnchor="end">250</text>
                  <text x="25" y="200" fill="#888" fontFamily="Inter" fontSize="12" textAnchor="middle" transform="rotate(-90 25,200)">CAPACITY (GW)</text>

                  {/* Y Axis Right ($) */}
                  <text x="550" y="355" fill="#ccff00" fontFamily="Inter" fontSize="10" textAnchor="start">$0</text>
                  <text x="550" y="280" fill="#ccff00" fontFamily="Inter" fontSize="10" textAnchor="start">$20B</text>
                  <text x="550" y="205" fill="#ccff00" fontFamily="Inter" fontSize="10" textAnchor="start">$40B</text>
                  <text x="550" y="130" fill="#ccff00" fontFamily="Inter" fontSize="10" textAnchor="start">$60B</text>
                  <text x="550" y="55" fill="#ccff00" fontFamily="Inter" fontSize="10" textAnchor="start">$80B</text>
                  <text x="580" y="200" fill="#ccff00" fontFamily="Inter" fontSize="12" textAnchor="middle" transform="rotate(90 580,200)">MARKET VALUE ($)</text>

                  {/* Historical bars */}
                  {[
                    { x: 80, rh: 24, ry: 326, nh: 2, ny: 324, label: "2005", labelFill: "#666" },
                    { x: 145, rh: 22, ry: 324, nh: 4, ny: 320, label: "2010", labelFill: "#666" },
                    { x: 210, rh: 25, ry: 321, nh: 4, ny: 317, label: "2015", labelFill: "#666" },
                    { x: 275, rh: 27, ry: 317, nh: 6, ny: 311, label: "2020", labelFill: "#fff" },
                    { x: 340, rh: 36, ry: 295, nh: 30, ny: 265, label: "2025", labelFill: "#fff" },
                    { x: 405, rh: 42, ry: 280, nh: 132, ny: 148, label: "2030", labelFill: "#fff" },
                    { x: 470, rh: 48, ry: 270, nh: 228, ny: 42, label: "2035", labelFill: "#fff" },
                  ].map((bar) => (
                    <g key={bar.label} transform={`translate(${bar.x},0)`}>
                      <rect x="0" y={bar.ry} width="30" height={bar.rh} fill="#444" />
                      <rect x="0" y={bar.ny} width="30" height={bar.nh} fill="#2d8cff" />
                      <text x="15" y="370" fill={bar.labelFill} fontFamily="JetBrains Mono, monospace" fontSize="10" textAnchor="middle">{bar.label}</text>
                    </g>
                  ))}

                  {/* Trend Line ($) */}
                  <polyline
                    points="95,341 160,338 225,335 290,330 355,275 420,190 485,75"
                    fill="none" stroke="#ccff00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    filter="drop-shadow(0 0 4px rgba(204, 255, 0, 0.5))"
                  />
                  {[
                    [95, 341], [160, 338], [225, 335], [290, 330],
                    [355, 275], [420, 190], [485, 75],
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r={i > 3 ? 4 : 3} fill="#000" stroke="#ccff00" strokeWidth="2" />
                  ))}
                </svg>
              </div>
            </div>

            <div className="source-row">
              <p className="source-citation">Source: Global Market Insights &amp; Wood Mackenzie (2022 Base: $16.9B)</p>
              <span className="vance-link">
                VP JD Vance: &ldquo;Invest in strategic transformer reserve.&rdquo;
              </span>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 3: RESHORING ========== */}
        <section className="deck-section">
          <div className="content-area">
            <h2 className="slide-title">The Reshoring Equation</h2>
            <div className="two-col">
              <div className="text-col">
                <h3 className="section-h3">Automation &gt; Cheap Labor</h3>
                <p className="deck-p">
                  <strong>The Supply Trap:</strong> Outsourcing to Asia for labor
                  arbitrage created a brittle, tariff-heavy supply chain. Even
                  &ldquo;domestic&rdquo; supply is largely Mexican.
                </p>
                <p className="deck-p"><strong>The FluxCo Advantage:</strong></p>
                <ul className="deck-ul">
                  <li>
                    <strong>Automation:</strong> Robots neutralize the Asian
                    labor cost advantage.
                  </li>
                  <li>
                    <strong>Logistics:</strong> Building locally saves ~20% on
                    shipping massive steel units.
                  </li>
                  <li>
                    <strong>Compliance:</strong> Zero Tariffs. FEOC Compliant.
                    Immune to trade wars.
                  </li>
                </ul>
              </div>
              <div className="image-card">
                <Globe className="w-24 h-24 text-[#2d8cff] opacity-30" />
                <div className="image-card-label">Global Supply Chain &rarr; Domestic Manufacturing</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 4: REVENUE STREAMS ========== */}
        <section className="deck-section">
          <div className="content-area">
            <h2 className="slide-title">Powering American Industry</h2>
            <div className="tiles-grid">
              {[
                {
                  icon: <Cpu className="w-10 h-10 text-[#2d8cff]" />,
                  title: "1. Digital (AI)",
                  stat: "+450,000 GWh",
                  desc: "The new compute economy. Data centers are the steel mills of the 21st century.",
                },
                {
                  icon: <Factory className="w-10 h-10 text-[#2d8cff]" />,
                  title: "2. Physical",
                  stat: "+1,050,000 GWh",
                  desc: "Onshored Gigafactories for batteries and chips require massive infrastructure.",
                },
                {
                  icon: <Building2 className="w-10 h-10 text-[#2d8cff]" />,
                  title: "3. Infrastructure",
                  stat: "+1,200,000 GWh",
                  desc: "Upgrading the distribution grid for EVs and electrification.",
                },
              ].map((tile) => (
                <div key={tile.title} className="info-tile">
                  <div className="tile-icon">{tile.icon}</div>
                  <h3 className="section-h3">{tile.title}</h3>
                  <p className="deck-p">
                    <strong>{tile.stat}</strong> {tile.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="source-citation" style={{ marginTop: 30 }}>Sources: EIA, Wood Mackenzie, NREL</p>
          </div>
        </section>

        {/* ========== SLIDE 5: INDUSTRIAL LEAPFROG ========== */}
        <section className="deck-section split-section">
          <div className="split-text">
            <h2 className="slide-title">The Industrial Leapfrog</h2>
            <h3 className="section-h3">Anchored to the Past vs. Automation First</h3>
            <p className="deck-p">
              <strong>The Legacy Anchor:</strong> Incumbents are trapped by
              50-year-old, manual production capabilities. They cannot pivot to
              modern efficiency without abandoning billions in sunk capital.
            </p>
            <p className="deck-p">
              <strong>The FluxCo Edge:</strong> We start with a blank slate. Our{" "}
              <strong>Automation-First</strong> approach skips the
              &ldquo;retrofit&rdquo; phase entirely, deploying robotics and
              amorphous-native designs that legacy players simply cannot match.
            </p>
            <p className="source-citation">Concept: Disruption Theory / NIST MEP</p>
          </div>
          <div className="split-visual">
            <div className="leapfrog-visual">
              <div className="leap-box legacy">
                <div className="leap-label">Legacy</div>
                <div className="leap-items">
                  <span>Manual Labor</span>
                  <span>GOES Steel</span>
                  <span>50yr-old Tooling</span>
                  <span>Bespoke Designs</span>
                </div>
              </div>
              <div className="leap-arrow">
                <ArrowRight className="w-8 h-8 text-[#2d8cff]" />
              </div>
              <div className="leap-box fluxco">
                <div className="leap-label">FluxCo</div>
                <div className="leap-items">
                  <span>Robotic Winding</span>
                  <span>Amorphous Steel</span>
                  <span>Smart Factory</span>
                  <span>Modular Platform</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 6: CUSTOMER PAIN ========== */}
        <section className="deck-section">
          <div className="content-area center-content">
            <h2 className="slide-title" style={{ textAlign: "center", paddingLeft: 0 }}>
              <span className="slide-title-bar" />
              The Cost of Lost Capacity
            </h2>
            <div className="stat-row">
              <div className="stat-block">
                <div className="stat-number">12</div>
                <div className="stat-label">Months Lead Time (2020)</div>
              </div>
              <div className="stat-arrow">
                <ArrowRight className="w-10 h-10 text-[#333]" />
              </div>
              <div className="stat-block">
                <div className="stat-number">48</div>
                <div className="stat-label">Months Lead Time (Today)</div>
              </div>
            </div>
            <p className="deck-p" style={{ textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
              Utilities are desperate. We are bringing the lead time back to 12
              months by building here.
            </p>
          </div>
        </section>

        {/* ========== SLIDE 7: REGULATORY MOAT ========== */}
        <section className="deck-section">
          <div className="content-area">
            <h2 className="slide-title">Moat 1: Industrial Security</h2>
            <div className="two-col">
              <div className="text-col">
                <h3 className="section-h3">Domestic &amp; Tax-Credit Eligible</h3>
                <ul className="deck-ul">
                  <li>
                    <strong>The Trap:</strong> Incumbents import 80% of units,
                    often relying on Chinese (FEOC) supply chains.
                  </li>
                  <li>
                    <strong>The Law:</strong> New IRA rules strip 30-50% of tax
                    credits from projects using FEOC components.
                  </li>
                  <li>
                    <strong>Our Edge:</strong> FluxCo is 100% Domestic and
                    FEOC-Free. The <em>only</em> safe choice for tax-credit
                    eligible projects.
                  </li>
                </ul>
                <p className="source-citation">Source: U.S. Treasury (IRA Section 30D/45X)</p>
              </div>
              <div className="moat-visual">
                <Shield className="w-32 h-32 text-[#2d8cff] opacity-20" />
                <div className="moat-badges">
                  <div className="moat-badge">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    FEOC Compliant
                  </div>
                  <div className="moat-badge">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    100% Domestic
                  </div>
                  <div className="moat-badge">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    IRA 45X Eligible
                  </div>
                  <div className="moat-badge">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Zero Tariff Exposure
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 8: TECHNICAL MOAT ========== */}
        <section className="deck-section">
          <div className="content-area">
            <h2 className="slide-title">Moat 2: Efficiency Mandate</h2>
            <div className="two-col">
              <div className="text-col">
                <h3 className="section-h3">The Amorphous Revolution</h3>
                <ul className="deck-ul">
                  <li>
                    <strong>The Mandate:</strong> New DOE 2029 standards require
                    massive efficiency leaps that legacy steel (GOES) cannot
                    meet.
                  </li>
                  <li>
                    <strong>The Shift:</strong> Industry must shift to{" "}
                    <strong>Amorphous Steel</strong>. Incumbents have billions
                    locked in obsolete machinery.
                  </li>
                  <li>
                    <strong>Our Edge:</strong> FluxCo is Amorphous-Native.
                    Building the factory of 2030 today.
                  </li>
                </ul>
                <p className="source-citation">Source: DOE Efficiency Standards Final Rule (2024)</p>
              </div>
              <div className="efficiency-visual">
                <div className="eff-comparison">
                  <div className="eff-bar-group">
                    <div className="eff-label">Legacy (GOES)</div>
                    <div className="eff-bar-track">
                      <div className="eff-bar" style={{ width: "55%", background: "#444" }} />
                    </div>
                    <div className="eff-value">~96% Efficiency</div>
                  </div>
                  <div className="eff-bar-group">
                    <div className="eff-label">FluxCo (Amorphous)</div>
                    <div className="eff-bar-track">
                      <div className="eff-bar" style={{ width: "92%", background: "linear-gradient(90deg, #2d8cff, #ccff00)" }} />
                    </div>
                    <div className="eff-value">~99.5% Efficiency</div>
                  </div>
                </div>
                <p className="eff-note">
                  70% lower core losses = massive lifecycle savings for utilities
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 9: SOLUTION ========== */}
        <section className="deck-section">
          <div className="content-area">
            <h2 className="slide-title">The American Gigafactory</h2>
            <div className="two-col">
              <div className="text-col">
                <h3 className="section-h3">Bringing Manufacturing Back</h3>
                <p className="deck-p">
                  We are building the first fully automated, amorphous-native
                  transformer gigafactory in the US.
                </p>
                <ul className="deck-ul">
                  <li>
                    <strong>Automated Winding:</strong> Robotics replace manual
                    labor, reducing production time by 60%.
                  </li>
                  <li>
                    <strong>Standardized Design:</strong> Modular units instead
                    of bespoke &ldquo;snowflakes.&rdquo;
                  </li>
                  <li>
                    <strong>Domestic Core:</strong> Secured US steel supply for
                    FEOC compliance.
                  </li>
                </ul>
              </div>
              <div className="factory-visual">
                <div className="factory-stats">
                  {[
                    { icon: <Clock className="w-6 h-6" />, label: "Production Time", value: "-60%" },
                    { icon: <DollarSign className="w-6 h-6" />, label: "Labor Cost", value: "-40%" },
                    { icon: <TrendingUp className="w-6 h-6" />, label: "Output / Year", value: "1,000+" },
                    { icon: <Shield className="w-6 h-6" />, label: "FEOC Status", value: "100%" },
                  ].map((s) => (
                    <div key={s.label} className="factory-stat-card">
                      <div className="fsc-icon">{s.icon}</div>
                      <div>
                        <div className="fsc-value">{s.value}</div>
                        <div className="fsc-label">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SLIDE 10: TIMELINE ========== */}
        <section className="deck-section">
          <div className="content-area">
            <h2 className="slide-title">Roadmap to Independence</h2>
            <div className="timeline">
              <div className="timeline-line-h" />
              {[
                {
                  year: "2026",
                  title: "Marketplace & Assembly",
                  desc: "Launching marketplace to aggregate demand. First US assembly lines for immediate FEOC-compliant delivery.",
                },
                {
                  year: "2027",
                  title: "Vertical Integration",
                  desc: "Breaking ground on domestic Amorphous Steel. Removing foreign feedstock dependency.",
                },
                {
                  year: "2028",
                  title: "Gigafactory Scale",
                  desc: "Full automation. Raw material independence. Delivering thousands of units annually.",
                },
              ].map((item) => (
                <div key={item.year} className="timeline-item">
                  <div className="timeline-dot" />
                  <h3 className="timeline-year">{item.year}</h3>
                  <strong className="timeline-title">{item.title}</strong>
                  <p className="timeline-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SLIDE 11: CLOSING ========== */}
        <section className="deck-section closing-section">
          <div className="closing-content">
            <Zap className="w-16 h-16 text-[#2d8cff] mb-6 opacity-60" />
            <h2 className="closing-headline">Powering the Renaissance</h2>
            <p className="closing-sub">
              The grid is the backbone of the American economy. Join FluxCo in
              rebuilding the industrial might that powers the next century.
            </p>
            <div className="closing-cta">INVEST IN SOVEREIGNTY</div>
            <div className="closing-contact">
              <p>brian@fluxco.com</p>
              <p>fluxco.com</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* =====================================================================
   ALL STYLES — kept in a single template literal for isolation
   ===================================================================== */
const deckStyles = `
  /* Reset for this page */
  body {
    background: #080808 !important;
    overflow: hidden !important;
  }

  /* Hide the site's normal content wrappers if any bleed through */
  .deck-scroll-container {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    -webkit-overflow-scrolling: touch;
    z-index: 1;
  }

  /* Each section is a full-viewport slide */
  .deck-section {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    scroll-snap-align: start;
    position: relative;
    background: #0f0f0f;
    overflow: hidden;
  }
  .deck-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(45, 140, 255, 0.04), transparent 50%);
    pointer-events: none;
  }

  /* Navigation */
  .deck-controls {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    gap: 10px;
    background: rgba(0,0,0,0.6);
    padding: 10px;
    border-radius: 8px;
    backdrop-filter: blur(10px);
    border: 1px solid #333;
  }
  .control-btn {
    background: transparent;
    border: 1px solid #444;
    color: #fff;
    width: 40px; height: 40px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .control-btn:hover { background: #2d8cff; border-color: #2d8cff; }
  .slide-counter {
    font-family: 'JetBrains Mono', monospace;
    color: #888;
    display: flex;
    align-items: center;
    padding: 0 10px;
    font-size: 14px;
  }
  .scroll-hint {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: #666;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 2px;
    cursor: pointer;
    transition: opacity 0.3s;
  }

  /* ---- TITLE SECTION ---- */
  .title-section {
    background: #050505;
  }
  .title-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 70% 30%, rgba(45,140,255,0.08) 0%, transparent 60%),
      radial-gradient(ellipse at 30% 70%, rgba(45,140,255,0.03) 0%, transparent 50%);
  }
  .title-overlay {
    position: relative;
    z-index: 2;
    padding: 80px;
    max-width: 900px;
  }
  .flux-logo-large {
    font-family: 'Oswald', sans-serif;
    font-weight: 700;
    font-size: 48px;
    letter-spacing: 2px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 15px;
    text-transform: uppercase;
    margin-bottom: 30px;
  }
  .title-headline {
    font-family: 'Oswald', sans-serif;
    color: #fff;
    font-size: clamp(60px, 10vw, 110px);
    font-weight: 700;
    line-height: 0.9;
    text-transform: uppercase;
    margin: 0 0 30px 0;
  }
  .subtitle {
    font-family: 'Inter', sans-serif;
    font-size: clamp(16px, 2vw, 24px);
    color: #ccc;
    max-width: 700px;
    font-weight: 400;
    line-height: 1.4;
  }

  /* ---- CONTENT AREA ---- */
  .content-area {
    padding: 60px 80px;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    z-index: 1;
  }
  .center-content {
    align-items: center;
    text-align: center;
  }

  /* ---- TYPOGRAPHY ---- */
  .slide-title {
    font-family: 'Oswald', sans-serif;
    color: #fff;
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 40px;
    position: relative;
    padding-left: 20px;
  }
  .slide-title::before {
    content: '';
    position: absolute;
    left: 0; top: 8px; bottom: 8px;
    width: 6px;
    background: #2d8cff;
    border-radius: 3px;
  }
  .slide-title-bar { display: none; } /* for center-aligned titles */

  .section-h3 {
    font-family: 'Oswald', sans-serif;
    color: #fff;
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 15px;
    text-transform: uppercase;
  }
  .deck-p {
    color: #b0b0b0;
    font-size: 16px;
    line-height: 1.7;
    margin-bottom: 15px;
    font-family: 'Inter', sans-serif;
  }
  .deck-p strong { color: #fff; font-weight: 600; }

  .deck-ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .deck-ul li {
    position: relative;
    padding-left: 28px;
    margin-bottom: 16px;
    color: #b0b0b0;
    font-size: 16px;
    line-height: 1.6;
    font-family: 'Inter', sans-serif;
  }
  .deck-ul li::before {
    content: '';
    position: absolute;
    left: 0; top: 7px;
    width: 14px; height: 14px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232d8cff' stroke-width='3'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E") center/contain no-repeat;
  }
  .deck-ul li strong { color: #fff; font-weight: 600; }

  .source-citation {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    color: #555;
    margin-top: 30px;
    border-top: 1px solid #222;
    padding-top: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .source-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    border-top: 1px solid #222;
    padding-top: 15px;
    width: 100%;
  }
  .source-row .source-citation { margin: 0; border: none; padding: 0; }
  .vance-link {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    color: #2d8cff;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border: 1px solid #333;
    background: rgba(45, 140, 255, 0.05);
    border-radius: 4px;
    white-space: nowrap;
  }

  /* ---- TWO COLUMN ---- */
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 60px;
    width: 100%;
    align-items: center;
  }
  @media (max-width: 900px) {
    .two-col { grid-template-columns: 1fr; gap: 30px; }
    .content-area { padding: 40px 30px; }
    .title-overlay { padding: 40px 30px; }
  }

  /* ---- CHART ---- */
  .chart-container {
    background: #151515;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 20px;
    aspect-ratio: 3 / 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .chart-legend-inline {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
  }
  .legend-item {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .legend-color { width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0; }
  .legend-line { height: 2px !important; width: 12px; }

  /* ---- IMAGE CARD (placeholder) ---- */
  .image-card {
    background: #151515;
    border: 1px solid #333;
    border-radius: 4px;
    height: 100%;
    min-height: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }
  .image-card-label {
    color: #555;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* ---- TILES ---- */
  .tiles-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
    width: 100%;
  }
  @media (max-width: 900px) {
    .tiles-grid { grid-template-columns: 1fr; }
  }
  .info-tile {
    background: #151515;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 35px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .info-tile:hover {
    border-color: #2d8cff;
    transform: translateY(-2px);
  }
  .tile-icon { margin-bottom: 20px; }

  /* ---- SPLIT SECTION ---- */
  .split-section {
    flex-direction: row !important;
  }
  .split-text {
    flex: 1;
    padding: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-right: 1px solid #222;
    z-index: 2;
  }
  .split-visual {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    background: #0a0a0a;
  }
  @media (max-width: 900px) {
    .split-section { flex-direction: column !important; }
    .split-text { border-right: none; border-bottom: 1px solid #222; padding: 40px 30px; }
    .split-visual { padding: 30px; }
  }

  /* Leapfrog visual */
  .leapfrog-visual {
    display: flex;
    align-items: center;
    gap: 30px;
    width: 100%;
  }
  .leap-box {
    flex: 1;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 25px;
    text-align: center;
  }
  .leap-box.legacy { background: #1a1a1a; border-color: #333; }
  .leap-box.fluxco { background: rgba(45,140,255,0.05); border-color: #2d8cff; }
  .leap-label {
    font-family: 'Oswald', sans-serif;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 15px;
  }
  .leap-box.legacy .leap-label { color: #666; }
  .leap-box.fluxco .leap-label { color: #2d8cff; }
  .leap-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .leap-items span {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #888;
    padding: 6px 0;
    border-bottom: 1px solid #222;
  }
  .leap-box.fluxco .leap-items span { color: #ccc; border-color: rgba(45,140,255,0.15); }
  .leap-arrow { flex-shrink: 0; }

  /* ---- STAT ROW ---- */
  .stat-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 60px;
    margin-bottom: 40px;
  }
  .stat-block { text-align: center; }
  .stat-number {
    font-family: 'Oswald', sans-serif;
    font-size: clamp(80px, 12vw, 130px);
    font-weight: 700;
    color: #2d8cff;
    line-height: 1;
  }
  .stat-label {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #fff;
    margin-top: 10px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1px;
  }
  .stat-arrow { color: #333; }

  /* ---- MOAT VISUAL ---- */
  .moat-visual {
    background: #151515;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
    min-height: 350px;
    position: relative;
  }
  .moat-badges {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 100%;
  }
  .moat-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border: 1px solid #333;
    border-radius: 4px;
    background: rgba(45,140,255,0.03);
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #ccc;
    font-weight: 500;
  }

  /* ---- EFFICIENCY VISUAL ---- */
  .efficiency-visual {
    background: #151515;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 40px;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 20px;
  }
  .eff-comparison {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  .eff-bar-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .eff-label {
    font-family: 'Oswald', sans-serif;
    font-size: 16px;
    color: #ccc;
    text-transform: uppercase;
  }
  .eff-bar-track {
    width: 100%;
    height: 32px;
    background: #222;
    border-radius: 4px;
    overflow: hidden;
  }
  .eff-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 1s ease;
  }
  .eff-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: #888;
  }
  .eff-note {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #2d8cff;
    text-align: center;
    margin-top: 10px;
    font-weight: 500;
  }

  /* ---- FACTORY VISUAL ---- */
  .factory-visual {
    background: #151515;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 30px;
    min-height: 350px;
    display: flex;
    align-items: center;
  }
  .factory-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    width: 100%;
  }
  .factory-stat-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    border: 1px solid #333;
    border-radius: 4px;
    background: rgba(45,140,255,0.03);
  }
  .fsc-icon { color: #2d8cff; flex-shrink: 0; }
  .fsc-value {
    font-family: 'Oswald', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
  }
  .fsc-label {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  /* ---- TIMELINE ---- */
  .timeline {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    width: 100%;
    margin-top: 40px;
    padding-top: 40px;
  }
  .timeline-line-h {
    position: absolute;
    top: 47px; left: 0; width: 100%;
    height: 2px;
    background: #333;
  }
  .timeline-item {
    position: relative;
    width: 30%;
    text-align: center;
    padding-top: 30px;
  }
  .timeline-dot {
    position: absolute;
    top: -3px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px; height: 16px;
    background: #0f0f0f;
    border: 3px solid #2d8cff;
    border-radius: 50%;
    z-index: 2;
  }
  .timeline-year {
    font-family: 'Oswald', sans-serif;
    color: #2d8cff;
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 10px;
  }
  .timeline-title {
    font-family: 'Inter', sans-serif;
    color: #fff;
    font-size: 16px;
    display: block;
    margin-bottom: 10px;
  }
  .timeline-desc {
    font-family: 'Inter', sans-serif;
    color: #888;
    font-size: 14px;
    line-height: 1.6;
  }

  /* ---- CLOSING ---- */
  .closing-section {
    background: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%);
    align-items: center;
    text-align: center;
  }
  .closing-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
    padding: 80px;
  }
  .closing-headline {
    font-family: 'Oswald', sans-serif;
    font-size: clamp(40px, 6vw, 64px);
    font-weight: 700;
    color: #fff;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .closing-sub {
    font-family: 'Inter', sans-serif;
    font-size: 20px;
    color: #b0b0b0;
    max-width: 700px;
    line-height: 1.5;
    margin-bottom: 30px;
  }
  .closing-cta {
    color: #2d8cff;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 14px 40px;
    border: 1px solid rgba(45,140,255,0.3);
    border-radius: 4px;
    margin-bottom: 40px;
  }
  .closing-contact p {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: #666;
    margin-bottom: 5px;
  }
`;
