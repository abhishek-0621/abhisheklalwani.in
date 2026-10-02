import { cn } from "@al/ui/cn";
import type { Metadata } from "next";
import Link from "next/link";
import { LedgerLayout } from "@/components/journey/ledger-layout";
import { StackLayout } from "@/components/journey/stack-layout";
import { Heading, Section, stagger } from "@/components/ui/primitives";

// Draft: not in the nav or sitemap, and kept out of search until the content is final.
export const metadata: Metadata = {
  title: "Journey",
  description: "From a classroom in Pune to shipping GraphMind: wins, trips, and what each one taught me.",
  robots: { index: false, follow: false },
};

const layouts = [
  { id: "stack", label: "Stacked cards (V2)" },
  { id: "ledger", label: "Wins and lessons (V4)" },
] as const;

export default async function JourneyPage({ searchParams }: { searchParams: Promise<{ layout?: string }> }) {
  const { layout } = await searchParams;
  const current = layout === "ledger" ? "ledger" : "stack";

  return (
    <Section scene={3} className="!pt-36 md:!pt-44">
      <div className="max-w-3xl">
        <Heading as="h1">
          From a classroom in Pune to shipping <em className="italic text-accent">GraphMind</em>.
        </Heading>
        <p className="reveal mt-6 max-w-xl text-lg text-fg-muted" style={stagger(2)}>
          Wins, trips, and what each one taught me.
        </p>
        {/* Draft-only switch for comparing the two layouts; remove once one is chosen. */}
        <div className="reveal mt-8 flex flex-wrap gap-2" style={stagger(3)}>
          {layouts.map((l) => (
            <Link
              key={l.id}
              href={`/journey?layout=${l.id}`}
              scroll={false}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                current === l.id ? "border-accent bg-accent-soft text-fg" : "border-line-strong text-fg-muted hover:border-fg-muted",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16 md:mt-24">{current === "ledger" ? <LedgerLayout /> : <StackLayout />}</div>
    </Section>
  );
}
