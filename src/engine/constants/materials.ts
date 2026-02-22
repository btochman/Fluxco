/**
 * Material Constants for Transformer Design
 *
 * Contains electrical steel grades, conductor properties, and insulation data.
 * Values are based on IEEE/IEC standards and manufacturer specifications.
 */

import type { SteelGrade, ConductorProperties, ConductorType, CoolingClassType, VectorGroupType, LoadProfileType } from '../types/transformer.types';

// ============================================================================
// ELECTRICAL STEEL GRADES
// ============================================================================

/**
 * Common electrical steel grades for power transformer cores.
 * Specific loss values are at 1.7T, 60Hz per IEEE C57.12.00.
 */
export const STEEL_GRADES_MAP: Record<string, SteelGrade> = {
  'M2': {
    id: 'm2',
    name: 'M2 (27M2) - Premium',
    thickness: 0.27,
    specificLoss: 0.96,
    density: 7650,
    stackingFactor: 0.96,
    maxFluxDensity: 1.72,
  },
  'M3': {
    id: 'm3',
    name: 'M3 (27M3) - High Grade',
    thickness: 0.27,
    specificLoss: 1.05,
    density: 7650,
    stackingFactor: 0.96,
    maxFluxDensity: 1.70,
  },
  'M4': {
    id: 'm4',
    name: 'M4 (27M4) - Standard',
    thickness: 0.27,
    specificLoss: 1.17,
    density: 7650,
    stackingFactor: 0.95,
    maxFluxDensity: 1.68,
  },
  'M5': {
    id: 'm5',
    name: 'M5 (30M5) - Economy',
    thickness: 0.30,
    specificLoss: 1.30,
    density: 7650,
    stackingFactor: 0.95,
    maxFluxDensity: 1.65,
  },
  'M6': {
    id: 'm6',
    name: 'M6 (35M6) - Basic',
    thickness: 0.35,
    specificLoss: 1.50,
    density: 7650,
    stackingFactor: 0.94,
    maxFluxDensity: 1.60,
  },
  'Hi-B': {
    id: 'hi-b',
    name: 'Hi-B - Ultra Premium',
    thickness: 0.23,
    specificLoss: 0.85,
    density: 7650,
    stackingFactor: 0.97,
    maxFluxDensity: 1.75,
  },
  'Laser-Scribed': {
    id: 'laser',
    name: 'Laser-Scribed',
    thickness: 0.23,
    specificLoss: 0.80,
    density: 7650,
    stackingFactor: 0.97,
    maxFluxDensity: 1.75,
  },
  'Amorphous-2605SA1': {
    id: 'amorphous-sa1',
    name: 'Amorphous 2605SA1',
    thickness: 0.025,              // 25 micron ribbons
    specificLoss: 0.25,            // ~70% lower than best GOES
    density: 7180,                 // Slightly lower than silicon steel
    stackingFactor: 0.85,          // Lower due to thin ribbons
    maxFluxDensity: 1.56,          // Lower saturation than GOES
  },
  'Amorphous-2605HB1M': {
    id: 'amorphous-hb1m',
    name: 'Amorphous 2605HB1M',
    thickness: 0.025,
    specificLoss: 0.22,            // Lowest loss grade
    density: 7320,
    stackingFactor: 0.85,
    maxFluxDensity: 1.63,          // Higher Bs version
  },
};

// Array format for UI dropdowns
export const STEEL_GRADES: SteelGrade[] = Object.values(STEEL_GRADES_MAP);

// ============================================================================
// CONDUCTOR PROPERTIES
// ============================================================================

/**
 * Electrical conductor properties at 20°C reference temperature.
 */
