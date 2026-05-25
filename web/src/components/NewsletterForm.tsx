import { useState } from "react";
import { trackEvent } from "../utils/analytics";

const BUTTONDOWN_USERNAME = import.meta.env.VITE_BUTTONDOWN_USERNAME as string | undefined;
const NEWSLETTER_ENDPOINT = import.meta.env.VITE_NEWSLETTER_ENDPOINT as string | undefined;

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("err");
      setMsg("Email tidak valid.");
      return;
    }
    setStatus("loading");

    // 1. Custom server endpoint (preferred — keeps API key server-side).
    //    See scripts/buttondown-worker.js for a Cloudflare Worker template.
    if (NEWSLETTER_ENDPOINT) {
      try {
        const r = await fetch(NEWSLETTER_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setStatus("ok");
        setMsg("Selamat datang. Cek inbox untuk konfirmasi.");
        setEmail("");
        trackEvent("newsletter_subscribed", { source: "endpoint" });
        return;
      } catch {
        setStatus("err");
        setMsg("Gagal subscribe. Coba lagi nanti.");
        return;
      }
    }

    // 2. Public Buttondown embed (no secret required, uses username only).
    if (BUTTONDOWN_USERNAME) {
      try {
        const r = await fetch(`https://buttondown.email/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ email }).toString(),
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setStatus("ok");
        setMsg("Selamat datang. Cek inbox untuk konfirmasi.");
        setEmail("");
        trackEvent("newsletter_subscribed", { source: "embed" });
        return;
      } catch {
        setStatus("err");
        setMsg("Gagal subscribe. Coba lagi nanti.");
        return;
      }
    }

    // 3. Offline fallback — log to localStorage so editors can ingest manually.
    await new Promise((r) => setTimeout(r, 600));
    setStatus("ok");
    setMsg("Terima kasih! Saat ini list belum di-link ke ESP. Editor akan menambahkan emailmu manual.");
    setEmail("");
    try {
      const log = JSON.parse(localStorage.getItem("poros-newsletter") ?? "[]");
      log.push({ email, ts: Date.now() });
      localStorage.setItem("poros-newsletter", JSON.stringify(log));
    } catch {}
    trackEvent("newsletter_subscribed", { source: "localStorage" });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex items-center border-b rule-soft py-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink/40"
        />
        <button type="submit" disabled={status === "loading"} className="kicker hover:underline disabled:opacity-50">
          {status === "loading" ? "…" : "SUBSCRIBE"}
        </button>
      </div>
      {status === "ok" && <p className="text-xs text-muted">{msg}</p>}
      {status === "err" && <p className="text-xs text-accent">{msg}</p>}
      <p className="text-xs text-muted">Newsletter edisi baru + esai pilihan. Gratis.</p>
    </form>
  );
}
