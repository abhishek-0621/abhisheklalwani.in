"use client";

import { cn } from "@al/ui/cn";
import { Orb } from "@al/ui/orb";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SignalGlyph } from "./signal-glyph";

type Payload = {
  id: string;
  url: string;
  title: string;
  publication: string;
  author: string | null;
  topicLabel: string;
  quote: string;
  hook: string;
  ordinal: number;
  total: number;
};

type Edge = "left" | "right" | "bottom";
type Peek = { edge: Edge; offset: number };

const SESSION_KEY = "al:signal-peeks";
const MAX_PEEKS = 3;
const VISIBLE_MS = 11_000;
const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Hidden → it peeks in from a random edge now and then, half out of frame, and slips away if ignored. */
export function StraySignal() {
  const [peek, setPeek] = useState<Peek | null>(null);
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [signal, setSignal] = useState<Payload | null>(null);
  const timers = useRef<number[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  // Schedule peeks: first after 20-45s, then every 45-100s, at most three per session.
  useEffect(() => {
    let count = 0;
    try {
      count = Number(sessionStorage.getItem(SESSION_KEY)) || 0;
    } catch {}
    const forced = new URLSearchParams(location.search).has("signal");
    const schedule = (delay: number) =>
      later(() => {
        if (count >= MAX_PEEKS && !forced) return;
        // Never peek into a background tab; try again once the visitor might be looking.
        if (document.hidden && !forced) return schedule(10_000);
        count++;
        try {
          sessionStorage.setItem(SESSION_KEY, String(count));
        } catch {}
        const edges: Edge[] = window.innerWidth < 640 ? ["left", "right"] : ["left", "right", "bottom"];
        setPeek({ edge: edges[Math.floor(Math.random() * edges.length)], offset: rand(28, 72) });
        later(() => setShown(true), 60); // after mount, so the slide-in transition runs
        later(() => setShown(false), VISIBLE_MS);
        schedule(VISIBLE_MS + rand(45_000, 100_000));
      }, delay);
    // `?signal` in the URL summons a peek right away (for demos).
    if (forced) schedule(1500);
    else if (count < MAX_PEEKS) schedule(rand(20_000, 45_000));
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const tuneIn = useCallback(async () => {
    setOpen(true);
    setShown(false);
    if (signal) return;
    setState("loading");
    const started = performance.now();
    try {
      const res = await fetch("/api/signal", { cache: "no-store" });
      if (res.status !== 200) throw new Error(String(res.status));
      const data = (await res.json()) as Payload;
      // Let the orb breathe for a beat — the reveal should feel like tuning in, not a page load.
      await new Promise((r) => setTimeout(r, Math.max(0, 900 - (performance.now() - started))));
      setSignal(data);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [signal]);

  // Anywhere on the site can summon it (e.g. the case study's "try it" button).
  useEffect(() => {
    const onSummon = () => void tuneIn();
    window.addEventListener("stray-signal:summon", onSummon);
    return () => window.removeEventListener("stray-signal:summon", onSummon);
  }, [tuneIn]);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const place = (p: Peek) => (p.edge === "bottom" ? { left: `${p.offset}%`, bottom: 0 } : { top: `${p.offset}%`, [p.edge]: 0 });

  return (
    <>
      {peek && !open && (
        <button
          type="button"
          onClick={tuneIn}
          aria-label="A stray signal — tune in for a reading recommendation"
          tabIndex={shown ? 0 : -1}
          data-edge={peek.edge}
          data-shown={shown || undefined}
          className="signal-peek group fixed z-40 rounded-full p-1"
          style={place(peek)}
        >
          <SignalGlyph className="signal-bob drop-shadow-[0_0_18px_rgba(255,106,61,0.35)]" />
          <span
            className={cn(
              "pointer-events-none absolute whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.24em] text-fg-muted opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100",
              peek.edge === "left" && "left-full top-1/2 ml-2 -translate-y-1/2",
              peek.edge === "right" && "right-full top-1/2 mr-2 -translate-y-1/2",
              peek.edge === "bottom" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
            )}
          >
            a stray signal
          </span>
        </button>
      )}

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="signal-title"
          tabIndex={-1}
          className="signal-card fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-[55] outline-none sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[27rem]"
        >
          <div className="rounded-[var(--radius-shell)] border border-line-strong bg-ink/80 p-1.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            <div className="relative rounded-[var(--radius-core)] bg-ink-raised/95 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
              >
                <X size={14} weight="light" />
              </button>

              <p id="signal-title" className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-fg-faint">
                <span className="size-1.5 rounded-full bg-accent" />
                Stray signal
                {signal && (
                  <span className="text-fg-muted">
                    — {String(signal.ordinal).padStart(3, "0")} / {signal.total}
                  </span>
                )}
              </p>

              <div aria-live="polite">
                {state === "loading" && (
                  <div className="flex flex-col items-center gap-3 py-10">
                    <Orb state="listening" label="Tuning in" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-fg-faint">Tuning in…</span>
                  </div>
                )}

                {state === "error" && (
                  <div className="py-8">
                    <p className="font-serif text-2xl italic text-fg">The signal faded.</p>
                    <button type="button" onClick={() => void tuneIn()} className="mt-4 text-sm text-fg-muted underline decoration-accent underline-offset-4 hover:text-fg">
                      Try again
                    </button>
                  </div>
                )}

                {state === "ready" && signal && (
                  <div className="signal-reveal">
                    <blockquote className="mt-5 font-serif text-[1.45rem] italic leading-[1.3] tracking-[-0.01em] text-fg sm:text-[1.6rem]">
                      &ldquo;{signal.quote}&rdquo;
                    </blockquote>
                    <p className="mt-5 text-sm leading-snug text-fg-muted">
                      <span className="text-fg">{signal.title}</span>
                      <br />
                      {signal.author ? `${signal.author}, ` : ""}
                      <em>{signal.publication}</em>
                    </p>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                        {signal.topicLabel}
                      </span>
                      <a
                        href={signal.url}
                        target="_blank"
                        rel="noopener"
                        className="group inline-flex items-center gap-3 rounded-full bg-fg py-1.5 pl-5 pr-1.5 text-sm font-medium text-ink transition-transform duration-500 ease-[var(--ease-spring)] active:scale-[0.97]"
                      >
                        Read it
                        <span className="flex size-8 items-center justify-center rounded-full bg-ink/10 transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-px group-hover:translate-x-0.5">
                          <ArrowUpRight size={14} weight="light" />
                        </span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
