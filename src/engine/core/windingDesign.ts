/**
 * Winding Design Module
 *
 * Calculates transformer winding parameters including turns, conductor sizing,
 * current density, and physical dimensions.
 *
 * Key formulas:
 * - Number of turns: N = V / Et
 * - Rated current: I = S / (√3 × V) for 3-phase, I = S / V for 1-phase
 * - Conductor area: A = I / J (where J is current density)
 */

import type {
  DesignRequirements,
  AdvancedOptions,
  CoreDesign,
  WindingDesign,
  ConductorSize,
  CalculationStep,
  ConductorMaterial,
} from '../types/transformer.types';
import {
  CONDUCTOR_PROPERTIES,
  CURRENT_DENSITY_BY_COOLING,
  INSULATION_CLEARANCES,
} from '../constants/materials';
import {
  selectAWGForArea,
  selectRectangularConductor,
  recommendConductorType,
  awgToString,
} from '../constants/awg-table';

/**
 * Calculate complete winding design for one side (HV or LV).
 */
export function calculateWindingDesign(
  side: 'HV' | 'LV',
  requirements: DesignRequirements,
  advancedOptions: AdvancedOptions,
  coreDesign: CoreDesign,
  steps: CalculationStep[]
): WindingDesign {
  const kVA = requirements.ratedPower;
  const conductorMaterial: ConductorMaterial = side === 'HV'
    ? advancedOptions.hvConductorMaterial
    : advancedOptions.lvConductorMaterial;

  // Voltage in Volts
  const voltage = side === 'HV'
    ? requirements.primaryVoltage * 1000  // kV to V
    : requirements.secondaryVoltage;       // Already in V

  // Step 1: Calculate number of turns
  const turns = calculateTurns(side, voltage, coreDesign.voltsPerTurn, steps);

  // Step 2: Calculate rated current
  const ratedCurrent = calculateRatedCurrent(side, kVA, voltage, requirements.phases, steps);

  // Step 3: Select current density
  const currentDensity = selectCurrentDensity(
    side,
    requirements.coolingClass.name || 'ONAN',
    conductorMaterial,
    advancedOptions,
    steps
  );

  // Step 4: Calculate required conductor cross-section
  const requiredArea = ratedCurrent / currentDensity;

  // Step 5: Select conductor size
  const { conductorSize, conductorShape } = selectConductorSize(
    side,
    requiredArea,
    ratedCurrent,
    steps
  );

  // Actual current density with selected conductor
  const actualCurrentDensity = ratedCurrent / conductorSize.crossSection;

  // Step 6: Calculate winding geometry
  const {
    layers,
    turnsPerLayer,
    windingHeight,
    windingThickness,
    innerRadius,
    outerRadius,
  } = calculateWindingGeometry(
    side,
    turns,
    conductorSize,
    conductorShape,
    coreDesign,
    requirements,
    steps
  );

  // Step 7: Calculate conductor weight and resistance
  const meanTurnLength = Math.PI * (innerRadius + outerRadius); // mm
  const totalLength = turns * meanTurnLength / 1000; // meters

  const conductorWeight = calculateConductorWeight(
    totalLength,
    conductorSize.crossSection,
    conductorMaterial,
    steps
  );

  const { dcResistance, resistance75C } = calculateResistance(
    side,
    totalLength,
    conductorSize.crossSection,
    conductorMaterial,
    steps
  );

  // Determine insulation class (A = 105°C for oil-immersed)
  const insulationClass = 'A' as const;

  return {
    side,
    turns,
    conductorType: conductorMaterial,
    conductorShape,
    conductorSize,
    currentDensity: Math.round(actualCurrentDensity * 100) / 100,
    ratedCurrent: Math.round(ratedCurrent * 100) / 100,
    windingHeight,
    windingThickness,
    innerRadius,
    outerRadius,
    conductorWeight,
    insulationClass,
    layers,
    turnsPerLayer,
    dcResistance,
    resistance75C,
    meanTurnLength,
  };
}

/**
 * Calculate number of turns.
 */
function calculateTurns(
  side: 'HV' | 'LV',
  voltage: number,
  voltsPerTurn: number,
  steps: CalculationStep[]
): number {
  const turns = Math.round(voltage / voltsPerTurn);

  steps.push({
    id: `${side.toLowerCase()}-turns`,
    title: `${side} Winding Turns`,
    formula: 'N = V / Et',
    inputs: {
      'V': { value: voltage, unit: 'V', description: `${side} rated voltage` },
      'Et': { value: voltsPerTurn, unit: 'V/turn', description: 'Volts per turn' },
    },
    result: { value: turns, unit: 'turns' },
    explanation: `The ${side} winding requires ${turns} turns to produce ${voltage}V at the design flux density. The actual voltage will be ${(turns * voltsPerTurn).toFixed(1)}V.`,
    category: 'winding',
  });

  return turns;
}

