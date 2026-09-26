import { Orb } from "@al/ui/orb";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { PillLink, Section, stagger } from "@/components/ui/primitives";
import { site } from "@/content/site";

// Shown at abhisheklalwani.in/graphmind whenever the Mac that runs GraphMind is unreachable
// (see src/proxy.ts). The URL stays /graphmind, so a reload tries the live app again.
export const metadata: Metadata = {
  title: "GraphMind is offline",
  description: "GraphMind runs on my own machine, which is offline right now.",
  robots: { index: false, follow: false },
};

export default function GraphMindOffline() {
  return (
    <Section scene={5} className="flex min-h-[100dvh] flex-col items-center justify-center text-center">
      <div className="reveal flex items-center gap-3 rounded-full border border-line bg-ink/60 py-1.5 pl-2 pr-4" style={stagger(0)}>
        <Orb state="listening" size={20} label="Offline" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted">
          GraphMind <span className="mx-1.5 text-fg-faint">·</span> no active connection
        </span>
      </div>

      <h1 className="reveal mt-10 font-serif text-[clamp(3rem,9vw,6.5rem)] leading-[0.95] tracking-[-0.03em] text-fg" style={stagger(1)}>
        GraphMind is <em className="italic text-accent">resting</em>.
      </h1>

      <p className="reveal mt-8 max-w-lg text-lg text-fg-muted" style={stagger(2)}>
        GraphMind runs on my own machine rather than in the cloud, and that machine is offline right now. If you would like to try it,
        send me a message and I will bring it online for you.
      </p>

      <div className="reveal mt-10 flex flex-wrap justify-center gap-3" style={stagger(3)}>
        <PillLink href={site.links.whatsappGraphMind} external icon={<WhatsappLogo size={14} weight="light" />}>
          Ask me on WhatsApp
        </PillLink>
        <PillLink href="/work/graphmind" variant="ghost">
          Read the case study
        </PillLink>
      </div>

      <p className="reveal mt-12 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-faint" style={stagger(4)}>
        Already online? Reload this page.
      </p>
    </Section>
  );
}
