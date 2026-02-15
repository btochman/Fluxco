"use client";
import { useMemo } from 'react';
import { DollarSign, TrendingUp, Zap, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TransformerDesign, DesignRequirements } from '@/engine/types/transformer.types';
import {
  calculateCostEstimate,
  calculateLifecycleCost,
  formatCurrency,
  type CostEstimationOptions,
} from '@/engine/core/costEstimation';
import { OIL_PRICES, CONDUCTOR_PRICES, getTapChangerCost, MANUFACTURING_REGIONS } from '@/engine/constants/pricing';
import { Clock, AlertTriangle } from 'lucide-react';

const TAC_COST = 8000;

const OIL_LABELS: Record<string, string> = {
  mineral: 'Mineral Oil',
  naturalEster: 'Natural Ester',
  syntheticEster: 'Synthetic Ester',
  silicon: 'Silicone Fluid',
};

interface CostEstimateProps {
  design: TransformerDesign;
  requirements: DesignRequirements;
}

export function CostEstimate({ design, requirements }: CostEstimateProps) {
  const options: CostEstimationOptions = {
    oilType: requirements.oilType || 'mineral',
    includeOLTC: requirements.tapChangerType === 'onLoad',
    tapChangerType: requirements.tapChangerType || 'noLoad',
  };

  const costBreakdown = useMemo(() => {
    return calculateCostEstimate(design, requirements, options);
  }, [design, requirements]);

  const lifecycleCost = useMemo(() => {
    return calculateLifecycleCost(design, requirements, {
      ...options,
      electricityRate: 0.10,
      yearsOfOperation: 25,
      loadFactor: 0.5,
    });
  }, [design, requirements]);

  // --- Manufacturing region ---
  const regionKey = requirements.manufacturingRegion || 'usa';
  const region = MANUFACTURING_REGIONS[regionKey] || MANUFACTURING_REGIONS.usa;

  // --- CAPEX (adjusted for manufacturing region) ---
  const tacCost = requirements.includeTAC ? TAC_COST : 0;
  const baseCost = costBreakdown.totalCost + tacCost;
  const totalCapex = Math.round(baseCost * region.multiplier);
  const capexPerKVA = Math.round(totalCapex / requirements.ratedPower);

  // --- Design choice impact calculations ---
  const kVA = requirements.ratedPower;

  // Tap changer comparison
  const currentTapType = requirements.tapChangerType || 'noLoad';
  const altTapType = currentTapType === 'onLoad' ? 'noLoad' : 'onLoad';
  const altTapCost = getTapChangerCost(kVA, altTapType);
  const tapDelta = altTapCost - costBreakdown.tapChanger;

  // Oil type comparison
  const currentOilType = requirements.oilType || 'mineral';
  const oilVolume = design.thermal.oilVolume;
  const oilPriceMap: Record<string, number> = {
    mineral: OIL_PRICES.mineralOil,
    naturalEster: OIL_PRICES.naturalEster,
    syntheticEster: OIL_PRICES.syntheticEster,
    silicon: OIL_PRICES.siliconOil,
  };
  const oilAlternatives = Object.entries(oilPriceMap)
    .filter(([key]) => key !== currentOilType)
    .map(([key, price]) => ({
      type: key,
      label: OIL_LABELS[key],
      delta: Math.round(oilVolume * (price - oilPriceMap[currentOilType])),
    }))
    .sort((a, b) => a.delta - b.delta);

  // Conductor comparison (approximate — same weight, different $/kg)
  const currentConductorType = design.hvWinding.conductorType;
  const altConductorType = currentConductorType === 'copper' ? 'aluminum' : 'copper';
  const currentConductorPrice = CONDUCTOR_PRICES[currentConductorType]?.strip || CONDUCTOR_PRICES.copper.strip;
  const altConductorPrice = CONDUCTOR_PRICES[altConductorType]?.strip || CONDUCTOR_PRICES.copper.strip;
  const totalConductorWeight = design.hvWinding.conductorWeight + design.lvWinding.conductorWeight;
  const conductorDelta = Math.round((altConductorPrice - currentConductorPrice) * totalConductorWeight);

  // TAC comparison
  const tacDelta = requirements.includeTAC ? -TAC_COST : TAC_COST;

  // Material bar chart data (adjusted for manufacturing region)
  const m = region.multiplier;
  const materialCategories = [
    { name: 'Core Steel', value: Math.round(costBreakdown.coreSteel * m), color: 'bg-blue-500' },
    { name: 'Conductors', value: Math.round(costBreakdown.conductors * m), color: 'bg-orange-500' },
    { name: 'Oil', value: Math.round(costBreakdown.oil * m), color: 'bg-yellow-500' },
    { name: 'Tank & Structure', value: Math.round(costBreakdown.tank * m), color: 'bg-gray-500' },
    { name: 'Bushings', value: Math.round(costBreakdown.bushings * m), color: 'bg-purple-500' },
    { name: 'Cooling', value: Math.round(costBreakdown.cooling * m), color: 'bg-cyan-500' },
    { name: 'Tap Changer', value: Math.round(costBreakdown.tapChanger * m), color: 'bg-green-500' },
    { name: 'Other', value: Math.round((costBreakdown.insulation + costBreakdown.accessories + tacCost) * m), color: 'bg-pink-500' },
  ];
  const maxMaterialValue = Math.max(...materialCategories.map(c => c.value));

  // --- OPEX ---
  const noLoadLossW = design.losses.noLoadLoss;
  const loadLossW = design.losses.loadLoss;
  const noLoadLossKW = noLoadLossW / 1000;
  const loadLossKW = loadLossW / 1000;
  const electricityRate = 0.10;
  const loadFactor = 0.5;
  const hoursPerYear = 8760;

  const annualNoLoadCost = noLoadLossKW * hoursPerYear * electricityRate;
  const lossFactor = 0.3 * loadFactor + 0.7 * Math.pow(loadFactor, 2);
  const annualLoadCost = loadLossKW * hoursPerYear * lossFactor * electricityRate;
  const annualTotalLossCost = annualNoLoadCost + annualLoadCost;

  // Efficiency at standard load points
  const efficiencyPoints = design.losses.efficiency.filter(e =>
    [25, 50, 75, 100].includes(e.loadPercent)
  );

  return (
    <div className="space-y-6">
      {/* Top Summary: CAPEX + Lead Time + 25-Year Total */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Est. CAPEX</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                {region.label}
              </span>
            </div>
            <p className="text-3xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(totalCapex)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              ~${capexPerKVA}/kVA
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Est. Lead Time</span>
            </div>
            <p className="text-3xl font-bold text-orange-800 dark:text-orange-200">
              {region.leadTimeWeeks[0]}&ndash;{region.leadTimeWeeks[1]} wks
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
              {region.label} manufacturing
            </p>
            {!region.feocCompliant && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Not FEOC compliant</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Est. 25-Year TCO</span>
            </div>
            <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">
              {formatCurrency(totalCapex + lifecycleCost.annualLossCost * 25)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              CAPEX + {formatCurrency(lifecycleCost.annualLossCost)}/yr losses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two-Column: CAPEX (left) | OPEX (right) */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* LEFT: CAPEX */}
        <div className="lg:col-span-3 space-y-4">
          {/* Component Cost Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                CAPEX — Component Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {materialCategories.map((cat) => {
                  const percentage = (cat.value / maxMaterialValue) * 100;
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm mb-0.5">
                        <span>{cat.name}</span>
                        <span className="font-medium">{formatCurrency(cat.value)}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${cat.color} rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 mt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Labor (assembly, testing, engineering)</span>
                    <span className="font-medium">{formatCurrency(Math.round(costBreakdown.totalLabor * m))}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Overhead, QC, shipping & warranty</span>
                    <span className="font-medium">
                      {formatCurrency(Math.round(
                        (costBreakdown.facilityOverhead +
                        costBreakdown.qualityControl +
                        costBreakdown.shipping +
                        costBreakdown.warrantyReserve +
                        costBreakdown.profitMargin) * m
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Choice Impact on CAPEX */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Design Choice Impact on CAPEX
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                See how your selections affect the upfront capital cost
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Tap Changer */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Tap Changer</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {currentTapType === 'onLoad' ? 'On-Load (OLTC)' : 'No-Load (NLTC)'}
                      {' '}&mdash; {formatCurrency(costBreakdown.tapChanger)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {altTapType === 'onLoad' ? 'OLTC' : 'NLTC'} would be
                    </p>
                    <p className={`text-sm font-semibold ${tapDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {tapDelta > 0 ? '+' : ''}{formatCurrency(tapDelta)}
                    </p>
                  </div>
                </div>

                {/* Oil Type */}
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">Insulating Oil</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {OIL_LABELS[currentOilType]} &mdash; {formatCurrency(costBreakdown.oil)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {oilAlternatives.map((alt) => (
                      <div key={alt.type} className="text-center p-1.5 bg-background rounded text-xs">
                        <p className="text-muted-foreground truncate">{alt.label}</p>
                        <p className={`font-semibold ${alt.delta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {alt.delta > 0 ? '+' : ''}{formatCurrency(alt.delta)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conductor */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Winding Conductor</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {currentConductorType === 'copper' ? 'Copper' : 'Aluminum'}
                      {' '}&mdash; {formatCurrency(costBreakdown.conductors)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {altConductorType === 'copper' ? 'Copper' : 'Aluminum'} approx.
                    </p>
                    <p className={`text-sm font-semibold ${conductorDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {conductorDelta > 0 ? '+' : ''}{formatCurrency(conductorDelta)}
                    </p>
                  </div>
                </div>

                {/* TAC */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Automation Controller (TAC)</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {requirements.includeTAC ? 'SEL-2414' : 'None'}
                      {' '}&mdash; {formatCurrency(tacCost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {requirements.includeTAC ? 'Remove' : 'Add SEL-2414'}
                    </p>
                    <p className={`text-sm font-semibold ${tacDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {tacDelta > 0 ? '+' : ''}{formatCurrency(tacDelta)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: OPEX */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                OPEX — Efficiency & Operating Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Efficiency at load points */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Efficiency by Load</p>
                <div className="grid grid-cols-4 gap-2">
                  {efficiencyPoints.map((point) => (
                    <div
                      key={point.loadPercent}
                      className={`text-center p-2 rounded-lg ${
                        point.loadPercent === design.losses.maxEfficiencyLoad
                          ? 'bg-green-100 dark:bg-green-900/30 ring-1 ring-green-300 dark:ring-green-700'
                          : 'bg-secondary/30'
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">{point.loadPercent}%</p>
                      <p className="text-lg font-bold">{point.efficiency.toFixed(2)}%</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Peak: {design.losses.maxEfficiency.toFixed(2)}% at {design.losses.maxEfficiencyLoad}% load
                </p>
              </div>

              {/* Loss Breakdown */}
              <div className="border-t pt-4 mb-4">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Loss Breakdown</p>
                <div className="space-y-3">
                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">No-Load Losses</p>
                        <p className="text-xs text-muted-foreground">Core/iron &mdash; runs 24/7</p>
                      </div>
                      <p className="text-sm font-bold">{noLoadLossW.toLocaleString()} W</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Driven by <span className="text-foreground font-medium">core steel type</span> &mdash; amorphous steel lowers this significantly
                    </p>
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Load Losses</p>
                        <p className="text-xs text-muted-foreground">Winding &mdash; varies with load</p>
                      </div>
                      <p className="text-sm font-bold">{loadLossW.toLocaleString()} W</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Driven by <span className="text-foreground font-medium">conductor type</span> &mdash; copper has lower resistance than aluminum
                    </p>
                  </div>
                </div>
              </div>

              {/* Annual Energy Cost */}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Annual Energy Loss Cost</p>

                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                    {formatCurrency(Math.round(annualTotalLossCost))}/yr
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    at $0.10/kWh, 50% average load
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="text-center p-2 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground">No-load cost</p>
                    <p className="text-sm font-semibold">{formatCurrency(Math.round(annualNoLoadCost))}/yr</p>
                  </div>
                  <div className="text-center p-2 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground">Load-related cost</p>
                    <p className="text-sm font-semibold">{formatCurrency(Math.round(annualLoadCost))}/yr</p>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">25-year energy losses:</span>{' '}
                    {formatCurrency(Math.round(annualTotalLossCost * 25))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Steel type and conductor choice are the primary drivers of operating cost (OPEX).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
        All pricing and lead times are estimates based on {region.label} manufacturing and current market conditions.
        Actual costs vary by supplier, quantity, and specifications. Contact manufacturers for firm quotations.
      </div>
    </div>
  );
}

export default CostEstimate;