/**
 * Calculate rated current.
 */
function calculateRatedCurrent(
  side: 'HV' | 'LV',
  kVA: number,
  voltage: number,
  phases: 1 | 3,
  steps: CalculationStep[]
): number {
  let current: number;
  let formula: string;

  if (phases === 3) {
    // I = S / (√3 × V)
    current = (kVA * 1000) / (Math.sqrt(3) * voltage);
    formula = 'I = S / (√3 × V)';
  } else {
    // I = S / V
    current = (kVA * 1000) / voltage;
    formula = 'I = S / V';
  }

  steps.push({
    id: `${side.toLowerCase()}-current`,
    title: `${side} Rated Current`,
    formula,
    inputs: {
      'S': { value: kVA, unit: 'kVA', description: 'Transformer rating' },
      'V': { value: voltage, unit: 'V', description: `${side} voltage` },
    },
    result: { value: Math.round(current * 100) / 100, unit: 'A' },
    explanation: `For ${phases}-phase power, the line current is ${phases === 3 ? 'S/(√3×V)' : 'S/V'}. This is the continuous rated current the winding must carry.`,
    category: 'winding',
  });

  return current;
}

/**
 * Select appropriate current density.
 */
function selectCurrentDensity(
  side: 'HV' | 'LV',
  coolingClass: string,
  conductorMaterial: ConductorMaterial,
  advancedOptions: AdvancedOptions,
  steps: CalculationStep[]
): number {
  // Use override if provided
  if (advancedOptions.targetCurrentDensity) {
    return advancedOptions.targetCurrentDensity;
  }

  // Base values for copper
  const densityRange = CURRENT_DENSITY_BY_COOLING[coolingClass] || CURRENT_DENSITY_BY_COOLING['ONAN'];
  let currentDensity = densityRange.typical;

  // Aluminum uses 60% of copper current density
  if (conductorMaterial === 'aluminum') {
    currentDensity *= 0.6;
  }

  // LV winding typically runs slightly lower current density due to higher currents
  if (side === 'LV') {
    currentDensity *= 0.95;
  }

  steps.push({
    id: `${side.toLowerCase()}-current-density`,
    title: `${side} Current Density Selection`,
    formula: 'J = Jbase × material_factor × side_factor',
    inputs: {
      'Jbase': { value: densityRange.typical, unit: 'A/mm²', description: `Typical for ${coolingClass}` },
      'material': { value: conductorMaterial === 'aluminum' ? 0.6 : 1.0, unit: '', description: 'Material factor' },
    },
    result: { value: Math.round(currentDensity * 100) / 100, unit: 'A/mm²' },
    explanation: `${coolingClass} cooling allows ${densityRange.min}-${densityRange.max} A/mm² for copper. Selected ${currentDensity.toFixed(2)} A/mm² for ${conductorMaterial} ${side} winding.`,
    category: 'winding',
  });

  return currentDensity;
}

/**
 * Select conductor size based on required area.
 */
