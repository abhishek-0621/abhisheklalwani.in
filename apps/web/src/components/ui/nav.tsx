"use client";

import { cn } from "@al/ui/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+1rem)] z-50 flex justify-center px-4 md:top-[calc(env(safe-area-inset-top)+1.5rem)]">
        <nav className="flex w-full max-w-6xl items-center justify-between gap-2 rounded-full border border-line bg-ink/70 py-1.5 pl-5 pr-1.5 backdrop-blur-xl md:w-max md:justify-start md:gap-1">
          <Link href="/" className="mr-4 font-serif text-lg italic tracking-tight text-fg" aria-label="Home">
            al<span className="text-accent">.</span>
          </Link>
          <ul className="hidden items-center md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="rounded-full px-3.5 py-2 text-[13px] text-fg-muted transition-colors duration-300 hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={site.links.resume}
            className="ml-2 hidden rounded-full bg-fg px-4 py-2 text-[13px] font-medium text-ink transition-transform duration-500 ease-[var(--ease-spring)] active:scale-[0.97] md:inline-block"
          >
            Résumé
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="relative size-10 rounded-full bg-white/5 md:hidden"
          >
            <span className={cn("absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-fg transition-transform duration-500 ease-[var(--ease-spring)]", open ? "rotate-45" : "-translate-y-[3px]")} />
            <span className={cn("absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-fg transition-transform duration-500 ease-[var(--ease-spring)]", open ? "-rotate-45" : "translate-y-[3px]")} />
          </button>
        </nav>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col justify-center overflow-y-auto overscroll-contain bg-ink/85 px-8 pb-[env(safe-area-inset-bottom)] pt-28 backdrop-blur-3xl transition-opacity duration-500 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <ul className="space-y-2">
          {[...links, { href: site.links.resume, label: "Résumé" }].map((l, i) => (
            <li key={l.href} className="overflow-hidden">
              <Link
                href={l.href}
                prefetch={l.href.endsWith(".pdf") ? false : undefined}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className={cn(
                  "block font-serif text-[clamp(2.25rem,11vw,3rem)] leading-tight tracking-tight text-fg transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)]",
                  open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
                )}
                style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
