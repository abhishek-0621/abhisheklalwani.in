import { TOPICS, type Topic } from "./schema";
import type { Publication, PublicationPool } from "./state";

/** A publication counts toward its first (primary) topic. */
export const primaryTopic = (p: Publication): Topic | undefined => p.topics[0];

export function activeByTopic(pool: PublicationPool) {
  const counts = Object.fromEntries(TOPICS.map((t) => [t, 0])) as Record<Topic, number>;
  for (const p of Object.values(pool)) {
    const t = primaryTopic(p);
    if (p.status === "active" && t) counts[t]++;
  }
  return counts;
}

/** Interleaves groups so each takes a turn: [a1, b1, c1, a2, b2, ...]. */
export function roundRobin<T>(groups: T[][]): T[] {
  const out: T[] = [];
  for (let i = 0; groups.some((g) => i < g.length); i++) for (const g of groups) if (i < g.length) out.push(g[i]);
  return out;
}
