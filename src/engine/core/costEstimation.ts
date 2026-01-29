/**
 * Cost Estimation Module
 *
 * Calculates transformer manufacturing cost estimates based on design parameters.
 * These are budgetary estimates for planning purposes.
 */

import type {
  TransformerDesign,
  DesignRequirements,
} from '../types/transformer.types';

import {
  STEEL_PRICES,
  CONDUCTOR_PRICES,
  INSULATION_COST_FACTOR,
  OIL_PRICES,
  TANK_COSTS,
  COOLING_COSTS,
  ACCESSORY_COSTS,
  LABOR_COSTS,
  OVERHEAD_FACTORS,
  getBushingPrice,
  getTapChangerCost,
} from '../constants/pricing';

/**
 * Cost breakdown by category
 */
export interface CostBreakdown {
  // Materials
  coreSteel: number;
  conductors: number;
  insulation: number;
  oil: number;
  tank: number;
  bushings: number;
  cooling: number;
  tapChanger: number;
  accessories: number;

  // Subtotals
  totalMaterials: number;

  // Labor
  assembly: number;
  testing: number;
  engineering: number;
  totalLabor: number;

  // Overhead
  facilityOverhead: number;
  qualityControl: number;
  shipping: number;
  warrantyReserve: number;

  // Totals
  subtotal: number;
  profitMargin: number;
  totalCost: number;

  // Per-unit metrics
  costPerKVA: number;
  costPerKg: number;
}

/**
 * Cost estimation options
 */
export interface CostEstimationOptions {
  /** Oil type: 'mineral', 'naturalEster', 'syntheticEster', 'silicon' */
  oilType?: 'mineral' | 'naturalEster' | 'syntheticEster' | 'silicon';
  /** Tap changer type: 'noLoad' or 'onLoad' */
  tapChangerType?: 'noLoad' | 'onLoad';
  /** Include on-load tap changer */
  includeOLTC?: boolean;
  /** Regional multiplier key */
  region?: string;
  /** Custom profit margin (0-1) */
  profitMargin?: number;
}

/**
 * Calculate complete cost estimate for a transformer design.
 */
