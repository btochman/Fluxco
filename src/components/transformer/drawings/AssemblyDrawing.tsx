import type { CoreDesign, WindingDesign, TankDesign, ThermalDesign } from '@/engine/types/transformer.types';

interface AssemblyDrawingProps {
  core: CoreDesign;
  hvWinding: WindingDesign;
  lvWinding: WindingDesign;
  tank: TankDesign;
  thermal: ThermalDesign;
  primaryVoltage: number;
  secondaryVoltage: number;
  vectorGroup: string;
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
}: AssemblyDrawingProps) {
  // SVG dimensions
  const width = 600;
  const height = 500;
  const centerX = width / 2;

  // Scale to fit tank in SVG
  const maxTankHeight = height - 120;
  const scale = maxTankHeight / tank.overallHeight;

  // Scaled dimensions
  const tankW = tank.width * scale;
  const tankH = tank.height * scale;
  const tankL = tank.length * scale;

  // Tank position
  const tankLeft = centerX - tankW / 2;
  const tankTop = 80;

  // Bushing dimensions
  const hvBushingHeight = 60;
  const lvBushingHeight = 40;
  const bushingWidth = 12;
  const bushingSpacing = tankW / 4;

  // Radiator dimensions
  const radiatorWidth = 20;
  const radiatorHeight = tankH * 0.6;
  const radiatorTop = tankTop + tankH * 0.2;

  // Conservator dimensions
  const conservatorWidth = tankW * 0.4;
  const conservatorHeight = 25;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-h-[500px]">
        {/* Background */}
        <rect width={width} height={height} fill="#ffffff" />

        {/* Background grid */}
        <defs>
          <pattern id="assemblyGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="0.5"
            />
          </pattern>
          {/* Radiator fin pattern */}
          <pattern id="radiatorFins" width="4" height="10" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="2" height="10" fill="#cccccc" />
          </pattern>
          {/* Insulator pattern */}
          <linearGradient id="porcelainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e8e8e8" />
            <stop offset="50%" stopColor="#f5f5f5" />
            <stop offset="100%" stopColor="#e8e8e8" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#assemblyGrid)" />

        {/* Title */}
        <text
          x={centerX}
          y="25"
          fill="#000000"
          fontSize="14"
          textAnchor="middle"
          fontWeight="bold"
        >
          TRANSFORMER ASSEMBLY - FRONT VIEW
        </text>

        {/* Conservator Tank (expansion tank) */}
        <g>
          <rect
            x={centerX - conservatorWidth / 2}
            y={tankTop - conservatorHeight - 30}
            width={conservatorWidth}
            height={conservatorHeight}
            fill="#f5f5f5"
            stroke="#000000"
            strokeWidth="2"
            rx="3"
          />
          {/* Oil level indicator */}
          <rect
            x={centerX - conservatorWidth / 2 + 10}
            y={tankTop - conservatorHeight - 25}
            width={20}
            height={15}
            fill="none"
            stroke="#000000"
            strokeWidth="1"
          />
          <line
            x1={centerX - conservatorWidth / 2 + 15}
            y1={tankTop - conservatorHeight - 15}
            x2={centerX - conservatorWidth / 2 + 25}
            y2={tankTop - conservatorHeight - 15}
            stroke="#000000"
            strokeWidth="2"
          />
          {/* Conservator pipe */}
          <line
            x1={centerX}
            y1={tankTop - conservatorHeight - 5}
            x2={centerX}
            y2={tankTop}
            stroke="#000000"
            strokeWidth="3"
          />
          <text
            x={centerX + conservatorWidth / 2 + 5}
            y={tankTop - conservatorHeight - 10}
            fill="#000000"
            fontSize="8"
          >
            CONSERVATOR
          </text>
        </g>

        {/* Main Tank */}
        <rect
          x={tankLeft}
          y={tankTop}
          width={tankW}
          height={tankH}
          fill="#f5f5f5"
          stroke="#000000"
          strokeWidth="2"
          rx="3"
        />

        {/* Tank stiffeners */}
        {[0.25, 0.5, 0.75].map((pos, i) => (
          <line
            key={i}
            x1={tankLeft + tankW * pos}
            y1={tankTop}
            x2={tankLeft + tankW * pos}
            y2={tankTop + tankH}
            stroke="#666666"
            strokeWidth="1"
          />
        ))}

        {/* Core and Windings (simplified cross-section view) */}
        <g>
          {/* Core limbs */}
          {[0.25, 0.5, 0.75].map((pos, i) => {
            const limbX = tankLeft + tankW * pos;
            const limbW = core.coreDiameter * scale * 0.3;
            const limbH = tankH * 0.6;
            const limbTop = tankTop + tankH * 0.2;
            return (
              <g key={i}>
                {/* Core limb */}
                <rect
                  x={limbX - limbW / 2}
                  y={limbTop}
                  width={limbW}
                  height={limbH}
                  fill="#cccccc"
                  stroke="#000000"
                  strokeWidth="1"
                />
                {/* LV Winding */}
                <rect
                  x={limbX - limbW / 2 - 8}
                  y={limbTop + 10}
                  width={8}
                  height={limbH - 20}
                  fill="#e8e8e8"
                  stroke="#000000"
                  strokeWidth="1"
                />
                <rect
                  x={limbX + limbW / 2}
                  y={limbTop + 10}
                  width={8}
                  height={limbH - 20}
                  fill="#e8e8e8"
                  stroke="#000000"
                  strokeWidth="1"
                />
                {/* HV Winding */}
                <rect
                  x={limbX - limbW / 2 - 18}
                  y={limbTop + 10}
                  width={8}
                  height={limbH - 20}
                  fill="#f5f5f5"
                  stroke="#000000"
                  strokeWidth="1"
                />
                <rect
                  x={limbX + limbW / 2 + 10}
                  y={limbTop + 10}
                  width={8}
                  height={limbH - 20}
                  fill="#f5f5f5"
                  stroke="#000000"
                  strokeWidth="1"
                />
              </g>
            );
          })}
          {/* Top yoke */}
          <rect
            x={tankLeft + tankW * 0.15}
            y={tankTop + tankH * 0.15}
            width={tankW * 0.7}
            height={core.coreDiameter * scale * 0.15}
            fill="#cccccc"
            stroke="#000000"
            strokeWidth="1"
          />
          {/* Bottom yoke */}
          <rect
            x={tankLeft + tankW * 0.15}
            y={tankTop + tankH * 0.8}
            width={tankW * 0.7}
            height={core.coreDiameter * scale * 0.15}
            fill="#cccccc"
            stroke="#000000"
            strokeWidth="1"
          />
        </g>

        {/* Radiators - Left side */}
        {Array.from({ length: Math.min(thermal.numberOfRadiators, 4) }).map((_, i) => (
          <g key={`left-${i}`}>
            <rect
              x={tankLeft - radiatorWidth - 5 - i * 8}
              y={radiatorTop}
              width={radiatorWidth}
              height={radiatorHeight}
              fill="url(#radiatorFins)"
              stroke="#000000"
              strokeWidth="1"
            />
            {/* Inlet/outlet pipes */}
            <line
              x1={tankLeft}
              y1={radiatorTop + 15}
              x2={tankLeft - 5 - i * 8}
              y2={radiatorTop + 15}
              stroke="#000000"
              strokeWidth="2"
            />
            <line
              x1={tankLeft}
              y1={radiatorTop + radiatorHeight - 15}
              x2={tankLeft - 5 - i * 8}
              y2={radiatorTop + radiatorHeight - 15}
              stroke="#000000"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Radiators - Right side */}
        {Array.from({ length: Math.min(thermal.numberOfRadiators, 4) }).map((_, i) => (
          <g key={`right-${i}`}>
            <rect
              x={tankLeft + tankW + 5 + i * 8}
              y={radiatorTop}
              width={radiatorWidth}
              height={radiatorHeight}
              fill="url(#radiatorFins)"
              stroke="#000000"
              strokeWidth="1"
            />
            {/* Inlet/outlet pipes */}
            <line
              x1={tankLeft + tankW}
              y1={radiatorTop + 15}
              x2={tankLeft + tankW + 5 + i * 8}
              y2={radiatorTop + 15}
              stroke="#000000"
              strokeWidth="2"
            />
            <line
              x1={tankLeft + tankW}
              y1={radiatorTop + radiatorHeight - 15}
              x2={tankLeft + tankW + 5 + i * 8}
              y2={radiatorTop + radiatorHeight - 15}
              stroke="#000000"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* HV Bushings (3 phases) */}
        {[0, 1, 2].map((i) => {
          const bushingX = tankLeft + bushingSpacing * (i + 0.5);
          return (
            <g key={`hv-bushing-${i}`}>
              {/* Porcelain insulator */}
              <rect
                x={bushingX - bushingWidth / 2}
                y={tankTop - hvBushingHeight}
                width={bushingWidth}
                height={hvBushingHeight}
                fill="url(#porcelainGradient)"
                stroke="#000000"
                strokeWidth="1.5"
                rx="2"
              />
              {/* Insulator sheds */}
              {[0.2, 0.4, 0.6, 0.8].map((pos, j) => (
                <ellipse
                  key={j}
                  cx={bushingX}
                  cy={tankTop - hvBushingHeight * pos}
                  rx={bushingWidth / 2 + 4}
                  ry={3}
                  fill="url(#porcelainGradient)"
                  stroke="#000000"
                  strokeWidth="1"
                />
              ))}
              {/* Terminal */}
              <circle
                cx={bushingX}
                cy={tankTop - hvBushingHeight - 8}
                r={6}
                fill="#f5f5f5"
                stroke="#000000"
                strokeWidth="1"
              />
              {/* Phase label */}
              <text
                x={bushingX}
                y={tankTop - hvBushingHeight - 20}
                fill="#000000"
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
              >
                H{i + 1}
              </text>
            </g>
          );
        })}

        {/* LV Bushings (3 phases + neutral) */}
        {[0, 1, 2, 3].map((i) => {
          const bushingX = tankLeft + tankW - bushingSpacing * (i + 0.5);
          const isNeutral = i === 3;
          return (
            <g key={`lv-bushing-${i}`}>
              {/* Porcelain insulator */}
              <rect
                x={bushingX - bushingWidth / 2}
                y={tankTop - lvBushingHeight}
                width={bushingWidth}
                height={lvBushingHeight}
                fill="url(#porcelainGradient)"
                stroke="#000000"
                strokeWidth="1.5"
                rx="2"
              />
              {/* Insulator sheds */}
              {[0.3, 0.7].map((pos, j) => (
                <ellipse
                  key={j}
                  cx={bushingX}
                  cy={tankTop - lvBushingHeight * pos}
                  rx={bushingWidth / 2 + 3}
                  ry={2}
                  fill="url(#porcelainGradient)"
                  stroke="#000000"
                  strokeWidth="1"
                />
              ))}
              {/* Terminal */}
              <circle
                cx={bushingX}
                cy={tankTop - lvBushingHeight - 6}
                r={5}
                fill="#f5f5f5"
                stroke="#000000"
                strokeWidth="1"
              />
              {/* Phase label */}
              <text
                x={bushingX}
                y={tankTop - lvBushingHeight - 16}
                fill="#000000"
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
              >
                {isNeutral ? 'X0' : `X${i + 1}`}
              </text>
            </g>
          );
        })}

        {/* Tap Changer */}
        <g>
          <rect
            x={tankLeft + tankW + 5}
            y={tankTop + 20}
            width={30}
            height={50}
            fill="#f5f5f5"
            stroke="#000000"
            strokeWidth="1.5"
            rx="2"
          />
          <text
            x={tankLeft + tankW + 20}
            y={tankTop + 50}
            fill="#000000"
            fontSize="7"
            textAnchor="middle"
          >
            OLTC
          </text>
          {/* Hand wheel */}
          <circle
            cx={tankLeft + tankW + 20}
            cy={tankTop + 35}
            r={8}
            fill="none"
            stroke="#000000"
            strokeWidth="2"
          />
        </g>

        {/* Grounding terminal */}
        <g>
          <rect
            x={tankLeft + 10}
            y={tankTop + tankH - 20}
            width={15}
            height={15}
            fill="#e8e8e8"
            stroke="#000000"
            strokeWidth="1"
          />
          <text
            x={tankLeft + 17}
            y={tankTop + tankH - 5}
            fill="#000000"
            fontSize="7"
            textAnchor="middle"
          >
            GND
          </text>
        </g>

        {/* Drain valve */}
        <g>
          <rect
            x={centerX - 10}
            y={tankTop + tankH}
            width={20}
            height={10}
            fill="#cccccc"
            stroke="#000000"
            strokeWidth="1"
          />
          <circle
            cx={centerX}
            cy={tankTop + tankH + 15}
            r={6}
            fill="none"
            stroke="#000000"
            strokeWidth="2"
          />
        </g>

        {/* Nameplate */}
        <rect
          x={tankLeft + 15}
          y={tankTop + tankH * 0.4}
          width={40}
          height={25}
          fill="#f5f5f5"
          stroke="#000000"
          strokeWidth="1"
        />
        <text
          x={tankLeft + 35}
          y={tankTop + tankH * 0.4 + 15}
          fill="#000000"
          fontSize="6"
          textAnchor="middle"
        >
          NAMEPLATE
        </text>

        {/* Legend */}
        <rect x="10" y={height - 80} width="160" height="70" fill="#ffffff" stroke="#000000" strokeWidth="1" rx="4" />
        <text x="20" y={height - 62} fill="#000000" fontSize="10" fontWeight="bold">
          CONNECTIONS
        </text>
        {/* HV */}
        <circle cx="25" cy={height - 47} r="5" fill="#f5f5f5" stroke="#000000" />
        <text x="35" y={height - 43} fill="#000000" fontSize="9">
          HV: H1-H2-H3 ({(primaryVoltage/1000).toFixed(1)}kV)
        </text>
        {/* LV */}
        <circle cx="25" cy={height - 32} r="5" fill="#f5f5f5" stroke="#000000" />
        <text x="35" y={height - 28} fill="#000000" fontSize="9">
          LV: X1-X2-X3-X0 ({secondaryVoltage}V)
        </text>
        {/* Vector */}
        <text x="20" y={height - 15} fill="#000000" fontSize="8">
          Vector Group: {vectorGroup}
        </text>

        {/* Dimensions */}
        <g stroke="#000000" strokeWidth="0.5" fontSize="8" fill="#000000">
          {/* Width dimension */}
          <line x1={tankLeft} y1={tankTop + tankH + 25} x2={tankLeft + tankW} y2={tankTop + tankH + 25} />
          <line x1={tankLeft} y1={tankTop + tankH + 20} x2={tankLeft} y2={tankTop + tankH + 30} />
          <line x1={tankLeft + tankW} y1={tankTop + tankH + 20} x2={tankLeft + tankW} y2={tankTop + tankH + 30} />
          <text x={centerX} y={tankTop + tankH + 38} textAnchor="middle">
            {tank.width}mm
          </text>
          {/* Height dimension */}
          <line x1={tankLeft + tankW + 60} y1={tankTop} x2={tankLeft + tankW + 60} y2={tankTop + tankH} />
          <line x1={tankLeft + tankW + 55} y1={tankTop} x2={tankLeft + tankW + 65} y2={tankTop} />
          <line x1={tankLeft + tankW + 55} y1={tankTop + tankH} x2={tankLeft + tankW + 65} y2={tankTop + tankH} />
          <text x={tankLeft + tankW + 75} y={tankTop + tankH / 2} textAnchor="middle" transform={`rotate(90, ${tankLeft + tankW + 75}, ${tankTop + tankH / 2})`}>
            {tank.height}mm
          </text>
        </g>

        {/* Weight info */}
        <text
          x={width - 10}
          y={height - 10}
          fill="#000000"
          fontSize="8"
          textAnchor="end"
        >
          Total Weight: {tank.totalWeight.toFixed(0)} kg
        </text>
      </svg>
    </div>
  );
}

export default AssemblyDrawing;
