import type { Metadata } from "next";
import { StackLayout } from "@/components/journey/stack-layout";
import { Heading, Section, stagger } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Journey",
  alternates: { canonical: "/journey" },
  description: "From a classroom in Pune to shipping GraphMind: wins, trips, and what each one taught me.",
};

export default function JourneyPage() {
  return (
    <Section scene={3} className="!pt-36 md:!pt-44">
      <div className="max-w-3xl">
        <Heading as="h1">
          From a classroom in Pune to shipping <em className="italic text-accent">GraphMind</em>.
        </Heading>
        <p className="reveal mt-6 max-w-xl text-lg text-fg-muted" style={stagger(2)}>
          Wins, trips, and what each one taught me.
        </p>
      </div>
      <div className="mt-16 md:mt-24">
        <StackLayout />
      </div>
    </Section>
  );
}
