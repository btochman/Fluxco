/**
 * AWG (American Wire Gauge) Table
 *
 * Complete wire sizing data for transformer winding design.
 * Includes sizes from 4/0 (0000) to 40 AWG.
 */

import type { AWGEntry } from '../types/transformer.types';

/**
 * AWG wire data table.
 * - awg: AWG number (0 = 1/0, -1 = 2/0, -2 = 3/0, -3 = 4/0)
 * - diameter: Bare wire diameter in mm
 * - area: Cross-sectional area in mm²
 * - resistancePerKm: DC resistance in Ohm/km at 20°C for copper
 */
export const AWG_TABLE: AWGEntry[] = [
  // Large gauges (4/0 to 1/0)
  { awg: -3, diameter: 11.684, area: 107.22, resistancePerKm: 0.1608 },  // 4/0 (0000)
  { awg: -2, diameter: 10.405, area: 85.03, resistancePerKm: 0.2028 },   // 3/0 (000)
  { awg: -1, diameter: 9.266, area: 67.43, resistancePerKm: 0.2557 },    // 2/0 (00)
  { awg: 0, diameter: 8.251, area: 53.49, resistancePerKm: 0.3224 },     // 1/0 (0)

  // Standard gauges (1 to 40)
  { awg: 1, diameter: 7.348, area: 42.41, resistancePerKm: 0.4066 },
  { awg: 2, diameter: 6.544, area: 33.63, resistancePerKm: 0.5127 },
  { awg: 3, diameter: 5.827, area: 26.67, resistancePerKm: 0.6465 },
  { awg: 4, diameter: 5.189, area: 21.15, resistancePerKm: 0.8152 },
  { awg: 5, diameter: 4.621, area: 16.77, resistancePerKm: 1.028 },
  { awg: 6, diameter: 4.115, area: 13.30, resistancePerKm: 1.296 },
  { awg: 7, diameter: 3.665, area: 10.55, resistancePerKm: 1.634 },
  { awg: 8, diameter: 3.264, area: 8.366, resistancePerKm: 2.061 },
  { awg: 9, diameter: 2.906, area: 6.634, resistancePerKm: 2.599 },
  { awg: 10, diameter: 2.588, area: 5.261, resistancePerKm: 3.277 },
  { awg: 11, diameter: 2.305, area: 4.172, resistancePerKm: 4.132 },
  { awg: 12, diameter: 2.053, area: 3.309, resistancePerKm: 5.211 },
  { awg: 13, diameter: 1.828, area: 2.624, resistancePerKm: 6.571 },
  { awg: 14, diameter: 1.628, area: 2.081, resistancePerKm: 8.285 },
  { awg: 15, diameter: 1.450, area: 1.650, resistancePerKm: 10.45 },
  { awg: 16, diameter: 1.291, area: 1.309, resistancePerKm: 13.17 },
  { awg: 17, diameter: 1.150, area: 1.038, resistancePerKm: 16.61 },
  { awg: 18, diameter: 1.024, area: 0.823, resistancePerKm: 20.95 },
  { awg: 19, diameter: 0.912, area: 0.653, resistancePerKm: 26.42 },
  { awg: 20, diameter: 0.812, area: 0.518, resistancePerKm: 33.31 },
  { awg: 21, diameter: 0.723, area: 0.411, resistancePerKm: 42.00 },
  { awg: 22, diameter: 0.644, area: 0.326, resistancePerKm: 52.96 },
  { awg: 23, diameter: 0.573, area: 0.258, resistancePerKm: 66.79 },
  { awg: 24, diameter: 0.511, area: 0.205, resistancePerKm: 84.22 },
  { awg: 25, diameter: 0.455, area: 0.162, resistancePerKm: 106.2 },
  { awg: 26, diameter: 0.405, area: 0.129, resistancePerKm: 133.9 },
  { awg: 27, diameter: 0.361, area: 0.102, resistancePerKm: 168.9 },
  { awg: 28, diameter: 0.321, area: 0.0810, resistancePerKm: 212.9 },
  { awg: 29, diameter: 0.286, area: 0.0642, resistancePerKm: 268.5 },
  { awg: 30, diameter: 0.255, area: 0.0509, resistancePerKm: 338.6 },
  { awg: 31, diameter: 0.227, area: 0.0404, resistancePerKm: 426.9 },
  { awg: 32, diameter: 0.202, area: 0.0320, resistancePerKm: 538.3 },
  { awg: 33, diameter: 0.180, area: 0.0254, resistancePerKm: 678.8 },
  { awg: 34, diameter: 0.160, area: 0.0201, resistancePerKm: 856.0 },
  { awg: 35, diameter: 0.143, area: 0.0160, resistancePerKm: 1079 },
  { awg: 36, diameter: 0.127, area: 0.0127, resistancePerKm: 1361 },
  { awg: 37, diameter: 0.113, area: 0.0100, resistancePerKm: 1716 },
  { awg: 38, diameter: 0.101, area: 0.00797, resistancePerKm: 2164 },
  { awg: 39, diameter: 0.0897, area: 0.00632, resistancePerKm: 2729 },
  { awg: 40, diameter: 0.0799, area: 0.00501, resistancePerKm: 3441 },
];

