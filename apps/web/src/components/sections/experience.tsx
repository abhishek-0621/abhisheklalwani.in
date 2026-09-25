import { Bezel, Eyebrow, Heading, Section, stagger } from "@/components/ui/primitives";
import { awards, experience } from "@/content/site";

export function Experience() {
  return (
    <Section id="experience" scene={3}>
      <Eyebrow index="03">Experience</Eyebrow>
      <Heading className="mt-6">
        The <em className="italic text-fg-muted">pipeline</em> so far
      </Heading>

      <ol className="relative mt-16 md:mt-20 lg:ml-[30%]">
        <div aria-hidden className="spine absolute bottom-0 left-[5px] top-2 w-px overflow-hidden">
          <div className="spine-packet" />
        </div>
        {experience.map((e, i) => (
          <li key={e.title} className="reveal relative pb-14 pl-8 last:pb-0 sm:pl-10 md:pb-16" style={stagger(i)}>
            <span
              aria-hidden
              className={`absolute left-0 top-2 size-[11px] ${e.kind === "role" ? "rotate-45 border border-accent bg-ink" : "rounded-full border border-line-strong bg-ink"}`}
            />
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint lg:absolute lg:-left-[calc(43%+2rem)] lg:top-1 lg:w-[40%] lg:text-right">
              {e.period}
            </p>
            <h3 className="mt-2 text-lg font-medium tracking-tight text-fg sm:text-xl lg:mt-0">{e.title}</h3>
            <p className="mt-1 text-fg-muted">{e.org}</p>
            <ul className="mt-4 space-y-2 text-[15px] text-fg-muted">
              {e.points.map((pt) => (
                <li key={pt} className="flex gap-3">
                  <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-fg-faint" />
                  {pt}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="mt-20 md:mt-28">
        <p className="reveal font-mono text-[11px] uppercase tracking-[0.24em] text-fg-faint">Recognition</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {awards.map((a, i) => (
            <li key={a.name + a.year} className="reveal" style={stagger(i)}>
              <Bezel coreClassName="flex h-full flex-col p-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{a.year}</span>
                <span className="mt-6 font-serif text-2xl leading-tight text-fg">{a.name}</span>
                <span className="mt-2 text-[13px] text-fg-muted">{a.note}</span>
              </Bezel>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
