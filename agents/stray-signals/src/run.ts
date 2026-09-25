/**
 * Stray Signals — weekly run.
 *
 *   npm run signals                    full run (discover → collect → curate → select → publish)
 *   npm run signals -- --dry-run       crawl only: no model calls, no files written
 *   npm run signals -- --limit 50      cap model calls this run (0 = rebuild the list only)
 *   npm run signals -- --no-discovery  skip the recommendation-graph crawl
 */
import { config } from "./config";
import { collect } from "./collect";
import { curate } from "./curate";
import { discover, type DiscoverStats } from "./discover";
import { assertModelReady } from "./lib/llm";
import { isoWeek, readJson, writeJson, writeText } from "./lib/store";
import type { SignalFile, SignalMeta } from "./schema";
import { SEEDS } from "./seeds";
import { activeByTopic } from "./balance";
import { select, topicCounts } from "./select";
import type { CurationCache, PublicationPool } from "./state";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const limitArg = process.argv.indexOf("--limit");
if (limitArg > 0) {
  const n = Number(process.argv[limitArg + 1]);
  // --limit 0 rebuilds the published list from the cache without calling the model.
  if (Number.isInteger(n) && n >= 0) (config as { maxNewCurations: number }).maxNewCurations = n;
}
const doDiscovery = config.discovery && !args.has("--no-discovery") && !dryRun;

const log = (msg: string) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);

