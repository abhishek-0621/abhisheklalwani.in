import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { SignalGlyph } from "@/components/signal/signal-glyph";
import { GraphGlyph } from "@/components/ui/graph-glyph";
import { Bezel, Eyebrow, Heading, PillLink, Section, Tag, stagger } from "@/components/ui/primitives";
import { projects, type Project } from "@/content/projects";

/** Per-project illustration shown on the featured card. */
const visuals: Record<string, ReactNode> = {
  graphmind: <GraphGlyph className="h-auto w-full" />,
  "stray-signals": (
    <div className="flex aspect-[44/31] items-center justify-center">
      <SignalGlyph size={180} className="h-auto w-2/5 max-w-[180px]" />
    </div>
  ),
};

const statusLabel: Record<Project["status"], string> = {
  live: "Live on this site",
  local: "Demo on request",
  archived: "Archived",
};

function FeaturedCard({ p }: { p: Project }) {
  return (
    <Bezel className="reveal" style={stagger(2)}>
      <article className="grid gap-10 p-5 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:p-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint">
            <span>{p.year}</span>
            <span className="h-px w-6 bg-line-strong" />
            <span className="flex items-center gap-2">
              <span className={`size-1.5 rounded-full ${p.status === "live" ? "bg-accent" : "bg-fg-faint"}`} />
              {statusLabel[p.status]}
            </span>
          </div>
          <h3 className="mt-6 font-serif text-[clamp(2.75rem,9vw,3.75rem)] leading-none tracking-tight text-fg">{p.title}</h3>
          <p className="mt-4 text-lg text-fg">{p.tagline}</p>
          <p className="mt-4 text-fg-muted">{p.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap gap-3 pt-10">
            <PillLink href={`/work/${p.slug}`}>Read case study</PillLink>
            {p.repo && (
              <PillLink href={p.repo} variant="ghost" external icon={<GithubLogo size={14} weight="light" />}>
                Source
              </PillLink>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 sm:gap-8">
          <div className="rounded-[var(--radius-core)] border border-line bg-ink-sunken/80 p-4">
            {visuals[p.slug]}
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-core)] border border-line bg-line">
            {p.metrics.map((m) => (
              <div key={m.label} className="bg-ink-raised p-4 sm:p-5">
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="block font-serif text-3xl tracking-tight text-fg sm:text-4xl">{m.value}</span>
                  <span className="mt-1 block text-[12px] leading-snug text-fg-muted">{m.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    </Bezel>
  );
}

export function Work() {
  const featured = projects.filter((p) => p.featured);
  return (
    <Section id="work" scene={2}>
      <Eyebrow index="02">Work</Eyebrow>
      <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <Heading>
          Selected <em className="italic text-fg-muted">work</em>
        </Heading>
        <p className="reveal max-w-sm text-fg-muted" style={stagger(2)}>
          Systems I have designed end to end. Each one has a write-up covering architecture, trade-offs and measured results.
        </p>
      </div>

      <div className="mt-16 space-y-6">
        {featured.map((p) => (
          <FeaturedCard key={p.slug} p={p} />
        ))}
        <div className="reveal flex items-center justify-between gap-4 rounded-[var(--radius-shell)] border border-dashed border-line-strong px-5 py-7 sm:px-8 lg:px-10" style={stagger(3)}>
          <span className="font-serif text-xl italic text-fg-muted sm:text-2xl">More projects in the lab.</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint">Soon</span>
        </div>
      </div>
    </Section>
  );
}
