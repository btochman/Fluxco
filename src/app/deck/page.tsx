"use client";

import { useEffect, useState, useRef } from "react";
import {
  Zap, ArrowRight, ArrowLeft, ChevronDown, Shield, Factory, Cpu, Building2,
  Globe, Clock, DollarSign, CheckCircle, TrendingUp, Search, BarChart3,
  Users, Wrench, Bot, Sparkles, AlertTriangle, Eye, Target,
} from "lucide-react";

const TOTAL_SECTIONS = 10;

export default function DeckPage() {
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

  const goTo = (index: number) => {
    containerRef.current?.scrollTo({
      top: index * window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{deckStyles}</style>

      {/* Nav Controls */}
      <div className="deck-controls">
        <button className="control-btn" onClick={() => goTo(Math.max(currentSection - 1, 0))} aria-label="Previous"><ArrowLeft className="w-4 h-4" /></button>
        <div className="slide-counter">{currentSection + 1} / {TOTAL_SECTIONS}</div>
        <button className="control-btn" onClick={() => goTo(Math.min(currentSection + 1, TOTAL_SECTIONS - 1))} aria-label="Next"><ArrowRight className="w-4 h-4" /></button>
      </div>

      {currentSection === 0 && (
        <div className="scroll-hint" onClick={() => goTo(1)}>
          <ChevronDown className="w-5 h-5 animate-bounce" />
          <span>Scroll</span>
        </div>
      )}

      <div ref={containerRef} className="deck-scroll-container">

        {/* ================================================================
            SLIDE 1 — TITLE
        ================================================================ */}
        <section className="deck-section title-section">
          <div className="title-bg" />
          <div className="title-overlay">
            <div className="flux-logo-large">
              <Zap className="w-14 h-14 text-[var(--flux-blue)]" />
              <span>FLUXCO</span>
            </div>
            <h1 className="title-headline">
              Rebuilding.<br />
              <span style={{ color: "var(--flux-blue)" }}>American Power.</span>
            </h1>
            <p className="subtitle">
              The US electrical grid is undergoing its largest expansion of all
              time, and transformers are its backbone. We&apos;re building the
              company to supply it.
            </p>
          </div>
        </section>

        {/* ================================================================
            SLIDE 2 — THE MARKET EXPLOSION (merged old 2 + 4)
        ================================================================ */}
        <section className="deck-section has-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1753907537890-f20de9e116cc?w=1920&q=80)' }}>
          <div className="content-area">
            <h2 className="slide-title">The Market Explosion</h2>
            <div className="two-col">
              <div className="text-col">
                <h3 className="section-h3">20 Years Flat. Now Vertical.</h3>
                <p className="deck-p">
                  For two decades, US electricity demand was{" "}
                  <strong>stagnant</strong> &mdash; the country simply got more
                  efficient. Now, three massive forces are converging into the
                  largest demand shock since rural electrification.
                </p>

                {/* Demand drivers — exploded out with stats */}
                <div className="driver-cards">
                  <div className="driver-card">
                    <Cpu className="w-6 h-6 text-[var(--flux-blue)]" />
                    <div>
                      <strong>AI &amp; Data Centers</strong>
                      <span className="driver-stat">+450,000 GWh</span>
                    </div>
                  </div>
                  <div className="driver-card">
                    <Building2 className="w-6 h-6 text-[var(--flux-blue)]" />
                    <div>
                      <strong>Industrial Onshoring</strong>
                      <span className="driver-stat">+1,050,000 GWh</span>
                    </div>
                  </div>
                  <div className="driver-card">
                    <Zap className="w-5 h-5 text-[var(--flux-blue)]" />
                    <div>
                      <strong>EV &amp; Electrification</strong>
                      <span className="driver-stat">+1,200,000 GWh</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="chart-with-legend">
              <div className="chart-container">
                <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                  <line x1="60" y1="350" x2="540" y2="350" stroke="#333" strokeWidth="2" />
                  <line x1="60" y1="50" x2="540" y2="50" stroke="#333" strokeWidth="1" strokeDasharray="2" />

                  {/* Y Left (GW) */}
                  {[0, 50, 100, 150, 200, 250].map((v, i) => (
                    <text key={v} x="50" y={355 - i * 60} fill="#888" fontFamily="Inter" fontSize="10" textAnchor="end">{v}</text>
                  ))}
                  <text x="25" y="200" fill="#888" fontFamily="Inter" fontSize="12" textAnchor="middle" transform="rotate(-90 25,200)">CAPACITY (GW)</text>

                  {/* Y Right ($) — red */}
                  {["$0", "$20B", "$40B", "$60B", "$80B"].map((v, i) => (
                    <text key={v} x="550" y={355 - i * 75} fill="var(--flux-red)" fontFamily="Inter" fontSize="10" textAnchor="start">{v}</text>
                  ))}
                  <text x="580" y="200" fill="var(--flux-red)" fontFamily="Inter" fontSize="12" textAnchor="middle" transform="rotate(90 580,200)">MARKET VALUE ($)</text>

                  {/* Bars — gray (existing/replacement) anchored to x-axis, blue (new demand) stacked on top */}
                  {/* Scale: y=350 is 0 GW, y=50 is 250 GW → 1.2 px per GW */}
                  {[
                    { x: 80,  repl: 20, newD: 2,   label: "2005", lf: "#666" },
                    { x: 145, repl: 18, newD: 3,   label: "2010", lf: "#666" },
                    { x: 210, repl: 21, newD: 4,   label: "2015", lf: "#666" },
                    { x: 275, repl: 23, newD: 5,   label: "2020", lf: "#fff" },
                    { x: 340, repl: 30, newD: 25,  label: "2025", lf: "#fff" },
                    { x: 405, repl: 35, newD: 110, label: "2030", lf: "#fff" },
                    { x: 470, repl: 40, newD: 190, label: "2035", lf: "#fff" },
                  ].map((b) => {
                    const pxPerGW = 300 / 250; // 1.2 px per GW
                    const replH = b.repl * pxPerGW;
                    const newH = b.newD * pxPerGW;
                    const replY = 350 - replH;       // gray anchored to baseline
                    const newY = replY - newH;        // blue stacked on top
                    return (
                      <g key={b.label} transform={`translate(${b.x},0)`}>
                        <rect x="0" y={replY} width="30" height={replH} fill="#7a8494" stroke="#9aa3b0" strokeWidth="0.5" />
                        <rect x="0" y={newY} width="30" height={newH} fill="var(--flux-blue)" />
                        <text x="15" y="370" fill={b.lf} fontFamily="JetBrains Mono, monospace" fontSize="10" textAnchor="middle">{b.label}</text>
                      </g>
                    );
                  })}

                  {/* Trend line — RED (market value on right axis) */}
                  {/* Right axis: y=355 = $0, y=55 = $80B → 3.75 px per $1B */}
                  {(() => {
                    const pxPerB = 300 / 80; // 3.75 px per $B
                    const pts: [number, number][] = [
                      [95,  5],    // 2005: ~$5B
                      [160, 7],    // 2010: ~$7B
                      [225, 8],    // 2015: ~$8B
                      [290, 12],   // 2020: ~$12B
                      [355, 22],   // 2025: ~$22B
                      [420, 45],   // 2030: ~$45B
                      [485, 75],   // 2035: ~$75B
                    ].map(([cx, valB]) => [cx, 355 - valB * pxPerB] as [number, number]);
                    return (
                      <>
                        <polyline
                          points={pts.map(([x,y]) => `${x},${y}`).join(" ")}
                          fill="none" stroke="var(--flux-red)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                          filter="drop-shadow(0 0 4px rgba(200, 30, 30, 0.5))"
                        />
                        {pts.map(([cx,cy], i) => (
                          <circle key={i} cx={cx} cy={cy} r={i > 3 ? 4 : 3} fill="#000" stroke="var(--flux-red)" strokeWidth="2" />
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
              <div className="chart-legend-below">
                <div className="legend-item"><div className="legend-color" style={{ background: "var(--flux-blue)" }} />New Demand (GW)</div>
                <div className="legend-item"><div className="legend-color" style={{ background: "#7a8494", border: "1px solid #9aa3b0" }} />Existing / Replacement (GW)</div>
                <div className="legend-item"><div className="legend-color legend-line" style={{ background: "var(--flux-red)" }} />Market Value ($B)</div>
              </div>
              </div>
            </div>

            <div className="source-row">
              <p className="source-citation" style={{ margin: 0, border: "none", padding: 0 }}>Sources: Wood Mackenzie, EIA, Grid Strategies, S&amp;P Global, NREL</p>
              <div className="quotes-row">
                <a href="https://x.com/oguzerkan/status/2016480187790065829" target="_blank" rel="noopener noreferrer" className="vance-quote">
                  <div className="vance-label">Elon Musk</div>
                  <div className="vance-text">&ldquo;The voltage transformer shortage is the main bottleneck for scaling AI right now.&rdquo;</div>
                </a>
                <a href="https://x.com/MarioNawfal/status/1852185875611791550" target="_blank" rel="noopener noreferrer" className="vance-quote vance-with-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://pbs.twimg.com/ext_tw_video_thumb/1852181052753612800/pu/img/z4CG1GiIUOZcziC6.jpg" alt="JD Vance on Joe Rogan" className="vance-thumb" />
                  <div>
                    <div className="vance-label">VP JD Vance <span style={{ opacity: 0.5, fontWeight: 400 }}>on Joe Rogan</span></div>
                    <div className="vance-text">&ldquo;We should have a backup power transformer for every major system in the United States.&rdquo;</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SLIDE 3 — THE CRISIS: WE OUTSOURCED EVERYTHING
        ================================================================ */}
        <section className="deck-section has-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1619033476025-71cc6bd8c3f5?w=1920&q=80)' }}>
          <div className="content-area">
            <h2 className="slide-title">We Have No Capacity</h2>
            <div className="two-col" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
              <div className="text-col">
                <h3 className="section-h3">85% of Production. 99% of Capabilities. Offshore.</h3>
                <p className="deck-p">
                  Over decades, the US outsourced virtually all transformer
                  manufacturing knowledge and capacity to India, China, and
                  Southeast Asia. What little &ldquo;domestic&rdquo; supply
                  remains is largely Mexican assembly operations.
                </p>
                <p className="deck-p">
                  Meanwhile, demand has exploded. Lead times have gone from{" "}
                  <strong>12 months to 48+ months</strong>. Pricing continues
                  to climb. Every utility and data center operator in the
                  country is desperate for supply.
                </p>
                <ul className="deck-ul">
                  <li><strong>Tariffs:</strong> 25%+ on imported units, rising under every administration.</li>
                  <li><strong>IRA Tax Credits (45X):</strong> Only available for domestically manufactured, FEOC-compliant equipment.</li>
                  <li><strong>National Security:</strong> Executive orders now classify transformers as critical infrastructure.</li>
                </ul>
                <p className="deck-p" style={{ marginTop: 10 }}>
                  Everyone wants American-made. It barely exists.
                </p>
              </div>
              <div className="crisis-visual">
                <div className="crisis-stat">
                  <div className="crisis-num">85<span className="crisis-pct">%</span></div>
                  <div className="crisis-label">Production Offshore</div>
                </div>
                <div className="crisis-divider" />
                <div className="crisis-stat">
                  <div className="crisis-num">48<span className="crisis-pct">mo</span></div>
                  <div className="crisis-label">Average Lead Time</div>
                </div>
                <div className="crisis-divider" />
                <div className="crisis-stat">
                  <div className="crisis-num">6x</div>
                  <div className="crisis-label">Price Spread on Same Unit</div>
                </div>
              </div>
            </div>
            <p className="source-citation">Sources: DOE, U.S. Treasury (IRA 30D/45X), ACORE, T&amp;D World</p>
          </div>
        </section>

        {/* ================================================================
            SLIDE 4 — THE OPPORTUNITY: AN OPAQUE MARKET
        ================================================================ */}
        <section className="deck-section">
          <div className="content-area">
            <h2 className="slide-title">A $20B+ Opaque Market</h2>
            <div className="two-col">
              <div className="text-col">
                <h3 className="section-h3">A New Buyer, An Impossible Process</h3>
                <p className="deck-p">
                  Historically, transformers were bought by utilities. Now,
                  <strong> commercial and industrial buyers</strong> &mdash;
                  data centers, manufacturers, developers &mdash; are
                  circumventing utilities and buying directly. They&apos;re
                  spending tens of millions on equipment they barely understand.
                </p>
                <p className="deck-p">
                  The market is wildly inefficient: hundreds of OEMs worldwide,
                  all with terrible websites and a &ldquo;contact us&rdquo;
                  form. No pricing transparency. No way to compare. A single
                  procurement person might manage to get 5&ndash;10 bids &mdash;
                  uneducated bids, because they lack market expertise.
                </p>
                <p className="deck-p">
                  <strong>Real example:</strong> We bid a 20 MVA unit. One
                  supplier quoted <strong>$200,000</strong>. Another quoted{" "}
                  <strong>$1.3 million</strong>. Same spec. <strong>6x price spread.</strong>
                </p>
                <p className="deck-p" style={{ color: "var(--flux-blue)", fontWeight: 500 }}>
                  Inefficient markets are where new entrants win.
                </p>
              </div>
              <div className="opportunity-visual">
                <div className="opp-icon-row">
                  <AlertTriangle className="w-10 h-10 text-[var(--flux-red)] opacity-60" />
                  <span className="opp-headline">The Buyer&apos;s Problem</span>
                </div>
                <div className="opp-items">
                  <div className="opp-item">
                    <Search className="w-5 h-5" />
                    <span>100s of OEMs, impossible to find &amp; compare</span>
                  </div>
                  <div className="opp-item">
                    <DollarSign className="w-5 h-5" />
                    <span>Zero pricing transparency &mdash; 6x spreads</span>
                  </div>
                  <div className="opp-item">
                    <Users className="w-5 h-5" />
                    <span>Procurement staff are not transformer experts</span>
                  </div>
                  <div className="opp-item">
                    <Globe className="w-5 h-5" />
                    <span>No visibility on origin, compliance, or quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SLIDE 5 — THE WEDGE: FLUXCO MARKETPLACE
        ================================================================ */}
        <section className="deck-section">
          <div className="content-area">
            <h2 className="slide-title">Our Wedge: The FluxCo Marketplace</h2>
            <div className="two-col">
              <div className="text-col">
                <h3 className="section-h3">The Chief Transformer Officer</h3>
                <p className="deck-p">
                  It will never make sense for a procurement person to become a
                  transformer expert. It&apos;s one of many things they buy
                  &mdash; but one of the most expensive.
                </p>
                <p className="deck-p">
                  <strong>FluxCo becomes their CTO</strong> (Chief Transformer
                  Officer). Customers give us their spec. Our{" "}
                  <strong>free proprietary Spec Builder</strong> automates the
                  design, then we bid it across dozens &mdash; even hundreds
                  &mdash; of global suppliers.
                </p>
                <ul className="deck-ul">
                  <li><strong>Full visibility:</strong> price, lead time, quality, certifications, FEOC compliance &mdash; all side-by-side.</li>
                  <li><strong>Impossible otherwise:</strong> what takes a buyer weeks of calls, we do in hours.</li>
                  <li><strong>Revenue model:</strong> transaction fees on every unit sourced through the platform.</li>
                </ul>
              </div>
              <div className="marketplace-visual">
                <div className="mp-flow">
                  <div className="mp-step">
                    <div className="mp-step-icon"><Target className="w-6 h-6" /></div>
                    <div className="mp-step-label">Customer Spec</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#444] flex-shrink-0" />
                  <div className="mp-step active">
                    <div className="mp-step-icon"><Zap className="w-6 h-6" /></div>
                    <div className="mp-step-label">FluxCo Spec Builder</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#444] flex-shrink-0" />
                  <div className="mp-step">
                    <div className="mp-step-icon"><BarChart3 className="w-6 h-6" /></div>
                    <div className="mp-step-label">100+ OEM Bids</div>
                  </div>
                </div>
                <div className="mp-secret">
                  <Eye className="w-5 h-5 text-[var(--flux-blue)]" />
                  <div>
                    <strong>The Secret Weapon</strong>
                    <p className="deck-p" style={{ fontSize: 13, marginBottom: 0 }}>
                      Every bid teaches us who supplies what, at what price, at
                      what lead time. We&apos;re building the most comprehensive
                      market intelligence engine in the industry.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SLIDE 6 — THE VISION: AMERICAN MANUFACTURING (CENTERPIECE)
        ================================================================ */}
        <section className="deck-section vision-section has-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1619885067109-e1dbec4e7cd0?w=1920&q=80)' }}>
          <div className="content-area">
            <h2 className="slide-title">The Product is Good. We&apos;re Making it Great.</h2>
            <div className="two-col" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
              <div className="text-col">
                <h3 className="section-h3">It Starts With the Process.</h3>
                <p className="deck-p">
                  The transformer itself is proven technology &mdash; the physics
                  haven&apos;t changed in a century. What&apos;s broken is{" "}
                  <strong>how they&apos;re built</strong>. Traditional manufacturers
                  treat every unit as a one-off craft project &mdash; hand-cut steel,
                  hand-stacked cores, hand-wound coils. Our approach:{" "}
                  <strong>non-deterministic automation</strong> &mdash; robotics guided
                  by AI vision and adaptive control &mdash; so a custom product flows
                  through the line like a repetitive one.
                </p>
                <p className="deck-p" style={{ color: "var(--flux-blue)", fontWeight: 500 }}>
                  Perfect the process, and you can build infinite variations of a
                  great product with the same speed and cost as mass production.
                </p>
                <div className="tech-stack">
                  <div className="tech-item">
                    <div className="tech-icon"><Cpu className="w-5 h-5" /></div>
                    <div>
                      <strong>CNC Laser Cutting</strong>
                      <span>GEORG-grade precision cutting of grain-oriented electrical steel. Sub-mm tolerances on every lamination &mdash; no manual die changes between specs.</span>
                    </div>
                  </div>
                  <div className="tech-item">
                    <div className="tech-icon"><Bot className="w-5 h-5" /></div>
                    <div>
                      <strong>Vision-Guided Core Stacking</strong>
                      <span>Robotic arms with real-time machine vision adapt to any core geometry. Stack thousands of razor-sharp laminations with sub-mm precision &mdash; no reprogramming between designs.</span>
                    </div>
                  </div>
                  <div className="tech-item">
                    <div className="tech-icon"><Wrench className="w-5 h-5" /></div>
                    <div>
                      <strong>Adaptive CNC Winding</strong>
                      <span>Computer-controlled winding handles any coil spec &mdash; copper or aluminum, round or rectangular &mdash; without retooling. Recipe-driven, not jig-driven.</span>
                    </div>
                  </div>
                  <div className="tech-item">
                    <div className="tech-icon"><Eye className="w-5 h-5" /></div>
                    <div>
                      <strong>AI Quality at Line Speed</strong>
                      <span>Machine vision inspects every lamination and winding turn. Defects caught in milliseconds, not at final test. Automated partial-discharge and impedance testing on every unit.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="vision-visual">
                <div className="process-callout">
                  <Factory className="w-8 h-8 text-[var(--flux-blue)]" />
                  <div className="process-callout-text">
                    &ldquo;The product is great. The <em>process</em> makes it greater.&rdquo;
                  </div>
                </div>
                <div className="vision-stat-grid">
                  {[
                    { icon: <Bot className="w-7 h-7" />, value: "-60%", label: "Production Time" },
                    { icon: <DollarSign className="w-7 h-7" />, value: "-40%", label: "Labor Cost" },
                    { icon: <TrendingUp className="w-7 h-7" />, value: "\u221E", label: "Product Variants" },
                    { icon: <Shield className="w-7 h-7" />, value: "100%", label: "Inspected" },
                  ].map((s) => (
                    <div key={s.label} className="vision-stat-card">
                      <div className="vsc-icon">{s.icon}</div>
                      <div className="vsc-value">{s.value}</div>
                      <div className="vsc-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SLIDE 7 — THE INDUSTRIAL LEAPFROG
        ================================================================ */}
        <section className="deck-section split-section has-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1647427060118-4911c9821b82?w=1920&q=80)' }}>
          <div className="split-text">
            <h2 className="slide-title">The Industrial Leapfrog</h2>
            <h3 className="section-h3">Why Incumbents Can&apos;t Compete</h3>
            <p className="deck-p">
              The transformer is a great product held back by a terrible
              process. Incumbents invested billions in <strong>manual-labor
              factories</strong> they can&apos;t walk away from. Their process
              hasn&apos;t fundamentally changed in decades. Every unit is a
              craft project. That means they can&apos;t scale, can&apos;t cut
              costs, and can&apos;t attract the talent that&apos;s redefining
              manufacturing everywhere else.
            </p>
            <p className="deck-p">
              <strong>FluxCo starts from zero.</strong> No legacy tooling.
              We ask: &ldquo;What is the best way to <em>process</em> this
              product using today&apos;s automation?&rdquo; The result is a
              company that builds <strong>any custom spec</strong> with the
              economics of mass production &mdash; and that&apos;s{" "}
              <strong>magnetically attractive to talent</strong> who want to
              build the future.
            </p>
          </div>
          <div className="split-visual">
            <div className="leapfrog-visual">
              <div className="leap-box legacy">
                <div className="leap-label">Legacy Process</div>
                <div className="leap-items">
                  <span>Manual die cutting &amp; hand stacking</span>
                  <span>Fixed tooling per design</span>
                  <span>One-off engineering per order</span>
                  <span>Human visual inspection</span>
                  <span>Weeks-long test cycles</span>
                  <span>Billions in sunk CapEx</span>
                </div>
              </div>
              <div className="leap-arrow">
                <ArrowRight className="w-8 h-8 text-[var(--flux-blue)]" />
              </div>
              <div className="leap-box fluxco">
                <div className="leap-label">FluxCo Process</div>
                <div className="leap-items">
                  <span>CNC laser cut + robotic stacking</span>
                  <span>Vision-guided adaptive automation</span>
                  <span>Recipe-driven, infinite variations</span>
                  <span>AI inspection at line speed</span>
                  <span>Automated test in hours</span>
                  <span>Zero legacy baggage</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SLIDE 8 — OUR MOATS (regulatory + technical combined)
        ================================================================ */}
        <section className="deck-section">
          <div className="content-area">
            <h2 className="slide-title">Structural Moats</h2>
            <div className="moats-grid">
              {/* Moat 1: Compliance */}
              <div className="moat-card">
                <Shield className="w-8 h-8 text-[var(--flux-blue)]" />
                <h3 className="section-h3">Industrial Security</h3>
                <ul className="deck-ul">
                  <li>100% domestic, FEOC-free &mdash; the <em>only</em> safe choice for tax-credit projects.</li>
                  <li>IRA 45X credits strip 30&ndash;50% from FEOC-tainted projects. We&apos;re immune.</li>
                  <li>Zero tariff exposure. Zero trade war risk.</li>
                </ul>
              </div>
              {/* Moat 2: Efficiency */}
              <div className="moat-card">
                <Sparkles className="w-8 h-8 text-[var(--flux-blue)]" />
                <h3 className="section-h3">Efficiency Mandate</h3>
                <ul className="deck-ul">
                  <li>DOE 2029 standards require efficiency leaps that legacy GOES steel cannot meet.</li>
                  <li>Industry must shift to <strong>amorphous steel</strong>. Incumbents can&apos;t retool.</li>
                  <li>Smart bolt-on technologies (monitoring, SCADA) add further differentiation.</li>
                </ul>
              </div>
              {/* Moat 3: Automation */}
              <div className="moat-card">
                <Bot className="w-8 h-8 text-[var(--flux-blue)]" />
                <h3 className="section-h3">Automation Advantage</h3>
                <ul className="deck-ul">
                  <li>Robotics neutralize Asian labor arbitrage.</li>
                  <li>Building locally saves ~20% on shipping massive steel units.</li>
                  <li>Vertical integration from raw amorphous steel to finished product.</li>
                </ul>
              </div>
              {/* Moat 4: Intelligence */}
              <div className="moat-card">
                <BarChart3 className="w-8 h-8 text-[var(--flux-blue)]" />
                <h3 className="section-h3">Market Intelligence</h3>
                <ul className="deck-ul">
                  <li>Marketplace generates real-time pricing, lead time, and capacity data across 100+ OEMs.</li>
                  <li>We know exactly what to build, where the margin is, and who can&apos;t deliver.</li>
                  <li>No other manufacturer has this data advantage.</li>
                </ul>
              </div>
            </div>
            <p className="source-citation">Sources: U.S. Treasury (IRA 45X), DOE Efficiency Standards (2024), NIST MEP</p>
          </div>
        </section>

        {/* ================================================================
            SLIDE 9 — ROADMAP
        ================================================================ */}
        <section className="deck-section has-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1745448797901-2a4c9d9af1c1?w=1920&q=80)' }}>
          <div className="content-area">
            <h2 className="slide-title">Roadmap to Independence</h2>
            <div className="timeline">
              <div className="timeline-line-h" />
              {[
                {
                  year: "2026",
                  title: "Marketplace & Assembly",
                  desc: "Launch marketplace to aggregate demand and collect intelligence. First US assembly lines for immediate FEOC-compliant delivery. Generate revenue from day one.",
                },
                {
                  year: "2027",
                  title: "Vertical Integration",
                  desc: "Break ground on automated factory. Begin domestic amorphous steel production. Eliminate foreign feedstock dependency.",
                },
                {
                  year: "2028+",
                  title: "Gigafactory Scale",
                  desc: "Full robotic production. Raw material independence. Largest domestic transformer manufacturer delivering thousands of units annually.",
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

        {/* ================================================================
            SLIDE 10 — CLOSING
        ================================================================ */}
        <section className="deck-section closing-section has-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1641618640134-fd5a58f1d225?w=1920&q=80)' }}>
          <div className="closing-content">
            <Zap className="w-16 h-16 text-[var(--flux-blue)] mb-6 opacity-60" />
            <h2 className="closing-headline">Powering the Renaissance</h2>
            <p className="closing-sub">
              Transformers are the backbone of the American grid. The product
              is proven. We&apos;re making it great &mdash; by building the
              most advanced manufacturing process the industry has ever seen,
              starting with the smartest marketplace.
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
   ALL STYLES
   ===================================================================== */
const deckStyles = `
  :root {
    --flux-blue: #2d8cff;
    --flux-red: #c41e3a;
    --flux-dark: #0f0f0f;
  }

  *, *::before, *::after { box-sizing: border-box; }

  html, body {
    background: #080808 !important;
    overflow-x: hidden !important;
    max-width: 100vw;
  }

  body {
    overflow-y: hidden !important;
  }

  .deck-scroll-container {
    position: fixed;
    inset: 0;
    overflow-y: scroll;
    overflow-x: hidden;
    scroll-snap-type: y mandatory;
    -webkit-overflow-scrolling: touch;
    z-index: 1;
    overscroll-behavior: contain;
    max-width: 100vw;
  }

  .deck-section {
    min-height: 100vh;
    min-height: 100dvh;
    width: 100%;
    max-width: 100vw;
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
    bottom: 20px; right: 20px;
    z-index: 1000;
    display: flex; gap: 10px;
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
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .control-btn:hover { background: var(--flux-blue); border-color: var(--flux-blue); }
  .slide-counter {
    font-family: 'JetBrains Mono', monospace;
    color: #888;
    display: flex; align-items: center;
    padding: 0 10px; font-size: 14px;
  }
  .scroll-hint {
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    z-index: 100;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    color: #666;
    font-family: 'Inter', sans-serif; font-size: 12px;
    text-transform: uppercase; letter-spacing: 2px;
    cursor: pointer;
  }

  /* ---- TITLE ---- */
  .title-section { background: #050505; }
  .title-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 70% 30%, rgba(45,140,255,0.08) 0%, transparent 60%),
      radial-gradient(ellipse at 30% 70%, rgba(196,30,58,0.04) 0%, transparent 50%);
  }
  .title-overlay { position: relative; z-index: 2; padding: 80px; max-width: 900px; }
  .flux-logo-large {
    font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 48px;
    letter-spacing: 2px; color: #fff;
    display: flex; align-items: center; gap: 15px;
    text-transform: uppercase; margin-bottom: 30px;
  }
  .title-headline {
    font-family: 'Oswald', sans-serif; color: #fff;
    font-size: clamp(60px, 10vw, 110px); font-weight: 700;
    line-height: 0.9; text-transform: uppercase; margin: 0 0 30px 0;
  }
  .subtitle {
    font-family: 'Inter', sans-serif; font-size: clamp(16px, 2vw, 22px);
    color: #ccc; max-width: 700px; font-weight: 400; line-height: 1.5;
  }

  /* ---- CONTENT ---- */
  .content-area {
    padding: 60px 80px; width: 100%; max-width: 1400px;
    margin: 0 auto;
    display: flex; flex-direction: column; justify-content: center;
    flex: 1; z-index: 1;
  }

  /* ---- TYPOGRAPHY ---- */
  .slide-title {
    font-family: 'Oswald', sans-serif; color: #fff;
    font-size: clamp(34px, 5vw, 52px); font-weight: 700;
    text-transform: uppercase; margin-bottom: 35px;
    position: relative; padding-left: 20px;
  }
  .slide-title::before {
    content: ''; position: absolute;
    left: 0; top: 6px; bottom: 6px;
    width: 6px; background: var(--flux-blue); border-radius: 3px;
  }
  .section-h3 {
    font-family: 'Oswald', sans-serif; color: #fff;
    font-size: 22px; font-weight: 500;
    margin-bottom: 14px; text-transform: uppercase;
  }
  .deck-p {
    color: #b0b0b0; font-size: 15px; line-height: 1.7;
    margin-bottom: 14px; font-family: 'Inter', sans-serif;
  }
  .deck-p strong { color: #fff; font-weight: 600; }

  .deck-ul { list-style: none; padding: 0; margin: 0; }
  .deck-ul li {
    position: relative; padding-left: 26px; margin-bottom: 12px;
    color: #b0b0b0; font-size: 15px; line-height: 1.6;
    font-family: 'Inter', sans-serif;
  }
  .deck-ul li::before {
    content: ''; position: absolute; left: 0; top: 6px;
    width: 13px; height: 13px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232d8cff' stroke-width='3'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E") center/contain no-repeat;
  }
  .deck-ul li strong { color: #fff; font-weight: 600; }

  .source-citation {
    font-family: 'Inter', sans-serif; font-size: 11px; color: #555;
    margin-top: 25px; border-top: 1px solid #222; padding-top: 12px;
    text-transform: uppercase; letter-spacing: 1px;
  }
  .source-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 15px; border-top: 1px solid #222; padding-top: 12px; width: 100%;
  }
  .source-row .source-citation { margin: 0; border: none; padding: 0; }
  .quotes-row {
    display: flex; gap: 16px;
  }
  .vance-quote {
    display: flex; flex-direction: column; gap: 4px;
    padding: 12px 20px;
    border: 1px solid rgba(196,30,58,0.3);
    border-left: 3px solid var(--flux-red);
    background: rgba(196,30,58,0.04);
    border-radius: 4px;
    flex: 1; max-width: 360px;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s;
    cursor: pointer;
  }
  .vance-quote:hover {
    background: rgba(196,30,58,0.1);
    border-color: rgba(196,30,58,0.5);
  }
  .vance-with-img {
    flex-direction: row; align-items: center; gap: 14px;
  }
  .vance-thumb {
    width: 56px; height: 56px; border-radius: 4px;
    object-fit: cover; flex-shrink: 0;
    border: 1px solid #333;
  }
  .vance-label {
    font-family: 'Inter', sans-serif; font-size: 11px;
    color: var(--flux-red); text-transform: uppercase;
    letter-spacing: 1.5px; font-weight: 700;
  }
  .vance-text {
    font-family: 'Inter', sans-serif; font-size: 15px;
    color: #ddd; font-style: italic; line-height: 1.4;
  }

  /* ---- LAYOUTS ---- */
  .two-col {
    display: grid; grid-template-columns: 1fr 1.2fr;
    gap: 50px; width: 100%; align-items: center;
  }
  @media (max-width: 900px) {
    .two-col { grid-template-columns: 1fr !important; gap: 24px; }
    .content-area { padding: 30px 20px; }
    .title-overlay { padding: 40px 24px; }
  }

  /* ---- MOBILE ---- */
  @media (max-width: 768px) {
    /* Kill fixed positioning — normal scrolling page on mobile */
    body { overflow-y: auto !important; }
    .deck-scroll-container {
      position: relative !important;
      inset: auto !important;
      overflow-y: visible !important;
      scroll-snap-type: none !important;
      max-width: 100vw;
      width: 100%;
    }
    .deck-section {
      min-height: auto;
      padding: 40px 0;
      scroll-snap-align: none;
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden;
    }
    /* First and last slides keep full height */
    .deck-section.title-section,
    .deck-section.closing-section {
      min-height: 100vh;
      min-height: 100svh;
      padding: 0;
    }

    .content-area { padding: 24px 16px; width: 100%; max-width: 100vw; }
    .title-overlay { padding: 30px 20px; }

    /* Typography scale down */
    .slide-title { font-size: 28px; margin-bottom: 20px; padding-left: 16px; }
    .slide-title::before { width: 4px; }
    .section-h3 { font-size: 18px; margin-bottom: 10px; }
    .deck-p { font-size: 14px; line-height: 1.6; margin-bottom: 10px; }
    .deck-ul li { font-size: 13px; padding-left: 22px; margin-bottom: 8px; }
    .deck-ul li::before { width: 11px; height: 11px; top: 5px; }
    .flux-logo-large { font-size: 32px; gap: 10px; margin-bottom: 20px; }
    .flux-logo-large svg { width: 36px !important; height: 36px !important; }

    /* Hide desktop nav controls on mobile — it's a normal scroll page */
    .deck-controls { display: none; }
    .scroll-hint { display: none; }

    /* Two-col stacks */
    .two-col { grid-template-columns: 1fr !important; gap: 20px; }

    /* Source row + quotes stack */
    .source-row { flex-direction: column; gap: 12px; align-items: flex-start; }
    .quotes-row { flex-direction: column; gap: 10px; width: 100%; }
    .vance-quote { max-width: 100%; padding: 10px 14px; }
    .vance-text { font-size: 13px; }
    .vance-label { font-size: 10px; }
    .vance-thumb { width: 44px; height: 44px; }

    /* Chart */
    .chart-with-legend { max-width: 100%; overflow: hidden; }
    .chart-container { padding: 10px; max-width: 100%; }
    .chart-legend-below { flex-wrap: wrap; gap: 10px 16px; padding: 8px 12px; }
    .legend-item { font-size: 9px; }

    /* Driver cards */
    .driver-card { padding: 10px 12px; gap: 10px; }
    .driver-card strong { font-size: 13px; }
    .driver-stat { font-size: 12px; }

    /* Crisis visual */
    .crisis-visual { padding: 20px; }
    .crisis-num { font-size: 52px; }
    .crisis-pct { font-size: 26px; }
    .crisis-label { font-size: 11px; }
    .crisis-stat { padding: 16px 0; }

    /* Opportunity visual */
    .opportunity-visual { padding: 20px; }
    .opp-item { padding: 10px 12px; font-size: 13px; }
    .opp-headline { font-size: 17px; }

    /* Marketplace visual */
    .marketplace-visual { padding: 20px; gap: 20px; }
    .mp-flow { flex-direction: column; gap: 10px; }
    .mp-flow svg.flex-shrink-0 { transform: rotate(90deg); }
    .mp-step { min-width: 0; width: 100%; padding: 14px; }
    .mp-secret { padding: 14px; }

    /* All visuals constrain width */
    .crisis-visual, .opportunity-visual, .marketplace-visual, .vision-visual {
      max-width: 100%; overflow: hidden;
    }

    /* Vision / Tech stack */
    .vision-visual { padding: 20px; }
    .tech-item { padding: 10px 12px; gap: 10px; }
    .tech-item strong { font-size: 13px; }
    .tech-item span { font-size: 11px; }
    .tech-icon { width: 28px; height: 28px; }
    .process-callout { padding: 16px; gap: 12px; }
    .process-callout-text { font-size: 18px; }
    .vision-stat-grid { gap: 10px; }
    .vision-stat-card { padding: 16px 10px; }
    .vsc-value { font-size: 26px; }
    .vsc-label { font-size: 10px; }

    /* Split / Leapfrog */
    .split-section { flex-direction: column !important; }
    .split-text { padding: 30px 20px; border-right: none; border-bottom: 1px solid #222; }
    .split-visual { padding: 20px; }
    .leapfrog-visual { flex-direction: column; gap: 16px; }
    .leap-box { padding: 18px; }
    .leap-arrow { transform: rotate(90deg); justify-content: center; }

    /* Moats */
    .moats-grid { grid-template-columns: 1fr; gap: 14px; }
    .moat-card { padding: 20px; }
    .moat-card svg { width: 24px !important; height: 24px !important; margin-bottom: 10px; }
    .moat-card .section-h3 { font-size: 16px; }

    /* Timeline — vertical on mobile */
    .timeline { flex-direction: column; gap: 30px; padding-top: 20px; margin-top: 20px; }
    .timeline-line-h { display: none; }
    .timeline-item { width: 100%; text-align: left; padding-top: 0; padding-left: 30px; border-left: 2px solid #333; }
    .timeline-dot {
      top: 4px; left: -9px; transform: none;
      width: 14px; height: 14px;
    }
    .timeline-year { font-size: 32px; margin-bottom: 6px; }
    .timeline-title { font-size: 14px; }
    .timeline-desc { font-size: 12px; }

    /* Closing */
    .closing-content { padding: 40px 24px; }
    .closing-sub { font-size: 15px; }
    .closing-cta { font-size: 12px; padding: 12px 28px; letter-spacing: 2px; }
    .closing-contact p { font-size: 14px; }
  }

  /* ---- DRIVER CARDS (slide 2) ---- */
  .driver-cards { display: flex; flex-direction: column; gap: 10px; margin: 16px 0; }
  .driver-card {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 16px;
    border: 1px solid #222; border-radius: 4px;
    background: rgba(45,140,255,0.03);
  }
  .driver-card strong {
    color: #fff; font-family: 'Inter', sans-serif; font-size: 14px;
    display: block; font-weight: 600;
  }
  .driver-stat {
    font-family: 'JetBrains Mono', monospace; font-size: 13px;
    color: var(--flux-red); font-weight: 700;
  }

  /* ---- CHART ---- */
  .chart-container {
    background: #151515; border: 1px solid #333; border-radius: 4px;
    padding: 20px; aspect-ratio: 3 / 2;
    display: flex; align-items: center; justify-content: center;
  }
  .chart-with-legend { display: flex; flex-direction: column; }
  .chart-legend-below {
    display: flex; justify-content: center; gap: 24px;
    padding: 10px 0 0; border-top: 1px solid #333;
    margin-top: -1px;
    background: #151515;
    border: 1px solid #333; border-top: 1px solid #292929;
    border-radius: 0 0 4px 4px;
    padding: 10px 20px;
  }
  .chart-container { border-radius: 4px 4px 0 0; }
  .legend-item {
    font-family: 'Inter', sans-serif; font-size: 11px; color: #888;
    text-transform: uppercase; font-weight: 600;
    display: flex; align-items: center; gap: 8px;
  }
  .legend-color { width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0; }
  .legend-line { height: 2px !important; }

  /* ---- CRISIS VISUAL (slide 3) ---- */
  .crisis-visual {
    display: flex; flex-direction: column; gap: 0;
    background: #151515; border: 1px solid #333; border-radius: 4px;
    padding: 30px;
  }
  .crisis-stat { text-align: center; padding: 25px 0; }
  .crisis-num {
    font-family: 'Oswald', sans-serif; font-size: 72px; font-weight: 700;
    color: var(--flux-red); line-height: 1;
  }
  .crisis-pct {
    font-size: 36px; color: var(--flux-red); opacity: 0.7;
  }
  .crisis-label {
    font-family: 'Inter', sans-serif; font-size: 13px; color: #888;
    text-transform: uppercase; letter-spacing: 1px; margin-top: 6px;
  }
  .crisis-divider { height: 1px; background: #333; margin: 0 20px; }

  /* ---- OPPORTUNITY VISUAL (slide 4) ---- */
  .opportunity-visual {
    background: #151515; border: 1px solid #333; border-radius: 4px;
    padding: 35px; display: flex; flex-direction: column; gap: 20px;
  }
  .opp-icon-row {
    display: flex; align-items: center; gap: 14px;
  }
  .opp-headline {
    font-family: 'Oswald', sans-serif; font-size: 20px; color: #fff;
    text-transform: uppercase;
  }
  .opp-items { display: flex; flex-direction: column; gap: 12px; }
  .opp-item {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px;
    border: 1px solid #222; border-radius: 4px;
    font-family: 'Inter', sans-serif; font-size: 14px; color: #b0b0b0;
  }
  .opp-item svg { color: var(--flux-blue); flex-shrink: 0; }

  /* ---- MARKETPLACE VISUAL (slide 5) ---- */
  .marketplace-visual {
    background: #151515; border: 1px solid #333; border-radius: 4px;
    padding: 35px; display: flex; flex-direction: column; gap: 30px;
  }
  .mp-flow {
    display: flex; align-items: center; justify-content: center; gap: 16px;
  }
  .mp-step {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    padding: 20px; border: 1px solid #333; border-radius: 4px;
    background: #1a1a1a; min-width: 110px;
  }
  .mp-step.active { border-color: var(--flux-blue); background: rgba(45,140,255,0.05); }
  .mp-step-icon { color: var(--flux-blue); }
  .mp-step-label {
    font-family: 'Inter', sans-serif; font-size: 11px; color: #ccc;
    text-align: center; text-transform: uppercase; font-weight: 600;
    letter-spacing: 0.5px;
  }
  .mp-secret {
    display: flex; gap: 14px; padding: 20px;
    border: 1px solid rgba(45,140,255,0.2); border-radius: 4px;
    background: rgba(45,140,255,0.03);
  }
  .mp-secret svg { flex-shrink: 0; margin-top: 2px; }
  .mp-secret strong {
    font-family: 'Inter', sans-serif; font-size: 14px; color: #fff;
    display: block; margin-bottom: 4px;
  }

  /* ---- VISION SECTION (slide 6) ---- */
  .vision-section { background: #0a0a0a; }
  .vision-section::before {
    background: radial-gradient(circle at 50% 50%, rgba(45,140,255,0.06) 0%, transparent 60%);
  }
  .vision-visual {
    background: #151515; border: 1px solid #333; border-radius: 4px;
    padding: 30px;
  }
  .vision-stat-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  }
  .vision-stat-card {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 8px;
    padding: 24px 16px;
    border: 1px solid #333; border-radius: 4px;
    background: rgba(45,140,255,0.03);
  }
  .vsc-icon { color: var(--flux-blue); }
  .vsc-value {
    font-family: 'Oswald', sans-serif; font-size: 32px; font-weight: 700;
    color: #fff; line-height: 1;
  }
  .vsc-label {
    font-family: 'Inter', sans-serif; font-size: 11px; color: #888;
    text-transform: uppercase; letter-spacing: 0.5px;
  }

  /* ---- SPLIT / LEAPFROG ---- */
  .split-section { flex-direction: row !important; }
  .split-text {
    flex: 1; padding: 70px;
    display: flex; flex-direction: column; justify-content: center;
    border-right: 1px solid #222; z-index: 2;
  }
  .split-visual {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 50px; background: #0a0a0a;
  }
  @media (max-width: 900px) and (min-width: 769px) {
    .split-section { flex-direction: column !important; }
    .split-text { border-right: none; border-bottom: 1px solid #222; padding: 40px 24px; }
    .split-visual { padding: 24px; }
  }
  .leapfrog-visual { display: flex; align-items: stretch; gap: 24px; width: 100%; }
  .leap-box {
    flex: 1; border: 1px solid #333; border-radius: 4px; padding: 24px; text-align: center;
  }
  .leap-box.legacy { background: #1a1a1a; }
  .leap-box.fluxco { background: rgba(45,140,255,0.05); border-color: var(--flux-blue); }
  .leap-label {
    font-family: 'Oswald', sans-serif; font-size: 16px; font-weight: 700;
    text-transform: uppercase; margin-bottom: 14px;
  }
  .leap-box.legacy .leap-label { color: #666; }
  .leap-box.fluxco .leap-label { color: var(--flux-blue); }
  .leap-items { display: flex; flex-direction: column; gap: 6px; }
  .leap-items span {
    font-family: 'Inter', sans-serif; font-size: 12px; color: #888;
    padding: 5px 0; border-bottom: 1px solid #222;
  }
  .leap-box.fluxco .leap-items span { color: #ccc; border-color: rgba(45,140,255,0.15); }
  .leap-arrow { flex-shrink: 0; display: flex; align-items: center; }

  /* ---- MOATS GRID (slide 8) ---- */
  .moats-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%;
  }
  @media (max-width: 900px) { .moats-grid { grid-template-columns: 1fr; } }
  .moat-card {
    background: #151515; border: 1px solid #333; border-radius: 4px;
    padding: 30px; transition: border-color 0.2s;
  }
  .moat-card:hover { border-color: var(--flux-blue); }
  .moat-card svg { margin-bottom: 14px; }
  .moat-card .section-h3 { font-size: 18px; margin-bottom: 12px; }
  .moat-card .deck-ul li { font-size: 13px; margin-bottom: 8px; padding-left: 22px; }
  .moat-card .deck-ul li::before { width: 11px; height: 11px; top: 5px; }

  /* ---- TIMELINE ---- */
  .timeline {
    display: flex; justify-content: space-between; align-items: flex-start;
    position: relative; width: 100%; margin-top: 40px; padding-top: 40px;
  }
  .timeline-line-h {
    position: absolute; top: 47px; left: 0; width: 100%;
    height: 2px; background: #333;
  }
  .timeline-item {
    position: relative; width: 30%; text-align: center; padding-top: 30px;
  }
  .timeline-dot {
    position: absolute; top: -3px; left: 50%; transform: translateX(-50%);
    width: 16px; height: 16px;
    background: #0f0f0f; border: 3px solid var(--flux-blue);
    border-radius: 50%; z-index: 2;
  }
  .timeline-year {
    font-family: 'Oswald', sans-serif; color: var(--flux-blue);
    font-size: 42px; font-weight: 700; margin-bottom: 10px;
  }
  .timeline-title {
    font-family: 'Inter', sans-serif; color: #fff; font-size: 15px;
    display: block; margin-bottom: 10px;
  }
  .timeline-desc {
    font-family: 'Inter', sans-serif; color: #888; font-size: 13px;
    line-height: 1.6;
  }

  /* ---- CLOSING ---- */
  .closing-section {
    background: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%);
    align-items: center; text-align: center;
  }
  .closing-content {
    display: flex; flex-direction: column; align-items: center;
    z-index: 2; padding: 80px;
  }
  .closing-headline {
    font-family: 'Oswald', sans-serif;
    font-size: clamp(40px, 6vw, 64px); font-weight: 700;
    color: #fff; text-transform: uppercase; margin-bottom: 20px;
  }
  .closing-sub {
    font-family: 'Inter', sans-serif; font-size: 18px; color: #b0b0b0;
    max-width: 700px; line-height: 1.5; margin-bottom: 30px;
  }
  .closing-cta {
    color: var(--flux-red); font-family: 'Inter', sans-serif; font-weight: 600;
    font-size: 14px; letter-spacing: 3px; text-transform: uppercase;
    padding: 14px 40px;
    border: 1px solid rgba(196,30,58,0.4); border-radius: 4px;
    margin-bottom: 40px;
  }
  .closing-contact p {
    font-family: 'Inter', sans-serif; font-size: 16px; color: #666;
    margin-bottom: 5px;
  }

  /* ---- BACKGROUND IMAGE SECTIONS ---- */
  .has-bg {
    background-size: cover !important;
    background-position: center !important;
  }
  .has-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(10, 10, 10, 0.84);
    z-index: 0;
  }
  .has-bg .content-area,
  .has-bg .title-overlay,
  .has-bg .split-text,
  .has-bg .split-visual,
  .has-bg .closing-content {
    position: relative;
    z-index: 1;
  }

  /* ---- TECH STACK (slide 6) ---- */
  .tech-stack { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
  .tech-item {
    display: flex; gap: 14px; align-items: flex-start;
    padding: 14px 16px;
    border: 1px solid #222; border-radius: 4px;
    background: rgba(45,140,255,0.03);
  }
  .tech-icon {
    color: var(--flux-blue); flex-shrink: 0;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(45,140,255,0.2); border-radius: 4px;
    background: rgba(45,140,255,0.06);
  }
  .tech-item strong {
    color: #fff; font-family: 'Inter', sans-serif; font-size: 14px;
    display: block; font-weight: 600; margin-bottom: 3px;
  }
  .tech-item span {
    color: #888; font-family: 'Inter', sans-serif; font-size: 12px;
    line-height: 1.5;
  }

  /* ---- PROCESS CALLOUT (slide 6) ---- */
  .process-callout {
    display: flex; align-items: center; gap: 16px;
    padding: 24px;
    border: 1px solid rgba(45,140,255,0.3); border-radius: 4px;
    background: rgba(45,140,255,0.05);
    margin-bottom: 20px;
  }
  .process-callout-text {
    font-family: 'Oswald', sans-serif; font-size: 22px;
    color: #fff; font-weight: 500; font-style: italic;
  }
  .process-callout-text em { color: var(--flux-blue); font-style: normal; }
`;