async function main() {
  const started = Date.now();
  const now = new Date().toISOString();
  const week = isoWeek();
  log(`Stray Signals ${week} · model ${config.model}${dryRun ? " · DRY RUN" : ""}`);

  if (!dryRun) await assertModelReady();

  // 1. Pool: persisted publications + any new seeds.
  const pool = await readJson<PublicationPool>(config.paths.publications, {});
  for (const s of SEEDS) {
    if (pool[s.host]) pool[s.host].topics = s.topics; // seeds are the source of truth for their topics
    pool[s.host] ??= {
      host: s.host, name: s.host, id: null, description: "", topics: s.topics, source: "seed", status: "active",
      addedAt: now, inDegree: 0, accepted: 0, runsWithoutYield: 0, lastRecsCrawlAt: null,
    };
  }
  const cache = await readJson<CurationCache>(config.paths.curated, {});

  // 2. Collect: RSS (newest) + archive (most-liked) for every active publication.
  //    Runs before discovery so seeds learn their Substack ids (needed for recommendations).
  let active = Object.values(pool).filter((p) => p.status === "active");
  log(`Collecting from ${active.length} publications…`);
  let { candidates, updates } = await collect(active);
  for (const [host, u] of updates) Object.assign(pool[host], u);

  // 3. Discover: recommendation graph + category leaderboards, then collect from new finds.
  let disc: DiscoverStats | null = null;
  if (doDiscovery) {
    log("Discovering new publications…");
    disc = await discover(pool, now, Number(week.split("W")[1]));
    log(`  ${disc.sourcesCrawled} recommendation lists + ${disc.categoryPages} category pages → ${disc.seen} unseen hosts, screened ${disc.screened}, added ${disc.added.length}`);
    if (disc.added.length) {
      const extra = await collect(disc.added.map((h) => pool[h]));
      for (const [host, u] of extra.updates) Object.assign(pool[host], u);
      candidates = [...candidates, ...extra.candidates];
    }
    active = Object.values(pool).filter((p) => p.status === "active");
  }
  const fresh = candidates.filter((c) => !cache[c.url]);
  log(`  ${candidates.length} eligible posts, ${fresh.length} not yet judged`);

  // Refresh lastSeenAt for known posts so the cache keeps what is still live.
  for (const c of candidates) if (cache[c.url]) cache[c.url].lastSeenAt = now;

  if (dryRun) {
    const perPub = new Map<string, number>();
    for (const c of candidates) perPub.set(c.publication, (perPub.get(c.publication) ?? 0) + 1);
    log(`Dry run — per publication:\n${[...perPub].map(([p, n]) => `    ${String(n).padStart(3)}  ${p}`).join("\n")}`);
    const failing = [...updates].filter(([, u]) => (u.failStreak ?? 0) > 0).map(([h]) => h);
    if (failing.length) log(`  unreachable this run (will retry): ${failing.join(", ")}`);
    return;
  }

  // 4. Curate: judge unseen posts with the local model, verify quotes.
  log(`Curating up to ${Math.min(fresh.length, config.maxNewCurations)} posts with ${config.model}…`);
  const topicOf = new Map(Object.values(pool).map((p) => [p.host, p.topics[0] ?? "ideas"]));
  const cur = await curate(candidates, cache, now, topicOf);
  log(`  judged ${cur.judged}: accepted ${cur.accepted}, rejected ${cur.rejected}, quote retries ${cur.quoteRetries}, errors ${cur.errors}`);

  // 5. Pool upkeep: credit publications, prune the ones that never yield, expire old verdicts.
  const acceptedByHost = new Map<string, number>();
  for (const e of Object.values(cache)) if (e.ok) acceptedByHost.set(e.host, (acceptedByHost.get(e.host) ?? 0) + 1);
  for (const p of active) {
    if (p.status !== "active") continue;
    const n = acceptedByHost.get(p.host) ?? 0;
    p.runsWithoutYield = n > p.accepted ? 0 : p.runsWithoutYield + 1;
    p.accepted = n;
    if (p.accepted === 0 && p.runsWithoutYield >= config.pruneAfterRuns) {
      p.status = "rejected";
      p.note = `no accepted essays after ${p.runsWithoutYield} runs`;
    }
  }
  // Promote reserve publications into topics that now have room (e.g. after pruning).
  const room = activeByTopic(pool);
  for (const p of Object.values(pool)) {
    const t = p.topics[0];
    if (p.status === "reserve" && t && room[t] < config.targetPubsPerTopic) {
      p.status = "active";
      room[t]++;
    }
  }
  const ttl = Date.now() - config.cacheTtlDays * 86_400_000;
  for (const [url, e] of Object.entries(cache)) if (Date.parse(e.lastSeenAt) < ttl) delete cache[url];

  // 6. Select + publish.
  const items = select(cache, week);
  const file: SignalFile = { version: week, generatedAt: now, items };
  const meta: SignalMeta = {
    version: week,
    generatedAt: now,
    count: items.length,
    publications: new Set(items.map((i) => i.publication)).size,
    byTopic: topicCounts(items),
    candidatesReviewed: Object.keys(cache).length,
  };

  await writeJson(config.paths.publications, sortKeys(pool));
  await writeJson(config.paths.curated, sortKeys(cache));
  if (items.length) {
    await writeJson(config.paths.signals, file);
    await writeJson(config.paths.meta, meta);
  } else {
    log("  no items selected — keeping the previously published list");
  }

  const mins = ((Date.now() - started) / 60000).toFixed(1);
  const report = [
    `# Stray Signals — ${week}`,
    "",
    `- Model: \`${config.model}\` · ${mins} min`,
    `- Pool: ${active.length} active publications${disc ? ` (+${disc.added.length} discovered, ${disc.reserved} in reserve, ${disc.rejected} rejected)` : ""}`,
    `- Candidates: ${candidates.length} eligible, ${cur.judged} judged this run (${cur.accepted} accepted, ${cur.rejected} rejected, ${cur.errors} errors)`,
    `- Published: **${items.length}** essays from ${meta.publications} publications`,
    `- By topic: ${Object.entries(meta.byTopic).map(([t, n]) => `${t} ${n}`).join(" · ")}`,
    `- Active publications per topic (target ${config.targetPubsPerTopic}): ${Object.entries(activeByTopic(pool)).map(([t, n]) => `${t} ${n}`).join(" · ")}`,
    disc?.added.length ? `\nNew publications: ${disc.added.join(", ")}` : "",
    "",
  ].join("\n");
  await writeText(config.paths.report, report);
  log(`Done in ${mins} min — published ${items.length} signals.`);
}

const sortKeys = <T extends Record<string, unknown>>(o: T) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b))) as T;

main().catch((err) => {
  console.error(`✗ ${(err as Error).message}`);
  process.exit(1);
});
