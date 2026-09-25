import { z } from "zod";
import { config } from "./config";
import { ensureBody } from "./collect";
import { generate } from "./lib/llm";
import { roundRobin } from "./balance";
import { mapPool } from "./lib/pool";
import { isVerbatim } from "./lib/text";
import { VERSE_TOPICS } from "./schema";
import type { Accepted, Candidate, CurationCache, Rejected } from "./state";

const SYSTEM = `You are the curator of "Stray Signals": a hidden corner of a personal website that hands each visitor one remarkable essay to read. Readers are curious generalists who want to leave with a new way of seeing something. Judge one Substack post and, if it deserves a place, pick the passage that makes a stranger want to read it.

Topics that belong:
- philosophy: ethics, meaning, how to live, friendship, death, free will, philosophy of mind
- psychology: psychology, human behaviour, human nature, emotions, relationships, motivation, why people do what they do
- thinking: critical thinking, reasoning, cognitive biases, rationality, weighing evidence, changing your mind, how to think clearly
- money: economics, finance, economic history, how markets and wealth actually work
- science: physics, chemistry, biology, medicine, evolution, how science is done
- space: astronomy, cosmology, planets, the search for life, exploration
- nature: the living world — animals, birds, plants, forests, oceans, seasons, ecology, being outdoors
- poetry: poems, and essays about reading a poem
- writing: the craft of writing and the pleasure of reading — style, stories, books, language
- ideas: big theories, history, thought experiments, unusual arguments about society or culture

Reject (set the flag) when:
- isTech: the subject is technology — AI, software, the internet, social media, apps, streaming platforms, gadgets, startups, crypto, the tech industry. A science or history essay that merely mentions computers is fine.
- isShallow: listicle, link roundup, news recap, product or company exposé, hot take, outrage, self-help platitudes, productivity advice, clickbait, promotion, fundraising, housekeeping.
- isPartisan: mainly about current politics — parties, elections, culture wars, or an ongoing war or geopolitical conflict. History of long-past events is fine.
- isTruncated: the text stops at a paywall or is only a preview.
- fitsTopics false: none of the topics above is the main subject.

Score four criteria from 1 to 5. Be strict and use the whole range; a typical competent blog post is 3 on each.
- originality: 5 = an idea the reader has almost certainly never met; 1 = conventional wisdom restated.
- depth: 5 = builds a careful argument with evidence and nuance; 1 = assertion without support.
- craft: 5 = memorable, precise, beautiful prose; 1 = clumsy or padded.
- timeless: 5 = will be as worth reading in ten years; 1 = only makes sense this week.

For a poem, read originality as freshness of image and voice, depth as emotional and imaginative depth, and craft as music, compression and form. Greeting-card verse, motivational lines and clichés are shallow.

The quote:
- For a poem: copy 2-6 consecutive lines EXACTLY, keeping the line breaks.
- For prose: copy 1-3 consecutive sentences EXACTLY as they appear in the text: same words, same order, no ellipses, no edits, no added quotation marks.
- 15 to 55 words, understandable on its own, in the author's own voice. Prefer the essay's most surprising claim or most beautiful line. Avoid lines that just cite a study, report a fact, or set up the topic.

The hook: at most 12 words, plain and specific, no hype, telling the reader what idea they will meet.

The topic label: pick the most specific one. Anything about stars, planets, galaxies, the universe or spaceflight is "space". Why people think, feel and behave as they do is "psychology". How to reason well, biases, evidence and rationality is "thinking". Physics, biology and medicine are "science". Economics, markets, banks and wealth are "money". Poems are "poetry". Birds, animals, plants, landscapes and ecology are "nature". Essays about writing, books and reading are "writing". Use "ideas" only when none of the others fits.`;

const Verdict = z.object({
  reason: z.string().describe("One sentence explaining the judgement"),
  // Specific topics first: small models drift toward whichever label they read last.
  topic: z.enum(["space", "nature", "poetry", "writing", "psychology", "thinking", "science", "money", "philosophy", "ideas"]),
  fitsTopics: z.boolean(),
  isTech: z.boolean(),
  isShallow: z.boolean(),
  isPartisan: z.boolean(),
  isTruncated: z.boolean(),
  originality: z.number().int().min(1).max(5),
  depth: z.number().int().min(1).max(5),
  craft: z.number().int().min(1).max(5),
  timeless: z.number().int().min(1).max(5),
  quote: z.string(),
  hook: z.string(),
});
type Verdict = z.infer<typeof Verdict>;

export type CurateStats = { judged: number; accepted: number; rejected: number; quoteRetries: number; errors: number };

