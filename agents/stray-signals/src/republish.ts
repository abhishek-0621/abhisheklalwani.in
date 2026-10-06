/**
 * Rebuild the published list from the verdict cache alone: no crawling, no model calls.
 * Use after editing blocklist.ts or retiring a topic. Keeps the current week's version label.
 *
 *   npm run signals:republish
 */
import { config } from "./config";
import { readJson, writeJson } from "./lib/store";
import type { SignalFile, SignalMeta } from "./schema";
import { publishAll, topicCounts } from "./select";
import type { CurationCache, PublicationPool } from "./state";

const sortKeys = <T extends Record<string, unknown>>(o: T) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b))) as T;

async function main() {
  const pool = await readJson<PublicationPool>(config.paths.publications, {});
  const cache = await readJson<CurationCache>(config.paths.curated, {});
  const previous = await readJson<SignalFile | null>(config.paths.signals, null);

  const items = publishAll(cache);
  const now = new Date().toISOString();
  const version = previous?.version ?? "manual";
  const meta: SignalMeta = {
    version,
    generatedAt: now,
    count: items.length,
    publications: new Set(items.map((i) => i.publication)).size,
    byTopic: topicCounts(items),
    candidatesReviewed: Object.keys(cache).length,
  };

  await writeJson(config.paths.publications, sortKeys(pool));
  await writeJson(config.paths.signals, { version, generatedAt: now, items } satisfies SignalFile);
  await writeJson(config.paths.meta, meta);
  console.log(`Republished ${items.length} signals (was ${previous?.items.length ?? 0}).`);
  console.log(`By topic: ${Object.entries(meta.byTopic).map(([t, n]) => `${t} ${n}`).join(" · ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
