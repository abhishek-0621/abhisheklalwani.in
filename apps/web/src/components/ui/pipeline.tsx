/** A left-to-right (stacked on phones) flow of stages, joined by animated dashed connectors. */
export function Pipeline({ steps }: { steps: { label: string; detail: string; model?: boolean }[] }) {
  return (
    <figure className="not-prose my-10 rounded-[var(--radius-shell)] border border-line bg-fg/[0.02] p-1.5">
      <ol className="grid gap-px overflow-hidden rounded-[var(--radius-core)] bg-line sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.label} className="relative bg-ink-sunken p-5">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-faint">
              <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
              <svg width="40" height="2" aria-hidden className="overflow-visible">
                <line x1="0" y1="1" x2="40" y2="1" className="flow" stroke={s.model ? "var(--color-accent)" : "var(--color-fg-faint)"} />
              </svg>
              {s.model ? "local model" : "code"}
            </div>
            <p className="mt-3 text-[15px] font-medium text-fg">{s.label}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{s.detail}</p>
          </li>
        ))}
      </ol>
      <figcaption className="px-4 pb-2 pt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint">
        Accent stages call the local model · grey stages are plain code
      </figcaption>
    </figure>
  );
}
