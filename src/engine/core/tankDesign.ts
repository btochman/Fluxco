/**
 * Tank Design Module
 *
 * Calculates transformer tank dimensions and weights.
 *
 * Tank dimensions must accommodate:
 * - Core and coil assembly
 * - Oil for cooling
 * - Clearances for insulation
 * - Access for bushings and accessories
 */

import type {
  DesignRequirements,
  CoreDesign,
  WindingDesign,
  ThermalDesign,
  TankDesign,
  CalculationStep,
} from '../types/transformer.types';
import { TRANSFORMER_OIL } from '../constants/materials';

/**
 * Calculate tank dimensions and weights.
 */
export function calculateTankDesign(
  requirements: DesignRequirements,
  coreDesign: CoreDesign,
  hvWinding: WindingDesign,
  lvWinding: WindingDesign,
  thermal: ThermalDesign,
  steps: CalculationStep[]
): TankDesign {
  const phases = requirements.phases;

  // Step 1: Calculate core and coil assembly envelope
  const { assemblyLength, assemblyWidth, assemblyHeight } = calculateAssemblyEnvelope(
    coreDesign,
    hvWinding,
    phases,
    steps
  );

  // Step 2: Add clearances and tank wall thickness
  const { length, width, height } = calculateTankDimensions(
    assemblyLength,
    assemblyWidth,
    assemblyHeight,
    steps
  );

  // Step 3: Calculate tank weight
  const tankWeight = calculateTankWeight(length, width, height, steps);

  // Step 4: Calculate conservator volume
  const conservatorVolume = calculateConservatorVolume(thermal.oilVolume, steps);

  // Step 5: Calculate total weights
  const coreWeight = coreDesign.coreWeight;
  const windingWeight = hvWinding.conductorWeight + lvWinding.conductorWeight;
  const oilWeight = thermal.oilWeight;

  const shippingWeight = coreWeight + windingWeight + tankWeight + 50; // +50 for accessories
  const totalWeight = shippingWeight + oilWeight;

  // Step 6: Overall height including bushings
  const bushingHeight = requirements.primaryVoltage > 25 ? 600 : 400; // mm, rough estimate
  const overallHeight = height + bushingHeight;

  steps.push({
    id: 'total-weights',
    title: 'Transformer Weights',
    formula: 'Total = Core + Windings + Tank + Oil + Accessories',
    inputs: {
      'Core': { value: coreWeight, unit: 'kg', description: 'Core weight' },
      'Windings': { value: windingWeight, unit: 'kg', description: 'HV + LV copper weight' },
      'Tank': { value: tankWeight, unit: 'kg', description: 'Empty tank weight' },
      'Oil': { value: oilWeight, unit: 'kg', description: 'Transformer oil weight' },
    },
    result: { value: Math.round(totalWeight), unit: 'kg total' },
    explanation: `Shipping weight (without oil): ${Math.round(shippingWeight)} kg. Total filled weight: ${Math.round(totalWeight)} kg. This information is critical for transportation planning and foundation design.`,
    category: 'tank',
  });

  return {
    length: Math.round(length),
    width: Math.round(width),
    height: Math.round(height),
    tankWeight: Math.round(tankWeight),
    conservatorVolume: Math.round(conservatorVolume),
    totalWeight: Math.round(totalWeight),
    shippingWeight: Math.round(shippingWeight),
    overallHeight: Math.round(overallHeight),
  };
}

/**
 * Calculate core and coil assembly envelope dimensions.
 */
