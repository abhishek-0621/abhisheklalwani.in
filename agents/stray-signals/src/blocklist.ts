/**
 * Owner removals of single essays. Publications are never blocked: a writer can cover many
 * subjects, and off-topic essays (science, space, tech, politics) are already filtered one by
 * one by the curator and by the topic list. Verdicts stay in the cache as history.
 */

/** Single essays: current politics or tech that slipped past the curator. Matched on title. */
export const BLOCKED_TITLES = new Set([
  "Chartbook #184 - Nostalgia for decline in deconvergent Britain",
  "What’s so bad about critical race theory?",
  "Why and how political ideas matter",
  "Rage of the Falling Elite",
  "Luxury Beliefs are Status Symbols",
  "King Ludd",
  "When “DEI” research is cut, what happens to community health?",
]);

/** Chartbook 429's title is long and may be truncated; match its prefix. */
const BLOCKED_TITLE_PREFIXES = ["Chartbook 429 From transition to rupture"];

export function isBlocked(e: { title?: string }) {
  if (e.title && (BLOCKED_TITLES.has(e.title) || BLOCKED_TITLE_PREFIXES.some((p) => e.title!.startsWith(p)))) return true;
  return false;
}
