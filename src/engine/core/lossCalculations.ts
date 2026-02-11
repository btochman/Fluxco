/**
 * Loss Calculations Module
 *
 * Calculates transformer losses including no-load (core) losses,
 * load (copper) losses, and efficiency.
 *
 * Key formulas:
 * - No-load loss: P0 = Wc × Ps × (Bm/1.7)² × Bf
 * - Load loss: Pk = I²R + Peddy + Pstray
 * - Efficiency: η = Pout / (Pout + P0 + Pk×load²)
 */

import type {
  DesignRequirements,
  CoreDesign,
  WindingDesign,
  LossCalculations,
  EfficiencyData,
  CalculationStep,
} from '../types/transformer.types';
import {
  CORE_BUILDING_FACTOR,
  LOAD_LOSS_FACTORS,
} from '../constants/materials';

/**
 * Calculate all transformer losses.
 */
export function calculateLosses(
  requirements: DesignRequirements,
  coreDesign: CoreDesign,
  hvWinding: WindingDesign,
  lvWinding: WindingDesign,
  steps: CalculationStep[]
): LossCalculations {
  // Step 1: Calculate no-load (core) loss
  const noLoadLoss = calculateNoLoadLoss(coreDesign, requirements.frequency, steps);

  // Step 2: Calculate I²R losses
  const { hvI2R, lvI2R, totalI2R } = calculateI2RLosses(hvWinding, lvWinding, steps);

  // Step 3: Calculate eddy and stray losses
  const eddyLoss = totalI2R * LOAD_LOSS_FACTORS.eddyLossFactor;
  const strayLoss = totalI2R * LOAD_LOSS_FACTORS.strayLossFactor;

  steps.push({
    id: 'eddy-stray-losses',
    title: 'Eddy & Stray Losses',
    formula: 'Peddy = I²R × 0.10, Pstray = I²R × 0.05',
    inputs: {
      'I²R': { value: Math.round(totalI2R), unit: 'W', description: 'Total I²R loss' },
      'eddy_factor': { value: LOAD_LOSS_FACTORS.eddyLossFactor, unit: '', description: 'Eddy loss factor' },
      'stray_factor': { value: LOAD_LOSS_FACTORS.strayLossFactor, unit: '', description: 'Stray loss factor' },
    },
    result: { value: Math.round(eddyLoss + strayLoss), unit: 'W' },
    explanation: `Eddy losses in conductors (${Math.round(eddyLoss)}W) are caused by leakage flux cutting through the conductor. Stray losses (${Math.round(strayLoss)}W) occur in structural parts like tank walls and clamps.`,
    category: 'losses',
  });

  // Step 4: Total load loss at 75°C
  const loadLoss = correctLossTo75C(totalI2R + eddyLoss + strayLoss, 20, steps);

  // Step 5: Total losses at rated load
  const totalLoss = noLoadLoss + loadLoss;

  // Step 6: Calculate efficiency curve
  const kVA = requirements.ratedPower;
  const efficiency = calculateEfficiencyCurve(kVA, noLoadLoss, loadLoss, steps);

  // Step 7: Find maximum efficiency point
  const { maxEfficiencyLoad, maxEfficiency } = findMaxEfficiency(noLoadLoss, loadLoss, kVA);

  return {
    noLoadLoss: Math.round(noLoadLoss),
    loadLoss: Math.round(loadLoss),
    totalLoss: Math.round(totalLoss),
    efficiency,
    maxEfficiencyLoad,
    maxEfficiency,
    eddyLoss: Math.round(eddyLoss),
    strayLoss: Math.round(strayLoss),
    i2rLoss: Math.round(totalI2R),
  };
}

/**
 * Calculate no-load (core) loss.
 */
