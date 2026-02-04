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
import { CalculationSteps } from '@/components/transformer/calculations/CalculationSteps';
import { DesignSummary } from '@/components/transformer/output/DesignSummary';
import { BillOfMaterials } from '@/components/transformer/output/BillOfMaterials';
import { CostEstimate } from '@/components/transformer/output/CostEstimate';
import { DesignCalculationLoader } from '@/components/transformer/DesignCalculationLoader';
import { calculateCostEstimate, calculateLifecycleCost, formatCurrency } from '@/engine/core/costEstimation';
import { CoreCrossSectionDrawing } from '@/components/transformer/drawings/CoreCrossSectionDrawing';
import { WindingLayoutDrawing } from '@/components/transformer/drawings/WindingLayoutDrawing';
import { AssemblyDrawing } from '@/components/transformer/drawings/AssemblyDrawing';
import { SideViewDrawing } from '@/components/transformer/drawings/SideViewDrawing';
import { TopViewDrawing } from '@/components/transformer/drawings/TopViewDrawing';
import { CoreDetailDrawing } from '@/components/transformer/drawings/CoreDetailDrawing';
import { WindingDetailDrawing } from '@/components/transformer/drawings/WindingDetailDrawing';
import { designTransformer } from '@/engine/TransformerDesignEngine';
import type { DesignRequirements, TransformerDesign } from '@/engine/types/transformer.types';
import { STEEL_GRADES, CONDUCTOR_TYPES, COOLING_CLASSES, VECTOR_GROUPS } from '@/engine/constants/materials';

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

    // Dynamic import to avoid loading jspdf/html2canvas until needed
    const { default: html2canvas } = await import('html2canvas');
    const { jsPDF } = await import('jspdf');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    // Title page
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Fluxco Design Report', pageWidth / 2, 40, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${requirements.ratedPower} kVA Power Transformer`, pageWidth / 2, 55, { align: 'center' });
    pdf.text(`${requirements.primaryVoltage}V / ${requirements.secondaryVoltage}V`, pageWidth / 2, 65, { align: 'center' });

    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 85, { align: 'center' });
    pdf.text('Fluxco - Verify with qualified engineer', pageWidth / 2, 95, { align: 'center' });

    // Design summary
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Design Summary', margin, 20);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let y = 35;
    const lineHeight = 6;

    const summaryData = [
      ['Rated Power', `${requirements.ratedPower} kVA`],
      ['Primary Voltage', `${requirements.primaryVoltage} V`],
      ['Secondary Voltage', `${requirements.secondaryVoltage} V`],
      ['Frequency', `${requirements.frequency} Hz`],
      ['Vector Group', requirements.vectorGroup.name],
      ['Cooling Class', requirements.coolingClass.name],
      ['', ''],
      ['Core Steel', design.core.steelGrade.name],
      ['Flux Density', `${design.core.fluxDensity} T`],
      ['Core Diameter', `${design.core.coreDiameter} mm`],
      ['Core Weight', `${design.core.coreWeight} kg`],
      ['', ''],
      ['HV Turns', `${design.hvWinding.turns}`],
      ['LV Turns', `${design.lvWinding.turns}`],
      ['Impedance', `${design.impedance.percentZ.toFixed(2)}%`],
      ['', ''],
      ['No-Load Loss', `${design.losses.noLoadLoss.toFixed(0)} W`],
      ['Load Loss', `${design.losses.loadLoss.toFixed(0)} W`],
      ['Efficiency at 100%', `${design.losses.efficiency.find(e => e.loadPercent === 100)?.efficiency.toFixed(2) || 'N/A'}%`],
    ];

    summaryData.forEach(([label, value]) => {
      if (label === '') {
        y += lineHeight / 2;
      } else {
        pdf.text(label, margin, y);
        pdf.text(value, margin + 60, y);
        y += lineHeight;
      }
    });

    // Cost Estimate page
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Cost Estimate', margin, 20);

    const costBreakdown = calculateCostEstimate(design, requirements, { oilType: 'mineral' });
    const lifecycleCost = calculateLifecycleCost(design, requirements, {
      electricityRate: 0.10,
      yearsOfOperation: 25,
      loadFactor: 0.5,
    });

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    y = 35;

    // Total cost highlight
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ESTIMATED TOTAL COST:', margin, y);
    pdf.text(formatCurrency(costBreakdown.totalCost), margin + 80, y);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    y += 10;

    pdf.text(`Cost per kVA: ${formatCurrency(costBreakdown.costPerKVA)}`, margin, y);
    y += lineHeight + 4;

    // Materials breakdown
    pdf.setFont('helvetica', 'bold');
    pdf.text('Materials', margin, y);
    pdf.setFont('helvetica', 'normal');
    y += lineHeight;

    const materialItems = [
      ['Core Steel', formatCurrency(costBreakdown.coreSteel)],
      ['Conductors', formatCurrency(costBreakdown.conductors)],
      ['Insulation', formatCurrency(costBreakdown.insulation)],
      ['Transformer Oil', formatCurrency(costBreakdown.oil)],
      ['Tank & Structure', formatCurrency(costBreakdown.tank)],
      ['Bushings', formatCurrency(costBreakdown.bushings)],
      ['Cooling Equipment', formatCurrency(costBreakdown.cooling)],
      ['Tap Changer', formatCurrency(costBreakdown.tapChanger)],
      ['Accessories', formatCurrency(costBreakdown.accessories)],
    ];

    materialItems.forEach(([label, value]) => {
      pdf.text(`  ${label}:`, margin, y);
      pdf.text(value, margin + 70, y);
      y += lineHeight;
    });

    pdf.setFont('helvetica', 'bold');
    pdf.text('  Total Materials:', margin, y);
    pdf.text(formatCurrency(costBreakdown.totalMaterials), margin + 70, y);
    pdf.setFont('helvetica', 'normal');
    y += lineHeight + 4;

    // Labor
    pdf.setFont('helvetica', 'bold');
    pdf.text('Labor', margin, y);
    pdf.setFont('helvetica', 'normal');
    y += lineHeight;

    const laborItems = [
      ['Assembly', formatCurrency(costBreakdown.assembly)],
      ['Testing', formatCurrency(costBreakdown.testing)],
      ['Engineering', formatCurrency(costBreakdown.engineering)],
    ];

    laborItems.forEach(([label, value]) => {
      pdf.text(`  ${label}:`, margin, y);
      pdf.text(value, margin + 70, y);
      y += lineHeight;
    });

    pdf.setFont('helvetica', 'bold');
    pdf.text('  Total Labor:', margin, y);
    pdf.text(formatCurrency(costBreakdown.totalLabor), margin + 70, y);
    pdf.setFont('helvetica', 'normal');
    y += lineHeight + 4;

    // Overhead
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overhead & Margin', margin, y);
    pdf.setFont('helvetica', 'normal');
    y += lineHeight;

    const overheadItems = [
      ['Facility Overhead', formatCurrency(costBreakdown.facilityOverhead)],
      ['Quality Control', formatCurrency(costBreakdown.qualityControl)],
      ['Shipping', formatCurrency(costBreakdown.shipping)],
      ['Warranty Reserve', formatCurrency(costBreakdown.warrantyReserve)],
      ['Profit Margin (12%)', formatCurrency(costBreakdown.profitMargin)],
    ];

    overheadItems.forEach(([label, value]) => {
      pdf.text(`  ${label}:`, margin, y);
      pdf.text(value, margin + 70, y);
      y += lineHeight;
    });

    y += 4;
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL:', margin, y);
    pdf.text(formatCurrency(costBreakdown.totalCost), margin + 70, y);
    y += lineHeight + 8;

    // Lifecycle cost
    pdf.setFont('helvetica', 'bold');
    pdf.text('Lifecycle Cost Analysis (25 years @ $0.10/kWh, 50% load)', margin, y);
    pdf.setFont('helvetica', 'normal');
    y += lineHeight;
    pdf.text(`  Initial Cost: ${formatCurrency(lifecycleCost.initialCost)}`, margin, y);
    y += lineHeight;
    pdf.text(`  Annual Loss Cost: ${formatCurrency(lifecycleCost.annualLossCost)}`, margin, y);
    y += lineHeight;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`  25-Year Total: ${formatCurrency(lifecycleCost.totalLifecycleCost)}`, margin, y);
    pdf.setFont('helvetica', 'normal');
    y += lineHeight + 8;

    // Disclaimer
    pdf.setFontSize(8);
    pdf.text('Note: These are budgetary estimates for planning purposes. Actual costs vary by supplier and market conditions.', margin, y);

    // Capture drawings
    const drawingsContainer = document.getElementById('drawings-container');
    if (drawingsContainer) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Technical Drawings', margin, 20);

      const canvas = await html2canvas(drawingsContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', margin, 30, imgWidth, Math.min(imgHeight, pageHeight - 50));
    }

    pdf.save(`transformer-design-${requirements.ratedPower}kva.pdf`);
  };

  const handleMarketplaceSubmit = async () => {
    if (!design) return;

    setMarketplaceSubmitting(true);

    const costBreakdown = calculateCostEstimate(design, requirements, { oilType: 'mineral' });

    const { error } = await supabase.from('marketplace_listings').insert({
      rated_power_kva: requirements.ratedPower,
      primary_voltage: requirements.primaryVoltage,
      secondary_voltage: requirements.secondaryVoltage,
      frequency: requirements.frequency,
      phases: requirements.phases,
      impedance_percent: design.impedance.percentZ,
      vector_group: requirements.vectorGroup.name,
      cooling_class: requirements.coolingClass.name,
      conductor_type: requirements.conductorType.name,
      steel_grade: requirements.steelGrade.name,
      estimated_cost: costBreakdown.totalCost,
      no_load_loss_w: design.losses.noLoadLoss,
      load_loss_w: design.losses.loadLoss,
      efficiency_percent: design.losses.efficiency.find(e => e.loadPercent === 100)?.efficiency || null,
      total_weight_kg: design.core.coreWeight + design.hvWinding.conductorWeight + design.lvWinding.conductorWeight,
      contact_name: marketplaceForm.contactName,
      contact_email: marketplaceForm.contactEmail,
      contact_phone: marketplaceForm.contactPhone || null,
      asking_price: null,
      notes: marketplaceForm.zipcode ? `Zipcode: ${marketplaceForm.zipcode}` : null,
      status: 'pending_review',
    });

    setMarketplaceSubmitting(false);

    if (error) {
      alert('Error submitting to marketplace: ' + error.message);
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
              <p className="text-sm text-muted-foreground">Transformer Design Tool</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Input Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Design Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <DesignRequirementsForm
              requirements={requirements}
              onChange={setRequirements}
              onCalculate={handleCalculate}
            />
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="calculations">Calculations</TabsTrigger>
                <TabsTrigger value="drawings">Drawings</TabsTrigger>
                <TabsTrigger value="bom">BOM</TabsTrigger>
                <TabsTrigger value="cost">Cost Estimate</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <DesignSummary design={design} requirements={requirements} />
              </TabsContent>

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
                      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
                        <TabsTrigger value="assembly-front" className="text-xs">Front View</TabsTrigger>
                        <TabsTrigger value="assembly-side" className="text-xs">Side View</TabsTrigger>
                        <TabsTrigger value="assembly-top" className="text-xs">Top View</TabsTrigger>
                        <TabsTrigger value="core-detail" className="text-xs">Core Detail</TabsTrigger>
                        <TabsTrigger value="winding-detail" className="text-xs">Winding Detail</TabsTrigger>
                        <TabsTrigger value="cross-section" className="text-xs">Cross Section</TabsTrigger>
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

                        <TabsContent value="core-detail" className="mt-0">
                          <CoreDetailDrawing
                            core={design.core}
                            phases={requirements.phases}
                          />
                        </TabsContent>

                        <TabsContent value="winding-detail" className="mt-0">
                          <WindingDetailDrawing
                            core={design.core}
                            hvWinding={design.hvWinding}
                            lvWinding={design.lvWinding}
                          />
                        </TabsContent>

                        <TabsContent value="cross-section" className="mt-0">
                          <div className="grid gap-6 md:grid-cols-2">
                            <div>
                              <h3 className="text-sm font-medium mb-2">Core Stepped Cross-Section</h3>
                              <CoreCrossSectionDrawing core={design.core} />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium mb-2">Winding Concentric Layout</h3>
                              <WindingLayoutDrawing
                                core={design.core}
                                hvWinding={design.hvWinding}
                                lvWinding={design.lvWinding}
                              />
                            </div>
                          </div>
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
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Fluxco transformer design tool. Always verify results with a qualified electrical engineer.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default TransformerDesigner;
