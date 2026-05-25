/**
 * Buttondown subscribe — Cloudflare Worker template.
 *
 * Use this if you want to call the Buttondown API directly with an API key
 * instead of the public embed-subscribe form. The API key MUST stay
 * server-side; never expose it via VITE_*.
 *
 * Deploy:
 *   1. wrangler init poros-buttondown
 *   2. Copy this file into src/index.js
 *   3. wrangler secret put BUTTONDOWN_API_KEY
 *      (Optionally also: wrangler secret put BUTTONDOWN_ALLOWED_ORIGIN)
 *   4. wrangler deploy
 *
 * Then set in web/.env:
 *   VITE_NEWSLETTER_ENDPOINT=https://poros-buttondown.<account>.workers.dev
 *
 * The frontend posts { email } and expects 2xx for success.
 */

export default {
  async fetch(request, env) {
    const allowedOrigin = env.BUTTONDOWN_ALLOWED_ORIGIN ?? "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(allowedOrigin) });
    }
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405, allowedOrigin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400, allowedOrigin);
    }

    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (!email || !email.includes("@")) {
      return json({ error: "invalid_email" }, 400, allowedOrigin);
    }

    if (!env.BUTTONDOWN_API_KEY) {
      return json({ error: "missing_api_key" }, 500, allowedOrigin);
    }

    const res = await fetch("https://api.buttondown.email/v1/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, type: "regular" }),
    });

    // Buttondown returns 201 on create, 400 if already subscribed — we treat
    // both as success from the frontend's perspective.
    if (res.ok || res.status === 400) {
      return json({ ok: true }, 200, allowedOrigin);
    }

    const text = await res.text().catch(() => "");
    return json({ error: "buttondown_failed", status: res.status, detail: text.slice(0, 400) }, 502, allowedOrigin);
  },
};

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(payload, status, origin) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}
