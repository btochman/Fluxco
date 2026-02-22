/**
 * Thermal Design Module
 *
 * Calculates transformer cooling requirements including oil volume,
 * temperature rise, and radiator sizing.
 *
 * Key formulas:
 * - Oil volume: V = K × √(kVA)
 * - Top oil rise: ΔT_oil = (Pt / (h × A))^0.8
 * - Hot spot: T_hs = T_ambient + ΔT_oil + 1.1×ΔT_wg + H
 */

import type {
  DesignRequirements,
  CoreDesign,
  WindingDesign,
  LossCalculations,
  ThermalDesign,
  CalculationStep,
} from '../types/transformer.types';
import {
  THERMAL_CONSTANTS,
  TRANSFORMER_OIL,
  RADIATOR_SIZES,
} from '../constants/materials';

/**
 * Calculate thermal design parameters.
 */
export function calculateThermalDesign(
  requirements: DesignRequirements,
  _coreDesign: CoreDesign,
  hvWinding: WindingDesign,
  lvWinding: WindingDesign,
  losses: LossCalculations,
  steps: CalculationStep[]
): ThermalDesign {
  const kVA = requirements.ratedPower;
  const coolingClass = requirements.coolingClass.name || 'ONAN';
  const targetTempRise = requirements.temperatureRise || 65;

  // Step 1: Estimate oil volume
  const { oilVolume, oilWeight } = calculateOilVolume(kVA, coolingClass, steps);

  // Step 2: Calculate required heat dissipation
  const totalLosses = losses.noLoadLoss + losses.loadLoss;

  // Step 3: Calculate radiator requirements
  const { radiatorArea, numberOfRadiators, numberOfFans } = calculateRadiatorRequirements(
    totalLosses,
    targetTempRise,
    coolingClass,
    steps
  );

  // Step 4: Calculate temperature rises
  const { topOilRise, averageWindingRise, hotSpotRise } = calculateTemperatureRises(
    totalLosses,
    losses.loadLoss,
    radiatorArea,
    hvWinding,
    lvWinding,
    coolingClass,
    steps
  );

  return {
    oilVolume: Math.round(oilVolume),
    oilWeight: Math.round(oilWeight),
    topOilRise: Math.round(topOilRise * 10) / 10,
    averageWindingRise: Math.round(averageWindingRise * 10) / 10,
    hotSpotRise: Math.round(hotSpotRise * 10) / 10,
    radiatorArea: Math.round(radiatorArea * 10) / 10,
    numberOfRadiators,
    numberOfFans,
  };
}

/**
 * Calculate oil volume using empirical formula.
 */
function calculateOilVolume(
  kVA: number,
  coolingClass: string,
  steps: CalculationStep[]
): { oilVolume: number; oilWeight: number } {
  // Empirical formula: V = K × kVA^0.75 (power-law scaling matches industry data)
  const K = THERMAL_CONSTANTS.oilVolumeConstant[coolingClass as keyof typeof THERMAL_CONSTANTS.oilVolumeConstant]
    || THERMAL_CONSTANTS.oilVolumeConstant['ONAN'];

  const oilVolume = K * Math.pow(kVA, 0.75);
  const oilWeight = oilVolume * TRANSFORMER_OIL.density;

  steps.push({
    id: 'oil-volume',
    title: 'Oil Volume',
    formula: 'V = K × kVA^0.75',
    inputs: {
      'K': { value: K, unit: '', description: `Oil volume constant for ${coolingClass}` },
      'kVA': { value: kVA, unit: 'kVA', description: 'Transformer rating' },
    },
    result: { value: Math.round(oilVolume), unit: 'liters' },
    explanation: `Oil serves dual purposes: electrical insulation and heat transfer. The power-law scaling (kVA^0.75) matches industry data for oil-filled transformers. Total oil weight: ${Math.round(oilWeight)} kg.`,
    category: 'thermal',
  });

  return { oilVolume, oilWeight };
}

/**
 * Calculate radiator requirements.
 */
