# abhisheklalwani.in

Portfolio + project hub. Turborepo monorepo, deployed on Vercel.

```
apps/web          Next.js 16 portfolio (abhisheklalwani.in)
packages/ui       Shared design tokens, <Orb /> loader, helpers — reused by every future app
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
