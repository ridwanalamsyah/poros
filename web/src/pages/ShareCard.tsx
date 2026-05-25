import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getArticle } from "../data/api";
import { SEO } from "../components/SEO";
import { imageUrl } from "../sanity";

type Template = "cover" | "quote" | "lockup";
type Size = { id: "story" | "square"; w: number; h: number; label: string };

const SIZES: Size[] = [
  { id: "story", w: 1080, h: 1920, label: "Instagram Story (9:16)" },
  { id: "square", w: 1080, h: 1080, label: "Square (1:1)" },
];

const TEMPLATES: { id: Template; label: string; desc: string }[] = [
  { id: "cover", label: "Cover", desc: "Foto besar + judul" },
  { id: "quote", label: "Pull Quote", desc: "Kutipan + kredit" },
  { id: "lockup", label: "Logo Lockup", desc: "Wordmark + judul" },
];

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length <= maxCharsPerLine) {
      line = (line + " " + w).trim();
    } else {
      if (line) lines.push(line);
      line = w;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length >= maxLines && words.length > lines.join(" ").split(/\s+/).length) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\s+\S+$/, "…");
  }
  return lines;
}

function buildSvg({
  template,
  size,
  title,
  author,
  category,
  quote,
  imgDataUrl,
}: {
  template: Template;
  size: Size;
  title: string;
  author: string;
  category: string;
  quote: string;
  imgDataUrl: string | null;
}): string {
  const { w, h } = size;
  const ink = "#0d0d0d";
  const paper = "#f1ece3";
  const accent = "#c1272d";

  let body = "";

  if (template === "cover") {
    const titleLines = wrapText(title.toUpperCase(), size.id === "story" ? 14 : 18, 5);
    const titleSize = size.id === "story" ? 84 : 76;
    const lh = titleSize * 1.05;
    const imgH = size.id === "story" ? h * 0.55 : h * 0.6;
    body = `
      <rect width="${w}" height="${h}" fill="${paper}"/>
      ${imgDataUrl
        ? `<image href="${imgDataUrl}" x="0" y="0" width="${w}" height="${imgH}" preserveAspectRatio="xMidYMid slice"/>`
        : `<rect x="0" y="0" width="${w}" height="${imgH}" fill="${ink}"/>`}
      <rect x="0" y="${imgH}" width="${w}" height="6" fill="${ink}"/>
      <g transform="translate(60, ${imgH + 70})">
        <text font-family="JetBrains Mono, monospace" font-size="28" letter-spacing="6" fill="${accent}" font-weight="600">${escapeXml((category || "DEPARTMENT").toUpperCase())}</text>
        ${titleLines.map((ln, i) => `<text y="${60 + i * lh}" font-family="Fraunces, Georgia, serif" font-size="${titleSize}" font-weight="800" fill="${ink}" letter-spacing="-2">${escapeXml(ln)}</text>`).join("")}
        <text y="${60 + titleLines.length * lh + 40}" font-family="JetBrains Mono, monospace" font-size="26" fill="${ink}" opacity="0.7">${escapeXml(`By ${author}`.toUpperCase())}</text>
      </g>
      <g transform="translate(60, ${h - 70})">
        <text font-family="UnifrakturMaguntia, Pirata One, serif" font-size="64" fill="${ink}">Velvet Collapse</text>
        <text y="34" font-family="JetBrains Mono, monospace" font-size="20" letter-spacing="8" fill="${ink}" opacity="0.6">MAGAZINE — DEPARTMENT</text>
      </g>`;
  } else if (template === "quote") {
    const quoteText = (quote || title).replace(/^"|"$/g, "");
    const lines = wrapText(quoteText, size.id === "story" ? 22 : 26, 8);
    const qSize = size.id === "story" ? 72 : 60;
    const lh = qSize * 1.18;
    body = `
      <rect width="${w}" height="${h}" fill="${ink}"/>
      <text x="60" y="180" font-family="UnifrakturMaguntia, Pirata One, serif" font-size="200" fill="${accent}" opacity="0.55">"</text>
      <g transform="translate(80, ${h / 2 - (lines.length * lh) / 2})">
        ${lines.map((ln, i) => `<text y="${i * lh}" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="${qSize}" fill="${paper}" font-weight="500" letter-spacing="-1">${escapeXml(ln)}</text>`).join("")}
      </g>
      <g transform="translate(80, ${h - 180})">
        <rect width="80" height="3" fill="${accent}"/>
        <text y="44" font-family="JetBrains Mono, monospace" font-size="24" letter-spacing="4" fill="${paper}">${escapeXml(`— ${author}`.toUpperCase())}</text>
        <text y="80" font-family="JetBrains Mono, monospace" font-size="20" letter-spacing="6" fill="${paper}" opacity="0.55">${escapeXml((category || "VELVET COLLAPSE").toUpperCase())}</text>
      </g>
      <g transform="translate(${w - 60}, ${h - 60})" text-anchor="end">
        <text font-family="UnifrakturMaguntia, Pirata One, serif" font-size="40" fill="${paper}" opacity="0.7">Velvet Collapse</text>
      </g>`;
  } else {
    // lockup: large wordmark with title beneath, broadsheet style
    const titleLines = wrapText(title, size.id === "story" ? 18 : 22, 6);
    const titleSize = size.id === "story" ? 64 : 56;
    const lh = titleSize * 1.1;
    const wordmarkSize = size.id === "story" ? 220 : 180;
    body = `
      <rect width="${w}" height="${h}" fill="${paper}"/>
      <rect x="0" y="0" width="${w}" height="14" fill="${ink}"/>
      <rect x="0" y="${h - 14}" width="${w}" height="14" fill="${ink}"/>
      <g transform="translate(${w / 2}, ${h * 0.32})" text-anchor="middle">
        <text font-family="UnifrakturMaguntia, Pirata One, serif" font-size="${wordmarkSize}" fill="${ink}">Velvet Collapse</text>
        <text y="56" font-family="JetBrains Mono, monospace" font-size="28" letter-spacing="14" fill="${ink}" opacity="0.7">MAGAZINE — DEPARTMENT</text>
        <line x1="-180" x2="180" y1="100" y2="100" stroke="${accent}" stroke-width="4"/>
      </g>
      <g transform="translate(60, ${h * 0.55})">
        <text font-family="JetBrains Mono, monospace" font-size="26" letter-spacing="6" fill="${accent}" font-weight="600">${escapeXml((category || "FEATURE").toUpperCase())}</text>
        ${titleLines.map((ln, i) => `<text y="${60 + i * lh}" font-family="Fraunces, Georgia, serif" font-size="${titleSize}" font-weight="700" fill="${ink}" letter-spacing="-1">${escapeXml(ln)}</text>`).join("")}
        <text y="${60 + titleLines.length * lh + 40}" font-family="JetBrains Mono, monospace" font-size="22" fill="${ink}" opacity="0.6">${escapeXml(`By ${author}`.toUpperCase())} · BUILT FROM THE MESS</text>
      </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
}

async function imageToDataUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { mode: "cors" });
    const blob = await r.blob();
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function svgToPng(svg: string, w: number, h: number): Promise<Blob | null> {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement | null>((resolve) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => resolve(null);
      i.src = url;
    });
    if (!img) return null;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png", 0.95));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ShareCardPage() {
  const { slug } = useParams();
  const { data: article, loading } = useAsync(() => (slug ? getArticle(slug) : Promise.resolve(null)), [slug]);
  const [template, setTemplate] = useState<Template>("cover");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [quote, setQuote] = useState("");
  const [editedTitle, setEditedTitle] = useState<string | null>(null);
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const size = SIZES[sizeIdx];
  const title = editedTitle ?? article?.title ?? "Velvet Collapse Magazine";
  const author = article?.author?.name ?? "Editor";
  const category = (article?.category?.title ?? "DEPARTMENT").toString();

  useEffect(() => {
    if (!article?.coverImage) return;
    const url = imageUrl(article.coverImage, 1200);
    if (!url) return;
    imageToDataUrl(url).then(setImgDataUrl);
  }, [article]);

  const svg = useMemo(
    () => buildSvg({ template, size, title, author, category, quote, imgDataUrl }),
    [template, size, title, author, category, quote, imgDataUrl],
  );

  async function download() {
    setBusy(true);
    try {
      const png = await svgToPng(svg, size.w, size.h);
      if (!png) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(png);
      a.download = `velvet-collapse-${article?.slug ?? "share"}-${template}-${size.id}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } finally {
      setBusy(false);
    }
  }

  async function shareWA() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/article/${article?.slug ?? ""}` : "";
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`, "_blank");
  }

  async function shareIGStory() {
    setBusy(true);
    try {
      const png = await svgToPng(svg, size.w, size.h);
      if (!png) return;
      const file = new File([png], `velvet-collapse-${article?.slug ?? "share"}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean; share?: (d: ShareData) => Promise<void> };
      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title, text: title });
      } else {
        await download();
        alert("Gambar terdownload — buka Instagram → Story → upload, atau IG akan otomatis nawarin share kalau kamu open dari mobile.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-5 pt-10 text-muted">Memuat artikel…</div>;
  }
  if (!article) {
    return <div className="max-w-3xl mx-auto px-5 pt-10 text-muted">Artikel tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-6 md:pt-12 pb-16">
      <SEO title={`Share — ${article.title}`} description="Bikin kartu share artikel untuk WhatsApp / Instagram Story." />
      <header className="border-b rule-soft pb-4 mb-8">
        <Link to={`/article/${article.slug}`} className="kicker text-muted hover-underline">← KEMBALI KE ARTIKEL</Link>
        <p className="kicker text-accent mt-3">SHARE CARD</p>
        <h1 className="headline-display text-3xl md:text-5xl mt-2 leading-[1.05]">Bikin kartu share.</h1>
        <p className="text-muted mt-2 max-w-2xl">Pilih template, atur ukuran, download PNG — siap upload ke IG Story / WhatsApp / Twitter / wherever.</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Preview */}
        <div className="bg-ink/[0.04] border rule-soft p-4 md:p-6 flex items-center justify-center">
          <div
            ref={previewRef}
            className="w-full max-w-md mx-auto shadow-lg overflow-hidden"
            style={{ aspectRatio: `${size.w} / ${size.h}` }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>

        {/* Controls */}
        <aside className="space-y-6">
          <section>
            <p className="kicker mb-2">TEMPLATE</p>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`border p-3 text-left transition-colors ${template === t.id ? "border-accent bg-accent/5" : "rule-soft hover:bg-ink/[0.04]"}`}
                >
                  <p className="kicker text-xs">{t.label}</p>
                  <p className="text-[0.65rem] text-muted mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="kicker mb-2">UKURAN</p>
            <div className="grid grid-cols-2 gap-2">
              {SIZES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSizeIdx(i)}
                  className={`border p-3 text-left transition-colors ${sizeIdx === i ? "border-accent bg-accent/5" : "rule-soft hover:bg-ink/[0.04]"}`}
                >
                  <p className="kicker text-xs">{s.label}</p>
                  <p className="text-[0.65rem] text-muted mt-1">{s.w}×{s.h}</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="kicker mb-2">EDIT TEKS</p>
            <label className="block text-xs text-muted mb-1">Judul</label>
            <textarea
              className="w-full border rule-soft bg-transparent px-3 py-2 text-sm"
              rows={3}
              value={title}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
            {template === "quote" && (
              <>
                <label className="block text-xs text-muted mb-1 mt-3">Kutipan</label>
                <textarea
                  className="w-full border rule-soft bg-transparent px-3 py-2 text-sm"
                  rows={4}
                  value={quote}
                  placeholder="Sorot satu kalimat dari artikel buat dijadikan kutipan."
                  onChange={(e) => setQuote(e.target.value)}
                />
              </>
            )}
          </section>

          <section className="space-y-2">
            <button
              onClick={download}
              disabled={busy}
              className="w-full bg-ink text-paper px-4 py-3 kicker disabled:opacity-50"
            >
              {busy ? "MEMBUAT…" : "DOWNLOAD PNG"}
            </button>
            <button
              onClick={shareIGStory}
              disabled={busy}
              className="w-full border-2 border-accent text-accent px-4 py-3 kicker hover:bg-accent hover:text-paper disabled:opacity-50"
            >
              SHARE KE INSTAGRAM STORY
            </button>
            <button
              onClick={shareWA}
              className="w-full border rule-soft px-4 py-3 kicker hover:bg-ink hover:text-paper"
            >
              SHARE KE WHATSAPP
            </button>
          </section>

          <p className="text-xs text-muted">
            Tip: IG Story sharing langsung jalan di mobile (Chrome / Safari). Di desktop, download PNG dulu lalu upload manual.
          </p>
        </aside>
      </div>
    </div>
  );
}
