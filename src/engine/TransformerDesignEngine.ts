/**
 * Transformer Design Engine
 *
 * Main orchestrator that coordinates all calculation modules
 * to produce a complete transformer design.
 */

import type {
  DesignRequirements,
  AdvancedOptions,
  TransformerDesign,
  CalculationStep,
  BillOfMaterials,
  BOMItem,
} from './types/transformer.types';

import { calculateCoreDesign } from './core/coreDesign';
import { calculateWindingDesign, adjustHVWindingRadii } from './core/windingDesign';
import { calculateLosses } from './core/lossCalculations';
import { calculateImpedance, checkImpedanceTarget } from './core/impedanceCalculation';
import { calculateThermalDesign, checkThermalLimits } from './core/thermalDesign';
import { calculateTankDesign, generateTankBOM } from './core/tankDesign';

export interface DesignResult {
  success: boolean;
  design?: TransformerDesign;
  warnings: string[];
  errors: string[];
}

/**
 * Main transformer design function.
 *
 * Takes design requirements and produces a complete design
 * with all calculations and bill of materials.
 */
export function designTransformer(
  requirements: DesignRequirements,
  advancedOptions: AdvancedOptions
): DesignResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const calculationSteps: CalculationStep[] = [];

  try {
    // =========================================================================
    // STEP 1: Core Design
    // =========================================================================
    const core = calculateCoreDesign(requirements, advancedOptions, calculationSteps);

    // =========================================================================
    // STEPS 2-5: Winding Design + Impedance Targeting Loop
    //
    // The engine iterates on window height to converge on the target impedance.
    // %X is inversely proportional to winding height and proportional to the
    // ampere-turn-distance, both of which change with window height.
    // =========================================================================
    const targetZ = requirements.targetImpedance;
    const maxIterations = 8;
    const tolerance = 0.3; // ±0.3% is acceptable per IEEE

    let lvWinding = calculateWindingDesign('LV', requirements, advancedOptions, core, calculationSteps);
    let hvWinding = calculateWindingDesign('HV', requirements, advancedOptions, core, calculationSteps);
    hvWinding = adjustHVWindingRadii(hvWinding, lvWinding, requirements);

    let losses = calculateLosses(requirements, core, hvWinding, lvWinding, calculationSteps);
    let impedance = calculateImpedance(requirements, hvWinding, lvWinding, losses, calculationSteps);

    for (let iter = 0; iter < maxIterations; iter++) {
      const deviation = Math.abs(impedance.percentZ - targetZ);
      if (deviation <= tolerance) break;

      // Scale window height proportionally to bring impedance toward target.
      // Use damped ratio to avoid oscillation (0.7 blending factor).
      const ratio = impedance.percentX / targetZ;
      const scaleFactor = 1 + 0.7 * (ratio - 1);

      // Apply limits: window height can range from 2× to 8× core diameter
      const newWindowHeight = Math.round(
        Math.max(core.coreDiameter * 2, Math.min(core.coreDiameter * 8, core.windowHeight * scaleFactor))
      );

      if (newWindowHeight === core.windowHeight) break; // no change possible

      // Update core dimensions
      core.windowHeight = newWindowHeight;
      core.limbHeight = newWindowHeight;

      // Clear previous winding/impedance calculation steps for clean recalculation
      const coreStepIds = new Set(calculationSteps.filter(s => s.category === 'core').map(s => s.id));
      const keepSteps = calculationSteps.filter(s => coreStepIds.has(s.id));
      calculationSteps.length = 0;
      keepSteps.forEach(s => calculationSteps.push(s));

      // Recalculate windings with new window height
      lvWinding = calculateWindingDesign('LV', requirements, advancedOptions, core, calculationSteps);
      hvWinding = calculateWindingDesign('HV', requirements, advancedOptions, core, calculationSteps);
      hvWinding = adjustHVWindingRadii(hvWinding, lvWinding, requirements);
      losses = calculateLosses(requirements, core, hvWinding, lvWinding, calculationSteps);
      impedance = calculateImpedance(requirements, hvWinding, lvWinding, losses, calculationSteps);
    }

    // Recalculate core weight with final window height (limb length changed)
    {
      const numLimbs = requirements.phases === 3 ? 3 : 2;
      const limbVolume = core.netCrossSection * (core.limbHeight / 10) * numLimbs;
      const coreWidth = Math.sqrt(core.netCrossSection) * 10;
      const yokeLength = requirements.phases === 3
        ? 2 * core.windowWidth + 3 * coreWidth
        : 2 * core.windowWidth + 2 * coreWidth;
      const yokeVolume = core.netCrossSection * (yokeLength / 10) * 2 / 10;
      core.coreWeight = Math.round((limbVolume + yokeVolume) * core.steelGrade.density / 1000000);
    }

    // Check final impedance against target
    const impedanceCheck = checkImpedanceTarget(
      impedance.percentZ,
      requirements.targetImpedance,
      tolerance
    );

    if (!impedanceCheck.meets) {
      const direction = impedanceCheck.deviation > 0 ? 'higher' : 'lower';
      warnings.push(
        `Calculated impedance (${impedance.percentZ}%) is ${Math.abs(impedanceCheck.deviation).toFixed(2)}% ${direction} than target (${requirements.targetImpedance}%). Design adjustments may be needed.`
      );
    }

    // =========================================================================
    // STEP 6: Thermal Design
    // =========================================================================
    const thermal = calculateThermalDesign(
      requirements,
      core,
      hvWinding,
      lvWinding,
      losses,
      calculationSteps
    );

    // Check thermal limits
    const thermalCheck = checkThermalLimits(thermal, requirements);
    if (!thermalCheck.passes) {
      thermalCheck.issues.forEach(issue => warnings.push(issue));
    }

    // =========================================================================
    // STEP 7: Tank Design
    // =========================================================================
    const tank = calculateTankDesign(
      requirements,
      core,
      hvWinding,
      lvWinding,
      thermal,
      calculationSteps
    );

    // =========================================================================
    // STEP 8: Bill of Materials
    // =========================================================================
    const bom = generateBillOfMaterials(
      core,
      hvWinding,
      lvWinding,
      thermal,
      tank,
      requirements
    );

    // =========================================================================
    // Assemble complete design
    // =========================================================================
    const design: TransformerDesign = {
      requirements,
      advancedOptions,
      core,
      hvWinding,
      lvWinding,
      losses,
      impedance,
      thermal,
      tank,
      bom,
      calculationSteps,
      timestamp: new Date(),
      revision: '1.0',
    };

    return {
      success: true,
      design,
      warnings,
      errors,
    };
  } catch (error) {
    errors.push(`Design calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      warnings,
      errors,
    };
  }
}

/**
 * Generate complete bill of materials.
 */
function generateBillOfMaterials(
  core: TransformerDesign['core'],
  hvWinding: TransformerDesign['hvWinding'],
  lvWinding: TransformerDesign['lvWinding'],
  thermal: TransformerDesign['thermal'],
  tank: TransformerDesign['tank'],
  requirements: DesignRequirements
): BillOfMaterials {
  const items: BOMItem[] = [];

  // Core materials
  items.push({
    category: 'core',
    description: `Core Steel (${core.steelGrade.name})`,
    quantity: core.coreWeight,
    unit: 'kg',
    weight: core.coreWeight,
    specification: `${core.steelGrade.thickness}mm thick, ${core.coreSteps}-step construction`,
  });

  // HV Winding
  items.push({
    category: 'winding',
    description: `HV Winding - ${hvWinding.conductorType === 'copper' ? 'Copper' : 'Aluminum'}`,
    quantity: hvWinding.conductorWeight,
    unit: 'kg',
    weight: hvWinding.conductorWeight,
    specification: `${hvWinding.turns} turns, ${hvWinding.conductorSize.crossSection}mm² ${hvWinding.conductorShape}`,
  });

  // LV Winding
  items.push({
    category: 'winding',
    description: `LV Winding - ${lvWinding.conductorType === 'copper' ? 'Copper' : 'Aluminum'}`,
    quantity: lvWinding.conductorWeight,
    unit: 'kg',
    weight: lvWinding.conductorWeight,
    specification: `${lvWinding.turns} turns, ${lvWinding.conductorSize.crossSection}mm² ${lvWinding.conductorShape}`,
  });

  // Insulation materials (estimated)
  const insulationWeight = (hvWinding.conductorWeight + lvWinding.conductorWeight) * 0.15;
  items.push({
    category: 'insulation',
    description: 'Insulation materials (paper, pressboard)',
    quantity: Math.round(insulationWeight),
    unit: 'kg',
    weight: Math.round(insulationWeight),
    specification: 'Kraft paper, diamond-dotted paper, pressboard barriers',
  });

  // Tank
  items.push({
    category: 'tank',
    description: 'Tank assembly (welded steel)',
    quantity: 1,
    unit: 'set',
    weight: tank.tankWeight,
    specification: `${tank.length}×${tank.width}×${tank.height}mm`,
  });

  // Oil
  items.push({
    category: 'oil',
    description: 'Transformer Oil (Type I)',
    quantity: thermal.oilVolume,
    unit: 'liters',
    weight: thermal.oilWeight,
    specification: 'Mineral insulating oil per ASTM D3487',
  });

  // Radiators
  items.push({
    category: 'accessories',
    description: 'Radiator panels',
    quantity: thermal.numberOfRadiators,
    unit: 'ea',
    specification: `${(thermal.radiatorArea / thermal.numberOfRadiators).toFixed(1)}m² each`,
  });

  // Bushings
  const numHvBushings = requirements.phases === 3 ? 3 : 2;
  const numLvBushings = requirements.phases === 3 ? 4 : 2;

  items.push({
    category: 'accessories',
    description: 'HV Bushings',
    quantity: numHvBushings,
    unit: 'ea',
    specification: `${requirements.primaryVoltage / 1000}kV class`,
  });

  items.push({
    category: 'accessories',
    description: 'LV Bushings',
    quantity: numLvBushings,
    unit: 'ea',
    specification: '1kV class',
  });

  // Cooling fans (if applicable)
  if (thermal.numberOfFans > 0) {
    items.push({
      category: 'accessories',
      description: 'Cooling Fans',
      quantity: thermal.numberOfFans,
      unit: 'ea',
      specification: 'Forced air cooling fans with motor',
    });
  }

  // Calculate totals
  const totalCopperWeight =
    (hvWinding.conductorType === 'copper' ? hvWinding.conductorWeight : 0) +
    (lvWinding.conductorType === 'copper' ? lvWinding.conductorWeight : 0);

  const totalSteelWeight = core.coreWeight + tank.tankWeight;

  return {
    items,
    totalCopperWeight: Math.round(totalCopperWeight),
    totalSteelWeight: Math.round(totalSteelWeight),
    totalOilVolume: Math.round(thermal.oilVolume),
    totalWeight: Math.round(tank.totalWeight),
  };
}

/**
 * Quick design validation without full calculation.
 */
export function validateDesignInputs(
  requirements: Partial<DesignRequirements>
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!requirements.ratedPower || requirements.ratedPower <= 0) {
    issues.push('Rated power must be greater than 0');
  }

  if (!requirements.primaryVoltage || requirements.primaryVoltage <= 0) {
    issues.push('Primary voltage must be greater than 0');
  }

  if (!requirements.secondaryVoltage || requirements.secondaryVoltage <= 0) {
    issues.push('Secondary voltage must be greater than 0');
  }

  if (requirements.primaryVoltage && requirements.secondaryVoltage) {
    if (requirements.primaryVoltage <= requirements.secondaryVoltage) {
      issues.push('Primary voltage must be greater than secondary voltage');
    }
  }

  if (requirements.targetImpedance && (requirements.targetImpedance < 2 || requirements.targetImpedance > 15)) {
    issues.push('Target impedance should be between 2% and 15%');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Get design summary as formatted text.
 */
export function getDesignSummary(design: TransformerDesign): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════════════',
    '                    TRANSFORMER DESIGN SUMMARY',
    '═══════════════════════════════════════════════════════════════',
    '',
    `Rating:         ${design.requirements.ratedPower} kVA, ${design.requirements.phases}-phase`,
    `Voltages:       ${design.requirements.primaryVoltage / 1000}kV / ${design.requirements.secondaryVoltage}V`,
    `Frequency:      ${design.requirements.frequency} Hz`,
    `Vector Group:   ${design.requirements.vectorGroup}`,
    `Cooling:        ${design.requirements.coolingClass}`,
    '',
    '───────────────────────────────────────────────────────────────',
    '                       ELECTRICAL DATA',
    '───────────────────────────────────────────────────────────────',
    '',
    `Impedance:      ${design.impedance.percentZ}% (R=${design.impedance.percentR}%, X=${design.impedance.percentX}%)`,
    `No-Load Loss:   ${design.losses.noLoadLoss} W`,
    `Load Loss:      ${design.losses.loadLoss} W (at 100% load, 75°C)`,
    `Efficiency:     ${design.losses.efficiency.find(e => e.loadPercent === 100)?.efficiency}% at rated load`,
    `Regulation:     ${design.impedance.regulationAt08PF}% at 0.8 PF lagging`,
    '',
    '───────────────────────────────────────────────────────────────',
    '                       PHYSICAL DATA',
    '───────────────────────────────────────────────────────────────',
    '',
    `Tank Dimensions: ${design.tank.length}×${design.tank.width}×${design.tank.height} mm`,
    `Total Weight:    ${design.tank.totalWeight} kg (with oil)`,
    `Oil Volume:      ${design.thermal.oilVolume} liters`,
    `Core Weight:     ${design.core.coreWeight} kg`,
    '',
    '───────────────────────────────────────────────────────────────',
    '                       THERMAL DATA',
    '───────────────────────────────────────────────────────────────',
    '',
    `Top Oil Rise:      ${design.thermal.topOilRise}°C`,
    `Winding Rise:      ${design.thermal.averageWindingRise}°C`,
    `Hot Spot Rise:     ${design.thermal.hotSpotRise}°C`,
    `Radiators:         ${design.thermal.numberOfRadiators} panels (${design.thermal.radiatorArea} m²)`,
    '',
    '═══════════════════════════════════════════════════════════════',
  ];

  return lines.join('\n');
}

// TransformerDesignEngine class exported below
