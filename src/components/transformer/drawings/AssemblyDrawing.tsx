import type { CoreDesign, WindingDesign, TankDesign, ThermalDesign, BillOfMaterials as BOMType, DesignRequirements } from '@/engine/types/transformer.types';
import { DrawingSheet, DRAWING_AREA } from './DrawingSheet';

interface AssemblyDrawingProps {
  core: CoreDesign;
  hvWinding: WindingDesign;
  lvWinding: WindingDesign;
  tank: TankDesign;
  thermal: ThermalDesign;
  primaryVoltage: number;
  secondaryVoltage: number;
  vectorGroup: string;
  requirements?: DesignRequirements;
  bom?: BOMType;
}

export function AssemblyDrawing({
  core,
  hvWinding,
  lvWinding,
  tank,
  thermal,
  primaryVoltage,
  secondaryVoltage,
  vectorGroup,
  requirements,
  bom,
}: AssemblyDrawingProps) {
  // Drawing area
  const area = DRAWING_AREA;

  // Main drawing zone (right portion for the front view)
  const drawX = area.x + 220;
  const drawY = area.y + 20;
  const drawW = area.width - 240;
  const drawH = area.height - 140;

  // Scale to fit tank in drawing zone
  const scaleX = (drawW - 120) / (tank.width + 200); // extra for radiators
  const scaleY = (drawH - 80) / tank.overallHeight;
  const scale = Math.min(scaleX, scaleY);

  // Scaled dimensions
  const tankW = tank.width * scale;
  const tankH = tank.height * scale;

  // Tank position (centered in drawing zone)
  const tankCX = drawX + drawW / 2;
  const tankLeft = tankCX - tankW / 2;
  const tankTop = drawY + 80;

  // Bushing dimensions
  const hvBushH = 50;
  const lvBushH = 35;
  const bushW = 10;
  const bushSpacing = tankW / 4;

  // Radiator dimensions
  const radW = 18;
  const radH = tankH * 0.6;
  const radTop = tankTop + tankH * 0.2;
  const numRads = Math.min(thermal.numberOfRadiators, 4);

  // Conservator
  const consW = tankW * 0.4;
  const consH = 20;
  const consTop = tankTop - consH - 25;

  // Generate drawing number from specs
  const dwgNum = `FT-${Math.round((requirements?.ratedPower || 1500) / 1000 * 10)}-${Math.round(primaryVoltage / 1000)}`;

  return (
    <DrawingSheet
      title="OUTLINE DRAWING - FRONT ELEVATION"
      drawingNumber={dwgNum}
      scale="NOT TO SCALE"
      revision="0"
      sheetOf="1 OF 3"
    >
      {/* === WEIGHT TABLE (upper-left) === */}
      <g fontFamily="Arial, sans-serif" fontSize="7" fill="#000">
        <text x={area.x + 5} y={area.y + 10} fontSize="8" fontWeight="bold">
          APPROXIMATE WEIGHTS &amp; MEASURES
        </text>
        {/* Table frame */}
        <rect x={area.x} y={area.y + 15} width={200} height={130} fill="none" stroke="#000" strokeWidth="0.5" />
        <line x1={area.x} y1={area.y + 28} x2={area.x + 200} y2={area.y + 28} stroke="#000" strokeWidth="0.5" />
        <line x1={area.x + 140} y1={area.y + 15} x2={area.x + 140} y2={area.y + 145} stroke="#000" strokeWidth="0.5" />
        {/* Headers */}
        <text x={area.x + 5} y={area.y + 25} fontSize="6" fontWeight="bold">ITEM</text>
        <text x={area.x + 145} y={area.y + 25} fontSize="6" fontWeight="bold">VALUE</text>
        {/* Rows */}
        {[
          ['CORE WEIGHT', `${core.coreWeight.toFixed(0)} kg`],
          ['COPPER/ALUMINUM WEIGHT', `${(hvWinding.conductorWeight + lvWinding.conductorWeight).toFixed(0)} kg`],
          ['OIL VOLUME', `${thermal.oilVolume.toFixed(0)} L`],
          ['OIL WEIGHT', `${thermal.oilWeight.toFixed(0)} kg`],
          ['TANK WEIGHT', `${tank.tankWeight.toFixed(0)} kg`],
          ['', ''],
          ['TOTAL WEIGHT (FILLED)', `${tank.totalWeight.toFixed(0)} kg`],
          ['SHIPPING WEIGHT', `${tank.shippingWeight.toFixed(0)} kg`],
        ].map(([label, value], i) => {
          const y = area.y + 40 + i * 13;
          const isBold = label.includes('TOTAL') || label.includes('SHIPPING');
          return (
            <g key={i}>
              {i === 6 && <line x1={area.x} y1={y - 5} x2={area.x + 200} y2={y - 5} stroke="#000" strokeWidth="0.5" />}
              <text x={area.x + 5} y={y} fontWeight={isBold ? 'bold' : 'normal'}>{label}</text>
              <text x={area.x + 145} y={y} fontWeight={isBold ? 'bold' : 'normal'}>{value}</text>
            </g>
          );
        })}
      </g>

      {/* === NOTES (below weight table) === */}
      <g fontFamily="Arial, sans-serif" fontSize="6.5" fill="#000">
        <text x={area.x + 5} y={area.y + 165} fontSize="8" fontWeight="bold">NOTES:</text>
        {[
          '1. ALL DIMENSIONS ARE IN MILLIMETERS UNLESS OTHERWISE NOTED.',
          '2. TRANSFORMER SHALL BE SUITABLE FOR OUTDOOR OPERATION.',
          `3. COOLING CLASS: ${requirements?.coolingClass?.name || 'ONAN'}`,
          `4. OIL VOLUME SHALL BE SUFFICIENT FOR COMPLETE FILLING`,
          '   OF TANK AND ALL ACCESSORIES.',
          `5. VECTOR GROUP: ${vectorGroup}`,
          `6. IMPEDANCE: ${requirements?.targetImpedance || 5.75}% AT RATED KVA.`,
          `7. AMBIENT TEMPERATURE: ${requirements?.ambientTemperature || 40}°C MAX.`,
        ].map((note, i) => (
          <text key={i} x={area.x + 5} y={area.y + 180 + i * 11}>{note}</text>
        ))}
      </g>

      {/* === FRONT VIEW DRAWING === */}

      {/* Conservator */}
      <rect
        x={tankCX - consW / 2} y={consTop} width={consW} height={consH}
        fill="none" stroke="#000" strokeWidth="1.5"
      />
      {/* Oil level indicator */}
      <rect x={tankCX - consW / 2 + 8} y={consTop + 4} width={14} height={12} fill="none" stroke="#000" strokeWidth="0.5" />
      <line x1={tankCX - consW / 2 + 12} y1={consTop + 10} x2={tankCX - consW / 2 + 18} y2={consTop + 10} stroke="#000" strokeWidth="1" />
      {/* Conservator pipe */}
      <line x1={tankCX} y1={consTop + consH} x2={tankCX} y2={tankTop} stroke="#000" strokeWidth="2" />
      {/* BOM callout */}
      <g>
        <line x1={tankCX + consW / 2 + 5} y1={consTop + consH / 2} x2={tankCX + consW / 2 + 25} y2={consTop + consH / 2 - 10} stroke="#000" strokeWidth="0.5" markerEnd="url(#leaderArrow)" transform={`rotate(180, ${tankCX + consW / 2 + 15}, ${consTop + consH / 2 - 5})`} />
        <text x={tankCX + consW / 2 + 28} y={consTop + consH / 2 - 8} fontSize="6" fontFamily="Arial, sans-serif" fill="#000">CONSERVATOR</text>
      </g>

      {/* Main Tank */}
      <rect
        x={tankLeft} y={tankTop} width={tankW} height={tankH}
        fill="none" stroke="#000" strokeWidth="2"
      />

      {/* Tank stiffeners */}
      {[0.25, 0.5, 0.75].map((pos, i) => (
        <line
          key={i}
          x1={tankLeft + tankW * pos} y1={tankTop}
          x2={tankLeft + tankW * pos} y2={tankTop + tankH}
          stroke="#000" strokeWidth="0.5" strokeDasharray="8,4"
        />
      ))}

      {/* Core limbs (hidden, dashed) */}
      {[0.25, 0.5, 0.75].map((pos, i) => {
        const limbX = tankLeft + tankW * pos;
        const limbW = core.coreDiameter * scale * 0.3;
        const limbH = tankH * 0.6;
        const limbTop = tankTop + tankH * 0.2;
        return (
          <g key={i}>
            {/* Core limb */}
            <rect
              x={limbX - limbW / 2} y={limbTop} width={limbW} height={limbH}
              fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
            />
            {/* LV Winding (inner) */}
            <rect
              x={limbX - limbW / 2 - 8} y={limbTop + 8} width={7} height={limbH - 16}
              fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
            />
            <rect
              x={limbX + limbW / 2 + 1} y={limbTop + 8} width={7} height={limbH - 16}
              fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
            />
            {/* HV Winding (outer) */}
            <rect
              x={limbX - limbW / 2 - 17} y={limbTop + 8} width={7} height={limbH - 16}
              fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
            />
            <rect
              x={limbX + limbW / 2 + 10} y={limbTop + 8} width={7} height={limbH - 16}
              fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
            />
          </g>
        );
      })}

      {/* Top yoke (hidden) */}
      <rect
        x={tankLeft + tankW * 0.15} y={tankTop + tankH * 0.15}
        width={tankW * 0.7} height={core.coreDiameter * scale * 0.15}
        fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
      />
      {/* Bottom yoke (hidden) */}
      <rect
        x={tankLeft + tankW * 0.15} y={tankTop + tankH * 0.8}
        width={tankW * 0.7} height={core.coreDiameter * scale * 0.15}
        fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
      />

      {/* Radiators - Left */}
      {Array.from({ length: numRads }).map((_, i) => (
        <g key={`left-${i}`}>
          <rect
            x={tankLeft - radW - 4 - i * 7} y={radTop} width={radW} height={radH}
            fill="none" stroke="#000" strokeWidth="1"
          />
          {/* Fin lines */}
          {Array.from({ length: Math.floor(radH / 6) }).map((_, j) => (
            <line
              key={j}
              x1={tankLeft - radW - 3 - i * 7} y1={radTop + 3 + j * 6}
              x2={tankLeft - 5 - i * 7} y2={radTop + 3 + j * 6}
              stroke="#000" strokeWidth="0.3"
            />
          ))}
          {/* Inlet/outlet pipes */}
          <line x1={tankLeft} y1={radTop + 12} x2={tankLeft - 4 - i * 7} y2={radTop + 12} stroke="#000" strokeWidth="1.5" />
          <line x1={tankLeft} y1={radTop + radH - 12} x2={tankLeft - 4 - i * 7} y2={radTop + radH - 12} stroke="#000" strokeWidth="1.5" />
        </g>
      ))}

      {/* Radiators - Right */}
      {Array.from({ length: numRads }).map((_, i) => (
        <g key={`right-${i}`}>
          <rect
            x={tankLeft + tankW + 4 + i * 7} y={radTop} width={radW} height={radH}
            fill="none" stroke="#000" strokeWidth="1"
          />
          {/* Fin lines */}
          {Array.from({ length: Math.floor(radH / 6) }).map((_, j) => (
            <line
              key={j}
              x1={tankLeft + tankW + 5 + i * 7} y1={radTop + 3 + j * 6}
              x2={tankLeft + tankW + 3 + radW + i * 7} y2={radTop + 3 + j * 6}
              stroke="#000" strokeWidth="0.3"
            />
          ))}
          {/* Inlet/outlet pipes */}
          <line x1={tankLeft + tankW} y1={radTop + 12} x2={tankLeft + tankW + 4 + i * 7} y2={radTop + 12} stroke="#000" strokeWidth="1.5" />
          <line x1={tankLeft + tankW} y1={radTop + radH - 12} x2={tankLeft + tankW + 4 + i * 7} y2={radTop + radH - 12} stroke="#000" strokeWidth="1.5" />
        </g>
      ))}

      {/* HV Bushings (3 phases) */}
      {[0, 1, 2].map((i) => {
        const bx = tankLeft + bushSpacing * (i + 0.5);
        return (
          <g key={`hv-${i}`}>
            <rect x={bx - bushW / 2} y={tankTop - hvBushH} width={bushW} height={hvBushH} fill="none" stroke="#000" strokeWidth="1" />
            {/* Insulator sheds */}
            {[0.2, 0.4, 0.6, 0.8].map((pos, j) => (
              <line key={j} x1={bx - bushW / 2 - 3} y1={tankTop - hvBushH * pos} x2={bx + bushW / 2 + 3} y2={tankTop - hvBushH * pos} stroke="#000" strokeWidth="0.5" />
            ))}
            {/* Terminal */}
            <circle cx={bx} cy={tankTop - hvBushH - 5} r={4} fill="none" stroke="#000" strokeWidth="1" />
            <line x1={bx - 3} y1={tankTop - hvBushH - 5} x2={bx + 3} y2={tankTop - hvBushH - 5} stroke="#000" strokeWidth="0.5" />
            <line x1={bx} y1={tankTop - hvBushH - 8} x2={bx} y2={tankTop - hvBushH - 2} stroke="#000" strokeWidth="0.5" />
            {/* Label */}
            <text x={bx} y={tankTop - hvBushH - 14} textAnchor="middle" fontSize="7" fontFamily="Arial, sans-serif" fontWeight="bold" fill="#000">
              H{i + 1}
            </text>
          </g>
        );
      })}

      {/* LV Bushings (3 phases + neutral) */}
      {[0, 1, 2, 3].map((i) => {
        const bx = tankLeft + tankW - bushSpacing * (i + 0.5);
        const isNeutral = i === 3;
        return (
          <g key={`lv-${i}`}>
            <rect x={bx - bushW / 2} y={tankTop - lvBushH} width={bushW} height={lvBushH} fill="none" stroke="#000" strokeWidth="1" />
            {/* Insulator sheds */}
            {[0.3, 0.7].map((pos, j) => (
              <line key={j} x1={bx - bushW / 2 - 2} y1={tankTop - lvBushH * pos} x2={bx + bushW / 2 + 2} y2={tankTop - lvBushH * pos} stroke="#000" strokeWidth="0.5" />
            ))}
            {/* Terminal */}
            <circle cx={bx} cy={tankTop - lvBushH - 4} r={3.5} fill="none" stroke="#000" strokeWidth="1" />
            <line x1={bx - 2.5} y1={tankTop - lvBushH - 4} x2={bx + 2.5} y2={tankTop - lvBushH - 4} stroke="#000" strokeWidth="0.5" />
            <line x1={bx} y1={tankTop - lvBushH - 7} x2={bx} y2={tankTop - lvBushH - 1} stroke="#000" strokeWidth="0.5" />
            {/* Label */}
            <text x={bx} y={tankTop - lvBushH - 12} textAnchor="middle" fontSize="7" fontFamily="Arial, sans-serif" fontWeight="bold" fill="#000">
              {isNeutral ? 'X0' : `X${i + 1}`}
            </text>
          </g>
        );
      })}

      {/* Tap Changer */}
      <rect
        x={tankLeft + tankW + 4} y={tankTop + 15} width={25} height={40}
        fill="none" stroke="#000" strokeWidth="1"
      />
      <circle cx={tankLeft + tankW + 16} cy={tankTop + 30} r={7} fill="none" stroke="#000" strokeWidth="1" />
      <text x={tankLeft + tankW + 16} y={tankTop + 60} textAnchor="middle" fontSize="5" fontFamily="Arial, sans-serif" fill="#000">
        OLTC
      </text>

      {/* Drain valve */}
      <rect x={tankCX - 8} y={tankTop + tankH} width={16} height={8} fill="none" stroke="#000" strokeWidth="1" />
      <circle cx={tankCX} cy={tankTop + tankH + 12} r={4} fill="none" stroke="#000" strokeWidth="1" />

      {/* Grounding pad */}
      <rect x={tankLeft + 8} y={tankTop + tankH - 15} width={10} height={10} fill="none" stroke="#000" strokeWidth="0.5" />
      {/* Ground symbol */}
      <g>
        <line x1={tankLeft + 13} y1={tankTop + tankH - 3} x2={tankLeft + 13} y2={tankTop + tankH + 3} stroke="#000" strokeWidth="0.5" />
        <line x1={tankLeft + 8} y1={tankTop + tankH + 3} x2={tankLeft + 18} y2={tankTop + tankH + 3} stroke="#000" strokeWidth="0.5" />
        <line x1={tankLeft + 10} y1={tankTop + tankH + 6} x2={tankLeft + 16} y2={tankTop + tankH + 6} stroke="#000" strokeWidth="0.5" />
        <line x1={tankLeft + 11.5} y1={tankTop + tankH + 9} x2={tankLeft + 14.5} y2={tankTop + tankH + 9} stroke="#000" strokeWidth="0.5" />
      </g>

      {/* Nameplate */}
      <rect x={tankLeft + 12} y={tankTop + tankH * 0.4} width={30} height={18} fill="none" stroke="#000" strokeWidth="0.5" />
      <text x={tankLeft + 27} y={tankTop + tankH * 0.4 + 11} textAnchor="middle" fontSize="4.5" fontFamily="Arial, sans-serif" fill="#000">
        NAMEPLATE
      </text>

      {/* Structural base */}
      <rect x={tankLeft - 5} y={tankTop + tankH} width={tankW + 10} height={6} fill="none" stroke="#000" strokeWidth="1" />

      {/* Lifting lugs */}
      {[0.1, 0.9].map((pos, i) => (
        <g key={i}>
          <rect x={tankLeft + tankW * pos - 4} y={tankTop - 2} width={8} height={5} fill="none" stroke="#000" strokeWidth="0.5" />
          <circle cx={tankLeft + tankW * pos} cy={tankTop - 5} r={2.5} fill="none" stroke="#000" strokeWidth="0.5" />
        </g>
      ))}

      {/* Jack pads */}
      {[0.15, 0.85].map((pos, i) => (
        <rect key={i} x={tankLeft + tankW * pos - 5} y={tankTop + tankH + 6} width={10} height={4} fill="none" stroke="#000" strokeWidth="0.5" />
      ))}

      {/* === DIMENSION LINES === */}
      <g stroke="#000" strokeWidth="0.4" fill="#000" fontFamily="Arial, sans-serif" fontSize="7">
        {/* Tank width (bottom) */}
        <line x1={tankLeft} y1={tankTop + tankH + 25} x2={tankLeft + tankW} y2={tankTop + tankH + 25} markerStart="url(#dimArrowRev)" markerEnd="url(#dimArrow)" />
        <line x1={tankLeft} y1={tankTop + tankH + 18} x2={tankLeft} y2={tankTop + tankH + 32} />
        <line x1={tankLeft + tankW} y1={tankTop + tankH + 18} x2={tankLeft + tankW} y2={tankTop + tankH + 32} />
        <text x={tankCX} y={tankTop + tankH + 36} textAnchor="middle" fontWeight="bold">{tank.width} mm</text>

        {/* Tank height (right) */}
        <line x1={tankLeft + tankW + 50} y1={tankTop} x2={tankLeft + tankW + 50} y2={tankTop + tankH} markerStart="url(#dimArrowRev)" markerEnd="url(#dimArrow)" />
        <line x1={tankLeft + tankW + 43} y1={tankTop} x2={tankLeft + tankW + 57} y2={tankTop} />
        <line x1={tankLeft + tankW + 43} y1={tankTop + tankH} x2={tankLeft + tankW + 57} y2={tankTop + tankH} />
        <text x={tankLeft + tankW + 62} y={tankTop + tankH / 2} textAnchor="start" transform={`rotate(90, ${tankLeft + tankW + 62}, ${tankTop + tankH / 2})`} fontWeight="bold">
          {tank.height} mm
        </text>

        {/* Overall height (far right) */}
        <line x1={tankLeft + tankW + 80} y1={tankTop - hvBushH - 10} x2={tankLeft + tankW + 80} y2={tankTop + tankH + 10} markerStart="url(#dimArrowRev)" markerEnd="url(#dimArrow)" />
        <line x1={tankLeft + tankW + 73} y1={tankTop - hvBushH - 10} x2={tankLeft + tankW + 87} y2={tankTop - hvBushH - 10} />
        <line x1={tankLeft + tankW + 73} y1={tankTop + tankH + 10} x2={tankLeft + tankW + 87} y2={tankTop + tankH + 10} />
        <text x={tankLeft + tankW + 92} y={tankTop + tankH / 2 - 20} textAnchor="start" transform={`rotate(90, ${tankLeft + tankW + 92}, ${tankTop + tankH / 2 - 20})`} fontWeight="bold">
          OVERALL: {tank.overallHeight} mm
        </text>
      </g>

      {/* === ELECTRICAL DATA BOX (bottom-left of drawing zone) === */}
      <g fontFamily="Arial, sans-serif" fontSize="6.5" fill="#000">
        <rect x={area.x} y={area.y + 280} width={200} height={95} fill="none" stroke="#000" strokeWidth="0.5" />
        <line x1={area.x} y1={area.y + 293} x2={area.x + 200} y2={area.y + 293} stroke="#000" strokeWidth="0.5" />
        <text x={area.x + 100} y={area.y + 290} textAnchor="middle" fontSize="7" fontWeight="bold">ELECTRICAL DATA</text>

        {[
          [`RATED POWER`, `${(requirements?.ratedPower || 1500)} kVA`],
          [`PRIMARY VOLTAGE`, `${(primaryVoltage / 1000).toFixed(1)} kV`],
          [`SECONDARY VOLTAGE`, `${secondaryVoltage} V`],
          [`FREQUENCY`, `${requirements?.frequency || 60} Hz`],
          [`PHASES`, `${requirements?.phases || 3}`],
          [`VECTOR GROUP`, vectorGroup],
          [`IMPEDANCE`, `${requirements?.targetImpedance || 5.75}%`],
        ].map(([label, value], i) => (
          <g key={i}>
            <text x={area.x + 5} y={area.y + 306 + i * 10}>{label}</text>
            <text x={area.x + 195} y={area.y + 306 + i * 10} textAnchor="end" fontWeight="bold">{value}</text>
          </g>
        ))}
      </g>

      {/* View label */}
      <text
        x={tankCX} y={tankTop + tankH + 55}
        textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000"
      >
        FRONT ELEVATION
      </text>
    </DrawingSheet>
  );
}

export default AssemblyDrawing;
