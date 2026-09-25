import { createHash } from "node:crypto";

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–",
  hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", shy: "",
};

export function decodeEntities(s: string) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? Number.parseInt(e.slice(2), 16) : Number.parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Substack HTML → readable paragraphs. Drops captions, buttons, subscribe widgets and footnote markers. */
export function htmlToText(html: string) {
  const cleaned = html
    .replace(/<(script|style|figure|figcaption|button|form|svg|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<div class="(subscription-widget|captioned-button|button-wrapper|footnote)[\s\S]*?<\/div>/gi, " ")
    .replace(/<a [^>]*class="footnote-anchor[^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/<\/(p|h[1-6]|li|blockquote|pre)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(cleaned)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0 && !/^(subscribe|share|leave a comment|thanks for reading)/i.test(p))
    .join("\n\n");
}

export const wordCount = (s: string) => (s.match(/\S+/g) ?? []).length;

/** Canonical comparison form: straight quotes, plain dashes, collapsed whitespace. */
export function normalizeForMatch(s: string) {
  return s
    .normalize("NFKC")
    .replace(/[‘’‚‛′]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/[–—―]/g, "-")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** True when `quote` appears verbatim (modulo typography) in `source`. */
export function isVerbatim(quote: string, source: string) {
  const q = normalizeForMatch(quote).replace(/^["']+|["']+$/g, "");
  return q.length >= 20 && normalizeForMatch(source).includes(q);
}

export const hashId = (s: string) => createHash("sha256").update(s).digest("base64url").slice(0, 10);

export function canonicalUrl(url: string) {
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

export const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
};
