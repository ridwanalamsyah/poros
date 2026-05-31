# Velvet Collapse Magazine

Indonesian longform magazine — labor, society, culture. Based in Bandung.

Customer-facing brand: **Velvet Collapse**.

Stack: React 19 + Vite (frontend) + Sanity v5 (CMS) + DOKU (payments).

## Live

- Web: https://velvet-collapse-magazine.vercel.app
- Studio: https://velvet-collapse-magazine.sanity.studio

## Repo layout

```
velvet-collapse-magazine/
├── web/        React + Vite frontend
└── studio/     Sanity v5 Studio
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
VITE_SANITY_WRITE_TOKEN=...           # enables submit-pitch / letters / orders to save into Studio
VITE_SITE_URL=https://velvet-collapse-magazine.vercel.app

# Newsletter — pick one
VITE_BUTTONDOWN_USERNAME=...          # public Buttondown embed (no API key, simplest)
VITE_NEWSLETTER_ENDPOINT=...          # custom server endpoint (e.g. a Cloudflare Worker — keeps Buttondown API key server-side)

# Payments
VITE_DOKU_CHECKOUT_ENDPOINT=...       # POST { customer, items, subtotal, orderId, orderNumber } and expects { paymentUrl, paymentRef }

# Analytics
VITE_PLAUSIBLE_DOMAIN=velvet-collapse-magazine.vercel.app   # turn on Plausible script
VITE_PLAUSIBLE_HOST=https://plausible.io # optional override for self-hosted Plausible
VITE_VERCEL_ANALYTICS=1                  # alternative: turn on Vercel Web Analytics

# Sentry (error tracking)
VITE_SENTRY_DSN=https://...@oXXXX.ingest.sentry.io/YYYY
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

`VITE_SANITY_WRITE_TOKEN` is read by the browser. Use an **Editor**-scoped token, not a Deploy token — and rotate it if it ever ends up in a public commit. Limit dataset privileges to the bare minimum (e.g. only allow writes to `order`, `submission`, `letter`).

### studio/.env

```
SANITY_STUDIO_PROJECT_ID=lyo17dt8
SANITY_STUDIO_DATASET=production
```

## Features

- Mobile-first Consumed-style layout (hamburger / centered wordmark / search+cart)
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

Article · Category · Author · Edition · Note · Product · Order · Settings · Submission · Letter

Custom rich-text blocks: pullQuote · imageWithCaption · embed (YouTube/Spotify autodetect) · callout (info/warn/accent) · divider

Custom desk: Articles (All / Editor's picks / Recently published / Scheduled / Drafts / Needs cover image / By category / By edition / By author) · Categories · Authors · Editions · Notes · **Shop** (Products + Orders: all / pending / paid / shipped / cancelled) · Inbox (Pitches + Letters) · Settings singleton.

Settings singleton drives:

- `homepageLayout.sections[]` — admin reorders / disables homepage sections (hero, editors, edition, notes, popular, feed, shop). Empty layout falls back to the default ordering.
- `homepageLayout.heroArticle` — optionally pin a specific article into the hero slot.
- `reactionLabels[]` — text labels for the reader-reaction component on each article (default: Like, Dislike). Symbols are intentionally avoided.
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

## Shop & checkout flow

1. Visitor browses `/shop` (grid) → opens product detail `/shop/:slug` → adds to cart.
2. `/cart` reviews the order, then collects shipping + contact info.
3. On submit, a draft `order` document is written to Sanity (`status: "pending"`) using the write token. Editors see it immediately in **Shop → Orders → Pending payment**.
4. If `VITE_DOKU_CHECKOUT_ENDPOINT` is configured, the frontend POSTs the order to the backend and redirects to the returned `paymentUrl`. The Sanity order is patched with `paymentRef` / `paymentUrl`.
5. The DOKU webhook on your backend should patch the Sanity order to `status: "paid"` and set `paidAt`. (Webhook implementation lives outside this repo — see `scripts/buttondown-worker.js` for the worker pattern.)

If no DOKU endpoint is set, the order is still saved as `pending` and the editor can send a manual payment link from the Studio.

## Newsletter

Two paths:

- **Embed (default, no secret)**: set `VITE_BUTTONDOWN_USERNAME`. Submits to `https://buttondown.email/api/emails/embed-subscribe/<username>`.
- **API (server-side, keeps key secret)**: deploy `scripts/buttondown-worker.js` to Cloudflare Workers with `BUTTONDOWN_API_KEY` as a secret, then point `VITE_NEWSLETTER_ENDPOINT` at the worker URL.

Never put a Buttondown API key into a `VITE_*` variable — it would be inlined into the public bundle.

## Analytics & errors

- **Plausible**: set `VITE_PLAUSIBLE_DOMAIN=velvet-collapse-magazine.vercel.app`. Loads `script.js` from `plausible.io` (override with `VITE_PLAUSIBLE_HOST` for self-hosted). Custom events fire on `add_to_cart`, `checkout_started`, `newsletter_subscribed`.
- **Vercel Web Analytics**: set `VITE_VERCEL_ANALYTICS=1` (only meaningful when hosted on Vercel — it serves `/_vercel/insights/script.js` automatically).
- **Sentry**: set `VITE_SENTRY_DSN`. `@sentry/react` is dynamically imported, so the bundle stays small when Sentry is disabled. `VITE_SENTRY_TRACES_SAMPLE_RATE` (default `0.1`) controls perf tracing.

## Hosting

- **Web (Vite frontend)** — recommended: Vercel or Netlify, both free tier. Set env vars in the dashboard, point at `web/` as the project root, build command `npm run build`, output `dist`.
- **Studio (Sanity)** — `cd studio && npx sanity deploy` hosts it at `<projectname>.sanity.studio`. Free as long as you stay within the Sanity quota.
- **Buttondown Worker (optional)** — see `scripts/buttondown-worker.js`. Deploy with `wrangler deploy`; takes ~5 minutes.

## DOKU backend

Frontend posts `{ customer, items, subtotal, orderId, orderNumber }` to `VITE_DOKU_CHECKOUT_ENDPOINT` and expects `{ paymentUrl, paymentRef }` back. A minimal Cloudflare Worker / Vercel function example is the next step — needs DOKU sandbox client-id + secret. The backend should also patch the Sanity `order` to `status: "paid"` from the DOKU webhook.

---

Velvet Collapse Magazine · 2026 · Bandung
