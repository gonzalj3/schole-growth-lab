// Hand-rolled SVG charts for the lab. No dependency — every pixel maps to a
// number, which is the interpretability bar (CLAUDE.md §0, §13). Responsive via
// viewBox; the container controls width.

// Distinct, roughly on-brand colors for up to 6 arms.
export const ARM_COLORS = [
  '#4338ca', // brand indigo
  '#c0842b', // accent amber
  '#2e7d57', // positive green
  '#0e7490', // cyan
  '#b4442f', // rust
  '#7c3aed', // violet
];

const W = 720;
const H = 240;
const PAD = { top: 12, right: 12, bottom: 24, left: 40 };

/**
 * Stacked-area chart of traffic share per round. `shares[round][arm]` are
 * fractions that sum to ~1 across arms. Shows the winner's band widening as the
 * bandit shifts traffic toward it.
 */
export function StackedAreaChart({
  shares,
  colors,
}: {
  shares: number[][];
  colors: string[];
}) {
  const rounds = shares.length;
  const k = shares[0]?.length ?? 0;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (rounds <= 1 ? 0 : (i / (rounds - 1)) * plotW);
  const y = (v: number) => PAD.top + (1 - v) * plotH;

  // cumulative lower bound per round, mutated as we stack arms
  const cum = new Array(rounds).fill(0);
  const bands: { fill: string; d: string }[] = [];
  for (let a = 0; a < k; a++) {
    const top: string[] = [];
    const bottom: string[] = [];
    for (let i = 0; i < rounds; i++) {
      const lower = cum[i];
      const upper = lower + shares[i][a];
      top.push(`${x(i)},${y(upper)}`);
      bottom.push(`${x(i)},${y(lower)}`);
      cum[i] = upper;
    }
    const d = `M${top.join(' L')} L${bottom.reverse().join(' L')} Z`;
    bands.push({ fill: colors[a % colors.length], d });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block">
      {/* y gridlines at 0/25/50/75/100% */}
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(g)} y2={y(g)} stroke="#e9e3d8" strokeWidth={1} />
          <text x={PAD.left - 6} y={y(g) + 3} textAnchor="end" fontSize={10} fill="#6b7183">
            {g * 100}%
          </text>
        </g>
      ))}
      {bands.map((b, i) => (
        <path key={i} d={b.d} fill={b.fill} fillOpacity={0.85} />
      ))}
      <text x={PAD.left} y={H - 6} fontSize={10} fill="#6b7183">
        round 1
      </text>
      <text x={W - PAD.right} y={H - 6} textAnchor="end" fontSize={10} fill="#6b7183">
        round {rounds}
      </text>
    </svg>
  );
}

/**
 * Multi-line chart (used for cumulative regret). Each line is a series of
 * y-values indexed by round; all share the same x-axis and y-scale.
 */
export function LineChart({
  lines,
  yLabel,
}: {
  lines: { label: string; color: string; points: number[] }[];
  yLabel?: string;
}) {
  const n = Math.max(...lines.map((l) => l.points.length), 1);
  const yMax = Math.max(1, ...lines.flatMap((l) => l.points));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const y = (v: number) => PAD.top + (1 - v / yMax) * plotH;
  const fmt = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block">
      {[0, 0.5, 1].map((g) => (
        <g key={g}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(g * yMax)} y2={y(g * yMax)} stroke="#e9e3d8" strokeWidth={1} />
          <text x={PAD.left - 6} y={y(g * yMax) + 3} textAnchor="end" fontSize={10} fill="#6b7183">
            {fmt(g * yMax)}
          </text>
        </g>
      ))}
      {lines.map((l, li) => (
        <polyline
          key={li}
          points={l.points.map((p, i) => `${x(i)},${y(p)}`).join(' ')}
          fill="none"
          stroke={l.color}
          strokeWidth={2}
        />
      ))}
      {yLabel && (
        <text x={PAD.left} y={PAD.top - 2} fontSize={10} fill="#6b7183">
          {yLabel}
        </text>
      )}
    </svg>
  );
}
