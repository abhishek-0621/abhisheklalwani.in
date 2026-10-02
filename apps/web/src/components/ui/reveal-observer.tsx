"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One IntersectionObserver for every `.reveal` element on the page.
 *
 * This sits in the root layout, so its effect can run before the page below it has hydrated.
 * Marking elements then would add an attribute React didn't render (a hydration mismatch), so
 * observing waits until the browser is idle, by which point hydration has finished.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const start = () => document.querySelectorAll(".reveal:not([data-in])").forEach((el) => io.observe(el));
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(start, { timeout: 500 });
    return () => {
      cancel(id);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