function calculateAssemblyEnvelope(
  coreDesign: CoreDesign,
  hvWinding: WindingDesign,
  phases: 1 | 3,
  steps: CalculationStep[]
): { assemblyLength: number; assemblyWidth: number; assemblyHeight: number } {
  // Core diameter
  const coreDiameter = coreDesign.coreDiameter;

  // Winding outer radius
  const windingOuterRadius = hvWinding.outerRadius;

  // Assembly width (perpendicular to core axis for 3-phase)
  // For 3-phase: 2 × window width + 3 × core diameter
  // For 1-phase: 2 × window width + 2 × core diameter
  const numLimbs = phases === 3 ? 3 : 2;
  const numWindows = phases === 3 ? 2 : 1;

  const assemblyLength = numWindows * coreDesign.windowWidth + numLimbs * coreDiameter;

  // Assembly width (depth, along core axis)
  // Approximately 2 × winding outer radius
  const assemblyWidth = 2 * windingOuterRadius;

  // Assembly height
  // Core window height + 2 × yoke height
  const assemblyHeight = coreDesign.windowHeight + 2 * coreDesign.yokeHeight;

  steps.push({
    id: 'assembly-envelope',
    title: 'Core & Coil Assembly Envelope',
    formula: 'L = windows × Ww + limbs × d',
    inputs: {
      'windows': { value: numWindows, unit: '', description: 'Number of windows' },
      'limbs': { value: numLimbs, unit: '', description: 'Number of limbs' },
      'Ww': { value: coreDesign.windowWidth, unit: 'mm', description: 'Window width' },
      'd': { value: coreDiameter, unit: 'mm', description: 'Core diameter' },
    },
    result: { value: Math.round(assemblyLength), unit: 'mm length' },
    explanation: `The core and coil assembly is ${Math.round(assemblyLength)} × ${Math.round(assemblyWidth)} × ${Math.round(assemblyHeight)} mm (L×W×H). Tank must accommodate this plus clearances.`,
    category: 'tank',
  });

  return { assemblyLength, assemblyWidth, assemblyHeight };
}

/**
 * Calculate tank internal and external dimensions.
 */
function calculateTankDimensions(
  assemblyLength: number,
  assemblyWidth: number,
  assemblyHeight: number,
  steps: CalculationStep[]
): { length: number; width: number; height: number } {
  // Clearances from core/coil to tank wall
  const sideClearance = 75;   // mm, for oil circulation and insulation
  const endClearance = 100;   // mm, extra at ends for bushings/leads
  const bottomClearance = 100; // mm, for oil sump and drain
  const topClearance = 150;    // mm, for oil expansion and leads

  // Internal dimensions
  const internalLength = assemblyLength + 2 * endClearance;
  const internalWidth = assemblyWidth + 2 * sideClearance;
  const internalHeight = assemblyHeight + bottomClearance + topClearance;

  // Tank wall thickness (approximate)
  const wallThickness = 6; // mm for welded steel construction

  // External dimensions
  const length = internalLength + 2 * wallThickness;
  const width = internalWidth + 2 * wallThickness;
  const height = internalHeight + 2 * wallThickness;

  steps.push({
    id: 'tank-dimensions',
    title: 'Tank External Dimensions',
    formula: 'Tank = Assembly + Clearances + Walls',
    inputs: {
      'assembly_L': { value: Math.round(assemblyLength), unit: 'mm', description: 'Assembly length' },
      'clearance': { value: endClearance, unit: 'mm', description: 'End clearance' },
      'wall': { value: wallThickness, unit: 'mm', description: 'Wall thickness' },
    },
    result: { value: Math.round(length), unit: 'mm tank length' },
    explanation: `Tank external dimensions: ${Math.round(length)} × ${Math.round(width)} × ${Math.round(height)} mm (L×W×H). Includes ${sideClearance}mm side clearance, ${endClearance}mm end clearance, and ${wallThickness}mm wall thickness.`,
    category: 'tank',
  });

  return { length, width, height };
}

/**
 * Calculate empty tank weight.
 */
function calculateTankWeight(
  length: number,
  width: number,
  height: number,
  steps: CalculationStep[]
): number {
  // Tank consists of:
  // - Base plate
  // - Cover plate
  // - Side walls (4)
  // - Stiffeners and fittings

  const wallThickness = 6; // mm
  const steelDensity = 7850; // kg/m³

  // Surface areas in m²
  const baseCoverArea = 2 * (length / 1000) * (width / 1000);
  const sideWallArea = 2 * (length / 1000) * (height / 1000) + 2 * (width / 1000) * (height / 1000);
  const totalSurface = baseCoverArea + sideWallArea;

  // Volume of steel
  const steelVolume = totalSurface * (wallThickness / 1000); // m³

  // Base weight from walls
  const wallWeight = steelVolume * steelDensity;

  // Add 30% for stiffeners, flanges, lifting lugs, etc.
  const tankWeight = wallWeight * 1.3;

  steps.push({
    id: 'tank-weight',
    title: 'Tank Weight',
    formula: 'W = Surface × thickness × density × 1.3',
    inputs: {
      'surface': { value: Math.round(totalSurface * 100) / 100, unit: 'm²', description: 'Total surface area' },
      'thickness': { value: wallThickness, unit: 'mm', description: 'Wall thickness' },
      'density': { value: steelDensity, unit: 'kg/m³', description: 'Steel density' },
    },
    result: { value: Math.round(tankWeight), unit: 'kg' },
    explanation: `Tank surface area: ${totalSurface.toFixed(2)} m². Base steel weight: ${Math.round(wallWeight)} kg. With 30% added for stiffeners and fittings: ${Math.round(tankWeight)} kg.`,
    category: 'tank',
  });

  return tankWeight;
}

