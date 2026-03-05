"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Zap, FileDown, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DesignRequirementsForm } from '@/components/transformer/inputs/DesignRequirementsForm';
import { ProDesignForm } from '@/components/transformer/inputs/ProDesignForm';
import { SpecificationSheet } from '@/components/transformer/output/SpecificationSheet';
import { Switch } from '@/components/ui/switch';
import type { ProSpecData } from '@/engine/types/proSpec.types';
import { getDefaultProSpec } from '@/engine/constants/proDefaults';
import { CalculationSteps } from '@/components/transformer/calculations/CalculationSteps';
import { DesignSummary } from '@/components/transformer/output/DesignSummary';
import { BillOfMaterials } from '@/components/transformer/output/BillOfMaterials';
import { CostEstimate } from '@/components/transformer/output/CostEstimate';
import { DesignCalculationLoader } from '@/components/transformer/DesignCalculationLoader';
import { calculateCostEstimate } from '@/engine/core/costEstimation';
import { AssemblyDrawing } from '@/components/transformer/drawings/AssemblyDrawing';
import { SideViewDrawing } from '@/components/transformer/drawings/SideViewDrawing';
import { TopViewDrawing } from '@/components/transformer/drawings/TopViewDrawing';
import { designTransformer } from '@/engine/TransformerDesignEngine';
import type { DesignRequirements, TransformerDesign } from '@/engine/types/transformer.types';
import { STEEL_GRADES, CONDUCTOR_TYPES, COOLING_CLASSES, VECTOR_GROUPS, calculatePowerRatings } from '@/engine/constants/materials';

const defaultRequirements: DesignRequirements = {
  ratedPower: 1500,
  primaryVoltage: 13800,
  secondaryVoltage: 480,
  frequency: 60,
  phases: 3,
  targetImpedance: 5.75,
  steelGrade: STEEL_GRADES.find(s => s.id === 'hi-b')!,
  conductorType: CONDUCTOR_TYPES.find(c => c.id === 'copper')!,
  coolingClass: COOLING_CLASSES.find(c => c.id === 'onan')!,
  vectorGroup: VECTOR_GROUPS.find(v => v.id === 'dyn11')!,
  tapChangerType: 'noLoad',
  oilType: 'mineral',
  oilPreservation: 'conservator',
  includeTAC: false,
  manufacturingRegions: ['usa'],
  requireFEOC: true,
};