export function calculateCostEstimate(
  design: TransformerDesign,
  requirements: DesignRequirements,
  options: CostEstimationOptions = {}
): CostBreakdown {
  const {
    oilType = 'mineral',
    tapChangerType = 'noLoad',
    includeOLTC = false,
    profitMargin = OVERHEAD_FACTORS.profitMargin,
  } = options;

  const kVA = requirements.ratedPower;

  // =========================================================================
  // MATERIAL COSTS
  // =========================================================================

  // Core steel cost
  const steelGradeId = design.core.steelGrade.id;
  const steelPricePerKg = STEEL_PRICES[steelGradeId] || STEEL_PRICES['m4'];
  const coreSteel = design.core.coreWeight * steelPricePerKg;

  // Conductor costs
  const hvConductorType = design.hvWinding.conductorType;
  const lvConductorType = design.lvWinding.conductorType;
  const hvConductorPrice = CONDUCTOR_PRICES[hvConductorType]?.strip || CONDUCTOR_PRICES.copper.strip;
  const lvConductorPrice = CONDUCTOR_PRICES[lvConductorType]?.strip || CONDUCTOR_PRICES.copper.strip;

  const conductors =
    design.hvWinding.conductorWeight * hvConductorPrice +
    design.lvWinding.conductorWeight * lvConductorPrice;

  // Insulation materials
  const insulation =
    kVA * INSULATION_COST_FACTOR.paperAndPressboard +
    kVA * INSULATION_COST_FACTOR.insulationCylinders +
    kVA * INSULATION_COST_FACTOR.tapesAndTubes;

  // Oil cost
  const oilPricePerLiter = {
    mineral: OIL_PRICES.mineralOil,
    naturalEster: OIL_PRICES.naturalEster,
    syntheticEster: OIL_PRICES.syntheticEster,
    silicon: OIL_PRICES.siliconOil,
  }[oilType];
  const oil = design.thermal.oilVolume * oilPricePerLiter;

  // Tank cost (estimate tank weight from design)
  const tankSteelWeight = design.tank.tankWeight;
  const tankMaterialCost = tankSteelWeight * TANK_COSTS.steelPlatePerKg;
  const tankFabricationCost = tankMaterialCost * TANK_COSTS.fabricationMultiplier;
  const conservatorCost = design.tank.conservatorVolume * TANK_COSTS.conservatorPerLiter;
  const tank = tankFabricationCost + conservatorCost +
    TANK_COSTS.liftingLugsEach * 4 +  // 4 lifting lugs
    TANK_COSTS.wheelsPerSet +
    TANK_COSTS.drainsAndValves;

  // Bushings
  const hvBushingPrice = getBushingPrice(requirements.primaryVoltage, 'hv');
  const lvBushingPrice = getBushingPrice(requirements.secondaryVoltage, 'lv');
  const numPhases = requirements.phases;
  const bushings =
    hvBushingPrice * numPhases +           // HV bushings
    lvBushingPrice * (numPhases + 1);      // LV bushings + neutral

  // Cooling equipment
  const radiatorCost = design.thermal.numberOfRadiators * COOLING_COSTS.radiatorPanelMedium;
  const fanCost = design.thermal.numberOfFans * COOLING_COSTS.coolingFan;
  const cooling = radiatorCost + fanCost + COOLING_COSTS.flowIndicator;

  // Tap changer
  const tapChangerCost = getTapChangerCost(kVA, includeOLTC ? 'onLoad' : tapChangerType);
  const tapChanger = tapChangerCost;

  // Accessories
  const accessories =
    ACCESSORY_COSTS.nameplateAndRatingPlate +
    ACCESSORY_COSTS.groundingPad +
    ACCESSORY_COSTS.pressureReliefDevice +
    ACCESSORY_COSTS.oilLevelIndicator +
    ACCESSORY_COSTS.oilTemperatureIndicator +
    ACCESSORY_COSTS.liquidLevelGauge +
    ACCESSORY_COSTS.samplingValve +
    ACCESSORY_COSTS.silicaGelBreather +
    (kVA > 1000 ? ACCESSORY_COSTS.buchholzRelay : 0) +
    (kVA > 2500 ? ACCESSORY_COSTS.windingTemperatureIndicator : 0);

  // Total materials
  const totalMaterials = coreSteel + conductors + insulation + oil + tank + bushings + cooling + tapChanger + accessories;

  // =========================================================================
  // LABOR COSTS
  // =========================================================================

  // Assembly labor
  const assemblyHours = Math.max(
    LABOR_COSTS.minAssemblyHours,
    kVA * LABOR_COSTS.assemblyHoursPerKVA
  );
  const assembly = assemblyHours * LABOR_COSTS.assemblyHourlyRate;

  // Testing labor
  const testingHours = Math.max(
    LABOR_COSTS.minTestingHours,
    kVA * LABOR_COSTS.testingHoursPerKVA
  );
  const testing = testingHours * LABOR_COSTS.testingHourlyRate;

  // Engineering labor
  const engineeringHours = Math.max(
    LABOR_COSTS.minEngineeringHours,
    kVA * LABOR_COSTS.engineeringHoursPerKVA
  );
  const engineering = engineeringHours * LABOR_COSTS.engineeringHourlyRate;

  const totalLabor = assembly + testing + engineering;

  // =========================================================================
  // OVERHEAD COSTS
  // =========================================================================

  const directCosts = totalMaterials + totalLabor;

  const facilityOverhead = directCosts * OVERHEAD_FACTORS.facilityOverhead;
  const qualityControl = directCosts * OVERHEAD_FACTORS.qualityControl;
  const shipping = totalMaterials * OVERHEAD_FACTORS.shipping;
  const warrantyReserve = directCosts * OVERHEAD_FACTORS.warrantyReserve;

  // =========================================================================
  // TOTALS
  // =========================================================================

  const subtotal = directCosts + facilityOverhead + qualityControl + shipping + warrantyReserve;
  const profitAmount = subtotal * profitMargin;
  const totalCost = subtotal + profitAmount;

  // Per-unit metrics
  const totalWeight = design.tank.totalWeight;
  const costPerKVA = totalCost / kVA;
  const costPerKg = totalCost / totalWeight;

  return {
    // Materials
    coreSteel: Math.round(coreSteel),
    conductors: Math.round(conductors),
    insulation: Math.round(insulation),
    oil: Math.round(oil),
    tank: Math.round(tank),
    bushings: Math.round(bushings),
    cooling: Math.round(cooling),
    tapChanger: Math.round(tapChanger),
    accessories: Math.round(accessories),
    totalMaterials: Math.round(totalMaterials),

    // Labor
    assembly: Math.round(assembly),
    testing: Math.round(testing),
    engineering: Math.round(engineering),
    totalLabor: Math.round(totalLabor),

    // Overhead
    facilityOverhead: Math.round(facilityOverhead),
    qualityControl: Math.round(qualityControl),
    shipping: Math.round(shipping),
    warrantyReserve: Math.round(warrantyReserve),

    // Totals
    subtotal: Math.round(subtotal),
    profitMargin: Math.round(profitAmount),
    totalCost: Math.round(totalCost),

    // Per-unit metrics
    costPerKVA: Math.round(costPerKVA),
    costPerKg: Math.round(costPerKg * 100) / 100,
  };
}

