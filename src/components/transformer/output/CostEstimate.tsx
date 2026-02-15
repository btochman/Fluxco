"use client";
import { useMemo } from 'react';
import { DollarSign, TrendingUp, Zap, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TransformerDesign, DesignRequirements } from '@/engine/types/transformer.types';
import {
  calculateCostEstimate,
  calculateLifecycleCost,
  formatCurrency,
  type CostEstimationOptions,
} from '@/engine/core/costEstimation';

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

  // High-level material cost categories for bar chart
  const materialCategories = [
    { name: 'Core Steel', value: costBreakdown.coreSteel, color: 'bg-blue-500' },
    { name: 'Conductors', value: costBreakdown.conductors, color: 'bg-orange-500' },
    { name: 'Oil', value: costBreakdown.oil, color: 'bg-yellow-500' },
    { name: 'Tank & Structure', value: costBreakdown.tank, color: 'bg-gray-500' },
    { name: 'Bushings', value: costBreakdown.bushings, color: 'bg-purple-500' },
    { name: 'Cooling Equipment', value: costBreakdown.cooling, color: 'bg-cyan-500' },
    { name: 'Tap Changer', value: costBreakdown.tapChanger, color: 'bg-green-500' },
    { name: 'Insulation & Accessories', value: costBreakdown.insulation + costBreakdown.accessories, color: 'bg-pink-500' },
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
              <span className="text-sm text-muted-foreground">Labor & Overhead</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(costBreakdown.totalCost - costBreakdown.totalMaterials)}
            </p>
            <p className="text-xs text-muted-foreground">
              {((1 - costBreakdown.totalMaterials / costBreakdown.totalCost) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">25-Year Lifecycle</span>
            </div>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">
              {formatCurrency(lifecycleCost.totalLifecycleCost)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              incl. energy losses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Material Cost Breakdown - bar chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Major Component Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
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
              <p className="text-sm text-blue-700 dark:text-blue-300">25-Year Total Cost</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatCurrency(lifecycleCost.totalLifecycleCost)}</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Lifecycle cost includes initial purchase plus 25 years of energy losses at $0.10/kWh
              with 50% average load. Lower no-load losses (e.g., amorphous steel)
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
