/**
 * Transformer Design Engine - Type Definitions
 *
 * Comprehensive type system for 1.5 MVA oil-filled transformer design calculations.
 * Used throughout the design tool for type safety and documentation.
 */

// ============================================================================
// INPUT TYPES - Design Requirements
// ============================================================================

export type CoolingClass = 'ONAN' | 'ONAF' | 'ONAN/ONAF' | 'ONAN/ONAF/ONAF';
export type PhaseCount = 1 | 3;
export type ConductorMaterial = 'copper' | 'aluminum';
export type ConductorShape = 'round' | 'rectangular' | 'CTC';
export type InsulationClass = 'A' | 'E' | 'B' | 'F' | 'H';
export type CoreType = 'shell' | 'core';

/**
 * Conductor type configuration for UI
 */
export interface ConductorType {
  id: string;
  name: string;
  resistivity: number;
  tempCoeff: number;
  density: number;
  maxCurrentDensity: number;
}

/**
 * Cooling class configuration for UI
 */
export interface CoolingClassType {
  id: string;
  name: string;
  description: string;
}

/**
 * Vector group configuration for UI
 */
export interface VectorGroupType {
  id: string;
  name: string;
  description: string;
  phaseShift: number;
}

/**
 * Load profile type for steel selection guidance
 */
export interface LoadProfileType {
  id: string;
  name: string;
  description: string;
  avgLoadPercent: number;
  recommendedSteel: 'amorphous' | 'goes' | 'either';
}

/**
 * Primary design input requirements from user
 */
export interface DesignRequirements {
  /** Power rating in kVA (e.g., 1500 for 1.5 MVA) */
  ratedPower: number;
  /** Primary (HV) voltage in V */
  primaryVoltage: number;
  /** Secondary (LV) voltage in V */
  secondaryVoltage: number;
  /** System frequency in Hz (50 or 60) */
  frequency: 50 | 60;
  /** Number of phases */
  phases: PhaseCount;
  /** Target percent impedance (typically 5-7%) */
  targetImpedance: number;
  /** Steel grade for core */
  steelGrade: SteelGrade;
  /** Conductor type */
  conductorType: ConductorType;
  /** Cooling classification */
  coolingClass: CoolingClassType;
  /** Vector group for 3-phase */
  vectorGroup: VectorGroupType;
  /** Expected load profile for steel selection guidance */
  loadProfile?: LoadProfileType;
  /** Maximum temperature rise in degrees C (55 or 65 typical) */
  temperatureRise?: 55 | 65;
  /** Installation altitude in meters above sea level */
  altitude?: number;
  /** Maximum ambient temperature in degrees C */
  ambientTemperature?: number;
}

/**
 * Advanced design options (materials selection)
 */
export interface AdvancedOptions {
  /** Steel grade selection for core */
  steelGrade: string;
  /** Conductor material for HV winding */
  hvConductorMaterial: ConductorMaterial;
  /** Conductor material for LV winding */
  lvConductorMaterial: ConductorMaterial;
  /** Target flux density override (Tesla) */
  targetFluxDensity?: number;
  /** Target current density override (A/mm2) */
  targetCurrentDensity?: number;
}

// ============================================================================
// MATERIAL TYPES
// ============================================================================

/**
 * Electrical steel grade properties
 */
export interface SteelGrade {
  /** Unique identifier */
  id: string;
  /** Display name (e.g., "M3 (27M3)") */
  name: string;
  /** Lamination thickness in mm */
  thickness: number;
  /** Specific core loss in W/kg at 1.7T, 60Hz */
  specificLoss: number;
  /** Material density in kg/m3 */
  density: number;
  /** Stacking factor (0.95-0.97 typical) */
  stackingFactor: number;
  /** Maximum recommended flux density in Tesla */
  maxFluxDensity: number;
}

/**
 * Conductor material properties
 */
export interface ConductorProperties {
  /** Electrical resistivity in Ohm-m at 20C */
  resistivity: number;
  /** Temperature coefficient of resistance per K */
  tempCoeff: number;
  /** Density in kg/m3 */
  density: number;
  /** Maximum recommended current density in A/mm2 */
  maxCurrentDensity: number;
}

/**
 * AWG wire table entry
 */
