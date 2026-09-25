/**
 * Data contracts shared by the agent (writer) and the website (reader).
 * Keep this file dependency-free: the web app imports it as types only.
 */

export const TOPICS = ["philosophy", "psychology", "thinking", "money", "science", "space", "ideas"] as const;
export type Topic = (typeof TOPICS)[number];

export const TOPIC_LABELS: Record<Topic, string> = {
  philosophy: "Philosophy",
  psychology: "Psychology & human nature",
  thinking: "Critical thinking",
  money: "Money & economics",
  science: "Science",
  space: "Deep space",
  ideas: "Ideas & theories",
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
