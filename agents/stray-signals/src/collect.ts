import { XMLParser } from "fast-xml-parser";
import { config } from "./config";
import { getJson, getText } from "./lib/http";
import { mapPool } from "./lib/pool";
import { canonicalUrl, decodeEntities, htmlToText, wordCount } from "./lib/text";
import { VERSE_TOPICS } from "./schema";
import type { Candidate, Publication } from "./state";

type ArchivePost = {
  title: string;
  subtitle?: string | null;
  canonical_url: string;
  slug: string;
  post_date: string | null;
  audience: string;
  type: string;
  wordcount?: number;
  reaction_count?: number;
  publication_id?: number;
  publishedBylines?: { name: string }[];
};

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  "dc:creator"?: string;
  "content:encoded"?: string;
};

const xml = new XMLParser({ ignoreAttributes: true, cdataPropName: false, processEntities: false });

/** Titles that are never essays: housekeeping, link dumps, audio, promos. Also obvious tech. */
const SKIP_TITLE =
  /\b(open thread|links? for|link roundup|roundup|weekly (digest|links)|mailbag|q\s?&\s?a|ama|podcast|episode|transcript|giveaway|announcement|housekeeping|subscriber|discount|sale|meetups?|hiring|job board|chat|live stream|livestream|AI|A\.I\.|GPT|LLMs?|ChatGPT|OpenAI|startups?|crypto|bitcoin|blockchain|SaaS|software|coding|programming)\b/i;

export type CollectResult = {
  candidates: Candidate[];
  /** Publication metadata learned while crawling (id, name, liveness). */
  updates: Map<string, Partial<Publication>>;
};

export async function collect(pubs: Publication[]): Promise<CollectResult> {
  const updates = new Map<string, Partial<Publication>>();
  const results = await mapPool(pubs, config.fetchConcurrency, (p) => collectOne(p, updates));
  const byUrl = new Map<string, Candidate>();
  for (const r of results) if (r.ok) for (const c of r.value) if (!byUrl.has(c.url)) byUrl.set(c.url, c);
  return { candidates: [...byUrl.values()], updates };
}

async function collectOne(pub: Publication, updates: Map<string, Partial<Publication>>): Promise<Candidate[]> {
  const base = `https://${pub.host}`;
  const [rss, top] = await Promise.all([
    getText(`${base}/feed`, "application/rss+xml").catch(() => null),
    getJson<ArchivePost[]>(`${base}/api/v1/archive?sort=top&offset=0&limit=${config.topPerFeed}`).catch(() => null),
  ]);

  if (!rss && !Array.isArray(top)) {
    // Often just rate limiting: only give up after three failed runs in a row.
    const failStreak = (pub.failStreak ?? 0) + 1;
    updates.set(pub.host, failStreak >= 3 ? { status: "dead", failStreak, note: "unreachable for 3 runs" } : { failStreak });
    return [];
  }

  const out: Candidate[] = [];
  let pubName = pub.name;

  if (rss) {
    const doc = xml.parse(rss)?.rss?.channel;
    if (doc?.title) pubName = decodeEntities(String(doc.title));
    const items: RssItem[] = Array.isArray(doc?.item) ? doc.item : doc?.item ? [doc.item] : [];
    for (const it of items.slice(0, config.recentPerFeed)) {
      if (!it.link || !it.title) continue;
      const html = it["content:encoded"] ?? "";
      const words = wordCount(htmlToText(html));
      out.push({
        url: canonicalUrl(it.link),
        title: decodeEntities(String(it.title)),
        subtitle: "",
        host: pub.host,
        publication: pubName,
        author: it["dc:creator"] ? decodeEntities(String(it["dc:creator"])) : null,
        publishedAt: it.pubDate ? new Date(it.pubDate).toISOString() : null,
        words,
        likes: 0,
        source: "recent",
        slug: null,
        html,
      });
    }
  }

  if (Array.isArray(top)) {
    const id = top.find((p) => p.publication_id)?.publication_id ?? null;
    if (id) updates.set(pub.host, { id, name: pubName });
    for (const p of top) {
      if (p.audience !== "everyone" || p.type !== "newsletter") continue;
      const url = canonicalUrl(p.canonical_url);
      const existing = out.find((c) => c.url === url);
      if (existing) {
        existing.likes = p.reaction_count ?? 0;
        existing.subtitle = p.subtitle ?? "";
        continue;
      }
      out.push({
        url,
        title: p.title,
        subtitle: p.subtitle ?? "",
        host: pub.host,
        publication: pubName,
        author: p.publishedBylines?.[0]?.name ?? null,
        publishedAt: p.post_date,
        words: p.wordcount ?? 0,
        likes: p.reaction_count ?? 0,
        source: "top",
        slug: p.slug,
        html: null,
      });
    }
  }

  updates.set(pub.host, { ...updates.get(pub.host), name: pubName, failStreak: 0 });
  // Poems are short: verse publications only need enough text to judge.
  const minWords = pub.topics.some((t) => VERSE_TOPICS.includes(t)) ? config.minWordsVerse : config.minWords;
  return out.filter((c) => c.words >= minWords && !SKIP_TITLE.test(c.title));
}

/** Lazily fetches the full body for archive posts right before curation. */
export async function ensureBody(c: Candidate): Promise<string | null> {
  if (c.html) return htmlToText(c.html);
  if (!c.slug) return null;
  const post = await getJson<{ body_html?: string | null; audience?: string }>(`https://${c.host}/api/v1/posts/${c.slug}`);
  if (!post?.body_html || post.audience !== "everyone") return null;
  c.html = post.body_html;
  return htmlToText(post.body_html);
}
