/**
 * Default values for PIP ELSTR01 Pro Spec fields.
 * Industry-standard defaults so users only change what deviates.
 */

import type { ProSpecData } from '../types/proSpec.types';

export function getDefaultProSpec(): ProSpecData {
  return {
    siteConditions: {
      altitudeUnit: 'ft',
      ambientTempMax: 40,
      ambientTempMin: -25,
      ambientTempAvg24hr: 30,
      seismicQualification: 'not_required',
      seismicCertificate: 'not_required',
      areaClassification: 'non_classified',
      moistCorrosiveEnvironment: false,
      environmentalDataSheet: false,
    },
    nrtlListing: 'required',
    fmApproved: 'not_required',
    windingsAndTempRise: {
      averageTempRise: 65,
      primaryConnection: 'delta',
      primaryMaterial: 'copper',
      secondaryConnection: 'wye',
      secondaryMaterial: 'aluminum',
      frequentEnergizingUnderLoad: false,
      rapidCyclingOrSurge: false,
      captiveWithLargerMotor: false,
    },
    impedance: {
      type: 'standard',
    },
    losses: {
      lossEvaluationRequired: false,
    },
    bushingsPrimary: {
      sideMounted: true,
      sideMountedPhase: true,
      underOneKvType: 'bolted',
      material: 'porcelain',
      connections: 'nema_4hole',
      bil: 'winding_bil',
    },
    bushingsSecondary: {
      sideMounted: true,
      sideMountedPhase: true,
      underOneKvType: 'bolted',
      material: 'porcelain',
      connections: 'nema_4hole',
      bil: 'winding_bil',
    },
    airTerminalChamber: {
      required: 'required',
      fullHeight: true,
      material: 'mfg_std',
      frontCover: 'hinged',
      withstandInternalFault: true,
      cableEntry: 'bottom',
    },
    tank: {
      coverType: 'welded',
      coverContinuouslyWelded: true,
      stainlessSteelBottomSupport: false,
      manufacturerStandard: true,
      jackingPads: 'not_required',
      tankVacuumRated: 'required',
      ltcPressureReliefVent: 'not_required',
    },
    groundingPads: {
      material: 'stainless_steel',
    },
    cooling: {
      radiatorType: 'mfg_std',
      radiatorMaterial: 'mfg_std',
      removableRadiators: false,
    },
    auxiliaryCooling: {
      required: 'not_required',
    },
    fans: {
      status: 'not_required',
    },
    coolingPumps: 'not_required',
    spaceHeaters: {
      requiredFor: 'none',
    },
    accessories: {
      isolationValve: true,
    },
    suddenPressureRelay: 'not_required',
    surgeArresters: {
      required: 'not_required',
    },
    pressureReliefVent: {
      required: 'not_required',
      toSafeLocation: 'not_required',
    },
    alarmAndControl: {
      controlVoltage: '125vdc',
      hermeticallySealedContacts: false,
      intrinsicallySafeBarriers: false,
    },
    nameplates: {
      material: 'laminated_plastic',
      letteringColor: 'black_on_white',
    },
    wiringAndControlCabinet: {
      branchCircuitProtection: false,
      conduitType: 'rigid_galv_steel',
    },
    audibleSound: {
      testingRequired: 'not_required',
    },
    coatings: {
      color: 'ansi_70',
    },
    tapChanger: {
      noLoad: {
        required: 'required',
        description: '5-pos. with four 2.5% taps - 2 above and 2 below',
      },
      onLoad: {
        required: 'not_required',
      },
    },
    bil: {},
    harmonics: {
      nonLinearLoads: false,
    },
    insulatingLiquid: {
      type: 'mineral_type_i',
    },
    liquidPreservation: {
      type: 'sealed_tank',
    },
    tests: {
      noLoadAndLoadLoss: true,
      witnessed: 'not_witnessed',
      frequencyResponseAnalysis: 'not_required',
    },
    shipping: {
      manufacturerStandard: true,
      valvesSealedWithTags: true,
      impactIndicator: true,
    },
    documentation: {
      designTestReportOnSimilar: true,
      electronicFormatDwg: true,
      electronicFormatPdf: true,
      reproducibleCopies: 1,
    },
    otherRequirements: '',
  };
}
