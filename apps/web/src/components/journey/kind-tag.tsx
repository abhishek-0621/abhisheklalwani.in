import { cn } from "@al/ui/cn";
import { isHighlight, type ChapterKind } from "@/content/journey";

export function KindTag({ kind }: { kind: ChapterKind }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
        isHighlight(kind) ? "border-accent/45 bg-accent-soft text-accent" : "border-line-strong text-fg-muted",
      )}
    >
      {kind}
    </span>
  );
}