function calculateNoLoadLoss(
  coreDesign: CoreDesign,
  frequency: number,
  steps: CalculationStep[]
): number {
  const { coreWeight, fluxDensity, steelGrade } = coreDesign;

  // Building factor accounts for:
  // - Corner and T-joint losses
  // - Bolt hole losses
  // - Harmonics and non-uniform flux distribution
  const buildingFactor = CORE_BUILDING_FACTOR.typical;

  // Frequency correction factor
  // Core loss ∝ f^1.6 (approximately)
  // Reference is 60Hz
  const frequencyFactor = Math.pow(frequency / 60, 1.6);

  // Flux density correction
  // Specific loss is given at 1.7T
  // Loss ∝ B^2 (approximately, actually B^1.6 to B^2)
  const fluxFactor = Math.pow(fluxDensity / 1.7, 2);

  // Total no-load loss
  // P0 = Wc × Ps × (Bm/1.7)² × Bf × (f/60)^1.6
  const noLoadLoss = coreWeight * steelGrade.specificLoss * fluxFactor * buildingFactor * frequencyFactor;

  steps.push({
    id: 'no-load-loss',
    title: 'No-Load (Core) Loss',
    formula: 'P₀ = Wc × Ps × (Bm/1.7)² × Bf × (f/60)^1.6',
    inputs: {
      'Wc': { value: coreWeight, unit: 'kg', description: 'Core weight' },
      'Ps': { value: steelGrade.specificLoss, unit: 'W/kg', description: `Specific loss for ${steelGrade.name}` },
      'Bm': { value: fluxDensity, unit: 'T', description: 'Operating flux density' },
      'Bf': { value: buildingFactor, unit: '', description: 'Building factor' },
      'f': { value: frequency, unit: 'Hz', description: 'System frequency' },
    },
    result: { value: Math.round(noLoadLoss), unit: 'W' },
    explanation: `No-load loss (also called core loss or iron loss) occurs whenever the transformer is energized, regardless of load. It consists of hysteresis loss and eddy current loss in the core laminations. The building factor of ${buildingFactor} accounts for additional losses at joints and corners.`,
    category: 'losses',
  });

  return noLoadLoss;
}

/**
 * Calculate I²R (resistive) losses in both windings.
 */
function calculateI2RLosses(
  hvWinding: WindingDesign,
  lvWinding: WindingDesign,
  steps: CalculationStep[]
): { hvI2R: number; lvI2R: number; totalI2R: number } {
  // I²R loss for each winding
  const hvI2R = Math.pow(hvWinding.ratedCurrent, 2) * hvWinding.dcResistance;
  const lvI2R = Math.pow(lvWinding.ratedCurrent, 2) * lvWinding.dcResistance;
  const totalI2R = hvI2R + lvI2R;

  steps.push({
    id: 'i2r-losses',
    title: 'I²R (Resistive) Losses',
    formula: 'PI²R = IHV² × RHV + ILV² × RLV',
    inputs: {
      'IHV': { value: hvWinding.ratedCurrent, unit: 'A', description: 'HV rated current' },
      'RHV': { value: hvWinding.dcResistance, unit: 'Ω', description: 'HV winding resistance at 20°C' },
      'ILV': { value: lvWinding.ratedCurrent, unit: 'A', description: 'LV rated current' },
      'RLV': { value: lvWinding.dcResistance, unit: 'Ω', description: 'LV winding resistance at 20°C' },
    },
    result: { value: Math.round(totalI2R), unit: 'W at 20°C' },
    explanation: `HV winding I²R loss: ${Math.round(hvI2R)}W. LV winding I²R loss: ${Math.round(lvI2R)}W. These losses are proportional to the square of the load current, so they vary with loading.`,
    category: 'losses',
  });

  return { hvI2R, lvI2R, totalI2R };
}

/**
 * Correct loss value to 75°C reference temperature.
 */
function correctLossTo75C(
  lossAt20C: number,
  measuredTemp: number,
  steps: CalculationStep[]
): number {
  // For copper: R75/R20 = (234.5 + 75)/(234.5 + 20) = 1.215
  // For aluminum: R75/R20 = (225 + 75)/(225 + 20) = 1.224
  // Using copper correction factor

  const T1 = measuredTemp;
  const T2 = 75;
  const Tk = 234.5; // Temperature constant for copper

  const correctionFactor = (Tk + T2) / (Tk + T1);
  const lossAt75C = lossAt20C * correctionFactor;

  steps.push({
    id: 'loss-correction',
    title: 'Temperature Correction to 75°C',
    formula: 'P₇₅ = P₂₀ × (234.5 + 75)/(234.5 + 20)',
    inputs: {
      'P₂₀': { value: Math.round(lossAt20C), unit: 'W', description: 'Loss at 20°C' },
      'correction': { value: Math.round(correctionFactor * 1000) / 1000, unit: '', description: 'Correction factor' },
    },
    result: { value: Math.round(lossAt75C), unit: 'W at 75°C' },
    explanation: `IEEE standards require load losses to be reported at 75°C reference temperature. The correction factor of ${correctionFactor.toFixed(3)} accounts for the increase in resistance as temperature rises.`,
    category: 'losses',
  });

  return lossAt75C;
}

