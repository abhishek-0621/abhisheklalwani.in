"use client";

import { Orb } from "@al/ui/orb";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ParticleCanvas = dynamic(() => import("./particle-canvas"), { ssr: false });

type Capability = { count: number } | null;

function detect(): Capability {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const probe = document.createElement("canvas");
  if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return null;
  const small = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency ?? 4;
  return { count: small ? 4200 : cores <= 4 ? 6000 : 9000 };
}

/**
 * One fixed WebGL layer mounted in the root layout, so it survives route changes.
 * The three.js chunk loads after first paint; a thinking orb holds its place meanwhile.
 */
export function SceneRoot() {
  const pathname = usePathname();
  const [cap, setCap] = useState<Capability | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [orbGone, setOrbGone] = useState(false);

  useEffect(() => {
    const c = detect();
    if (!c) return setCap(null);
    // Fetch the three.js chunk in parallel, then mount once the main thread has a gap.
    void import("./particle-canvas");
    const idle = window.requestIdleCallback ?? ((cb: () => void, _opts?: IdleRequestOptions) => window.setTimeout(cb, 120));
    const id = idle(() => setCap(c), { timeout: 600 });
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id);
  }, []);

  if (cap === null) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0 transition-opacity duration-[1600ms] ease-[var(--ease-out-expo)]"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {cap && <ParticleCanvas count={cap.count} routeKey={pathname} onReady={() => setReady(true)} />}
      </div>
      {!orbGone && (
        <div
          className="absolute left-1/2 top-[38%] -translate-x-1/2 transition-opacity duration-700 md:left-[72%] md:top-1/2 md:-translate-y-1/2"
          style={{ opacity: ready ? 0 : 1 }}
          onTransitionEnd={() => ready && setOrbGone(true)}
        >
          <Orb state="connecting" label="Loading scene" />
        </div>
      )}
    </div>
  );
}
