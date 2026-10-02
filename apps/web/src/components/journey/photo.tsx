import { cn } from "@al/ui/cn";
import Image from "next/image";
import type { Photo as PhotoData } from "@/content/journey";

const hues = [18, 205, 32, 160, 280, 45, 190, 12];

/** A real photo when `photo.src` is set, otherwise a tinted placeholder that marks the slot. */
export function Photo({ photo, quote, index = 0, label = "Photo", className, sizes = "(min-width: 1024px) 40vw, 90vw" }: {
  photo?: PhotoData;
  /** With no photo, set the quote large in the frame instead of a placeholder. */
  quote?: string;
  index?: number;
  label?: string;
  className?: string;
  sizes?: string;
}) {
  if (photo?.src) {
    return (
      <div className={cn("relative overflow-hidden rounded-[var(--radius-core)]", className)}>
        <Image src={photo.src} alt={photo.alt ?? ""} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }
  if (quote) {
    return (
      <figure className={cn("quote-slot relative flex items-center overflow-hidden rounded-[var(--radius-core)] p-6 md:p-10", className)}>
        <blockquote className="relative font-serif text-2xl italic leading-[1.15] tracking-[-0.01em] text-fg md:text-4xl">
          <span className="text-accent">&ldquo;</span>
          {quote}
          <span className="text-accent">&rdquo;</span>
        </blockquote>
      </figure>
    );
  }
  return (
    <div className={cn("photo-slot relative overflow-hidden rounded-[var(--radius-core)]", className)} style={{ "--h": hues[index % hues.length] } as React.CSSProperties} aria-hidden>
      <span className="absolute bottom-2.5 left-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg/60">{label}</span>
    </div>
  );
}
