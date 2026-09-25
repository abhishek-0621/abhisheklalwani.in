import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 border-t border-line px-4 py-10 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint pb-[calc(env(safe-area-inset-bottom)+2.5rem)] sm:px-6 md:flex-row md:items-center md:justify-between md:px-8">
      <span>© {new Date().getFullYear()} {site.name}</span>
      <span>{site.location}</span>
      <span>Built with Next.js & three.js</span>
    </footer>
  );
}
