import { ArrowLeft, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bezel, PillLink, Section, Tag, stagger } from "@/components/ui/primitives";
import { getProject, projects } from "@/content/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: p.title, description: p.summary, type: "article" },
  };
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const { default: Body } = await import(`@/content/work/${slug}.mdx`);

  return (
    <>
      <Section scene={0} className="!pb-16 !pt-36 md:!pt-44">
        <Link href="/#work" className="reveal inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-faint transition-colors hover:text-fg">
          <ArrowLeft size={12} weight="light" /> All work
        </Link>
        <h1 className="mt-10 font-serif text-[clamp(3.75rem,12vw,9rem)] leading-[0.9] tracking-[-0.035em] text-fg">
          <span className="line-mask">
            <span>
              {p.title}
              <span className="text-accent">.</span>
            </span>
          </span>
        </h1>
        <p className="reveal mt-8 max-w-2xl text-xl text-fg md:text-2xl" style={stagger(2)}>
          {p.tagline}
        </p>

        <dl className="reveal mt-14 grid grid-cols-1 gap-6 border-t border-line pt-6 text-sm sm:grid-cols-2 lg:grid-cols-4" style={stagger(3)}>
          {[
            ["Year", p.year],
            ["Role", p.role],
            ["Status", p.status === "live" ? "Live" : "Runs locally — demo on request"],
            ["Stack", p.tags.slice(0, 4).join(" · ")],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-faint">{k}</dt>
              <dd className="mt-2 text-fg-muted">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="reveal mt-10 flex flex-wrap gap-3" style={stagger(4)}>
          {p.demo && (
            <PillLink href={p.demo} external>
              Open live app
            </PillLink>
          )}
          {p.repo && (
            <PillLink href={p.repo} variant={p.demo ? "ghost" : "solid"} external icon={<GithubLogo size={14} weight="light" />}>
              View source
            </PillLink>
          )}
        </div>
      </Section>

      <Section scene={2} className="!py-8">
        <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {p.metrics.map((m, i) => (
            <Bezel key={m.label} className="reveal" style={stagger(i)} coreClassName="p-4 sm:p-6">
              <dt className="sr-only">{m.label}</dt>
              <dd>
                <span className="block font-serif text-4xl tracking-tight text-fg sm:text-5xl">{m.value}</span>
                <span className="mt-2 block text-[13px] leading-snug text-fg-muted">{m.label}</span>
              </dd>
            </Bezel>
          ))}
        </dl>
      </Section>

      <Section scene={3} className="!pt-8">
        <article className="prose-case reveal mx-auto max-w-3xl">
          <Body />
        </article>
        <div className="mx-auto mt-24 flex max-w-3xl flex-wrap items-center justify-between gap-6 border-t border-line pt-10">
          <div className="flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
          <PillLink href="/#contact" variant="ghost">
            Talk about this
          </PillLink>
        </div>
      </Section>
    </>
  );
}
