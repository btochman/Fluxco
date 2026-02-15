"use client";
import { useMemo } from 'react';
import { DollarSign, TrendingUp, Zap, ArrowUpDown, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TransformerDesign, DesignRequirements } from '@/engine/types/transformer.types';
import {
  calculateCostEstimate,
  calculateLifecycleCost,
  formatCurrency,
  type CostEstimationOptions,
} from '@/engine/core/costEstimation';
import { OIL_PRICES, CONDUCTOR_PRICES, getTapChangerCost, MANUFACTURING_REGIONS } from '@/engine/constants/pricing';

const TAC_COST = 8000;

const OIL_LABELS: Record<string, string> = {
  mineral: 'Mineral Oil',
  naturalEster: 'Natural Ester',
  syntheticEster: 'Synthetic Ester',
  silicon: 'Silicone Fluid',
};

/** Format a low–high range, or single value if they match */
function formatRange(lo: number, hi: number): string {
  if (lo === hi) return formatCurrency(lo);
  return `${formatCurrency(lo)} – ${formatCurrency(hi)}`;
}

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

  // --- Resolve selected regions (filter China if FEOC required) ---
  let selectedRegions = requirements.manufacturingRegions || ['usa'];
  if (requirements.requireFEOC) {
    selectedRegions = selectedRegions.filter(r => MANUFACTURING_REGIONS[r]?.feocCompliant !== false);
    if (selectedRegions.length === 0) selectedRegions = ['usa'];
  }

  const regionData = selectedRegions.map(r => MANUFACTURING_REGIONS[r] || MANUFACTURING_REGIONS.usa);
  const mLo = Math.min(...regionData.map(r => r.multiplier));
  const mHi = Math.max(...regionData.map(r => r.multiplier));
  const leadLo = Math.min(...regionData.map(r => r.leadTimeWeeks[0]));
  const leadHi = Math.max(...regionData.map(r => r.leadTimeWeeks[1]));
  const regionLabels = regionData.map(r => r.label).join(', ');
  const hasNonFEOC = (requirements.manufacturingRegions || ['usa']).some(
    r => MANUFACTURING_REGIONS[r]?.feocCompliant === false
  );

  // --- CAPEX range ---
  const tacCost = requirements.includeTAC ? TAC_COST : 0;
  const baseCost = costBreakdown.totalCost + tacCost;
  const capexLo = Math.round(baseCost * mLo);
  const capexHi = Math.round(baseCost * mHi);
  const kvaLo = Math.round(capexLo / requirements.ratedPower);
  const kvaHi = Math.round(capexHi / requirements.ratedPower);

  // --- Design choice impact ---
  const kVA = requirements.ratedPower;
  const currentTapType = requirements.tapChangerType || 'noLoad';
  const altTapType = currentTapType === 'onLoad' ? 'noLoad' : 'onLoad';
  const altTapCost = getTapChangerCost(kVA, altTapType);
  const tapDelta = altTapCost - costBreakdown.tapChanger;

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

  const currentConductorType = design.hvWinding.conductorType;
  const altConductorType = currentConductorType === 'copper' ? 'aluminum' : 'copper';
  const currentConductorPrice = CONDUCTOR_PRICES[currentConductorType]?.strip || CONDUCTOR_PRICES.copper.strip;
  const altConductorPrice = CONDUCTOR_PRICES[altConductorType]?.strip || CONDUCTOR_PRICES.copper.strip;
  const totalConductorWeight = design.hvWinding.conductorWeight + design.lvWinding.conductorWeight;
  const conductorDelta = Math.round((altConductorPrice - currentConductorPrice) * totalConductorWeight);

  const tacDelta = requirements.includeTAC ? -TAC_COST : TAC_COST;

  // Material bar chart — use midpoint multiplier
  const mMid = (mLo + mHi) / 2;
  const materialCategories = [
    { name: 'Core Steel', base: costBreakdown.coreSteel, color: 'bg-blue-500' },
    { name: 'Conductors', base: costBreakdown.conductors, color: 'bg-orange-500' },
    { name: 'Oil', base: costBreakdown.oil, color: 'bg-yellow-500' },
    { name: 'Tank & Structure', base: costBreakdown.tank, color: 'bg-gray-500' },
    { name: 'Bushings', base: costBreakdown.bushings, color: 'bg-purple-500' },
    { name: 'Cooling', base: costBreakdown.cooling, color: 'bg-cyan-500' },
    { name: 'Tap Changer', base: costBreakdown.tapChanger, color: 'bg-green-500' },
    { name: 'Other', base: costBreakdown.insulation + costBreakdown.accessories + tacCost, color: 'bg-pink-500' },
  ];
  const maxBase = Math.max(...materialCategories.map(c => c.base));

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

  const efficiencyPoints = design.losses.efficiency.filter(e =>
    [25, 50, 75, 100].includes(e.loadPercent)
  );

  // 25-year TCO range
  const tcoLo = capexLo + Math.round(annualTotalLossCost * 25);
  const tcoHi = capexHi + Math.round(annualTotalLossCost * 25);

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Est. CAPEX Range</span>
            </div>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatRange(capexLo, capexHi)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              ~${kvaLo}{kvaLo !== kvaHi ? `–$${kvaHi}` : ''}/kVA
            </p>
            {requirements.requireFEOC && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-green-600">
                <ShieldCheck className="h-3 w-3" />
                <span>FEOC compliant</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Est. Lead Time</span>
            </div>
            <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
              {leadLo}&ndash;{leadHi} weeks
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
              {regionLabels}
            </p>
            {requirements.requireFEOC && hasNonFEOC && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                <span>China excluded (FEOC required)</span>
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
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {formatRange(tcoLo, tcoHi)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              CAPEX + ~{formatCurrency(Math.round(annualTotalLossCost))}/yr losses
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
                Est. CAPEX — Component Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {materialCategories.map((cat) => {
                  const lo = Math.round(cat.base * mLo);
                  const hi = Math.round(cat.base * mHi);
                  const percentage = (cat.base / maxBase) * 100;
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm mb-0.5">
                        <span>{cat.name}</span>
                        <span className="font-medium">{formatRange(lo, hi)}</span>
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
                    <span className="font-medium">
                      {formatRange(
                        Math.round(costBreakdown.totalLabor * mLo),
                        Math.round(costBreakdown.totalLabor * mHi)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Overhead, QC, shipping & warranty</span>
                    <span className="font-medium">
                      {formatRange(
                        Math.round((costBreakdown.facilityOverhead + costBreakdown.qualityControl + costBreakdown.shipping + costBreakdown.warrantyReserve + costBreakdown.profitMargin) * mLo),
                        Math.round((costBreakdown.facilityOverhead + costBreakdown.qualityControl + costBreakdown.shipping + costBreakdown.warrantyReserve + costBreakdown.profitMargin) * mHi)
                      )}
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
                Approximate impact of changing your selections
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
                      {' '}&mdash; ~{formatCurrency(costBreakdown.tapChanger)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {altTapType === 'onLoad' ? 'OLTC' : 'NLTC'} would be
                    </p>
                    <p className={`text-sm font-semibold ${tapDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ~{tapDelta > 0 ? '+' : ''}{formatCurrency(tapDelta)}
                    </p>
                  </div>
                </div>

                {/* Oil Type */}
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">Insulating Oil</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {OIL_LABELS[currentOilType]} &mdash; ~{formatCurrency(costBreakdown.oil)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {oilAlternatives.map((alt) => (
                      <div key={alt.type} className="text-center p-1.5 bg-background rounded text-xs">
                        <p className="text-muted-foreground truncate">{alt.label}</p>
                        <p className={`font-semibold ${alt.delta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ~{alt.delta > 0 ? '+' : ''}{formatCurrency(alt.delta)}
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
                      {' '}&mdash; ~{formatCurrency(costBreakdown.conductors)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {altConductorType === 'copper' ? 'Copper' : 'Aluminum'} approx.
                    </p>
                    <p className={`text-sm font-semibold ${conductorDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ~{conductorDelta > 0 ? '+' : ''}{formatCurrency(conductorDelta)}
                    </p>
                  </div>
                </div>

                {/* TAC */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Automation Controller (TAC)</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {requirements.includeTAC ? 'SEL-2414' : 'None'}
                      {' '}&mdash; ~{formatCurrency(tacCost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {requirements.includeTAC ? 'Remove' : 'Add SEL-2414'}
                    </p>
                    <p className={`text-sm font-semibold ${tacDelta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ~{tacDelta > 0 ? '+' : ''}{formatCurrency(tacDelta)}
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
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Est. Annual Energy Loss Cost</p>

                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                    ~{formatCurrency(Math.round(annualTotalLossCost))}/yr
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    at $0.10/kWh, 50% average load
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="text-center p-2 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground">No-load cost</p>
                    <p className="text-sm font-semibold">~{formatCurrency(Math.round(annualNoLoadCost))}/yr</p>
                  </div>
                  <div className="text-center p-2 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground">Load-related cost</p>
                    <p className="text-sm font-semibold">~{formatCurrency(Math.round(annualLoadCost))}/yr</p>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Est. 25-year energy losses:</span>{' '}
                    ~{formatCurrency(Math.round(annualTotalLossCost * 25))}
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

      {/* FluxCo Leasing */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                FluxCo Transformer Leasing
              </h3>
              <p className="text-sm text-indigo-800 dark:text-indigo-300 mt-1">
                Don&apos;t want to buy? FluxCo offers transformer leasing programs that spread the capital
                cost over time, improving cash flow and project economics.
              </p>
              {hasNonFEOC && (
                <p className="text-sm text-indigo-800 dark:text-indigo-300 mt-2">
                  <strong>Tax credit flexibility:</strong> Leasing through FluxCo can help navigate
                  IRA 45X tax credit constraints for non-FEOC equipment. Because FluxCo owns the asset,
                  leasing structures may allow projects to benefit from lower-cost global manufacturing
                  while the 45X tax credit eligibility flows through the lessor.
                </p>
              )}
              {requirements.requireFEOC && !hasNonFEOC && (
                <p className="text-sm text-indigo-800 dark:text-indigo-300 mt-2">
                  <strong>45X eligible:</strong> Your current configuration is FEOC compliant and may
                  qualify for IRA Section 45X Advanced Manufacturing Production Credits.
                </p>
              )}
              <a
                href="/get-quote"
                className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Contact FluxCo for leasing options &rarr;
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
        All pricing and lead times are rough estimates based on {regionLabels} manufacturing
        and current market conditions. Actual costs vary significantly by supplier, quantity,
        and specifications. Contact manufacturers for firm quotations.
      </div>
    </div>
  );
}

export default CostEstimate;
