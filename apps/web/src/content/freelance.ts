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
  /** Full-page capture; width and height are the image's pixel size. */
  screenshot?: Photo & { width: number; height: number };
  work: { label: string; note: string }[];
};

const defaultWork = [
  { label: "Design", note: "Brand, layout, pages" },
  { label: "Build", note: "Fast, responsive, easy to edit" },
  { label: "Ongoing maintenance", note: "Updates, fixes, hosting" },
];

export const clients: Client[] = [
  {
    name: "Wealth Her Way",
    about: "Women × Money × Wealth. Owned by Pooja Surana, in partnership with Zenflow Finance.",
    url: "https://www.wealthherway.in/",
    screenshot: { src: "/freelance/wealth-her-way-full.jpg", alt: "The full Wealth Her Way homepage", width: 1200, height: 8192 },
    work: defaultWork,
  },
  {
    name: "The Artland",
    about: "India's hub for DIY kits and art parties: creative, all inclusive and perfect for kids, adults and gifting, with fast delivery nationwide.",
    url: "https://www.theartland.in/",
    screenshot: { src: "/freelance/the-artland-full.jpg", alt: "The full Artland homepage", width: 1200, height: 3545 },
    work: defaultWork,
  },
];