export function TransformerDesigner() {
  const [requirements, setRequirements] = useState<DesignRequirements>(defaultRequirements);
  const [design, setDesign] = useState<TransformerDesign | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [activeDrawingTab, setActiveDrawingTab] = useState('assembly-front');
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [marketplaceSubmitting, setMarketplaceSubmitting] = useState(false);
  const [marketplaceSuccess, setMarketplaceSuccess] = useState(false);
  const [specMode, setSpecMode] = useState<'lite' | 'pro'>('lite');
  const [proSpec, setProSpec] = useState<ProSpecData>(getDefaultProSpec());
  const [marketplaceForm, setMarketplaceForm] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    zipcode: '',
  });

  const handleCalculate = () => {
    setIsCalculating(true);
  };

  const handleCalculationComplete = () => {
    const result = designTransformer(requirements, {
      steelGrade: requirements.steelGrade.id,
      hvConductorMaterial: requirements.conductorType.id === 'copper' ? 'copper' : 'aluminum',
      lvConductorMaterial: requirements.conductorType.id === 'copper' ? 'copper' : 'aluminum',
    });
    if (result.success && result.design) {
      setDesign(result.design);
    }
    setIsCalculating(false);
  };

  const handleExportPDF = async () => {
    if (!design) return;

    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const lineHeight = 6;

    // ── Palette ────────────────────────────────────────────────────────────────
    const ink    = { r: 30,  g: 28,  b: 42  };  // near-black for header/footer bars
    const gold   = { r: 180, g: 152, b: 105 };  // warm gold accent
    const cream  = { r: 246, g: 240, b: 225 };  // cream section header fill
    const rowAlt = { r: 252, g: 250, b: 244 };  // subtle cream alternating row tint

    // ── Logo ───────────────────────────────────────────────────────────────────
    let logoBase64: string | null = null;
    try {
      const response = await fetch('/fluxco-logo-light.png');
      const blob = await response.blob();
      logoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      // Logo unavailable — continue without it
    }

    const ratings = calculatePowerRatings(requirements.ratedPower, requirements.coolingClass.id);

    // ── Helpers ────────────────────────────────────────────────────────────────

    const addPageHeader = (pageNum: number, title: string) => {
      pdf.setFillColor(ink.r, ink.g, ink.b);
      pdf.rect(0, 0, pageWidth, 14, 'F');

      if (logoBase64) {
        pdf.addImage(logoBase64, 'PNG', margin, 2, 28, 10);
      } else {
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('FLUXCO', margin, 9);
      }

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(title, pageWidth - margin, 9, { align: 'right' });
      pdf.setTextColor(30, 30, 30);

      pdf.setDrawColor(gold.r, gold.g, gold.b);
      pdf.setLineWidth(0.5);
      pdf.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(140, 140, 140);
      pdf.text('Fluxco Spec Builder · fluxco.com · Issued for OEM Bidding', margin, pageHeight - 6);
      pdf.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
      pdf.setTextColor(30, 30, 30);
    };

    const drawSectionHeader = (label: string, yPos: number): number => {
      pdf.setFillColor(cream.r, cream.g, cream.b);
      pdf.rect(margin, yPos, contentWidth, 7, 'F');
      // Gold left accent stripe
      pdf.setFillColor(gold.r, gold.g, gold.b);
      pdf.rect(margin, yPos, 2.5, 7, 'F');
      pdf.setTextColor(ink.r, ink.g, ink.b);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text(label.toUpperCase(), margin + 6, yPos + 5);
      pdf.setTextColor(30, 30, 30);
      return yPos + 7 + 2;
    };

    const drawTable = (
      rows: [string, string][],
      startY: number,
      colSplit: number = margin + 82,
    ): number => {
      const rowH = 6.5;
      pdf.setFontSize(9);
      rows.forEach(([label, value], i) => {
        if (i % 2 === 1) {
          pdf.setFillColor(rowAlt.r, rowAlt.g, rowAlt.b);
          pdf.rect(margin, startY + i * rowH, contentWidth, rowH, 'F');
        }
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 92, 80);
        pdf.text(label, margin + 5, startY + i * rowH + 4.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(ink.r, ink.g, ink.b);
        pdf.text(value, colSplit, startY + i * rowH + 4.5);
      });
      pdf.setFont('helvetica', 'normal');
      return startY + rows.length * rowH + 4;
    };

    const fmtRegions = (regions: string[] | undefined): string => {
      if (!regions || regions.length === 0) return 'No preference';
      const labels: Record<string, string> = { usa: 'USA', northAmerica: 'North America', global: 'Global', china: 'China' };
      return regions.map(r => labels[r] || r).join(', ');
    };

    const fmtOilType = (oil: string | undefined): string => {
      const m: Record<string, string> = { mineral: 'Mineral Oil', naturalEster: 'Natural Ester', syntheticEster: 'Synthetic Ester', silicon: 'Silicon' };
      return oil ? (m[oil] || oil) : 'Mineral Oil';
    };

    const fmtOilPreservation = (p: string | undefined): string => {
      const m: Record<string, string> = { conservator: 'Conservator', sealedTank: 'Sealed Tank', nitrogen: 'Nitrogen Blanket' };
      return p ? (m[p] || p) : 'Conservator';
    };

    // ── Page 1: Cover ──────────────────────────────────────────────────────────

    // Full-height left accent (ink)
    pdf.setFillColor(ink.r, ink.g, ink.b);
    pdf.rect(0, 0, 8, pageHeight, 'F');
    // Top header band (ink)
    pdf.rect(8, 0, pageWidth - 8, 55, 'F');

    if (logoBase64) {
      pdf.addImage(logoBase64, 'PNG', 18, 8, 50, 18);
    } else {
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FLUXCO', 18, 24);
    }

    // Tagline
    pdf.setTextColor(gold.r, gold.g, gold.b);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text("America's Transformer Marketplace", 18, 32);

    // Mode badge (top right)
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(gold.r, gold.g, gold.b);
    pdf.text(specMode === 'pro' ? 'PRO · PIP ELSTR01' : 'STANDARD SPECIFICATION', pageWidth - 12, 10, { align: 'right' });

    // Document title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Transformer Procurement Specification', 18, 48);

    // Spec summary card (cream)
    pdf.setFillColor(cream.r, cream.g, cream.b);
    pdf.roundedRect(18, 65, pageWidth - 26, 68, 2, 2, 'F');
    pdf.setDrawColor(gold.r, gold.g, gold.b);
    pdf.setLineWidth(0.8);
    pdf.roundedRect(18, 65, pageWidth - 26, 68, 2, 2, 'S');

    pdf.setTextColor(ink.r, ink.g, ink.b);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${ratings.display} Power Transformer`, 26, 77);

    const coverSpecs: [string, string][] = [
      ['Primary Voltage', `${requirements.primaryVoltage.toLocaleString()} V`],
      ['Secondary Voltage', `${requirements.secondaryVoltage.toLocaleString()} V`],
      ['Frequency', `${requirements.frequency} Hz`],
      ['Vector Group', requirements.vectorGroup.name],
      ['Cooling Class', requirements.coolingClass.name],
      ['Phases', `${requirements.phases}-Phase`],
    ];
    const colA = 26;
    const colB = 115;
    coverSpecs.forEach(([label, value], i) => {
      const col = i < 3 ? colA : colB;
      const row = i % 3;
      const yy = 87 + row * 10;
      pdf.setFontSize(9.5);
      pdf.setTextColor(110, 100, 85);
      pdf.setFont('helvetica', 'normal');
      pdf.text(label, col, yy);
      pdf.setTextColor(ink.r, ink.g, ink.b);
      pdf.setFont('helvetica', 'bold');
      pdf.text(value, col, yy + 5);
    });

    // Divider
    pdf.setDrawColor(gold.r, gold.g, gold.b);
    pdf.setLineWidth(0.4);
    pdf.line(18, 141, pageWidth - 8, 141);

    // Metadata
    const metaRows: [string, string][] = [
      ['Prepared by', 'Fluxco Spec Builder'],
      ['Date Generated', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
      ['Specification Type', specMode === 'pro' ? 'Professional (PIP ELSTR01)' : 'Standard'],
    ];
    metaRows.forEach(([label, value], i) => {
      const yy = 150 + i * 14;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(110, 100, 85);
      pdf.text(label, 18, yy);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(ink.r, ink.g, ink.b);
      pdf.text(value, 18, yy + 6);
    });

    // Cover footer disclaimer
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(160, 150, 135);
    const disclaimer = 'This specification is issued for OEM bidding purposes and is generated by the Fluxco Spec Builder. All specifications should be confirmed by a qualified engineer prior to procurement.';
    pdf.text(pdf.splitTextToSize(disclaimer, pageWidth - 30), 18, pageHeight - 14);

    // ── Page 2: Procurement Specification (Lite inputs) ────────────────────────

    pdf.addPage();
    addPageHeader(2, 'Procurement Specification');
    let y = 22;

    y = drawSectionHeader('Electrical Ratings', y);
    y = drawTable([
      ['Rated Power', `${ratings.display}  (${requirements.ratedPower.toLocaleString()} kVA)`],
      ['Primary Voltage', `${requirements.primaryVoltage.toLocaleString()} V`],
      ['Secondary Voltage', `${requirements.secondaryVoltage.toLocaleString()} V`],
      ['Frequency', `${requirements.frequency} Hz`],
      ['Phases', `${requirements.phases}-Phase`],
      ['Vector Group', requirements.vectorGroup.name],
      ['Target Impedance', `${requirements.targetImpedance.toFixed(2)}%`],
      ['Temperature Rise', requirements.temperatureRise ? `${requirements.temperatureRise}°C` : '65°C (default)'],
    ], y);

    y = drawSectionHeader('Installation Requirements', y);
    y = drawTable([
      ['Cooling Class', requirements.coolingClass.name],
      ['Altitude', requirements.altitude ? `${requirements.altitude.toLocaleString()} m above sea level` : 'Not specified  (≤1000 m assumed)'],
      ['Max Ambient Temperature', requirements.ambientTemperature ? `${requirements.ambientTemperature}°C` : 'Not specified  (40°C assumed)'],
    ], y);

    y = drawSectionHeader('Core & Winding Materials', y);
    y = drawTable([
      ['Core Steel Grade', requirements.steelGrade.name],
      ['Conductor Material', requirements.conductorType.name],
      ['Tap Changer', requirements.tapChangerType === 'onLoad' ? 'On-Load (OLTC)' : 'No-Load (NLTC)'],
    ], y);

    y = drawSectionHeader('Liquid System', y);
    y = drawTable([
      ['Insulating Liquid', fmtOilType(requirements.oilType)],
      ['Liquid Preservation', fmtOilPreservation(requirements.oilPreservation)],
    ], y);

    y = drawSectionHeader('Procurement Requirements', y);
    y = drawTable([
      ['Manufacturing Region(s)', fmtRegions(requirements.manufacturingRegions)],
      ['FEOC Compliance', requirements.requireFEOC ? 'Required' : 'Not Required'],
      ['Transformer Automation Controller', requirements.includeTAC ? 'Required  (e.g., SEL-2414)' : 'Not Required'],
    ], y);

    // ── Page 3: Calculated Performance Targets ─────────────────────────────────

    pdf.addPage();
    addPageHeader(3, 'Performance Targets');
    y = 22;

    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(110, 100, 90);
    const perfNote = 'The following performance targets are derived from the specified inputs. OEM bids should demonstrate compliance with or improvement upon these values.';
    const perfNoteLines = pdf.splitTextToSize(perfNote, contentWidth);
    pdf.text(perfNoteLines, margin, y);
    y += perfNoteLines.length * 5.2 + 5;
    pdf.setTextColor(30, 30, 30);

    const effAt100 = design.losses.efficiency.find(e => e.loadPercent === 100)?.efficiency.toFixed(2) ?? 'N/A';
    const effAt50  = design.losses.efficiency.find(e => e.loadPercent === 50)?.efficiency.toFixed(2) ?? 'N/A';

    y = drawSectionHeader('Impedance & Regulation', y);
    y = drawTable([
      ['Target Impedance (%Z)',          `${requirements.targetImpedance.toFixed(2)}%`],
      ['Calculated Impedance (%Z)',       `${design.impedance.percentZ.toFixed(2)}%`],
      ['% Resistance (%R)',               `${design.impedance.percentR.toFixed(2)}%`],
      ['% Reactance (%X)',                `${design.impedance.percentX.toFixed(2)}%`],
      ['X/R Ratio',                       `${design.impedance.xrRatio.toFixed(1)}`],
      ['Voltage Regulation (unity PF)',   `${design.impedance.regulationAtUnityPF.toFixed(2)}%`],
      ['Voltage Regulation (0.8 lag PF)', `${design.impedance.regulationAt08PF.toFixed(2)}%`],
    ], y);

    y = drawSectionHeader('Losses', y);
    y = drawTable([
      ['No-Load (Core) Loss',        `${design.losses.noLoadLoss.toFixed(0)} W`],
      ['Load Loss @ 100% (75°C)',    `${design.losses.loadLoss.toFixed(0)} W`],
      ['Total Loss @ 100% Load',     `${design.losses.totalLoss.toFixed(0)} W`],
    ], y);

    y = drawSectionHeader('Efficiency', y);
    y = drawTable([
      ['Efficiency @ 50% Load',   `${effAt50}%`],
      ['Efficiency @ 100% Load',  `${effAt100}%`],
      ['Peak Efficiency Load',    `${design.losses.maxEfficiencyLoad}%`],
      ['Peak Efficiency',         `${design.losses.maxEfficiency.toFixed(2)}%`],
    ], y);

    y = drawSectionHeader('Thermal Performance', y);
    y = drawTable([
      ['Top Oil Temperature Rise',  `${design.thermal.topOilRise.toFixed(1)} °C`],
      ['Average Winding Rise',      `${design.thermal.averageWindingRise.toFixed(1)} °C`],
      ['Hot Spot Rise',             `${design.thermal.hotSpotRise.toFixed(1)} °C`],
      ['Oil Volume',                `${design.thermal.oilVolume.toFixed(0)} L`],
      ['Radiator Panels',           `${design.thermal.numberOfRadiators}`],
    ], y);

    y = drawSectionHeader('Physical Dimensions & Weight', y);
    y = drawTable([
      ['Tank Length',                     `${design.tank.length.toFixed(0)} mm`],
      ['Tank Width',                      `${design.tank.width.toFixed(0)} mm`],
      ['Tank Height',                     `${design.tank.height.toFixed(0)} mm`],
      ['Overall Height (with bushings)',  `${design.tank.overallHeight.toFixed(0)} mm`],
      ['Total Weight (oil-filled)',       `${design.tank.totalWeight.toFixed(0)} kg`],
      ['Shipping Weight (untanked)',      `${design.tank.shippingWeight.toFixed(0)} kg`],
    ], y);

    // ── Pages 4+: PIP ELSTR01 (Pro only) ──────────────────────────────────────

    let pageNum = 4;

    if (specMode === 'pro') {
      pdf.addPage();
      addPageHeader(pageNum, 'PIP ELSTR01 — Site & Certifications');
      pageNum++;
      y = 22;

      // Closure helper: check page space and add a new page if needed
      const ensureSpace = (neededH: number) => {
        if (y + neededH > pageHeight - 16) {
          pdf.addPage();
          addPageHeader(pageNum, 'PIP ELSTR01 Specification');
          pageNum++;
          y = 22;
        }
      };

      // § Site Conditions
      const siteRows: [string, string][] = [];
      if (proSpec.siteConditions.altitude != null)           siteRows.push(['Altitude', `${proSpec.siteConditions.altitude} ${proSpec.siteConditions.altitudeUnit || 'ft'}`]);
      if (proSpec.siteConditions.ambientTempMax != null)     siteRows.push(['Max Ambient Temp', `${proSpec.siteConditions.ambientTempMax}°C`]);
      if (proSpec.siteConditions.ambientTempMin != null)     siteRows.push(['Min Ambient Temp', `${proSpec.siteConditions.ambientTempMin}°C`]);
      if (proSpec.siteConditions.ambientTempAvg24hr != null) siteRows.push(['Avg 24-hr Ambient', `${proSpec.siteConditions.ambientTempAvg24hr}°C`]);
      siteRows.push(['Seismic Qualification', proSpec.siteConditions.seismicQualification === 'required' ? 'Required' : 'Not Required']);
      if (proSpec.siteConditions.seismicStandards)           siteRows.push(['Seismic Standards', proSpec.siteConditions.seismicStandards]);
      if (proSpec.siteConditions.areaClassification)         siteRows.push(['Area Classification', proSpec.siteConditions.areaClassification === 'classified' ? 'Classified' : 'Non-Classified']);
      if (proSpec.siteConditions.moistCorrosiveEnvironment != null) siteRows.push(['Moist / Corrosive Environment', proSpec.siteConditions.moistCorrosiveEnvironment ? 'Yes' : 'No']);
      ensureSpace(7 + siteRows.length * 6.5 + 6);
      y = drawSectionHeader('Site Conditions  (§4.1.1)', y);
      y = drawTable(siteRows, y);

      // § Certifications
      const certRows: [string, string][] = [
        ['NRTL Listing', proSpec.nrtlListing === 'required' ? 'Required' : 'Not Required'],
        ['FM Approved',  proSpec.fmApproved  === 'required' ? 'Required' : 'Not Required'],
      ];
      ensureSpace(7 + certRows.length * 6.5 + 6);
      y = drawSectionHeader('Certifications  (§4.1.3–4.1.4)', y);
      y = drawTable(certRows, y);

      // § Windings & Temp Rise
      const windRows: [string, string][] = [
        ['Avg Temperature Rise', `${proSpec.windingsAndTempRise.averageTempRise || 65}°C`],
        ['Primary Connection',   proSpec.windingsAndTempRise.primaryConnection === 'delta' ? 'Delta' : 'Wye'],
        ['Primary Material',     proSpec.windingsAndTempRise.primaryMaterial === 'copper' ? 'Copper' : 'Aluminum'],
        ['Secondary Connection', proSpec.windingsAndTempRise.secondaryConnection === 'delta' ? 'Delta' : 'Wye'],
        ['Secondary Material',   proSpec.windingsAndTempRise.secondaryMaterial === 'copper' ? 'Copper' : 'Aluminum'],
      ];
      if (proSpec.windingsAndTempRise.frequentEnergizingUnderLoad != null)
        windRows.push(['Frequent Energizing Under Load', proSpec.windingsAndTempRise.frequentEnergizingUnderLoad ? 'Yes' : 'No']);
      if (proSpec.windingsAndTempRise.rapidCyclingOrSurge != null)
        windRows.push(['Rapid Cycling / Surge', proSpec.windingsAndTempRise.rapidCyclingOrSurge ? 'Yes' : 'No']);
      ensureSpace(7 + windRows.length * 6.5 + 6);
      y = drawSectionHeader('Windings & Temperature Rise  (§4.2.1)', y);
      y = drawTable(windRows, y);

      // § BIL
      if (proSpec.bil.primaryBilKv || proSpec.bil.secondaryBilKv) {
        const bilRows: [string, string][] = [];
        if (proSpec.bil.primaryBilKv)   bilRows.push(['Primary BIL',   `${proSpec.bil.primaryBilKv} kV`]);
        if (proSpec.bil.secondaryBilKv) bilRows.push(['Secondary BIL', `${proSpec.bil.secondaryBilKv} kV`]);
        ensureSpace(7 + bilRows.length * 6.5 + 6);
        y = drawSectionHeader('Basic Impulse Levels  (§4.2.14)', y);
        y = drawTable(bilRows, y);
      }

      // § Impedance (Pro override)
      if (proSpec.impedance.type === 'custom' && proSpec.impedance.customValue) {
        const impRows: [string, string][] = [
          ['Impedance Type',  'Custom'],
          ['Custom Value',    `${proSpec.impedance.customValue}%`],
        ];
        ensureSpace(7 + impRows.length * 6.5 + 6);
        y = drawSectionHeader('Impedance Override  (§4.2.1.4)', y);
        y = drawTable(impRows, y);
      }

      // § Loss Evaluation
      if (proSpec.losses.lossEvaluationRequired) {
        const lossRows: [string, string][] = [['Loss Evaluation', 'Required']];
        if (proSpec.losses.dollarPerKwOffset)    lossRows.push(['$/kW Offset', `$${proSpec.losses.dollarPerKwOffset}`]);
        if (proSpec.losses.loadLossesKw)         lossRows.push(['Max Load Losses', `${proSpec.losses.loadLossesKw} kW`]);
        if (proSpec.losses.noLoadLossesKw)       lossRows.push(['Max No-Load Losses', `${proSpec.losses.noLoadLossesKw} kW`]);
        ensureSpace(7 + lossRows.length * 6.5 + 6);
        y = drawSectionHeader('Loss Evaluation  (§4.2.2)', y);
        y = drawTable(lossRows, y);
      }

      // § Primary Bushings
      const bushPRows: [string, string][] = [['Mounting', proSpec.bushingsPrimary.sideMounted ? 'Side' : 'Top']];
      if (proSpec.bushingsPrimary.material)    bushPRows.push(['Material',     proSpec.bushingsPrimary.material.charAt(0).toUpperCase() + proSpec.bushingsPrimary.material.slice(1)]);
      if (proSpec.bushingsPrimary.connections) bushPRows.push(['Connections',  proSpec.bushingsPrimary.connections.toUpperCase().replace(/_/g, ' ')]);
      if (proSpec.bushingsPrimary.flangedThroat != null) bushPRows.push(['Flanged Throat', proSpec.bushingsPrimary.flangedThroat ? 'Yes' : 'No']);
      ensureSpace(7 + bushPRows.length * 6.5 + 6);
      y = drawSectionHeader('Primary Bushings  (§4.2.3)', y);
      y = drawTable(bushPRows, y);

      // § Secondary Bushings
      const bushSRows: [string, string][] = [['Mounting', proSpec.bushingsSecondary.sideMounted ? 'Side' : 'Top']];
      if (proSpec.bushingsSecondary.material)    bushSRows.push(['Material',    proSpec.bushingsSecondary.material.charAt(0).toUpperCase() + proSpec.bushingsSecondary.material.slice(1)]);
      if (proSpec.bushingsSecondary.connections) bushSRows.push(['Connections', proSpec.bushingsSecondary.connections.toUpperCase().replace(/_/g, ' ')]);
      ensureSpace(7 + bushSRows.length * 6.5 + 6);
      y = drawSectionHeader('Secondary Bushings  (§4.2.3)', y);
      y = drawTable(bushSRows, y);

      // § Tank
      const tankRows: [string, string][] = [
        ['Cover Type',    proSpec.tank.coverType === 'welded' ? 'Welded' : 'Bolted'],
        ['Vacuum Rated',  proSpec.tank.tankVacuumRated === 'required' ? 'Required' : 'Not Required'],
      ];
      if (proSpec.tank.jackingPads)          tankRows.push(['Jacking Pads',          proSpec.tank.jackingPads === 'required' ? 'Required' : 'Not Required']);
      if (proSpec.tank.ltcPressureReliefVent) tankRows.push(['LTC Pressure Relief Vent', proSpec.tank.ltcPressureReliefVent === 'required' ? 'Required' : 'Not Required']);
      ensureSpace(7 + tankRows.length * 6.5 + 6);
      y = drawSectionHeader('Tank  (§4.2.4)', y);
      y = drawTable(tankRows, y);

      // § Cooling
      const coolRows: [string, string][] = [];
      if (proSpec.cooling.radiatorType)     coolRows.push(['Radiator Type',     proSpec.cooling.radiatorType === 'mfg_std' ? 'Manufacturer Standard' : proSpec.cooling.radiatorType.replace(/_/g, ' ')]);
      if (proSpec.cooling.radiatorMaterial) coolRows.push(['Radiator Material', proSpec.cooling.radiatorMaterial === 'mfg_std' ? 'Manufacturer Standard' : proSpec.cooling.radiatorMaterial.replace(/_/g, ' ')]);
      if (proSpec.cooling.removableRadiators != null) coolRows.push(['Removable Radiators', proSpec.cooling.removableRadiators ? 'Yes' : 'No']);
      coolRows.push(['Cooling Fans', proSpec.fans.status === 'required' ? 'Required' : proSpec.fans.status === 'provisions_for_future' ? 'Provisions for Future' : 'Not Required']);
      if (proSpec.fans.voltage) coolRows.push(['Fan Voltage', proSpec.fans.voltage]);
      ensureSpace(7 + coolRows.length * 6.5 + 6);
      y = drawSectionHeader('Cooling Equipment  (§4.2.5)', y);
      y = drawTable(coolRows, y);

      // § Tap Changer
      const tapRows: [string, string][] = [
        ['No-Load Tap Changer', proSpec.tapChanger.noLoad.required === 'required'
          ? `Required${proSpec.tapChanger.noLoad.description ? '  — ' + proSpec.tapChanger.noLoad.description : ''}`
          : 'Not Required'],
        ['On-Load Tap Changer', proSpec.tapChanger.onLoad.required === 'required'
          ? `Required${proSpec.tapChanger.onLoad.regulationRange ? '  — ' + proSpec.tapChanger.onLoad.regulationRange : ''}`
          : 'Not Required'],
      ];
      if (proSpec.tapChanger.onLoad.required === 'required' && proSpec.tapChanger.onLoad.autoControlled)
        tapRows.push(['Auto Controlled', proSpec.tapChanger.onLoad.autoControlled === 'required' ? 'Yes' : 'No']);
      ensureSpace(7 + tapRows.length * 6.5 + 6);
      y = drawSectionHeader('Tap Changer  (§4.2.12)', y);
      y = drawTable(tapRows, y);

      // § Insulating Liquid
      const liqLabels: Record<string, string> = {
        mineral_type_i: 'Mineral Oil — Type I', mineral_type_ii: 'Mineral Oil — Type II',
        silicon: 'Silicon', fire_resistant_ester: 'Fire-Resistant Ester',
        less_flammable_hc: 'Less-Flammable Hydrocarbon', mfg_discretion: 'Manufacturer Discretion',
      };
      const presLabels: Record<string, string> = {
        sealed_tank: 'Sealed Tank', inert_gas: 'Inert Gas Blanket',
        conservator_without_diaphragm: 'Conservator (without diaphragm)',
        conservator_with_diaphragm: 'Conservator (with diaphragm)',
      };
      const liqRows: [string, string][] = [];
      if (proSpec.insulatingLiquid.type)     liqRows.push(['Insulating Liquid Type', liqLabels[proSpec.insulatingLiquid.type] || proSpec.insulatingLiquid.type]);
      if (proSpec.liquidPreservation.type)   liqRows.push(['Liquid Preservation',    presLabels[proSpec.liquidPreservation.type] || proSpec.liquidPreservation.type]);
      if (liqRows.length > 0) {
        ensureSpace(7 + liqRows.length * 6.5 + 6);
        y = drawSectionHeader('Insulating Liquid  (§4.3)', y);
        y = drawTable(liqRows, y);
      }

      // § Surge Arresters
      if (proSpec.surgeArresters.required === 'required') {
        const saRows: [string, string][] = [['Surge Arresters', 'Required']];
        if (proSpec.surgeArresters.voltageRating) saRows.push(['Voltage Rating', `${proSpec.surgeArresters.voltageRating} kV`]);
        if (proSpec.surgeArresters.mcovRating)    saRows.push(['MCOV Rating',    `${proSpec.surgeArresters.mcovRating} kV`]);
        ensureSpace(7 + saRows.length * 6.5 + 6);
        y = drawSectionHeader('Surge Arresters  (§4.2.6)', y);
        y = drawTable(saRows, y);
      }

      // § Pressure Relief Vent
      if (proSpec.pressureReliefVent.required === 'required') {
        const prRows: [string, string][] = [
          ['Pressure Relief Vent', 'Required'],
          ['Vent to Safe Location', proSpec.pressureReliefVent.toSafeLocation === 'required' ? 'Required' : 'Not Required'],
        ];
        ensureSpace(7 + prRows.length * 6.5 + 6);
        y = drawSectionHeader('Pressure Relief Vent  (§4.2.7)', y);
        y = drawTable(prRows, y);
      }

      // § Harmonics
      if (proSpec.harmonics.nonLinearLoads) {
        const harmRows: [string, string][] = [['Non-Linear Loads', 'Yes']];
        if (proSpec.harmonics.description) harmRows.push(['Description', proSpec.harmonics.description]);
        ensureSpace(7 + harmRows.length * 6.5 + 6);
        y = drawSectionHeader('Harmonics  (§4.2.15)', y);
        y = drawTable(harmRows, y);
      }

      // § Coatings
      const coatRows: [string, string][] = [];
      if (proSpec.coatings.color) {
        const colorLabel = proSpec.coatings.color === 'ansi_70' ? 'ANSI 70 — Medium Gray' : proSpec.coatings.color === 'ansi_61' ? 'ANSI 61 — Light Gray' : proSpec.coatings.colorOther || 'Other';
        coatRows.push(['Paint Color', colorLabel]);
      }
      if (proSpec.coatings.paintType)          coatRows.push(['Paint Type',      proSpec.coatings.paintType]);
      if (proSpec.coatings.paintThicknessMils) coatRows.push(['Paint Thickness', `${proSpec.coatings.paintThicknessMils} mils`]);
      if (coatRows.length > 0) {
        ensureSpace(7 + coatRows.length * 6.5 + 6);
        y = drawSectionHeader('Coatings  (§4.2.11)', y);
        y = drawTable(coatRows, y);
      }

      // § Tests
      const testRows: [string, string][] = [];
      if (proSpec.tests.noLoadAndLoadLoss != null)      testRows.push(['No-Load & Load Loss Test', proSpec.tests.noLoadAndLoadLoss ? 'Required' : 'Not Required']);
      if (proSpec.tests.tempRise != null)               testRows.push(['Temperature Rise Test',    proSpec.tests.tempRise ? 'Required' : 'Not Required']);
      if (proSpec.tests.lightningImpulse != null)       testRows.push(['Lightning Impulse Test',   proSpec.tests.lightningImpulse ? 'Required' : 'Not Required']);
      if (proSpec.tests.audibleSoundLevel != null)      testRows.push(['Audible Sound Level Test', proSpec.tests.audibleSoundLevel ? 'Required' : 'Not Required']);
      if (proSpec.tests.frequencyResponseAnalysis)      testRows.push(['Frequency Response Analysis', proSpec.tests.frequencyResponseAnalysis === 'required' ? 'Required' : 'Not Required']);
      testRows.push(['Test Witnessing', proSpec.tests.witnessed === 'witnessed' ? 'Witnessed' : 'Not Witnessed']);
      ensureSpace(7 + testRows.length * 6.5 + 6);
      y = drawSectionHeader('Tests  (§4.4)', y);
      y = drawTable(testRows, y);

      // § Documentation
      const docRows: [string, string][] = [];
      if (proSpec.documentation.electronicFormatPdf != null) docRows.push(['Electronic Format (PDF)', proSpec.documentation.electronicFormatPdf ? 'Required' : 'Not Required']);
      if (proSpec.documentation.electronicFormatDwg != null) docRows.push(['Electronic Format (DWG)', proSpec.documentation.electronicFormatDwg ? 'Required' : 'Not Required']);
      if (proSpec.documentation.documentCopies)              docRows.push(['Document Copies',         `${proSpec.documentation.documentCopies}`]);
      if (proSpec.documentation.manualCopies)                docRows.push(['Manual Copies',            `${proSpec.documentation.manualCopies}`]);
      if (docRows.length > 0) {
        ensureSpace(7 + docRows.length * 6.5 + 6);
        y = drawSectionHeader('Documentation  (§4.6)', y);
        y = drawTable(docRows, y);
      }

      // § Other Requirements
      if (proSpec.otherRequirements) {
        const lines = pdf.splitTextToSize(proSpec.otherRequirements, contentWidth - 8);
        ensureSpace(7 + lines.length * lineHeight + 6);
        y = drawSectionHeader('Other Requirements', y);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(65, 58, 50);
        pdf.text(lines, margin + 5, y);
        y += lines.length * lineHeight + 4;
        pdf.setTextColor(30, 30, 30);
      }
    }

    // ── Final page: Technical Drawings ─────────────────────────────────────────

    const drawingsContainer = document.getElementById('drawings-container');
    if (drawingsContainer) {
      pdf.addPage();
      addPageHeader(pageNum, 'Technical Drawings');

      const canvas = await html2canvas(drawingsContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const drawingY = 20;
      const maxDrawingHeight = pageHeight - drawingY - 14;

      pdf.addImage(imgData, 'PNG', margin, drawingY, imgWidth, Math.min(imgHeight, maxDrawingHeight));
    }

    const modeLabel = specMode === 'pro' ? 'pro' : 'lite';
    pdf.save(`fluxco-spec-${modeLabel}-${requirements.ratedPower}kva-${requirements.primaryVoltage}v-${requirements.secondaryVoltage}v.pdf`);
  };

  const handleMarketplaceSubmit = async () => {
    if (!design) return;

    setMarketplaceSubmitting(true);

    const costBreakdown = calculateCostEstimate(design, requirements, { oilType: 'mineral' });

    // Round numeric values to fit database column constraints
    const round2 = (n: number | null | undefined) => n != null ? Math.round(n * 100) / 100 : null;
    const efficiency = design.losses.efficiency.find(e => e.loadPercent === 100)?.efficiency;

    const listingData = {
      rated_power_kva: requirements.ratedPower,
      primary_voltage: requirements.primaryVoltage,
      secondary_voltage: requirements.secondaryVoltage,
      frequency: requirements.frequency,
      phases: requirements.phases,
      impedance_percent: round2(design.impedance.percentZ),
      vector_group: requirements.vectorGroup.name,
      cooling_class: requirements.coolingClass.name,
      conductor_type: requirements.conductorType.name,
      steel_grade: requirements.steelGrade.name,
      estimated_cost: round2(costBreakdown.totalCost),
      no_load_loss_w: round2(design.losses.noLoadLoss),
      load_loss_w: round2(design.losses.loadLoss),
      efficiency_percent: round2(efficiency),
      total_weight_kg: round2(design.core.coreWeight + design.hvWinding.conductorWeight + design.lvWinding.conductorWeight),
      contact_name: marketplaceForm.contactName,
      contact_email: marketplaceForm.contactEmail,
      contact_phone: marketplaceForm.contactPhone || null,
      asking_price: null,
      notes: [
        marketplaceForm.zipcode ? `Zipcode: ${marketplaceForm.zipcode}` : null,
        requirements.coolingClass.id !== 'onan' ? `Power Rating: ${calculatePowerRatings(requirements.ratedPower, requirements.coolingClass.id).display}` : null,
      ].filter(Boolean).join('. ') || null,
      zipcode: marketplaceForm.zipcode || null,
      spec_mode: specMode,
      status: 'listed',
      design_specs: {
        spec_mode: specMode,
        ...(specMode === 'pro' ? { proSpec } : {}),
        requirements: {
          ratedPower: requirements.ratedPower,
          primaryVoltage: requirements.primaryVoltage,
          secondaryVoltage: requirements.secondaryVoltage,
          frequency: requirements.frequency,
          phases: requirements.phases,
          vectorGroup: requirements.vectorGroup.name,
          coolingClass: requirements.coolingClass.name,
          conductorType: requirements.conductorType.name,
          steelGrade: requirements.steelGrade.name,
          altitude: requirements.altitude,
          ambientTemperature: requirements.ambientTemperature,
          tapChangerType: requirements.tapChangerType || 'noLoad',
          oilType: requirements.oilType || 'mineral',
          oilPreservation: requirements.oilPreservation || 'conservator',
          includeTAC: requirements.includeTAC || false,
          manufacturingRegions: requirements.manufacturingRegions || ['usa'],
          requireFEOC: requirements.requireFEOC ?? true,
        },
        performance: {
          impedancePercent: round2(design.impedance.percentZ),
          noLoadLossW: round2(design.losses.noLoadLoss),
          loadLossW: round2(design.losses.loadLoss),
          efficiencyPercent: round2(efficiency),
          topOilRiseC: round2(design.thermal.topOilRise),
          avgWindingRiseC: round2(design.thermal.averageWindingRise),
          hotSpotTempC: round2(design.thermal.hotSpotRise + (requirements.ambientTemperature || 30)),
        },
        physical: {
          totalWeightKg: round2(design.core.coreWeight + design.hvWinding.conductorWeight + design.lvWinding.conductorWeight),
          coreWeightKg: round2(design.core.coreWeight),
        },
        cost: {
          totalCost: round2(costBreakdown.totalCost),
          costPerKVA: round2(costBreakdown.costPerKVA),
        },
        powerRating: calculatePowerRatings(requirements.ratedPower, requirements.coolingClass.id).display,
      },
    };

    // Use API route to bypass RLS
    const response = await fetch('/api/marketplace/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingData),
    });

    const result = await response.json();

    setMarketplaceSubmitting(false);

    if (!response.ok) {
      alert('Error submitting to marketplace: ' + result.error);
    } else {
      setMarketplaceSuccess(true);
      setTimeout(() => {
        setMarketplaceOpen(false);
        setMarketplaceSuccess(false);
        setMarketplaceForm({
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          zipcode: '',
        });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Loading Animation */}
      {isCalculating && (
        <DesignCalculationLoader
          onComplete={handleCalculationComplete}
          ratedPower={requirements.ratedPower}
          primaryVoltage={requirements.primaryVoltage}
          secondaryVoltage={requirements.secondaryVoltage}
        />
      )}

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
            <div className="p-2 bg-primary rounded-lg">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Fluxco</h1>
              <p className="text-sm text-muted-foreground">Spec Builder</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Input Form */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Design Requirements</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="spec-mode" className={`text-sm ${specMode === 'lite' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Lite</Label>
              <Switch
                id="spec-mode"
                checked={specMode === 'pro'}
                onCheckedChange={(checked) => setSpecMode(checked ? 'pro' : 'lite')}
              />
              <Label htmlFor="spec-mode" className={`text-sm ${specMode === 'pro' ? 'text-blue-600 font-medium' : 'text-muted-foreground'}`}>Pro</Label>
            </div>
          </CardHeader>
          <CardContent>
            {specMode === 'lite' ? (
              <DesignRequirementsForm
                requirements={requirements}
                onChange={setRequirements}
                onCalculate={handleCalculate}
              />
            ) : (
              <ProDesignForm
                requirements={requirements}
                proSpec={proSpec}
                onChange={setRequirements}
                onProSpecChange={setProSpec}
                onCalculate={handleCalculate}
              />
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {design && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Design Results</h2>
              <div className="flex gap-2">
                <Button onClick={handleExportPDF} variant="outline">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Dialog open={marketplaceOpen} onOpenChange={setMarketplaceOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default">
                      <Store className="h-4 w-4 mr-2" />
                      Post to Marketplace
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Post to Marketplace</DialogTitle>
                      <DialogDescription>
                        Submit this {requirements.ratedPower} kVA transformer design to the supplier marketplace.
                      </DialogDescription>
                    </DialogHeader>
                    {marketplaceSuccess ? (
                      <div className="py-8 text-center">
                        <p className="text-green-500 font-semibold">Successfully submitted!</p>
                        <p className="text-sm text-muted-foreground mt-2">Your listing is pending review.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="contactName">Your Name *</Label>
                              <Input
                                id="contactName"
                                value={marketplaceForm.contactName}
                                onChange={(e) => setMarketplaceForm(f => ({ ...f, contactName: e.target.value }))}
                                placeholder="John Smith"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contactEmail">Email *</Label>
                              <Input
                                id="contactEmail"
                                type="email"
                                value={marketplaceForm.contactEmail}
                                onChange={(e) => setMarketplaceForm(f => ({ ...f, contactEmail: e.target.value }))}
                                placeholder="you@company.com"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="contactPhone">Phone</Label>
                              <Input
                                id="contactPhone"
                                value={marketplaceForm.contactPhone}
                                onChange={(e) => setMarketplaceForm(f => ({ ...f, contactPhone: e.target.value }))}
                                placeholder="+1 (555) 000-0000"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="zipcode">Project Zipcode *</Label>
                              <Input
                                id="zipcode"
                                value={marketplaceForm.zipcode}
                                onChange={(e) => setMarketplaceForm(f => ({ ...f, zipcode: e.target.value }))}
                                placeholder="12345"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleMarketplaceSubmit}
                            disabled={!marketplaceForm.contactName || !marketplaceForm.contactEmail || !marketplaceForm.zipcode || marketplaceSubmitting}
                          >
                            {marketplaceSubmitting ? 'Submitting...' : 'Submit Listing'}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`grid w-full ${specMode === 'pro' ? 'grid-cols-6' : 'grid-cols-5'}`}>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                {specMode === 'pro' && <TabsTrigger value="specifications">Specifications</TabsTrigger>}
                <TabsTrigger value="calculations">Calculations</TabsTrigger>
                <TabsTrigger value="drawings">Drawings</TabsTrigger>
                <TabsTrigger value="bom">BOM</TabsTrigger>
                <TabsTrigger value="cost">Cost Estimate</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <DesignSummary design={design} requirements={requirements} />
              </TabsContent>

              {specMode === 'pro' && (
                <TabsContent value="specifications">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">PIP ELSTR01 Specification Sheet</CardTitle>
                      <p className="text-sm text-muted-foreground">Full procurement specification as configured in Pro mode</p>
                    </CardHeader>
                    <CardContent>
                      <SpecificationSheet proSpec={proSpec} requirements={requirements} />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="calculations">
                <CalculationSteps design={design} requirements={requirements} />
              </TabsContent>

              <TabsContent value="drawings">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Engineering Drawing Set</CardTitle>
                    <p className="text-sm text-muted-foreground">Complete manufacturing drawings with dimensions</p>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeDrawingTab} onValueChange={setActiveDrawingTab}>
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="assembly-front" className="text-xs">Front View</TabsTrigger>
                        <TabsTrigger value="assembly-side" className="text-xs">Side View</TabsTrigger>
                        <TabsTrigger value="assembly-top" className="text-xs">Top View</TabsTrigger>
                      </TabsList>

                      <div id="drawings-container">
                        <TabsContent value="assembly-front" className="mt-0">
                          <AssemblyDrawing
                            core={design.core}
                            hvWinding={design.hvWinding}
                            lvWinding={design.lvWinding}
                            tank={design.tank}
                            thermal={design.thermal}
                            primaryVoltage={requirements.primaryVoltage}
                            secondaryVoltage={requirements.secondaryVoltage}
                            vectorGroup={requirements.vectorGroup.name}
                            requirements={requirements}
                            bom={design.bom}
                          />
                        </TabsContent>

                        <TabsContent value="assembly-side" className="mt-0">
                          <SideViewDrawing
                            core={design.core}
                            hvWinding={design.hvWinding}
                            lvWinding={design.lvWinding}
                            tank={design.tank}
                            thermal={design.thermal}
                          />
                        </TabsContent>

                        <TabsContent value="assembly-top" className="mt-0">
                          <TopViewDrawing
                            core={design.core}
                            hvWinding={design.hvWinding}
                            lvWinding={design.lvWinding}
                            tank={design.tank}
                            thermal={design.thermal}
                            phases={requirements.phases}
                          />
                        </TabsContent>

                      </div>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bom">
                <BillOfMaterials design={design} />
              </TabsContent>

              <TabsContent value="cost">
                <CostEstimate design={design} requirements={requirements} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 flex flex-col items-center gap-1">
          <p className="text-sm text-muted-foreground text-center">
            Fluxco Spec Builder. Always verify results with a qualified electrical engineer.
          </p>
          <a href="tel:+15128593335" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            (512) 859-3335
          </a>
        </div>
      </footer>
    </div>
  );
}

export default TransformerDesigner;
