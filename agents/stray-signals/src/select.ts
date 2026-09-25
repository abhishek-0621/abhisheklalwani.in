import { config } from "./config";
import { hashId } from "./lib/text";
import { TOPICS, type Signal, type Topic } from "./schema";
import type { Accepted, CurationCache } from "./state";

/**
 * Builds the weekly rotation from every accepted post still in the cache.
 * Score = curator quality + a freshness bonus + a small per-week jitter, so the list
 * rotates even when the pool is stable. Caps keep any one publication or topic from
 * dominating; they relax only if the pool cannot otherwise fill the target.
 */
export function select(cache: CurationCache, week: string): Signal[] {
  const now = Date.now();
  const pool = Object.entries(cache)
    .filter((e): e is [string, Accepted] => e[1].ok)
    .map(([url, a]) => {
      const ageDays = a.publishedAt ? (now - Date.parse(a.publishedAt)) / 86_400_000 : 365;
      const fresh = ageDays < 30 ? 1.5 : ageDays < 90 ? 0.8 : 0;
      const jitter = (Number.parseInt(hashId(url + week).replace(/\W/g, "").slice(0, 6), 36) % 1000) / 1000;
      return { url, a, score: a.quality + fresh * 2 + jitter * 1.5 };
    })
    .sort((x, y) => y.score - x.score);

  // With eleven topics, no single one may take more than a fifth of the list.
  const topicCap = Math.ceil(config.targetSize * 0.2);
  const fairShare = Math.floor(config.targetSize / TOPICS.length);
  const chosen = new Map<string, Accepted>();

  // Pass 1 — fair share: every topic gets up to targetSize / topics of its best essays,
  // so a topic with fewer writers is never crowded out by a prolific one.
  {
    const perPub = new Map<string, number>();
    for (const topic of TOPICS) {
      let taken = 0;
      for (const { url, a } of pool) {
        if (taken >= fairShare) break;
        if (a.topic !== topic || (perPub.get(a.host) ?? 0) >= config.maxPerPublication) continue;
        chosen.set(url, a);
        perPub.set(a.host, (perPub.get(a.host) ?? 0) + 1);
        taken++;
      }
    }
  }

  // Pass 2 — fill the rest by score, with caps; pass 3 relaxes them only if still short.
  for (const relax of [false, true]) {
    const perPub = new Map<string, number>();
    const perTopic = new Map<Topic, number>();
    for (const a of chosen.values()) {
      perPub.set(a.host, (perPub.get(a.host) ?? 0) + 1);
      perTopic.set(a.topic, (perTopic.get(a.topic) ?? 0) + 1);
    }
    for (const { url, a } of pool) {
      if (chosen.size >= config.targetSize) break;
      if (chosen.has(url)) continue;
      const pubCap = relax ? config.maxPerPublication * 2 : config.maxPerPublication;
      if ((perPub.get(a.host) ?? 0) >= pubCap) continue;
      // Relaxing never lifts the topic cap entirely: a shorter balanced list beats a lopsided one.
      if ((perTopic.get(a.topic) ?? 0) >= (relax ? topicCap * 2 : topicCap)) continue;
      chosen.set(url, a);
      perPub.set(a.host, (perPub.get(a.host) ?? 0) + 1);
      perTopic.set(a.topic, (perTopic.get(a.topic) ?? 0) + 1);
    }
  }

  return [...chosen.entries()].map(([url, a]) => ({
    id: hashId(url),
    url,
    title: a.title,
    publication: a.publication,
    author: a.author,
    topic: a.topic,
    quote: a.quote,
    hook: a.hook,
    publishedAt: a.publishedAt,
  }));
}

export function topicCounts(items: Signal[]) {
  const counts = Object.fromEntries(TOPICS.map((t) => [t, 0])) as Record<Topic, number>;
  for (const s of items) counts[s.topic]++;
  return counts;
}
