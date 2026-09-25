import type { MDXComponents } from "mdx/types";
import { Architecture } from "@/components/ui/architecture";

const components: MDXComponents = {
  Architecture,
  Callout: ({ children }: { children: React.ReactNode }) => (
    <aside className="my-8 border-l border-accent pl-5 font-serif text-2xl leading-snug text-fg">{children}</aside>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
