"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { TransformerDesign, DesignRequirements } from '@/engine/types/transformer.types';

interface CalculationStepsProps {
  design: TransformerDesign;
  requirements: DesignRequirements;
}

export function CalculationSteps({ design, requirements }: CalculationStepsProps) {
  const kVA = requirements.ratedPower;
  const primaryVoltage = requirements.primaryVoltage;
  const secondaryVoltage = requirements.secondaryVoltage;
  const frequency = requirements.frequency;

  return (
    <div className="space-y-6">
      {/* Core Design Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-600">Core Design Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="volts-per-turn">
              <AccordionTrigger>Volts per Turn (Et)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    Et = K × √(kVA)
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>K (design constant):</div>
                    <div className="font-mono">0.45</div>
                    <div>kVA:</div>
                    <div className="font-mono">{kVA}</div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded">
                    <span className="font-medium">Result: </span>
                    <span className="font-mono text-primary font-bold">
                      {design.core.voltsPerTurn.toFixed(2)} V/turn
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="core-area">
              <AccordionTrigger>Core Cross-Section Area</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    Ac = Et / (4.44 × f × Bm)
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Et (volts/turn):</div>
                    <div className="font-mono">{design.core.voltsPerTurn.toFixed(2)} V</div>
                    <div>f (frequency):</div>
                    <div className="font-mono">{frequency} Hz</div>
                    <div>Bm (flux density):</div>
                    <div className="font-mono">{design.core.fluxDensity} T</div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded">
                    <span className="font-medium">Result: </span>
                    <span className="font-mono text-primary font-bold">
                      {design.core.netCrossSection.toFixed(1)} cm²
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="core-diameter">
              <AccordionTrigger>Core Diameter</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    D = √(4 × Ac / (π × U))
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Ac (net area):</div>
                    <div className="font-mono">{design.core.netCrossSection.toFixed(1)} cm²</div>
                    <div>U (utilization factor):</div>
                    <div className="font-mono">~0.90</div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded">
                    <span className="font-medium">Result: </span>
                    <span className="font-mono text-primary font-bold">
                      {design.core.coreDiameter} mm
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Winding Design Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-green-600">Winding Design Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="hv-turns">
              <AccordionTrigger>HV Winding Turns</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    N_HV = V_HV / Et
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>V_HV (primary voltage):</div>
                    <div className="font-mono">{primaryVoltage} V</div>
                    <div>Et (volts/turn):</div>
                    <div className="font-mono">{design.core.voltsPerTurn.toFixed(2)} V</div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded">
                    <span className="font-medium">Result: </span>
                    <span className="font-mono text-primary font-bold">
                      {design.hvWinding.turns} turns
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lv-turns">
              <AccordionTrigger>LV Winding Turns</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    N_LV = V_LV / Et
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>V_LV (secondary voltage):</div>
                    <div className="font-mono">{secondaryVoltage} V</div>
                    <div>Et (volts/turn):</div>
                    <div className="font-mono">{design.core.voltsPerTurn.toFixed(2)} V</div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded">
                    <span className="font-medium">Result: </span>
                    <span className="font-mono text-primary font-bold">
                      {design.lvWinding.turns} turns
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="current-density">
              <AccordionTrigger>Current Density</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    J = I / A_conductor
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>HV current density:</div>
                    <div className="font-mono">{design.hvWinding.currentDensity.toFixed(2)} A/mm²</div>
                    <div>LV current density:</div>
                    <div className="font-mono">{design.lvWinding.currentDensity.toFixed(2)} A/mm²</div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Loss Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-orange-600">Loss Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="no-load-loss">
              <AccordionTrigger>No-Load Loss (Core Loss)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    P₀ = Core_weight × Specific_loss × (Bm/1.7)² × Building_factor
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Core weight:</div>
                    <div className="font-mono">{design.core.coreWeight} kg</div>
                    <div>Specific loss:</div>
                    <div className="font-mono">{design.core.steelGrade.specificLoss} W/kg</div>
                    <div>Flux density:</div>
                    <div className="font-mono">{design.core.fluxDensity} T</div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded">
                    <span className="font-medium">Result: </span>
                    <span className="font-mono text-primary font-bold">
                      {design.losses.noLoadLoss.toFixed(0)} W
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="load-loss">
              <AccordionTrigger>Load Loss (Copper Loss)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    Pk = I²R_HV + I²R_LV + Eddy + Stray
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>I²R loss:</div>
                    <div className="font-mono">{design.losses.i2rLoss.toFixed(0)} W</div>
                    <div>Eddy loss:</div>
                    <div className="font-mono">{design.losses.eddyLoss.toFixed(0)} W</div>
                    <div>Stray loss:</div>
                    <div className="font-mono">{design.losses.strayLoss.toFixed(0)} W</div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded">
                    <span className="font-medium">Result: </span>
                    <span className="font-mono text-primary font-bold">
                      {design.losses.loadLoss.toFixed(0)} W
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="efficiency">
              <AccordionTrigger>Efficiency</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    η = Output / (Output + Losses) × 100%
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>At 100% load:</div>
                    <div className="font-mono">{design.losses.efficiency.find(e => e.loadPercent === 100)?.efficiency.toFixed(2)}%</div>
                    <div>At 75% load:</div>
                    <div className="font-mono">{design.losses.efficiency.find(e => e.loadPercent === 75)?.efficiency.toFixed(2)}%</div>
                    <div>At 50% load:</div>
                    <div className="font-mono">{design.losses.efficiency.find(e => e.loadPercent === 50)?.efficiency.toFixed(2)}%</div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded">
                    <span className="font-medium">Max Efficiency: </span>
                    <span className="font-mono text-primary font-bold">
                      {design.losses.maxEfficiency.toFixed(2)}% at {design.losses.maxEfficiencyLoad}% load
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Impedance Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-purple-600">Impedance Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="impedance">
              <AccordionTrigger>Percent Impedance (%Z)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    %Z = √(%R² + %X²)
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>%R (resistance):</div>
                    <div className="font-mono">{design.impedance.percentR.toFixed(3)}%</div>
                    <div>%X (reactance):</div>
                    <div className="font-mono">{design.impedance.percentX.toFixed(3)}%</div>
                    <div>X/R ratio:</div>
                    <div className="font-mono">{design.impedance.xrRatio.toFixed(2)}</div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded">
                    <span className="font-medium">Result: </span>
                    <span className="font-mono text-primary font-bold">
                      {design.impedance.percentZ.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

export default CalculationSteps;
