/**
 * The /journey page. Edit this file to change the story; the layouts read everything from here.
 *
 * Photos: drop files into apps/web/public/journey/ and set `image: "/journey/<file>.jpg"`.
 * Anything without an image shows a tinted placeholder, so chapters can go in before photos do.
 */

export type ChapterKind = "Start" | "Win" | "Award" | "Milestone" | "Lesson" | "Turn";

export type Photo = {
  /** Path under /public, e.g. "/journey/sih-2020.jpg". */
  src?: string;
  /** Describe the photo for screen readers. Required once src is set. */
  alt?: string;
};

export type Chapter = {
  year: string;
  kind: ChapterKind;
  title: string;
  note: string;
  /** Optional longer detail: the technical side, what you built or used. */
  detail?: string;
  image?: Photo;
};

/** Chronological, oldest first. Used by the stacked-cards layout, and its wins feed the ledger. */
export const chapters: Chapter[] = [
  { year: "2018", kind: "Start", title: "B.Tech in Information Technology begins", note: "Savitribai Phule Pune University, Pune." },
  { year: "2020", kind: "Win", title: "Smart India Hackathon finalist", note: "An AI career recommender, built with the team." },
  { year: "2021", kind: "Lesson", title: "A setback worth telling", note: "Placeholder: what went wrong, and what you did differently after." },
  { year: "2022", kind: "Milestone", title: "Paper in IJCA, then Dassault Systèmes", note: "NGO revenue forecasting research. Joined as a software engineer." },
  { year: "2023", kind: "Award", title: "Genius Award", note: "Recognised for individual excellence." },
  { year: "2024", kind: "Award", title: "M.Tech at BITS Pilani, Applause Annual Award", note: "AI and ML study alongside full-time work." },
  { year: "2025", kind: "Turn", title: "From web components to generative AI", note: "Assistants, agents and retrieval at Dassault Systèmes." },
  { year: "2026", kind: "Win", title: "GraphMind ships", note: "The thesis became a platform: documents in, knowledge graph out." },
];

/** Right-hand column of the ledger layout. Chronological, oldest first. */
export const lessons: Pick<Chapter, "year" | "title" | "note">[] = [
  { year: "2019", title: "A lesson from college", note: "Placeholder: your words here." },
  { year: "2021", title: "A setback worth telling", note: "Placeholder: what went wrong, what changed after." },
  { year: "2023", title: "A call you would make differently", note: "Placeholder: your words here." },
  { year: "2025", title: "What moving to AI taught you", note: "Placeholder: your words here." },
];

/** Ledger wins: every chapter that is a win, award or milestone. */
export const wins = chapters.filter((c) => c.kind === "Win" || c.kind === "Award" || c.kind === "Milestone");

export const isHighlight = (k: ChapterKind) => k === "Win" || k === "Award";
