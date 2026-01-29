import type { ReactElement } from 'react';
import type { CoreDesign } from '@/engine/types/transformer.types';

interface CoreCrossSectionDrawingProps {
  core: CoreDesign;
}

export function CoreCrossSectionDrawing({ core }: CoreCrossSectionDrawingProps) {
  // SVG dimensions
  const width = 400;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;

  // Scale factor: map core diameter to fit in SVG
  const maxRadius = Math.min(width, height) / 2 - 60;
  const scale = maxRadius / (core.coreDiameter / 2);

  // Generate stepped core path (unused but kept for reference)
  const _generateSteppedCorePath = () => {
    const steps = core.coreSteps;
    const radius = core.coreDiameter / 2;
    const paths: string[] = [];

    // Calculate step widths based on inscribed rectangles in a circle
    for (let i = 0; i < steps; i++) {
      const fraction = (steps - i) / steps;
      const y = radius * Math.sqrt(1 - fraction * fraction);
      const halfWidth = y * scale;
      const stepHeight = ((radius * 2 * fraction) / steps) * scale;
      const yOffset = (i * stepHeight) - (steps * stepHeight / 2) + stepHeight / 2;

      // Left side rectangle
      paths.push(`
        M ${centerX - halfWidth} ${centerY + yOffset - stepHeight / 2}
        L ${centerX - halfWidth} ${centerY + yOffset + stepHeight / 2}
      `);

      // Right side rectangle
      paths.push(`
        M ${centerX + halfWidth} ${centerY + yOffset - stepHeight / 2}
        L ${centerX + halfWidth} ${centerY + yOffset + stepHeight / 2}
      `);
    }

    return paths;
  };

  // Generate filled rectangles for each step
  const generateStepRectangles = () => {
    const steps = core.coreSteps;
    const radius = core.coreDiameter / 2;
    const rectangles: ReactElement[] = [];

    for (let i = 0; i < steps; i++) {
      const _fraction = (steps - i) / steps;
      const y = radius * Math.sqrt(1 - Math.pow((i + 0.5) / steps, 2));
      const halfWidth = y * scale;
      const stepHeight = ((radius * 2) / steps) * scale;
      const yStart = centerY - (steps * stepHeight / 2) + i * stepHeight;

      rectangles.push(
        <rect
          key={i}
          x={centerX - halfWidth}
          y={yStart}
          width={halfWidth * 2}
          height={stepHeight}
          fill={i % 2 === 0 ? '#e0e0e0' : '#cccccc'}
          stroke="#000000"
          strokeWidth="1"
        />
      );
    }

    return rectangles;
  };

  // Calculate displayed dimensions
  const displayRadius = (core.coreDiameter / 2) * scale;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-h-[400px]">
        {/* Background */}
        <rect width={width} height={height} fill="#ffffff" />

        {/* Background grid */}
        <defs>
          <pattern id="coreGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#coreGrid)" />

        {/* Title */}
        <text
          x={centerX}
          y="25"
          fill="#000000"
          fontSize="14"
          textAnchor="middle"
          fontWeight="bold"
        >
          CORE CROSS-SECTION ({core.coreSteps}-STEP)
        </text>

        {/* Circumscribed circle (reference) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={displayRadius}
          fill="none"
          stroke="#999999"
          strokeWidth="1"
          strokeDasharray="5 5"
        />

        {/* Core steps */}
        <g>{generateStepRectangles()}</g>

        {/* Center lines */}
        <line
          x1={centerX}
          y1={centerY - displayRadius - 20}
          x2={centerX}
          y2={centerY + displayRadius + 20}
          stroke="#999999"
          strokeWidth="0.5"
          strokeDasharray="10 5"
        />
        <line
          x1={centerX - displayRadius - 20}
          y1={centerY}
          x2={centerX + displayRadius + 20}
          y2={centerY}
          stroke="#999999"
          strokeWidth="0.5"
          strokeDasharray="10 5"
        />

        {/* Diameter dimension */}
        <g stroke="#000000" strokeWidth="1">
          <line
            x1={centerX - displayRadius}
            y1={centerY + displayRadius + 40}
            x2={centerX + displayRadius}
            y2={centerY + displayRadius + 40}
          />
          <line
            x1={centerX - displayRadius}
            y1={centerY + displayRadius + 35}
            x2={centerX - displayRadius}
            y2={centerY + displayRadius + 45}
          />
          <line
            x1={centerX + displayRadius}
            y1={centerY + displayRadius + 35}
            x2={centerX + displayRadius}
            y2={centerY + displayRadius + 45}
          />
          {/* Arrows */}
          <polygon
            points={`${centerX - displayRadius},${centerY + displayRadius + 40} ${centerX - displayRadius + 8},${centerY + displayRadius + 37} ${centerX - displayRadius + 8},${centerY + displayRadius + 43}`}
            fill="#000000"
          />
          <polygon
            points={`${centerX + displayRadius},${centerY + displayRadius + 40} ${centerX + displayRadius - 8},${centerY + displayRadius + 37} ${centerX + displayRadius - 8},${centerY + displayRadius + 43}`}
            fill="#000000"
          />
        </g>
        <text
          x={centerX}
          y={centerY + displayRadius + 55}
          fill="#000000"
          fontSize="12"
          textAnchor="middle"
          fontWeight="bold"
        >
          {core.coreDiameter} mm
        </text>

        {/* Data box */}
        <rect
          x="10"
          y={height - 90}
          width="150"
          height="80"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="1"
          rx="4"
        />
        <text x="20" y={height - 70} fill="#000000" fontSize="10" fontWeight="bold">
          CORE DATA
        </text>
        <text x="20" y={height - 55} fill="#000000" fontSize="9">
          Steel: {core.steelGrade.name.split(' ')[0]}
        </text>
        <text x="20" y={height - 42} fill="#000000" fontSize="9">
          Flux: {core.fluxDensity} T
        </text>
        <text x="20" y={height - 29} fill="#000000" fontSize="9">
          Net Area: {core.netCrossSection.toFixed(1)} cm²
        </text>
        <text x="20" y={height - 16} fill="#000000" fontSize="9">
          Weight: {core.coreWeight} kg
        </text>

        {/* Stack factor note */}
        <text
          x={width - 10}
          y={height - 10}
          fill="#000000"
          fontSize="8"
          textAnchor="end"
        >
          Stacking Factor: {(core.stackingFactor * 100).toFixed(0)}%
        </text>
      </svg>
    </div>
  );
}

export default CoreCrossSectionDrawing;
