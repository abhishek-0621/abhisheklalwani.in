/**
 * Data contracts shared by the agent (writer) and the website (reader).
 * Keep this file dependency-free: the web app imports it as types only.
 */

export const TOPICS = ["philosophy", "psychology", "thinking", "money", "science", "space", "nature", "poetry", "writing", "ideas"] as const;

/** Short-form topics: poems are judged, quoted and filtered differently from essays. */
export const VERSE_TOPICS: readonly Topic[] = ["poetry"];
export type Topic = (typeof TOPICS)[number];

export const TOPIC_LABELS: Record<Topic, string> = {
  philosophy: "Philosophy",
  psychology: "Psychology & human nature",
  thinking: "Critical thinking",
  money: "Money & economics",
  science: "Science",
  space: "Deep space",
  nature: "Nature",
  poetry: "Poetry",
  writing: "Writing & reading",
  ideas: "Ideas & theories",
};

/**
 * Editorial tilt, shared by the agent and the site. Thoughts outside work first: more
 * philosophy, psychology and clear thinking, less science. The agent uses these to size
 * publication targets and its judging budget; the site uses them to choose which topic
 * each catch comes from, so the balance holds however large the library grows.
 */
export const TOPIC_WEIGHTS: Record<Topic, number> = {
  philosophy: 1.3,
  psychology: 1.3,
  thinking: 1.2,
  ideas: 1.1,
  nature: 1.0,
  poetry: 1.0,
  writing: 1.0,
  money: 0.9,
  space: 0.8,
  science: 0.5,
};

/** Chip labels for the "retune" picker. */
export const TOPIC_SHORT: Record<Topic, string> = {
  philosophy: "Philosophy",
  psychology: "Psychology",
  thinking: "Clear thinking",
  money: "Money",
  science: "Science",
  space: "Deep space",
  nature: "Nature",
  poetry: "Poetry",
  writing: "Writing",
  ideas: "Big ideas",
};

/** One published essay in the weekly rotation. */
export type Signal = {
  /** Stable 10-char hash of the canonical URL. */
  id: string;
  url: string;
  title: string;
  publication: string;
  author: string | null;
  topic: Topic;
  /** Verbatim excerpt from the essay — verified against the source text. */
  quote: string;
  /** One-line teaser written by the curator. */
  hook: string;
  publishedAt: string | null;
  /** Ranking hint (about 4-25): quality, plus bonuses for five-minute reads and memorable quotes. */
  score?: number;
};

/** The file the website serves from: apps/web/src/content/signals.json */
export type SignalFile = {
  /** ISO week the list was generated for, e.g. "2026-W39". Also namespaces the rotation counter. */
  version: string;
  generatedAt: string;
  items: Signal[];
};

/** Small summary the portfolio renders without loading the full list. */
export type SignalMeta = {
  version: string;
  generatedAt: string;
  count: number;
  publications: number;
  byTopic: Record<Topic, number>;
  candidatesReviewed: number;
};