function calculateRadiatorRequirements(
  totalLosses: number,
  targetTempRise: number,
  coolingClass: string,
  steps: CalculationStep[]
): { radiatorArea: number; numberOfRadiators: number; numberOfFans: number } {
  // Heat transfer coefficient depends on cooling method
  // ONAN: ~8 W/(m²·K), ONAF: ~12-15 W/(m²·K)
  const hasForceAir = coolingClass.includes('ONAF');
  const hCoeff = hasForceAir
    ? THERMAL_CONSTANTS.tankToAirForced
    : THERMAL_CONSTANTS.tankToAirNatural;

  // Target temperature difference for radiators
  // Reserve some margin for winding gradient
  const effectiveDeltaT = targetTempRise - 15; // Reserve 15°C for winding gradient

  // Required radiator area
  // Q = h × A × ΔT, so A = Q / (h × ΔT)
  const radiatorArea = totalLosses / (hCoeff * effectiveDeltaT);

  // Number of radiator panels
  const radiatorSize = RADIATOR_SIZES.medium;
  const numberOfRadiators = Math.ceil(radiatorArea / radiatorSize.area);
  const actualArea = numberOfRadiators * radiatorSize.area;

  // Number of fans (if forced air cooling)
  const numberOfFans = hasForceAir ? Math.max(2, Math.ceil(numberOfRadiators / 2)) : 0;

  steps.push({
    id: 'radiator-sizing',
    title: 'Radiator Sizing',
    formula: 'A = Pt / (h × ΔT)',
    inputs: {
      'Pt': { value: Math.round(totalLosses), unit: 'W', description: 'Total losses' },
      'h': { value: hCoeff, unit: 'W/(m²·K)', description: `Heat transfer coeff. for ${coolingClass}` },
      'ΔT': { value: effectiveDeltaT, unit: '°C', description: 'Available temperature rise' },
    },
    result: { value: Math.round(actualArea * 10) / 10, unit: 'm²' },
    explanation: `Required ${radiatorArea.toFixed(1)} m² of radiating surface. Using ${numberOfRadiators} standard radiator panels (${radiatorSize.area} m² each) provides ${actualArea.toFixed(1)} m².${hasForceAir ? ` ${numberOfFans} cooling fans for forced air operation.` : ''}`,
    category: 'thermal',
  });

  return {
    radiatorArea: actualArea,
    numberOfRadiators,
    numberOfFans,
  };
}

/**
 * Calculate temperature rises.
 */
function calculateTemperatureRises(
  totalLosses: number,
  loadLoss: number,
  radiatorArea: number,
  hvWinding: WindingDesign,
  lvWinding: WindingDesign,
  coolingClass: string,
  steps: CalculationStep[]
): { topOilRise: number; averageWindingRise: number; hotSpotRise: number } {
  const hasForceAir = coolingClass.includes('ONAF');
  const hCoeff = hasForceAir
    ? THERMAL_CONSTANTS.tankToAirForced
    : THERMAL_CONSTANTS.tankToAirNatural;

  // Top oil temperature rise
  // Q = h × A × ΔT, so ΔT = Q / (h × A)
  const topOilRise = totalLosses / (hCoeff * radiatorArea);

  // Average winding temperature rise above top oil
  // Depends on winding loss density and oil circulation
  const windingSurface = calculateWindingSurface(hvWinding) + calculateWindingSurface(lvWinding);
  const windingLossDensity = loadLoss / windingSurface; // W/m²

  // Empirical formula: ΔT_wg = K × (q)^0.8, where q is loss density in W/m²
  // K ≈ 0.035 for natural oil circulation, 0.028 for directed flow (IEEE C57.91)
  const K_winding = 0.035;
  const windingGradient = K_winding * Math.pow(windingLossDensity, 0.8);

  // Average winding rise = top oil rise + winding gradient
  const averageWindingRise = topOilRise + windingGradient;

  // Hot spot rise
  // Hot spot = Average winding rise × 1.1 + additional allowance
  const hotSpotRise = averageWindingRise * THERMAL_CONSTANTS.hotSpotFactor
    + THERMAL_CONSTANTS.hotSpotAllowance;

  steps.push({
    id: 'temperature-rises',
    title: 'Temperature Rises',
    formula: 'ΔT_oil = Pt/(h×A), ΔT_wg = K×q^0.8, ΔT_hs = 1.1×ΔT_avg + 13',
    inputs: {
      'Pt': { value: Math.round(totalLosses), unit: 'W', description: 'Total losses' },
      'A': { value: radiatorArea, unit: 'm²', description: 'Radiator area' },
      'q': { value: Math.round(windingLossDensity), unit: 'W/m²', description: 'Winding loss density' },
    },
    result: { value: Math.round(hotSpotRise * 10) / 10, unit: '°C hot spot rise' },
    explanation: `Top oil rise: ${topOilRise.toFixed(1)}°C. Average winding rise: ${averageWindingRise.toFixed(1)}°C. The hot spot is the hottest point in the winding, typically ${THERMAL_CONSTANTS.hotSpotAllowance}°C above average plus a ${((THERMAL_CONSTANTS.hotSpotFactor - 1) * 100).toFixed(0)}% safety factor.`,
    category: 'thermal',
  });

  return { topOilRise, averageWindingRise, hotSpotRise };
}

