import { useState } from "react";
import { useSettings } from "../hooks/useSettings";

type Variant = "footer" | "inline" | "sidebar";

export function NewsletterSignup({ variant = "inline" }: { variant?: Variant }) {
  const settings = useSettings();
  const endpoint = settings.newsletterEndpoint;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "err">("idle");

  const onPaper = variant === "footer";
  const labelCls = onPaper ? "kicker text-paper/75" : "kicker text-muted";
  const inputCls = onPaper
    ? "flex-1 bg-transparent border-b border-paper/40 text-paper placeholder:text-paper/40 outline-none py-2"
    : "flex-1 bg-transparent border-b rule-soft outline-none py-2";
  const btnCls = onPaper
    ? "border border-paper text-paper px-4 py-2 kicker hover:bg-paper hover:text-ink transition-colors"
    : "border border-ink px-4 py-2 kicker hover:bg-ink hover:text-paper transition-colors";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !endpoint) return;
    setState("loading");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setState("done");
      setEmail("");
    } catch {
      setState("err");
    }
  }

  if (state === "done") {
    return <p className={`${labelCls} text-center`}>Makasih. Cek email kamu buat konfirmasi.</p>;
  }

  const heading = variant === "footer" ? "Langganan Newsletter" : "Newsletter mingguan";
  const blurb = variant === "footer"
    ? "Email mingguan: artikel baru, catatan, daftar bacaan."
    : "Kirim ke inbox seminggu sekali. Gratis. Unsubscribe kapan saja.";

  return (
    <div className={onPaper ? "text-paper" : ""}>
      <p className={`${labelCls} tracking-[0.18em]`}>{heading.toUpperCase()}</p>
      <p className={`text-sm mt-1 ${onPaper ? "text-paper/70" : "text-muted"}`}>{blurb}</p>
      {!endpoint ? (
        <p className={`text-xs mt-3 ${onPaper ? "text-paper/55" : "text-muted"}`}>
          Form sign-up akan aktif setelah admin set <code>newsletterEndpoint</code> di Studio → Settings.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex gap-2 mt-3 items-end">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@kamu.com"
            required
            className={inputCls}
          />
          <button type="submit" disabled={state === "loading"} className={btnCls}>
            {state === "loading" ? "..." : "DAFTAR"}
          </button>
        </form>
      )}
      {state === "err" && <p className="text-xs mt-2 text-accent">Gagal. Coba lagi.</p>}
    </div>
  );
}