/**
 * Standard rectangular conductor sizes (mm x mm).
 * Used for high-current LV windings.
 */
export const RECTANGULAR_CONDUCTORS = [
  { width: 2.0, height: 4.0, area: 8.0 },
  { width: 2.5, height: 5.0, area: 12.5 },
  { width: 3.0, height: 6.0, area: 18.0 },
  { width: 3.5, height: 7.0, area: 24.5 },
  { width: 4.0, height: 8.0, area: 32.0 },
  { width: 4.5, height: 9.0, area: 40.5 },
  { width: 5.0, height: 10.0, area: 50.0 },
  { width: 5.5, height: 11.0, area: 60.5 },
  { width: 6.0, height: 12.0, area: 72.0 },
  { width: 6.5, height: 13.0, area: 84.5 },
  { width: 7.0, height: 14.0, area: 98.0 },
  { width: 8.0, height: 16.0, area: 128.0 },
  { width: 9.0, height: 18.0, area: 162.0 },
  { width: 10.0, height: 20.0, area: 200.0 },
  { width: 12.0, height: 24.0, area: 288.0 },
  { width: 15.0, height: 30.0, area: 450.0 },
];

/**
 * Continuously Transposed Conductor (CTC) standard sizes.
 * Used for very high current windings in large power transformers.
 */
export const CTC_CONDUCTORS = [
  { strands: 11, strandSize: '2.0x8.0', area: 176, width: 10.5, height: 18.0 },
  { strands: 13, strandSize: '2.0x8.0', area: 208, width: 10.5, height: 21.0 },
  { strands: 17, strandSize: '2.0x8.0', area: 272, width: 10.5, height: 27.0 },
  { strands: 21, strandSize: '2.0x10.0', area: 420, width: 12.5, height: 33.0 },
  { strands: 25, strandSize: '2.5x10.0', area: 625, width: 15.0, height: 40.0 },
  { strands: 31, strandSize: '2.5x12.0', area: 930, width: 17.0, height: 50.0 },
  { strands: 37, strandSize: '3.0x12.0', area: 1332, width: 18.5, height: 58.0 },
  { strands: 45, strandSize: '3.0x14.0', area: 1890, width: 20.5, height: 70.0 },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert AWG number to display string.
 * @param awg - AWG number (-3 = 4/0, -2 = 3/0, -1 = 2/0, 0 = 1/0, 1+ = AWG number)
 */
export function awgToString(awg: number): string {
  if (awg === -3) return '4/0 (0000)';
  if (awg === -2) return '3/0 (000)';
  if (awg === -1) return '2/0 (00)';
  if (awg === 0) return '1/0 (0)';
  return `AWG ${awg}`;
}

/**
 * Get AWG entry by AWG number.
 */
export function getAWGEntry(awg: number): AWGEntry | undefined {
  return AWG_TABLE.find(entry => entry.awg === awg);
}

/**
 * Find the best AWG size for a required cross-sectional area.
 * @param requiredArea - Required area in mm²
 * @param minArea - If true, select size with area >= required; if false, nearest
 */
export function selectAWGForArea(requiredArea: number, minArea: boolean = true): AWGEntry | null {
  // Sort by area descending
  const sorted = [...AWG_TABLE].sort((a, b) => b.area - a.area);

  if (minArea) {
    // Find smallest wire that meets or exceeds required area
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].area >= requiredArea) {
        return sorted[i];
      }
    }
    return sorted[0]; // Return largest if nothing meets requirement
  } else {
    // Find nearest match
    let closest = sorted[0];
    let minDiff = Math.abs(sorted[0].area - requiredArea);

    for (const entry of sorted) {
      const diff = Math.abs(entry.area - requiredArea);
      if (diff < minDiff) {
        minDiff = diff;
        closest = entry;
      }
    }
    return closest;
  }
}

/**
 * Find best rectangular conductor for required area.
 * @param requiredArea - Required area in mm²
 */
export function selectRectangularConductor(
  requiredArea: number
): { width: number; height: number; area: number } | null {
  // Sort by area ascending
  const sorted = [...RECTANGULAR_CONDUCTORS].sort((a, b) => a.area - b.area);

  // Find smallest that meets requirement
  for (const conductor of sorted) {
    if (conductor.area >= requiredArea) {
      return conductor;
    }
  }

  // Return largest if nothing meets requirement
  return sorted[sorted.length - 1];
}

/**
 * Calculate number of parallel conductors needed.
 * @param requiredArea - Total required area in mm²
 * @param singleConductorArea - Area of single conductor in mm²
 */
export function calculateParallelConductors(
  requiredArea: number,
  singleConductorArea: number
): number {
  return Math.ceil(requiredArea / singleConductorArea);
}

/**
 * Get recommended conductor type based on current level.
 * @param current - RMS current in Amperes
 */
export function recommendConductorType(current: number): 'round' | 'rectangular' | 'CTC' {
  if (current < 100) return 'round';
  if (current < 1000) return 'rectangular';
  return 'CTC';
}