function selectConductorSize(
  side: 'HV' | 'LV',
  requiredArea: number,
  current: number,
  steps: CalculationStep[]
): { conductorSize: ConductorSize; conductorShape: 'round' | 'rectangular' | 'CTC' } {
  const recommendedType = recommendConductorType(current);
  let conductorSize: ConductorSize;
  let conductorShape: 'round' | 'rectangular' | 'CTC';

  if (recommendedType === 'round' || requiredArea < 100) {
    // Use round wire (AWG)
    const awgEntry = selectAWGForArea(requiredArea, true);
    if (awgEntry) {
      conductorSize = {
        awg: awgEntry.awg,
        crossSection: awgEntry.area,
      };
      conductorShape = 'round';

      steps.push({
        id: `${side.toLowerCase()}-conductor-size`,
        title: `${side} Conductor Selection`,
        formula: 'A = I / J',
        inputs: {
          'I': { value: current, unit: 'A', description: 'Rated current' },
          'required_area': { value: requiredArea, unit: 'mm²', description: 'Required conductor area' },
        },
        result: { value: awgEntry.area, unit: `mm² (${awgToString(awgEntry.awg)})` },
        explanation: `Selected ${awgToString(awgEntry.awg)} round wire with ${awgEntry.area.toFixed(2)} mm² cross-section. This provides ${((awgEntry.area / requiredArea - 1) * 100).toFixed(0)}% margin over minimum required area.`,
        category: 'winding',
      });
    } else {
      // Fallback
      conductorSize = { crossSection: requiredArea };
      conductorShape = 'round';
    }
  } else {
    // Use rectangular conductor for higher currents
    const rectConductor = selectRectangularConductor(requiredArea);
    if (rectConductor) {
      conductorSize = {
        crossSection: rectConductor.area,
        dimensions: { width: rectConductor.width, height: rectConductor.height },
      };
      conductorShape = 'rectangular';

      steps.push({
        id: `${side.toLowerCase()}-conductor-size`,
        title: `${side} Conductor Selection`,
        formula: 'A = I / J',
        inputs: {
          'I': { value: current, unit: 'A', description: 'Rated current' },
          'required_area': { value: requiredArea, unit: 'mm²', description: 'Required conductor area' },
        },
        result: { value: rectConductor.area, unit: `mm² (${rectConductor.width}×${rectConductor.height}mm)` },
        explanation: `Selected ${rectConductor.width}×${rectConductor.height}mm rectangular conductor with ${rectConductor.area} mm² cross-section. Rectangular conductors provide better space utilization for high-current windings.`,
        category: 'winding',
      });
    } else {
      conductorSize = { crossSection: requiredArea };
      conductorShape = 'rectangular';
    }
  }

  return { conductorSize, conductorShape };
}

/**
 * Calculate winding geometry (layers, dimensions, radii).
 */
function calculateWindingGeometry(
  side: 'HV' | 'LV',
  turns: number,
  conductorSize: ConductorSize,
  conductorShape: 'round' | 'rectangular' | 'CTC',
  coreDesign: CoreDesign,
  requirements: DesignRequirements,
  steps: CalculationStep[]
): {
  layers: number;
  turnsPerLayer: number;
  windingHeight: number;
  windingThickness: number;
  innerRadius: number;
  outerRadius: number;
} {
  // Conductor dimensions
  let conductorWidth: number;
  let conductorHeight: number;

  if (conductorSize.dimensions) {
    conductorWidth = conductorSize.dimensions.width;
    conductorHeight = conductorSize.dimensions.height;
  } else {
    // For round wire, diameter = √(4A/π)
    const diameter = Math.sqrt((4 * conductorSize.crossSection) / Math.PI);
    conductorWidth = diameter;
    conductorHeight = diameter;
  }

  // Add insulation thickness
  const insulation = 0.3; // mm paper insulation per side
  const insulatedWidth = conductorWidth + 2 * insulation;
  const insulatedHeight = conductorHeight + 2 * insulation;

  // Available window height (with clearances)
  const topBottomClearance = 30; // mm clearance at top and bottom
  const availableHeight = coreDesign.windowHeight - 2 * topBottomClearance;

  // Calculate turns per layer and number of layers
  const turnsPerLayer = Math.floor(availableHeight / insulatedHeight);
  const layers = Math.ceil(turns / turnsPerLayer);

  // Winding height
  const windingHeight = turnsPerLayer * insulatedHeight;

  // Winding thickness = number of layers × insulated width + layer insulation
  const layerInsulation = 0.5; // mm between layers
  const windingThickness = layers * insulatedWidth + (layers - 1) * layerInsulation;

  // Calculate radii
  // LV is inner winding, HV is outer winding
  const coreLimbRadius = coreDesign.coreDiameter / 2;
  const coreToWindingClearance = 15; // mm

  let innerRadius: number;
  let outerRadius: number;

  if (side === 'LV') {
    // LV is closest to core
    innerRadius = coreLimbRadius + coreToWindingClearance;
    outerRadius = innerRadius + windingThickness;
  } else {
    // HV is outside LV - will be adjusted when we have LV dimensions
    // For now, estimate based on core size
    const estimatedLvThickness = 30; // mm (will be updated)
    const hvLvGap = 20; // mm main insulation gap

    innerRadius = coreLimbRadius + coreToWindingClearance + estimatedLvThickness + hvLvGap;
    outerRadius = innerRadius + windingThickness;
  }

  steps.push({
    id: `${side.toLowerCase()}-geometry`,
    title: `${side} Winding Geometry`,
    formula: 'layers = ceil(N / turns_per_layer)',
    inputs: {
      'N': { value: turns, unit: 'turns', description: 'Total turns' },
      'conductor': { value: conductorHeight, unit: 'mm', description: 'Conductor height' },
      'available_height': { value: availableHeight, unit: 'mm', description: 'Available winding height' },
    },
    result: { value: layers, unit: 'layers' },
    explanation: `With ${turnsPerLayer} turns per layer and ${turns} total turns, the ${side} winding requires ${layers} layers. Winding height is ${windingHeight.toFixed(0)}mm, thickness is ${windingThickness.toFixed(1)}mm.`,
    category: 'winding',
  });

  return {
    layers,
    turnsPerLayer,
    windingHeight: Math.round(windingHeight),
    windingThickness: Math.round(windingThickness * 10) / 10,
    innerRadius: Math.round(innerRadius),
    outerRadius: Math.round(outerRadius),
  };
}

