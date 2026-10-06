/**
 * Owner removals. Anything here is never collected again and never published, even if an
 * old verdict accepted it. Verdicts themselves stay in the cache as history.
 */

/** Whole publications: science-only, medicine and physics-news newsletters. */
export const BLOCKED_HOSTS = new Set([
  "erictopol.substack.com", // Ground Truths
  "yourlocalepidemiologist.substack.com",
  "stuartritchie.substack.com", // Science Fictions
  "thephysicsjournal.substack.com",
  "www.thequantumcat.space",
  "davideagleman.substack.com",
  "seantrott.substack.com",
  "www.theseedsofscience.pub",
  "seedsofscience.substack.com",
  "thisisyourbrainon.substack.com",
]);

/** Publication names, for hosts whose exact address isn't known in advance. */
export const BLOCKED_PUBLICATIONS = new Set([
  "Ground Truths",
  "Your Local Epidemiologist",
  "Science Fictions",
  "The Physics Journal",
  "The Quantum Cat",
  "Seeds of Science",
  "This is Your Brain On",
]);

/** Single essays: current politics or tech that slipped past the curator. Matched on title. */
export const BLOCKED_TITLES = new Set([
  "Chartbook #184 - Nostalgia for decline in deconvergent Britain",
  "What’s so bad about critical race theory?",
  "Why and how political ideas matter",
  "Rage of the Falling Elite",
  "Luxury Beliefs are Status Symbols",
  "King Ludd",
]);

/** Chartbook 429's title is long and may be truncated; match its prefix. */
const BLOCKED_TITLE_PREFIXES = ["Chartbook 429 From transition to rupture"];

export function isBlocked(e: { host?: string; publication?: string; title?: string }) {
  if (e.host && BLOCKED_HOSTS.has(e.host)) return true;
  if (e.publication && BLOCKED_PUBLICATIONS.has(e.publication)) return true;
  if (e.title && (BLOCKED_TITLES.has(e.title) || BLOCKED_TITLE_PREFIXES.some((p) => e.title!.startsWith(p)))) return true;
  return false;
}
