import type { Signal, SignalFile } from "@al/stray-signals/schema";
import data from "@/content/signals.json";

const file = data as SignalFile;

/**
 * Rotation without server state: every visitor has a random seed (kept in their browser)
 * and a counter n. Visitor catches essay permutation(seed, cycle)[n mod len], so they never
 * see a repeat until they have caught every essay; then a fresh shuffle begins. Different
 * seeds give different orders, so visitors are spread across the list at random.
 */
function permutation(len: number, seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  let s = h >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const idx = Array.from({ length: len }, (_, i) => i);
  for (let i = len - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export const signalVersion = () => file.version;
export const signalCount = () => file.items.length;

/** The n-th essay in this visitor's personal shuffle. */
export function pickSignal(seed: string, n: number): { signal: Signal; ordinal: number } | null {
  const len = file.items.length;
  if (!len) return null;
  const cycle = Math.floor(n / len);
  const pos = n % len;
  const index = permutation(len, `${file.version}:${seed}:${cycle}`)[pos];
  return { signal: file.items[index], ordinal: pos + 1 };
}
