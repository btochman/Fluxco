"use client";

import { useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProcessingAnimation from "./ProcessingAnimation";
import TransformerDrawing from "./TransformerDrawing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileDown, Calculator, Zap, Info, Mail } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Tooltip descriptions for each field
const FIELD_INFO: Record<string, string> = {
  kva: "Kilovolt-Ampere (kVA) rating indicates the transformer's power capacity. Higher ratings support larger electrical loads.",
  phase: "Single phase is for residential/light commercial use. Three phase is for industrial applications with higher power demands.",
  primaryVoltage: "The input voltage from the utility or power source that feeds into the transformer.",
  secondaryVoltage: "The output voltage delivered to your equipment or distribution system after transformation.",
  coolingType: "ONAN uses natural oil/air cooling. ONAF adds fans for forced air. More cooling stages allow higher capacity.",
  impedance: "Percentage impedance affects voltage regulation and fault current. Lower values = better regulation, higher fault current.",
  bilLevel: "Basic Insulation Level (BIL) indicates lightning/surge withstand capability in kilovolts.",
  tapChanger: "Allows voltage adjustment to compensate for line voltage variations. LTC (Load Tap Changer) adjusts automatically under load.",
  supplyChain: "Choose your supply chain compliance requirements for regulatory and sourcing transparency needs.",
  leadTime: "Shorter lead times require expedited manufacturing and may incur rush fees. Standard lead time is 16-20 weeks.",
  batteryStorage: "Integrated battery energy storage system (BESS) for peak shaving, backup power, and grid stabilization. Currently in R&D phase.",
  batteryType: "Battery chemistry affects energy density, cycle life, safety, and cost. Our R&D team is evaluating multiple technologies.",
  batteryCapacity: "Storage capacity in kilowatt-hours (kWh) determines backup duration and peak shaving capability.",
};

// Battery storage options (R&D)
const BATTERY_TYPE_OPTIONS: Record<string, { label: string; description: string; status: string }> = {
  "none": { label: "No Battery Storage", description: "Standard transformer without integrated storage", status: "" },
  "li-ion": { label: "Lithium-Ion (Li-ion)", description: "High energy density, proven technology, 10-15 year lifespan", status: "Testing Phase" },
  "lfp": { label: "Lithium Iron Phosphate (LFP)", description: "Enhanced safety, longer cycle life, lower energy density", status: "Prototype Ready" },
  "solid-state": { label: "Solid-State Battery", description: "Next-gen technology, highest safety, maximum energy density", status: "Early R&D" },
};

const BATTERY_CAPACITY_OPTIONS = [
  { value: "50", label: "50 kWh", description: "Light backup / peak shaving" },
  { value: "100", label: "100 kWh", description: "Standard commercial" },
  { value: "250", label: "250 kWh", description: "Extended backup" },
  { value: "500", label: "500 kWh", description: "Industrial scale" },
  { value: "1000", label: "1 MWh", description: "Grid-scale storage" },
  { value: "custom", label: "Custom Capacity", description: "Contact for sizing consultation" },
];

// Lead time options (weeks) and multipliers
const LEAD_TIME_OPTIONS: { weeks: number; label: string; multiplier: number }[] = [
  { weeks: 6, label: "6 weeks (Rush)", multiplier: 1.35 },
  { weeks: 8, label: "8 weeks (Expedited)", multiplier: 1.25 },
  { weeks: 10, label: "10 weeks (Fast)", multiplier: 1.15 },
  { weeks: 12, label: "12 weeks (Priority)", multiplier: 1.08 },
  { weeks: 16, label: "16 weeks (Standard)", multiplier: 1.0 },
  { weeks: 20, label: "20 weeks (Extended)", multiplier: 0.97 },
];

// Supply chain options and costs
const SUPPLY_CHAIN_OPTIONS: Record<string, { label: string; description: string; cost: number }> = {
  "standard": { label: "Standard", description: "Standard international sourcing", cost: 0 },
  "feoc": { label: "FEOC Compliant", description: "Foreign Entity of Concern compliant - excludes components from designated foreign entities", cost: 5000 },
  "us-transparent": { label: "US Transparent Supply Chain", description: "Fully transparent US-based supply chain with complete component traceability", cost: 12000 },
};

// Pricing configuration
const BASE_PRICES: Record<string, number> = {
  "25": 8500,
  "50": 12000,
  "75": 15500,
  "100": 18000,
  "150": 22000,
  "225": 28000,
  "300": 35000,
  "500": 48000,
  "750": 65000,
  "1000": 82000,
  "1500": 105000,
  "2000": 135000,
  "2500": 165000,
};

const COOLING_MULTIPLIERS: Record<string, number> = {
  "ONAN": 1.0,
  "ONAF": 1.08,
  "ONAN/ONAF": 1.15,
  "ONAN/ONAF/ONAF": 1.22,
};

const PHASE_MULTIPLIERS: Record<string, number> = {
  "single": 0.85,
  "three": 1.0,
};

const TAP_CHANGER_COSTS: Record<string, number> = {
  "none": 0,
  "manual-2x2.5": 1500,
  "manual-4x2.5": 2200,
  "auto-ltc": 12000,
};

const BIL_MULTIPLIERS: Record<string, number> = {
  "30": 1.0,
  "45": 1.02,
  "60": 1.04,
  "75": 1.06,
  "95": 1.08,
  "110": 1.10,
  "125": 1.12,
  "150": 1.15,
  "200": 1.20,
};

interface SpecConfig {
  kva: string;
  primaryVoltage: string;
  secondaryVoltage: string;
  phase: string;
  coolingType: string;
  impedance: string;
  bilLevel: string;
  tapChanger: string;
  supplyChain: string;
  leadTimeIndex: number;
  batteryType: string;
  batteryCapacity: string;
}

const InfoTooltip = ({ field }: { field: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
    </TooltipTrigger>
    <TooltipContent className="max-w-xs bg-popover border-border">
      <p className="text-sm">{FIELD_INFO[field]}</p>
    </TooltipContent>
  </Tooltip>
);

const calculatePrice = (config: SpecConfig): number => {
  const basePrice = BASE_PRICES[config.kva] || 0;
  const coolingMultiplier = COOLING_MULTIPLIERS[config.coolingType] || 1;
  const phaseMultiplier = PHASE_MULTIPLIERS[config.phase] || 1;
  const bilMultiplier = BIL_MULTIPLIERS[config.bilLevel] || 1;
  const tapChangerCost = TAP_CHANGER_COSTS[config.tapChanger] || 0;
  const supplyChainCost = SUPPLY_CHAIN_OPTIONS[config.supplyChain]?.cost || 0;
  const leadTimeMultiplier = LEAD_TIME_OPTIONS[config.leadTimeIndex]?.multiplier || 1;

  return Math.round((basePrice * coolingMultiplier * phaseMultiplier * bilMultiplier * leadTimeMultiplier) + tapChangerCost + supplyChainCost);
};

const SpecSheetBuilder = () => {
  const { toast } = useToast();
  const specSheetRef = useRef<HTMLDivElement>(null);
  const [showSpec, setShowSpec] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    company: "",
    email: "",
  });
  const [config, setConfig] = useState<SpecConfig>({
    kva: "",
    primaryVoltage: "",
    secondaryVoltage: "",
    phase: "",
    coolingType: "",
    impedance: "",
    bilLevel: "",
    tapChanger: "",
    supplyChain: "",
    leadTimeIndex: 4, // Default to 16 weeks (Standard)
    batteryType: "",
    batteryCapacity: "",
  });

  const isFormComplete = Object.keys(config).filter(k => k !== 'leadTimeIndex').every((key) => config[key as keyof SpecConfig] !== "");

  const handleGenerate = () => {
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setShowSpec(true);
  };

  const handleDownloadPDF = async () => {
    if (!specSheetRef.current) return;

    const canvas = await html2canvas(specSheetRef.current, {
      scale: 2,
      backgroundColor: "#1a1612",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`transformer-spec-${config.kva}kVA.pdf`);
  };

  const handleQuoteRequest = async () => {
    if (!quoteForm.name.trim() || !quoteForm.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and email address.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(quoteForm.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setQuoteSubmitting(true);

    try {
      const specDetails = `
KVA Rating: ${config.kva} kVA
Phase: ${config.phase}
Primary Voltage: ${config.primaryVoltage}V
Secondary Voltage: ${config.secondaryVoltage}
Cooling Type: ${config.coolingType}
Impedance: ${config.impedance}%
BIL Level: ${config.bilLevel} kV
Tap Changer: ${config.tapChanger}
Supply Chain: ${SUPPLY_CHAIN_OPTIONS[config.supplyChain]?.label || "Standard"}
Lead Time: ${LEAD_TIME_OPTIONS[config.leadTimeIndex]?.weeks} weeks
Estimated Price: $${price.toLocaleString()}
      `.trim();

      // Send email notification
      await supabase.functions.invoke("send-contact-email", {
        body: {
          to: "brian@fluxco.com",
          name: quoteForm.name.trim(),
          email: quoteForm.email.trim(),
          company: quoteForm.company.trim() || "Not specified",
          productInterest: `Transformer Inquiry - ${config.kva} kVA`,
          projectDetails: specDetails,
        },
      });

      toast({
        title: "Request Sent!",
        description: "We'll get back to you with more information soon.",
      });

      setQuoteDialogOpen(false);
      setQuoteForm({ name: "", company: "", email: "" });
    } catch (error) {
      console.error("Quote request error:", error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const price = calculatePrice(config);

  return (
    <TooltipProvider>
      {/* Processing Animation Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <ProcessingAnimation onComplete={handleProcessingComplete} />
        )}
      </AnimatePresence>

      <section className="py-24 bg-background ranch-pattern" id="spec-builder">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-primary uppercase tracking-[0.3em] text-sm mb-4">
              Configure Your Unit
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              SPEC SHEET BUILDER
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Configure your transformer specifications and get instant pricing with a downloadable spec sheet.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Configuration Form */}
            <Card className="p-8 card-gradient border-border">
              <div className="flex items-center gap-3 mb-8">
                <Calculator className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">Configuration</h3>
              </div>

              <div className="grid gap-6">
                {/* KVA Rating */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">KVA Rating</Label>
                    <InfoTooltip field="kva" />
                  </div>
                  <Select
                    value={config.kva}
                    onValueChange={(val) => setConfig({ ...config, kva: val })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select KVA rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(BASE_PRICES).map((kva) => (
                        <SelectItem key={kva} value={kva}>
                          {kva} kVA
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Phase */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">Phase</Label>
                    <InfoTooltip field="phase" />
                  </div>
                  <Select
                    value={config.phase}
                    onValueChange={(val) => setConfig({ ...config, phase: val })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Phase</SelectItem>
                      <SelectItem value="three">Three Phase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Primary Voltage */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">Primary Voltage</Label>
                    <InfoTooltip field="primaryVoltage" />
                  </div>
                  <Select
                    value={config.primaryVoltage}
                    onValueChange={(val) => setConfig({ ...config, primaryVoltage: val })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select primary voltage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2400">2,400V</SelectItem>
                      <SelectItem value="4160">4,160V</SelectItem>
                      <SelectItem value="7200">7,200V</SelectItem>
                      <SelectItem value="12470">12,470V</SelectItem>
                      <SelectItem value="13200">13,200V</SelectItem>
                      <SelectItem value="13800">13,800V</SelectItem>
                      <SelectItem value="23000">23,000V</SelectItem>
                      <SelectItem value="34500">34,500V</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Secondary Voltage */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">Secondary Voltage</Label>
                    <InfoTooltip field="secondaryVoltage" />
                  </div>
                  <Select
                    value={config.secondaryVoltage}
                    onValueChange={(val) => setConfig({ ...config, secondaryVoltage: val })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select secondary voltage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="120/240">120/240V</SelectItem>
                      <SelectItem value="208Y/120">208Y/120V</SelectItem>
                      <SelectItem value="240">240V</SelectItem>
                      <SelectItem value="480">480V</SelectItem>
                      <SelectItem value="480Y/277">480Y/277V</SelectItem>
                      <SelectItem value="600">600V</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cooling Type */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">Cooling Type</Label>
                    <InfoTooltip field="coolingType" />
                  </div>
                  <Select
                    value={config.coolingType}
                    onValueChange={(val) => setConfig({ ...config, coolingType: val })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select cooling type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONAN">ONAN (Self-Cooled)</SelectItem>
                      <SelectItem value="ONAF">ONAF (Forced Air)</SelectItem>
                      <SelectItem value="ONAN/ONAF">ONAN/ONAF (Dual)</SelectItem>
                      <SelectItem value="ONAN/ONAF/ONAF">ONAN/ONAF/ONAF (Triple)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Impedance */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">Impedance (%)</Label>
                    <InfoTooltip field="impedance" />
                  </div>
                  <Select
                    value={config.impedance}
                    onValueChange={(val) => setConfig({ ...config, impedance: val })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select impedance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4.5">4.5%</SelectItem>
                      <SelectItem value="5.0">5.0%</SelectItem>
                      <SelectItem value="5.5">5.5%</SelectItem>
                      <SelectItem value="5.75">5.75%</SelectItem>
                      <SelectItem value="6.0">6.0%</SelectItem>
                      <SelectItem value="6.5">6.5%</SelectItem>
                      <SelectItem value="7.0">7.0%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* BIL Level */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">BIL Level (kV)</Label>
                    <InfoTooltip field="bilLevel" />
                  </div>
                  <Select
                    value={config.bilLevel}
                    onValueChange={(val) => setConfig({ ...config, bilLevel: val })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select BIL level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(BIL_MULTIPLIERS).map((bil) => (
                        <SelectItem key={bil} value={bil}>
                          {bil} kV
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tap Changer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">Tap Changer</Label>
                    <InfoTooltip field="tapChanger" />
                  </div>
                  <Select
                    value={config.tapChanger}
                    onValueChange={(val) => setConfig({ ...config, tapChanger: val })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select tap changer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="manual-2x2.5">Manual ±2x2.5%</SelectItem>
                      <SelectItem value="manual-4x2.5">Manual ±4x2.5%</SelectItem>
                      <SelectItem value="auto-ltc">Automatic LTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Supply Chain Source */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">Supply Chain Source</Label>
                    <InfoTooltip field="supplyChain" />
                  </div>
                  <Select
                    value={config.supplyChain}
                    onValueChange={(val) => setConfig({ ...config, supplyChain: val })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select supply chain requirement" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SUPPLY_CHAIN_OPTIONS).map(([key, option]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Battery Storage R&D Section */}
                <div className="space-y-4 p-4 border-2 border-dashed border-glow/30 rounded-lg bg-glow/5 relative">
                  <div className="absolute -top-3 left-4 px-2 bg-background">
                    <span className="text-xs font-bold text-glow uppercase tracking-wider flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-glow rounded-full animate-pulse" />
                      R&D Preview
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-foreground">Integrated Battery Storage</Label>
                      <InfoTooltip field="batteryStorage" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Our engineering team is developing integrated battery energy storage solutions. 
                      Express your interest to help shape our development roadmap.
                    </p>
                  </div>

                  {/* Battery Type */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-foreground">Battery Chemistry</Label>
                      <InfoTooltip field="batteryType" />
                    </div>
                    <Select
                      value={config.batteryType}
                      onValueChange={(val) => setConfig({ ...config, batteryType: val, batteryCapacity: val === "none" ? "" : config.batteryCapacity })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Select battery type (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BATTERY_TYPE_OPTIONS).map(([key, option]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span>{option.label}</span>
                                {option.status && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-glow/20 text-glow rounded-full font-medium">
                                    {option.status}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">{option.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Battery Capacity - only show if battery type selected and not "none" */}
                  {config.batteryType && config.batteryType !== "none" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-foreground">Storage Capacity</Label>
                        <InfoTooltip field="batteryCapacity" />
                      </div>
                      <Select
                        value={config.batteryCapacity}
                        onValueChange={(val) => setConfig({ ...config, batteryCapacity: val })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue placeholder="Select storage capacity" />
                        </SelectTrigger>
                        <SelectContent>
                          {BATTERY_CAPACITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex flex-col">
                                <span>{option.label}</span>
                                <span className="text-xs text-muted-foreground">{option.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <p className="text-[10px] text-glow/70 italic">
                    * Battery integration is subject to ongoing R&D. Specifications and availability may change. 
                    Contact us to join our pilot program.
                  </p>
                </div>

                {/* Lead Time Slider */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-foreground">Lead Time</Label>
                    <InfoTooltip field="leadTime" />
                  </div>
                  <div className="px-2">
                    <Slider
                      value={[config.leadTimeIndex]}
                      onValueChange={(val) => setConfig({ ...config, leadTimeIndex: val[0] })}
                      max={LEAD_TIME_OPTIONS.length - 1}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-3">
                      <span className="text-xs text-muted-foreground">Rush</span>
                      <span className="text-sm font-semibold text-primary">
                        {LEAD_TIME_OPTIONS[config.leadTimeIndex]?.label}
                      </span>
                      <span className="text-xs text-muted-foreground">Extended</span>
                    </div>
                    {LEAD_TIME_OPTIONS[config.leadTimeIndex]?.multiplier !== 1 && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        {LEAD_TIME_OPTIONS[config.leadTimeIndex]?.multiplier > 1 
                          ? `+${Math.round((LEAD_TIME_OPTIONS[config.leadTimeIndex]?.multiplier - 1) * 100)}% rush fee`
                          : `${Math.round((LEAD_TIME_OPTIONS[config.leadTimeIndex]?.multiplier - 1) * 100)}% discount`
                        }
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  className="w-full mt-4"
                  variant="hero"
                  size="lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Generate Spec Sheet
                </Button>
              </div>
            </Card>

          {/* Spec Sheet Output */}
          <div className="space-y-4">
            {showSpec ? (
              <>
                <div
                  ref={specSheetRef}
                  className="p-8 card-gradient border border-border rounded-lg"
                >
                  {/* Spec Header */}
                  <div className="border-b border-border pb-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-8 h-8 text-primary" />
                      <span className="text-2xl font-bold text-foreground tracking-wider">
                        TEXAS TRAFO
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Power Transformer Specification Sheet
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="space-y-4 mb-8">
                    <h4 className="text-lg font-semibold text-primary uppercase tracking-wider">
                      Electrical Specifications
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/50 rounded">
                        <p className="text-muted-foreground text-sm">KVA Rating</p>
                        <p className="text-foreground font-semibold text-lg">
                          {config.kva ? `${config.kva} kVA` : <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded">
                        <p className="text-muted-foreground text-sm">Phase</p>
                        <p className="text-foreground font-semibold text-lg capitalize">
                          {config.phase ? `${config.phase} Phase` : <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded">
                        <p className="text-muted-foreground text-sm">Primary Voltage</p>
                        <p className="text-foreground font-semibold text-lg">
                          {config.primaryVoltage ? `${Number(config.primaryVoltage).toLocaleString()}V` : <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded">
                        <p className="text-muted-foreground text-sm">Secondary Voltage</p>
                        <p className="text-foreground font-semibold text-lg">
                          {config.secondaryVoltage || <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded">
                        <p className="text-muted-foreground text-sm">Impedance</p>
                        <p className="text-foreground font-semibold text-lg">
                          {config.impedance ? `${config.impedance}%` : <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded">
                        <p className="text-muted-foreground text-sm">BIL Level</p>
                        <p className="text-foreground font-semibold text-lg">
                          {config.bilLevel ? `${config.bilLevel} kV` : <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h4 className="text-lg font-semibold text-primary uppercase tracking-wider">
                      Features
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/50 rounded">
                        <p className="text-muted-foreground text-sm">Cooling Type</p>
                        <p className="text-foreground font-semibold text-lg">
                          {config.coolingType || <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded">
                        <p className="text-muted-foreground text-sm">Tap Changer</p>
                        <p className="text-foreground font-semibold text-lg capitalize">
                          {config.tapChanger 
                            ? (config.tapChanger === "none"
                                ? "None"
                                : config.tapChanger === "auto-ltc"
                                ? "Automatic LTC"
                                : `Manual ${config.tapChanger.split("-")[1]}`)
                            : <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h4 className="text-lg font-semibold text-primary uppercase tracking-wider">
                      Supply Chain & Delivery
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/50 rounded">
                        <p className="text-muted-foreground text-sm">Supply Chain Source</p>
                        <p className="text-foreground font-semibold text-lg">
                          {config.supplyChain ? (SUPPLY_CHAIN_OPTIONS[config.supplyChain]?.label || "Standard") : <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded">
                        <p className="text-muted-foreground text-sm">Lead Time</p>
                        <p className="text-foreground font-semibold text-lg">
                          {LEAD_TIME_OPTIONS[config.leadTimeIndex]?.weeks} weeks
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Battery Storage R&D Section - only show if battery type selected */}
                  {config.batteryType && config.batteryType !== "none" && (
                    <div className="space-y-4 mb-8 p-4 border-2 border-dashed border-glow/30 rounded-lg bg-glow/5 relative">
                      <div className="absolute -top-3 left-4 px-2 bg-card">
                        <span className="text-xs font-bold text-glow uppercase tracking-wider flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-glow rounded-full" />
                          R&D Development
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-glow uppercase tracking-wider pt-2">
                        Integrated Battery Storage
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary/50 rounded">
                          <p className="text-muted-foreground text-sm">Battery Chemistry</p>
                          <div className="flex items-center gap-2">
                            <p className="text-foreground font-semibold text-lg">
                              {BATTERY_TYPE_OPTIONS[config.batteryType]?.label || config.batteryType}
                            </p>
                          </div>
                          <p className="text-xs text-glow mt-1">
                            {BATTERY_TYPE_OPTIONS[config.batteryType]?.status}
                          </p>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded">
                          <p className="text-muted-foreground text-sm">Storage Capacity</p>
                          <p className="text-foreground font-semibold text-lg">
                            {config.batteryCapacity 
                              ? (config.batteryCapacity === "custom" 
                                  ? "Custom (TBD)" 
                                  : config.batteryCapacity === "1000" 
                                    ? "1 MWh" 
                                    : `${config.batteryCapacity} kWh`)
                              : <span className="text-muted-foreground italic">Not specified</span>}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-glow/70 italic mt-2">
                        * This is an R&D preview feature. Final specifications subject to development progress and feasibility assessment.
                      </p>
                    </div>
                  )}

                  {/* Transformer Drawing */}
                  <div className="mb-8">
                    <TransformerDrawing config={config} />
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Estimated Price</p>
                        <p className="text-foreground text-xs">(FOB Factory)</p>
                      </div>
                      <p className="text-3xl font-bold text-gradient">
                        ${price.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs mt-4">
                      * Pricing is approximate and subject to confirmation. Contact us for a formal quote.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleDownloadPDF}
                  variant="heroOutline"
                  size="lg"
                  className="w-full"
                >
                  <FileDown className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>

                <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Request More Information
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request More Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        Enter your details below and we'll send you more information about this {config.kva} kVA transformer quote.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="quote-name">Name *</Label>
                        <Input
                          id="quote-name"
                          placeholder="Your name"
                          value={quoteForm.name}
                          onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quote-company">Company</Label>
                        <Input
                          id="quote-company"
                          placeholder="Your company (optional)"
                          value={quoteForm.company}
                          onChange={(e) => setQuoteForm({ ...quoteForm, company: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quote-email">Email *</Label>
                        <Input
                          id="quote-email"
                          type="email"
                          placeholder="your@email.com"
                          value={quoteForm.email}
                          onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                        />
                      </div>
                      <Button
                        onClick={handleQuoteRequest}
                        className="w-full"
                        variant="hero"
                        disabled={quoteSubmitting}
                      >
                        {quoteSubmitting ? "Sending..." : "Send Request"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Card className="p-12 card-gradient border-border flex flex-col items-center justify-center min-h-[500px]">
                <Zap className="w-16 h-16 text-muted-foreground mb-6" />
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  Your Spec Sheet Will Appear Here
                </h4>
                <p className="text-muted-foreground text-center max-w-sm">
                  Complete the configuration form and click "Generate Spec Sheet" to see your customized specifications and pricing.
                </p>
              </Card>
            )}
          </div>
        </div>
        </div>
      </section>
    </TooltipProvider>
  );
};

export default SpecSheetBuilder;
