"use client";

import { Globe, Eye, Handshake, ShieldCheck, Leaf, FileCheck, DollarSign, MousePointerClick } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import GlobalNetworkMap from "./GlobalNetworkMap";
import OrderTimeline from "./OrderTimeline";

const benefits: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  hasPopup: boolean | "timeline";
}[] = [
  {
    icon: Globe,
    title: "Global Network",
    description: "Access to hundreds of vetted partners worldwide.",
    hasPopup: true,
  },
  {
    icon: Eye,
    title: "Real-Time Updates",
    description: "Always know the status of your order.",
    hasPopup: "timeline",
  },
];

const AboutSection = () => {
  const debugMapOpen =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugMap");

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-wider mb-4 block">
              Why Choose Fluxco
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6 leading-tight">
              YOUR ONE-STOP SHOP
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Buying a transformer shouldn't mean navigating a maze of manufacturers, lead times, and specifications. We've built relationships with hundreds of partners across the globe so you don't have to. Get complete visibility into the entire supply chain and find the perfect solution for your exact needs.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
              <p className="text-foreground font-medium text-center">
                From engineering consultation to final installation—we handle everything so you can focus on your core business.
              </p>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-primary">The Ultimate Transformer Resource</div>
            </div>
          </div>

          {/* Right Content - Benefits Grid */}
          <div className="space-y-6">
            {/* Top row - 2 cards */}
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit) => {
                const cardContent = (
                  <div
                    className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 cursor-pointer relative group"
                  >
                    {benefit.hasPopup && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 text-primary/60 group-hover:text-primary transition-colors">
                        <span className="text-[10px] font-medium uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">Hover</span>
                        <MousePointerClick className="w-4 h-4" />
                      </div>
                    )}
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-xl text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );

                if (benefit.hasPopup) {
                  return (
                    <HoverCard
                      key={benefit.title}
                      openDelay={200}
                      closeDelay={100}
                      {...(debugMapOpen ? { open: true } : {})}
                    >
                      <HoverCardTrigger asChild>
                        {cardContent}
                      </HoverCardTrigger>
                      <HoverCardContent 
                        className="w-auto p-0 border-0 bg-transparent shadow-none"
                        side="left"
                        align="center"
                        sideOffset={10}
                      >
                        {benefit.hasPopup === "timeline" ? <OrderTimeline /> : <GlobalNetworkMap />}
                      </HoverCardContent>
                    </HoverCard>
                  );
                }

                return <div key={benefit.title}>{cardContent}</div>;
              })}
            </div>

            {/* Compliance & Incentives Banner */}
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Navigate Regulations & Maximize Incentives</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                We help you understand and comply with evolving transformer requirements while capturing available tax benefits.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {/* DOE Efficiency */}
                <HoverCard openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2 bg-card/50 rounded-lg p-2 border border-border cursor-pointer hover:border-primary/30 transition-all group relative">
                      <div className="absolute -top-1 -right-1">
                        <MousePointerClick className="w-3 h-3 text-primary/50 group-hover:text-primary transition-colors" />
                      </div>
                      <Leaf className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-foreground">DOE Efficiency</div>
                        <div className="text-[10px] text-muted-foreground">2027 standards</div>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80" side="top" align="center">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-primary" />
                        DOE Efficiency Standards
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li>• <strong>Effective Jan 1, 2027:</strong> New minimum efficiency levels for distribution transformers</li>
                        <li>• <strong>30-35% reduction</strong> in core losses required vs. current standards</li>
                        <li>• Applies to liquid-immersed and dry-type transformers 10-2,500 kVA</li>
                        <li>• Amorphous metal cores increasingly required to meet standards</li>
                        <li>• Non-compliant units cannot be manufactured or imported after deadline</li>
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                {/* FEOC Rules */}
                <HoverCard openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2 bg-card/50 rounded-lg p-2 border border-border cursor-pointer hover:border-primary/30 transition-all group relative">
                      <div className="absolute -top-1 -right-1">
                        <MousePointerClick className="w-3 h-3 text-accent/50 group-hover:text-accent transition-colors" />
                      </div>
                      <FileCheck className="w-4 h-4 text-accent shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-foreground">FEOC Rules</div>
                        <div className="text-[10px] text-muted-foreground">Entity guidance</div>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80" side="top" align="center">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-accent" />
                        Foreign Entity of Concern (FEOC)
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li>• <strong>Section 45X:</strong> Components from FEOC countries may disqualify tax credits</li>
                        <li>• Applies to China, Russia, North Korea, and Iran-sourced materials</li>
                        <li>• <strong>2024-2025:</strong> Increasing scrutiny on supply chain origin documentation</li>
                        <li>• Requires detailed traceability for steel, copper, and electrical components</li>
                        <li>• We help verify compliant sourcing for all transformer components</li>
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>

                {/* Tax Credits */}
                <HoverCard openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2 bg-card/50 rounded-lg p-2 border border-border cursor-pointer hover:border-primary/30 transition-all group relative">
                      <div className="absolute -top-1 -right-1">
                        <MousePointerClick className="w-3 h-3 text-primary/50 group-hover:text-primary transition-colors" />
                      </div>
                      <DollarSign className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-foreground">Tax Credits</div>
                        <div className="text-[10px] text-muted-foreground">US-made bonus</div>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80" side="top" align="center">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        Manufacturing Tax Credits
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li>• <strong>Section 45X:</strong> Up to 10% credit for US-manufactured transformers</li>
                        <li>• Additional credits for domestic steel, copper, and core materials</li>
                        <li>• <strong>Bonus credits:</strong> Energy community and prevailing wage requirements</li>
                        <li>• Credits available through 2032, phasing down after 2029</li>
                        <li>• We connect you with US manufacturers to maximize eligible credits</li>
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>

            {/* Bottom row - Single larger card */}
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Handshake className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-foreground mb-3">
                    Your Single Partner for Every Transformer Need
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We're here to solve all the complexity of finding the transformer that meets your cost, lead time, and installation requirements. From navigating global suppliers to managing logistics and specifications—one partner, one solution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2" />
    </section>
  );
};

export default AboutSection;