/**
 * Calculate efficiency at various load points.
 */
function calculateEfficiencyCurve(
  kVA: number,
  noLoadLoss: number,
  loadLoss: number,
  steps: CalculationStep[]
): EfficiencyData[] {
  const loadPoints = [0.25, 0.50, 0.75, 1.00, 1.10, 1.25];
  const powerFactor = 1.0; // Unity power factor for calculation

  const efficiencyData: EfficiencyData[] = loadPoints.map(load => {
    // Output power in Watts
    const outputPower = kVA * 1000 * powerFactor * load;

    // Total losses at this load
    // No-load loss is constant, load loss varies with load²
    const losses = noLoadLoss + loadLoss * Math.pow(load, 2);

    // Input power
    const inputPower = outputPower + losses;

    // Efficiency
    const efficiency = (outputPower / inputPower) * 100;

    return {
      loadPercent: load * 100,
      efficiency: Math.round(efficiency * 100) / 100,
      losses: Math.round(losses),
      outputPower: Math.round(outputPower),
    };
  });

  steps.push({
    id: 'efficiency-curve',
    title: 'Efficiency vs Load',
    formula: 'η = Pout / (Pout + P₀ + Pk × load²)',
    inputs: {
      'P₀': { value: Math.round(noLoadLoss), unit: 'W', description: 'No-load loss' },
      'Pk': { value: Math.round(loadLoss), unit: 'W', description: 'Load loss at 100%' },
      'kVA': { value: kVA, unit: 'kVA', description: 'Rated power' },
    },
    result: { value: efficiencyData.find(d => d.loadPercent === 100)?.efficiency || 0, unit: '% at 100% load' },
    explanation: `Efficiency varies with load because no-load loss is constant while load loss varies with the square of the load. Maximum efficiency occurs when no-load loss equals load loss.`,
    category: 'losses',
  });

  return efficiencyData;
}

/**
 * Find the load point for maximum efficiency.
 */
function findMaxEfficiency(
  noLoadLoss: number,
  loadLoss: number,
  kVA: number
): { maxEfficiencyLoad: number; maxEfficiency: number } {
  // Maximum efficiency occurs when P0 = Pk × load²
  // Therefore: load = √(P0/Pk)
  const maxEfficiencyLoad = Math.sqrt(noLoadLoss / loadLoss);

  // At max efficiency load, total losses = 2 × P0
  // η = output / (output + losses) = (k × S) / (k × S + 2 × P0)
  const outputAtMaxEff = maxEfficiencyLoad * kVA * 1000; // watts
  const lossesAtMaxEff = 2 * noLoadLoss;
  const maxEfficiency = (outputAtMaxEff / (outputAtMaxEff + lossesAtMaxEff)) * 100;

  return {
    maxEfficiencyLoad: Math.round(maxEfficiencyLoad * 100), // as percentage
    maxEfficiency: Math.round(maxEfficiency * 100) / 100,
  };
}

/**
 * Calculate loss ratio (no-load/load).
 */
export function calculateLossRatio(noLoadLoss: number, loadLoss: number): number {
  return noLoadLoss / loadLoss;
}

/**
 * Calculate annual energy losses.
 */
export function calculateAnnualLosses(
  noLoadLoss: number,
  loadLoss: number,
  loadFactor: number = 0.5, // Average load as fraction of rated
  hoursPerYear: number = 8760
): { energyLoss: number; costAt10cents: number } {
  // No-load loss is continuous
  const noLoadEnergy = (noLoadLoss / 1000) * hoursPerYear; // kWh

  // Load loss weighted by load factor squared (for varying load)
  // Using loss factor ≈ 0.3 × LF + 0.7 × LF² for typical load profile
  const lossFactor = 0.3 * loadFactor + 0.7 * Math.pow(loadFactor, 2);
  const loadEnergy = (loadLoss / 1000) * hoursPerYear * lossFactor; // kWh

  const totalEnergy = noLoadEnergy + loadEnergy;
  const costAt10cents = totalEnergy * 0.10;

  return {
    energyLoss: Math.round(totalEnergy),
    costAt10cents: Math.round(costAt10cents),
  };
}
