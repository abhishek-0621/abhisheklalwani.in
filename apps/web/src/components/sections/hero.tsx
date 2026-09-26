import { Orb } from "@al/ui/orb";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import { PillLink, Section, stagger } from "@/components/ui/primitives";
import { site } from "@/content/site";

export function Hero() {
  return (
    <Section scene={0} className="flex min-h-[100dvh] flex-col justify-end !pt-36 !pb-16 md:justify-center md:!pb-24">
      <p className="reveal mb-8 font-mono text-[11px] uppercase tracking-[0.24em] text-fg-faint" style={stagger(8)}>
        <span className="text-fg-muted">[</span> {site.role} <span className="mx-2">—</span> {site.location} <span className="text-fg-muted">]</span>
      </p>

      <h1 className="font-serif text-[clamp(3.75rem,13vw,10.5rem)] leading-[0.88] tracking-[-0.035em] text-fg">
        <span className="line-mask" style={stagger(0)}>
          <span>Abhishek</span>
        </span>
        <span className="line-mask" style={stagger(1)}>
          <span>
            Lalwani<span className="text-accent">.</span>
          </span>
        </span>
      </h1>

      <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[minmax(0,28rem)_1fr] md:items-end">
        <p className="reveal text-lg leading-relaxed text-fg-muted md:text-xl" style={stagger(10)}>
          I build <em className="font-serif text-[1.15em] italic text-fg">knowledge graphs</em>, agentic workflows and production RAG — the
          parts of AI that have to be right, not just fluent.
        </p>
        <div className="reveal flex flex-wrap gap-3 md:justify-end" style={stagger(11)}>
          <PillLink href="/#work">View work</PillLink>
          <PillLink href={site.links.resume} variant="ghost" download={site.links.resumeFilename} icon={<FileText size={14} weight="light" />}>
            Résumé
          </PillLink>
        </div>
      </div>

      <div className="reveal mt-16 flex items-center justify-between border-t border-line pt-5 md:mt-24" style={stagger(12)}>
        <div className="flex items-center gap-3">
          <Orb state="working" size={20} label="Currently working" />
          <span className="text-[13px] text-fg-muted">
            Now — Generative AI & MCP tooling at <span className="text-fg">Dassault Systèmes</span>
          </span>
        </div>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.24em] text-fg-faint md:block">
          Click to detonate <span className="mx-2 text-accent">·</span> Scroll
        </span>
      </div>
    </Section>
  );
}