export const CONDUCTOR_PROPERTIES: Record<string, ConductorProperties> = {
  copper: {
    resistivity: 1.724e-8,      // Ohm-m at 20°C (IACS 100%)
    tempCoeff: 0.00393,         // per K
    density: 8900,              // kg/m³
    maxCurrentDensity: 4.5,     // A/mm² for forced air cooling
  },
  aluminum: {
    resistivity: 2.82e-8,       // Ohm-m at 20°C
    tempCoeff: 0.00403,         // per K
    density: 2700,              // kg/m³
    maxCurrentDensity: 2.5,     // A/mm² for forced air cooling
  },
};

// ============================================================================
// CURRENT DENSITY GUIDELINES
// ============================================================================

/**
 * Recommended current densities based on cooling class (A/mm²).
 * Values for copper conductors - multiply by 0.6 for aluminum.
 */
export const CURRENT_DENSITY_BY_COOLING: Record<string, { min: number; max: number; typical: number }> = {
  'ONAN': { min: 2.0, max: 3.5, typical: 3.0 },
  'ONAF': { min: 3.0, max: 4.5, typical: 4.0 },
  'ONAN/ONAF': { min: 2.5, max: 4.0, typical: 3.5 },
  'ONAN/ONAF/OFAF': { min: 3.0, max: 4.5, typical: 4.0 },
};

// ============================================================================
// INSULATION PROPERTIES
// ============================================================================

/**
 * Insulation material properties.
 */
export const INSULATION_MATERIALS = {
  'kraft-paper': {
    name: 'Kraft Paper',
    dielectricStrength: 40,      // kV/mm
    thermalClass: 'A' as const,
    maxTemp: 105,               // °C
    thickness: { min: 0.05, max: 0.25, typical: 0.1 }, // mm
  },
  'diamond-dotted-paper': {
    name: 'Diamond Dotted Paper',
    dielectricStrength: 45,
    thermalClass: 'A' as const,
    maxTemp: 105,
    thickness: { min: 0.08, max: 0.3, typical: 0.13 },
  },
  'pressboard': {
    name: 'Pressboard',
    dielectricStrength: 35,
    thermalClass: 'A' as const,
    maxTemp: 105,
    thickness: { min: 0.5, max: 6.0, typical: 3.0 },
  },
  'nomex': {
    name: 'Nomex 410',
    dielectricStrength: 30,
    thermalClass: 'H' as const,
    maxTemp: 180,
    thickness: { min: 0.05, max: 0.76, typical: 0.18 },
  },
  'crepe-paper': {
    name: 'Crepe Paper',
    dielectricStrength: 35,
    thermalClass: 'A' as const,
    maxTemp: 105,
    thickness: { min: 0.05, max: 0.15, typical: 0.08 },
  },
};

// ============================================================================
// TRANSFORMER OIL PROPERTIES
// ============================================================================

export const TRANSFORMER_OIL = {
  name: 'Mineral Transformer Oil (Type I)',
  density: 0.87,                // kg/L at 20°C
  specificHeat: 1.88,           // kJ/(kg·K)
  thermalConductivity: 0.126,   // W/(m·K) at 20°C
  viscosity: {
    at40C: 11,                  // mm²/s (cSt)
    at100C: 2.5,
  },
  flashPoint: 145,              // °C minimum
  pourPoint: -40,               // °C maximum
  dielectricStrength: 40,       // kV minimum (2.5mm gap)
  expansionCoeff: 0.00075,      // per °C
};

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

/**
 * Core design constants for stepped circular cores.
 * Utilization factor is the ratio of actual core area to circumscribed circle.
 */
export const CORE_STEP_UTILIZATION: Record<number, number> = {
  1: 0.637,   // 1 step (square)
  2: 0.785,   // 2 steps
  3: 0.849,   // 3 steps
  4: 0.885,   // 4 steps
  5: 0.906,   // 5 steps
  6: 0.920,   // 6 steps
  7: 0.930,   // 7 steps (typical for medium power)
  8: 0.937,   // 8 steps
  9: 0.943,   // 9 steps (typical for large power)
  10: 0.948,  // 10 steps
  11: 0.951,
  12: 0.954,
  13: 0.957,
};

/**
 * Empirical design constant K for volts-per-turn calculation.
 * Et = K × √(kVA)
 */
