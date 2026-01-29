import type { CoreDesign, WindingDesign } from '@/engine/types/transformer.types';

interface WindingDetailDrawingProps {
  core: CoreDesign;
  hvWinding: WindingDesign;
  lvWinding: WindingDesign;
}

export function WindingDetailDrawing({
  core,
  hvWinding,
  lvWinding,
}: WindingDetailDrawingProps) {
  const width = 600;
  const height = 500;
  const margin = 40;

  // Calculate the maximum dimension to fit in view
  const maxRadius = hvWinding.outerRadius + 20;
  const maxHeight = Math.max(hvWinding.windingHeight, lvWinding.windingHeight) + 40;
  const maxDim = Math.max(maxRadius * 2, maxHeight);
  const scale = (Math.min(width * 0.55, height - margin * 2)) / maxDim;

  // Scaled dimensions
  const coreR = (core.coreDiameter / 2) * scale;
  const lvInnerR = lvWinding.innerRadius * scale;
  const lvOuterR = lvWinding.outerRadius * scale;
  const hvInnerR = hvWinding.innerRadius * scale;
  const hvOuterR = hvWinding.outerRadius * scale;
  const lvH = lvWinding.windingHeight * scale;
  const hvH = hvWinding.windingHeight * scale;

  // Center position for section view
  const centerX = width * 0.35;
  const centerY = height / 2;

  // Clearances
  const coreToLV = lvWinding.innerRadius - core.coreDiameter / 2;
  const lvToHV = hvWinding.innerRadius - lvWinding.outerRadius;
  const hvToTank = 50; // Typical clearance estimate

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Background */}
        <defs>
          <pattern id="windingGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--primary) / 0.08)" strokeWidth="0.5" />
          </pattern>
          <pattern id="copperHatch" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M0,4 L4,0" stroke="hsl(var(--copper) / 0.5)" strokeWidth="0.5" />
          </pattern>
          <pattern id="hvHatch" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M0,0 L4,4" stroke="hsl(var(--primary) / 0.5)" strokeWidth="0.5" />
          </pattern>
          <marker id="windArrowS" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          </marker>
          <marker id="windArrowE" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          </marker>
        </defs>
        <rect width={width} height={height} fill="url(#windingGrid)" />

        {/* Title */}
        <text x={width / 2} y="20" fill="hsl(var(--primary))" fontSize="12" textAnchor="middle" fontWeight="bold">
          WINDING ARRANGEMENT - SECTION VIEW (SINGLE LIMB)
        </text>

        {/* Core limb (center) */}
        <rect
          x={centerX - coreR}
          y={centerY - Math.max(lvH, hvH) / 2 - 10}
          width={coreR * 2}
          height={Math.max(lvH, hvH) + 20}
          fill="hsl(var(--steel) / 0.4)"
          stroke="hsl(var(--steel))"
          strokeWidth="1.5"
        />
        <text x={centerX} y={centerY} fill="hsl(var(--foreground))" fontSize="10" textAnchor="middle" fontWeight="bold">
          CORE
        </text>

        {/* LV Winding (left half section) */}
        <rect
          x={centerX - lvOuterR}
          y={centerY - lvH / 2}
          width={lvOuterR - lvInnerR}
          height={lvH}
          fill="url(#copperHatch)"
          stroke="hsl(var(--glow))"
          strokeWidth="2"
        />
        {/* LV Winding (right half section) */}
        <rect
          x={centerX + lvInnerR}
          y={centerY - lvH / 2}
          width={lvOuterR - lvInnerR}
          height={lvH}
          fill="url(#copperHatch)"
          stroke="hsl(var(--glow))"
          strokeWidth="2"
        />
        <text x={centerX - (lvInnerR + lvOuterR) / 2} y={centerY} fill="hsl(var(--glow))" fontSize="8" textAnchor="middle" fontWeight="bold">
          LV
        </text>

        {/* HV Winding (left half section) */}
        <rect
          x={centerX - hvOuterR}
          y={centerY - hvH / 2}
          width={hvOuterR - hvInnerR}
          height={hvH}
          fill="url(#hvHatch)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        {/* HV Winding (right half section) */}
        <rect
          x={centerX + hvInnerR}
          y={centerY - hvH / 2}
          width={hvOuterR - hvInnerR}
          height={hvH}
          fill="url(#hvHatch)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        <text x={centerX - (hvInnerR + hvOuterR) / 2} y={centerY} fill="hsl(var(--primary))" fontSize="8" textAnchor="middle" fontWeight="bold">
          HV
        </text>

        {/* Center line */}
        <line
          x1={centerX}
          y1={centerY - Math.max(lvH, hvH) / 2 - 30}
          x2={centerX}
          y2={centerY + Math.max(lvH, hvH) / 2 + 30}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="0.5"
          strokeDasharray="10,5"
        />
        <text x={centerX + 5} y={centerY - Math.max(lvH, hvH) / 2 - 20} fill="hsl(var(--muted-foreground))" fontSize="7">
          CL
        </text>

        {/* Dimension: Core radius */}
        <g stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" fill="hsl(var(--muted-foreground))" fontSize="7">
          <line x1={centerX} y1={centerY + Math.max(lvH, hvH) / 2 + 20} x2={centerX + coreR} y2={centerY + Math.max(lvH, hvH) / 2 + 20} markerStart="url(#windArrowS)" markerEnd="url(#windArrowE)" />
          <text x={centerX + coreR / 2} y={centerY + Math.max(lvH, hvH) / 2 + 32} textAnchor="middle">
            R{core.coreDiameter / 2} mm
          </text>
        </g>

        {/* Dimension: LV outer radius */}
        <g stroke="hsl(var(--glow))" strokeWidth="0.5" fill="hsl(var(--glow))" fontSize="7">
          <line x1={centerX} y1={centerY + Math.max(lvH, hvH) / 2 + 38} x2={centerX + lvOuterR} y2={centerY + Math.max(lvH, hvH) / 2 + 38} markerStart="url(#windArrowS)" markerEnd="url(#windArrowE)" />
          <text x={centerX + lvOuterR / 2} y={centerY + Math.max(lvH, hvH) / 2 + 50} textAnchor="middle">
            LV R{lvWinding.outerRadius} mm
          </text>
        </g>

        {/* Dimension: HV outer radius */}
        <g stroke="hsl(var(--primary))" strokeWidth="0.5" fill="hsl(var(--primary))" fontSize="7">
          <line x1={centerX} y1={centerY + Math.max(lvH, hvH) / 2 + 56} x2={centerX + hvOuterR} y2={centerY + Math.max(lvH, hvH) / 2 + 56} markerStart="url(#windArrowS)" markerEnd="url(#windArrowE)" />
          <text x={centerX + hvOuterR / 2} y={centerY + Math.max(lvH, hvH) / 2 + 68} textAnchor="middle">
            HV R{hvWinding.outerRadius} mm
          </text>
        </g>

        {/* Dimension: LV winding height */}
        <g stroke="hsl(var(--glow))" strokeWidth="0.5" fill="hsl(var(--glow))" fontSize="7">
          <line x1={centerX - lvOuterR - 15} y1={centerY - lvH / 2} x2={centerX - lvOuterR - 15} y2={centerY + lvH / 2} markerStart="url(#windArrowS)" markerEnd="url(#windArrowE)" />
          <line x1={centerX - lvOuterR - 25} y1={centerY - lvH / 2} x2={centerX - lvOuterR - 5} y2={centerY - lvH / 2} />
          <line x1={centerX - lvOuterR - 25} y1={centerY + lvH / 2} x2={centerX - lvOuterR - 5} y2={centerY + lvH / 2} />
          <text x={centerX - lvOuterR - 30} y={centerY} textAnchor="end" fontSize="7">
            LV Ht: {lvWinding.windingHeight} mm
          </text>
        </g>

        {/* Dimension: HV winding height */}
        <g stroke="hsl(var(--primary))" strokeWidth="0.5" fill="hsl(var(--primary))" fontSize="7">
          <line x1={centerX + hvOuterR + 15} y1={centerY - hvH / 2} x2={centerX + hvOuterR + 15} y2={centerY + hvH / 2} markerStart="url(#windArrowS)" markerEnd="url(#windArrowE)" />
          <line x1={centerX + hvOuterR + 5} y1={centerY - hvH / 2} x2={centerX + hvOuterR + 25} y2={centerY - hvH / 2} />
          <line x1={centerX + hvOuterR + 5} y1={centerY + hvH / 2} x2={centerX + hvOuterR + 25} y2={centerY + hvH / 2} />
          <text x={centerX + hvOuterR + 30} y={centerY} textAnchor="start" fontSize="7">
            HV Ht: {hvWinding.windingHeight} mm
          </text>
        </g>

        {/* Clearances annotation */}
        <g transform="translate(10, 50)">
          <text x="0" y="0" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold">INSULATION CLEARANCES</text>
          <line x1="0" y1="5" x2="140" y2="5" stroke="hsl(var(--border))" />
          {[
            [`Core to LV:`, `${coreToLV.toFixed(1)} mm`],
            [`LV to HV (Main Gap):`, `${lvToHV.toFixed(1)} mm`],
            [`LV Thickness:`, `${lvWinding.windingThickness.toFixed(1)} mm`],
            [`HV Thickness:`, `${hvWinding.windingThickness.toFixed(1)} mm`],
          ].map(([label, value], i) => (
            <g key={i}>
              <text x="5" y={20 + i * 14} fill="hsl(var(--muted-foreground))" fontSize="8">{label}</text>
              <text x="140" y={20 + i * 14} fill="hsl(var(--foreground))" fontSize="8" textAnchor="end" fontWeight="bold">{value}</text>
            </g>
          ))}
        </g>

        {/* Winding Specifications Tables */}
        <g transform={`translate(${width - 200}, 50)`}>
          <rect x="0" y="0" width="190" height="95" fill="hsl(var(--background))" stroke="hsl(var(--glow))" rx="3" />
          <text x="95" y="15" fill="hsl(var(--glow))" fontSize="9" textAnchor="middle" fontWeight="bold">LV WINDING</text>
          <line x1="5" y1="20" x2="185" y2="20" stroke="hsl(var(--border))" />
          {[
            ['Turns:', `${lvWinding.turns}`],
            ['Layers:', `${lvWinding.layers}`],
            ['Current:', `${lvWinding.ratedCurrent.toFixed(1)} A`],
            ['Current Density:', `${lvWinding.currentDensity.toFixed(2)} A/mm²`],
            ['Conductor Weight:', `${lvWinding.conductorWeight.toFixed(1)} kg`],
          ].map(([label, value], i) => (
            <g key={i}>
              <text x="10" y={35 + i * 12} fill="hsl(var(--muted-foreground))" fontSize="7">{label}</text>
              <text x="180" y={35 + i * 12} fill="hsl(var(--foreground))" fontSize="7" textAnchor="end">{value}</text>
            </g>
          ))}
        </g>

        <g transform={`translate(${width - 200}, 155)`}>
          <rect x="0" y="0" width="190" height="95" fill="hsl(var(--background))" stroke="hsl(var(--primary))" rx="3" />
          <text x="95" y="15" fill="hsl(var(--primary))" fontSize="9" textAnchor="middle" fontWeight="bold">HV WINDING</text>
          <line x1="5" y1="20" x2="185" y2="20" stroke="hsl(var(--border))" />
          {[
            ['Turns:', `${hvWinding.turns}`],
            ['Layers:', `${hvWinding.layers}`],
            ['Current:', `${hvWinding.ratedCurrent.toFixed(1)} A`],
            ['Current Density:', `${hvWinding.currentDensity.toFixed(2)} A/mm²`],
            ['Conductor Weight:', `${hvWinding.conductorWeight.toFixed(1)} kg`],
          ].map(([label, value], i) => (
            <g key={i}>
              <text x="10" y={35 + i * 12} fill="hsl(var(--muted-foreground))" fontSize="7">{label}</text>
              <text x="180" y={35 + i * 12} fill="hsl(var(--foreground))" fontSize="7" textAnchor="end">{value}</text>
            </g>
          ))}
        </g>

        {/* Conductor Details */}
        <g transform={`translate(${width - 200}, 260)`}>
          <rect x="0" y="0" width="190" height="80" fill="hsl(var(--background))" stroke="hsl(var(--border))" rx="3" />
          <text x="95" y="15" fill="hsl(var(--foreground))" fontSize="9" textAnchor="middle" fontWeight="bold">CONDUCTOR DATA</text>
          <line x1="5" y1="20" x2="185" y2="20" stroke="hsl(var(--border))" />
          {[
            ['LV Conductor:', `${lvWinding.conductorSize.crossSection.toFixed(1)} mm²`],
            ['HV Conductor:', `${hvWinding.conductorSize.crossSection.toFixed(2)} mm²`],
            ['LV DC Resistance:', `${(lvWinding.dcResistance * 1000).toFixed(2)} mΩ`],
            ['HV DC Resistance:', `${hvWinding.dcResistance.toFixed(3)} Ω`],
          ].map(([label, value], i) => (
            <g key={i}>
              <text x="10" y={35 + i * 12} fill="hsl(var(--muted-foreground))" fontSize="7">{label}</text>
              <text x="180" y={35 + i * 12} fill="hsl(var(--foreground))" fontSize="7" textAnchor="end">{value}</text>
            </g>
          ))}
        </g>

        {/* Legend */}
        <g transform={`translate(${width - 200}, ${height - 90})`}>
          <rect x="0" y="0" width="190" height="80" fill="hsl(var(--background))" stroke="hsl(var(--border))" rx="3" />
          <text x="95" y="15" fill="hsl(var(--foreground))" fontSize="9" textAnchor="middle" fontWeight="bold">LEGEND</text>
          <rect x="10" y="25" width="20" height="12" fill="hsl(var(--steel) / 0.4)" stroke="hsl(var(--steel))" />
          <text x="35" y="34" fill="hsl(var(--muted-foreground))" fontSize="7">Core (Silicon Steel)</text>
          <rect x="10" y="42" width="20" height="12" fill="url(#copperHatch)" stroke="hsl(var(--glow))" strokeWidth="1.5" />
          <text x="35" y="51" fill="hsl(var(--muted-foreground))" fontSize="7">LV Winding ({lvWinding.conductorType})</text>
          <rect x="10" y="59" width="20" height="12" fill="url(#hvHatch)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
          <text x="35" y="68" fill="hsl(var(--muted-foreground))" fontSize="7">HV Winding ({hvWinding.conductorType})</text>
        </g>
      </svg>
    </div>
  );
}

export default WindingDetailDrawing;
