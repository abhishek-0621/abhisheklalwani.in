import { hashId } from "./lib/text";
import { TOPICS, type Signal, type Topic } from "./schema";
import type { Accepted, CurationCache } from "./state";

/**
 * The published library is every essay the curator has ever accepted: it only grows.
 * Topic balance is not enforced here but when an essay is handed out — the site picks each
 * catch's topic by TOPIC_WEIGHTS — so a prolific topic can never crowd out the others.
 */
export function publishAll(cache: CurationCache): Signal[] {
  return Object.entries(cache)
    .filter((e): e is [string, Accepted] => e[1].ok)
    .sort(([a], [b]) => a.localeCompare(b)) // stable order keeps weekly diffs small
    .map(([url, a]) => ({
      id: hashId(url),
      url,
      title: a.title,
      publication: a.publication,
      author: a.author,
      topic: a.topic,
      quote: a.quote,
      hook: a.hook,
      publishedAt: a.publishedAt,
      score: rank(a),
    }));
}

/** Curator quality, plus a bonus for five-minute reads (600-2,500 words) and quotable lines. */
function rank(a: Accepted) {
  const read = !a.words ? 0 : a.words >= 600 && a.words <= 2500 ? 1.5 : a.words > 4000 ? -1.5 : 0;
  const quotable = a.quotable ? (a.quotable - 3) * 0.8 : 0;
  return Math.round((a.quality + read + quotable) * 10) / 10;
}

export function topicCounts(items: Signal[]) {
  const counts = Object.fromEntries(TOPICS.map((t) => [t, 0])) as Record<Topic, number>;
  for (const s of items) counts[s.topic]++;
  return counts;
}
