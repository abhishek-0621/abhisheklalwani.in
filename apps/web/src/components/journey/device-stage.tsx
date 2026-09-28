"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Client } from "@/content/freelance";
import { PillLink } from "@/components/ui/primitives";
import { Photo } from "./photo";
import { pinProgress, useScrollDriver } from "./scroll-driver";

/**
 * F1: one pinned section per client. The browser frame straightens from a tilt, the full-page
 * screenshot scrolls inside it, and design / build / maintenance light up in turn (--lp, 0 to 1).
 */
export function DeviceStage({ client, index }: { client: Client; index: number }) {
  const root = useRef<HTMLElement>(null);
  useScrollDriver(root, (el) => {
    el.style.setProperty("--lp", pinProgress(el).toFixed(4));
    const screen = el.querySelector<HTMLElement>(".device-screen");
    const shot = el.querySelector<HTMLElement>(".device-shot");
    if (screen && shot) el.style.setProperty("--travel", `${Math.max(0, shot.offsetHeight - screen.clientHeight)}px`);
  });

  return (
    <section ref={root} className="device-stage relative h-[240dvh]">
      <div className="sticky top-0 grid h-[100dvh] content-center gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-14">
        <div className="device-frame overflow-hidden rounded-2xl border border-line-strong bg-ink-raised">
          <div className="flex gap-1.5 border-b border-line px-3 py-2.5">
            {[0, 1, 2].map((i) => (
              <i key={i} className="size-2 rounded-full bg-line-strong" />
            ))}
          </div>
          <div className="device-screen relative h-[34dvh] overflow-hidden lg:h-[56dvh]">
            {client.screenshot?.src ? (
              <div className="device-shot relative w-full">
                <Image src={client.screenshot.src} alt={client.screenshot.alt ?? `${client.name} website`} width={1440} height={4000} sizes="(min-width: 1024px) 55vw, 95vw" className="h-auto w-full" />
              </div>
            ) : (
              <Photo index={index ? 6 : 0} label="Full-page screenshot" className="device-shot h-[300%] !rounded-none" />
            )}
          </div>
        </div>

        <div className="grid gap-4">
          <h2 className="font-serif text-4xl leading-none tracking-[-0.02em] text-fg md:text-6xl">{client.name}</h2>
          <p className="max-w-md text-fg-muted">{client.about}</p>
          <ol className="mt-2 grid gap-3">
            {client.work.map((w, i) => (
              <li key={w.label} className="device-step border-l-2 border-line-strong pl-4" style={{ "--i": i } as React.CSSProperties}>
                <span className="block font-medium text-fg">{w.label}</span>
                <span className="text-sm text-fg-muted">{w.note}</span>
              </li>
            ))}
          </ol>
          {client.url && (
            <div className="mt-3">
              <PillLink href={client.url} external>
                Visit site
              </PillLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
