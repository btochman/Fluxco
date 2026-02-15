/**
 * Pricing Constants for Transformer Cost Estimation
 *
 * These are approximate market prices for budgetary estimation purposes.
 * Actual costs will vary based on supplier, quantity, location, and market conditions.
 *
 * All prices in USD, updated for 2024-2025 market estimates.
 */

// ============================================================================
// CORE MATERIALS
// ============================================================================

/**
 * Electrical steel pricing per kg
 * Prices vary significantly based on grade and market conditions
 */
export const STEEL_PRICES: Record<string, number> = {
  // GOES (Grain-Oriented Electrical Steel)
  'm2': 3.80,           // Premium grade
  'm3': 3.40,           // High grade
  'm4': 3.00,           // Standard grade
  'm5': 2.70,           // Economy grade
  'm6': 2.40,           // Basic grade
  'hi-b': 4.20,         // Ultra-premium Hi-B
  'laser': 4.80,        // Laser-scribed premium

  // Amorphous metals (significantly more expensive)
  'amorphous-sa1': 8.50,   // Metglas 2605SA1
  'amorphous-hb1m': 9.20,  // Metglas 2605HB1M
};

// ============================================================================
// CONDUCTOR MATERIALS
// ============================================================================

/**
 * Conductor pricing per kg
 */
export const CONDUCTOR_PRICES = {
  copper: {
    wire: 9.50,           // Magnet wire
    strip: 10.20,         // Rectangular strip
    ctc: 12.50,           // Continuously Transposed Cable
  },
  aluminum: {
    wire: 3.80,
    strip: 4.20,
    ctc: 5.50,
  },
};

// ============================================================================
// INSULATION MATERIALS
// ============================================================================

/**
 * Insulation material costs (estimated per transformer based on kVA)
 */
export const INSULATION_COST_FACTOR = {
  // Cost per kVA for insulation materials
  paperAndPressboard: 0.45,  // $/kVA
  insulationCylinders: 0.30, // $/kVA
  tapesAndTubes: 0.15,       // $/kVA
};

// ============================================================================
// TRANSFORMER OIL
// ============================================================================

/**
 * Transformer oil pricing per liter
 */
export const OIL_PRICES = {
  mineralOil: 2.20,           // Standard mineral oil
  naturalEster: 4.50,         // FR3, Envirotemp
  syntheticEster: 6.80,       // Midel 7131
  siliconOil: 12.00,          // High-temperature applications
};

// ============================================================================
// TANK AND STRUCTURAL
// ============================================================================

/**
 * Tank and structural steel costs
 */
export const TANK_COSTS = {
  steelPlatePerKg: 1.80,      // Fabricated tank steel
  fabricationMultiplier: 2.5,  // Labor multiplier on material cost
  conservatorPerLiter: 8.00,   // Conservator tank cost per liter capacity
  liftingLugsEach: 85,         // Per lifting lug
  wheelsPerSet: 450,           // Per wheel assembly
  drainsAndValves: 320,        // Drain valve assembly
};

// ============================================================================
// BUSHINGS
// ============================================================================

/**
 * Bushing prices by voltage class (each)
 * Prices for oil-filled porcelain bushings
 */
export const BUSHING_PRICES: Record<string, { hv: number; lv: number }> = {
  '2.4kV': { hv: 280, lv: 180 },
  '4.16kV': { hv: 350, lv: 180 },
  '7.2kV': { hv: 450, lv: 200 },
  '12kV': { hv: 580, lv: 220 },
  '15kV': { hv: 720, lv: 220 },
  '23kV': { hv: 950, lv: 250 },
  '34.5kV': { hv: 1400, lv: 280 },
  '46kV': { hv: 2100, lv: 320 },
  '69kV': { hv: 3500, lv: 350 },
};

// ============================================================================
// COOLING EQUIPMENT
// ============================================================================

/**
 * Radiator and cooling equipment costs
 */
export const COOLING_COSTS = {
  radiatorPanelSmall: 320,     // Small radiator panel
  radiatorPanelMedium: 480,    // Medium radiator panel
  radiatorPanelLarge: 680,     // Large radiator panel
  coolingFan: 280,             // Cooling fan assembly
  oilPump: 850,                // Oil circulation pump
  flowIndicator: 120,          // Oil flow indicator
};

// ============================================================================
// TAP CHANGER
// ============================================================================

