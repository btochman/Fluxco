/**
 * Impedance Calculation Module
 *
 * Calculates transformer impedance from geometry and losses.
 *
 * Key formulas:
 * - %R = Pk / (10 × kVA)
 * - %X = (2π × f × μ₀ × N² × Lmt × ATD) / (Hw × Zbase) × 100
 * - %Z = √(%R² + %X²)
 */

import type {
  DesignRequirements,
  WindingDesign,
  LossCalculations,
  ImpedanceCalculation,
  CalculationStep,
} from '../types/transformer.types';

/**
 * Calculate transformer impedance.
 */
export function calculateImpedance(
  requirements: DesignRequirements,
  hvWinding: WindingDesign,
  lvWinding: WindingDesign,
  losses: LossCalculations,
  steps: CalculationStep[]
): ImpedanceCalculation {
  const kVA = requirements.ratedPower;
  const frequency = requirements.frequency;

  // Step 1: Calculate percent resistance from load losses
  const percentR = calculatePercentR(kVA, losses.loadLoss, steps);

  // Step 2: Calculate percent reactance from geometry
  const percentX = calculatePercentX(
    requirements,
    hvWinding,
    lvWinding,
    steps
  );

  // Step 3: Calculate total impedance
  const percentZ = Math.sqrt(Math.pow(percentR, 2) + Math.pow(percentX, 2));

  steps.push({
    id: 'percent-z',
    title: 'Total Percent Impedance',
    formula: '%Z = √(%R² + %X²)',
    inputs: {
      '%R': { value: percentR, unit: '%', description: 'Percent resistance' },
      '%X': { value: percentX, unit: '%', description: 'Percent reactance' },
    },
    result: { value: Math.round(percentZ * 100) / 100, unit: '%' },
    explanation: `The impedance triangle shows how resistance and reactance combine to form total impedance. Since transformers are primarily reactive (X >> R), %Z ≈ %X for most power transformers.`,
    category: 'impedance',
  });

  // Step 4: Calculate X/R ratio
  const xrRatio = percentX / percentR;

  // Step 5: Calculate voltage regulation
  const { regulationAtUnityPF, regulationAt08PF } = calculateVoltageRegulation(
    percentR,
    percentX,
    steps
  );

  // Step 6: Calculate short circuit current
  const shortCircuitPU = 1 / (percentZ / 100);

  steps.push({
    id: 'short-circuit',
    title: 'Short Circuit Current',
    formula: 'Isc(pu) = 1 / (%Z/100)',
    inputs: {
      '%Z': { value: percentZ, unit: '%', description: 'Percent impedance' },
    },
    result: { value: Math.round(shortCircuitPU * 100) / 100, unit: 'p.u.' },
    explanation: `At ${percentZ.toFixed(2)}% impedance, a bolted fault would result in ${shortCircuitPU.toFixed(1)} times rated current. This is important for equipment ratings and protection coordination.`,
    category: 'impedance',
  });

  return {
    percentZ: Math.round(percentZ * 100) / 100,
    percentR: Math.round(percentR * 100) / 100,
    percentX: Math.round(percentX * 100) / 100,
    xrRatio: Math.round(xrRatio * 10) / 10,
    regulationAtUnityPF: Math.round(regulationAtUnityPF * 100) / 100,
    regulationAt08PF: Math.round(regulationAt08PF * 100) / 100,
    shortCircuitPU: Math.round(shortCircuitPU * 100) / 100,
  };
}

/**
 * Calculate percent resistance from load losses.
 */
function calculatePercentR(
  kVA: number,
  loadLoss: number,
  steps: CalculationStep[]
): number {
  // %R = Pk(W) / (10 × kVA)
  const percentR = loadLoss / (10 * kVA);

  steps.push({
    id: 'percent-r',
    title: 'Percent Resistance',
    formula: '%R = Pk / (10 × kVA)',
    inputs: {
      'Pk': { value: Math.round(loadLoss), unit: 'W', description: 'Load loss at 75°C' },
      'kVA': { value: kVA, unit: 'kVA', description: 'Rated power' },
    },
    result: { value: Math.round(percentR * 100) / 100, unit: '%' },
    explanation: `Percent resistance represents the voltage drop due to resistive losses in the windings. It's directly proportional to load losses. For a ${kVA} kVA transformer with ${loadLoss}W load loss, %R = ${percentR.toFixed(2)}%.`,
    category: 'impedance',
  });

  return percentR;
}

/**
 * Calculate percent reactance from winding geometry.
 *
 * Uses the ampere-turn-distance method:
 * %X = (2π × f × μ₀ × N² × Lmt × ATD) / (Hw × Zbase) × 100
 *
 * Where ATD = (a/3 + b + c/3) is the ampere-turn-distance
 * a = LV winding thickness
 * b = main gap between LV and HV
 * c = HV winding thickness
 */
