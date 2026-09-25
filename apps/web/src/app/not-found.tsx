import { Orb } from "@al/ui/orb";
import { PillLink, Section } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Section scene={1} className="flex min-h-[100dvh] flex-col items-center justify-center text-center">
      <Orb state="shaping" label="Not found" />
      <h1 className="mt-10 font-serif text-7xl tracking-tight text-fg">
        No such <em className="italic text-accent">node</em>.
      </h1>
      <p className="mt-4 text-fg-muted">This page is not in the graph.</p>
      <div className="mt-10">
        <PillLink href="/">Back home</PillLink>
      </div>
    </Section>
  );
}
