import { FileText, GithubLogo, LinkedinLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { CopyEmail } from "@/components/ui/copy-email";
import { Eyebrow, PillLink, Section, stagger } from "@/components/ui/primitives";
import { site } from "@/content/site";

export function Contact() {
  return (
    <Section id="contact" scene={4} className="flex min-h-[100dvh] flex-col items-center justify-center text-center">
      <Eyebrow index="04">Contact</Eyebrow>
      <h2 className="reveal mt-8 font-serif text-[clamp(3.5rem,11vw,9rem)] leading-[0.9] tracking-[-0.035em] text-fg" style={stagger(1)}>
        Let&rsquo;s <em className="italic text-accent">talk</em>.
      </h2>
      <p className="reveal mt-8 max-w-md text-fg-muted" style={stagger(2)}>
        Open to AI engineering roles, and always up for a conversation about retrieval, agents or knowledge graphs.
      </p>
      <div className="reveal mt-10" style={stagger(3)}>
        <CopyEmail email={site.email} />
      </div>
      <ul className="reveal mt-6 flex max-w-xl flex-wrap justify-center gap-2 sm:gap-3" style={stagger(4)} aria-label="Contact links">
        <li>
          <PillLink href={site.links.whatsapp} variant="ghost" external icon={<WhatsappLogo size={14} weight="light" />}>
            WhatsApp
          </PillLink>
        </li>
        <li>
          <PillLink href={site.links.linkedin} variant="ghost" external icon={<LinkedinLogo size={14} weight="light" />}>
            LinkedIn
          </PillLink>
        </li>
        <li>
          <PillLink href={site.links.github} variant="ghost" external icon={<GithubLogo size={14} weight="light" />}>
            GitHub
          </PillLink>
        </li>
        <li>
          <PillLink href={site.links.resume} variant="ghost" download icon={<FileText size={14} weight="light" />}>
            Résumé
          </PillLink>
        </li>
      </ul>
    </Section>
  );
}
