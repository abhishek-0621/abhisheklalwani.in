import Image from "next/image";
import type { Client } from "@/content/freelance";
import { PillLink, stagger } from "@/components/ui/primitives";
import { Photo } from "./photo";

/**
 * F1: one section per client. The page scrolls normally; the browser frame is its own scroll
 * area (with a visible scrollbar) so visitors can look through the whole site if they want.
 * Scroll chaining is left on, so reaching the end of the preview carries on down the page.
 */
export function DeviceStage({ client, index }: { client: Client; index: number }) {
  return (
    <section className="grid gap-8 py-16 md:py-24 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-14">
      <div className="device-frame reveal overflow-hidden rounded-2xl border border-line-strong bg-ink-raised" style={stagger(0)}>
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2.5">
          {[0, 1, 2].map((i) => (
            <i key={i} className="size-2 rounded-full bg-line-strong" />
          ))}
          {client.url && <span className="ml-3 truncate font-mono text-[11px] text-fg-faint">{client.url.replace(/^https?:\/\/(www\.)?|\/$/g, "")}</span>}
        </div>
        <div className="device-screen h-[52dvh] overflow-y-auto overflow-x-hidden lg:h-[60dvh]" tabIndex={0} aria-label={`${client.name} website preview, scrollable`}>
          {client.screenshot?.src ? (
            <Image
              src={client.screenshot.src}
              alt={client.screenshot.alt ?? `${client.name} website`}
              width={client.screenshot.width}
              height={client.screenshot.height}
              sizes="(min-width: 1024px) 55vw, 95vw"
              className="h-auto w-full"
            />
          ) : (
            <Photo index={index ? 6 : 0} label="Full-page screenshot" className="h-[200%] !rounded-none" />
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <h2 className="reveal font-serif text-4xl leading-none tracking-[-0.02em] text-fg md:text-6xl" style={stagger(1)}>
          {client.name}
        </h2>
        <p className="reveal max-w-md text-fg-muted" style={stagger(2)}>
          {client.about}
        </p>
        <ol className="mt-2 grid gap-3">
          {client.work.map((w, i) => (
            <li key={w.label} className="reveal border-l-2 border-accent/60 pl-4" style={stagger(3 + i)}>
              <span className="block font-medium text-fg">{w.label}</span>
              <span className="text-sm text-fg-muted">{w.note}</span>
            </li>
          ))}
        </ol>
        {client.url && (
          <div className="reveal mt-3" style={stagger(6)}>
            <PillLink href={client.url} external>
              Visit site
            </PillLink>
          </div>
        )}
      </div>
    </section>
  );
}
