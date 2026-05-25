// Optional Sentry wiring. Loaded lazily so the bundle isn't bloated for
// users browsing without a DSN configured.

let initialized = false;

export async function initSentry() {
  if (initialized) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;
  initialized = true;

  try {
    const Sentry = await import("@sentry/react");
    const env = (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) ?? import.meta.env.MODE;
    const release = import.meta.env.VITE_SENTRY_RELEASE as string | undefined;
    const tracesSampleRate = Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1);
    Sentry.init({
      dsn,
      environment: env,
      release,
      tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.1,
      integrations: [Sentry.browserTracingIntegration()],
    });
  } catch (e) {
    console.warn("[sentry] init failed:", e);
  }
}

export async function captureException(err: unknown, extra?: Record<string, unknown>) {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) {
    console.error("[error]", err, extra);
    return;
  }
  try {
    const Sentry = await import("@sentry/react");
    Sentry.captureException(err, extra ? { extra } : undefined);
  } catch {
    console.error("[error]", err, extra);
  }
}
