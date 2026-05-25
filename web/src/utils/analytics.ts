// Lightweight analytics wrapper.
// Supports Plausible (via VITE_PLAUSIBLE_DOMAIN) and Vercel Web Analytics
// (via VITE_VERCEL_ANALYTICS=1). Both opt-in via env — nothing is loaded
// in dev unless the env var is set.

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, unknown>; callback?: () => void }) => void;
    va?: (event: "event", payload: { name: string; data?: Record<string, unknown> }) => void;
  }
}

let initialized = false;

function injectScript(src: string, attrs: Record<string, string> = {}) {
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.src = src;
  s.defer = true;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
  if (plausibleDomain) {
    const host = (import.meta.env.VITE_PLAUSIBLE_HOST as string | undefined) ?? "https://plausible.io";
    injectScript(`${host.replace(/\/$/, "")}/js/script.js`, { "data-domain": plausibleDomain });
    // Shim — buffer events fired before the script finishes loading.
    if (!window.plausible) {
      const queue: unknown[] = [];
      const shim = ((...args: unknown[]) => queue.push(args)) as unknown as Window["plausible"];
      (shim as unknown as { q: unknown[] }).q = queue;
      window.plausible = shim;
    }
  }

  const vercel = import.meta.env.VITE_VERCEL_ANALYTICS as string | undefined;
  if (vercel === "1" || vercel === "true") {
    injectScript("/_vercel/insights/script.js");
  }
}

export function trackEvent(name: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(name, props ? { props } : undefined);
    window.va?.("event", { name, data: props });
  } catch {
    // analytics failures must never break the page
  }
}

export function trackPageview(url?: string) {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.("pageview", url ? { props: { url } } : undefined);
  } catch {
    // ignore
  }
}
