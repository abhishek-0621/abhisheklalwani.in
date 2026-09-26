import { Orb } from "@al/ui/orb";

/**
 * First-visit overlay. Exits via CSS after ~0.9s, so it never waits on JS or blocks content.
 * Skipped on repeat visits by the inline boot script (html[data-seen]).
 */
export function Intro() {
  return (
    <div aria-hidden className="intro fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-ink">
      <Orb state="weaving" />
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-fg-faint">Abhishek Lalwani</span>
    </div>
  );
}

/** Runs before paint: marks JS availability and repeat visits. */
export const bootScript = `(()=>{const d=document.documentElement;d.dataset.js="";try{var t=localStorage.getItem("al:theme");d.dataset.theme=t||(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark")}catch(e){d.dataset.theme="dark"}try{if(sessionStorage.getItem("al:seen"))d.dataset.seen="";else sessionStorage.setItem("al:seen","1")}catch(e){}})()`;
