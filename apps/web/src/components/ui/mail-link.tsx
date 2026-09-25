"use client";

import type { ReactNode } from "react";
import { site } from "@/content/site";

/**
 * Opens Gmail compose on desktop (new tab) and the native mail app on touch devices,
 * where Gmail's web compose URL does not work reliably.
 */
export function MailLink({ className, children, label }: { className?: string; children: ReactNode; label?: string }) {
  return (
    <a
      href={site.links.gmail}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={className}
      onClick={(e) => {
        if (window.matchMedia("(pointer: coarse)").matches) {
          e.preventDefault();
          window.location.href = site.links.mailto;
        }
      }}
    >
      {children}
    </a>
  );
}
