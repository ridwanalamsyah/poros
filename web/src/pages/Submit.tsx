import { useState } from "react";
import { SEO } from "../components/SEO";
import { sanity, sanityEnabled } from "../sanity";

type Mode = "pitch" | "letter";

export function SubmitPage({ mode = "pitch" }: { mode?: Mode }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  const isPitch = mode === "pitch";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !body) { setStatus("err"); setMsg("All required fields must be filled in."); return; }
    setStatus("loading");
    const payload = {
      _type: isPitch ? "submission" : "letter",
      name,
      email,
      title,
      body,
      submittedAt: new Date().toISOString(),
    };
    try {
      try {
        const KEY = "vc-submissions";
        const legacy = localStorage.getItem("poros-submissions");
        const log = JSON.parse(localStorage.getItem(KEY) ?? legacy ?? "[]");
        log.push(payload);
        localStorage.setItem(KEY, JSON.stringify(log));
        if (legacy !== null) localStorage.removeItem("poros-submissions");
      } catch {}
      if (sanityEnabled && sanity) {
        const token = import.meta.env.VITE_SANITY_WRITE_TOKEN as string | undefined;
        if (token) {
          await sanity.withConfig({ token }).create(payload);
        }
      }
      setStatus("ok");
      setMsg(isPitch ? "Pitch sent. The editorial team will reach out within 1–2 weeks if it's a fit." : "Thanks. Your letter will be reviewed by the editorial team.");
      setName(""); setEmail(""); setTitle(""); setBody("");
    } catch {
      setStatus("err");
      setMsg("Failed to send. Try emailing submissions@velcolmagazine.com instead.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title={isPitch ? "Submit pitch" : "Letters to editor"} />
      <header className="border-b rule-soft pb-6 mb-8">
        <p className="kicker text-accent">{isPitch ? "SUBMIT PITCH" : "LETTERS TO EDITOR"}</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">
          {isPitch ? "Got a story you think we should run?" : "Feedback, corrections, or thoughts."}
        </h1>
        <p className="text-muted mt-3">
          {isPitch
            ? "Send a short pitch. No need for a full draft — 2–4 paragraphs on who, what, and why now is enough. The editorial team reads every submission."
            : "Addressed to the editors. Selected letters will be published in an upcoming edition."}
        </p>
      </header>
      {status === "ok" ? (
        <div className="border rule-soft p-6">
          <p className="kicker text-accent">SENT</p>
          <p className="mt-3">{msg}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {isPitch && <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Pitch title (working)" value={title} onChange={(e) => setTitle(e.target.value)} />}
          <textarea className="w-full border rule-soft bg-transparent px-3 py-2" rows={10} placeholder={isPitch ? "Pitch — who is the subject, what is the conflict, why now, and what evidence have you collected." : "Write your letter here."} value={body} onChange={(e) => setBody(e.target.value)} />
          <button type="submit" disabled={status === "loading"} className="bg-ink text-paper px-4 py-3 kicker disabled:opacity-50">
            {status === "loading" ? "SENDING…" : isPitch ? "SEND PITCH" : "SEND LETTER"}
          </button>
          {status === "err" && <p className="text-xs text-accent">{msg}</p>}
        </form>
      )}
    </div>
  );
}
