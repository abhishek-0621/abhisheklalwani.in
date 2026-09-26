import { Eyebrow, Section, stagger } from "@/components/ui/primitives";
import { about } from "@/content/site";

export function About() {
  return (
    <Section id="about" scene={1} className="min-h-[100dvh]">
      <div className="lg:ml-auto lg:w-[56%]">
        <Eyebrow index="01">About</Eyebrow>
        <p className="reveal mt-8 font-serif text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.12] tracking-[-0.02em] text-fg" style={stagger(1)}>
          {about.lead}
        </p>
        <div className="mt-10 space-y-5 text-fg-muted">
          {about.body.map((p, i) => (
            <p key={i} className="reveal" style={stagger(2 + i)}>
              {p}
            </p>
          ))}
        </div>

        <ul className="mt-16 grid grid-cols-1 border-t border-line sm:grid-cols-2">
          {about.principles.map((p, i) => (
            <li key={p.word} className={`reveal border-b border-line py-6 ${i % 2 === 0 ? "sm:border-r sm:pr-6" : "sm:pl-6"}`} style={stagger(i)}>
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-3xl tracking-tight text-fg sm:text-4xl">{p.word}</span>
              </span>
              <span className="mt-2 block pl-7 text-[14px] leading-snug text-fg-muted">{p.line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-24 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]" aria-label="Tools I use">
        <ul className="marquee flex w-max gap-3">
          {[...about.stack, ...about.stack].map((t, i) => (
            <li key={i} aria-hidden={i >= about.stack.length || undefined} className="whitespace-nowrap rounded-full border border-line-strong bg-ink px-4 py-2 font-mono text-[12.5px] text-fg-muted">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
