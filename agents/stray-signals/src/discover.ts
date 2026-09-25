import { z } from "zod";
import { config } from "./config";
import { getJson } from "./lib/http";
import { generate } from "./lib/llm";
import { mapPool } from "./lib/pool";
import { TOPICS } from "./schema";
import { CATEGORIES } from "./seeds";
import { activeByTopic } from "./balance";
import type { Publication, PublicationPool } from "./state";

type SubstackPub = {
  id: number;
  name: string;
  subdomain: string;
  custom_domain?: string | null;
  custom_domain_optional?: boolean;
  hero_text?: string | null;
  language?: string | null;
};
type Recommendation = { description?: string | null; recommendedPublication?: SubstackPub };

type Found = { pub: SubstackPub; blurbs: string[]; inDegree: number; categoryRank: number | null; via: Set<string> };

const hostFor = (p: SubstackPub) =>
  p.custom_domain && !p.custom_domain_optional ? p.custom_domain.replace(/^https?:\/\//, "") : `${p.subdomain}.substack.com`;

const Screen = z.object({
  reason: z.string(),
  fits: z.boolean(),
  topics: z.array(z.enum(TOPICS)),
});

const SYSTEM = `You screen Substack publications for "Stray Signals", which recommends writing on philosophy, psychology and human nature, critical thinking, money and economics, science, deep space, nature, poetry, the craft of writing and reading, and big ideas or theories to curious generalists.
A publication fits only if its main subject is one of those topics AND it publishes original essays or poems (not news, not link digests, not podcasts, not writing-career or publishing-industry advice, not book-deal marketing).
It does NOT fit if it is mainly about technology, AI, software, startups, crypto, marketing, personal productivity, partisan politics, celebrity, astrology or lifestyle content.
It must be in English.`;

export type DiscoverStats = { sourcesCrawled: number; categoryPages: number; seen: number; screened: number; added: string[]; reserved: number; rejected: number };

/**
 * Finds new publications from two free signals, then screens them with the local model:
 *  1. one breadth-first hop across Substack's "recommended by" graph, starting from the
 *     pool's best-yielding publications — ranked by in-degree (how many of them recommend it);
 *  2. two pages of each topic category leaderboard, rotating deeper every week.
 */
export async function discover(pool: PublicationPool, now: string, weekNumber: number): Promise<DiscoverStats> {
  const stats: DiscoverStats = { sourcesCrawled: 0, categoryPages: 0, seen: 0, screened: 0, added: [], reserved: 0, rejected: 0 };
  const threeWeeksAgo = Date.now() - 21 * 86_400_000;

  const sources = Object.values(pool)
    .filter((p) => p.status === "active" && p.id && (!p.lastRecsCrawlAt || Date.parse(p.lastRecsCrawlAt) < threeWeeksAgo))
    .sort((a, b) => b.accepted - a.accepted || b.inDegree - a.inDegree)
    .slice(0, config.discoveryFanout);

  const found = new Map<string, Found>();
  const note = (p: SubstackPub, via: string, blurb?: string | null, categoryRank?: number) => {
    const host = hostFor(p);
    const known = pool[host];
    if (known) {
      if (via.startsWith("rec:")) known.inDegree++;
      return;
    }
    const f = found.get(host) ?? { pub: p, blurbs: [], inDegree: 0, categoryRank: null, via: new Set<string>() };
    if (via.startsWith("rec:")) f.inDegree++;
    if (categoryRank !== undefined) f.categoryRank = Math.min(f.categoryRank ?? Infinity, categoryRank);
    if (blurb) f.blurbs.push(blurb);
    f.via.add(via);
    found.set(host, f);
  };
  await mapPool(sources, config.fetchConcurrency, async (src) => {
    const recs = await getJson<Recommendation[]>(`https://${src.host}/api/v1/recommendations/from/${src.id}`);
    src.lastRecsCrawlAt = now;
    stats.sourcesCrawled++;
    for (const r of recs ?? []) if (r.recommendedPublication?.subdomain) note(r.recommendedPublication, `rec:${src.host}`, r.description);
  });

  // Spend leaderboard pages where topics are short of publications: 1 page if every topic
  // it covers is full, up to 4 when it covers the emptiest topics. Rotates deeper weekly.
  const counts = activeByTopic(pool);
  const need = (t: (typeof TOPICS)[number]) => Math.max(0, config.targetPubsPerTopic - counts[t]);
  const pages = CATEGORIES.flatMap((c) => {
    const gap = Math.max(...c.topics.map(need)) / config.targetPubsPerTopic;
    const n = 1 + Math.round(gap * 3);
    const first = (weekNumber % 5) * n;
    return Array.from({ length: n }, (_, k) => ({ c, page: first + k }));
  });
  await mapPool(pages, 2, async ({ c, page }) => {
    const res = await getJson<{ publications: SubstackPub[] }>(`https://substack.com/api/v1/category/public/${c.id}/all?page=${page}`);
    stats.categoryPages++;
    res?.publications.forEach((p, i) => p.subdomain && note(p, `cat:${c.name}`, null, page * 25 + i));
  });
  stats.seen = found.size;

  // Recommended by several good publications beats a high leaderboard rank.
  const score = (f: Found) => f.inDegree * 3 + (f.categoryRank === null ? 0 : Math.max(0, 2 - f.categoryRank / 125));
  const shortlist = [...found.entries()]
    .filter(([, f]) => !f.pub.language || f.pub.language.startsWith("en"))
    .sort((a, b) => score(b[1]) - score(a[1]))
    .slice(0, config.maxNewPublicationsPerRun);

  for (const [host, f] of shortlist) {
    const card = [
      `Name: ${f.pub.name}`,
      f.pub.hero_text ? `Tagline: ${f.pub.hero_text}` : null,
      ...f.blurbs.slice(0, 3).map((b) => `Recommended because: ${b}`),
    ]
      .filter(Boolean)
      .join("\n");
    let verdict: z.infer<typeof Screen>;
    try {
      ({ value: verdict } = await generate(Screen, SYSTEM, [{ role: "user", content: card }]));
    } catch {
      continue;
    }
    stats.screened++;
    // Balance the pool: a good fit for a topic that is already full waits in reserve.
    const fits = verdict.fits && verdict.topics.length > 0;
    const open = verdict.topics.find((t) => counts[t] < config.targetPubsPerTopic);
    const topics = open ? [open, ...verdict.topics.filter((t) => t !== open)] : verdict.topics;
    const pub: Publication = {
      host,
      name: f.pub.name,
      id: f.pub.id,
      description: (f.pub.hero_text ?? "").slice(0, 280),
      topics,
      source: f.inDegree > 0 ? "recommendation" : "category",
      status: !fits ? "rejected" : open ? "active" : "reserve",
      addedAt: now,
      inDegree: f.inDegree,
      accepted: 0,
      runsWithoutYield: 0,
      lastRecsCrawlAt: null,
      note: `${[...f.via].slice(0, 3).join(", ")} — ${verdict.reason}`.slice(0, 240),
    };
    pool[host] = pub;
    if (pub.status === "active") {
      stats.added.push(host);
      counts[topics[0]]++;
    } else if (pub.status === "reserve") stats.reserved++;
    else stats.rejected++;
  }
  return stats;
}