/**
 * Tap changer costs
 */
export const TAP_CHANGER_COSTS = {
  noLoadTapChanger: {
    small: 1200,    // < 1000 kVA
    medium: 1800,   // 1000-5000 kVA
    large: 2800,    // > 5000 kVA
  },
  onLoadTapChanger: {
    small: 15000,   // < 2500 kVA
    medium: 25000,  // 2500-10000 kVA
    large: 45000,   // > 10000 kVA
  },
};

// ============================================================================
// ACCESSORIES
// ============================================================================

/**
 * Standard accessories and fittings
 */
export const ACCESSORY_COSTS = {
  nameplateAndRatingPlate: 85,
  groundingPad: 45,
  pressureReliefDevice: 380,
  buchholzRelay: 650,
  oilLevelIndicator: 180,
  oilTemperatureIndicator: 220,
  windingTemperatureIndicator: 480,
  liquidLevelGauge: 150,
  pressureVacuumGauge: 280,
  samplingValve: 65,
  filterValve: 95,
  thermometer: 120,
  silicaGelBreather: 180,
  cableBox: 450,
};

// ============================================================================
// LABOR AND OVERHEAD
// ============================================================================

/**
 * Labor rates and overhead factors
 */
export const LABOR_COSTS = {
  assemblyHourlyRate: 65,      // $/hour for assembly labor
  testingHourlyRate: 85,       // $/hour for testing
  engineeringHourlyRate: 120,  // $/hour for engineering

  // Hours per kVA (approximate)
  assemblyHoursPerKVA: 0.08,
  testingHoursPerKVA: 0.03,
  engineeringHoursPerKVA: 0.02,

  // Minimum hours regardless of size
  minAssemblyHours: 40,
  minTestingHours: 16,
  minEngineeringHours: 8,
};

/**
 * Overhead and margin factors
 */
export const OVERHEAD_FACTORS = {
  facilityOverhead: 0.15,      // 15% of direct costs
  qualityControl: 0.05,        // 5% of direct costs
  shipping: 0.08,              // 8% of material cost (varies by destination)
  warrantyReserve: 0.03,       // 3% warranty reserve
  profitMargin: 0.12,          // 12% target profit margin
};

// ============================================================================
// MANUFACTURING REGION ESTIMATES
// ============================================================================

/**
 * Manufacturing region cost multipliers, lead time estimates, and FEOC status.
 * Base pricing (multiplier 1.0) reflects US manufacturing costs.
 */
export const MANUFACTURING_REGIONS: Record<string, {
  label: string;
  multiplier: number;
  leadTimeWeeks: [number, number];
  feocCompliant: boolean;
}> = {
  usa: { label: 'USA', multiplier: 1.0, leadTimeWeeks: [26, 52], feocCompliant: true },
  northAmerica: { label: 'North America', multiplier: 0.92, leadTimeWeeks: [20, 40], feocCompliant: true },
  global: { label: 'Global (excl. China)', multiplier: 0.80, leadTimeWeeks: [16, 36], feocCompliant: true },
  china: { label: 'China', multiplier: 0.65, leadTimeWeeks: [12, 24], feocCompliant: false },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get bushing price based on voltage
 */
export function getBushingPrice(voltage: number, side: 'hv' | 'lv'): number {
  const voltageKV = voltage / 1000;

  // Find appropriate voltage class
  const voltageClasses = ['2.4kV', '4.16kV', '7.2kV', '12kV', '15kV', '23kV', '34.5kV', '46kV', '69kV'];
  const voltageValues = [2.4, 4.16, 7.2, 12, 15, 23, 34.5, 46, 69];

  let classIndex = voltageValues.findIndex(v => voltageKV <= v);
  if (classIndex === -1) classIndex = voltageValues.length - 1;

  const voltageClass = voltageClasses[classIndex];
  return BUSHING_PRICES[voltageClass]?.[side] || BUSHING_PRICES['15kV'][side];
}

/**
 * Get tap changer cost based on kVA and type
 */
export function getTapChangerCost(kVA: number, type: 'noLoad' | 'onLoad'): number {
  const costs = type === 'noLoad' ? TAP_CHANGER_COSTS.noLoadTapChanger : TAP_CHANGER_COSTS.onLoadTapChanger;

  if (kVA < 1000) return costs.small;
  if (kVA < 5000) return costs.medium;
  return costs.large;
}