/** `topicOf` maps each publication host to its primary topic, for balancing the queue. */
export async function curate(candidates: Candidate[], cache: CurationCache, now: string, topicOf: Map<string, string>): Promise<CurateStats> {
  const stats: CurateStats = { judged: 0, accepted: 0, rejected: 0, quoteRetries: 0, errors: 0 };

  // Balanced budget: rotate across topics, then across publications within a topic, most-liked
  // first — so a capped run judges every topic evenly, however lopsided the pool is.
  const byTopic = new Map<string, Map<string, Candidate[]>>();
  for (const c of candidates) {
    if (cache[c.url]) continue;
    const topic = topicOf.get(c.host) ?? "ideas";
    const hosts = byTopic.get(topic) ?? new Map<string, Candidate[]>();
    hosts.set(c.host, [...(hosts.get(c.host) ?? []), c]);
    byTopic.set(topic, hosts);
  }
  const perTopic = [...byTopic.values()].map((hosts) =>
    roundRobin([...hosts.values()].map((l) => l.sort((a, b) => b.likes - a.likes || (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")))),
  );
  const queue = roundRobin(perTopic).slice(0, config.maxNewCurations);

  let done = 0;
  await mapPool(queue, config.curateConcurrency, async (c) => {
    try {
      cache[c.url] = await judge(c, now, stats);
      stats.judged++;
      cache[c.url].ok ? stats.accepted++ : stats.rejected++;
    } catch (err) {
      stats.errors++;
      console.warn(`  ! ${c.url}: ${(err as Error).message}`);
    }
    if (++done % 25 === 0) console.log(`  curated ${done}/${queue.length} (accepted ${stats.accepted})`);
  });
  return stats;
}

async function judge(c: Candidate, now: string, stats: CurateStats): Promise<Accepted | Rejected> {
  const body = await ensureBody(c);
  if (!body) return reject("no public body", now);

  // Deterministic guard before spending a model call: small models under-flag these.
  const tech = density(body, TECH_TERMS);
  if (tech > 4) return reject(`tech density ${tech.toFixed(1)}/1k words`, now);
  const partisan = density(body, PARTISAN_TERMS);
  if (partisan > 4) return reject(`partisan density ${partisan.toFixed(1)}/1k words`, now);

  const excerpt = body.slice(0, config.excerptChars);
  const prompt = [
    `Publication: ${c.publication}`,
    `Title: ${c.title}`,
    c.subtitle ? `Subtitle: ${c.subtitle}` : null,
    `Length: ${c.words} words${c.likes ? `, ${c.likes} likes` : ""}`,
    "",
    "Text:",
    excerpt,
  ]
    .filter((l) => l !== null)
    .join("\n");

  let { value: v, transcript } = await generate(Verdict, SYSTEM, [{ role: "user", content: prompt }]);

  const eligible = (x: Verdict) => x.fitsTopics && !x.isTech && !x.isShallow && !x.isPartisan && !x.isTruncated && score(x) >= config.minScore;
  if (!eligible(v)) return reject(`s${score(v)} ${flags(v)}: ${v.reason}`.slice(0, 200), now);

  // Small models paraphrase. Give it one chance to copy exactly, then give up rather than invent.
  if (!isVerbatim(v.quote, excerpt)) {
    stats.quoteRetries++;
    ({ value: v } = await generate(Verdict, SYSTEM, [
      ...transcript,
      {
        role: "user",
        content:
          "That quote does not appear word-for-word in the text. Keep every other field the same, but replace the quote with 1-3 consecutive sentences copied character-for-character from the text.",
      },
    ]));
    if (!isVerbatim(v.quote, excerpt)) return reject("quote not verbatim after retry", now);
  }

  const quote = v.quote.trim().replace(/^["“]+|["”]+$/g, "");
  const words = quote.split(/\s+/).length;
  const verse = VERSE_TOPICS.includes(v.topic);
  if (words < (verse ? 6 : 12) || words > (verse ? 90 : 70)) return reject(`quote length ${words}`, now);

  return {
    ok: true,
    title: c.title,
    host: c.host,
    publication: c.publication,
    author: c.author,
    publishedAt: c.publishedAt,
    likes: c.likes,
    topic: v.topic,
    quality: score(v),
    quote,
    hook: v.hook.trim().slice(0, 120),
    reason: v.reason.slice(0, 240),
    model: config.model,
    curatedAt: now,
    lastSeenAt: now,
  };
}

const TECH_TERMS =
  /\b(AI|A\.I\.|artificial intelligence|LLMs?|large language models?|ChatGPT|GPT-?\d|OpenAI|chatbots?|machine learning|algorithms?|social media|Twitter|TikTok|Instagram|Facebook|YouTube|smartphones?|apps?|startups?|crypto\w*|bitcoin|blockchain|software|tech industry|Big Tech)\b/g;
const PARTISAN_TERMS =
  /\b(Trump|Biden|Harris|Obama|Putin|Netanyahu|Zelensky|Republicans?|Democrats?|GOP|MAGA|woke|left-wing|right-wing|liberals?|conservatives?|progressives?|culture war|elections?|Congress|Senate|Tories|Labour|Gaza|Hamas|Israel|Ukraine|Russia|genocide|ceasefire|airstrikes?)\b/g;

/** Matches per 1,000 words. */
const density = (text: string, re: RegExp) => ((text.match(re)?.length ?? 0) * 1000) / Math.max(1, text.split(/\s+/).length);

/** Sum of the four criteria: 4-20. */
const score = (v: Verdict) => v.originality + v.depth + v.craft + v.timeless;

const flags = (v: Verdict) =>
  [!v.fitsTopics && "off-topic", v.isTech && "tech", v.isShallow && "shallow", v.isPartisan && "partisan", v.isTruncated && "truncated"]
    .filter(Boolean)
    .join(",") || "below-bar";

const reject = (why: string, now: string): Rejected => ({ ok: false, why, lastSeenAt: now });
