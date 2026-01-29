import type { CoreDesign, WindingDesign, TankDesign, ThermalDesign } from '@/engine/types/transformer.types';

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
  const width = 500;
  const height = 450;
  const margin = 60;

  // Scale to fit
  const maxDim = Math.max(tank.length, tank.overallHeight);
  const scale = (height - margin * 2) / maxDim;

  // Scaled dimensions
  const tankL = tank.length * scale;
  const tankH = tank.height * scale;
  const tankW = tank.width * scale;

  // Positions
  const tankLeft = (width - tankL) / 2;
  const tankTop = margin + 40;

  // Bushing dimensions
  const hvBushingHeight = 50;
  const lvBushingHeight = 35;

  // Conservator
  const conservatorLength = tankL * 0.5;
  const conservatorHeight = 20;
  const conservatorTop = tankTop - conservatorHeight - 25;

  // Radiator depth
  const radiatorDepth = 25;

  // Core and winding dimensions (side view shows depth)
  const coreDepth = core.coreDiameter * scale;
  const windingDepth = (hvWinding.outerRadius * 2) * scale * 0.4;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Background */}
        <rect width={width} height={height} fill="#ffffff" />

        {/* Background grid */}
        <defs>
          <pattern id="sideGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
          </pattern>
          <marker id="arrowStart" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6" fill="none" stroke="#000000" strokeWidth="0.5" />
          </marker>
          <marker id="arrowEnd" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="#000000" strokeWidth="0.5" />
          </marker>
        </defs>
        <rect width={width} height={height} fill="url(#sideGrid)" />

        {/* Title */}
        <text x={width / 2} y="20" fill="#000000" fontSize="12" textAnchor="middle" fontWeight="bold">
          SIDE VIEW - ELEVATION
        </text>

        {/* Conservator */}
        <rect
          x={(width - conservatorLength) / 2}
          y={conservatorTop}
          width={conservatorLength}
          height={conservatorHeight}
          fill="#f5f5f5"
          stroke="#000000"
          strokeWidth="1.5"
          rx="2"
        />
        {/* Conservator support pipe */}
        <line
          x1={width / 2}
          y1={conservatorTop + conservatorHeight}
          x2={width / 2}
          y2={tankTop}
          stroke="#000000"
          strokeWidth="3"
        />

        {/* Main Tank */}
        <rect
          x={tankLeft}
          y={tankTop}
          width={tankL}
          height={tankH}
          fill="#f5f5f5"
          stroke="#000000"
          strokeWidth="2"
        />

        {/* Tank stiffeners (horizontal) */}
        {[0.25, 0.5, 0.75].map((pos, i) => (
          <line
            key={i}
            x1={tankLeft}
            y1={tankTop + tankH * pos}
            x2={tankLeft + tankL}
            y2={tankTop + tankH * pos}
            stroke="#666666"
            strokeWidth="1"
            strokeDasharray="4,2"
          />
        ))}

        {/* Core representation (dashed - hidden) */}
        <rect
          x={tankLeft + (tankL - coreDepth) / 2}
          y={tankTop + tankH * 0.15}
          width={coreDepth}
          height={tankH * 0.7}
          fill="none"
          stroke="#000000"
          strokeWidth="1"
          strokeDasharray="5,3"
        />
        <text
          x={tankLeft + tankL / 2}
          y={tankTop + tankH * 0.5}
          fill="#000000"
          fontSize="8"
          textAnchor="middle"
        >
          CORE
        </text>

        {/* HV Bushing (side view - single) */}
        <g>
          <rect
            x={tankLeft + tankL * 0.25 - 5}
            y={tankTop - hvBushingHeight}
            width={10}
            height={hvBushingHeight}
            fill="#f5f5f5"
            stroke="#000000"
            strokeWidth="1"
            rx="2"
          />
          <circle
            cx={tankLeft + tankL * 0.25}
            cy={tankTop - hvBushingHeight - 5}
            r={5}
            fill="#f5f5f5"
            stroke="#000000"
          />
          <text x={tankLeft + tankL * 0.25} y={tankTop - hvBushingHeight - 15} fill="#000000" fontSize="8" textAnchor="middle">
            HV
          </text>
        </g>

        {/* LV Bushing (side view - single) */}
        <g>
          <rect
            x={tankLeft + tankL * 0.75 - 5}
            y={tankTop - lvBushingHeight}
            width={10}
            height={lvBushingHeight}
            fill="#f5f5f5"
            stroke="#000000"
            strokeWidth="1"
            rx="2"
          />
          <circle
            cx={tankLeft + tankL * 0.75}
            cy={tankTop - lvBushingHeight - 5}
            r={4}
            fill="#f5f5f5"
            stroke="#000000"
          />
          <text x={tankLeft + tankL * 0.75} y={tankTop - lvBushingHeight - 12} fill="#000000" fontSize="8" textAnchor="middle">
            LV
          </text>
        </g>

        {/* Radiators (showing depth) */}
        <rect
          x={tankLeft - radiatorDepth - 5}
          y={tankTop + tankH * 0.2}
          width={radiatorDepth}
          height={tankH * 0.6}
          fill="#e8e8e8"
          stroke="#000000"
          strokeWidth="1"
        />
        <text
          x={tankLeft - radiatorDepth / 2 - 5}
          y={tankTop + tankH * 0.5}
          fill="#000000"
          fontSize="7"
          textAnchor="middle"
          transform={`rotate(-90, ${tankLeft - radiatorDepth / 2 - 5}, ${tankTop + tankH * 0.5})`}
        >
          RADIATORS
        </text>

        {/* Wheels/Base */}
        {[0.2, 0.8].map((pos, i) => (
          <g key={i}>
            <rect
              x={tankLeft + tankL * pos - 10}
              y={tankTop + tankH}
              width={20}
              height={8}
              fill="#cccccc"
              stroke="#000000"
              strokeWidth="1"
            />
            <circle
              cx={tankLeft + tankL * pos}
              cy={tankTop + tankH + 12}
              r={6}
              fill="none"
              stroke="#000000"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Lifting lugs */}
        {[0.15, 0.85].map((pos, i) => (
          <g key={i}>
            <rect
              x={tankLeft + tankL * pos - 4}
              y={tankTop - 3}
              width={8}
              height={6}
              fill="#666666"
              stroke="#000000"
              strokeWidth="1"
            />
            <circle
              cx={tankLeft + tankL * pos}
              cy={tankTop - 6}
              r={3}
              fill="none"
              stroke="#000000"
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* Dimension: Tank Length */}
        <g stroke="#000000" strokeWidth="0.5" fill="#000000" fontSize="9">
          <line x1={tankLeft} y1={tankTop + tankH + 35} x2={tankLeft + tankL} y2={tankTop + tankH + 35} markerStart="url(#arrowStart)" markerEnd="url(#arrowEnd)" />
          <line x1={tankLeft} y1={tankTop + tankH + 25} x2={tankLeft} y2={tankTop + tankH + 45} />
          <line x1={tankLeft + tankL} y1={tankTop + tankH + 25} x2={tankLeft + tankL} y2={tankTop + tankH + 45} />
          <text x={width / 2} y={tankTop + tankH + 50} textAnchor="middle" fontWeight="bold">
            {tank.length} mm
          </text>
        </g>

        {/* Dimension: Tank Height */}
        <g stroke="#000000" strokeWidth="0.5" fill="#000000" fontSize="9">
          <line x1={tankLeft + tankL + 25} y1={tankTop} x2={tankLeft + tankL + 25} y2={tankTop + tankH} markerStart="url(#arrowStart)" markerEnd="url(#arrowEnd)" />
          <line x1={tankLeft + tankL + 15} y1={tankTop} x2={tankLeft + tankL + 35} y2={tankTop} />
          <line x1={tankLeft + tankL + 15} y1={tankTop + tankH} x2={tankLeft + tankL + 35} y2={tankTop + tankH} />
          <text x={tankLeft + tankL + 40} y={tankTop + tankH / 2} textAnchor="start" fontWeight="bold" transform={`rotate(90, ${tankLeft + tankL + 40}, ${tankTop + tankH / 2})`}>
            {tank.height} mm
          </text>
        </g>

        {/* Dimension: Overall Height */}
        <g stroke="#000000" strokeWidth="0.5" fill="#000000" fontSize="9">
          <line x1={tankLeft - 40} y1={tankTop - hvBushingHeight - 10} x2={tankLeft - 40} y2={tankTop + tankH + 18} markerStart="url(#arrowStart)" markerEnd="url(#arrowEnd)" />
          <line x1={tankLeft - 50} y1={tankTop - hvBushingHeight - 10} x2={tankLeft - 30} y2={tankTop - hvBushingHeight - 10} />
          <line x1={tankLeft - 50} y1={tankTop + tankH + 18} x2={tankLeft - 30} y2={tankTop + tankH + 18} />
          <text x={tankLeft - 55} y={tankTop + tankH / 2 - 20} textAnchor="end" fontWeight="bold">
            Overall:
          </text>
          <text x={tankLeft - 55} y={tankTop + tankH / 2 - 8} textAnchor="end" fontWeight="bold">
            {tank.overallHeight} mm
          </text>
        </g>

        {/* Dimension: HV Bushing Height */}
        <g stroke="#000000" strokeWidth="0.5" fill="#000000" fontSize="7">
          <line x1={tankLeft + tankL * 0.25 + 15} y1={tankTop - hvBushingHeight} x2={tankLeft + tankL * 0.25 + 15} y2={tankTop} />
          <text x={tankLeft + tankL * 0.25 + 18} y={tankTop - hvBushingHeight / 2} fontSize="7">
            {Math.round(hvBushingHeight / scale)} mm
          </text>
        </g>

        {/* Legend */}
        <rect x="10" y={height - 60} width="120" height="50" fill="#ffffff" stroke="#000000" rx="3" />
        <text x="20" y={height - 45} fill="#000000" fontSize="9" fontWeight="bold">SIDE VIEW</text>
        <line x1="20" y1={height - 32} x2="40" y2={height - 32} stroke="#000000" strokeWidth="1" strokeDasharray="5,3" />
        <text x="45" y={height - 28} fill="#000000" fontSize="7">Hidden (Core)</text>
        <text x="20" y={height - 18} fill="#000000" fontSize="7">Scale: NTS</text>
      </svg>
    </div>
  );
}

export default SideViewDrawing;
