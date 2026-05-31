/**
 * Sanity write proxy (Cloudflare Worker).
 *
 * Keeps the Sanity write token server-side instead of shipping it in the
 * browser bundle. The client POSTs a constrained `action` + `data`; the worker
 * validates an optional Cloudflare Turnstile token, maps the action to a
 * whitelisted Sanity mutation, and forwards it with the secret token.
 *
 * Only four actions are allowed and every field is allow-listed, so a leaked
 * proxy URL cannot be used to write arbitrary documents.
 */

export interface Env {
  SANITY_PROJECT_ID: string;
  SANITY_DATASET: string;
  SANITY_API_VERSION?: string;
  SANITY_WRITE_TOKEN: string;
  /** Optional Turnstile secret. When set, requests must include a valid token. */
  TURNSTILE_SECRET?: string;
  /** Optional comma-separated allow-list of browser origins. */
  ALLOWED_ORIGINS?: string;
}

type Action = "createSubmission" | "createLetter" | "createOrder" | "patchOrderPayment";

type Json = Record<string, unknown>;

function str(v: unknown, max = 5000): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const allow = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const allowed = !allow.length || (origin && allow.includes(origin));
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : allow[0] ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body: Json, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

async function verifyTurnstile(token: string | undefined, secret: string, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const data = (await r.json()) as { success?: boolean };
  return data.success === true;
}

/** Build a whitelisted Sanity mutation for the given action. */
function buildMutations(action: Action, data: Json): unknown[] | null {
  if (action === "createSubmission" || action === "createLetter") {
    const name = str(data.name, 200);
    const email = str(data.email, 320);
    const body = str(data.body, 20000);
    if (!name || !email || !body) return null;
    return [
      {
        create: {
          _type: action === "createSubmission" ? "submission" : "letter",
          name,
          email,
          title: str(data.title, 300) ?? "",
          body,
          submittedAt: str(data.submittedAt, 40) ?? new Date().toISOString(),
        },
      },
    ];
  }

  if (action === "createOrder") {
    const customer = (data.customer ?? {}) as Json;
    const name = str(customer.name, 200);
    const email = str(customer.email, 320);
    const rawItems = Array.isArray(data.items) ? (data.items as Json[]) : [];
    const items = rawItems
      .map((it) => ({
        sku: str(it.sku, 120) ?? "",
        title: str(it.title, 300) ?? "",
        price: num(it.price) ?? 0,
        qty: num(it.qty) ?? 0,
      }))
      .filter((it) => it.sku && it.qty > 0);
    const total = num(data.total);
    if (!name || !email || !items.length || total === undefined) return null;
    const id = `order.${crypto.randomUUID()}`;
    const orderNumber = id.slice(-8).toUpperCase();
    return [
      {
        create: {
          _id: id,
          _type: "order",
          orderNumber,
          status: "pending",
          customer: {
            name,
            email,
            phone: str(customer.phone, 40),
            address: str(customer.address, 500),
            city: str(customer.city, 120),
            postalCode: str(customer.postalCode, 20),
          },
          items,
          subtotal: num(data.subtotal) ?? total,
          shipping: num(data.shipping) ?? 0,
          total,
          paymentProvider: str(data.paymentProvider, 20) ?? "doku",
          placedAt: str(data.placedAt, 40) ?? new Date().toISOString(),
        },
      },
    ];
  }

  if (action === "patchOrderPayment") {
    const id = str(data.orderId, 120);
    if (!id || !id.startsWith("order.")) return null;
    const set: Json = {};
    const ref = str(data.paymentRef, 200);
    const url = str(data.paymentUrl, 2000);
    const status = str(data.status, 20);
    if (ref) set.paymentRef = ref;
    if (url) set.paymentUrl = url;
    if (status && ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"].includes(status)) {
      set.status = status;
    }
    if (!Object.keys(set).length) return null;
    return [{ patch: { id, set } }];
  }

  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("origin");
    const cors = corsHeaders(origin, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);

    let payload: Json;
    try {
      payload = (await request.json()) as Json;
    } catch {
      return json({ error: "invalid_json" }, 400, cors);
    }

    const action = payload.action as Action;
    if (!["createSubmission", "createLetter", "createOrder", "patchOrderPayment"].includes(action)) {
      return json({ error: "unknown_action" }, 400, cors);
    }

    // Turnstile only guards the public, spam-prone forms so that enabling it
    // can never block the checkout/payment path.
    const needsTurnstile = action === "createSubmission" || action === "createLetter";
    if (env.TURNSTILE_SECRET && needsTurnstile) {
      const ok = await verifyTurnstile(
        str(payload.turnstileToken, 4000),
        env.TURNSTILE_SECRET,
        request.headers.get("cf-connecting-ip"),
      );
      if (!ok) return json({ error: "turnstile_failed" }, 403, cors);
    }

    const mutations = buildMutations(action, (payload.data ?? {}) as Json);
    if (!mutations) return json({ error: "invalid_payload" }, 422, cors);

    const apiVersion = (env.SANITY_API_VERSION ?? "2024-10-01").replace(/^v/, "");
    const endpoint = `https://${env.SANITY_PROJECT_ID}.api.sanity.io/v${apiVersion}/data/mutate/${env.SANITY_DATASET}?returnIds=true`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.SANITY_WRITE_TOKEN}`,
      },
      body: JSON.stringify({ mutations }),
    });

    if (!res.ok) {
      const text = await res.text();
      return json({ error: "sanity_error", status: res.status, detail: text.slice(0, 500) }, 502, cors);
    }

    const result = (await res.json()) as { results?: { id: string }[] };
    const id = result.results?.[0]?.id;
    const orderNumber = id && id.startsWith("order.") ? id.slice(-8).toUpperCase() : undefined;
    return json({ ok: true, id, orderNumber }, 200, cors);
  },
};
