"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const StraySignal = dynamic(() => import("./stray-signal").then((m) => m.StraySignal), { ssr: false });

/** Mounts the easter egg only after the page is idle, and only when this week's list has entries. */
export function SignalLoader({ enabled }: { enabled: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void, _o?: IdleRequestOptions) => window.setTimeout(cb, 1500));
    const id = idle(() => setReady(true), { timeout: 4000 });
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id);
  }, [enabled]);
  return ready ? <StraySignal /> : null;
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