/**
 * Calculate conservator (oil expansion) tank volume.
 */
function calculateConservatorVolume(
  oilVolume: number,
  steps: CalculationStep[]
): number {
  // Conservator must accommodate oil expansion from cold to hot
  // Oil expansion coefficient: ~0.075% per °C
  // Temperature range: typically -20°C to 100°C = 120°C range
  // Expansion: 120 × 0.00075 = 9% of oil volume

  const expansionCoeff = TRANSFORMER_OIL.expansionCoeff;
  const tempRange = 120; // °C (conservative estimate)

  const expansionFraction = tempRange * expansionCoeff;
  const expansionVolume = oilVolume * expansionFraction;

  // Conservator should be sized with margin
  // Typically 1.5× expansion volume + ullage space
  const conservatorVolume = expansionVolume * 1.5 + 20; // +20L for ullage

  steps.push({
    id: 'conservator-volume',
    title: 'Conservator Volume',
    formula: 'V_cons = V_oil × α × ΔT × 1.5 + ullage',
    inputs: {
      'V_oil': { value: Math.round(oilVolume), unit: 'L', description: 'Main tank oil volume' },
      'α': { value: expansionCoeff * 100, unit: '%/°C', description: 'Oil expansion coefficient' },
      'ΔT': { value: tempRange, unit: '°C', description: 'Temperature range' },
    },
    result: { value: Math.round(conservatorVolume), unit: 'liters' },
    explanation: `Oil expands ${(expansionFraction * 100).toFixed(1)}% over the ${tempRange}°C operating range. Conservator volume of ${Math.round(conservatorVolume)}L provides adequate expansion space plus ullage for filling/breathing.`,
    category: 'tank',
  });

  return conservatorVolume;
}

/**
 * Generate bill of materials for tank and accessories.
 */
export function generateTankBOM(
  tankDesign: TankDesign,
  requirements: DesignRequirements
): Array<{ description: string; quantity: number; unit: string; specification?: string }> {
  const isThreePhase = requirements.phases === 3;
  const voltage = requirements.primaryVoltage;

  const bom = [
    {
      description: 'Tank body (welded steel)',
      quantity: 1,
      unit: 'ea',
      specification: `${tankDesign.length}×${tankDesign.width}×${tankDesign.height}mm, 6mm wall`,
    },
    {
      description: 'Conservator tank',
      quantity: 1,
      unit: 'ea',
      specification: `${tankDesign.conservatorVolume}L capacity`,
    },
    {
      description: 'HV bushings',
      quantity: isThreePhase ? 3 : 2,
      unit: 'ea',
      specification: `${voltage}kV class, porcelain/polymer`,
    },
    {
      description: 'LV bushings',
      quantity: isThreePhase ? 4 : 2,
      unit: 'ea',
      specification: '1kV class, porcelain',
    },
    {
      description: 'Radiator panels',
      quantity: 4,
      unit: 'ea',
      specification: 'Pressed steel, 2.5m² each',
    },
    {
      description: 'Lifting lugs',
      quantity: 4,
      unit: 'ea',
      specification: `Rated for ${Math.round(tankDesign.totalWeight * 1.5)}kg`,
    },
    {
      description: 'Drain valve',
      quantity: 1,
      unit: 'ea',
      specification: '2" ball valve with sampling port',
    },
    {
      description: 'Pressure relief device',
      quantity: 1,
      unit: 'ea',
      specification: 'Spring-loaded, 10 PSI',
    },
    {
      description: 'Oil level gauge',
      quantity: 1,
      unit: 'ea',
      specification: 'Magnetic type with contacts',
    },
    {
      description: 'Oil temperature indicator',
      quantity: 1,
      unit: 'ea',
      specification: 'Dial type with contacts',
    },
    {
      description: 'Winding temperature indicator',
      quantity: 1,
      unit: 'ea',
      specification: 'Image type with contacts',
    },
    {
      description: 'Nameplate',
      quantity: 1,
      unit: 'ea',
      specification: 'Stainless steel, engraved',
    },
    {
      description: 'Ground pads',
      quantity: 2,
      unit: 'ea',
      specification: 'Welded copper pad',
    },
  ];

  return bom;
}
