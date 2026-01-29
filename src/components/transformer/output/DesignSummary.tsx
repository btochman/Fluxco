"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TransformerDesign, DesignRequirements } from '@/engine/types/transformer.types';

interface DesignSummaryProps {
  design: TransformerDesign;
  requirements: DesignRequirements;
}

export function DesignSummary({ design, requirements }: DesignSummaryProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Electrical Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Electrical Data</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Rated Power</dt>
              <dd className="font-medium">{requirements.ratedPower} kVA</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Primary Voltage</dt>
              <dd className="font-medium">{requirements.primaryVoltage} V</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Secondary Voltage</dt>
              <dd className="font-medium">{requirements.secondaryVoltage} V</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Frequency</dt>
              <dd className="font-medium">{requirements.frequency} Hz</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Vector Group</dt>
              <dd className="font-medium">{requirements.vectorGroup.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Impedance</dt>
              <dd className="font-medium">{design.impedance.percentZ.toFixed(2)}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">X/R Ratio</dt>
              <dd className="font-medium">{design.impedance.xrRatio.toFixed(1)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Core Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Core Data</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Steel Grade</dt>
              <dd className="font-medium">{design.core.steelGrade.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Flux Density</dt>
              <dd className="font-medium">{design.core.fluxDensity} T</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Core Diameter</dt>
              <dd className="font-medium">{design.core.coreDiameter} mm</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Net Cross-Section</dt>
              <dd className="font-medium">{design.core.netCrossSection.toFixed(1)} cm²</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Volts per Turn</dt>
              <dd className="font-medium">{design.core.voltsPerTurn.toFixed(2)} V</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Core Weight</dt>
              <dd className="font-medium">{design.core.coreWeight} kg</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Winding Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Winding Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-primary mb-2">HV Winding</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Turns</dt>
                  <dd>{design.hvWinding.turns}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Current</dt>
                  <dd>{design.hvWinding.ratedCurrent.toFixed(1)} A</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Layers</dt>
                  <dd>{design.hvWinding.layers}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Weight</dt>
                  <dd>{design.hvWinding.conductorWeight.toFixed(1)} kg</dd>
                </div>
              </dl>
            </div>
            <div>
              <h4 className="font-medium text-green-600 mb-2">LV Winding</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Turns</dt>
                  <dd>{design.lvWinding.turns}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Current</dt>
                  <dd>{design.lvWinding.ratedCurrent.toFixed(1)} A</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Layers</dt>
                  <dd>{design.lvWinding.layers}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Weight</dt>
                  <dd>{design.lvWinding.conductorWeight.toFixed(1)} kg</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loss & Efficiency Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loss & Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">No-Load Loss</dt>
              <dd className="font-medium">{design.losses.noLoadLoss.toFixed(0)} W</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Load Loss (at 100%)</dt>
              <dd className="font-medium">{design.losses.loadLoss.toFixed(0)} W</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total Loss</dt>
              <dd className="font-medium">{design.losses.totalLoss.toFixed(0)} W</dd>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <dt className="text-muted-foreground">Efficiency at 100%</dt>
              <dd className="font-medium text-green-600">
                {design.losses.efficiency.find(e => e.loadPercent === 100)?.efficiency.toFixed(2)}%
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Max Efficiency</dt>
              <dd className="font-medium text-green-600">
                {design.losses.maxEfficiency.toFixed(2)}% at {design.losses.maxEfficiencyLoad}% load
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Thermal Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thermal Data</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Cooling Class</dt>
              <dd className="font-medium">{requirements.coolingClass.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Oil Volume</dt>
              <dd className="font-medium">{design.thermal.oilVolume.toFixed(0)} L</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Top Oil Rise</dt>
              <dd className="font-medium">{design.thermal.topOilRise.toFixed(0)}°C</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Avg Winding Rise</dt>
              <dd className="font-medium">{design.thermal.averageWindingRise.toFixed(0)}°C</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Hot Spot Rise</dt>
              <dd className="font-medium">{design.thermal.hotSpotRise.toFixed(0)}°C</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Physical Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Physical Data</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tank Dimensions (L×W×H)</dt>
              <dd className="font-medium">
                {design.tank.length} × {design.tank.width} × {design.tank.height} mm
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Overall Height</dt>
              <dd className="font-medium">{design.tank.overallHeight} mm</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tank Weight</dt>
              <dd className="font-medium">{design.tank.tankWeight.toFixed(0)} kg</dd>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <dt className="text-muted-foreground">Total Weight</dt>
              <dd className="font-medium text-lg">{design.tank.totalWeight.toFixed(0)} kg</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export default DesignSummary;