export const VOLTS_PER_TURN_CONSTANT = {
  distribution: { min: 0.40, max: 0.50, typical: 0.45 },  // < 500 kVA
  mediumPower: { min: 0.55, max: 0.70, typical: 0.63 },   // 500-5000 kVA
  largePower: { min: 0.60, max: 0.75, typical: 0.67 },    // > 5000 kVA
};

/**
 * Building factor for core loss calculation.
 * Accounts for losses at joints, corners, bolt holes, etc.
 */
export const CORE_BUILDING_FACTOR = {
  minimum: 1.10,
  typical: 1.15,
  conservative: 1.20,
};

/**
 * Loss factors for load loss calculation.
 */
export const LOAD_LOSS_FACTORS = {
  eddyLossFactor: 0.10,         // Eddy loss as fraction of I²R
  strayLossFactor: 0.05,        // Stray loss as fraction of I²R
};

/**
 * Thermal design constants.
 */
export const THERMAL_CONSTANTS = {
  // Heat transfer coefficients in W/(m²·K)
  oilToTankNatural: 8,
  oilToTankForced: 12,
  tankToAirNatural: 9,
  tankToAirForced: 15,

  // Hot spot factors
  hotSpotFactor: 1.1,           // Multiplier for average winding rise
  hotSpotAllowance: 13,         // Additional °C for hot spot

  // Oil volume empirical constants for V = K × kVA^0.75
  oilVolumeConstant: {
    'ONAN': 4.5,
    'ONAF': 4.0,
    'ONAN/ONAF': 4.2,
    'ONAN/ONAF/OFAF': 3.8,
  },
};

/**
 * Standard BIL levels by voltage class (kV).
 */
export const BIL_LEVELS: Record<string, number[]> = {
  '1.2kV': [30, 45],
  '2.4kV': [45, 60],
  '4.16kV': [60, 75],
  '7.2kV': [75, 95],
  '12kV': [95, 110],
  '15kV': [95, 110],
  '25kV': [125, 150],
  '34.5kV': [150, 200],
  '46kV': [200, 250],
  '69kV': [250, 350],
};

/**
 * Insulation clearances in mm for oil-immersed transformers.
 * Based on voltage class and BIL.
 */
export const INSULATION_CLEARANCES = {
  // HV to LV main gap (mm per kV of BIL)
  hvToLvGap: 0.25,
  // Minimum HV to ground (mm per kV of BIL)
  hvToGround: 0.20,
  // Minimum LV to ground (mm)
  lvToGround: 15,
  // Turn-to-turn (mm, based on voltage per turn)
  turnToTurn: 0.1,
};

/**
 * Standard radiator panel sizes.
 */
export const RADIATOR_SIZES = {
  small: { area: 1.5, height: 800, fins: 12 },    // m², mm, count
  medium: { area: 2.5, height: 1000, fins: 16 },
  large: { area: 4.0, height: 1200, fins: 20 },
};

// ============================================================================
// UI CONFIGURATION ARRAYS
// ============================================================================

export const CONDUCTOR_TYPES: ConductorType[] = [
  {
    id: 'copper',
    name: 'Copper',
    resistivity: 1.724e-8,
    tempCoeff: 0.00393,
    density: 8900,
    maxCurrentDensity: 4.5,
  },
  {
    id: 'aluminum',
    name: 'Aluminum',
    resistivity: 2.82e-8,
    tempCoeff: 0.00403,
    density: 2700,
    maxCurrentDensity: 2.5,
  },
];

export const COOLING_CLASSES: CoolingClassType[] = [
  { id: 'onan', name: 'ONAN', description: 'Self-Cooled Only' },
  { id: 'onan-onaf', name: 'ONAN/ONAF', description: 'Self-Cooled + Fans (Dual Rating)' },
  { id: 'onan-onaf-ofaf', name: 'ONAN/ONAF/OFAF', description: 'Full Triple Rating' },
];

