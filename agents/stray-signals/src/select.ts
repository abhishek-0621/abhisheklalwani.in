import { config } from "./config";
import { weightedShares } from "./balance";
import { hashId } from "./lib/text";
import { TOPICS, type Signal, type Topic } from "./schema";
import type { Accepted, CurationCache } from "./state";

/**
 * Builds the weekly rotation from every accepted post still in the cache.
 * Score = curator quality + freshness + a five-minute-read bonus + quotability + a small
 * per-week jitter (so the list rotates even when the pool is stable). Topic shares follow the
 * editorial weights in config; caps keep any one publication or topic from dominating.
 */
export function select(cache: CurationCache, week: string): Signal[] {
  const now = Date.now();
  const [lo, hi] = config.sweetSpotWords;
  const pool = Object.entries(cache)
    .filter((e): e is [string, Accepted] => e[1].ok)
    .map(([url, a]) => {
      const ageDays = a.publishedAt ? (now - Date.parse(a.publishedAt)) / 86_400_000 : 365;
      const fresh = ageDays < 30 ? 1.5 : ageDays < 90 ? 0.8 : 0;
      const jitter = (Number.parseInt(hashId(url + week).replace(/\W/g, "").slice(0, 6), 36) % 1000) / 1000;
      const read = !a.words ? 0 : a.words >= lo && a.words <= hi ? 1.5 : a.words > config.longReadWords ? -1.5 : 0;
      const quotable = a.quotable ? (a.quotable - 3) * 0.8 : 0;
      return { url, a, score: a.quality + fresh * 2 + jitter * 1.5 + read + quotable };
    })
    .sort((x, y) => y.score - x.score);

  // Every topic is owed a share of the list in proportion to its editorial weight.
  const share = weightedShares(config.targetSize, config.topicWeights);
  const chosen = new Map<string, Accepted>();
  const perPub = new Map<string, number>();
  const perTopic = new Map<Topic, number>();
  const take = (url: string, a: Accepted) => {
    chosen.set(url, a);
    perPub.set(a.host, (perPub.get(a.host) ?? 0) + 1);
    perTopic.set(a.topic, (perTopic.get(a.topic) ?? 0) + 1);
  };

  // Pass 1 — fair share: each topic's best essays up to its weighted share, so a prolific
  // topic can never crowd out a quieter one.
  for (const topic of TOPICS) {
    for (const { url, a } of pool) {
      if ((perTopic.get(topic) ?? 0) >= Math.floor(share[topic])) break;
      if (a.topic === topic && (perPub.get(a.host) ?? 0) < config.maxPerPublication) take(url, a);
    }
  }

  // Pass 2 — fill by score up to 1.5x each topic's share; pass 3 allows 2.5x only if still short.
  // Never uncapped: a shorter balanced list beats a lopsided one.
  for (const stretch of [1.5, 2.5]) {
    for (const { url, a } of pool) {
      if (chosen.size >= config.targetSize) break;
      if (chosen.has(url)) continue;
      const pubCap = stretch > 2 ? config.maxPerPublication * 2 : config.maxPerPublication;
      if ((perPub.get(a.host) ?? 0) >= pubCap) continue;
      if ((perTopic.get(a.topic) ?? 0) >= Math.ceil(share[a.topic] * stretch)) continue;
      take(url, a);
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