export interface AWGEntry {
  /** AWG size (use negative for 0, 00, 000, 0000) */
  awg: number;
  /** Diameter in mm */
  diameter: number;
  /** Cross-sectional area in mm2 */
  area: number;
  /** Resistance in Ohm/km at 20C for copper */
  resistancePerKm: number;
}

// ============================================================================
// DESIGN OUTPUT TYPES
// ============================================================================

/**
 * Core design calculation results
 */
export interface CoreDesign {
  /** Core construction type */
  type: CoreType;
  /** Selected steel grade */
  steelGrade: SteelGrade;
  /** Operating flux density in Tesla */
  fluxDensity: number;
  /** Gross core cross-section in cm2 */
  grossCrossSection: number;
  /** Net core cross-section in cm2 (after stacking factor) */
  netCrossSection: number;
  /** Stacking factor used */
  stackingFactor: number;
  /** Total core weight in kg */
  coreWeight: number;
  /** Core diameter in mm (for circular stepped core) */
  coreDiameter: number;
  /** Limb height in mm */
  limbHeight: number;
  /** Yoke height in mm */
  yokeHeight: number;
  /** Core window width in mm */
  windowWidth: number;
  /** Core window height in mm */
  windowHeight: number;
  /** Number of steps in stepped core */
  coreSteps: number;
  /** Volts per turn */
  voltsPerTurn: number;
  /** Core step dimensions for drawing */
  stepDimensions: CoreStepDimension[];
}

/**
 * Dimension of each step in a stepped circular core
 */
export interface CoreStepDimension {
  /** Step number (1 = center) */
  step: number;
  /** Width of this step in mm */
  width: number;
  /** Stack height of this step in mm */
  height: number;
}

/**
 * Conductor size specification
 */
