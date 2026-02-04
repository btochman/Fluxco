"use client";
import { Calculator, Lightbulb, AlertCircle, HelpCircle, DollarSign, Clock, Zap, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DesignRequirements } from '@/engine/types/transformer.types';
import { STEEL_GRADES, CONDUCTOR_TYPES, COOLING_CLASSES, VECTOR_GROUPS, LOAD_PROFILES, STEEL_SELECTION_GUIDANCE } from '@/engine/constants/materials';

interface DesignRequirementsFormProps {
  requirements: DesignRequirements;
  onChange: (requirements: DesignRequirements) => void;
  onCalculate: () => void;
}

// Impact indicator component
function ImpactBadge({ type, level }: { type: 'cost' | 'leadTime' | 'efficiency'; level: 'low' | 'medium' | 'high' }) {
  const icons = {
    cost: DollarSign,
    leadTime: Clock,
    efficiency: Zap,
  };
  const labels = {
    cost: 'Cost',
    leadTime: 'Lead Time',
    efficiency: 'Efficiency',
  };
  const colors = {
    low: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    high: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  };
  // For efficiency, high is good (green)
  const efficiencyColors = {
    low: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    high: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  };

  const Icon = icons[type];
  const colorClass = type === 'efficiency' ? efficiencyColors[level] : colors[level];

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${colorClass}`}>
      <Icon className="w-3 h-3" />
      {labels[type]}: {level}
    </span>
  );
}

// Help tooltip component
function HelpText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function DesignRequirementsForm({
  requirements,
  onChange,
  onCalculate,
}: DesignRequirementsFormProps) {
  const updateRequirement = <K extends keyof DesignRequirements>(
    key: K,
    value: DesignRequirements[K]
  ) => {
    onChange({ ...requirements, [key]: value });
  };

  const isAmorphous = requirements.steelGrade.id.includes('amorphous');
  const isPremiumSteel = ['hi-b', 'laser', 'amorphous-sa1', 'amorphous-hb1m'].includes(requirements.steelGrade.id);

  return (
    <div className="space-y-6">
      {/* Quick Guide for Procurement */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">Quick Guide for Procurement</p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              The fields below define your transformer specifications. Required fields are the <strong>power rating</strong> and <strong>voltages</strong>
              (from your electrical system requirements). Other choices affect <strong>cost</strong>, <strong>delivery time</strong>, and <strong>energy efficiency</strong>.
              Look for the impact badges to understand trade-offs.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Basic Electrical Requirements */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">1. Basic Electrical Requirements</h3>
        <p className="text-sm text-muted-foreground">These values come from your electrical system design. If unsure, consult your electrical engineer.</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Rated Power */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Rated Power (kVA)
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              step="100"
              min="100"
              max="100000"
              value={requirements.ratedPower}
              onChange={(e) => updateRequirement('ratedPower', parseFloat(e.target.value) || 0)}
              placeholder="1500"
              className="text-lg font-medium"
            />
            <HelpText>
              The maximum power the transformer can deliver. 1500 kVA = 1.5 MVA.
              Common sizes: 500, 750, 1000, 1500, 2000, 2500 kVA. Larger = more expensive.
            </HelpText>
          </div>

          {/* Primary Voltage */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Primary (High) Voltage
              <span className="text-red-500">*</span>
            </Label>
            <Select
              value={requirements.primaryVoltage.toString()}
              onValueChange={(val) => updateRequirement('primaryVoltage', parseFloat(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select voltage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4160">4,160 V (4.16 kV)</SelectItem>
                <SelectItem value="7200">7,200 V (7.2 kV)</SelectItem>
                <SelectItem value="12470">12,470 V (12.47 kV)</SelectItem>
                <SelectItem value="13200">13,200 V (13.2 kV)</SelectItem>
                <SelectItem value="13800">13,800 V (13.8 kV) - Most Common</SelectItem>
                <SelectItem value="23000">23,000 V (23 kV)</SelectItem>
                <SelectItem value="34500">34,500 V (34.5 kV)</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              The incoming utility voltage. Check your utility connection agreement.
              13.8 kV is most common for commercial/industrial in North America.
            </HelpText>
          </div>

          {/* Secondary Voltage */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Secondary (Low) Voltage
              <span className="text-red-500">*</span>
            </Label>
            <Select
              value={requirements.secondaryVoltage.toString()}
              onValueChange={(val) => updateRequirement('secondaryVoltage', parseFloat(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select voltage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="208">208 V (small commercial)</SelectItem>
                <SelectItem value="240">240 V (residential/small commercial)</SelectItem>
                <SelectItem value="277">277 V (lighting systems)</SelectItem>
                <SelectItem value="480">480 V - Most Common Industrial</SelectItem>
                <SelectItem value="600">600 V (Canada)</SelectItem>
                <SelectItem value="4160">4,160 V (large motors)</SelectItem>
                <SelectItem value="13800">13.8 kV (medium voltage distribution)</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              The voltage your facility needs. 480V is standard for industrial equipment.
              208V/240V for smaller facilities. Match your main electrical panel.
            </HelpText>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={requirements.frequency.toString()}
              onValueChange={(val) => updateRequirement('frequency', parseInt(val) as 50 | 60)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">60 Hz - North America, parts of Asia</SelectItem>
                <SelectItem value="50">50 Hz - Europe, most of world</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              Determined by your location's power grid. North America uses 60 Hz.
            </HelpText>
          </div>

          {/* Phases */}
          <div className="space-y-2">
            <Label>Number of Phases</Label>
            <Select
              value={requirements.phases.toString()}
              onValueChange={(val) => updateRequirement('phases', parseInt(val) as 1 | 3)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Three Phase - Standard for commercial/industrial</SelectItem>
                <SelectItem value="1">Single Phase - Residential, small loads only</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              Almost all commercial/industrial applications use three-phase power for efficiency and motor operation.
            </HelpText>
          </div>

          {/* Vector Group */}
          <div className="space-y-2">
            <Label>Vector Group (Winding Connection)</Label>
            <Select
              value={requirements.vectorGroup.id}
              onValueChange={(val) => {
                const vector = VECTOR_GROUPS.find(v => v.id === val);
                if (vector) updateRequirement('vectorGroup', vector);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dyn11">Dyn11 - Most Common (Delta-Wye)</SelectItem>
                <SelectItem value="dyn1">Dyn1 - Delta-Wye alternate</SelectItem>
                <SelectItem value="ynd11">YNd11 - Wye-Delta</SelectItem>
                <SelectItem value="dd0">Dd0 - Delta-Delta (no neutral)</SelectItem>
                <SelectItem value="yy0">Yy0 - Wye-Wye</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              Dyn11 is standard for most applications - provides a neutral for single-phase loads.
              Your electrical engineer will specify if different is needed.
            </HelpText>
          </div>
        </div>
      </div>

      {/* SECTION 2: Performance & Efficiency Choices */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">2. Performance & Efficiency Choices</h3>
        <p className="text-sm text-muted-foreground">These choices affect cost, efficiency, and delivery time. Use the impact badges to guide decisions.</p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Impedance */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Impedance (%Z)</span>
              <span className="flex gap-1">
                <ImpactBadge type="cost" level="low" />
              </span>
            </Label>
            <Select
              value={requirements.targetImpedance.toString()}
              onValueChange={(val) => updateRequirement('targetImpedance', parseFloat(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4.5">4.5% - Lower voltage drop, higher fault current</SelectItem>
                <SelectItem value="5.0">5.0%</SelectItem>
                <SelectItem value="5.5">5.5%</SelectItem>
                <SelectItem value="5.75">5.75% - Industry Standard</SelectItem>
                <SelectItem value="6.0">6.0%</SelectItem>
                <SelectItem value="6.5">6.5% - Lower fault current</SelectItem>
                <SelectItem value="7.0">7.0% - Minimum fault current</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              Controls voltage stability and fault current. 5.75% is standard. Lower = better voltage regulation
              but higher short-circuit current (needs larger breakers). Higher = lower fault current but more voltage drop.
            </HelpText>
          </div>

          {/* Cooling Class */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Cooling Method</span>
              <span className="flex gap-1">
                {requirements.coolingClass.id === 'onan' ? (
                  <>
                    <ImpactBadge type="cost" level="low" />
                    <ImpactBadge type="leadTime" level="low" />
                  </>
                ) : (
                  <>
                    <ImpactBadge type="cost" level="medium" />
                    <ImpactBadge type="leadTime" level="medium" />
                  </>
                )}
              </span>
            </Label>
            <Select
              value={requirements.coolingClass.id}
              onValueChange={(val) => {
                const cooling = COOLING_CLASSES.find(c => c.id === val);
                if (cooling) updateRequirement('coolingClass', cooling);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onan">ONAN - Natural cooling (simplest, most reliable)</SelectItem>
                <SelectItem value="onaf">ONAF - With cooling fans (more capacity)</SelectItem>
                <SelectItem value="onan-onaf">ONAN/ONAF - Dual rated (flexible)</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              <strong>ONAN</strong> = no fans, lowest maintenance, most reliable. <strong>ONAF</strong> = fans for higher capacity
              in hot environments or overload situations. ONAN is preferred unless space/heat is a concern.
            </HelpText>
          </div>

          {/* Conductor Type */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Winding Conductor</span>
              <span className="flex gap-1">
                {requirements.conductorType.id === 'copper' ? (
                  <>
                    <ImpactBadge type="cost" level="high" />
                    <ImpactBadge type="efficiency" level="high" />
                  </>
                ) : (
                  <>
                    <ImpactBadge type="cost" level="low" />
                    <ImpactBadge type="efficiency" level="medium" />
                  </>
                )}
              </span>
            </Label>
            <Select
              value={requirements.conductorType.id}
              onValueChange={(val) => {
                const conductor = CONDUCTOR_TYPES.find(c => c.id === val);
                if (conductor) updateRequirement('conductorType', conductor);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="copper">Copper - Premium efficiency, compact, industry standard</SelectItem>
                <SelectItem value="aluminum">Aluminum - Lower cost, larger size, good efficiency</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              <strong>Copper</strong> costs more but is more efficient and compact. <strong>Aluminum</strong> saves 30-40% on conductor
              cost but transformer is larger. For high-efficiency requirements, choose copper.
            </HelpText>
          </div>

          {/* Core Steel Grade */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Core Steel Grade</span>
              <span className="flex gap-1">
                {isPremiumSteel ? (
                  <>
                    <ImpactBadge type="cost" level="high" />
                    <ImpactBadge type="leadTime" level={isAmorphous ? 'high' : 'medium'} />
                    <ImpactBadge type="efficiency" level="high" />
                  </>
                ) : (
                  <>
                    <ImpactBadge type="cost" level="low" />
                    <ImpactBadge type="leadTime" level="low" />
                    <ImpactBadge type="efficiency" level="medium" />
                  </>
                )}
              </span>
            </Label>
            <Select
              value={requirements.steelGrade.id}
              onValueChange={(val) => {
                const steel = STEEL_GRADES.find(s => s.id === val);
                if (steel) updateRequirement('steelGrade', steel);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m4">M4 Standard - Good balance of cost/performance</SelectItem>
                <SelectItem value="m3">M3 High Grade - Better efficiency</SelectItem>
                <SelectItem value="m2">M2 Premium - High efficiency</SelectItem>
                <SelectItem value="hi-b">Hi-B Ultra Premium - Excellent efficiency</SelectItem>
                <SelectItem value="laser">Laser-Scribed - Best conventional efficiency</SelectItem>
                <SelectItem value="amorphous-sa1">Amorphous 2605SA1 - 70% lower no-load loss</SelectItem>
                <SelectItem value="amorphous-hb1m">Amorphous 2605HB1M - Lowest losses available</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              Core steel is the biggest factor in no-load losses (energy used 24/7 even with no load).
              <strong> Amorphous steel</strong> costs 2-3x more but saves 70-80% on no-load losses - often pays back in 3-5 years.
            </HelpText>
          </div>
        </div>
      </div>

      {/* SECTION 3: Load Profile & Steel Guidance */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <span className="font-medium">Steel Selection Guide - Based on Your Usage Pattern</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Load Profile */}
          <div className="space-y-2">
            <Label>How will this transformer be used?</Label>
            <Select
              value={requirements.loadProfile?.id || 'medium'}
              onValueChange={(val) => {
                const profile = LOAD_PROFILES.find(p => p.id === val);
                if (profile) updateRequirement('loadProfile', profile);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOAD_PROFILES.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground p-2 bg-background rounded">
              {requirements.loadProfile?.id === 'light-variable' && (
                <span><strong>Light/Variable:</strong> Office buildings, retail, schools - transformer often lightly loaded or idle (nights/weekends). No-load losses dominate energy costs.</span>
              )}
              {(requirements.loadProfile?.id === 'medium' || !requirements.loadProfile) && (
                <span><strong>Medium/Mixed:</strong> General industrial, warehouses - moderate loading during business hours. Balance of no-load and load losses.</span>
              )}
              {requirements.loadProfile?.id === 'heavy-constant' && (
                <span><strong>Heavy/Constant:</strong> Data centers, continuous manufacturing - transformer heavily loaded 24/7. Load losses dominate.</span>
              )}
            </div>
          </div>

          {/* Steel Recommendation */}
          <div className="space-y-2">
            <Label>Recommended Steel Type</Label>
            {(() => {
              const profile = requirements.loadProfile || LOAD_PROFILES.find(p => p.id === 'medium');
              const recommendation = profile?.recommendedSteel;

              const matchesRecommendation =
                recommendation === 'either' ||
                (recommendation === 'amorphous' && isAmorphous) ||
                (recommendation === 'goes' && !isAmorphous);

              return (
                <div className={`p-3 rounded-md text-sm ${matchesRecommendation ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'}`}>
                  {recommendation === 'amorphous' && (
                    <div>
                      <strong className="text-green-800 dark:text-green-200">Amorphous Steel Recommended</strong>
                      <p className="text-xs mt-1">Your light/variable load pattern means no-load losses are your biggest energy cost.
                      Amorphous steel cuts these by 70-80%, typically paying back the higher upfront cost in 3-5 years through energy savings.</p>
                    </div>
                  )}
                  {recommendation === 'goes' && (
                    <div>
                      <strong className="text-blue-800 dark:text-blue-200">Conventional GOES Steel Recommended</strong>
                      <p className="text-xs mt-1">With heavy constant loads, load losses dominate your energy costs.
                      Conventional grain-oriented steel provides good efficiency at lower upfront cost. Consider Hi-B or M2 for best performance.</p>
                    </div>
                  )}
                  {recommendation === 'either' && (
                    <div>
                      <strong className="text-yellow-800 dark:text-yellow-200">Either Steel Type Works</strong>
                      <p className="text-xs mt-1">With mixed loading, run a lifecycle cost comparison. Amorphous has lower operating cost;
                      conventional has lower purchase price. The Cost Estimate tab will help you decide.</p>
                    </div>
                  )}
                  {!matchesRecommendation && (
                    <div className="flex items-start gap-1 mt-2 text-yellow-700 dark:text-yellow-300">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-xs">Your current selection ({requirements.steelGrade.name}) differs from the recommendation. This may be fine if you have specific requirements.</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Detailed guidance accordion */}
        <details className="mt-3">
          <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground font-medium">
            Learn more about steel types and cost implications...
          </summary>
          <div className="mt-2 grid md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded bg-background border">
              <strong className="text-green-700 dark:text-green-300">Amorphous Steel</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• <strong>70-80% lower no-load losses</strong> - runs 24/7</li>
                <li>• Higher upfront cost (2-3x steel cost)</li>
                <li>• Longer lead time (specialty material)</li>
                <li>• Slightly larger transformer size</li>
                <li>• <strong>Best ROI for:</strong> Distribution, commercial buildings, variable loads</li>
              </ul>
              <p className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300">
                <strong>Example:</strong> A 1500 kVA transformer at $0.10/kWh saves ~$3,000-5,000/year in energy costs with amorphous steel.
              </p>
            </div>
            <div className="p-3 rounded bg-background border">
              <strong className="text-blue-700 dark:text-blue-300">Conventional GOES Steel</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Lower upfront cost</li>
                <li>• Shorter lead time (standard material)</li>
                <li>• More compact design possible</li>
                <li>• Wide range of grades (M6 to laser-scribed)</li>
                <li>• <strong>Best for:</strong> Heavy industrial, constant loads, budget-constrained</li>
              </ul>
              <p className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300">
                <strong>Tip:</strong> If choosing GOES, at minimum use M3 or M2 grade. The cost difference vs M4/M5 is small but efficiency gains are significant.
              </p>
            </div>
          </div>
        </details>
      </div>

      {/* Summary of Current Selections */}
      <div className="bg-secondary/30 rounded-lg p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Your Selection Summary
        </h4>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <span className="text-muted-foreground">Power:</span>
            <span className="ml-2 font-medium">{requirements.ratedPower} kVA</span>
          </div>
          <div>
            <span className="text-muted-foreground">Voltages:</span>
            <span className="ml-2 font-medium">{(requirements.primaryVoltage/1000).toFixed(1)}kV / {requirements.secondaryVoltage}V</span>
          </div>
          <div>
            <span className="text-muted-foreground">Steel:</span>
            <span className={`ml-2 font-medium ${isAmorphous ? 'text-green-600' : ''}`}>
              {isAmorphous ? 'Amorphous (High Eff.)' : requirements.steelGrade.name.split(' ')[0]}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Conductor:</span>
            <span className="ml-2 font-medium">{requirements.conductorType.name}</span>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Click calculate to see detailed design, cost estimate, and technical drawings.
        </p>
        <Button onClick={onCalculate} size="lg" className="w-full sm:w-auto">
          <Calculator className="w-5 h-5 mr-2" />
          Calculate Design & Cost
        </Button>
      </div>
    </div>
  );
}

export default DesignRequirementsForm;
