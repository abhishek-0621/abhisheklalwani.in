/** Static SVG knowledge graph with a live retrieval path. Pure SVG + CSS, no JS. */
const nodes: [number, number, number][] = [
  [60, 70, 5], [150, 40, 3], [230, 95, 7], [120, 150, 4], [300, 50, 3], [330, 150, 5],
  [210, 200, 3], [70, 230, 3], [280, 250, 4], [380, 90, 3], [170, 270, 5], [360, 230, 3],
];
const edges: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [2, 3], [2, 4], [4, 9], [2, 5], [5, 9], [3, 6], [6, 5],
  [3, 7], [6, 8], [8, 11], [5, 11], [7, 10], [10, 6], [10, 8],
];
const path = [0, 3, 6, 5, 9];

export function GraphGlyph({ className }: { className?: string }) {
  const d = path.map((n, i) => `${i ? "L" : "M"}${nodes[n][0]} ${nodes[n][1]}`).join(" ");
  return (
    <svg viewBox="0 0 440 310" className={className} fill="none" aria-hidden>
      <g stroke="var(--color-line-strong)" strokeWidth="1">
        {edges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} strokeDasharray="1 4" />
        ))}
      </g>
      <path d={d} className="flow" stroke="var(--color-accent)" strokeWidth="1.25" />
      {nodes.map(([x, y, r], i) => {
        const hot = path.includes(i);
        return (
          <g key={i}>
            {hot && <circle cx={x} cy={y} r={r + 6} stroke="var(--color-accent)" strokeOpacity="0.35" />}
            <circle cx={x} cy={y} r={r} fill={hot ? "var(--color-accent)" : "var(--color-fg)"} fillOpacity={hot ? 1 : 0.55} />
          </g>
        );
      })}
      <circle r="3" fill="var(--color-accent)">
        <animateMotion dur="3.2s" repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
      </circle>
    </svg>
  );
}
