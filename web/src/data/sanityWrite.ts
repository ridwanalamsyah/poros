/**
 * Client helper for Sanity writes.
 *
 * Preferred path: POST to the Cloudflare Worker proxy (`VITE_SANITY_PROXY_URL`),
 * which holds the write token server-side. The legacy direct-token path
 * (`VITE_SANITY_WRITE_TOKEN`) remains as a fallback only until the proxy is
 * deployed, and should then be removed.
 */
const proxyUrl = import.meta.env.VITE_SANITY_PROXY_URL as string | undefined;

export type WriteAction = "createSubmission" | "createLetter" | "createOrder" | "patchOrderPayment";

export type WriteResponse = { ok: boolean; id?: string; orderNumber?: string };

export function writeProxyEnabled(): boolean {
  return Boolean(proxyUrl);
}

export async function proxyWrite(
  action: WriteAction,
  data: unknown,
  turnstileToken?: string,
): Promise<WriteResponse | null> {
  if (!proxyUrl) return null;
  try {
    const r = await fetch(proxyUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, data, turnstileToken }),
    });
    if (!r.ok) {
      console.warn("[sanity-proxy] write rejected:", r.status);
      return { ok: false };
    }
    return (await r.json()) as WriteResponse;
  } catch (e) {
    console.warn("[sanity-proxy] write error:", e);
    return { ok: false };
  }
}
