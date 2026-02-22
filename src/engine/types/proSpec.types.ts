/**
 * PIP ELSTR01 Data Sheet Types
 *
 * Comprehensive procurement/manufacturing spec fields
 * matching the PIP ELSTR01 standard for liquid-immersed
 * pad mount transformers 750 kVA and above.
 *
 * These fields are collected in "Pro" mode and pass through
 * to output/storage — they do NOT feed the physics engine.
 */

// ============================================================================
// Top-level container
// ============================================================================

export interface ProSpecData {
  siteConditions: SiteConditions;
  nrtlListing: RequirementStatus;
  fmApproved: RequirementStatus;
  windingsAndTempRise: WindingsAndTempRise;
  impedance: ProImpedance;
  losses: ProLosses;
  bushingsPrimary: BushingSpec;
  bushingsSecondary: BushingSpec;
  airTerminalChamber: AirTerminalChamber;
  tank: ProTankSpec;
  groundingPads: GroundingPadSpec;
  cooling: ProCooling;
  auxiliaryCooling: AuxiliaryCooling;
  fans: FanSpec;
  coolingPumps: RequirementStatus;
  spaceHeaters: SpaceHeaterSpec;
  accessories: ProAccessories;
  suddenPressureRelay: RequirementStatus;
  surgeArresters: SurgeArresterSpec;
  pressureReliefVent: PressureReliefVentSpec;
  alarmAndControl: AlarmControlSpec;
  nameplates: NameplateSpec;
  wiringAndControlCabinet: WiringCabinetSpec;
  audibleSound: AudibleSoundSpec;
  coatings: CoatingSpec;
  tapChanger: ProTapChangerSpec;
  bil: BILSpec;
  harmonics: HarmonicsSpec;
  insulatingLiquid: InsulatingLiquidSpec;
  liquidPreservation: LiquidPreservationSpec;
  tests: TestSpec;
  shipping: ShippingSpec;
  documentation: DocumentationSpec;
  otherRequirements: string;
}

// ============================================================================
// Shared types
// ============================================================================

export type RequirementStatus = 'required' | 'not_required';

// ============================================================================
// Section 4.1.1 — Site Conditions
// ============================================================================

export interface SiteConditions {
  altitude?: number;
  altitudeUnit?: 'ft' | 'm';
  ambientTempMax?: number;
  ambientTempMin?: number;
  ambientTempAvg24hr?: number;
  seismicQualification?: 'required' | 'not_required';
  seismicStandards?: string;
  seismicCertificate?: 'required' | 'not_required';
  areaClassification?: 'non_classified' | 'classified';
  areaClass?: string;
  areaDivision?: string;
  areaGroup?: string;
  autoIgnitionTemp?: number;
  moistCorrosiveEnvironment?: boolean;
  environmentalDataSheet?: boolean;
  other?: string;
}

// ============================================================================
// Section 4.2.1 — Windings & Temperature Rise
// ============================================================================

export interface WindingsAndTempRise {
  averageTempRise?: 55 | 65;
  primaryConnection?: 'delta' | 'wye';
  primaryMaterial?: 'copper' | 'aluminum';
  primaryMaterialNote?: string;
  secondaryConnection?: 'delta' | 'wye';
  secondaryMaterial?: 'copper' | 'aluminum';
  secondaryMaterialNote?: string;
  frequentEnergizingUnderLoad?: boolean;
  rapidCyclingOrSurge?: boolean;
  captiveWithLargerMotor?: boolean;
  motorHP?: number;
  motorVolts?: number;
  motorFLA?: number;
  motorLRA?: number;
  motorAccelerationTime?: number;
  permissibleMotorStarts?: number;
  timeBetweenStarts?: number;
  multipleWindingNote?: string;
}

// ============================================================================
// Section 4.2.1.4 — Impedance
// ============================================================================

export interface ProImpedance {
  type?: 'standard' | 'custom';
  customValue?: number;
}

// ============================================================================
// Section 4.2.2 — Losses
// ============================================================================

