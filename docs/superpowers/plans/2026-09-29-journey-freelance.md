# Journey and Freelance pages: finishing plan

Branch: `feature/journey-freelance`. Do not merge to `main` until the steps below are done.

**Status:** layouts built with placeholder content. `/journey` has both candidate layouts behind a draft
switch (`?layout=stack` = V2 rolling year and stacked cards, `?layout=ledger` = V4 wins and lessons).
`/freelance` is F1 (live device). Both pages are `noindex` and not linked from the nav or sitemap.

Mockups of all ten options: https://claude.ai/artifact/W51dhgAy9x1ejLm4ebMmnB

## Where things live
- Content: `apps/web/src/content/journey.ts` (chapters, lessons) and `apps/web/src/content/freelance.ts` (clients).
- Photos: `apps/web/public/journey/`, screenshots: `apps/web/public/freelance/` (full-page captures, ~1440px wide).
  Set `image: { src: "/journey/file.jpg", alt: "..." }` or `screenshot: {...}`; anything unset shows a tinted placeholder.
- Layouts: `apps/web/src/components/journey/` (stack-layout, ledger-layout, device-stage, photo, scroll-driver).
- Styles: bottom of `apps/web/src/app/globals.css`, section "Journey and freelance".

## Weekend steps
- [ ] Write real chapters, lessons and the optional `detail` (technical side) in `journey.ts`. Replace every "Placeholder".
- [ ] Add photos (landscape, at least 1600px wide; compress to < 400 KB each) and alt text.
- [x] Picked V2 (stacked cards). V4 and the draft switch are removed.
- [ ] Freelance: real client names, one-line descriptions, URLs, full-page screenshots. Confirm the second client can be named.
- [ ] Check both themes, a phone width, and reduced motion (macOS: Accessibility, Display, Reduce motion).
- [ ] Remove `robots: noindex` from both pages, add them to `sitemap.ts`, and add nav links in `components/ui/nav.tsx`.
- [ ] Run `npx tsc --noEmit -p apps/web` and `npx next build` in `apps/web`, then merge to `main`.
