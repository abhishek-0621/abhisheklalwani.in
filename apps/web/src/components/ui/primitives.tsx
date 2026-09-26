import { cn } from "@al/ui/cn";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { MailLink } from "./mail-link";

type SceneIndex = 0 | 1 | 2 | 3 | 4;

/** A page section bound to a particle scene. Sections set the rhythm: huge vertical space. */
export function Section({
  id,
  scene,
  className,
  children,
}: {
  id?: string;
  scene: SceneIndex;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} data-scene={scene} className={cn("relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 md:px-8 md:py-32 lg:py-40", className)}>
      {children}
    </section>
  );
}

export const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/** Mono index label: [ 01 — WORK ] */
export function Eyebrow({ index, children, className }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn("reveal font-mono text-[11px] uppercase tracking-[0.24em] text-fg-faint", className)}>
      <span className="text-fg-muted">[</span> {index && <span className="text-accent">{index}</span>}
      {index && <span className="mx-2">—</span>}
      {children} <span className="text-fg-muted">]</span>
    </p>
  );
}

export function Heading({ children, className, as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <Tag className={cn("reveal font-serif text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.025em] text-fg", className)} style={stagger(1)}>
      {children}
    </Tag>
  );
}

/** Pill button with the trailing icon nested in its own circle. */
export function PillLink({
  href,
  children,
  variant = "solid",
  external,
  download,
  mail,
  icon,
}: {
  /** Ignored when `mail` is set. */
  href?: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
  external?: boolean;
  download?: boolean;
  /** Email me: Gmail compose on desktop, native mail app on touch devices. */
  mail?: boolean;
  icon?: ReactNode;
}) {
  const cls = cn(
    "group inline-flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-sm font-medium transition-[transform,background-color,color] duration-500 ease-[var(--ease-spring)] active:scale-[0.97]",
    variant === "solid" ? "bg-fg text-ink hover:bg-fg/90" : "border border-line-strong text-fg hover:border-fg-muted",
  );
  const inner = (
    <>
      {children}
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105",
          variant === "solid" ? "bg-ink/10" : "bg-fg/10",
        )}
      >
        {icon ?? <ArrowUpRight size={14} weight="light" />}
      </span>
    </>
  );
  if (mail)
    return (
      <MailLink className={cls}>
        {inner}
      </MailLink>
    );
  if (!href) return null;
  if (external || download)
    return (
      <a href={href} className={cls} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} download={download || undefined}>
        {inner}
      </a>
    );
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

/** Double-bezel card: machined outer tray + inner core with a hairline highlight. */
export function Bezel({ children, className, coreClassName, style }: { children: ReactNode; className?: string; coreClassName?: string; style?: CSSProperties }) {
  return (
    <div className={cn("rounded-[var(--radius-shell)] border border-line bg-fg/[0.02] p-1.5", className)} style={style}>
      <div className={cn("h-full rounded-[var(--radius-core)] bg-ink-raised/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]", coreClassName)}>{children}</div>
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">{children}</span>;
}
