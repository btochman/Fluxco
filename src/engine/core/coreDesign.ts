/**
 * Core Design Module
 *
 * Calculates transformer core dimensions, flux density, and weight.
 *
 * Key formulas:
 * - Volts per turn: Et = K × √(kVA), where K ≈ 0.45-0.55
 * - EMF equation: E = 4.44 × f × N × Bm × Ac
 * - Core area: Ac = Et / (4.44 × f × Bm)
 */

import type {
  DesignRequirements,
  AdvancedOptions,
  CoreDesign,
  CoreStepDimension,
  SteelGrade,
  CalculationStep,
} from '../types/transformer.types';
import {
  STEEL_GRADES_MAP,
  CORE_STEP_UTILIZATION,
  VOLTS_PER_TURN_CONSTANT,
} from '../constants/materials';

/**
 * Calculate complete core design.
 */
export function calculateCoreDesign(
  requirements: DesignRequirements,
  advancedOptions: AdvancedOptions,
  steps: CalculationStep[]
): CoreDesign {
  // ratedPower is already in kVA (e.g., 1500 for 1.5 MVA)
  const kVA = requirements.ratedPower;
  const steelGrade = STEEL_GRADES_MAP[advancedOptions.steelGrade] || STEEL_GRADES_MAP['M4'];

  // Step 1: Calculate volts per turn
  const voltsPerTurn = calculateVoltsPerTurn(kVA, steps);

  // Step 2: Determine flux density
  const fluxDensity = selectFluxDensity(steelGrade, requirements, advancedOptions, steps);

  // Step 3: Calculate net core cross-section
  const netCrossSection = calculateNetCrossSection(
    voltsPerTurn,
    requirements.frequency,
    fluxDensity,
    steps
  );

  // Step 4: Calculate gross cross-section
  const stackingFactor = steelGrade.stackingFactor;
  const grossCrossSection = netCrossSection / stackingFactor;

  steps.push({
    id: 'core-gross-area',
    title: 'Gross Core Cross-Section',
    formula: 'Ac_gross = Ac_net / Ks',
    inputs: {
      'Ac_net': { value: netCrossSection, unit: 'cm²', description: 'Net core area' },
      'Ks': { value: stackingFactor, unit: '', description: 'Stacking factor' },
    },
    result: { value: grossCrossSection, unit: 'cm²' },
    explanation: `Gross area accounts for the stacking factor (${(stackingFactor * 100).toFixed(0)}%) which represents the actual steel content versus air gaps between laminations.`,
    category: 'core',
  });

  // Step 5: Calculate core diameter and steps
  const coreSteps = calculateOptimalCoreSteps(grossCrossSection);
  const utilizationFactor = (CORE_STEP_UTILIZATION as Record<number, number>)[coreSteps] || 0.90;
  const coreDiameter = calculateCoreDiameter(grossCrossSection, utilizationFactor, steps);

  // Step 6: Calculate step dimensions
  const stepDimensions = calculateStepDimensions(coreDiameter, coreSteps, grossCrossSection);

  // Step 7: Calculate window dimensions
  const { windowWidth, windowHeight, limbHeight, yokeHeight } = calculateWindowDimensions(
    requirements,
    voltsPerTurn,
    coreDiameter,
    netCrossSection,
    steps
  );

  // Step 8: Calculate core weight
  const coreWeight = calculateCoreWeight(
    netCrossSection,
    limbHeight,
    yokeHeight,
    windowWidth,
    requirements.phases,
    steelGrade,
    steps
  );

  return {
    type: 'core',
    steelGrade,
    fluxDensity,
    grossCrossSection,
    netCrossSection,
    stackingFactor,
    coreWeight,
    coreDiameter,
    limbHeight,
    yokeHeight,
    windowWidth,
    windowHeight,
    coreSteps,
    voltsPerTurn,
    stepDimensions,
  };
}

/**
 * Calculate optimal volts per turn using empirical formula.
 */
