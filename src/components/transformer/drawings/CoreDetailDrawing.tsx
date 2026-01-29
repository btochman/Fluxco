import type { CoreDesign } from '@/engine/types/transformer.types';

interface CoreDetailDrawingProps {
  core: CoreDesign;
  phases: number;
}

export function CoreDetailDrawing({ core, phases }: CoreDetailDrawingProps) {
  const width = 600;
  const height = 500;
  const margin = 50;

  // Scale calculations
  const coreWidth = core.windowWidth * (phases === 3 ? 2 : 1) + core.coreDiameter * (phases === 3 ? 3 : 2);
  const coreHeight = core.windowHeight + core.yokeHeight * 2;
  const maxDim = Math.max(coreWidth, coreHeight);
  const scale = (Math.min(width, height) - margin * 3) / maxDim;

  // Scaled dimensions
  const dia = core.coreDiameter * scale;
  const winW = core.windowWidth * scale;
  const winH = core.windowHeight * scale;
  const yokeH = core.yokeHeight * scale;
  const limbH = core.limbHeight * scale;

  // Number of limbs
  const numLimbs = phases === 3 ? 3 : 2;

  // Total core dimensions
  const totalW = winW * (numLimbs - 1) + dia * numLimbs;
  const totalH = winH + yokeH * 2;

  // Position
  const startX = (width - totalW) / 2;
  const startY = margin + 30;

  // Step dimensions for cross-section
  const steps = core.stepDimensions || [];
  const stepScale = (height * 0.25) / core.coreDiameter;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Background */}
        <rect width={width} height={height} fill="#ffffff" />

        <defs>
          <pattern id="coreGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
          </pattern>
          <pattern id="laminationPattern" width="2" height="2" patternUnits="userSpaceOnUse">
            <line x1="0" y1="2" x2="2" y2="0" stroke="#999999" strokeWidth="0.5" />
          </pattern>
          <marker id="coreArrowS" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6" fill="none" stroke="#000000" strokeWidth="0.5" />
          </marker>
          <marker id="coreArrowE" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="#000000" strokeWidth="0.5" />
          </marker>
        </defs>
        <rect width={width} height={height} fill="url(#coreGrid)" />

        {/* Title */}
        <text x={width / 2} y="20" fill="#000000" fontSize="12" textAnchor="middle" fontWeight="bold">
          CORE ASSEMBLY - FRONT ELEVATION
        </text>

        {/* Top Yoke */}
        <rect
          x={startX}
          y={startY}
          width={totalW}
          height={yokeH}
          fill="url(#laminationPattern)"
          stroke="#000000"
          strokeWidth="1.5"
        />

        {/* Bottom Yoke */}
        <rect
          x={startX}
          y={startY + yokeH + winH}
          width={totalW}
          height={yokeH}
          fill="url(#laminationPattern)"
          stroke="#000000"
          strokeWidth="1.5"
        />

        {/* Limbs */}
        {Array.from({ length: numLimbs }).map((_, i) => {
          const limbX = startX + i * (dia + winW);
          return (
            <g key={`limb-${i}`}>
              <rect
                x={limbX}
                y={startY + yokeH}
                width={dia}
                height={winH}
                fill="url(#laminationPattern)"
                stroke="#000000"
                strokeWidth="1.5"
              />
              {/* Phase label */}
              <text
                x={limbX + dia / 2}
                y={startY + yokeH + winH / 2}
                fill="#000000"
                fontSize="12"
                textAnchor="middle"
                dominantBaseline="middle"
                fontWeight="bold"
              >
                {phases === 3 ? ['A', 'B', 'C'][i] : ['1', '2'][i]}
              </text>
            </g>
          );
        })}

        {/* Windows (show as empty space) */}
        {Array.from({ length: numLimbs - 1 }).map((_, i) => {
          const winX = startX + dia + i * (dia + winW);
          return (
            <rect
              key={`window-${i}`}
              x={winX}
              y={startY + yokeH}
              width={winW}
              height={winH}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth="0.5"
              strokeDasharray="5,3"
            />
          );
        })}

        {/* Dimension: Total Width */}
        <g stroke="#000000" strokeWidth="0.5" fill="#000000" fontSize="9">
          <line x1={startX} y1={startY - 15} x2={startX + totalW} y2={startY - 15} markerStart="url(#coreArrowS)" markerEnd="url(#coreArrowE)" />
          <line x1={startX} y1={startY - 25} x2={startX} y2={startY - 5} />
          <line x1={startX + totalW} y1={startY - 25} x2={startX + totalW} y2={startY - 5} />
          <text x={startX + totalW / 2} y={startY - 20} textAnchor="middle" fontWeight="bold">
            {Math.round(coreWidth)} mm
          </text>
        </g>

        {/* Dimension: Core Diameter */}
        <g stroke="#000000" strokeWidth="0.5" fill="#000000" fontSize="8">
          <line x1={startX} y1={startY + yokeH + winH + yokeH + 20} x2={startX + dia} y2={startY + yokeH + winH + yokeH + 20} markerStart="url(#coreArrowS)" markerEnd="url(#coreArrowE)" />
          <line x1={startX} y1={startY + yokeH + winH + yokeH + 10} x2={startX} y2={startY + yokeH + winH + yokeH + 30} />
          <line x1={startX + dia} y1={startY + yokeH + winH + yokeH + 10} x2={startX + dia} y2={startY + yokeH + winH + yokeH + 30} />
          <text x={startX + dia / 2} y={startY + yokeH + winH + yokeH + 35} textAnchor="middle">
            Limb: {core.coreDiameter} mm
          </text>
        </g>

        {/* Dimension: Window Width */}
        {numLimbs > 1 && (
          <g stroke="#000000" strokeWidth="0.5" fill="#000000" fontSize="8">
            <line x1={startX + dia} y1={startY + yokeH + winH + yokeH + 20} x2={startX + dia + winW} y2={startY + yokeH + winH + yokeH + 20} markerStart="url(#coreArrowS)" markerEnd="url(#coreArrowE)" />
            <line x1={startX + dia} y1={startY + yokeH + winH + yokeH + 10} x2={startX + dia} y2={startY + yokeH + winH + yokeH + 30} />
            <line x1={startX + dia + winW} y1={startY + yokeH + winH + yokeH + 10} x2={startX + dia + winW} y2={startY + yokeH + winH + yokeH + 30} />
            <text x={startX + dia + winW / 2} y={startY + yokeH + winH + yokeH + 35} textAnchor="middle">
              Window: {core.windowWidth} mm
            </text>
          </g>
        )}

        {/* Dimension: Total Height */}
        <g stroke="#000000" strokeWidth="0.5" fill="#000000" fontSize="9">
          <line x1={startX + totalW + 20} y1={startY} x2={startX + totalW + 20} y2={startY + totalH} markerStart="url(#coreArrowS)" markerEnd="url(#coreArrowE)" />
          <line x1={startX + totalW + 10} y1={startY} x2={startX + totalW + 30} y2={startY} />
          <line x1={startX + totalW + 10} y1={startY + totalH} x2={startX + totalW + 30} y2={startY + totalH} />
          <text x={startX + totalW + 35} y={startY + totalH / 2} textAnchor="start" fontWeight="bold">
            {Math.round(coreHeight)} mm
          </text>
        </g>

        {/* Dimension: Window Height */}
        <g stroke="#000000" strokeWidth="0.5" fill="#000000" fontSize="8">
          <line x1={startX + totalW + 45} y1={startY + yokeH} x2={startX + totalW + 45} y2={startY + yokeH + winH} markerStart="url(#coreArrowS)" markerEnd="url(#coreArrowE)" />
          <line x1={startX + totalW + 35} y1={startY + yokeH} x2={startX + totalW + 55} y2={startY + yokeH} />
          <line x1={startX + totalW + 35} y1={startY + yokeH + winH} x2={startX + totalW + 55} y2={startY + yokeH + winH} />
          <text x={startX + totalW + 60} y={startY + yokeH + winH / 2 + 3} textAnchor="start" fontSize="8">
            Window Ht: {core.windowHeight} mm
          </text>
        </g>

        {/* Dimension: Yoke Height */}
        <g stroke="#000000" strokeWidth="0.5" fill="#000000" fontSize="8">
          <line x1={startX - 20} y1={startY} x2={startX - 20} y2={startY + yokeH} markerStart="url(#coreArrowS)" markerEnd="url(#coreArrowE)" />
          <line x1={startX - 30} y1={startY} x2={startX - 10} y2={startY} />
          <line x1={startX - 30} y1={startY + yokeH} x2={startX - 10} y2={startY + yokeH} />
          <text x={startX - 35} y={startY + yokeH / 2 + 3} textAnchor="end" fontSize="8">
            Yoke: {core.yokeHeight} mm
          </text>
        </g>

        {/* Core Cross-Section Detail */}
        <g transform={`translate(${width - 180}, ${height - 180})`}>
          <rect x="-5" y="-5" width="170" height="170" fill="#ffffff" stroke="#000000" rx="3" />
          <text x="80" y="12" fill="#000000" fontSize="9" textAnchor="middle" fontWeight="bold">
            CORE CROSS-SECTION
          </text>
          <text x="80" y="24" fill="#000000" fontSize="7" textAnchor="middle">
            (Stepped Circular)
          </text>

          {/* Draw stepped core cross-section */}
          {steps.length > 0 ? (
            <g transform="translate(80, 95)">
              {steps.map((step, i) => {
                const stepW = step.width * stepScale;
                const stepH = step.height * stepScale;
                return (
                  <g key={i}>
                    {/* Left half */}
                    <rect
                      x={-stepW / 2}
                      y={-stepH / 2}
                      width={stepW / 2}
                      height={stepH}
                      fill={i % 2 === 0 ? '#e0e0e0' : '#cccccc'}
                      stroke="#000000"
                      strokeWidth="0.5"
                    />
                    {/* Right half (mirror) */}
                    <rect
                      x={0}
                      y={-stepH / 2}
                      width={stepW / 2}
                      height={stepH}
                      fill={i % 2 === 0 ? '#e0e0e0' : '#cccccc'}
                      stroke="#000000"
                      strokeWidth="0.5"
                    />
                  </g>
                );
              })}
              {/* Dimension line */}
              <line x1={-core.coreDiameter * stepScale / 2} y1={50} x2={core.coreDiameter * stepScale / 2} y2={50} stroke="#000000" strokeWidth="0.5" markerStart="url(#coreArrowS)" markerEnd="url(#coreArrowE)" />
              <text x="0" y="62" fill="#000000" fontSize="7" textAnchor="middle">
                {core.coreDiameter} mm
              </text>
            </g>
          ) : (
            <g transform="translate(80, 95)">
              {/* Simple circle if no step data */}
              <circle r={core.coreDiameter * stepScale / 2} fill="#e0e0e0" stroke="#000000" strokeWidth="1" />
              <text x="0" y={core.coreDiameter * stepScale / 2 + 15} fill="#000000" fontSize="7" textAnchor="middle">
                {core.coreDiameter} mm
              </text>
            </g>
          )}
        </g>

        {/* Specifications Table */}
        <g transform="translate(10, height - 120)">
          <rect x="0" y="0" width="160" height="110" fill="#ffffff" stroke="#000000" rx="3" />
          <text x="80" y="15" fill="#000000" fontSize="9" textAnchor="middle" fontWeight="bold">
            CORE SPECIFICATIONS
          </text>
          <line x1="5" y1="20" x2="155" y2="20" stroke="#000000" />

          {[
            ['Steel Grade:', core.steelGrade.name.split(' ')[0]],
            ['Flux Density:', `${core.fluxDensity} T`],
            ['Net Area:', `${core.netCrossSection.toFixed(0)} cm²`],
            ['Gross Area:', `${core.grossCrossSection.toFixed(0)} cm²`],
            ['Core Steps:', `${core.coreSteps}`],
            ['Stack Factor:', `${(core.stackingFactor * 100).toFixed(0)}%`],
            ['Core Weight:', `${core.coreWeight.toFixed(0)} kg`],
          ].map(([label, value], i) => (
            <g key={i}>
              <text x="10" y={35 + i * 12} fill="#000000" fontSize="8">{label}</text>
              <text x="150" y={35 + i * 12} fill="#000000" fontSize="8" textAnchor="end" fontWeight="bold">{value}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default CoreDetailDrawing;
