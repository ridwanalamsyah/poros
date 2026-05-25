# POROS Magazine

Indonesian longform magazine — labor, society, culture. Based in Bandung.

Stack: React + Vite (frontend) + Sanity v3 (CMS) + DOKU (payments).

## Live

- Site: https://longform-magazine-app-sl0fz2g3.devinapps.com
- Studio: https://magazine-features-app-xuyjb9e4.devinapps.com

## Repo layout

```
poros/
├── web/        React + Vite frontend
└── studio/     Sanity v3 Studio
```

## Local dev

### Frontend

```bash
cd web
npm install
cp .env.production .env   # see VITE_* keys below
npm run dev               # http://localhost:5173
npm run build             # outputs web/dist
```

### Studio

```bash
cd studio
npm install
# .env file with SANITY_STUDIO_PROJECT_ID + SANITY_STUDIO_DATASET
npx sanity dev            # http://localhost:3333
npx sanity build          # outputs studio/dist
```

## Environment variables

### web/.env (or .env.production)

```
VITE_SANITY_PROJECT_ID=lyo17dt8
VITE_SANITY_DATASET=production
VITE_SANITY_WRITE_TOKEN=...           # optional: enables submit-pitch / letters to save into Studio inbox
VITE_SITE_URL=https://porosmagazine.id
VITE_BUTTONDOWN_USERNAME=...          # optional: newsletter subscribe
VITE_DOKU_CHECKOUT_ENDPOINT=https://your-backend/api/doku/checkout  # optional: real DOKU checkout
```

### studio/.env

```
SANITY_STUDIO_PROJECT_ID=lyo17dt8
SANITY_STUDIO_DATASET=production
```

## Features

- Mobile-first Consumed-style layout (hamburger / centered POROS / search+cart)
- Hero + sidebar features + Latest/Commented tabs + Load More
- ArticleCard variants: hero / row / feature / compact / default
- Per-category Unsplash fallback covers so articles never render blank
- Drop cap + reading progress bar + reading time + share buttons + prev/next nav
- Bookmark localStorage + /saved page
- Text size adjuster + serif/sans toggle + audio (Web Speech)
- Sticky header + live search overlay
- Trending strip (numbered Pirata One)
- SEO meta + OG/Twitter + sitemap.xml + robots.txt + rss.xml
- Newsletter form (Buttondown-ready) + submit pitch + letters to editor
- Cusdis comments embed
- Notes feed (Substack-style mini posts)
- Tip jar links in footer (Saweria / Trakteer / Patreon — URLs from Sanity Settings)
- Real shopping cart + DOKU checkout (with visible payment-methods step)
- Dark/light theme + no-flash hydration

## Sanity schemas

Article · Category · Author · Edition · Note · Product · Settings · Submission · Letter

Custom rich-text blocks: pullQuote · imageWithCaption · embed (YouTube/Spotify autodetect) · callout (info/warn/accent) · divider

Custom desk: Articles (All / Editor's picks / Recently published / Scheduled / Drafts / Needs cover image / By category / By edition / By author) · Categories · Authors · Editions · Notes · Products · Inbox (Pitches + Letters) · Settings singleton.

Settings singleton drives:

- `homepageLayout.sections[]` — admin reorders / disables homepage sections (hero, editors, edition, notes, popular, feed, shop). Empty layout falls back to the default ordering.
- `homepageLayout.heroArticle` — optionally pin a specific article into the hero slot.
- `reactionLabels[]` — text labels for the reader-reaction component on each article (default: Suka, Penting, Kena banget). Symbols are intentionally avoided.
- `colophon` — Portable Text block rendered at `/colophon`. Empty colophon falls back to baked-in credits.
- `tipJarSaweria` / `tipJarTrakteer` / `tipJarPatreon` — URLs surfaced in the footer tip-jar block. Empty URLs are hidden.

## Seeding Sanity

A one-shot seed script lives at `scripts/seed-sanity.mjs`. It upserts a baseline editorial setup (4 categories, 2 editors, Edition 001, 4 shop products priced in IDR, and a Settings singleton with the default homepage layout):

```bash
# dry run — prints docs without writing, no deps needed
node scripts/seed-sanity.mjs --dry-run

# actual write — needs an Editor-scoped write token; run from web/ so @sanity/client resolves
cd web
SANITY_PROJECT_ID=lyo17dt8 \
SANITY_DATASET=production \
SANITY_WRITE_TOKEN=sk-... \
node ../scripts/seed-sanity.mjs
```

Documents use deterministic `_id` values (`seed-*`), so re-running the script is idempotent.

## DOKU backend

Frontend posts `{customer, items, subtotal}` to `VITE_DOKU_CHECKOUT_ENDPOINT` and expects `{paymentUrl}` back. A minimal Cloudflare Worker / Vercel function example is the next step — needs DOKU sandbox client-id + secret.

---

POROS · 2026 · Bandung
