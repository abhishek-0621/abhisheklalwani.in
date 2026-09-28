"use client";

import { useEffect, type RefObject } from "react";

/**
 * Runs `frame` once per animation frame, but only while `ref` is on screen, and never under
 * prefers-reduced-motion. Callers write CSS variables directly, so scrolling never re-renders React.
 */
export function useScrollDriver(ref: RefObject<HTMLElement | null>, frame: (el: HTMLElement) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const loop = () => {
      frame(el);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    frame(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // `frame` is recreated each render; the element is what matters, so it is read once.
  }, [ref]);
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** 0 when `el`'s top reaches the viewport top, 1 when its bottom reaches the viewport bottom. */
export function pinProgress(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const travel = r.height - window.innerHeight;
  return travel > 0 ? clamp(-r.top / travel, 0, 1) : 0;
}