function calculateVoltsPerTurn(kVA: number, steps: CalculationStep[]): number {
  // Select K based on power level
  let K: number;
  let sizeClass: string;

  if (kVA < 500) {
    K = VOLTS_PER_TURN_CONSTANT.distribution.typical;
    sizeClass = 'distribution';
  } else if (kVA <= 5000) {
    K = VOLTS_PER_TURN_CONSTANT.mediumPower.typical;
    sizeClass = 'medium power';
  } else {
    K = VOLTS_PER_TURN_CONSTANT.largePower.typical;
    sizeClass = 'large power';
  }

  const voltsPerTurn = K * Math.sqrt(kVA);

  steps.push({
    id: 'volts-per-turn',
    title: 'Volts Per Turn (Et)',
    formula: 'Et = K × √(kVA)',
    inputs: {
      'K': { value: K, unit: '', description: `Design constant for ${sizeClass} transformers` },
      'kVA': { value: kVA, unit: 'kVA', description: 'Transformer power rating' },
    },
    result: { value: Math.round(voltsPerTurn * 100) / 100, unit: 'V/turn' },
    explanation: `The volts-per-turn is an empirical starting point that balances core size against winding turns. For ${sizeClass} transformers, K typically ranges from ${K - 0.05} to ${K + 0.05}. Higher K means fewer turns but larger core; lower K means more turns but smaller core.`,
    category: 'core',
  });

  return voltsPerTurn;
}

/**
 * Select operating flux density based on steel grade and conditions.
 */
function selectFluxDensity(
  steelGrade: SteelGrade,
  requirements: DesignRequirements,
  advancedOptions: AdvancedOptions,
  steps: CalculationStep[]
): number {
  // Use override if provided
  if (advancedOptions.targetFluxDensity) {
    return advancedOptions.targetFluxDensity;
  }

  // Start with 95% of max rated flux density for the steel grade
  let fluxDensity = steelGrade.maxFluxDensity * 0.95;

  // Altitude derating: reduce 1% per 1000m above 1000m
  const altitude = requirements.altitude || 0;
  let altitudeDerating = 0;
  if (altitude > 1000) {
    altitudeDerating = (altitude - 1000) / 100000;
    fluxDensity *= (1 - altitudeDerating);
  }

  // Frequency adjustment (core loss is proportional to f^1.6 to f^2)
  if (requirements.frequency === 50) {
    fluxDensity *= 1.02; // Can use slightly higher Bm at 50Hz
  }

  // Round to 2 decimal places
  fluxDensity = Math.round(fluxDensity * 100) / 100;

  steps.push({
    id: 'flux-density',
    title: 'Operating Flux Density (Bm)',
    formula: 'Bm = Bmax × 0.95 × (1 - altitude_derating)',
    inputs: {
      'Bmax': { value: steelGrade.maxFluxDensity, unit: 'T', description: `Max for ${steelGrade.name}` },
      'altitude': { value: altitude, unit: 'm', description: 'Installation altitude' },
    },
    result: { value: fluxDensity, unit: 'Tesla' },
    explanation: `Selected ${steelGrade.name} steel. Operating at ${((fluxDensity / steelGrade.maxFluxDensity) * 100).toFixed(0)}% of maximum rated flux density to provide margin for transient overvoltages and reduce core heating.${altitudeDerating > 0 ? ` Includes ${(altitudeDerating * 100).toFixed(1)}% derating for high altitude.` : ''}`,
    category: 'core',
  });

  return fluxDensity;
}

/**
 * Calculate net core cross-section from the EMF equation.
 */
