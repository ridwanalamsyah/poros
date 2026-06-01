# Ops handoff — Velvet Collapse Magazine

This document covers the operational steps that require account access (Vercel,
Cloudflare, Sanity, Sentry) and therefore can't be done from a pull request.
Everything code-related from the audit has already landed in PRs; the items
below are the "press the button in your dashboard" follow-ups.

> Most of these have a corresponding PR that adds the code/config. This doc only
> describes the deploy + credential steps you run yourself.

---

## 1. Vercel — fix the production 404

The audit assumed Vercel was deleted. It isn't: the project is still connected
and **preview deploys run on every PR**. The only thing broken is the
**production** URL (`velvet-collapse-magazine.vercel.app` → 404), because the
project's **Production Branch** doesn't point at this repo's default branch.

This repo's default branch is **`devin/1779186463-initial-import`**, not `main`.

**Fix (Vercel dashboard → Project → Settings):**
1. **Settings → Git → Production Branch** → set to `devin/1779186463-initial-import`
   (or, cleaner long-term: rename the default branch to `main` on GitHub and
   point Vercel at `main`).
2. **Settings → Deployments → Redeploy** the latest commit on that branch, or
   just push/merge once to trigger a production build.
3. If preview URLs return **401** for outside viewers, that's **Deployment
   Protection** (Settings → Deployment Protection) — disable it or share a
   bypass link if you want public previews.

**Environment variables** to set in Vercel (Settings → Environment Variables).
Build args `VITE_SANITY_PROJECT_ID` / `VITE_SANITY_DATASET` are already used by
CI; mirror them in Vercel plus the optional ones:

| Variable | Value / note |
|---|---|
| `VITE_SANITY_PROJECT_ID` | `lyo17dt8` |
| `VITE_SANITY_DATASET` | `production` |
| `VITE_SANITY_API_VERSION` | `2024-10-01` (optional) |
| `VITE_SITE_URL` | `https://velvet-collapse-magazine.vercel.app` (for sitemap/OG absolute URLs) |
| `VITE_SANITY_PROXY_URL` | the deployed Worker URL — see §3 |
| `VITE_TURNSTILE_SITE_KEY` | optional, see §3 |
| `VITE_SENTRY_DSN` | optional, see §4 |
| `VITE_PLAUSIBLE_DOMAIN` / `VITE_VERCEL_ANALYTICS` | optional, see §5 |

⚠️ **Do NOT set `VITE_SANITY_WRITE_TOKEN` in production** once the Worker proxy
is live (§3). It ships in the browser bundle.

---

## 2. Sanity Studio — fix the Studio 404 + run a deploy

The hosted Studio (`*.sanity.studio`) returns 404 because it hasn't been
deployed from the current codebase (now on Sanity v5).

```bash
cd studio
npm install
npx sanity login          # your Sanity account
npx sanity deploy         # pick/confirm the studio hostname
```

Project is already configured: `projectId = lyo17dt8`, `dataset = production`.
After deploy, the new document types from the feature PRs (`episode`,
`liveblog`, `event`, per-edition `accentColor`) appear in the Studio.

---

## 3. Cloudflare Worker — move the Sanity write token off the browser

Code: **`workers/sanity-proxy/`** (added in the security PR). Today the browser
holds `VITE_SANITY_WRITE_TOKEN`; the Worker replaces that with a server-held
token. Allowed actions are allow-listed: `createSubmission`, `createLetter`,
`createOrder`, `patchOrderPayment`.

**Deploy:**
```bash
cd workers/sanity-proxy
npm install
npx wrangler login                              # your Cloudflare account
npx wrangler secret put SANITY_WRITE_TOKEN      # Editor-scoped token from sanity.io/manage
npx wrangler secret put TURNSTILE_SECRET        # optional; guards pitch/letter forms
# edit wrangler.toml [vars] ALLOWED_ORIGINS to your real site origin(s)
npx wrangler deploy
```

**Then wire the frontend (Vercel env, §1):**
1. Set `VITE_SANITY_PROXY_URL` to the deployed Worker URL.
2. (Optional) set `VITE_TURNSTILE_SITE_KEY` to render the Turnstile widget.
3. **Remove `VITE_SANITY_WRITE_TOKEN` from Vercel entirely and rotate it** in
   sanity.io/manage. Once `VITE_SANITY_PROXY_URL` is set the app ignores the
   write token and routes all writes through the Worker.

---

## 4. `/covers` migration — drop ~21 MB from the bundle

Code: **`web/scripts/migrate-covers.mjs`** (added in the perf PR). It uploads the
local `web/public/covers/*` images to the Sanity asset CDN and rewrites the
`/covers/...` references in `src/data/mock.ts` to `cdn.sanity.io` URLs.

```bash
cd web
# dry run first — lists what would change, no token needed:
VITE_SANITY_PROJECT_ID=lyo17dt8 VITE_SANITY_DATASET=production \
  node scripts/migrate-covers.mjs --dry-run

# real run (needs a write token):
VITE_SANITY_PROJECT_ID=lyo17dt8 VITE_SANITY_DATASET=production \
  VITE_SANITY_WRITE_TOKEN=sk... \
  node scripts/migrate-covers.mjs
```

After a successful run, delete `web/public/covers/` and commit. Note this only
rewrites the **mock** data; real content should reference Sanity-hosted images
already.

---

## 5. Sentry + analytics (optional)

**Sentry** is already wired (`web/src/utils/sentry.ts`, `ErrorBoundary`) and is a
**no-op until a DSN is present**. To turn it on, set in Vercel:
- `VITE_SENTRY_DSN` — from your Sentry project (Settings → Client Keys).
- `VITE_SENTRY_ENVIRONMENT` (optional, defaults to build mode)
- `VITE_SENTRY_RELEASE`, `VITE_SENTRY_TRACES_SAMPLE_RATE` (optional)

**Analytics** (`web/src/utils/analytics.ts`) is also env-gated:
- Plausible: `VITE_PLAUSIBLE_DOMAIN` (+ optional `VITE_PLAUSIBLE_HOST`)
- Vercel Analytics: `VITE_VERCEL_ANALYTICS=1`

---

## Suggested PR merge order

The first three PRs stack (each builds on the previous); the rest are
independent off the default branch.

1. `#24` image hotspot + CSP + README →
2. `#25` Vitest + unit tests →
3. `#26` Sanity write proxy (Worker)
4. `#27` covers migration script
5. `#28` Playwright smoke tests
6. `#29` design refresh → `#30` per-edition accent → `#31` edition reader
7. `#32` contributor CTA · `#33` podcast · `#34` live blog · `#35` events

---

## Security note

A GitHub token was pasted in plaintext during setup. **Rotate it** at
GitHub → Settings → Developer settings → Tokens once this work is merged.
