import type { MDXComponents } from "mdx/types";
import { SummonSignal } from "@/components/signal/signal-loader";
import { Architecture } from "@/components/ui/architecture";
import { Pipeline } from "@/components/ui/pipeline";

const components: MDXComponents = {
  Architecture,
  Pipeline,
  SummonSignal,
  Callout: ({ children }: { children: React.ReactNode }) => (
    <aside className="my-8 border-l border-accent pl-5 font-serif text-2xl leading-snug text-fg">{children}</aside>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
