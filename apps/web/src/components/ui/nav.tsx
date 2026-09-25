"use client";

import { cn } from "@al/ui/cn";
import { ArrowUpRight } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { site } from "@/content/site";

// In page order, so the highlight moves left to right as you scroll down.
const links = [
  { id: "about", href: "/#about", label: "About" },
  { id: "work", href: "/#work", label: "Work" },
  { id: "experience", href: "/#experience", label: "Experience" },
  { id: "contact", href: "/#contact", label: "Contact" },
];

/** Which section is under the middle of the viewport; on /work pages, always "work". */
function useActiveSection(pathname: string) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/work")) {
      setActive("work");
      return;
    }
    if (pathname !== "/") {
      setActive(null);
      return;
    }
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        setActive(links.find((l) => visible.get(l.id))?.id ?? null);
      },
      // A thin band across the middle of the screen: whichever section crosses it is "current".
      { rootMargin: "-45% 0px -50% 0px" },
    );
    // Next tick: the page's sections mount in the same commit as a route change.
    const id = window.setTimeout(() => {
      for (const l of links) {
        const el = document.getElementById(l.id);
        if (el) io.observe(el);
      }
    }, 0);
    return () => {
      window.clearTimeout(id);
      io.disconnect();
    };
  }, [pathname]);

  return [active, setActive] as const;
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [active, setActive] = useActiveSection(pathname);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Slide the highlight pill under the active link (re-measured after fonts load and on resize).
  useLayoutEffect(() => {
    const measure = () => {
      const el = active ? itemRefs.current[active] : null;
      setPill(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
    };
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <>
      <header className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+1rem)] z-50 flex justify-center px-4 md:top-[calc(env(safe-area-inset-top)+1.5rem)]">
        <nav
          aria-label="Main"
          className="flex w-full max-w-6xl items-center justify-between gap-2 rounded-full border border-line bg-ink/70 py-1.5 pl-5 pr-1.5 backdrop-blur-xl md:w-max md:justify-start md:gap-1"
        >
          <Link href="/" className="mr-4 font-serif text-lg italic tracking-tight text-fg" aria-label="Home">
            al<span className="text-accent">.</span>
          </Link>
          <ul className="relative hidden items-center md:flex">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 rounded-full bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[transform,width,opacity] duration-500 ease-[var(--ease-spring)]"
              style={{ transform: `translateX(${pill?.x ?? 0}px)`, width: pill?.w ?? 0, opacity: pill ? 1 : 0 }}
            />
            {links.map((l) => {
              const current = active === l.id;
              return (
                <li key={l.id}>
                  <Link
                    href={l.href}
                    ref={(el) => {
                      itemRefs.current[l.id] = el;
                    }}
                    onClick={() => setActive(l.id)}
                    aria-current={current ? (pathname === "/" ? "location" : "page") : undefined}
                    className={cn(
                      "relative block rounded-full px-3.5 py-2 text-[13px] transition-colors duration-300",
                      current ? "text-fg" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <a
            href={site.links.resume}
            target="_blank"
            rel="noopener"
            className="group ml-2 hidden items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-[7px] text-[13px] text-fg transition-[border-color,transform] duration-500 ease-[var(--ease-spring)] hover:border-fg-muted active:scale-[0.97] md:inline-flex"
          >
            Résumé
            <ArrowUpRight
              size={12}
              weight="light"
              aria-label="opens in a new tab"
              className="transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-px group-hover:translate-x-0.5"
            />
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
          {[...links, { id: "resume", href: site.links.resume, label: "Résumé" }].map((l, i) => {
            const current = active === l.id;
            const external = l.id === "resume";
            return (
              <li key={l.id} className="overflow-hidden">
                <Link
                  href={l.href}
                  prefetch={external ? false : undefined}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener" : undefined}
                  onClick={() => {
                    if (!external) setActive(l.id);
                    setOpen(false);
                  }}
                  aria-current={current ? "location" : undefined}
                  tabIndex={open ? 0 : -1}
                  className={cn(
                    "flex items-center gap-4 font-serif text-[clamp(2.25rem,11vw,3rem)] leading-tight tracking-tight transition-[transform,opacity,color] duration-700 ease-[var(--ease-out-expo)]",
                    current ? "text-fg" : "text-fg-muted",
                    open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
                  )}
                  style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
                >
                  {l.label}
                  {current && <span aria-hidden className="size-2 rounded-full bg-accent" />}
                  {external && <ArrowUpRight size={22} weight="light" aria-hidden />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