export interface ProLosses {
  lossEvaluationRequired?: boolean;
  dollarPerKwOffset?: number;
  evaluationLoadPoint?: '40' | '75' | 'other';
  evaluationLoadPointOther?: string;
  loadLossesKw?: number;
  noLoadLossesKw?: number;
  auxLoadLossesKw?: number;
}

// ============================================================================
// Section 4.2.3 — Bushings & Terminal Enclosures
// ============================================================================

export interface BushingSpec {
  topMounted?: boolean;
  topMountedPhase?: boolean;
  topMountedNeutral?: boolean;
  sideMounted?: boolean;
  sideMountedPhase?: boolean;
  sideMountedNeutral?: boolean;
  underOneKvType?: 'welded' | 'bolted';
  material?: 'porcelain' | 'cycloaliphatic' | 'epoxy';
  connections?: 'nema_4hole' | 'stud' | 'nema_12hole';
  bil?: 'winding_bil' | 'custom';
  bilCustomValue?: string;
  flangedThroat?: boolean;
  specialNotes?: string;
}

export interface AirTerminalChamber {
  required?: RequirementStatus;
  fullHeight?: boolean;
  material?: 'mfg_std' | 'other';
  materialOther?: string;
  frontCover?: 'bolted' | 'hinged';
  withstandInternalFault?: boolean;
  internalFaultLevel?: number;
  cableEntry?: 'top' | 'sides' | 'bottom';
  minSpaceCableEntryToBushing?: number;
  closeCoupledToSwitch?: boolean;
}

// ============================================================================
// Section 4.2.4 — Tank
// ============================================================================

export interface ProTankSpec {
  coverType?: 'bolted' | 'welded';
  coverContinuouslyWelded?: boolean;
  stainlessSteelBottomSupport?: boolean;
  manufacturerStandard?: boolean;
  jackingPads?: RequirementStatus;
  tankVacuumRated?: RequirementStatus;
  ltcPressureReliefVent?: RequirementStatus;
}

export interface GroundingPadSpec {
  material?: 'stainless_steel' | 'copper_faced_steel';
}

// ============================================================================
// Section 4.2.5 — Cooling
// ============================================================================

export interface ProCooling {
  radiatorType?: 'tube' | 'formed_sheet_metal' | 'mfg_std' | 'other';
  radiatorTypeOther?: string;
  radiatorMaterial?: 'stainless_steel' | 'galv_steel' | 'mfg_std';
  removableRadiators?: boolean;
}

export interface AuxiliaryCooling {
  required?: RequirementStatus;
  remoteAlarmContact?: boolean;
  lockableControlSwitch?: boolean;
  controlledByHighWindingTemp?: boolean;
  controlCabinetNemaRating?: string;
}

export interface FanSpec {
  status?: 'required' | 'provisions_for_future' | 'not_required';
  mounting?: 'tank' | 'radiator';
  voltage?: string;
}

// ============================================================================
// Section 4.2.3 — Space Heaters
// ============================================================================

export interface SpaceHeaterSpec {
  requiredFor?: 'primary_atc' | 'secondary_atc' | 'both' | 'none';
  temperatureToMaintain?: number;
  ammeter?: boolean;
  ledIndicator?: boolean;
  pushToTestLed?: boolean;
  thermostatWithBypass?: boolean;
}

// ============================================================================
// Section 4.2.6 — Accessories
// ============================================================================

export interface CTSpec {
  quantity?: number;
  ratio?: string;
  multiRatio?: boolean;
  purpose?: 'metering' | 'relaying';
  location?: string;
}

export interface ProAccessories {
  isolationValve?: boolean;
  primaryCTs?: CTSpec;
  secondaryCTs?: CTSpec;
  neutralCTs?: CTSpec;
  otherAccuracyClass?: string;
}

export interface SurgeArresterSpec {
  required?: RequirementStatus;
  type?: string;
  voltageRating?: number;
  mcovRating?: number;
}

export interface PressureReliefVentSpec {
  required?: RequirementStatus;
  toSafeLocation?: RequirementStatus;
}

// ============================================================================
// Section 4.2.8 — Alarm & Control Devices
// ============================================================================

