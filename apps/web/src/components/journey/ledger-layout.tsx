"use client";

import { useRef } from "react";
import { lessons, wins } from "@/content/journey";
import { Photo } from "./photo";
import { pinProgress, useScrollDriver } from "./scroll-driver";

const RULER = ["2018", "2020", "2022", "2024", "2026"];

/**
 * V4: the section pins; wins travel up the left column while lessons travel down the right,
 * meeting at a year ruler. --sp is pin progress, --dv each column's overflow past the stage.
 */
export function LedgerLayout() {
  const root = useRef<HTMLDivElement>(null);

  useScrollDriver(root, (el) => {
    el.style.setProperty("--sp", pinProgress(el).toFixed(4));
    const stage = el.firstElementChild as HTMLElement;
    el.querySelectorAll<HTMLElement>("[data-col]").forEach((col) =>
      col.style.setProperty("--dv", `${Math.max(0, col.scrollHeight - stage.clientHeight)}px`),
    );
  });

  return (
    <div ref={root} className="ledger relative h-[320dvh]">
      <div className="sticky top-0 grid h-[100dvh] grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] gap-3 overflow-hidden md:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] md:gap-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] gap-3 bg-gradient-to-b from-ink from-60% to-transparent pb-10 pt-24 md:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] md:gap-6 md:pt-28">
          <h2 className="font-serif text-3xl md:text-5xl">Wins</h2>
          <span />
          <h2 className="text-right font-serif text-3xl italic text-accent md:text-5xl">Learnings</h2>
        </div>

        <div data-col className="ledger-wins grid content-start gap-4 pb-10 pt-44 md:gap-6 md:pt-52">
          {wins.map((c, i) => (
            <article key={c.year + c.title} className="rounded-[var(--radius-shell)] border border-line-strong bg-ink-raised p-2.5 pb-4">
              <Photo photo={c.image} index={i + 1} className="hidden aspect-[16/10] md:block" />
              <div className="px-2 pt-3">
                <span className="font-mono text-[11px] text-fg-faint">{c.year}</span>
                <h3 className="mt-1 font-medium leading-snug text-fg md:text-lg">{c.title}</h3>
                <p className="mt-1 hidden text-sm text-fg-muted md:block">{c.note}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="relative mb-8 mt-44 flex flex-col items-center justify-between font-mono text-[9px] text-fg-faint md:mt-52 md:text-[11px]">
          <span className="absolute inset-y-0 w-px bg-line-strong" />
          {RULER.map((y) => (
            <span key={y} className="relative bg-ink py-1">
              {y}
            </span>
          ))}
          <span className="ledger-mark absolute left-1/2 h-0.5 w-8 -translate-x-1/2 bg-accent md:w-10" />
        </div>

        {/* Newest at the top: the column slides down, so the oldest learning is what you see first. */}
        <div data-col className="ledger-lessons grid content-start gap-4 pb-10 pt-44 md:gap-6 md:pt-52">
          {[...lessons].reverse().map((l) => (
            <article key={l.year + l.title} className="rounded-[var(--radius-shell)] border border-dashed border-line-strong p-4 md:p-5">
              <span className="font-mono text-[11px] text-fg-faint">{l.year}</span>
              <h3 className="mt-1 font-serif text-xl italic leading-tight text-fg md:text-2xl">{l.title}</h3>
              <p className="mt-2 text-sm text-fg-muted">{l.note}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
