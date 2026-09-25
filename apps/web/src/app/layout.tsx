import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { SceneRoot } from "@/components/scene/scene-root";
import { Footer } from "@/components/sections/footer";
import { bootScript, Intro } from "@/components/ui/intro";
import { Nav } from "@/components/ui/nav";
import { RevealObserver } from "@/components/ui/reveal-observer";
import { site } from "@/content/site";
import "./globals.css";

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: site.url, siteName: site.name, title: `${site.name} — ${site.role}`, description: site.description },
  twitter: { card: "summary_large_image", title: `${site.name} — ${site.role}`, description: site.description },
};

export const viewport: Viewport = { themeColor: "#0a0a0a", colorScheme: "dark", viewportFit: "cover" };

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  address: { "@type": "PostalAddress", addressLocality: "Pune", addressCountry: "IN" },
  worksFor: { "@type": "Organization", name: "Dassault Systèmes" },
  sameAs: [site.links.github, site.links.linkedin],
  email: `mailto:${site.email}`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${GeistSans.variable} ${GeistMono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body>
        <Intro />
        <SceneRoot />
        <div className="grain" aria-hidden />
        <Nav />
        <main className="relative z-10">{children}</main>
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
