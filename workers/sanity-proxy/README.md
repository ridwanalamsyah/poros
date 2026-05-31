# Sanity write proxy (Cloudflare Worker)

Moves Sanity writes off the browser so the **write token is no longer shipped in
the client bundle**. The frontend POSTs a constrained `action` + `data`; the
worker validates an optional Turnstile token, maps the action to a whitelisted
Sanity mutation, and forwards it with the server-held token.

Allowed actions (everything else is rejected): `createSubmission`,
`createLetter`, `createOrder`, `patchOrderPayment`. Every field is allow-listed.

## Deploy

```bash
cd workers/sanity-proxy
npm install

# secrets (not stored in wrangler.toml)
npx wrangler secret put SANITY_WRITE_TOKEN     # Editor-scoped token
npx wrangler secret put TURNSTILE_SECRET        # optional; guards submission/letter forms

# edit wrangler.toml [vars] ALLOWED_ORIGINS to your site origin(s), then:
npx wrangler deploy
```

`npm run check` runs `wrangler deploy --dry-run` to verify the build without
deploying.

## Wire up the frontend

Set these in the web app's environment (Vercel):

- `VITE_SANITY_PROXY_URL` — the deployed worker URL. When set, the app routes all
  writes through the worker and **ignores** `VITE_SANITY_WRITE_TOKEN`.
- `VITE_TURNSTILE_SITE_KEY` — optional; renders the Turnstile widget on the
  pitch/letter forms.

Once `VITE_SANITY_PROXY_URL` is live, remove `VITE_SANITY_WRITE_TOKEN` from the
frontend environment entirely and rotate that token.
