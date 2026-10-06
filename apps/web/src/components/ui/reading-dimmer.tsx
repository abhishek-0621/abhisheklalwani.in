"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * While a long-reading block ([data-reading]) crosses the middle of the screen, marks
 * <html data-reading> so the particle scene fades back and the text stays easy to read.
 */
export function ReadingDimmer() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const inView = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? inView.add(e.target) : inView.delete(e.target);
        root.toggleAttribute("data-reading", inView.size > 0);
      },
      // A band across the middle of the screen: dim only while text is what you're looking at.
      { rootMargin: "-35% 0px -35% 0px" },
    );
    // Wait a beat so the page's own elements exist (and have hydrated) before observing.
    const id = window.setTimeout(() => document.querySelectorAll("[data-reading]").forEach((el) => io.observe(el)), 300);
    return () => {
      window.clearTimeout(id);
      io.disconnect();
      root.removeAttribute("data-reading");
    };
  }, [pathname]);

  return null;
}
