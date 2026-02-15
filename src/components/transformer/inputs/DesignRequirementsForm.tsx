"use client";
import { Calculator, HelpCircle, Clock, Zap, DollarSign, Info } from 'lucide-react';
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
import { CONDUCTOR_TYPES, COOLING_CLASSES, VECTOR_GROUPS, calculatePowerRatings } from '@/engine/constants/materials';

interface DesignRequirementsFormProps {
  requirements: DesignRequirements;
  onChange: (requirements: DesignRequirements) => void;
  onCalculate: () => void;
}

// Impact indicator component
function ImpactBadge({ type, level }: { type: 'leadTime' | 'efficiency' | 'cost'; level: 'low' | 'medium' | 'high' }) {
  const icons = {
    leadTime: Clock,
    efficiency: Zap,
    cost: DollarSign,
  };
  const labels = {
    leadTime: 'Lead Time',
    efficiency: 'Efficiency',
    cost: 'Cost',
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

          {/* Project Zipcode */}
          <div className="space-y-2">
            <Label>Project Zipcode</Label>
            <Input
              type="text"
              maxLength={10}
              value={requirements.zipcode || ''}
              onChange={(e) => updateRequirement('zipcode', e.target.value)}
              placeholder="12345"
            />
            <HelpText>
              Location helps estimate shipping costs and may affect design for local climate conditions.
            </HelpText>
          </div>

          {/* Maximum Ambient Temperature */}
          <div className="space-y-2">
            <Label>Maximum Ambient Temperature (°C)</Label>
            <Select
              value={(requirements.ambientTemperature || 40).toString()}
              onValueChange={(val) => updateRequirement('ambientTemperature', parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30°C (86°F) - Cool climate / indoor</SelectItem>
                <SelectItem value="35">35°C (95°F) - Moderate climate</SelectItem>
                <SelectItem value="40">40°C (104°F) - Standard / Most common</SelectItem>
                <SelectItem value="45">45°C (113°F) - Hot climate</SelectItem>
                <SelectItem value="50">50°C (122°F) - Very hot / desert</SelectItem>
                <SelectItem value="55">55°C (131°F) - Extreme conditions</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              The highest expected outdoor temperature where the transformer will be installed.
              Higher ambient temps may require derating or enhanced cooling.
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
            <Label>
              <span>Impedance (%Z)</span>
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
                <ImpactBadge type="leadTime" level={requirements.coolingClass.id === 'onan' ? 'low' : 'medium'} />
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
                <SelectItem value="onan">ONAN - Self-cooled only (single rating)</SelectItem>
                <SelectItem value="onan-onaf">ONAN/ONAF - With fans (dual rating, +33% capacity)</SelectItem>
                <SelectItem value="onan-onaf-ofaf">ONAN/ONAF/OFAF - Fans + pumps (triple rating, +67%)</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              Transformers can have multiple power ratings based on cooling stages.
              <strong>ONAN</strong> = base self-cooled rating.
              <strong>ONAF</strong> = fans add ~33% capacity.
              <strong>OFAF</strong> = forced oil + fans add ~67%. Example: a 1500 kVA base becomes 1500/2000/2500 kVA.
            </HelpText>
          </div>

          {/* Conductor Type */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Winding Conductor</span>
              <span className="flex gap-1">
                <ImpactBadge type="efficiency" level={requirements.conductorType.id === 'copper' ? 'high' : 'medium'} />
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

          {/* Tap Changer */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Tap Changer</span>
              <span className="flex gap-1">
                <ImpactBadge type="cost" level={requirements.tapChangerType === 'onLoad' ? 'high' : 'low'} />
              </span>
            </Label>
            <Select
              value={requirements.tapChangerType || 'noLoad'}
              onValueChange={(val) => updateRequirement('tapChangerType', val as 'noLoad' | 'onLoad')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="noLoad">No-Load Tap Changer (NLTC) - Standard</SelectItem>
                <SelectItem value="onLoad">On-Load Tap Changer (OLTC) - Voltage regulation under load</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              <strong>NLTC</strong> adjusts voltage ratio when de-energized — standard for most applications.
              <strong> OLTC</strong> allows voltage adjustment under load — required for voltage regulation on feeders
              or large facilities. OLTC adds significant cost ($15K-$45K).
            </HelpText>
          </div>

          {/* Oil Type */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Insulating Oil Type</span>
              <span className="flex gap-1">
                <ImpactBadge type="cost" level={requirements.oilType === 'mineral' ? 'low' : requirements.oilType === 'silicon' ? 'high' : 'medium'} />
              </span>
            </Label>
            <Select
              value={requirements.oilType || 'mineral'}
              onValueChange={(val) => updateRequirement('oilType', val as 'mineral' | 'naturalEster' | 'syntheticEster' | 'silicon')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mineral">ASTM D5222 Mineral Oil - Industry standard ($2.20/L)</SelectItem>
                <SelectItem value="naturalEster">Natural Ester (FR3) - Biodegradable, higher fire point ($4.50/L)</SelectItem>
                <SelectItem value="syntheticEster">Synthetic Ester - Extreme cold performance ($6.80/L)</SelectItem>
                <SelectItem value="silicon">Silicone Fluid - Fire resistant, indoor applications ($12.00/L)</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              <strong>Mineral oil</strong> is the industry standard for outdoor oil-filled transformers.
              <strong> Natural ester</strong> offers a higher fire point and is biodegradable — preferred near sensitive environments.
              <strong> Silicone fluid</strong> is used where fire resistance is critical (indoor, near buildings).
            </HelpText>
          </div>

          {/* Oil Preservation System */}
          <div className="space-y-2">
            <Label>Oil Preservation System</Label>
            <Select
              value={requirements.oilPreservation || 'conservator'}
              onValueChange={(val) => updateRequirement('oilPreservation', val as 'conservator' | 'sealedTank' | 'nitrogen')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservator">Conservator Tank with Bladder - Standard for outdoor</SelectItem>
                <SelectItem value="sealedTank">Sealed Tank (Gas Cushion) - No external air contact</SelectItem>
                <SelectItem value="nitrogen">Nitrogen Blanket - Inert gas protection, premium</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              <strong>Conservator with bladder</strong> is standard — allows oil expansion while preventing moisture ingress.
              <strong> Sealed tank</strong> eliminates the conservator for a simpler, lower-maintenance design.
              <strong> Nitrogen blanket</strong> provides inert gas protection for critical applications.
            </HelpText>
          </div>

          {/* TAC - Transformer Automation Controller */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Transformer Automation Controller (TAC)</span>
              <span className="flex gap-1">
                <ImpactBadge type="cost" level={requirements.includeTAC ? 'medium' : 'low'} />
              </span>
            </Label>
            <Select
              value={requirements.includeTAC ? 'yes' : 'no'}
              onValueChange={(val) => updateRequirement('includeTAC', val === 'yes')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">None - No remote monitoring</SelectItem>
                <SelectItem value="yes">Yes (e.g., SEL-2414) - Remote monitoring & SCADA integration</SelectItem>
              </SelectContent>
            </Select>
            <HelpText>
              A <strong>Transformer Automation Controller</strong> like the SEL-2414 provides real-time monitoring,
              SCADA integration, condition-based alerts, and remote diagnostics. Recommended for critical
              infrastructure, unmanned substations, and assets requiring predictive maintenance.
            </HelpText>
          </div>

        </div>
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
            <span className="ml-2 font-medium">{calculatePowerRatings(requirements.ratedPower, requirements.coolingClass.id).display}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Voltages:</span>
            <span className="ml-2 font-medium">{(requirements.primaryVoltage/1000).toFixed(1)}kV / {requirements.secondaryVoltage}V</span>
          </div>
          <div>
            <span className="text-muted-foreground">Conductor:</span>
            <span className="ml-2 font-medium">{requirements.conductorType.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Ambient Temp:</span>
            <span className="ml-2 font-medium">{requirements.ambientTemperature || 40}°C</span>
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