export const COOLING_RATING_MULTIPLIERS = {
  ONAN: 1.0,
  ONAF: 1.33,
  OFAF: 1.67,
};

export interface PowerRating {
  onan: number;
  onaf: number | null;
  ofaf: number | null;
  display: string;
}

export function calculatePowerRatings(baseKVA: number, coolingClassId: string): PowerRating {
  const onan = baseKVA;
  let onaf: number | null = null;
  let ofaf: number | null = null;

  if (coolingClassId === 'onan-onaf' || coolingClassId === 'onan-onaf-ofaf') {
    onaf = Math.round(baseKVA * COOLING_RATING_MULTIPLIERS.ONAF);
  }
  if (coolingClassId === 'onan-onaf-ofaf') {
    ofaf = Math.round(baseKVA * COOLING_RATING_MULTIPLIERS.OFAF);
  }

  const parts = [onan, onaf, ofaf].filter(v => v !== null);
  const display = parts.join('/') + ' kVA';

  return { onan, onaf, ofaf, display };
}

export const VECTOR_GROUPS: VectorGroupType[] = [
  { id: 'dyn11', name: 'Dyn11', description: 'Delta-Wye, 30° lag', phaseShift: -30, hvConnection: 'delta', lvConnection: 'wye' },
  { id: 'dyn1', name: 'Dyn1', description: 'Delta-Wye, 30° lead', phaseShift: 30, hvConnection: 'delta', lvConnection: 'wye' },
  { id: 'ynd11', name: 'YNd11', description: 'Wye-Delta, 30° lag', phaseShift: -30, hvConnection: 'wye', lvConnection: 'delta' },
  { id: 'dd0', name: 'Dd0', description: 'Delta-Delta, 0°', phaseShift: 0, hvConnection: 'delta', lvConnection: 'delta' },
  { id: 'yy0', name: 'Yy0', description: 'Wye-Wye, 0°', phaseShift: 0, hvConnection: 'wye', lvConnection: 'wye' },
];

export const LOAD_PROFILES: LoadProfileType[] = [
  {
    id: 'light-variable',
    name: 'Light / Variable',
    description: 'Residential, commercial - avg <40% load, high no-load hours',
    avgLoadPercent: 30,
    recommendedSteel: 'amorphous',
  },
  {
    id: 'medium',
    name: 'Medium / Mixed',
    description: 'General industrial - avg 40-60% load, mixed duty',
    avgLoadPercent: 50,
    recommendedSteel: 'either',
  },
  {
    id: 'heavy-constant',
    name: 'Heavy / Constant',
    description: 'Continuous process - avg >60% load, high utilization',
    avgLoadPercent: 75,
    recommendedSteel: 'goes',
  },
];

/**
 * Steel selection guidance based on load profile.
 * Amorphous: 70-80% lower no-load losses but lower saturation (~1.56T vs 1.7T)
 * GOES: Higher saturation allows smaller core, better for heavy constant loads
 */
export const STEEL_SELECTION_GUIDANCE = {
  amorphous: {
    advantages: [
      '70-80% lower no-load (core) losses',
      'Significant energy savings at light/variable loads',
      'Lower total cost of ownership for distribution',
      'Reduced CO2 emissions over transformer life',
    ],
    disadvantages: [
      'Lower saturation flux density (1.56T vs 1.7T)',
      'Requires larger core for same power rating',
      'More expensive material cost upfront',
      'More sensitive to mechanical stress',
    ],
    bestFor: 'Distribution transformers, residential/commercial loads, renewable energy',
  },
  goes: {
    advantages: [
      'Higher saturation allows more compact designs',
      'Lower material cost',
      'Well-established manufacturing processes',
      'Better mechanical properties',
    ],
    disadvantages: [
      'Higher no-load losses (energized 24/7)',
      'Higher lifecycle energy cost at light loads',
    ],
    bestFor: 'Industrial transformers, heavy constant loads, generator step-ups',
  },
};
