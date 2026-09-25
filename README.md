# abhisheklalwani.in

Portfolio + project hub. Turborepo monorepo, deployed on Vercel.

```
apps/web                 Next.js 16 portfolio (abhisheklalwani.in)
packages/ui              Shared design tokens, <Orb /> loader, helpers — reused by every future app
agents/stray-signals     Weekly local-LLM agent behind the "stray signal" easter egg
```

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
```

## Add a project

1. Append an entry to `apps/web/src/content/projects.ts` (set `featured: true` to show it on the home page).
2. Write the case study in `apps/web/src/content/work/<slug>.mdx`. `<Architecture />` and `<Callout>` are available.
3. Card, `/work/<slug>`, sitemap and metadata are generated automatically.

A project with a live app gets its own Vercel project on a subdomain (`<slug>.abhisheklalwani.in`) and sets `demo` in the registry. New front-ends can live in `apps/<slug>` and import `@al/ui` for the same look.

## Design system

- Tokens: `packages/ui/src/tokens.css` — change `--color-accent` once, it flows to CSS, Tailwind and the WebGL scene.
- Loading states: `<Orb />` / `<OrbFallback />` from `@al/ui/orb` only (thinking-orbs).
- Sections bind to a particle scene via `<Section scene={0-4}>`: 0 graph · 1 clusters · 2 layers · 3 pipeline · 4 orb.
- Scroll reveals: add `className="reveal"` and `style={stagger(i)}`.

## Stray Signals (easter egg + agent)

A small signal peeks in from a screen edge now and then; clicking it reveals a quote and a link to one essay. Each visitor gets a different essay; none repeats until the week's list (up to 500) is used up.

**Agent** — `agents/stray-signals`, runs on this Mac with Ollama (`phi4:14b` by default):

```bash
npm run signals -- --dry-run      # crawl only, no model calls, nothing written
npm run signals -- --limit 50     # judge at most 50 new essays
npm run signals -- --limit 0      # rebuild the published list from the cache
npm run signals                   # full weekly run (first run ~2h, later runs ~30-45 min)
npm run signals:install           # schedule it: Mondays 09:00 via launchd, then commit + push
npm run signals:uninstall
```

Pipeline: collect (RSS + most-liked archive) → discover (Substack recommendation graph + category leaderboards, screened by the model) → term-density guards (tech / politics) → curate (4-criteria rubric, topic, quote) → verbatim quote check → select (caps per publication and topic) → write `apps/web/src/content/signals.json`.
State lives in `agents/stray-signals/data/` (publication pool, verdict cache, last-run report). Env knobs: `STRAY_SIGNALS_MODEL`, `STRAY_SIGNALS_MAX_NEW`, `STRAY_SIGNALS_MIN_SCORE`, `STRAY_SIGNALS_TARGET`.

**Serving** — `GET /api/signal?s=<seed>&n=<count>` is stateless: each visitor's browser keeps a random seed and a catch counter in localStorage, and the server returns position n of that visitor's seeded shuffle. No repeats per visitor until the list is exhausted; no database needed. The footer's "Catch a stray signal" opens it on demand.

Add `?signal` to any URL to make the signal peek immediately.

## Deploy (Vercel + GoDaddy)

1. Push this repo to GitHub, then **Vercel → Add New Project → import it**. Set **Root Directory = `apps/web`** (framework auto-detects Next.js).
2. **Vercel → Project → Settings → Domains**: add `abhisheklalwani.in` and `www.abhisheklalwani.in`.
3. **GoDaddy → My Products → DNS** for the domain — use the exact values Vercel shows, typically:

   | Type  | Name | Value                  |
   |-------|------|------------------------|
   | A     | @    | `76.76.21.21`          |
   | CNAME | www  | `cname.vercel-dns.com` |

   Remove GoDaddy's default `A @` parked record and any "Forwarding" rule first. Propagation is usually minutes, up to 48h.
4. Future subdomain apps: add the domain in that Vercel project and a `CNAME <slug> → cname.vercel-dns.com` record.
