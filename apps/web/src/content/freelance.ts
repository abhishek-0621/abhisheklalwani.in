import type { Photo } from "./journey";

/**
 * The /freelance page. Screenshots go in apps/web/public/freelance/.
 * `screenshot` should be a FULL-PAGE capture (tall image); it scrolls inside the device frame.
 */
export type Client = {
  name: string;
  /** One line on who they are and what the site needed to do. */
  about: string;
  url?: string;
  screenshot?: Photo;
  work: { label: string; note: string }[];
};

const defaultWork = [
  { label: "Design", note: "Brand, layout, pages" },
  { label: "Build", note: "Fast, responsive, easy to edit" },
  { label: "Ongoing maintenance", note: "Updates, fixes, hosting" },
];

export const clients: Client[] = [
  { name: "Wealth Her Way", about: "Placeholder: one line on who they are and what the site does.", work: defaultWork },
  { name: "Second client", about: "Placeholder: one line on who they are and what the site does.", work: defaultWork },
];
