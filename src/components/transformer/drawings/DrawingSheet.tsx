import type { ReactNode } from 'react';

interface DrawingSheetProps {
  title: string;
  drawingNumber?: string;
  scale?: string;
  revision?: string;
  sheetOf?: string;
  children: ReactNode;
}

// D-size landscape proportions (34" x 22" → 1100 x 850 SVG units)
const SHEET_W = 1100;
const SHEET_H = 850;
const BORDER = 10;
const INNER = 20;

// Title block dimensions
const TB_W = 280;
const TB_H = 100;
const TB_X = SHEET_W - INNER - TB_W;
const TB_Y = SHEET_H - INNER - TB_H;

// Revision block (above title block)
const REV_H = 60;
const REV_Y = TB_Y - REV_H;

// Zone markers
const ZONE_COLS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const ZONE_ROWS = ['D', 'C', 'B', 'A'];

// Drawing area (where children render)
export const DRAWING_AREA = {
  x: INNER + 15,
  y: INNER + 15,
  width: SHEET_W - INNER * 2 - 30,
  height: SHEET_H - INNER * 2 - 30,
};

export function DrawingSheet({
  title,
  drawingNumber = '',
  scale = 'NTS',
  revision = '0',
  sheetOf = '1 OF 1',
  children,
}: DrawingSheetProps) {
  const colWidth = (SHEET_W - INNER * 2) / ZONE_COLS.length;
  const rowHeight = (SHEET_H - INNER * 2) / ZONE_ROWS.length;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${SHEET_W} ${SHEET_H}`}
        className="w-full border border-gray-300"
        style={{ background: '#ffffff' }}
      >
        {/* Defs */}
        <defs>
          {/* Dimension arrow - filled */}
          <marker id="dimArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#000000" />
          </marker>
          <marker id="dimArrowRev" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M8,0 L0,3 L8,6 Z" fill="#000000" />
          </marker>
          {/* Leader arrow */}
          <marker id="leaderArrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <path d="M0,0 L6,2 L0,4 Z" fill="#000000" />
          </marker>
        </defs>

        {/* Outer border */}
        <rect
          x={BORDER}
          y={BORDER}
          width={SHEET_W - BORDER * 2}
          height={SHEET_H - BORDER * 2}
          fill="none"
          stroke="#000000"
          strokeWidth="0.5"
        />

        {/* Inner border */}
        <rect
          x={INNER}
          y={INNER}
          width={SHEET_W - INNER * 2}
          height={SHEET_H - INNER * 2}
          fill="none"
          stroke="#000000"
          strokeWidth="1.5"
        />

        {/* Zone markers - top/bottom (columns) */}
        {ZONE_COLS.map((label, i) => {
          const x = INNER + colWidth * i + colWidth / 2;
          return (
            <g key={`col-${i}`}>
              {/* Top */}
              <line x1={INNER + colWidth * i} y1={BORDER} x2={INNER + colWidth * i} y2={INNER} stroke="#000" strokeWidth="0.5" />
              <text x={x} y={BORDER + 7} textAnchor="middle" fontSize="6" fontFamily="Arial, sans-serif" fill="#000">
                {label}
              </text>
              {/* Bottom */}
              <line x1={INNER + colWidth * i} y1={SHEET_H - INNER} x2={INNER + colWidth * i} y2={SHEET_H - BORDER} stroke="#000" strokeWidth="0.5" />
              <text x={x} y={SHEET_H - BORDER - 2} textAnchor="middle" fontSize="6" fontFamily="Arial, sans-serif" fill="#000">
                {label}
              </text>
            </g>
          );
        })}

        {/* Zone markers - left/right (rows) */}
        {ZONE_ROWS.map((label, i) => {
          const y = INNER + rowHeight * i + rowHeight / 2;
          return (
            <g key={`row-${i}`}>
              {/* Left */}
              <line x1={BORDER} y1={INNER + rowHeight * i} x2={INNER} y2={INNER + rowHeight * i} stroke="#000" strokeWidth="0.5" />
              <text x={BORDER + 5} y={y + 2} textAnchor="middle" fontSize="6" fontFamily="Arial, sans-serif" fill="#000">
                {label}
              </text>
              {/* Right */}
              <line x1={SHEET_W - INNER} y1={INNER + rowHeight * i} x2={SHEET_W - BORDER} y2={INNER + rowHeight * i} stroke="#000" strokeWidth="0.5" />
              <text x={SHEET_W - BORDER - 5} y={y + 2} textAnchor="middle" fontSize="6" fontFamily="Arial, sans-serif" fill="#000">
                {label}
              </text>
            </g>
          );
        })}

        {/* Title Block */}
        <g>
          {/* Title block outer */}
          <rect x={TB_X} y={TB_Y} width={TB_W} height={TB_H} fill="#ffffff" stroke="#000" strokeWidth="1.5" />

          {/* Company name row */}
          <line x1={TB_X} y1={TB_Y + 30} x2={TB_X + TB_W} y2={TB_Y + 30} stroke="#000" strokeWidth="0.5" />
          <text x={TB_X + TB_W / 2} y={TB_Y + 13} textAnchor="middle" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000">
            FLUXCO
          </text>
          <text x={TB_X + TB_W / 2} y={TB_Y + 24} textAnchor="middle" fontSize="7" fontFamily="Arial, sans-serif" fill="#000">
            TRANSFORMER TECHNOLOGY
          </text>

          {/* Drawing title row */}
          <line x1={TB_X} y1={TB_Y + 55} x2={TB_X + TB_W} y2={TB_Y + 55} stroke="#000" strokeWidth="0.5" />
          <text x={TB_X + TB_W / 2} y={TB_Y + 46} textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000">
            {title}
          </text>

          {/* Bottom row - split into cells */}
          {/* Drawing number */}
          <line x1={TB_X + TB_W * 0.5} y1={TB_Y + 55} x2={TB_X + TB_W * 0.5} y2={TB_Y + TB_H} stroke="#000" strokeWidth="0.5" />
          <text x={TB_X + 5} y={TB_Y + 65} fontSize="5" fontFamily="Arial, sans-serif" fill="#000">
            DWG NO.
          </text>
          <text x={TB_X + TB_W * 0.25} y={TB_Y + 80} textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000">
            {drawingNumber}
          </text>

          {/* Scale */}
          <line x1={TB_X + TB_W * 0.5} y1={TB_Y + 77} x2={TB_X + TB_W} y2={TB_Y + 77} stroke="#000" strokeWidth="0.5" />
          <text x={TB_X + TB_W * 0.52} y={TB_Y + 65} fontSize="5" fontFamily="Arial, sans-serif" fill="#000">
            SCALE
          </text>
          <text x={TB_X + TB_W * 0.63} y={TB_Y + 75} textAnchor="middle" fontSize="7" fontFamily="Arial, sans-serif" fill="#000">
            {scale}
          </text>

          {/* Sheet */}
          <line x1={TB_X + TB_W * 0.75} y1={TB_Y + 55} x2={TB_X + TB_W * 0.75} y2={TB_Y + 77} stroke="#000" strokeWidth="0.5" />
          <text x={TB_X + TB_W * 0.77} y={TB_Y + 65} fontSize="5" fontFamily="Arial, sans-serif" fill="#000">
            SHEET
          </text>
          <text x={TB_X + TB_W * 0.875} y={TB_Y + 75} textAnchor="middle" fontSize="7" fontFamily="Arial, sans-serif" fill="#000">
            {sheetOf}
          </text>

          {/* Rev */}
          <text x={TB_X + TB_W * 0.52} y={TB_Y + 87} fontSize="5" fontFamily="Arial, sans-serif" fill="#000">
            REV
          </text>
          <text x={TB_X + TB_W * 0.63} y={TB_Y + 97} textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000">
            {revision}
          </text>

          {/* Date */}
          <line x1={TB_X + TB_W * 0.75} y1={TB_Y + 77} x2={TB_X + TB_W * 0.75} y2={TB_Y + TB_H} stroke="#000" strokeWidth="0.5" />
          <text x={TB_X + TB_W * 0.77} y={TB_Y + 87} fontSize="5" fontFamily="Arial, sans-serif" fill="#000">
            DATE
          </text>
          <text x={TB_X + TB_W * 0.875} y={TB_Y + 97} textAnchor="middle" fontSize="7" fontFamily="Arial, sans-serif" fill="#000">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </text>
        </g>

        {/* Revision block */}
        <g>
          <rect x={TB_X} y={REV_Y} width={TB_W} height={REV_H} fill="#ffffff" stroke="#000" strokeWidth="1" />
          {/* Header */}
          <line x1={TB_X} y1={REV_Y + 15} x2={TB_X + TB_W} y2={REV_Y + 15} stroke="#000" strokeWidth="0.5" />
          <text x={TB_X + 20} y={REV_Y + 10} fontSize="6" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000">
            REV
          </text>
          <text x={TB_X + 80} y={REV_Y + 10} fontSize="6" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000">
            DESCRIPTION
          </text>
          <text x={TB_X + 220} y={REV_Y + 10} fontSize="6" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000">
            DATE
          </text>
          {/* Columns */}
          <line x1={TB_X + 40} y1={REV_Y} x2={TB_X + 40} y2={REV_Y + REV_H} stroke="#000" strokeWidth="0.5" />
          <line x1={TB_X + 200} y1={REV_Y} x2={TB_X + 200} y2={REV_Y + REV_H} stroke="#000" strokeWidth="0.5" />
          {/* Rev 0 entry */}
          <text x={TB_X + 20} y={REV_Y + 28} textAnchor="middle" fontSize="6" fontFamily="Arial, sans-serif" fill="#000">
            0
          </text>
          <text x={TB_X + 50} y={REV_Y + 28} fontSize="6" fontFamily="Arial, sans-serif" fill="#000">
            INITIAL RELEASE
          </text>
          <text x={TB_X + 210} y={REV_Y + 28} fontSize="6" fontFamily="Arial, sans-serif" fill="#000">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </text>
        </g>

        {/* Drawing content area */}
        {children}
      </svg>
    </div>
  );
}

export default DrawingSheet;
