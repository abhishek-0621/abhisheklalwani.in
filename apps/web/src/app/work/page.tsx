import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow, Heading, Section, stagger } from "@/components/ui/primitives";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies: knowledge graphs, retrieval and agentic AI systems.",
  alternates: { canonical: "/work" },
};

export default function WorkIndex() {
  return (
    <Section scene={2} className="min-h-[100dvh] !pt-36 md:!pt-44">
      <Eyebrow>Index</Eyebrow>
      <Heading as="h1" className="mt-6">
        All <em className="italic text-fg-muted">work</em>
      </Heading>
      <ul className="mt-16 border-t border-line">
        {projects.map((p, i) => (
          <li key={p.slug} className="reveal" style={stagger(i)}>
            <Link
              href={`/work/${p.slug}`}
              className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-3 border-b border-line py-7 sm:grid-cols-[3rem_1fr_auto] sm:gap-4 md:py-8 transition-colors duration-500 hover:bg-white/[0.02] md:grid-cols-[4rem_1fr_1fr_auto] md:px-4"
            >
              <span className="font-mono text-[11px] text-fg-faint">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-serif text-4xl tracking-tight text-fg transition-transform duration-500 ease-[var(--ease-spring)] group-hover:translate-x-2 md:text-5xl">
                {p.title}
              </span>
              <span className="hidden text-fg-muted md:block">{p.tagline}</span>
              <span className="font-mono text-[11px] text-fg-faint">{p.year}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
