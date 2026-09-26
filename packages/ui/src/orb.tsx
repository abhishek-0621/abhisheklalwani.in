"use client";

import { ThinkingOrb, type OrbState } from "thinking-orbs";

export type { OrbState };

type OrbProps = {
  state?: OrbState;
  size?: 64 | 20;
  label?: string;
  className?: string;
};

/** The only loading indicator used across the site. Pinned to the dark palette. */
export function Orb({ state = "connecting", size = 64, label, className }: OrbProps) {
  return <ThinkingOrb state={state} size={size} theme="auto" aria-label={label} className={className} />;
}

/** Centered orb for route-level and section-level suspense boundaries. */
export function OrbFallback({ state = "searching", label = "Loading" }: { state?: OrbState; label?: string }) {
  return (
    <div role="status" className="flex min-h-[60dvh] w-full flex-col items-center justify-center gap-4">
      <Orb state={state} label={label} />
      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-fg-faint">{label}</span>
    </div>
  );
}
