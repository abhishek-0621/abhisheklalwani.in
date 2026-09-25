import type { Topic } from "./schema";

/** A Substack publication in the crawl pool (data/publications.json). */
export type Publication = {
  host: string;
  name: string;
  /** Substack publication id — needed for the recommendations endpoint. */
  id: number | null;
  description: string;
  topics: Topic[];
  source: "seed" | "recommendation" | "category";
  /** reserve = a good fit for a topic that already has enough publications; reconsidered when it has room. */
  status: "active" | "reserve" | "rejected" | "dead";
  addedAt: string;
  /** How many other pool publications recommend this one (discovery signal). */
  inDegree: number;
  accepted: number;
  runsWithoutYield: number;
  /** Consecutive runs where the feed could not be fetched; dead after 3. */
  failStreak?: number;
  lastRecsCrawlAt: string | null;
  note?: string;
};

export type PublicationPool = Record<string, Publication>;

/** A post found during collection. Body HTML is only fetched when curation needs it. */
export type Candidate = {
  url: string;
  title: string;
  subtitle: string;
  host: string;
  publication: string;
  author: string | null;
  publishedAt: string | null;
  words: number;
  likes: number;
  source: "recent" | "top";
  slug: string | null;
  html: string | null;
};

/** Curator verdict for an accepted post. Rejections are stored compactly. */
export type Accepted = {
  ok: true;
  title: string;
  host: string;
  publication: string;
  author: string | null;
  publishedAt: string | null;
  likes: number;
  topic: Topic;
  /** Curator score, 4-20. */
  quality: number;
  quote: string;
  hook: string;
  reason: string;
  model: string;
  curatedAt: string;
  lastSeenAt: string;
};

export type Rejected = { ok: false; why: string; lastSeenAt: string };

/** data/curated.json — every post the model has judged, keyed by canonical URL. */
export type CurationCache = Record<string, Accepted | Rejected>;
