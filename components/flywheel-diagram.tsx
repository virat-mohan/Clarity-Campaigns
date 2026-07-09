const SIZE = 580;
const CENTER = SIZE / 2;

const CENTER_R = 98; // dark centre disc
const TICK_IN = 118;
const TICK_OUT = 132;
const CREAM_R = 140; // cream inner ring outer edge
const INNER_R = 146; // coloured band inner edge
const OUTER_R = 210; // coloured band outer edge
const MID_R = (INNER_R + OUTER_R) / 2;
const RING_R = 252; // thin outer ring

const GAP_DEG = 14;
const ARC_DEG = 360 / 3 - GAP_DEG; // 106
const TIP_DEG = 7; // arrow tip overshoot

function polar(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

const f = (p: { x: number; y: number }) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;

/** Band from a0 to a1 (clockwise) with a pointed leading tip at a1. */
function arrowBandPath(a0: number, a1: number) {
  const o0 = polar(OUTER_R, a0);
  const o1 = polar(OUTER_R, a1);
  const tip = polar(MID_R, a1 + TIP_DEG);
  const i1 = polar(INNER_R, a1);
  const i0 = polar(INNER_R, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return [
    `M ${f(o0)}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${f(o1)}`,
    `L ${f(tip)}`,
    `L ${f(i1)}`,
    `A ${INNER_R} ${INNER_R} 0 ${large} 0 ${f(i0)}`,
    "Z",
  ].join(" ");
}

/** Arc for the label. Reversed on the bottom half so text stays upright. */
function labelPath(a0: number, a1: number, flip: boolean) {
  const [s, e] = flip ? [a1, a0] : [a0, a1];
  const sweep = flip ? 0 : 1;
  return `M ${f(polar(MID_R, s))} A ${MID_R} ${MID_R} 0 0 ${sweep} ${f(polar(MID_R, e))}`;
}

const STAGES = [
  { key: "acquisition", label: "ACQUISITION", start: 240, fill: "#aeb98d", stroke: "#7f8f5f" },
  { key: "conversion", label: "CONVERSION", start: 0, fill: "#d3a3a3", stroke: "#b57e7e" },
  { key: "retention", label: "RETENTION", start: 120, fill: "#9aa7b6", stroke: "#75849a" },
];

export function FlywheelDiagram() {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="Brand Intelligence flywheel: Acquisition, Conversion, Retention"
    >
      <defs>
        <style>{`
          @keyframes fw-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          .fw-orbit {
            transform-origin: ${CENTER}px ${CENTER}px;
            animation: fw-spin 40s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .fw-orbit { animation: none; }
          }
        `}</style>

        {STAGES.map((s) => {
          const end = s.start + ARC_DEG;
          const mid = ((s.start + end) / 2) % 360;
          const flip = mid > 90 && mid < 270;
          return (
            <path
              key={`lp-${s.key}`}
              id={`fw-label-${s.key}`}
              d={labelPath(s.start + 8, end - 8, flip)}
              fill="none"
            />
          );
        })}
      </defs>

      {/* thin outer ring + orbiting dots */}
      <circle cx={CENTER} cy={CENTER} r={RING_R} fill="none" stroke="#c9c2b2" strokeWidth={1} />
      <g className="fw-orbit">
        {Array.from({ length: 8 }).map((_, i) => {
          const p = polar(RING_R, i * 45 + 10);
          return <circle key={i} cx={p.x} cy={p.y} r={3.2} fill="#d1a02e" />;
        })}
      </g>

      {/* cream inner ring with ticks + dots */}
      <circle cx={CENTER} cy={CENTER} r={CREAM_R} fill="#faf6ea" stroke="#e6dcc2" strokeWidth={1} />
      {Array.from({ length: 48 }).map((_, i) => {
        const a = i * 7.5;
        const p1 = polar(TICK_IN, a);
        const p2 = polar(TICK_OUT, a);
        return <line key={`t-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#e0d3ad" strokeWidth={1} />;
      })}
      {Array.from({ length: 16 }).map((_, i) => {
        const p = polar(i % 2 === 0 ? 110 : 128, i * 22.5 + 11);
        return (
          <circle key={`d-${i}`} cx={p.x} cy={p.y} r={2.2} opacity={0.75} fill={i % 2 === 0 ? "#d1a02e" : "#d3a3a3"} />
        );
      })}

      {/* coloured arrow bands */}
      {STAGES.map((s) => (
        <path
          key={s.key}
          d={arrowBandPath(s.start, s.start + ARC_DEG)}
          fill={s.fill}
          stroke={s.stroke}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      ))}

      {/* labels riding on the bands */}
      {STAGES.map((s) => (
        <text
          key={`lbl-${s.key}`}
          fontFamily="var(--font-mono)"
          fontSize={19}
          fontWeight={700}
          letterSpacing={4}
          fill="#ffffff"
        >
          <textPath href={`#fw-label-${s.key}`} startOffset="50%" textAnchor="middle" dominantBaseline="middle">
            {s.label}
          </textPath>
        </text>
      ))}

      {/* centre disc */}
      <circle cx={CENTER} cy={CENTER} r={CENTER_R} fill="#14110d" />
      <text x={CENTER} y={CENTER - 38} textAnchor="middle" fontSize={20} fill="#d1a02e">
        ✦
      </text>
      <text
        x={CENTER}
        y={CENTER - 4}
        textAnchor="middle"
        fontFamily="var(--font-heading)"
        fontSize={19}
        fontWeight={700}
        letterSpacing={1}
        fill="#f4f1e8"
      >
        BRAND
      </text>
      <text
        x={CENTER}
        y={CENTER + 22}
        textAnchor="middle"
        fontFamily="var(--font-heading)"
        fontSize={19}
        fontWeight={700}
        letterSpacing={1}
        fill="#f4f1e8"
      >
        INTELLIGENCE
      </text>
      <text
        x={CENTER}
        y={CENTER + 50}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={10}
        letterSpacing={2}
        fill="#8a8272"
      >
        EVERY TURN, SMARTER
      </text>
    </svg>
  );
}