/**
 * Calculate conductor weight.
 */
function calculateConductorWeight(
  length: number,
  crossSection: number,
  material: ConductorMaterial,
  steps: CalculationStep[]
): number {
  const density = CONDUCTOR_PROPERTIES[material].density; // kg/m³
  // Volume = length (m) × cross-section (mm²) × 10^-6 (mm² to m²)
  const volume = length * crossSection * 1e-6; // m³
  const weight = volume * density; // kg

  return Math.round(weight);
}

/**
 * Calculate winding resistance.
 */
function calculateResistance(
  side: 'HV' | 'LV',
  length: number,
  crossSection: number,
  material: ConductorMaterial,
  steps: CalculationStep[]
): { dcResistance: number; resistance75C: number } {
  const props = CONDUCTOR_PROPERTIES[material];

  // R = ρ × L / A
  // ρ in Ohm·m, L in m, A in m² → convert mm² to m²
  const dcResistance = (props.resistivity * length) / (crossSection * 1e-6);

  // Correct to 75°C reference temperature
  // R75 = R20 × (1 + α × (75 - 20))
  const tempCorrection = 1 + props.tempCoeff * (75 - 20);
  const resistance75C = dcResistance * tempCorrection;

  steps.push({
    id: `${side.toLowerCase()}-resistance`,
    title: `${side} Winding Resistance`,
    formula: 'R = ρ × L / A, R₇₅ = R₂₀ × (1 + α × ΔT)',
    inputs: {
      'L': { value: Math.round(length), unit: 'm', description: 'Total conductor length' },
      'A': { value: crossSection, unit: 'mm²', description: 'Conductor cross-section' },
      'ρ': { value: props.resistivity * 1e8, unit: 'μΩ·cm', description: `${material} resistivity at 20°C` },
    },
    result: { value: Math.round(resistance75C * 1000) / 1000, unit: 'Ω at 75°C' },
    explanation: `DC resistance at 20°C is ${dcResistance.toFixed(4)}Ω. Corrected to 75°C reference temperature (IEEE standard), resistance is ${resistance75C.toFixed(4)}Ω.`,
    category: 'winding',
  });

  return {
    dcResistance: Math.round(dcResistance * 10000) / 10000,
    resistance75C: Math.round(resistance75C * 10000) / 10000,
  };
}

/**
 * Adjust HV winding radii after LV winding is calculated.
 */
export function adjustHVWindingRadii(
  hvWinding: WindingDesign,
  lvWinding: WindingDesign,
  requirements: DesignRequirements
): WindingDesign {
  // Main gap between LV and HV based on BIL
  // Rule of thumb: 0.2-0.25 mm per kV of BIL
  const bilLevel = getBILLevel(requirements.primaryVoltage);
  const mainGap = Math.max(15, bilLevel * INSULATION_CLEARANCES.hvToLvGap);

  const innerRadius = lvWinding.outerRadius + mainGap;
  const outerRadius = innerRadius + hvWinding.windingThickness;

  // Recalculate mean turn length
  const meanTurnLength = Math.PI * (innerRadius + outerRadius);

  return {
    ...hvWinding,
    innerRadius: Math.round(innerRadius),
    outerRadius: Math.round(outerRadius),
    meanTurnLength: Math.round(meanTurnLength),
  };
}

/**
 * Get BIL level for a given voltage class.
 */
function getBILLevel(voltageKV: number): number {
  // Standard BIL levels per IEEE C57.12.00
  if (voltageKV <= 1.2) return 30;
  if (voltageKV <= 2.5) return 45;
  if (voltageKV <= 5) return 60;
  if (voltageKV <= 8.7) return 75;
  if (voltageKV <= 15) return 95;
  if (voltageKV <= 25) return 125;
  if (voltageKV <= 35) return 150;
  if (voltageKV <= 46) return 200;
  if (voltageKV <= 69) return 250;
  return 350;
}
