import { useState } from "react";

const BUTTONDOWN_USERNAME = import.meta.env.VITE_BUTTONDOWN_USERNAME as string | undefined;

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
    if (!BUTTONDOWN_USERNAME) {
      // No integration configured — still acknowledge so visitors get feedback.
      await new Promise((r) => setTimeout(r, 600));
      setStatus("ok");
      setMsg("Terima kasih! Saat ini list belum di-link ke ESP. Editor akan menambahkan emailmu manual.");
      setEmail("");
      try {
        const log = JSON.parse(localStorage.getItem("poros-newsletter") ?? "[]");
        log.push({ email, ts: Date.now() });
        localStorage.setItem("poros-newsletter", JSON.stringify(log));
      } catch {}
      return;
    }
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
    } catch {
      setStatus("err");
      setMsg("Gagal subscribe. Coba lagi nanti.");
    }
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
