import type { CoreDesign, WindingDesign, TankDesign, ThermalDesign } from '@/engine/types/transformer.types';

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
  const width = 550;
  const height = 400;
  const margin = 50;

  // Scale to fit
  const maxDim = Math.max(tank.length, tank.width);
  const availableSpace = Math.min(width, height) - margin * 2;
  const scale = availableSpace / maxDim;

  // Scaled dimensions
  const tankL = tank.length * scale;
  const tankW = tank.width * scale;

  // Positions (centered)
  const tankLeft = (width - tankL) / 2;
  const tankTop = (height - tankW) / 2 + 10;

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
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Background grid */}
        <defs>
          <pattern id="topGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--primary) / 0.08)" strokeWidth="0.5" />
          </pattern>
          <marker id="dimArrowS" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          </marker>
          <marker id="dimArrowE" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          </marker>
        </defs>
        <rect width={width} height={height} fill="url(#topGrid)" />

        {/* Title */}
        <text x={width / 2} y="20" fill="hsl(var(--primary))" fontSize="12" textAnchor="middle" fontWeight="bold">
          TOP VIEW - PLAN
        </text>

        {/* Main Tank Outline */}
        <rect
          x={tankLeft}
          y={tankTop}
          width={tankL}
          height={tankW}
          fill="hsl(var(--steel) / 0.1)"
          stroke="hsl(var(--steel))"
          strokeWidth="2"
        />

        {/* Tank cover plate lines */}
        <rect
          x={tankLeft + 5}
          y={tankTop + 5}
          width={tankL - 10}
          height={tankW - 10}
          fill="none"
          stroke="hsl(var(--steel) / 0.4)"
          strokeWidth="1"
          strokeDasharray="10,5"
        />

        {/* Core limbs (circles in top view) */}
        {Array.from({ length: numLimbs }).map((_, i) => {
          const limbX = tankLeft + tankL / 2 + (i - (numLimbs - 1) / 2) * limbSpacing;
          const limbY = tankTop + tankW / 2;
          return (
            <g key={`limb-${i}`}>
              {/* Core limb */}
              <circle
                cx={limbX}
                cy={limbY}
                r={coreDia / 2}
                fill="hsl(var(--steel) / 0.4)"
                stroke="hsl(var(--steel))"
                strokeWidth="1.5"
              />
              {/* LV Winding */}
              <circle
                cx={limbX}
                cy={limbY}
                r={lvOuterR}
                fill="none"
                stroke="hsl(var(--glow))"
                strokeWidth="3"
              />
              {/* HV Winding */}
              <circle
                cx={limbX}
                cy={limbY}
                r={hvOuterR}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
              />
              {/* Phase label */}
              <text
                x={limbX}
                y={limbY + 3}
                fill="hsl(var(--foreground))"
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
              >
                {phases === 3 ? ['A', 'B', 'C'][i] : ['1', '2'][i]}
              </text>
            </g>
          );
        })}

        {/* Core yokes (rectangles connecting limbs) */}
        {numLimbs > 1 && (
          <>
            {/* Top yoke */}
            <rect
              x={tankLeft + tankL / 2 - ((numLimbs - 1) / 2) * limbSpacing - coreDia / 2}
              y={tankTop + tankW / 2 - coreDia / 2 - 3}
              width={(numLimbs - 1) * limbSpacing + coreDia}
              height={6}
              fill="hsl(var(--steel) / 0.3)"
              stroke="hsl(var(--steel))"
              strokeWidth="1"
              strokeDasharray="3,2"
            />
            {/* Bottom yoke */}
            <rect
              x={tankLeft + tankL / 2 - ((numLimbs - 1) / 2) * limbSpacing - coreDia / 2}
              y={tankTop + tankW / 2 + coreDia / 2 - 3}
              width={(numLimbs - 1) * limbSpacing + coreDia}
              height={6}
              fill="hsl(var(--steel) / 0.3)"
              stroke="hsl(var(--steel))"
              strokeWidth="1"
              strokeDasharray="3,2"
            />
          </>
        )}

        {/* HV Bushings */}
        {Array.from({ length: numLimbs }).map((_, i) => {
          const bushingX = tankLeft + tankL * 0.2 + i * (tankL * 0.15);
          return (
            <g key={`hv-bush-${i}`}>
              <circle
                cx={bushingX}
                cy={tankTop + 15}
                r={8}
                fill="hsl(25, 60%, 90%)"
                stroke="hsl(25, 40%, 60%)"
                strokeWidth="1.5"
              />
              <circle cx={bushingX} cy={tankTop + 15} r={3} fill="hsl(var(--copper))" />
              <text x={bushingX} y={tankTop + 4} fill="hsl(var(--primary))" fontSize="7" textAnchor="middle">
                H{i + 1}
              </text>
            </g>
          );
        })}

        {/* LV Bushings */}
        {Array.from({ length: numLimbs + 1 }).map((_, i) => {
          const bushingX = tankLeft + tankL * 0.55 + i * (tankL * 0.12);
          return (
            <g key={`lv-bush-${i}`}>
              <circle
                cx={bushingX}
                cy={tankTop + 15}
                r={6}
                fill="hsl(25, 60%, 90%)"
                stroke="hsl(25, 40%, 60%)"
                strokeWidth="1.5"
              />
              <circle cx={bushingX} cy={tankTop + 15} r={2} fill="hsl(var(--copper))" />
              <text x={bushingX} y={tankTop + 4} fill="hsl(var(--glow))" fontSize="7" textAnchor="middle">
                {i === numLimbs ? 'X0' : `X${i + 1}`}
              </text>
            </g>
          );
        })}

        {/* Radiators on sides */}
        {Array.from({ length: radiatorsPerSide }).map((_, i) => {
          const spacing = tankW / (radiatorsPerSide + 1);
          return (
            <g key={`rad-left-${i}`}>
              {/* Left radiator */}
              <rect
                x={tankLeft - 20}
                y={tankTop + spacing * (i + 1) - 15}
                width={15}
                height={30}
                fill="hsl(var(--steel) / 0.3)"
                stroke="hsl(var(--steel))"
                strokeWidth="1"
              />
              {/* Right radiator */}
              <rect
                x={tankLeft + tankL + 5}
                y={tankTop + spacing * (i + 1) - 15}
                width={15}
                height={30}
                fill="hsl(var(--steel) / 0.3)"
                stroke="hsl(var(--steel))"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Conservator (shown as dashed outline) */}
        <rect
          x={tankLeft + tankL * 0.25}
          y={tankTop - 25}
          width={tankL * 0.5}
          height={15}
          fill="none"
          stroke="hsl(var(--steel))"
          strokeWidth="1"
          strokeDasharray="5,3"
        />
        <text
          x={tankLeft + tankL * 0.5}
          y={tankTop - 15}
          fill="hsl(var(--muted-foreground))"
          fontSize="7"
          textAnchor="middle"
        >
          CONSERVATOR (ABOVE)
        </text>

        {/* Tap changer */}
        <rect
          x={tankLeft + tankL - 25}
          y={tankTop + tankW / 2 - 15}
          width={20}
          height={30}
          fill="hsl(var(--steel) / 0.3)"
          stroke="hsl(var(--steel))"
          strokeWidth="1"
        />
        <text
          x={tankLeft + tankL - 15}
          y={tankTop + tankW / 2 + 3}
          fill="hsl(var(--muted-foreground))"
          fontSize="6"
          textAnchor="middle"
        >
          OLTC
        </text>

        {/* Lifting lugs */}
        {[[0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]].map(([xp, yp], i) => (
          <circle
            key={i}
            cx={tankLeft + tankL * xp}
            cy={tankTop + tankW * yp}
            r={5}
            fill="hsl(var(--steel))"
            stroke="hsl(var(--steel))"
            strokeWidth="1"
          />
        ))}

        {/* Dimension: Tank Length */}
        <g stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" fill="hsl(var(--muted-foreground))" fontSize="9">
          <line x1={tankLeft} y1={tankTop + tankW + 25} x2={tankLeft + tankL} y2={tankTop + tankW + 25} markerStart="url(#dimArrowS)" markerEnd="url(#dimArrowE)" />
          <line x1={tankLeft} y1={tankTop + tankW + 15} x2={tankLeft} y2={tankTop + tankW + 35} />
          <line x1={tankLeft + tankL} y1={tankTop + tankW + 15} x2={tankLeft + tankL} y2={tankTop + tankW + 35} />
          <text x={tankLeft + tankL / 2} y={tankTop + tankW + 40} textAnchor="middle" fontWeight="bold">
            {tank.length} mm
          </text>
        </g>

        {/* Dimension: Tank Width */}
        <g stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" fill="hsl(var(--muted-foreground))" fontSize="9">
          <line x1={tankLeft - 30} y1={tankTop} x2={tankLeft - 30} y2={tankTop + tankW} markerStart="url(#dimArrowS)" markerEnd="url(#dimArrowE)" />
          <line x1={tankLeft - 40} y1={tankTop} x2={tankLeft - 20} y2={tankTop} />
          <line x1={tankLeft - 40} y1={tankTop + tankW} x2={tankLeft - 20} y2={tankTop + tankW} />
          <text x={tankLeft - 45} y={tankTop + tankW / 2 + 3} textAnchor="end" fontWeight="bold">
            {tank.width} mm
          </text>
        </g>

        {/* Dimension: Window Width (limb spacing) */}
        {numLimbs > 1 && (
          <g stroke="hsl(var(--primary))" strokeWidth="0.5" fill="hsl(var(--primary))" fontSize="8">
            <line
              x1={tankLeft + tankL / 2 - ((numLimbs - 1) / 2) * limbSpacing}
              y1={tankTop + tankW / 2 + hvOuterR + 15}
              x2={tankLeft + tankL / 2 - ((numLimbs - 1) / 2) * limbSpacing + limbSpacing}
              y2={tankTop + tankW / 2 + hvOuterR + 15}
              markerStart="url(#dimArrowS)"
              markerEnd="url(#dimArrowE)"
            />
            <text
              x={tankLeft + tankL / 2 - ((numLimbs - 1) / 2) * limbSpacing + limbSpacing / 2}
              y={tankTop + tankW / 2 + hvOuterR + 28}
              textAnchor="middle"
            >
              Window: {core.windowWidth} mm
            </text>
          </g>
        )}

        {/* Legend */}
        <rect x="10" y={height - 75} width="130" height="65" fill="hsl(var(--background))" stroke="hsl(var(--border))" rx="3" />
        <text x="20" y={height - 60} fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold">LEGEND</text>
        <circle cx="25" cy={height - 45} r="5" fill="hsl(var(--steel) / 0.4)" stroke="hsl(var(--steel))" />
        <text x="35" y={height - 42} fill="hsl(var(--muted-foreground))" fontSize="7">Core Limb</text>
        <circle cx="25" cy={height - 32} r="5" fill="none" stroke="hsl(var(--glow))" strokeWidth="2" />
        <text x="35" y={height - 29} fill="hsl(var(--muted-foreground))" fontSize="7">LV Winding</text>
        <circle cx="25" cy={height - 19} r="5" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
        <text x="35" y={height - 16} fill="hsl(var(--muted-foreground))" fontSize="7">HV Winding</text>
      </svg>
    </div>
  );
}

export default TopViewDrawing;
