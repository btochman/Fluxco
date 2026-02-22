"use client";
import type { DesignRequirements } from '@/engine/types/transformer.types';
import type { ProSpecData, RequirementStatus } from '@/engine/types/proSpec.types';

interface SpecificationSheetProps {
  proSpec: ProSpecData;
  requirements: DesignRequirements;
}

function StatusBadge({ value }: { value?: RequirementStatus | string }) {
  if (value === 'required') return <span className="text-green-600 font-medium">Required</span>;
  if (value === 'not_required') return <span className="text-muted-foreground">Not Required</span>;
  return <span className="text-muted-foreground">{value || '—'}</span>;
}

function SpecRow({ label, value, children }: { label: string; value?: string | number | boolean | null; children?: React.ReactNode }) {
  const display = children || (
    typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
    value != null && value !== '' ? String(value) : '—'
  );
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{display}</span>
    </div>
  );
}

function Section({ title, pip, children }: { title: string; pip?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-base border-b-2 border-primary/20 pb-1 mb-2">
        {title} {pip && <span className="text-xs text-muted-foreground font-normal">({pip})</span>}
      </h3>
      {children}
    </div>
  );
}

const LIQUID_LABELS: Record<string, string> = {
  mineral_type_i: 'Mineral Oil (Type I)',
  mineral_type_ii: 'Mineral Oil (Type II)',
  silicon: 'Silicon',
  fire_resistant_ester: 'Fire Resistant Ester',
  less_flammable_hc: 'Less Flammable HC',
  mfg_discretion: 'MFG Discretion',
};

const PRESERVATION_LABELS: Record<string, string> = {
  sealed_tank: 'Sealed Tank',
  inert_gas: 'Inert Gas Pressure System',
  conservator_without_diaphragm: 'Conservator (without diaphragm)',
  conservator_with_diaphragm: 'Conservator (with diaphragm)',
};

