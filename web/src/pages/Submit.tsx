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
    if (!name || !email || !body) { setStatus("err"); setMsg("Semua field wajib diisi."); return; }
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
        const log = JSON.parse(localStorage.getItem("poros-submissions") ?? "[]");
        log.push(payload);
        localStorage.setItem("poros-submissions", JSON.stringify(log));
      } catch {}
      if (sanityEnabled && sanity) {
        const token = import.meta.env.VITE_SANITY_WRITE_TOKEN as string | undefined;
        if (token) {
          await sanity.withConfig({ token }).create(payload);
        }
      }
      setStatus("ok");
      setMsg(isPitch ? "Pitch terkirim. Redaksi akan menghubungi dalam 1-2 minggu jika cocok." : "Terima kasih. Surat akan ditinjau redaksi.");
      setName(""); setEmail(""); setTitle(""); setBody("");
    } catch {
      setStatus("err");
      setMsg("Gagal mengirim. Coba kirim ke email submissions@velvetcollapse.id");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title={isPitch ? "Submit pitch" : "Letters to editor"} />
      <header className="border-b rule-soft pb-6 mb-8">
        <p className="kicker text-accent">{isPitch ? "SUBMIT PITCH" : "LETTERS TO EDITOR"}</p>
        <h1 className="headline-display text-4xl md:text-5xl mt-2">
          {isPitch ? "Punya cerita yang menurutmu harus kami tulis?" : "Tanggapan, koreksi, atau pemikiran."}
        </h1>
        <p className="text-muted mt-3">
          {isPitch
            ? "Tulis pitch singkat. Tidak perlu draft penuh — cukup 2-4 paragraf tentang siapa, apa, kenapa sekarang. Redaksi membaca setiap pengiriman."
            : "Ditujukan ke editor. Surat-surat yang terpilih akan dimuat di edisi mendatang."}
        </p>
      </header>
      {status === "ok" ? (
        <div className="border rule-soft p-6">
          <p className="kicker text-accent">TERKIRIM</p>
          <p className="mt-3">{msg}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {isPitch && <input className="w-full border rule-soft bg-transparent px-3 py-2" placeholder="Judul pitch (sementara)" value={title} onChange={(e) => setTitle(e.target.value)} />}
          <textarea className="w-full border rule-soft bg-transparent px-3 py-2" rows={10} placeholder={isPitch ? "Pitch — siapa subjek, apa konflik, kenapa sekarang, dan bukti apa yang sudah kamu kumpulkan." : "Tulis suratmu di sini."} value={body} onChange={(e) => setBody(e.target.value)} />
          <button type="submit" disabled={status === "loading"} className="bg-ink text-paper px-4 py-3 kicker disabled:opacity-50">
            {status === "loading" ? "MENGIRIM…" : isPitch ? "KIRIM PITCH" : "KIRIM SURAT"}
          </button>
          {status === "err" && <p className="text-xs text-accent">{msg}</p>}
        </form>
      )}
    </div>
  );
}