function calculateNetCrossSection(
  voltsPerTurn: number,
  frequency: number,
  fluxDensity: number,
  steps: CalculationStep[]
): number {
  // From E = 4.44 × f × N × Bm × Ac
  // For 1 turn: Et = 4.44 × f × Bm × Ac
  // Therefore: Ac = Et / (4.44 × f × Bm)
  // Converting to cm²: multiply by 10^4

  const netCrossSection = (voltsPerTurn * 10000) / (4.44 * frequency * fluxDensity);

  steps.push({
    id: 'core-net-area',
    title: 'Net Core Cross-Section',
    formula: 'Ac = Et × 10⁴ / (4.44 × f × Bm)',
    inputs: {
      'Et': { value: voltsPerTurn, unit: 'V/turn', description: 'Volts per turn' },
      'f': { value: frequency, unit: 'Hz', description: 'System frequency' },
      'Bm': { value: fluxDensity, unit: 'T', description: 'Flux density' },
    },
    result: { value: Math.round(netCrossSection * 10) / 10, unit: 'cm²' },
    explanation: `This is the effective magnetic cross-section needed to carry the required flux. The factor 4.44 comes from the form factor of a sinusoidal waveform (= π/√2 × √2 = π×√2/2 ≈ 4.44).`,
    category: 'core',
  });

  return netCrossSection;
}

/**
 * Determine optimal number of core steps based on gross area.
 */
function calculateOptimalCoreSteps(grossCrossSection: number): number {
  // Rule of thumb: more steps for larger cores
  // Small cores (< 200 cm²): 3-5 steps
  // Medium cores (200-500 cm²): 5-7 steps
  // Large cores (> 500 cm²): 7-11 steps

  if (grossCrossSection < 100) return 3;
  if (grossCrossSection < 200) return 5;
  if (grossCrossSection < 400) return 7;
  if (grossCrossSection < 700) return 9;
  return 11;
}

/**
 * Calculate core diameter for stepped circular core.
 */
function calculateCoreDiameter(
  grossCrossSection: number,
  utilizationFactor: number,
  steps: CalculationStep[]
): number {
  // For a stepped core inscribed in a circle:
  // Gross Area = π × (d/2)² × utilization_factor
  // d = 2 × √(Gross Area / (π × utilization_factor))

  const coreDiameter = 2 * Math.sqrt(grossCrossSection / (Math.PI * utilizationFactor)) * 10; // Convert to mm

  steps.push({
    id: 'core-diameter',
    title: 'Core Diameter',
    formula: 'd = 2 × √(Ac_gross / (π × Ku)) × 10',
    inputs: {
      'Ac_gross': { value: grossCrossSection, unit: 'cm²', description: 'Gross core area' },
      'Ku': { value: utilizationFactor, unit: '', description: 'Core utilization factor' },
    },
    result: { value: Math.round(coreDiameter), unit: 'mm' },
    explanation: `A stepped circular core fills about ${(utilizationFactor * 100).toFixed(1)}% of the circumscribed circle. The calculated diameter is the circle that would contain all the core steps.`,
    category: 'core',
  });

  return Math.round(coreDiameter);
}

/**
 * Calculate dimensions of each step in a stepped core.
 */
function calculateStepDimensions(
  coreDiameter: number,
  numSteps: number,
  grossArea: number
): CoreStepDimension[] {
  const steps: CoreStepDimension[] = [];
  const radius = coreDiameter / 2;

  // Calculate step widths based on inscribed rectangles
  for (let i = 0; i < numSteps; i++) {
    const step = i + 1;

    // Each step is positioned at a fraction of the radius
    // The width decreases as we move toward the outside
    const fraction = (numSteps - i) / numSteps;
    const y = radius * Math.sqrt(1 - fraction * fraction);
    const width = 2 * y;

    // Height is proportional to gross area divided by total width sum
    // This is simplified; real designs use specific lamination widths
    const height = (grossArea / (numSteps * 2)) / (width / 10) * 10;

    steps.push({
      step,
      width: Math.round(width),
      height: Math.round(height),
    });
  }

  return steps;
}

/**
 * Calculate core window dimensions.
 */