export function SpecificationSheet({ proSpec, requirements }: SpecificationSheetProps) {
  const s = proSpec;

  return (
    <div className="space-y-2">
      {/* Rating */}
      <Section title="Rating & System Parameters" pip="4.1.1.3">
        <SpecRow label="Base Rating" value={`${requirements.ratedPower} kVA`} />
        <SpecRow label="Primary Voltage" value={`${(requirements.primaryVoltage / 1000).toFixed(1)} kV, ${requirements.phases} Phase, ${requirements.frequency} Hz`} />
        <SpecRow label="Secondary Voltage" value={`${requirements.secondaryVoltage < 1000 ? requirements.secondaryVoltage + ' V' : (requirements.secondaryVoltage / 1000).toFixed(1) + ' kV'}, ${requirements.phases} Phase, ${requirements.frequency} Hz`} />
        <SpecRow label="Vector Group" value={requirements.vectorGroup.name} />
        <SpecRow label="Cooling Class" value={requirements.coolingClass.name} />
      </Section>

      {/* Site Conditions */}
      <Section title="Site Conditions" pip="4.1.1">
        <SpecRow label="Altitude" value={s.siteConditions.altitude ? `${s.siteConditions.altitude} ${s.siteConditions.altitudeUnit || 'ft'}` : undefined} />
        <SpecRow label="Max Ambient Temp" value={s.siteConditions.ambientTempMax != null ? `${s.siteConditions.ambientTempMax}°C` : undefined} />
        <SpecRow label="Min Ambient Temp" value={s.siteConditions.ambientTempMin != null ? `${s.siteConditions.ambientTempMin}°C` : undefined} />
        <SpecRow label="Avg 24-hr Temp" value={s.siteConditions.ambientTempAvg24hr != null ? `${s.siteConditions.ambientTempAvg24hr}°C` : undefined} />
        <SpecRow label="Seismic Qualification"><StatusBadge value={s.siteConditions.seismicQualification} /></SpecRow>
        <SpecRow label="Area Classification" value={s.siteConditions.areaClassification === 'classified' ? `Classified (${[s.siteConditions.areaClass, s.siteConditions.areaDivision, s.siteConditions.areaGroup].filter(Boolean).join(', ')})` : 'Non-Classified'} />
        <SpecRow label="Moist/Corrosive Environment" value={s.siteConditions.moistCorrosiveEnvironment} />
      </Section>

      {/* Certifications */}
      <Section title="Certifications" pip="4.1.3–4.1.4">
        <SpecRow label="NRTL Listing"><StatusBadge value={s.nrtlListing} /></SpecRow>
        <SpecRow label="FM Approved"><StatusBadge value={s.fmApproved} /></SpecRow>
      </Section>

      {/* Windings */}
      <Section title="Windings & Temperature Rise" pip="4.2.1">
        <SpecRow label="Average Temp Rise" value={s.windingsAndTempRise.averageTempRise ? `${s.windingsAndTempRise.averageTempRise}°C` : undefined} />
        <SpecRow label="Primary Winding" value={`${s.windingsAndTempRise.primaryConnection === 'delta' ? 'Delta' : 'Wye'} — ${s.windingsAndTempRise.primaryMaterial === 'copper' ? 'Copper' : 'Aluminum'}`} />
        <SpecRow label="Secondary Winding" value={`${s.windingsAndTempRise.secondaryConnection === 'delta' ? 'Delta' : 'Wye'} — ${s.windingsAndTempRise.secondaryMaterial === 'copper' ? 'Copper' : 'Aluminum'}`} />
        <SpecRow label="Frequent Energizing Under Load" value={s.windingsAndTempRise.frequentEnergizingUnderLoad} />
        <SpecRow label="Rapid Cycling / Surge Loading" value={s.windingsAndTempRise.rapidCyclingOrSurge} />
        {s.windingsAndTempRise.multipleWindingNote && <SpecRow label="Multiple Winding Note" value={s.windingsAndTempRise.multipleWindingNote} />}
      </Section>

      {/* Impedance & Losses */}
      <Section title="Impedance & Losses" pip="4.2.1.4–4.2.2">
        <SpecRow label="Impedance" value={s.impedance.type === 'standard' ? 'Standard' : `Custom: ${s.impedance.customValue}%`} />
        <SpecRow label="Loss Evaluation Required" value={s.losses.lossEvaluationRequired} />
        {s.losses.lossEvaluationRequired && s.losses.dollarPerKwOffset && <SpecRow label="$ to Offset 1 kW" value={`$${s.losses.dollarPerKwOffset}`} />}
      </Section>

      {/* Bushings */}
      <Section title="Bushings & Terminal Enclosures" pip="4.2.3">
        <SpecRow label="Primary Mounting" value={s.bushingsPrimary.sideMounted ? 'Side Mounted' : 'Top Mounted'} />
        <SpecRow label="Primary Material" value={s.bushingsPrimary.material ? s.bushingsPrimary.material.charAt(0).toUpperCase() + s.bushingsPrimary.material.slice(1) : undefined} />
        <SpecRow label="Primary Connections" value={s.bushingsPrimary.connections === 'nema_4hole' ? 'NEMA 4-Hole Pad' : s.bushingsPrimary.connections === 'stud' ? 'Stud' : 'NEMA 12-Hole Pad'} />
        {s.bushingsPrimary.specialNotes && <SpecRow label="Primary Notes" value={s.bushingsPrimary.specialNotes} />}
        <SpecRow label="Secondary Mounting" value={s.bushingsSecondary.sideMounted ? 'Side Mounted' : 'Top Mounted'} />
        <SpecRow label="Secondary Bushings < 1 kV" value={s.bushingsSecondary.underOneKvType === 'bolted' ? 'Bolted' : 'Welded'} />
      </Section>

      {/* Tank */}
      <Section title="Tank" pip="4.2.4">
        <SpecRow label="Tank Cover" value={s.tank.coverType === 'welded' ? 'Welded' : 'Bolted'} />
        <SpecRow label="Continuously Welded" value={s.tank.coverContinuouslyWelded} />
        <SpecRow label="Tank Vacuum Rated"><StatusBadge value={s.tank.tankVacuumRated} /></SpecRow>
        <SpecRow label="Grounding Pads" value={s.groundingPads.material === 'stainless_steel' ? 'Stainless Steel' : 'Copper-Faced Steel'} />
      </Section>

      {/* Cooling */}
      <Section title="Cooling" pip="4.2.5">
        <SpecRow label="Radiator Type" value={s.cooling.radiatorType === 'mfg_std' ? 'Mfg. Standard' : s.cooling.radiatorType} />
        <SpecRow label="Radiator Material" value={s.cooling.radiatorMaterial === 'mfg_std' ? 'Mfg. Standard' : s.cooling.radiatorMaterial} />
        <SpecRow label="Fans" value={s.fans.status === 'required' ? `Required (${s.fans.mounting || 'radiator'} mounted)` : s.fans.status === 'provisions_for_future' ? 'Provisions for Future' : 'Not Required'} />
        <SpecRow label="Auxiliary Cooling"><StatusBadge value={s.auxiliaryCooling.required} /></SpecRow>
        <SpecRow label="Cooling Pumps"><StatusBadge value={s.coolingPumps} /></SpecRow>
      </Section>

      {/* Protection */}
      <Section title="Protection Devices" pip="4.2.6.3–4.2.6.4">
        <SpecRow label="Sudden Pressure Relay"><StatusBadge value={s.suddenPressureRelay} /></SpecRow>
        <SpecRow label="Surge Arresters"><StatusBadge value={s.surgeArresters.required} /></SpecRow>
        <SpecRow label="Pressure Relief Vent"><StatusBadge value={s.pressureReliefVent.required} /></SpecRow>
      </Section>

      {/* Accessories & CTs */}
      {(s.accessories.secondaryCTs?.quantity || s.accessories.isolationValve) && (
        <Section title="Accessories & Current Transformers" pip="4.2.6">
          <SpecRow label="Isolation Valve" value={s.accessories.isolationValve} />
          {s.accessories.secondaryCTs?.quantity && (
            <>
              <SpecRow label="Secondary CTs" value={`${s.accessories.secondaryCTs.quantity}x, Ratio: ${s.accessories.secondaryCTs.ratio || '—'}`} />
              <SpecRow label="CT Purpose" value={s.accessories.secondaryCTs.purpose === 'metering' ? 'Metering' : 'Relaying'} />
              {s.accessories.secondaryCTs.location && <SpecRow label="CT Location" value={s.accessories.secondaryCTs.location} />}
            </>
          )}
          {s.accessories.otherAccuracyClass && <SpecRow label="Accuracy Class" value={s.accessories.otherAccuracyClass} />}
        </Section>
      )}

      {/* Alarm & Control */}
      <Section title="Alarm & Control" pip="4.2.8">
        <SpecRow label="Control Voltage" value={s.alarmAndControl.controlVoltage === '120vac' ? '120 VAC' : s.alarmAndControl.controlVoltage === '125vdc' ? '125 VDC' : s.alarmAndControl.controlVoltageOther || 'Other'} />
        <SpecRow label="Hermetically Sealed Contacts" value={s.alarmAndControl.hermeticallySealedContacts} />
      </Section>

      {/* Coatings */}
      <Section title="Coatings" pip="4.2.11">
        <SpecRow label="Color" value={s.coatings.color === 'ansi_61' ? 'ANSI 61 (Light Gray)' : s.coatings.color === 'ansi_70' ? 'ANSI 70 (Medium Gray)' : s.coatings.colorOther || 'Other'} />
        {s.coatings.paintThicknessMils && <SpecRow label="Paint Thickness" value={`${s.coatings.paintThicknessMils} mils`} />}
      </Section>

      {/* Tap Changer */}
      <Section title="Tap Changer" pip="4.2.12">
        <SpecRow label="No-Load Tap Changer"><StatusBadge value={s.tapChanger.noLoad.required} /></SpecRow>
        {s.tapChanger.noLoad.description && <SpecRow label="NLTC Description" value={s.tapChanger.noLoad.description} />}
        <SpecRow label="On-Load Tap Changer"><StatusBadge value={s.tapChanger.onLoad.required} /></SpecRow>
        {s.tapChanger.onLoad.required === 'required' && s.tapChanger.onLoad.regulationRange && (
          <SpecRow label="OLTC Range" value={s.tapChanger.onLoad.regulationRange} />
        )}
      </Section>

      {/* BIL */}
      <Section title="Basic Impulse Insulation Level" pip="4.2.14">
        <SpecRow label="Primary BIL" value={s.bil.primaryBilKv ? `${s.bil.primaryBilKv} kV` : undefined} />
        <SpecRow label="Secondary BIL" value={s.bil.secondaryBilKv ? `${s.bil.secondaryBilKv} kV` : undefined} />
        <SpecRow label="Non-Linear Loads (Harmonics)" value={s.harmonics.nonLinearLoads} />
      </Section>

      {/* Insulating Liquid */}
      <Section title="Insulating Liquid" pip="4.3">
        <SpecRow label="Type" value={LIQUID_LABELS[s.insulatingLiquid.type || ''] || s.insulatingLiquid.type} />
        <SpecRow label="Preservation System" value={PRESERVATION_LABELS[s.liquidPreservation.type || ''] || s.liquidPreservation.type} />
      </Section>

      {/* Tests */}
      <Section title="Tests" pip="4.4">
        <SpecRow label="No-Load & Load Loss Test" value={s.tests.noLoadAndLoadLoss} />
        <SpecRow label="Temperature Rise" value={s.tests.tempRise} />
        <SpecRow label="Lightning Impulse" value={s.tests.lightningImpulse} />
        <SpecRow label="Switching Impulse" value={s.tests.switchingImpulse} />
        <SpecRow label="Audible Sound Level" value={s.tests.audibleSoundLevel} />
        <SpecRow label="Frequency Response Analysis"><StatusBadge value={s.tests.frequencyResponseAnalysis} /></SpecRow>
        <SpecRow label="Witnessed" value={s.tests.witnessed === 'witnessed' ? 'Witnessed' : 'Not Witnessed'} />
      </Section>

      {/* Shipping */}
      <Section title="Shipping" pip="4.5">
        <SpecRow label="Manufacturer Standard" value={s.shipping.manufacturerStandard} />
        <SpecRow label="Valves Sealed with Tags" value={s.shipping.valvesSealedWithTags} />
        <SpecRow label="Impact Indicator" value={s.shipping.impactIndicator} />
      </Section>

      {/* Documentation */}
      <Section title="Documentation" pip="4.6">
        <SpecRow label="Design Test Report on Similar Units" value={s.documentation.designTestReportOnSimilar} />
        <SpecRow label="Electronic Formats" value={[
          s.documentation.electronicFormatDwg && 'DWG',
          s.documentation.electronicFormatPdf && 'PDF',
          s.documentation.electronicFormat3dModel && '3D Model',
        ].filter(Boolean).join(', ') || '—'} />
        {s.documentation.reproducibleCopies && <SpecRow label="Reproducible Copies" value={s.documentation.reproducibleCopies} />}
      </Section>

      {/* Other Requirements */}
      {s.otherRequirements && (
        <Section title="Other Requirements">
          <div className="text-sm whitespace-pre-wrap">{s.otherRequirements}</div>
        </Section>
      )}
    </div>
  );
}

export default SpecificationSheet;
