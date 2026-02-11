import type { CoreDesign, WindingDesign, TankDesign, ThermalDesign } from '@/engine/types/transformer.types';
import { DrawingSheet, DRAWING_AREA } from './DrawingSheet';

interface SideViewDrawingProps {
  core: CoreDesign;
  hvWinding: WindingDesign;
  lvWinding: WindingDesign;
  tank: TankDesign;
  thermal: ThermalDesign;
}

export function SideViewDrawing({
  core,
  hvWinding,
  lvWinding,
  tank,
  thermal,
}: SideViewDrawingProps) {
  const area = DRAWING_AREA;

  // Drawing zone (centered)
  const drawCX = area.x + area.width / 2;

  // Scale to fit
  const maxDim = Math.max(tank.length, tank.overallHeight);
  const availH = area.height - 200;
  const availW = area.width - 200;
  const scale = Math.min(availH / tank.overallHeight, availW / tank.length);

  // Scaled dimensions
  const tankL = tank.length * scale;
  const tankH = tank.height * scale;

  // Tank position
  const tankLeft = drawCX - tankL / 2;
  const tankTop = area.y + 100;

  // Bushing dimensions
  const hvBushH = 45;
  const lvBushH = 30;

  // Conservator
  const consLength = tankL * 0.5;
  const consH = 18;
  const consTop = tankTop - consH - 22;

  // Radiator depth
  const radDepth = 22;

  // Core and winding (hidden)
  const coreDepth = core.coreDiameter * scale;

  return (
    <DrawingSheet
      title="OUTLINE DRAWING - SIDE ELEVATION"
      scale="NOT TO SCALE"
      revision="0"
      sheetOf="3 OF 3"
    >
      {/* Conservator */}
      <rect
        x={drawCX - consLength / 2} y={consTop} width={consLength} height={consH}
        fill="none" stroke="#000" strokeWidth="1.5"
      />
      {/* Conservator support pipe */}
      <line x1={drawCX} y1={consTop + consH} x2={drawCX} y2={tankTop} stroke="#000" strokeWidth="2" />
      {/* Conservator label */}
      <text x={drawCX + consLength / 2 + 8} y={consTop + consH / 2 + 3} fontSize="5" fontFamily="Arial, sans-serif" fill="#000">
        CONSERVATOR
      </text>

      {/* Pressure relief device */}
      <circle cx={drawCX + consLength / 2 - 8} cy={consTop - 4} r={4} fill="none" stroke="#000" strokeWidth="0.5" />
      <text x={drawCX + consLength / 2 + 2} y={consTop - 2} fontSize="4" fontFamily="Arial, sans-serif" fill="#000">
        PRD
      </text>

      {/* Main Tank */}
      <rect
        x={tankLeft} y={tankTop} width={tankL} height={tankH}
        fill="none" stroke="#000" strokeWidth="2"
      />

      {/* Tank stiffeners (horizontal - dashed) */}
      {[0.25, 0.5, 0.75].map((pos, i) => (
        <line
          key={i}
          x1={tankLeft} y1={tankTop + tankH * pos}
          x2={tankLeft + tankL} y2={tankTop + tankH * pos}
          stroke="#000" strokeWidth="0.5" strokeDasharray="6,3"
        />
      ))}

      {/* Reinforcing braces (vertical on tank sides) */}
      {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
        <line
          key={i}
          x1={tankLeft + tankL * pos} y1={tankTop}
          x2={tankLeft + tankL * pos} y2={tankTop + tankH}
          stroke="#000" strokeWidth="0.3" strokeDasharray="3,2"
        />
      ))}

      {/* Core representation (dashed - hidden) */}
      <rect
        x={tankLeft + (tankL - coreDepth) / 2} y={tankTop + tankH * 0.15}
        width={coreDepth} height={tankH * 0.7}
        fill="none" stroke="#000" strokeWidth="0.5" strokeDasharray="4,2"
      />
      <text x={tankLeft + tankL / 2} y={tankTop + tankH * 0.5 + 3} textAnchor="middle" fontSize="6" fontFamily="Arial, sans-serif" fill="#000">
        CORE &amp; COILS
      </text>

      {/* HV Bushing (side profile) */}
      <g>
        <rect
          x={tankLeft + tankL * 0.25 - 4} y={tankTop - hvBushH} width={8} height={hvBushH}
          fill="none" stroke="#000" strokeWidth="1"
        />
        {/* Sheds */}
        {[0.2, 0.4, 0.6, 0.8].map((pos, j) => (
          <line key={j} x1={tankLeft + tankL * 0.25 - 6} y1={tankTop - hvBushH * pos} x2={tankLeft + tankL * 0.25 + 6} y2={tankTop - hvBushH * pos} stroke="#000" strokeWidth="0.5" />
        ))}
        {/* Terminal */}
        <circle cx={tankLeft + tankL * 0.25} cy={tankTop - hvBushH - 4} r={3.5} fill="none" stroke="#000" strokeWidth="0.5" />
        <line x1={tankLeft + tankL * 0.25 - 2.5} y1={tankTop - hvBushH - 4} x2={tankLeft + tankL * 0.25 + 2.5} y2={tankTop - hvBushH - 4} stroke="#000" strokeWidth="0.3" />
        <text x={tankLeft + tankL * 0.25} y={tankTop - hvBushH - 12} textAnchor="middle" fontSize="6" fontFamily="Arial, sans-serif" fontWeight="bold" fill="#000">
          HV
        </text>
      </g>

      {/* LV Bushing (side profile) */}
      <g>
        <rect
          x={tankLeft + tankL * 0.75 - 4} y={tankTop - lvBushH} width={8} height={lvBushH}
          fill="none" stroke="#000" strokeWidth="1"
        />
        {[0.3, 0.7].map((pos, j) => (
          <line key={j} x1={tankLeft + tankL * 0.75 - 5} y1={tankTop - lvBushH * pos} x2={tankLeft + tankL * 0.75 + 5} y2={tankTop - lvBushH * pos} stroke="#000" strokeWidth="0.5" />
        ))}
        <circle cx={tankLeft + tankL * 0.75} cy={tankTop - lvBushH - 3} r={3} fill="none" stroke="#000" strokeWidth="0.5" />
        <text x={tankLeft + tankL * 0.75} y={tankTop - lvBushH - 10} textAnchor="middle" fontSize="6" fontFamily="Arial, sans-serif" fontWeight="bold" fill="#000">
          LV
        </text>
      </g>

      {/* Radiators (showing depth - left side) */}
      <rect
        x={tankLeft - radDepth - 4} y={tankTop + tankH * 0.2}
        width={radDepth} height={tankH * 0.6}
        fill="none" stroke="#000" strokeWidth="1"
      />
      {/* Fin lines */}
      {Array.from({ length: Math.floor(tankH * 0.6 / 6) }).map((_, j) => (
        <line
          key={j}
          x1={tankLeft - radDepth - 3} y1={tankTop + tankH * 0.2 + 3 + j * 6}
          x2={tankLeft - 5} y2={tankTop + tankH * 0.2 + 3 + j * 6}
          stroke="#000" strokeWidth="0.2"
        />
      ))}
      {/* Inlet/outlet */}
      <line x1={tankLeft} y1={tankTop + tankH * 0.25} x2={tankLeft - 4} y2={tankTop + tankH * 0.25} stroke="#000" strokeWidth="1.5" />
      <line x1={tankLeft} y1={tankTop + tankH * 0.75} x2={tankLeft - 4} y2={tankTop + tankH * 0.75} stroke="#000" strokeWidth="1.5" />
      <text
        x={tankLeft - radDepth / 2 - 4} y={tankTop + tankH * 0.5}
        textAnchor="middle" fontSize="5" fontFamily="Arial, sans-serif" fill="#000"
        transform={`rotate(-90, ${tankLeft - radDepth / 2 - 4}, ${tankTop + tankH * 0.5})`}
      >
        RADIATORS
      </text>

      {/* Cooling fans (if ONAF) */}
      {thermal.numberOfFans > 0 && (
        <g>
          {Array.from({ length: Math.min(thermal.numberOfFans, 4) }).map((_, i) => {
            const fanY = tankTop + tankH * 0.3 + i * (tankH * 0.4 / Math.min(thermal.numberOfFans, 4));
            return (
              <g key={i}>
                <circle cx={tankLeft - radDepth - 12} cy={fanY} r={5} fill="none" stroke="#000" strokeWidth="0.5" />
                {/* Fan blades */}
                <line x1={tankLeft - radDepth - 15} y1={fanY - 3} x2={tankLeft - radDepth - 9} y2={fanY + 3} stroke="#000" strokeWidth="0.3" />
                <line x1={tankLeft - radDepth - 9} y1={fanY - 3} x2={tankLeft - radDepth - 15} y2={fanY + 3} stroke="#000" strokeWidth="0.3" />
              </g>
            );
          })}
          <text x={tankLeft - radDepth - 25} y={tankTop + tankH * 0.5} textAnchor="middle" fontSize="4" fontFamily="Arial, sans-serif" fill="#000" transform={`rotate(-90, ${tankLeft - radDepth - 25}, ${tankTop + tankH * 0.5})`}>
            FANS
          </text>
        </g>
      )}

      {/* Structural steel base */}
      <rect x={tankLeft - 4} y={tankTop + tankH} width={tankL + 8} height={6} fill="none" stroke="#000" strokeWidth="1" />

      {/* Jack pads / skid */}
      {[0.15, 0.85].map((pos, i) => (
        <rect key={i} x={tankLeft + tankL * pos - 8} y={tankTop + tankH + 6} width={16} height={5} fill="none" stroke="#000" strokeWidth="0.5" />
      ))}

      {/* Lifting lugs */}
      {[0.12, 0.88].map((pos, i) => (
        <g key={i}>
          <rect x={tankLeft + tankL * pos - 3} y={tankTop - 2} width={6} height={4} fill="none" stroke="#000" strokeWidth="0.5" />
          <circle cx={tankLeft + tankL * pos} cy={tankTop - 5} r={2} fill="none" stroke="#000" strokeWidth="0.5" />
        </g>
      ))}

      {/* Oil level gauge (on tank side) */}
      <rect x={tankLeft + tankL + 2} y={tankTop + tankH * 0.15} width={6} height={tankH * 0.3} fill="none" stroke="#000" strokeWidth="0.5" />
      <text x={tankLeft + tankL + 14} y={tankTop + tankH * 0.3} fontSize="4" fontFamily="Arial, sans-serif" fill="#000">
        OIL LEVEL
      </text>

      {/* Thermometer wells */}
      <circle cx={tankLeft + tankL + 5} cy={tankTop + tankH * 0.55} r={2.5} fill="none" stroke="#000" strokeWidth="0.5" />
      <text x={tankLeft + tankL + 14} y={tankTop + tankH * 0.56} fontSize="4" fontFamily="Arial, sans-serif" fill="#000">
        THERM.
      </text>

      {/* Drain valve */}
      <rect x={tankLeft + tankL * 0.5 - 6} y={tankTop + tankH + 6} width={12} height={6} fill="none" stroke="#000" strokeWidth="0.5" />
      <circle cx={tankLeft + tankL * 0.5} cy={tankTop + tankH + 16} r={3.5} fill="none" stroke="#000" strokeWidth="0.5" />
      <text x={tankLeft + tankL * 0.5 + 8} y={tankTop + tankH + 18} fontSize="4" fontFamily="Arial, sans-serif" fill="#000">
        DRAIN
      </text>

      {/* === DIMENSION LINES === */}
      <g stroke="#000" strokeWidth="0.4" fill="#000" fontFamily="Arial, sans-serif" fontSize="7">
        {/* Tank length (bottom) */}
        <line x1={tankLeft} y1={tankTop + tankH + 35} x2={tankLeft + tankL} y2={tankTop + tankH + 35} markerStart="url(#dimArrowRev)" markerEnd="url(#dimArrow)" />
        <line x1={tankLeft} y1={tankTop + tankH + 25} x2={tankLeft} y2={tankTop + tankH + 45} />
        <line x1={tankLeft + tankL} y1={tankTop + tankH + 25} x2={tankLeft + tankL} y2={tankTop + tankH + 45} />
        <text x={drawCX} y={tankTop + tankH + 49} textAnchor="middle" fontWeight="bold">{tank.length} mm</text>

        {/* Tank height (right) */}
        <line x1={tankLeft + tankL + 40} y1={tankTop} x2={tankLeft + tankL + 40} y2={tankTop + tankH} markerStart="url(#dimArrowRev)" markerEnd="url(#dimArrow)" />
        <line x1={tankLeft + tankL + 30} y1={tankTop} x2={tankLeft + tankL + 50} y2={tankTop} />
        <line x1={tankLeft + tankL + 30} y1={tankTop + tankH} x2={tankLeft + tankL + 50} y2={tankTop + tankH} />
        <text x={tankLeft + tankL + 55} y={tankTop + tankH / 2 + 3} fontSize="7" fontWeight="bold"
          transform={`rotate(90, ${tankLeft + tankL + 55}, ${tankTop + tankH / 2})`}>
          {tank.height} mm
        </text>

        {/* Overall height (far right) */}
        <line x1={tankLeft + tankL + 70} y1={consTop - 5} x2={tankLeft + tankL + 70} y2={tankTop + tankH + 11} markerStart="url(#dimArrowRev)" markerEnd="url(#dimArrow)" />
        <line x1={tankLeft + tankL + 60} y1={consTop - 5} x2={tankLeft + tankL + 80} y2={consTop - 5} />
        <line x1={tankLeft + tankL + 60} y1={tankTop + tankH + 11} x2={tankLeft + tankL + 80} y2={tankTop + tankH + 11} />
        <text x={tankLeft + tankL + 85} y={tankTop + tankH / 2 - 10} fontSize="7" fontWeight="bold"
          transform={`rotate(90, ${tankLeft + tankL + 85}, ${tankTop + tankH / 2 - 10})`}>
          OVERALL: {tank.overallHeight} mm
        </text>

        {/* HV Bushing height */}
        <line x1={tankLeft + tankL * 0.25 + 12} y1={tankTop - hvBushH} x2={tankLeft + tankL * 0.25 + 12} y2={tankTop} stroke="#000" strokeWidth="0.3" />
        <line x1={tankLeft + tankL * 0.25 + 8} y1={tankTop - hvBushH} x2={tankLeft + tankL * 0.25 + 16} y2={tankTop - hvBushH} stroke="#000" strokeWidth="0.3" />
        <line x1={tankLeft + tankL * 0.25 + 8} y1={tankTop} x2={tankLeft + tankL * 0.25 + 16} y2={tankTop} stroke="#000" strokeWidth="0.3" />
        <text x={tankLeft + tankL * 0.25 + 20} y={tankTop - hvBushH / 2 + 2} fontSize="5.5">
          HV BUSH. HT.
        </text>
      </g>

      {/* View label */}
      <text
        x={drawCX} y={tankTop + tankH + 70}
        textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000"
      >
        SIDE ELEVATION
      </text>

      {/* Legend */}
      <g fontFamily="Arial, sans-serif" fontSize="6" fill="#000">
        <rect x={area.x + 5} y={area.y + area.height - 90} width={120} height={60} fill="none" stroke="#000" strokeWidth="0.5" />
        <text x={area.x + 15} y={area.y + area.height - 76} fontSize="7" fontWeight="bold">LEGEND</text>

        <line x1={area.x + 15} y1={area.y + area.height - 62} x2={area.x + 35} y2={area.y + area.height - 62} stroke="#000" strokeWidth="1.5" />
        <text x={area.x + 40} y={area.y + area.height - 59}>VISIBLE EDGE</text>

        <line x1={area.x + 15} y1={area.y + area.height - 48} x2={area.x + 35} y2={area.y + area.height - 48} stroke="#000" strokeWidth="0.5" strokeDasharray="6,3" />
        <text x={area.x + 40} y={area.y + area.height - 45}>HIDDEN</text>

        <line x1={area.x + 15} y1={area.y + area.height - 34} x2={area.x + 35} y2={area.y + area.height - 34} stroke="#000" strokeWidth="0.5" strokeDasharray="3,2" />
        <text x={area.x + 40} y={area.y + area.height - 31}>STIFFENER / BRACE</text>
      </g>
    </DrawingSheet>
  );
}

export default SideViewDrawing;