/**
 * Format currency value for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Calculate cost comparison between two designs (e.g., different steel types)
 */
export function compareCosts(
  design1: TransformerDesign,
  design2: TransformerDesign,
  requirements: DesignRequirements,
  options: CostEstimationOptions = {}
): {
  cost1: CostBreakdown;
  cost2: CostBreakdown;
  difference: number;
  percentDifference: number;
} {
  const cost1 = calculateCostEstimate(design1, requirements, options);
  const cost2 = calculateCostEstimate(design2, requirements, options);

  const difference = cost2.totalCost - cost1.totalCost;
  const percentDifference = (difference / cost1.totalCost) * 100;

  return {
    cost1,
    cost2,
    difference,
    percentDifference: Math.round(percentDifference * 10) / 10,
  };
}

/**
 * Calculate lifecycle cost including energy losses
 */
export function calculateLifecycleCost(
  design: TransformerDesign,
  requirements: DesignRequirements,
  options: CostEstimationOptions & {
    electricityRate?: number;  // $/kWh
    yearsOfOperation?: number;
    loadFactor?: number;       // Average load as fraction of rated
    hoursPerYear?: number;
  } = {}
): {
  initialCost: number;
  annualLossCost: number;
  totalLifecycleCost: number;
  paybackVsStandard?: number;
} {
  const {
    electricityRate = 0.10,   // $/kWh
    yearsOfOperation = 25,
    loadFactor = 0.5,
    hoursPerYear = 8760,
  } = options;

  const initialCost = calculateCostEstimate(design, requirements, options).totalCost;

  // Annual energy loss calculation
  const noLoadLossKW = design.losses.noLoadLoss / 1000;
  const loadLossKW = design.losses.loadLoss / 1000;

  // No-load loss runs 24/7
  const annualNoLoadEnergy = noLoadLossKW * hoursPerYear;

  // Load loss weighted by load factor squared
  const lossFactor = 0.3 * loadFactor + 0.7 * Math.pow(loadFactor, 2);
  const annualLoadEnergy = loadLossKW * hoursPerYear * lossFactor;

  const annualEnergyLoss = annualNoLoadEnergy + annualLoadEnergy;
  const annualLossCost = annualEnergyLoss * electricityRate;

  const totalLifecycleCost = initialCost + (annualLossCost * yearsOfOperation);

  return {
    initialCost: Math.round(initialCost),
    annualLossCost: Math.round(annualLossCost),
    totalLifecycleCost: Math.round(totalLifecycleCost),
  };
}
