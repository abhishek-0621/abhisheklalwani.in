"use client";

import { useRef } from "react";
import { chapters } from "@/content/journey";
import { KindTag } from "./kind-tag";
import { Photo } from "./photo";
import { clamp, useScrollDriver } from "./scroll-driver";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * V2: a year that rolls like an odometer to the chapter being read, beside a deck of chapter
 * cards. Each card pins; as the next slides over it, it shrinks and dims (--past, 0 to 1).
 */
export function StackLayout() {
  const root = useRef<HTMLDivElement>(null);

  useScrollDriver(root, (el) => {
    const vh = window.innerHeight;
    const wraps = el.querySelectorAll<HTMLElement>("[data-chapter]");
    let current = wraps[0];
    wraps.forEach((w) => {
      const top = w.getBoundingClientRect().top;
      const card = w.firstElementChild as HTMLElement;
      const stuckAt = parseFloat(getComputedStyle(card).top) || 0;
      card.style.setProperty("--past", clamp((stuckAt - top) / vh, 0, 1).toFixed(3));
      if (top < vh * 0.45) current = w;
    });
    const year = current.dataset.year ?? "";
    el.querySelectorAll<HTMLElement>("[data-digit]").forEach((d, i) => d.style.setProperty("--n", year[i] ?? "0"));
    const kind = el.querySelector<HTMLElement>("[data-kind-label]");
    if (kind && kind.textContent !== current.dataset.kind) kind.textContent = current.dataset.kind ?? "";
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--sp", clamp(-rect.top / Math.max(1, rect.height - vh), 0, 1).toFixed(4));
  });

  const first = chapters[0];
  return (
    <div ref={root} className="journey-stack grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
      <aside className="sticky top-16 z-10 flex items-center justify-between gap-4 bg-ink/85 py-3 backdrop-blur lg:top-0 lg:h-[100dvh] lg:flex-col lg:items-start lg:justify-center lg:bg-transparent lg:backdrop-blur-none">
        <div className="odometer font-serif text-[3.5rem] tracking-[-0.03em] lg:text-[clamp(6rem,11vw,10rem)]" aria-live="polite" aria-label="Year">
          {first.year.split("").map((_, i) => (
            <span key={i} data-digit className="odometer-digit" style={{ "--n": first.year[i] } as React.CSSProperties}>
              {DIGITS.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          ))}
        </div>
        <div className="flex flex-col items-end gap-3 lg:items-start">
          <p data-kind-label className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted">
            {first.kind}
          </p>
          <div className="hidden h-0.5 w-56 bg-line-strong lg:block">
            <div className="stack-progress h-full bg-accent" />
          </div>
        </div>
      </aside>

      <div>
        {chapters.map((c, i) => (
          <div key={c.year + c.title} data-chapter data-year={c.year} data-kind={c.kind} className="h-[72dvh] first:mt-6 last:h-[100dvh] lg:first:mt-[22dvh]">
            <article
              className="stack-card sticky rounded-[var(--radius-shell)] border border-line-strong bg-ink-raised p-2.5 pb-5"
              style={{ "--i": i } as React.CSSProperties}
            >
              <Photo photo={c.image} quote={c.image ? undefined : c.quote} index={i} className="aspect-[16/9]" />
              <div className="px-2 pt-4">
                <div className="flex items-center gap-3">
                  <KindTag kind={c.kind} />
                  <span className="font-mono text-[11px] text-fg-faint">{c.year}</span>
                </div>
                <h2 className="mt-3 text-xl font-medium leading-snug text-fg md:text-2xl">{c.title}</h2>
                <p className="mt-1.5 text-fg-muted">{c.note}</p>
                {c.quote && c.image && <p className="mt-3 border-l-2 border-accent pl-3 font-serif text-lg italic leading-snug text-fg">{c.quote}</p>}
                {c.detail && <p className="mt-3 text-sm text-fg-faint">{c.detail}</p>}
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