function calculateWindowDimensions(
  requirements: DesignRequirements,
  voltsPerTurn: number,
  coreDiameter: number,
  netCrossSection: number,
  steps: CalculationStep[]
): { windowWidth: number; windowHeight: number; limbHeight: number; yokeHeight: number } {
  const kVA = requirements.ratedPower;

  // Window height is typically 2.5 to 3.5 times the core diameter
  // Higher ratio for larger transformers
  let hwRatio = 2.5 + (Math.log10(kVA) - 2) * 0.3;
  hwRatio = Math.max(2.5, Math.min(3.5, hwRatio));

  const windowHeight = coreDiameter * hwRatio;

  // Window width needs to accommodate both windings plus clearances
  // Rough estimate: 0.4 to 0.6 times core diameter per winding side
  const windowWidth = coreDiameter * 1.2;

  // Limb height = window height
  const limbHeight = windowHeight;

  // Yoke height approximately equals the step width of the core
  // Or can be derived from core area requirements
  const yokeHeight = Math.sqrt(netCrossSection) * 10 * 1.1;

  steps.push({
    id: 'window-dimensions',
    title: 'Core Window Dimensions',
    formula: 'Hw = d × ratio, Ww = d × 1.2',
    inputs: {
      'd': { value: coreDiameter, unit: 'mm', description: 'Core diameter' },
      'ratio': { value: hwRatio, unit: '', description: 'Height/diameter ratio' },
    },
    result: { value: Math.round(windowHeight), unit: 'mm (height)' },
    explanation: `The core window must be sized to accommodate both LV and HV windings with proper clearances. Window height/diameter ratio of ${hwRatio.toFixed(2)} is typical for ${kVA} kVA transformers.`,
    category: 'core',
  });

  return {
    windowWidth: Math.round(windowWidth),
    windowHeight: Math.round(windowHeight),
    limbHeight: Math.round(limbHeight),
    yokeHeight: Math.round(yokeHeight),
  };
}

/**
 * Calculate total core weight.
 */
function calculateCoreWeight(
  netCrossSection: number,
  limbHeight: number,
  yokeHeight: number,
  windowWidth: number,
  phases: 1 | 3,
  steelGrade: SteelGrade,
  steps: CalculationStep[]
): number {
  // Core consists of limbs (vertical) and yokes (horizontal)
  // For 3-phase: 3 limbs, 2 yokes
  // For 1-phase: 2 limbs, 2 yokes

  const numLimbs = phases === 3 ? 3 : 2;
  const numYokes = 2;

  // Limb volume = netCrossSection × limbHeight
  const limbVolume = netCrossSection * (limbHeight / 10) * numLimbs; // cm³

  // Yoke length = (number of windows × window width) + (number of limbs × core width)
  // Simplified: yoke length ≈ 2 × window width + 2 × √(netCrossSection) for single phase
  //             yoke length ≈ 2 × window width + 3 × √(netCrossSection) for 3-phase
  const coreWidth = Math.sqrt(netCrossSection) * 10; // mm
  const yokeLength = phases === 3
    ? 2 * windowWidth + 3 * coreWidth
    : 2 * windowWidth + 2 * coreWidth;

  // Yoke cross-section is typically same as limb
  const yokeVolume = netCrossSection * (yokeLength / 10) * numYokes / 10; // cm³ (length in mm)

  // Total volume
  const totalVolume = limbVolume + yokeVolume;

  // Weight = volume × density
  // Density in kg/m³, volume in cm³, so divide by 1000
  const coreWeight = totalVolume * steelGrade.density / 1000000;

  steps.push({
    id: 'core-weight',
    title: 'Core Weight',
    formula: 'Wc = (Vlimbs + Vyokes) × ρ',
    inputs: {
      'Vlimbs': { value: Math.round(limbVolume), unit: 'cm³', description: 'Total limb volume' },
      'Vyokes': { value: Math.round(yokeVolume), unit: 'cm³', description: 'Total yoke volume' },
      'ρ': { value: steelGrade.density, unit: 'kg/m³', description: 'Steel density' },
    },
    result: { value: Math.round(coreWeight), unit: 'kg' },
    explanation: `Core consists of ${numLimbs} limbs and ${numYokes} yokes. The ${steelGrade.name} steel has a density of ${steelGrade.density} kg/m³.`,
    category: 'core',
  });

  return Math.round(coreWeight);
}
