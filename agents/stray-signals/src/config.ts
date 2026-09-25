import path from "node:path";
import { TOPIC_WEIGHTS } from "./schema";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, "..");
const repoRoot = path.resolve(pkgRoot, "../..");

const int = (name: string, fallback: number) => {
  const v = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

export const config = {
  /**
   * Local Ollama model. Benchmarked on 30 posts: phi4:14b labels topics correctly and flags
   * partisan pieces (~11s/post on an M5 Pro); gemma4:e4b-mlx is 3x faster but labels almost
   * everything "ideas" with flat scores.
   */
  model: process.env.STRAY_SIGNALS_MODEL ?? "phi4:14b",
  ollamaHost: process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434",

  /** Minimum curator score (originality + depth + craft + timelessness, 4-20) to be eligible. */
  minScore: int("STRAY_SIGNALS_MIN_SCORE", 16),

  /** Posts pulled per publication: newest from RSS + most-liked from the archive. */
  recentPerFeed: 15,
  topPerFeed: 12,
  minWords: 700,
  /** Poetry publications: a poem only needs enough lines to judge. */
  minWordsVerse: 60,
  /** Characters of body text sent to the curator (~2k tokens). */
  excerptChars: 9000,

  /** Cap on model calls per run — bounds how long the weekly job keeps the Mac busy. */
  maxNewCurations: int("STRAY_SIGNALS_MAX_NEW", 700),
  /** Ollama serves one request at a time by default; 2 overlaps body fetching with generation. */
  curateConcurrency: int("STRAY_SIGNALS_CONCURRENCY", 2),
  fetchConcurrency: 4,

  /** Discovery crawls Substack's "recommended by" graph outward from publications that already yield good essays. */
  discovery: process.env.STRAY_SIGNALS_DISCOVERY !== "0",
  discoveryFanout: 12,
  maxNewPublicationsPerRun: int("STRAY_SIGNALS_MAX_NEW_PUBS", 40),
  /** Balance: aim for this many active publications per topic (scaled by topic weight). */
  targetPubsPerTopic: int("STRAY_SIGNALS_PUBS_PER_TOPIC", 12),

  /** Editorial tilt (see TOPIC_WEIGHTS in schema.ts, shared with the site). */
  topicWeights: TOPIC_WEIGHTS,



  /** Drop a publication after this many runs with nothing accepted. */
  pruneAfterRuns: 4,

  userAgent: "StraySignalsBot/1.0 (+https://abhisheklalwani.in/work/stray-signals)",

  paths: {
    publications: path.join(pkgRoot, "data/publications.json"),
    curated: path.join(pkgRoot, "data/curated.json"),
    report: path.join(pkgRoot, "data/last-run.md"),
    signals: path.join(repoRoot, "apps/web/src/content/signals.json"),
    meta: path.join(repoRoot, "apps/web/src/content/signals-meta.json"),
  },
} as const;
