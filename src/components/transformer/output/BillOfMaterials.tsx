"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TransformerDesign } from '@/engine/types/transformer.types';

interface BillOfMaterialsProps {
  design: TransformerDesign;
}

export function BillOfMaterials({ design }: BillOfMaterialsProps) {
  const { bom } = design;

  // Group items by category
  const categories = ['core', 'winding', 'insulation', 'tank', 'oil', 'accessories'] as const;
  const categoryLabels: Record<string, string> = {
    core: 'Core Materials',
    winding: 'Winding Materials',
    insulation: 'Insulation Materials',
    tank: 'Tank & Structure',
    oil: 'Oil & Fluids',
    accessories: 'Accessories',
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Material Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{bom.totalSteelWeight.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Steel (kg)</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{bom.totalCopperWeight.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Copper (kg)</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{bom.totalOilVolume.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Oil (L)</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{bom.totalWeight.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Total (kg)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed BOM by category */}
      {categories.map((category) => {
        const items = bom.items.filter((item) => item.category === category);
        if (items.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{categoryLabels[category]}</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-left py-2 pl-2">Unit</th>
                    <th className="text-right py-2">Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-muted">
                      <td className="py-2">
                        {item.description}
                        {item.specification && (
                          <span className="text-muted-foreground text-xs block">
                            {item.specification}
                          </span>
                        )}
                      </td>
                      <td className="text-right py-2 font-mono">
                        {typeof item.quantity === 'number'
                          ? item.quantity.toLocaleString(undefined, { maximumFractionDigits: 1 })
                          : item.quantity}
                      </td>
                      <td className="py-2 pl-2 text-muted-foreground">{item.unit}</td>
                      <td className="text-right py-2 font-mono">
                        {item.weight ? item.weight.toFixed(1) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default BillOfMaterials;