/**
 * Calculate winding surface area for heat dissipation.
 */
function calculateWindingSurface(winding: WindingDesign): number {
  // Approximate winding as a cylinder with oil cooling on both inner and outer surfaces
  const outerSurface = 2 * Math.PI * (winding.outerRadius / 1000) * (winding.windingHeight / 1000);
  const innerSurface = 2 * Math.PI * (winding.innerRadius / 1000) * (winding.windingHeight / 1000);
  return outerSurface + innerSurface;
}

/**
 * Check if thermal design meets temperature limits.
 */
export function checkThermalLimits(
  thermal: ThermalDesign,
  requirements: DesignRequirements
): { passes: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check against IEEE C57.91 temperature limits for Class A insulation
  const maxTopOilRise = requirements.temperatureRise || 65;
  const maxAverageWindingRise = (requirements.temperatureRise || 65) + 10; // Usually same as top oil
  const maxHotSpotRise = 80; // IEEE limit for 65°C rise class

  if (thermal.topOilRise > maxTopOilRise) {
    issues.push(`Top oil rise (${thermal.topOilRise}°C) exceeds limit (${maxTopOilRise}°C)`);
  }

  if (thermal.averageWindingRise > maxAverageWindingRise) {
    issues.push(`Average winding rise (${thermal.averageWindingRise}°C) exceeds limit (${maxAverageWindingRise}°C)`);
  }

  if (thermal.hotSpotRise > maxHotSpotRise) {
    issues.push(`Hot spot rise (${thermal.hotSpotRise}°C) exceeds limit (${maxHotSpotRise}°C)`);
  }

  return {
    passes: issues.length === 0,
    issues,
  };
}

/**
 * Calculate overload capability based on thermal margin.
 */
export function calculateOverloadCapability(
  thermal: ThermalDesign,
  requirements: DesignRequirements
): { shortTermOverload: number; emergencyOverload: number } {
  const hotSpotLimit = 80; // Normal operation limit
  const emergencyLimit = 140; // Short-term emergency limit

  const ambientTemp = requirements.ambientTemperature || 30;
  const currentHotSpot = ambientTemp + thermal.hotSpotRise;
  const marginToNormal = hotSpotLimit + ambientTemp - currentHotSpot;
  const marginToEmergency = emergencyLimit + ambientTemp - currentHotSpot;

  // Overload capability approximately follows: load ∝ √(ΔT)
  // This is simplified; actual calculation per IEEE C57.91 is more complex
  const shortTermOverload = Math.sqrt((currentHotSpot + marginToNormal) / currentHotSpot);
  const emergencyOverload = Math.sqrt((currentHotSpot + marginToEmergency) / currentHotSpot);

  return {
    shortTermOverload: Math.round(shortTermOverload * 100), // As percentage
    emergencyOverload: Math.round(emergencyOverload * 100),
  };
}
