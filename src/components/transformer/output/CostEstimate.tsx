"use client";
import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Zap, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TransformerDesign, DesignRequirements } from '@/engine/types/transformer.types';
import {
  calculateCostEstimate,
  calculateLifecycleCost,
  formatCurrency,
  type CostBreakdown,
  type CostEstimationOptions,
} from '@/engine/core/costEstimation';

interface CostEstimateProps {
  design: TransformerDesign;
  requirements: DesignRequirements;
}

export function CostEstimate({ design, requirements }: CostEstimateProps) {
  const [oilType, setOilType] = useState<'mineral' | 'naturalEster' | 'syntheticEster' | 'silicon'>('mineral');
  const [includeOLTC, setIncludeOLTC] = useState(false);
  const [electricityRate, setElectricityRate] = useState('0.10');
  const [operatingYears, setOperatingYears] = useState('25');
  const [loadFactor, setLoadFactor] = useState('0.5');

  const options: CostEstimationOptions = {
    oilType,
    includeOLTC,
    tapChangerType: includeOLTC ? 'onLoad' : 'noLoad',
  };

  const costBreakdown = useMemo(() => {
    return calculateCostEstimate(design, requirements, options);
  }, [design, requirements, oilType, includeOLTC]);

  const lifecycleCost = useMemo(() => {
    return calculateLifecycleCost(design, requirements, {
      ...options,
      electricityRate: parseFloat(electricityRate),
      yearsOfOperation: parseInt(operatingYears),
      loadFactor: parseFloat(loadFactor),
    });
  }, [design, requirements, options, electricityRate, operatingYears, loadFactor]);

  // Calculate material cost percentages for chart
  const materialCategories = [
    { name: 'Core Steel', value: costBreakdown.coreSteel, color: 'bg-blue-500' },
    { name: 'Conductors', value: costBreakdown.conductors, color: 'bg-orange-500' },
    { name: 'Oil', value: costBreakdown.oil, color: 'bg-yellow-500' },
    { name: 'Tank', value: costBreakdown.tank, color: 'bg-gray-500' },
    { name: 'Bushings', value: costBreakdown.bushings, color: 'bg-purple-500' },
    { name: 'Cooling', value: costBreakdown.cooling, color: 'bg-cyan-500' },
    { name: 'Tap Changer', value: costBreakdown.tapChanger, color: 'bg-green-500' },
    { name: 'Insulation', value: costBreakdown.insulation, color: 'bg-pink-500' },
    { name: 'Accessories', value: costBreakdown.accessories, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">Estimated Cost</span>
            </div>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200 mt-1">
              {formatCurrency(costBreakdown.totalCost)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {formatCurrency(costBreakdown.costPerKVA)}/kVA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Materials</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(costBreakdown.totalMaterials)}
            </p>
            <p className="text-xs text-muted-foreground">
              {((costBreakdown.totalMaterials / costBreakdown.totalCost) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Labor</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(costBreakdown.totalLabor)}
            </p>
            <p className="text-xs text-muted-foreground">
              {((costBreakdown.totalLabor / costBreakdown.totalCost) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">Lifecycle Cost</span>
            </div>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">
              {formatCurrency(lifecycleCost.totalLifecycleCost)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {operatingYears} year operation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cost Estimation Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Oil Type</Label>
              <Select value={oilType} onValueChange={(v) => setOilType(v as typeof oilType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mineral">Mineral Oil ($2.20/L)</SelectItem>
                  <SelectItem value="naturalEster">Natural Ester ($4.50/L)</SelectItem>
                  <SelectItem value="syntheticEster">Synthetic Ester ($6.80/L)</SelectItem>
                  <SelectItem value="silicon">Silicon Oil ($12.00/L)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tap Changer</Label>
              <Select value={includeOLTC ? 'oltc' : 'nltc'} onValueChange={(v) => setIncludeOLTC(v === 'oltc')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nltc">No-Load Tap Changer</SelectItem>
                  <SelectItem value="oltc">On-Load Tap Changer (OLTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Electricity Rate ($/kWh)</Label>
              <Select value={electricityRate} onValueChange={setElectricityRate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.05">$0.05 (Low)</SelectItem>
                  <SelectItem value="0.08">$0.08</SelectItem>
                  <SelectItem value="0.10">$0.10 (Average)</SelectItem>
                  <SelectItem value="0.12">$0.12</SelectItem>
                  <SelectItem value="0.15">$0.15 (High)</SelectItem>
                  <SelectItem value="0.20">$0.20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Average Load Factor</Label>
              <Select value={loadFactor} onValueChange={setLoadFactor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.3">30% (Light)</SelectItem>
                  <SelectItem value="0.5">50% (Medium)</SelectItem>
                  <SelectItem value="0.7">70% (Heavy)</SelectItem>
                  <SelectItem value="0.85">85% (Continuous)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Material Cost Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Material Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simple bar chart */}
            <div className="space-y-3">
              {materialCategories.map((cat) => {
                const percentage = (cat.value / costBreakdown.totalMaterials) * 100;
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
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
            </div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Complete Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              {/* Materials */}
              <div>
                <h4 className="font-medium text-muted-foreground mb-2">Materials</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span>Core Steel:</span><span className="text-right">{formatCurrency(costBreakdown.coreSteel)}</span>
                  <span>Conductors:</span><span className="text-right">{formatCurrency(costBreakdown.conductors)}</span>
                  <span>Insulation:</span><span className="text-right">{formatCurrency(costBreakdown.insulation)}</span>
                  <span>Oil ({design.thermal.oilVolume}L):</span><span className="text-right">{formatCurrency(costBreakdown.oil)}</span>
                  <span>Tank & Structure:</span><span className="text-right">{formatCurrency(costBreakdown.tank)}</span>
                  <span>Bushings:</span><span className="text-right">{formatCurrency(costBreakdown.bushings)}</span>
                  <span>Cooling Equipment:</span><span className="text-right">{formatCurrency(costBreakdown.cooling)}</span>
                  <span>Tap Changer:</span><span className="text-right">{formatCurrency(costBreakdown.tapChanger)}</span>
                  <span>Accessories:</span><span className="text-right">{formatCurrency(costBreakdown.accessories)}</span>
                </div>
                <div className="flex justify-between font-medium border-t mt-2 pt-2">
                  <span>Total Materials:</span>
                  <span>{formatCurrency(costBreakdown.totalMaterials)}</span>
                </div>
              </div>

              {/* Labor */}
              <div>
                <h4 className="font-medium text-muted-foreground mb-2">Labor</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span>Assembly:</span><span className="text-right">{formatCurrency(costBreakdown.assembly)}</span>
                  <span>Testing:</span><span className="text-right">{formatCurrency(costBreakdown.testing)}</span>
                  <span>Engineering:</span><span className="text-right">{formatCurrency(costBreakdown.engineering)}</span>
                </div>
                <div className="flex justify-between font-medium border-t mt-2 pt-2">
                  <span>Total Labor:</span>
                  <span>{formatCurrency(costBreakdown.totalLabor)}</span>
                </div>
              </div>

              {/* Overhead */}
              <div>
                <h4 className="font-medium text-muted-foreground mb-2">Overhead & Margin</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span>Facility Overhead:</span><span className="text-right">{formatCurrency(costBreakdown.facilityOverhead)}</span>
                  <span>Quality Control:</span><span className="text-right">{formatCurrency(costBreakdown.qualityControl)}</span>
                  <span>Shipping:</span><span className="text-right">{formatCurrency(costBreakdown.shipping)}</span>
                  <span>Warranty Reserve:</span><span className="text-right">{formatCurrency(costBreakdown.warrantyReserve)}</span>
                  <span>Profit Margin (12%):</span><span className="text-right">{formatCurrency(costBreakdown.profitMargin)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL ESTIMATED COST:</span>
                  <span className="text-green-600 dark:text-green-400">{formatCurrency(costBreakdown.totalCost)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lifecycle Cost Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Lifecycle Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Initial Cost</p>
              <p className="text-2xl font-bold">{formatCurrency(lifecycleCost.initialCost)}</p>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Annual Loss Cost</p>
              <p className="text-2xl font-bold">{formatCurrency(lifecycleCost.annualLossCost)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                No-load: {design.losses.noLoadLoss}W + Load: {design.losses.loadLoss}W
              </p>
            </div>
            <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">{operatingYears}-Year Total Cost</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatCurrency(lifecycleCost.totalLifecycleCost)}</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Lifecycle cost includes initial purchase plus {operatingYears} years of energy losses at ${electricityRate}/kWh
              with {(parseFloat(loadFactor) * 100).toFixed(0)}% average load. Lower no-load losses (e.g., amorphous steel)
              significantly reduce lifecycle cost for lightly-loaded or variable-load applications.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
        These are budgetary estimates for planning purposes only. Actual costs will vary based on
        supplier pricing, quantity, specifications, and market conditions. Contact manufacturers for firm quotations.
      </div>
    </div>
  );
}

export default CostEstimate;
