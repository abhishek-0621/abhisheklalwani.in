"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const StraySignal = dynamic(() => import("./stray-signal").then((m) => m.StraySignal), { ssr: false });

/** Mounts the easter egg only after the page is idle, and only when this week's list has entries. */
export function SignalLoader({ enabled }: { enabled: boolean }) {
  const [ready, setReady] = useState(false);
  const [summoned, setSummoned] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void, _o?: IdleRequestOptions) => window.setTimeout(cb, 1500));
    const id = idle(() => setReady(true), { timeout: 4000 });
    // A summon before the component has loaded mounts it early and opens it straight away.
    const early = () => {
      setSummoned(true);
      setReady(true);
    };
    window.addEventListener("stray-signal:summon", early, { once: true });
    return () => {
      (window.cancelIdleCallback ?? window.clearTimeout)(id);
      window.removeEventListener("stray-signal:summon", early);
    };
  }, [enabled]);
  return ready ? <StraySignal openOnMount={summoned} /> : null;
}

/** Button that opens the signal on demand (used in the case study). */
export function SummonSignal({ children = "Tune in now" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("stray-signal:summon"))}
      className="group my-6 inline-flex items-center gap-3 rounded-full border border-line-strong py-1.5 pl-5 pr-1.5 text-sm font-medium text-fg transition-[transform,border-color] duration-500 ease-[var(--ease-spring)] hover:border-fg-muted active:scale-[0.97]"
    >
      {children}
      <span className="flex size-8 items-center justify-center rounded-full bg-white/10">
        <span className="size-2 rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]" />
      </span>
    </button>
  );
}

/** Quiet permanent way in, for anyone who hears about the signal but never catches one. */
export function FooterSignal() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("stray-signal:summon"))}
      className="group inline-flex items-center gap-2 uppercase transition-colors hover:text-fg"
    >
      <span className="relative flex size-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative size-2 rounded-full bg-accent" />
      </span>
      Catch a stray signal
    </button>
  );
}
