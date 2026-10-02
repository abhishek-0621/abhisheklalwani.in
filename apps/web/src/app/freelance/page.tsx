import type { Metadata } from "next";
import { DeviceStage } from "@/components/journey/device-stage";
import { Heading, Section, stagger } from "@/components/ui/primitives";
import { clients } from "@/content/freelance";

export const metadata: Metadata = {
  title: "Freelance",
  alternates: { canonical: "/freelance" },
  description: "Websites for independent businesses: designed and built.",
};

export default function FreelancePage() {
  return (
    <Section scene={2} className="!pt-36 md:!pt-44">
      <Heading as="h1">
        Websites for <em className="italic text-accent">independent</em> businesses.
      </Heading>
      <p className="reveal mt-6 max-w-xl text-lg text-fg-muted" style={stagger(2)}>
        Designed and built from scratch.
      </p>
      <div className="mt-10">
        {clients.map((c, i) => (
          <DeviceStage key={c.name} client={c} index={i} />
        ))}
      </div>
    </Section>
  );
}