export interface ConductorSize {
  /** AWG size if using standard wire */
  awg?: number;
  /** Cross-sectional area in mm2 */
  crossSection: number;
  /** Dimensions for rectangular conductor */
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Winding design calculation results
 */
export interface WindingDesign {
  /** Which side of transformer (HV or LV) */
  side: 'HV' | 'LV';
  /** Number of turns */
  turns: number;
  /** Conductor material used */
  conductorType: ConductorMaterial;
  /** Conductor shape */
  conductorShape: ConductorShape;
  /** Conductor size details */
  conductorSize: ConductorSize;
  /** Actual current density in A/mm2 */
  currentDensity: number;
  /** Rated current in Amperes */
  ratedCurrent: number;
  /** Winding height in mm */
  windingHeight: number;
  /** Winding radial thickness in mm */
  windingThickness: number;
  /** Inner radius in mm */
  innerRadius: number;
  /** Outer radius in mm */
  outerRadius: number;
  /** Total conductor weight in kg */
  conductorWeight: number;
  /** Insulation class */
  insulationClass: InsulationClass;
  /** Number of layers */
  layers: number;
  /** Turns per layer */
  turnsPerLayer: number;
  /** DC resistance at 20C in Ohms */
  dcResistance: number;
  /** DC resistance at 75C in Ohms */
  resistance75C: number;
  /** Mean turn length in mm */
  meanTurnLength: number;
}

/**
 * Efficiency data point
 */
export interface EfficiencyData {
  /** Load as percentage (25, 50, 75, 100, etc.) */
  loadPercent: number;
  /** Efficiency as percentage */
  efficiency: number;
  /** Total losses at this load in Watts */
  losses: number;
  /** Output power at this load in Watts */
  outputPower: number;
}

/**
 * Loss calculations results
 */
export interface LossCalculations {
  /** No-load (core) loss in Watts */
  noLoadLoss: number;
  /** Load (copper) loss at 100% load, 75C in Watts */
  loadLoss: number;
  /** Total loss at rated load in Watts */
  totalLoss: number;
  /** Efficiency at various load points */
  efficiency: EfficiencyData[];
  /** Maximum efficiency load point as percentage */
  maxEfficiencyLoad: number;
  /** Maximum efficiency value as percentage */
  maxEfficiency: number;
  /** Eddy current loss in Watts */
  eddyLoss: number;
  /** Stray loss in Watts */
  strayLoss: number;
  /** I2R (resistive) loss in Watts */
  i2rLoss: number;
}

/**
 * Impedance calculation results
 */
export interface ImpedanceCalculation {
  /** Total percent impedance */
  percentZ: number;
  /** Percent resistance */
  percentR: number;
  /** Percent reactance */
  percentX: number;
  /** X/R ratio */
  xrRatio: number;
  /** Voltage regulation at unity power factor */
  regulationAtUnityPF: number;
  /** Voltage regulation at 0.8 lagging power factor */
  regulationAt08PF: number;
  /** Short circuit current in per-unit */
  shortCircuitPU: number;
}

/**
 * Thermal design calculation results
 */
export interface ThermalDesign {
  /** Total oil volume in liters */
  oilVolume: number;
  /** Total oil weight in kg */
  oilWeight: number;
  /** Top oil temperature rise in degrees C */
  topOilRise: number;
  /** Average winding temperature rise in degrees C */
  averageWindingRise: number;
  /** Hot spot temperature rise in degrees C */
  hotSpotRise: number;
  /** Required radiator surface area in m2 */
  radiatorArea: number;
  /** Number of radiator panels */
  numberOfRadiators: number;
  /** Number of cooling fans (if ONAF) */
  numberOfFans: number;
}

/**
 * Tank design calculation results
 */
export interface TankDesign {
  /** Tank length (x-axis) in mm */
  length: number;
  /** Tank width (y-axis) in mm */
  width: number;
  /** Tank height (z-axis) in mm */
  height: number;
  /** Empty tank weight in kg */
  tankWeight: number;
  /** Conservator tank volume in liters */
  conservatorVolume: number;
  /** Total filled weight in kg */
  totalWeight: number;
  /** Shipping weight (untanked, without oil) in kg */
  shippingWeight: number;
  /** Overall height including bushings in mm */
  overallHeight: number;
}

/**
 * Bill of materials item
 */
export interface BOMItem {
  /** Category grouping */
  category: 'core' | 'winding' | 'insulation' | 'tank' | 'accessories' | 'oil';
  /** Item description */
  description: string;
  /** Quantity */
  quantity: number;
  /** Unit of measure */
  unit: string;
  /** Weight in kg (if applicable) */
  weight?: number;
  /** Technical specification */
  specification?: string;
}

/**
 * Complete bill of materials
 */
export interface BillOfMaterials {
  /** All BOM line items */
  items: BOMItem[];
  /** Total copper weight in kg */
  totalCopperWeight: number;
  /** Total core steel weight in kg */
  totalSteelWeight: number;
  /** Total oil volume in liters */
  totalOilVolume: number;
  /** Total transformer weight in kg */
  totalWeight: number;
}

/**
 * Single calculation step for educational display
 */
export interface CalculationStep {
  /** Unique identifier */
  id: string;
  /** Step title */
  title: string;
  /** Formula in plain text or LaTeX */
  formula: string;
  /** Input values used */
  inputs: Record<string, { value: number; unit: string; description: string }>;
  /** Calculated result */
  result: { value: number; unit: string };
  /** Educational explanation */
  explanation: string;
  /** Category for grouping */
  category: 'core' | 'winding' | 'losses' | 'impedance' | 'thermal' | 'tank';
}

// ============================================================================
// COMPLETE DESIGN RESULT
// ============================================================================

/**
 * Complete transformer design output
 */
export interface TransformerDesign {
  /** Input requirements */
  requirements: DesignRequirements;
  /** Advanced options used */
  advancedOptions: AdvancedOptions;
  /** Core design results */
  core: CoreDesign;
  /** HV winding design */
  hvWinding: WindingDesign;
  /** LV winding design */
  lvWinding: WindingDesign;
  /** Loss calculations */
  losses: LossCalculations;
  /** Impedance calculations */
  impedance: ImpedanceCalculation;
  /** Thermal design */
  thermal: ThermalDesign;
  /** Tank design */
  tank: TankDesign;
  /** Bill of materials */
  bom: BillOfMaterials;
  /** All calculation steps for educational display */
  calculationSteps: CalculationStep[];
  /** Design timestamp */
  timestamp: Date;
  /** Design version/revision */
  revision: string;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Design tool state for UI
 */
export interface DesignToolState {
  /** Current design requirements */
  requirements: Partial<DesignRequirements>;
  /** Advanced options */
  advancedOptions: Partial<AdvancedOptions>;
  /** Completed design (null until calculated) */
  design: TransformerDesign | null;
  /** Is calculation in progress */
  isCalculating: boolean;
  /** Calculation progress (0-100) */
  progress: number;
  /** Current calculation step */
  currentStep: string;
  /** Any error message */
  error: string | null;
}

// Default values are now defined in the UI components
