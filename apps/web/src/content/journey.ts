/**
 * The /journey page. Edit this file to change the story; the layouts read everything from here.
 * Long-form drafts live in docs/journey/writeups.md.
 *
 * Photos: drop files into apps/web/public/journey/ and set `image: { src: "/journey/<file>.jpg", alt }`.
 * Anything without an image shows a tinted placeholder, so chapters can go in before photos do.
 */

export type ChapterKind = "Start" | "Win" | "Award" | "Milestone" | "Trip" | "Turn" | "Now";

export type Photo = {
  /** Path under /public, e.g. "/journey/2020-sih-team-psycool.jpg". */
  src?: string;
  /** Describe the photo for screen readers. Required once src is set. */
  alt?: string;
};

export type Chapter = {
  year: string;
  kind: ChapterKind;
  title: string;
  note: string;
  /** Optional "behind the scenes" line: the technical side. */
  detail?: string;
  /** Optional pull quote in your own words. */
  quote?: string;
  image?: Photo;
};

const img = (file: string, alt: string): Photo => ({ src: `/journey/${file}`, alt });

/** Chronological, oldest first. */
export const chapters: Chapter[] = [
  {
    year: "2018", kind: "Start", title: "Day one at MMCOE",
    note: "It started in school, making little games in Scratch. That curiosity walked me into MMCOE, Pune, for IT with Honors in Data Science.",
    image: img("2018-mmcoe-batch.jpg", "The MMCOE class group on the steps of a glass building during a college visit"),
  },
  {
    year: "2020", kind: "Win", title: "Smart India Hackathon finalist",
    note: "Team Psycool, six of us, reached the Grand Finale with an Android app that suggests careers to school students from their aptitude and personality.",
    detail: "We visited schools to run aptitude and psychometric tests ourselves, and mapped traits to careers with professional counsellors.",
    image: img("2020-sih-team-selfie.jpg", "Team Psycool and their mentor smiling in a selfie in the college lab"),
  },
  {
    year: "2022", kind: "Start", title: "Dassault Systèmes Solutions Lab",
    note: "Straight out of college into R&D, building web components for a simulation platform. First lesson: in an enterprise, every process keeps you two steps ahead, so do it right.",
    detail: "Lit, Polymer, TypeScript and Redux.",
    image: img("2022-dassault-team.jpg", "The team standing on red steps in front of the glass Dassault Systèmes building in Pune"),
  },
  {
    year: "2022", kind: "Trip", title: "Pondicherry, solo",
    note: "My first solo trip, and my first ever scuba dive.",
    quote: "Some fears can only be conquered by diving straight into them.",
    image: img("2022-pondicherry-dive.jpg", "Underwater in scuba gear, making the OK sign"),
  },
  {
    year: "2023", kind: "Award", title: "Star Alumni, Spoken Tutorial",
    note: "IIT Bombay's Spoken Tutorial programme named me a Star Alumni from MMCOE's 2021-22 batch, presented at VMCC, IIT Bombay.",
    image: img("2023-iit-bombay-spoken-tutorial.jpg", "Receiving a framed certificate on stage at the Spoken Tutorial awards, IIT Bombay"),
  },
  {
    year: "2023", kind: "Award", title: "Genius Award",
    note: "For work on Process Composer and Performance Study: better monitoring and debugging for simulation jobs, and one-click navigation to errors.",
    image: img("2023-genius-award.jpg", "Receiving the Genius Award in front of a screen describing the contribution"),
  },
  {
    year: "2024", kind: "Trip", title: "Bir Billing, paragliding",
    note: "A few thousand metres up, and then nothing below my feet. Hell of an experience.",
    quote: "Up in the sky, I realized how small I am in this vast universe, and how beautiful it is to simply be a part of it.",
    image: img("2024-bir-paragliding.jpg", "Tandem paragliding high above forested hills at Bir Billing"),
  },
  {
    year: "2024", kind: "Award", title: "Applause Annual Award",
    note: "Our team shipped 100+ features to make simulation inclusive and accessible to non-experts.",
    detail: "A team that challenges ideas, not people, ships better work.",
    image: img("2024-applause-award.jpg", "The team at the Dassault Systèmes 2024-2025 award ceremony in Pune"),
  },
  {
    year: "2026", kind: "Win", title: "GraphMind",
    note: "My thesis became a platform: documents, code or audio in, a knowledge graph out. It runs from my own Mac.",
    image: img("2026-graphmind-graph.jpg", "GraphMind showing a knowledge graph of 296 nodes and 446 edges built from a drug label"),
  },
  {
    year: "2026", kind: "Milestone", title: "M.Tech, done",
    note: "Career and degree, side by side.",
    quote: "Turns out, you can build a career and earn a degree along the way, but you also have to make sure you don't lose yourself in the process.",
  },
];

export const isHighlight = (k: ChapterKind) => k === "Win" || k === "Award";
