import { TOPIC_WEIGHTS, TOPICS, type Signal, type SignalFile, type Topic } from "@al/stray-signals/schema";
import data from "@/content/signals.json";

const file = data as SignalFile;

/**
 * How a catch is chosen, with no server state (each visitor's browser keeps a seed and a count n):
 *
 * 1. Topic — a smooth weighted round-robin over TOPIC_WEIGHTS, offset by the visitor's seed.
 *    Over any stretch of catches, philosophy and psychology come up most and science least,
 *    no matter how large any topic's share of the library is.
 * 2. Essay — the next unseen essay in that topic, from a shuffle seeded by the visitor that
 *    leans toward high-scoring essays (five-minute reads, memorable quotes) without excluding any.
 *    No repeats until the visitor has seen the whole library; then a new lap begins.
 */
const byTopic = new Map<Topic, Signal[]>();
for (const s of file.items) byTopic.set(s.topic, [...(byTopic.get(s.topic) ?? []), s]);
const topics = TOPICS.filter((t) => byTopic.has(t));

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  let s = h >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Topic of this visitor's n-th catch, and how many earlier catches came from that topic.
 * A topic the visitor has fully read sits out until the whole library has been read, so
 * nobody sees a repeat before seeing everything; then the next lap begins.
 */
function topicAt(seed: string, n: number): { topic: Topic; k: number } {
  const rand = rng(`${seed}:topics`);
  const current = new Map(topics.map((t) => [t, TOPIC_WEIGHTS[t] * rand()]));
  const counts = new Map(topics.map((t) => [t, 0]));
  let lap = 0;
  let pick = topics[0];
  for (let step = 0; step <= n; step++) {
    let open = topics.filter((t) => counts.get(t)! < byTopic.get(t)!.length * (lap + 1));
    if (!open.length) {
      lap++;
      open = topics;
    }
    const total = open.reduce((a, t) => a + TOPIC_WEIGHTS[t], 0);
    for (const t of open) current.set(t, current.get(t)! + TOPIC_WEIGHTS[t]);
    pick = open.reduce((best, t) => (current.get(t)! > current.get(best)! ? t : best));
    current.set(pick, current.get(pick)! - total);
    counts.set(pick, counts.get(pick)! + 1);
  }
  return { topic: pick, k: counts.get(pick)! - 1 };
}

/** Weighted random order (exponential race): better essays tend to come earlier. */
function order(list: Signal[], seed: string) {
  const rand = rng(seed);
  return list
    .map((s, i) => ({ i, key: -Math.log(1 - rand()) / Math.exp(((s.score ?? 15) - 16) / 3) }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.i);
}

export const signalVersion = () => file.version;
export const signalCount = () => file.items.length;

export function pickSignal(seed: string, n: number): { signal: Signal; ordinal: number } | null {
  if (!topics.length) return null;
  const { topic, k } = topicAt(seed, Math.min(n, 20_000));
  const list = byTopic.get(topic)!;
  const cycle = Math.floor(k / list.length);
  const index = order(list, `${seed}:${topic}:${cycle}`)[k % list.length];
  return { signal: list[index], ordinal: (n % file.items.length) + 1 };
}
