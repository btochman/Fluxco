import type { CoreDesign, WindingDesign } from '@/engine/types/transformer.types';

interface WindingLayoutDrawingProps {
  core: CoreDesign;
  hvWinding: WindingDesign;
  lvWinding: WindingDesign;
}

export function WindingLayoutDrawing({
  core,
  hvWinding,
  lvWinding,
}: WindingLayoutDrawingProps) {
  // SVG dimensions
  const width = 500;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;

  // Scale to fit: use the HV outer radius as reference
  const maxRadius = Math.min(width, height) / 2 - 80;
  const scale = maxRadius / hvWinding.outerRadius;

  // Scaled dimensions
  const coreRadius = (core.coreDiameter / 2) * scale;
  const lvInner = lvWinding.innerRadius * scale;
  const lvOuter = lvWinding.outerRadius * scale;
  const hvInner = hvWinding.innerRadius * scale;
  const hvOuter = hvWinding.outerRadius * scale;

  // Winding height scaled
  const windingHeight = Math.min(lvWinding.windingHeight, hvWinding.windingHeight) * scale * 0.6;
  const halfHeight = windingHeight / 2;

  // Gap between LV and HV
  const gap = hvInner - lvOuter;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-h-[400px]">
        {/* Background */}
        <rect width={width} height={height} fill="#ffffff" />

        {/* Background grid */}
        <defs>
          <pattern id="windingLayoutGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="0.5"
            />
          </pattern>
          {/* Hatching pattern for windings */}
          <pattern id="lvHatchLayout" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="4" stroke="#999999" strokeWidth="1" />
          </pattern>
          <pattern id="hvHatchLayout" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="4" stroke="#666666" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#windingLayoutGrid)" />

        {/* Title */}
        <text
          x={centerX}
          y="25"
          fill="#000000"
          fontSize="14"
          textAnchor="middle"
          fontWeight="bold"
        >
          WINDING LAYOUT (CROSS-SECTION)
        </text>

        {/* Core limb (center) */}
        <rect
          x={centerX - coreRadius}
          y={centerY - halfHeight - 20}
          width={coreRadius * 2}
          height={windingHeight + 40}
          fill="#e0e0e0"
          stroke="#000000"
          strokeWidth="2"
        />
        <text
          x={centerX}
          y={centerY}
          fill="#000000"
          fontSize="10"
          textAnchor="middle"
          fontWeight="bold"
        >
          CORE
        </text>

        {/* LV Winding (inner, shown on both sides) */}
        {/* Left side */}
        <rect
          x={centerX - lvOuter}
          y={centerY - halfHeight}
          width={lvOuter - lvInner}
          height={windingHeight}
          fill="url(#lvHatchLayout)"
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Right side */}
        <rect
          x={centerX + lvInner}
          y={centerY - halfHeight}
          width={lvOuter - lvInner}
          height={windingHeight}
          fill="url(#lvHatchLayout)"
          stroke="#000000"
          strokeWidth="2"
        />

        {/* HV Winding (outer, shown on both sides) */}
        {/* Left side */}
        <rect
          x={centerX - hvOuter}
          y={centerY - halfHeight}
          width={hvOuter - hvInner}
          height={windingHeight}
          fill="url(#hvHatchLayout)"
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Right side */}
        <rect
          x={centerX + hvInner}
          y={centerY - halfHeight}
          width={hvOuter - hvInner}
          height={windingHeight}
          fill="url(#hvHatchLayout)"
          stroke="#000000"
          strokeWidth="2"
        />

        {/* Main gap (insulation) */}
        {/* Left */}
        <rect
          x={centerX - hvInner}
          y={centerY - halfHeight + 10}
          width={gap}
          height={windingHeight - 20}
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        {/* Right */}
        <rect
          x={centerX + lvOuter}
          y={centerY - halfHeight + 10}
          width={gap}
          height={windingHeight - 20}
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Center line */}
        <line
          x1={centerX}
          y1={centerY - halfHeight - 40}
          x2={centerX}
          y2={centerY + halfHeight + 40}
          stroke="#999999"
          strokeWidth="0.5"
          strokeDasharray="10 5"
        />

        {/* Dimension: Core diameter */}
        <g stroke="#000000" strokeWidth="1">
          <line
            x1={centerX - coreRadius}
            y1={centerY + halfHeight + 50}
            x2={centerX + coreRadius}
            y2={centerY + halfHeight + 50}
          />
          <line x1={centerX - coreRadius} y1={centerY + halfHeight + 45} x2={centerX - coreRadius} y2={centerY + halfHeight + 55} />
          <line x1={centerX + coreRadius} y1={centerY + halfHeight + 45} x2={centerX + coreRadius} y2={centerY + halfHeight + 55} />
        </g>
        <text
          x={centerX}
          y={centerY + halfHeight + 65}
          fill="#000000"
          fontSize="9"
          textAnchor="middle"
        >
          Core {core.coreDiameter}mm
        </text>

        {/* Dimension: LV thickness */}
        <g stroke="#000000" strokeWidth="1">
          <line
            x1={centerX + lvInner}
            y1={centerY - halfHeight - 20}
            x2={centerX + lvOuter}
            y2={centerY - halfHeight - 20}
          />
          <line x1={centerX + lvInner} y1={centerY - halfHeight - 25} x2={centerX + lvInner} y2={centerY - halfHeight - 15} />
          <line x1={centerX + lvOuter} y1={centerY - halfHeight - 25} x2={centerX + lvOuter} y2={centerY - halfHeight - 15} />
        </g>
        <text
          x={centerX + (lvInner + lvOuter) / 2}
          y={centerY - halfHeight - 30}
          fill="#000000"
          fontSize="8"
          textAnchor="middle"
        >
          LV: {lvWinding.windingThickness}mm
        </text>

        {/* Dimension: HV thickness */}
        <g stroke="#000000" strokeWidth="1">
          <line
            x1={centerX + hvInner}
            y1={centerY - halfHeight - 45}
            x2={centerX + hvOuter}
            y2={centerY - halfHeight - 45}
          />
          <line x1={centerX + hvInner} y1={centerY - halfHeight - 50} x2={centerX + hvInner} y2={centerY - halfHeight - 40} />
          <line x1={centerX + hvOuter} y1={centerY - halfHeight - 50} x2={centerX + hvOuter} y2={centerY - halfHeight - 40} />
        </g>
        <text
          x={centerX + (hvInner + hvOuter) / 2}
          y={centerY - halfHeight - 55}
          fill="#000000"
          fontSize="8"
          textAnchor="middle"
        >
          HV: {hvWinding.windingThickness}mm
        </text>

        {/* Gap dimension */}
        <text
          x={centerX + lvOuter + gap / 2}
          y={centerY}
          fill="#000000"
          fontSize="8"
          textAnchor="middle"
        >
          Gap
        </text>
        <text
          x={centerX + lvOuter + gap / 2}
          y={centerY + 12}
          fill="#000000"
          fontSize="8"
          textAnchor="middle"
        >
          {Math.round(hvWinding.innerRadius - lvWinding.outerRadius)}mm
        </text>

        {/* Legend */}
        <rect x="10" y={height - 70} width="120" height="60" fill="#ffffff" stroke="#000000" strokeWidth="1" rx="4" />
        <text x="20" y={height - 52} fill="#000000" fontSize="10" fontWeight="bold">
          LEGEND
        </text>
        {/* LV */}
        <rect x="20" y={height - 42} width="15" height="10" fill="url(#lvHatchLayout)" stroke="#000000" strokeWidth="1" />
        <text x="40" y={height - 34} fill="#000000" fontSize="9">
          LV ({lvWinding.turns} turns)
        </text>
        {/* HV */}
        <rect x="20" y={height - 27} width="15" height="10" fill="url(#hvHatchLayout)" stroke="#000000" strokeWidth="1" />
        <text x="40" y={height - 19} fill="#000000" fontSize="9">
          HV ({hvWinding.turns} turns)
        </text>

        {/* Winding data */}
        <rect x={width - 130} y={height - 90} width="120" height="80" fill="#ffffff" stroke="#000000" strokeWidth="1" rx="4" />
        <text x={width - 120} y={height - 72} fill="#000000" fontSize="10" fontWeight="bold">
          WINDING DATA
        </text>
        <text x={width - 120} y={height - 57} fill="#000000" fontSize="9">
          LV: {lvWinding.ratedCurrent.toFixed(1)}A, {lvWinding.layers} layers
        </text>
        <text x={width - 120} y={height - 44} fill="#000000" fontSize="9">
          HV: {hvWinding.ratedCurrent.toFixed(1)}A, {hvWinding.layers} layers
        </text>
        <text x={width - 120} y={height - 28} fill="#000000" fontSize="8">
          Height: {Math.min(lvWinding.windingHeight, hvWinding.windingHeight)}mm
        </text>
        <text x={width - 120} y={height - 16} fill="#000000" fontSize="8">
          Ratio: {hvWinding.turns}:{lvWinding.turns}
        </text>
      </svg>
    </div>
  );
}

export default WindingLayoutDrawing;