function calculatePercentX(
  requirements: DesignRequirements,
  hvWinding: WindingDesign,
  lvWinding: WindingDesign,
  steps: CalculationStep[]
): number {
  const kVA = requirements.ratedPower;
  const frequency = requirements.frequency;

  // Winding thicknesses
  const a = lvWinding.windingThickness; // LV thickness in mm
  const c = hvWinding.windingThickness; // HV thickness in mm

  // Main gap between windings
  const b = hvWinding.innerRadius - lvWinding.outerRadius; // mm

  // Ampere-turn-distance (mm)
  // The factor 1/3 for winding thicknesses accounts for the triangular
  // distribution of leakage flux within the winding
  const ATD = a / 3 + b + c / 3;

  // Mean diameter of the leakage flux path
  const meanDiameter = (lvWinding.innerRadius + hvWinding.outerRadius); // mm
  const Lmt = Math.PI * meanDiameter; // Mean turn length in mm

  // Effective height of windings (use smaller of the two)
  const Hw = Math.min(hvWinding.windingHeight, lvWinding.windingHeight); // mm

  // Number of turns (can use either winding, using HV)
  const N = hvWinding.turns;

  // Base impedance
  // Zbase = V² / S where V is in volts and S is in VA
  const Zbase = Math.pow(requirements.primaryVoltage, 2) / (kVA * 1000);

  // Permeability of free space
  const mu0 = 4 * Math.PI * 1e-7; // H/m

  // Calculate reactance
  // X = (2π × f × μ₀ × N² × Lmt × ATD) / Hw
  // All dimensions in meters
  const LmtM = Lmt / 1000;    // m
  const ATDM = ATD / 1000;    // m
  const HwM = Hw / 1000;      // m

  const X = (2 * Math.PI * frequency * mu0 * Math.pow(N, 2) * LmtM * ATDM) / HwM;

  // Convert to percent
  const percentX = (X / Zbase) * 100;

  steps.push({
    id: 'percent-x',
    title: 'Percent Reactance (Geometric Method)',
    formula: '%X = (2π × f × μ₀ × N² × Lmt × ATD) / (Hw × Zbase) × 100',
    inputs: {
      'f': { value: frequency, unit: 'Hz', description: 'Frequency' },
      'N': { value: N, unit: 'turns', description: 'HV turns' },
      'Lmt': { value: Math.round(Lmt), unit: 'mm', description: 'Mean turn length' },
      'ATD': { value: Math.round(ATD * 10) / 10, unit: 'mm', description: 'Ampere-turn-distance (a/3 + b + c/3)' },
      'Hw': { value: Hw, unit: 'mm', description: 'Winding height' },
      'Zbase': { value: Math.round(Zbase * 100) / 100, unit: 'Ω', description: 'Base impedance' },
    },
    result: { value: Math.round(percentX * 100) / 100, unit: '%' },
    explanation: `Reactance is determined by the geometry of the windings. The ampere-turn-distance method accounts for: LV thickness (${a.toFixed(1)}mm)/3 + main gap (${b.toFixed(1)}mm) + HV thickness (${c.toFixed(1)}mm)/3 = ${ATD.toFixed(1)}mm. The 1/3 factors account for the non-uniform leakage flux distribution within the windings.`,
    category: 'impedance',
  });

  return percentX;
}

/**
 * Calculate voltage regulation.
 */
function calculateVoltageRegulation(
  percentR: number,
  percentX: number,
  steps: CalculationStep[]
): { regulationAtUnityPF: number; regulationAt08PF: number } {
  // At unity power factor (cos φ = 1, sin φ = 0):
  // VR ≈ %R
  const regulationAtUnityPF = percentR;

  // At 0.8 lagging power factor (cos φ = 0.8, sin φ = 0.6):
  // VR ≈ %R × cos φ + %X × sin φ + (%X × cos φ - %R × sin φ)² / 200
  const cosφ = 0.8;
  const sinφ = 0.6;

  const term1 = percentR * cosφ;
  const term2 = percentX * sinφ;
  const term3 = Math.pow(percentX * cosφ - percentR * sinφ, 2) / 200;

  const regulationAt08PF = term1 + term2 + term3;

  steps.push({
    id: 'voltage-regulation',
    title: 'Voltage Regulation',
    formula: 'VR = %R×cosφ + %X×sinφ + (%X×cosφ - %R×sinφ)²/200',
    inputs: {
      '%R': { value: percentR, unit: '%', description: 'Percent resistance' },
      '%X': { value: percentX, unit: '%', description: 'Percent reactance' },
      'cosφ': { value: 0.8, unit: '', description: 'Power factor' },
    },
    result: { value: Math.round(regulationAt08PF * 100) / 100, unit: '% at 0.8 PF lag' },
    explanation: `Voltage regulation is the percentage drop in secondary voltage from no-load to full load. At unity PF: ${regulationAtUnityPF.toFixed(2)}%. At 0.8 PF lagging: ${regulationAt08PF.toFixed(2)}%. Higher impedance means more voltage drop under load.`,
    category: 'impedance',
  });

  return { regulationAtUnityPF, regulationAt08PF };
}

/**
 * Calculate impedance adjustment for a different tap position.
 */
export function calculateImpedanceAtTap(
  baseImpedance: ImpedanceCalculation,
  tapPercent: number  // e.g., +5 for +5% tap
): ImpedanceCalculation {
  // Impedance varies with tap position
  // At higher voltage tap, impedance increases (more turns)
  // Approximately: %Z(tap) = %Z(nom) × (1 + tap/100)²

  const tapFactor = Math.pow(1 + tapPercent / 100, 2);

  return {
    percentZ: baseImpedance.percentZ * tapFactor,
    percentR: baseImpedance.percentR * tapFactor,
    percentX: baseImpedance.percentX * tapFactor,
    xrRatio: baseImpedance.xrRatio, // Ratio stays the same
    regulationAtUnityPF: baseImpedance.regulationAtUnityPF * tapFactor,
    regulationAt08PF: baseImpedance.regulationAt08PF * tapFactor,
    shortCircuitPU: baseImpedance.shortCircuitPU / tapFactor,
  };
}

/**
 * Check if calculated impedance meets target.
 */
export function checkImpedanceTarget(
  calculated: number,
  target: number,
  tolerance: number = 0.5
): { meets: boolean; deviation: number } {
  const deviation = calculated - target;
  const meets = Math.abs(deviation) <= tolerance;

  return { meets, deviation };
}
