/** GraphMind system diagram: request path and background pipeline, with packets flowing. */
const boxes = [
  { id: "ui", x: 20, y: 130, w: 150, label: "Lit + Redux", sub: "Cytoscape canvas" },
  { id: "api", x: 245, y: 130, w: 150, label: "FastAPI", sub: "REST · SSE · MCP" },
  { id: "neo", x: 480, y: 20, w: 150, label: "Neo4j 5", sub: "graph store" },
  { id: "redis", x: 480, y: 130, w: 150, label: "Redis 7", sub: "tasks · pub/sub" },
  { id: "celery", x: 480, y: 240, w: 150, label: "Celery", sub: "ingestion workers" },
  { id: "llm", x: 705, y: 185, w: 150, label: "Claude / Ollama", sub: "extraction · answers" },
  { id: "faiss", x: 705, y: 295, w: 150, label: "FAISS", sub: "embeddings" },
] as const;

const H = 56;
const mid = (id: string, side: "l" | "r" | "t" | "b") => {
  const b = boxes.find((x) => x.id === id)!;
  if (side === "l") return [b.x, b.y + H / 2];
  if (side === "r") return [b.x + b.w, b.y + H / 2];
  if (side === "t") return [b.x + b.w / 2, b.y];
  return [b.x + b.w / 2, b.y + H];
};
const link = (a: number[], b: number[]) => {
  const cx = (a[0] + b[0]) / 2;
  return `M${a[0]} ${a[1]} C${cx} ${a[1]} ${cx} ${b[1]} ${b[0]} ${b[1]}`;
};

const links = [
  { d: link(mid("ui", "r"), mid("api", "l")), hot: true },
  { d: link(mid("api", "r"), mid("neo", "l")), hot: true },
  { d: link(mid("api", "r"), mid("redis", "l")), hot: false },
  { d: link(mid("api", "r"), mid("celery", "l")), hot: false },
  { d: link(mid("celery", "r"), mid("llm", "l")), hot: true },
  { d: link(mid("celery", "r"), mid("faiss", "l")), hot: false },
];

export function Architecture() {
  return (
    <figure className="not-prose my-10 rounded-[var(--radius-shell)] border border-line bg-white/[0.02] p-1.5">
      <div className="rounded-[var(--radius-core)] bg-ink-sunken p-4 md:p-6">
        <svg viewBox="0 0 875 370" className="hidden h-auto w-full md:block" fill="none" role="img" aria-label="GraphMind architecture diagram">
          {links.map((l, i) => (
            <g key={i}>
              <path d={l.d} stroke="rgb(255 255 255 / 0.12)" />
              <path d={l.d} className="flow" stroke={l.hot ? "var(--color-accent)" : "rgb(255 255 255 / 0.4)"} />
              {l.hot && (
                <circle r="2.5" fill="var(--color-accent)">
                  <animateMotion dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" path={l.d} />
                </circle>
              )}
            </g>
          ))}
          {boxes.map((b) => (
            <g key={b.id}>
              <rect x={b.x} y={b.y} width={b.w} height={H} rx="12" fill="#111" stroke="rgb(255 255 255 / 0.12)" />
              <text x={b.x + 16} y={b.y + 24} fill="var(--color-fg)" fontSize="14" fontFamily="var(--font-sans)">
                {b.label}
              </text>
              <text x={b.x + 16} y={b.y + 42} fill="var(--color-fg-faint)" fontSize="11" fontFamily="var(--font-mono)">
                {b.sub}
              </text>
            </g>
          ))}
        </svg>
        <MobileFlow />
      </div>
      <figcaption className="px-4 pb-2 pt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint">
        Request path in accent · background ingestion in grey
      </figcaption>
    </figure>
  );
}

/** Phone layout: the same system as a vertical flow, one tier per row. */
const tiers: { id: string; hot: boolean }[][] = [
  [{ id: "ui", hot: true }],
  [{ id: "api", hot: true }],
  [{ id: "neo", hot: true }, { id: "redis", hot: false }, { id: "celery", hot: false }],
  [{ id: "llm", hot: true }, { id: "faiss", hot: false }],
];

function MobileFlow() {
  return (
    <ol className="flex flex-col items-stretch md:hidden" aria-label="GraphMind architecture">
      {tiers.map((row, r) => (
        <li key={r} className="flex flex-col items-center">
          {r > 0 && (
            <svg width="2" height="28" aria-hidden className="overflow-visible">
              <line x1="1" y1="0" x2="1" y2="28" className="flow" stroke="var(--color-accent)" />
            </svg>
          )}
          <div className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
            {row.map(({ id, hot }) => {
              const b = boxes.find((x) => x.id === id)!;
              return (
                <div key={id} className={`rounded-xl border bg-ink-raised px-3 py-2.5 ${hot ? "border-accent/40" : "border-line"}`}>
                  <p className="truncate text-[13px] text-fg">{b.label}</p>
                  <p className="truncate font-mono text-[10px] text-fg-faint">{b.sub}</p>
                </div>
              );
            })}
          </div>
        </li>
      ))}
    </ol>
  );
}
