import type { CoreDesign, WindingDesign, TankDesign, ThermalDesign } from '@/engine/types/transformer.types';
import { DrawingSheet, DRAWING_AREA } from './DrawingSheet';

interface TopViewDrawingProps {
  core: CoreDesign;
  hvWinding: WindingDesign;
  lvWinding: WindingDesign;
  tank: TankDesign;
  thermal: ThermalDesign;
  phases: number;
}

export function TopViewDrawing({
  core,
  hvWinding,
  lvWinding,
  tank,
  thermal,
  phases,
}: TopViewDrawingProps) {
  const area = DRAWING_AREA;

  // Drawing zone (centered, with room for dimensions)
  const drawCX = area.x + area.width / 2;
  const drawCY = area.y + area.height / 2 - 30;

  // Scale to fit
  const maxDim = Math.max(tank.length, tank.width);
  const availW = area.width - 200;
  const availH = area.height - 200;
  const scale = Math.min(availW, availH) / maxDim;

  // Scaled dimensions
  const tankL = tank.length * scale;
  const tankW = tank.width * scale;

  // Tank position (centered)
  const tankLeft = drawCX - tankL / 2;
  const tankTop = drawCY - tankW / 2;

  // Core dimensions
  const coreDia = core.coreDiameter * scale * 0.8;
  const limbSpacing = core.windowWidth * scale * 0.8;
  const numLimbs = phases === 3 ? 3 : 2;

  // Winding dimensions
  const lvOuterR = lvWinding.outerRadius * scale * 0.5;
  const hvOuterR = hvWinding.outerRadius * scale * 0.5;

  // Radiator positions
  const radiatorCount = Math.min(thermal.numberOfRadiators, 8);
  const radiatorsPerSide = Math.ceil(radiatorCount / 2);

  return (
    <DrawingSheet
      title="OUTLINE DRAWING - TOP VIEW / PLAN"
      scale="NOT TO SCALE"
      revision="0"
      sheetOf="2 OF 3"
    >
      {/* Main Tank Outline */}
      <rect
        x={tankLeft} y={tankTop} width={tankL} height={tankW}
        fill="none" stroke="#000" strokeWidth="2"
      />

      {/* Tank cover plate (dashed) */}
      <rect
        x={tankLeft + 5} y={tankTop + 5} width={tankL - 10} height={tankW - 10}
        fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="8,4"
      />

      {/* Manhole covers */}
      {[0.35, 0.65].map((pos, i) => (
        <g key={i}>
          <circle
            cx={tankLeft + tankL * pos} cy={tankTop + tankW * 0.3}
            r={12} fill="none" stroke="#000" strokeWidth="0.5"
          />
          {/* Cross hairs */}
          <line x1={tankLeft + tankL * pos - 8} y1={tankTop + tankW * 0.3} x2={tankLeft + tankL * pos + 8} y2={tankTop + tankW * 0.3} stroke="#000" strokeWidth="0.3" />
          <line x1={tankLeft + tankL * pos} y1={tankTop + tankW * 0.3 - 8} x2={tankLeft + tankL * pos} y2={tankTop + tankW * 0.3 + 8} stroke="#000" strokeWidth="0.3" />
        </g>
      ))}

      {/* Core limbs (circles - hidden, dashed) */}
      {Array.from({ length: numLimbs }).map((_, i) => {
        const limbX = tankLeft + tankL / 2 + (i - (numLimbs - 1) / 2) * limbSpacing;
        const limbY = tankTop + tankW / 2;
        return (
          <g key={`limb-${i}`}>
            {/* Core limb */}
            <circle
              cx={limbX} cy={limbY} r={coreDia / 2}
              fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
            />
            {/* LV Winding */}
            <circle
              cx={limbX} cy={limbY} r={lvOuterR}
              fill="none" stroke="#000" strokeWidth="1" strokeDasharray="6,3"
            />
            {/* HV Winding */}
            <circle
              cx={limbX} cy={limbY} r={hvOuterR}
              fill="none" stroke="#000" strokeWidth="1" strokeDasharray="6,3"
            />
            {/* Phase label */}
            <text
              x={limbX} y={limbY + 3}
              textAnchor="middle" fontSize="8" fontFamily="Arial, sans-serif" fontWeight="bold" fill="#000"
            >
              {phases === 3 ? ['A', 'B', 'C'][i] : ['1', '2'][i]}
            </text>
          </g>
        );
      })}

      {/* Core yokes (dashed - hidden) */}
      {numLimbs > 1 && (
        <>
          <rect
            x={tankLeft + tankL / 2 - ((numLimbs - 1) / 2) * limbSpacing - coreDia / 2}
            y={tankTop + tankW / 2 - coreDia / 2 - 3}
            width={(numLimbs - 1) * limbSpacing + coreDia}
            height={6}
            fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
          />
          <rect
            x={tankLeft + tankL / 2 - ((numLimbs - 1) / 2) * limbSpacing - coreDia / 2}
            y={tankTop + tankW / 2 + coreDia / 2 - 3}
            width={(numLimbs - 1) * limbSpacing + coreDia}
            height={6}
            fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
          />
        </>
      )}

      {/* HV Bushings */}
      {Array.from({ length: numLimbs }).map((_, i) => {
        const bx = tankLeft + tankL * 0.2 + i * (tankL * 0.15);
        return (
          <g key={`hv-${i}`}>
            <circle cx={bx} cy={tankTop + 15} r={7} fill="none" stroke="#000" strokeWidth="1" />
            {/* Cross hairs */}
            <line x1={bx - 5} y1={tankTop + 15} x2={bx + 5} y2={tankTop + 15} stroke="#000" strokeWidth="0.3" />
            <line x1={bx} y1={tankTop + 10} x2={bx} y2={tankTop + 20} stroke="#000" strokeWidth="0.3" />
            <text x={bx} y={tankTop + 3} textAnchor="middle" fontSize="6" fontFamily="Arial, sans-serif" fontWeight="bold" fill="#000">
              H{i + 1}
            </text>
          </g>
        );
      })}

      {/* LV Bushings */}
      {Array.from({ length: numLimbs + 1 }).map((_, i) => {
        const bx = tankLeft + tankL * 0.55 + i * (tankL * 0.12);
        return (
          <g key={`lv-${i}`}>
            <circle cx={bx} cy={tankTop + 15} r={5.5} fill="none" stroke="#000" strokeWidth="1" />
            <line x1={bx - 4} y1={tankTop + 15} x2={bx + 4} y2={tankTop + 15} stroke="#000" strokeWidth="0.3" />
            <line x1={bx} y1={tankTop + 11} x2={bx} y2={tankTop + 19} stroke="#000" strokeWidth="0.3" />
            <text x={bx} y={tankTop + 3} textAnchor="middle" fontSize="6" fontFamily="Arial, sans-serif" fontWeight="bold" fill="#000">
              {i === numLimbs ? 'X0' : `X${i + 1}`}
            </text>
          </g>
        );
      })}

      {/* Radiators on sides */}
      {Array.from({ length: radiatorsPerSide }).map((_, i) => {
        const spacing = tankW / (radiatorsPerSide + 1);
        return (
          <g key={`rad-${i}`}>
            {/* Left radiator */}
            <rect
              x={tankLeft - 18} y={tankTop + spacing * (i + 1) - 12}
              width={14} height={24}
              fill="none" stroke="#000" strokeWidth="1"
            />
            {/* Right radiator */}
            <rect
              x={tankLeft + tankL + 4} y={tankTop + spacing * (i + 1) - 12}
              width={14} height={24}
              fill="none" stroke="#000" strokeWidth="1"
            />
          </g>
        );
      })}

      {/* Conservator (shown as dashed outline above) */}
      <rect
        x={tankLeft + tankL * 0.25} y={tankTop - 22}
        width={tankL * 0.5} height={14}
        fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="6,3"
      />
      <text
        x={tankLeft + tankL * 0.5} y={tankTop - 12}
        textAnchor="middle" fontSize="5" fontFamily="Arial, sans-serif" fill="#000"
      >
        CONSERVATOR (ABOVE)
      </text>

      {/* Tap changer */}
      <rect
        x={tankLeft + tankL - 22} y={tankTop + tankW / 2 - 12}
        width={18} height={24}
        fill="none" stroke="#000" strokeWidth="1"
      />
      <text x={tankLeft + tankL - 13} y={tankTop + tankW / 2 + 3} textAnchor="middle" fontSize="5" fontFamily="Arial, sans-serif" fill="#000">
        OLTC
      </text>

      {/* Lifting lugs (4 corners) */}
      {[[0.08, 0.08], [0.92, 0.08], [0.08, 0.92], [0.92, 0.92]].map(([xp, yp], i) => (
        <g key={i}>
          <circle
            cx={tankLeft + tankL * xp} cy={tankTop + tankW * yp}
            r={4} fill="none" stroke="#000" strokeWidth="1"
          />
          <circle cx={tankLeft + tankL * xp} cy={tankTop + tankW * yp} r={1.5} fill="#000" />
        </g>
      ))}

      {/* Control cabinet outline */}
      <rect
        x={tankLeft + tankL + 4} y={tankTop + 10}
        width={20} height={35}
        fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
      />
      <text x={tankLeft + tankL + 14} y={tankTop + 30} textAnchor="middle" fontSize="4" fontFamily="Arial, sans-serif" fill="#000" transform={`rotate(90, ${tankLeft + tankL + 14}, ${tankTop + 30})`}>
        CONTROL CAB.
      </text>

      {/* === DIMENSION LINES === */}
      <g stroke="#000" strokeWidth="0.4" fill="#000" fontFamily="Arial, sans-serif" fontSize="7">
        {/* Tank length (bottom) */}
        <line x1={tankLeft} y1={tankTop + tankW + 30} x2={tankLeft + tankL} y2={tankTop + tankW + 30} markerStart="url(#dimArrowRev)" markerEnd="url(#dimArrow)" />
        <line x1={tankLeft} y1={tankTop + tankW + 20} x2={tankLeft} y2={tankTop + tankW + 40} />
        <line x1={tankLeft + tankL} y1={tankTop + tankW + 20} x2={tankLeft + tankL} y2={tankTop + tankW + 40} />
        <text x={drawCX} y={tankTop + tankW + 44} textAnchor="middle" fontWeight="bold">{tank.length} mm</text>

        {/* Tank width (left) */}
        <line x1={tankLeft - 35} y1={tankTop} x2={tankLeft - 35} y2={tankTop + tankW} markerStart="url(#dimArrowRev)" markerEnd="url(#dimArrow)" />
        <line x1={tankLeft - 45} y1={tankTop} x2={tankLeft - 25} y2={tankTop} />
        <line x1={tankLeft - 45} y1={tankTop + tankW} x2={tankLeft - 25} y2={tankTop + tankW} />
        <text x={tankLeft - 50} y={tankTop + tankW / 2 + 3} textAnchor="end" fontWeight="bold">{tank.width} mm</text>

        {/* Window width (between limbs) */}
        {numLimbs > 1 && (
          <g>
            <line
              x1={tankLeft + tankL / 2 - ((numLimbs - 1) / 2) * limbSpacing}
              y1={tankTop + tankW / 2 + hvOuterR + 18}
              x2={tankLeft + tankL / 2 - ((numLimbs - 1) / 2) * limbSpacing + limbSpacing}
              y2={tankTop + tankW / 2 + hvOuterR + 18}
              markerStart="url(#dimArrowRev)" markerEnd="url(#dimArrow)"
            />
            <text
              x={tankLeft + tankL / 2 - ((numLimbs - 1) / 2) * limbSpacing + limbSpacing / 2}
              y={tankTop + tankW / 2 + hvOuterR + 30}
              textAnchor="middle" fontSize="6"
            >
              WINDOW: {core.windowWidth} mm
            </text>
          </g>
        )}
      </g>

      {/* View label */}
      <text
        x={drawCX} y={tankTop + tankW + 65}
        textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000"
      >
        TOP VIEW / PLAN
      </text>

      {/* Legend */}
      <g fontFamily="Arial, sans-serif" fontSize="6" fill="#000">
        <rect x={area.x + 5} y={area.y + area.height - 110} width={120} height={80} fill="none" stroke="#000" strokeWidth="0.5" />
        <text x={area.x + 15} y={area.y + area.height - 96} fontSize="7" fontWeight="bold">LEGEND</text>

        <line x1={area.x + 15} y1={area.y + area.height - 82} x2={area.x + 35} y2={area.y + area.height - 82} stroke="#000" strokeWidth="1.5" />
        <text x={area.x + 40} y={area.y + area.height - 79}>VISIBLE EDGE</text>

        <line x1={area.x + 15} y1={area.y + area.height - 68} x2={area.x + 35} y2={area.y + area.height - 68} stroke="#000" strokeWidth="0.5" strokeDasharray="6,3" />
        <text x={area.x + 40} y={area.y + area.height - 65}>HIDDEN / BELOW</text>

        <circle cx={area.x + 25} cy={area.y + area.height - 54} r={5} fill="none" stroke="#000" strokeWidth="1" />
        <text x={area.x + 40} y={area.y + area.height - 51}>BUSHING</text>

        <circle cx={area.x + 25} cy={area.y + area.height - 40} r={4} fill="none" stroke="#000" strokeWidth="1" />
        <circle cx={area.x + 25} cy={area.y + area.height - 40} r={1.5} fill="#000" />
        <text x={area.x + 40} y={area.y + area.height - 37}>LIFTING LUG</text>
      </g>
    </DrawingSheet>
  );
}

export default TopViewDrawing;