export interface AlarmControlSpec {
  controlVoltage?: '120vac' | '125vdc' | 'other';
  controlVoltageOther?: string;
  hermeticallySealedContacts?: boolean;
  intrinsicallySafeBarriers?: boolean;
}

// ============================================================================
// Section 4.2.8.5 — Nameplates
// ============================================================================

export interface NameplateSpec {
  material?: 'laminated_plastic' | 'vinyl_adhesive';
  letteringColor?: 'black_on_white' | 'other';
  letteringColorOther?: string;
}

// ============================================================================
// Section 4.2.9 — Wiring & Control Cabinet
// ============================================================================

export interface WiringCabinetSpec {
  branchCircuitProtection?: boolean;
  conduitType?: 'rigid_galv_steel' | 'liquid_tight' | 'other';
  conduitTypeOther?: string;
  spaceHeater?: boolean;
  ammeter?: boolean;
  ledIndicator?: boolean;
  pushToTestLed?: boolean;
  thermostatWithBypass?: boolean;
}

// ============================================================================
// Section 4.2.10 — Audible Sound
// ============================================================================

export interface AudibleSoundSpec {
  testingRequired?: RequirementStatus;
  other?: string;
}

// ============================================================================
// Section 4.2.11 — Coatings
// ============================================================================

export interface CoatingSpec {
  color?: 'ansi_61' | 'ansi_70' | 'other';
  colorOther?: string;
  alternatePaintSystem?: boolean;
  paintType?: string;
  paintThicknessMils?: number;
}

// ============================================================================
// Section 4.2.12 — Tap Changer
// ============================================================================

export interface ProTapChangerSpec {
  noLoad: {
    required?: RequirementStatus;
    description?: string;
  };
  onLoad: {
    required?: RequirementStatus;
    regulationRange?: string;
    steps?: string;
    autoControlled?: RequirementStatus;
    controllerType?: string;
    loadTapSelector?: string;
  };
}

// ============================================================================
// Section 4.2.14 — BIL
// ============================================================================

export interface BILSpec {
  primaryBilKv?: number;
  secondaryBilKv?: number;
}

// ============================================================================
// Section 4.2.15 — Harmonics
// ============================================================================

export interface HarmonicsSpec {
  nonLinearLoads?: boolean;
  description?: string;
}

// ============================================================================
// Section 4.3 — Insulating Liquid
// ============================================================================

export interface InsulatingLiquidSpec {
  type?: 'mineral_type_i' | 'mineral_type_ii' | 'silicon' | 'fire_resistant_ester' | 'less_flammable_hc' | 'mfg_discretion';
  note?: string;
}

export interface LiquidPreservationSpec {
  type?: 'sealed_tank' | 'inert_gas' | 'conservator_without_diaphragm' | 'conservator_with_diaphragm';
}

// ============================================================================
// Section 4.4 — Tests
// ============================================================================

export interface TestSpec {
  noLoadAndLoadLoss?: boolean;
  tempRise?: boolean;
  lightningImpulse?: boolean;
  switchingImpulse?: boolean;
  frontOfWave?: boolean;
  audibleSoundLevel?: boolean;
  frequencyResponseAnalysis?: RequirementStatus;
  witnessed?: 'witnessed' | 'not_witnessed';
  other?: string;
}

// ============================================================================
// Section 4.5 — Shipping
// ============================================================================

export interface ShippingSpec {
  manufacturerStandard?: boolean;
  valvesSealedWithTags?: boolean;
  tempBushingsForTesting?: boolean;
  impactIndicator?: boolean;
  other?: string;
}

// ============================================================================
// Section 4.6 — Documentation
// ============================================================================

export interface DocumentationSpec {
  shortCircuitDesignQualification?: boolean;
  designTestReportOnSimilar?: boolean;
  electronicFormatDwg?: boolean;
  electronicFormatPdf?: boolean;
  electronicFormat3dModel?: boolean;
  electronicFormatOther?: string;
  reproducibleCopies?: number;
  documentCopies?: number;
  manualCopies?: number;
}
