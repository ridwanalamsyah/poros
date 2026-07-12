import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getArticle } from "../data/api";
import { SEO } from "../components/SEO";
import { imageUrl } from "../sanity";

type Template = "title" | "cover" | "quote";
type Size = { id: "story" | "square"; w: number; h: number; label: string };

const SIZES: Size[] = [
  { id: "story", w: 1080, h: 1920, label: "Story · 9:16" },
  { id: "square", w: 1080, h: 1080, label: "Square · 1:1" },
];

const TEMPLATES: { id: Template; label: string }[] = [
  { id: "title", label: "Title" },
  { id: "cover", label: "Cover" },
  { id: "quote", label: "Quote" },
];

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}

function wrapText(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line ? line + " " + w : w).length <= maxCharsPerLine) {
      line = line ? line + " " + w : w;
    } else {
      if (line) lines.push(line);
      line = w;
      if (lines.length >= maxLines) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length >= maxLines) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.replace(/\s+\S+$/, "…");
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
  wordmark,
  pirataFontDataUrl,
}: {
  template: Template;
  size: Size;
  title: string;
  author: string;
  category: string;
  quote: string;
  imgDataUrl: string | null;
  wordmark: string;
  pirataFontDataUrl: string | null;
}): string {
  const { w, h } = size;
  const ink = "#111111";
  const paper = "#fafaf7";
  const muted = "#6b6b66";
  const rule = "#e3e1da";

  const pad = Math.round(w * 0.075);
  const fontSerif = "Fraunces, 'Times New Roman', Georgia, serif";
  const fontSans = "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif";
  // Use "Pirata One" first — it is embedded as base64 dataURL below so it renders in PNG export.
  // Fallback to UnifrakturMaguntia / Fraunces for browser preview before font loads.
  const fontLogo = "'Pirata One', UnifrakturMaguntia, Fraunces, serif";

  function footer(yBase: number, fillInk = ink, fillMuted = muted, ruleColor = rule) {
    return `
      <line x1="${pad}" x2="${w - pad}" y1="${yBase - 70}" y2="${yBase - 70}" stroke="${ruleColor}" stroke-width="2"/>
      <g transform="translate(${pad}, ${yBase})">
        <text font-family="${fontLogo}" font-size="${Math.round(w * 0.06)}" fill="${fillInk}">${escapeXml(wordmark)}</text>
        <text y="${Math.round(w * 0.035)}" font-family="${fontSans}" font-size="${Math.round(w * 0.018)}" letter-spacing="4" fill="${fillMuted}">VELCOLMAGAZINE</text>
      </g>`;
  }

  let body = "";

  if (template === "cover" && imgDataUrl) {
    const imgH = Math.round(h * 0.5);
    const titleLines = wrapText(title, size.id === "story" ? 22 : 28, 5);
    const titleSize = size.id === "story" ? 76 : 62;
    const lh = titleSize * 1.08;
    const textY = imgH + Math.round(h * 0.06);
    body = `
      <rect width="${w}" height="${h}" fill="${paper}"/>
      <image href="${imgDataUrl}" x="0" y="0" width="${w}" height="${imgH}" preserveAspectRatio="xMidYMid slice"/>
      <g transform="translate(${pad}, ${textY})">
        ${category ? `<text font-family="${fontSans}" font-size="${Math.round(w * 0.022)}" letter-spacing="6" fill="${muted}">${escapeXml(category.toUpperCase())}</text>` : ""}
        ${titleLines.map((ln, i) => `<text y="${(category ? 60 : 0) + i * lh + lh * 0.7}" font-family="${fontSerif}" font-size="${titleSize}" font-weight="600" fill="${ink}" letter-spacing="-1">${escapeXml(ln)}</text>`).join("")}
        ${author ? `<text y="${(category ? 60 : 0) + titleLines.length * lh + 50}" font-family="${fontSans}" font-style="italic" font-size="${Math.round(w * 0.026)}" fill="${muted}">${escapeXml(`By ${author}`)}</text>` : ""}
      </g>
      ${footer(h - pad)}`;
  } else if (template === "quote") {
    const quoteText = (quote || title).replace(/^["“”]|["“”]$/g, "").trim();
    const lines = wrapText(quoteText, size.id === "story" ? 24 : 28, 9);
    const qSize = size.id === "story" ? 64 : 54;
    const lh = qSize * 1.22;
    const totalH = lines.length * lh;
    const startY = Math.round((h - totalH) / 2) - 80;
    body = `
      <rect width="${w}" height="${h}" fill="${paper}"/>
      <text x="${pad}" y="${startY - 80}" font-family="${fontSerif}" font-size="${Math.round(w * 0.16)}" fill="${ink}" opacity="0.12">"</text>
      <g transform="translate(${pad}, ${startY})">
        ${lines.map((ln, i) => `<text y="${i * lh}" font-family="${fontSerif}" font-style="italic" font-size="${qSize}" font-weight="500" fill="${ink}" letter-spacing="-0.5">${escapeXml(ln)}</text>`).join("")}
      </g>
      <g transform="translate(${pad}, ${startY + totalH + 60})">
        <line x1="0" x2="60" y1="0" y2="0" stroke="${ink}" stroke-width="2"/>
        <text y="36" font-family="${fontSans}" font-size="${Math.round(w * 0.024)}" fill="${ink}">${escapeXml(author || "Editor")}</text>
        ${category ? `<text y="${Math.round(w * 0.054)}" font-family="${fontSans}" font-size="${Math.round(w * 0.018)}" letter-spacing="4" fill="${muted}">${escapeXml(category.toUpperCase())}</text>` : ""}
      </g>
      ${footer(h - pad)}`;
  } else {
    // title (default, Substack-style)
    const titleLines = wrapText(title, size.id === "story" ? 20 : 24, 7);
    const titleSize = size.id === "story" ? 86 : 72;
    const lh = titleSize * 1.07;
    const totalH = titleLines.length * lh;
    const startY = Math.round((h - totalH) / 2) - 60;
    body = `
      <rect width="${w}" height="${h}" fill="${paper}"/>
      <g transform="translate(${pad}, ${pad + Math.round(w * 0.02)})">
        ${category ? `<text font-family="${fontSans}" font-size="${Math.round(w * 0.022)}" letter-spacing="6" fill="${muted}">${escapeXml(category.toUpperCase())}</text>` : ""}
      </g>
      <g transform="translate(${pad}, ${startY})">
        ${titleLines.map((ln, i) => `<text y="${i * lh}" font-family="${fontSerif}" font-size="${titleSize}" font-weight="600" fill="${ink}" letter-spacing="-1.5">${escapeXml(ln)}</text>`).join("")}
      </g>
      <g transform="translate(${pad}, ${startY + totalH + 60})">
        ${author ? `<text font-family="${fontSans}" font-style="italic" font-size="${Math.round(w * 0.028)}" fill="${muted}">${escapeXml(`By ${author}`)}</text>` : ""}
      </g>
      ${footer(h - pad)}`;
  }

  // Embed Pirata One blackletter as base64 dataURL inside SVG <defs><style> so the wordmark
  // renders correctly in PNG export (canvas does not load external web fonts via <Image>).
  const fontFace = pirataFontDataUrl
    ? `<defs><style type="text/css"><![CDATA[
        @font-face {
          font-family: "Pirata One";
          src: url("${pirataFontDataUrl}") format("truetype");
          font-weight: 400;
          font-style: normal;
        }
      ]]></style></defs>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${fontFace}${body}</svg>`;
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

async function fontToDataUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
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
  const [searchParams] = useSearchParams();
  const initialQuote = searchParams.get("q") ?? "";
  const { data: article, loading } = useAsync(() => (slug ? getArticle(slug) : Promise.resolve(null)), [slug]);
  const [template, setTemplate] = useState<Template>(initialQuote ? "quote" : "title");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [quote, setQuote] = useState(initialQuote);
  const [editedTitle, setEditedTitle] = useState<string | null>(null);
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null);
  const [pirataFontDataUrl, setPirataFontDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const size = SIZES[sizeIdx];
  const title = editedTitle ?? article?.title ?? "Velvet Collapse";
  const author = article?.author?.name ?? "";
  const category = (article?.category?.title ?? "").toString();
  const wordmark = "Velvet Collapse";

  useEffect(() => {
    if (!article?.coverImage) return;
    const url = imageUrl(article.coverImage, 1200);
    if (!url) return;
    imageToDataUrl(url).then(setImgDataUrl);
  }, [article]);

  // Pre-load Pirata One blackletter as base64 dataURL so the wordmark embeds correctly in PNG export.
  useEffect(() => {
    let cancelled = false;
    fontToDataUrl("/fonts/pirata-one-v23.ttf").then((dataUrl) => {
      if (!cancelled) setPirataFontDataUrl(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const svg = useMemo(
    () => buildSvg({ template, size, title, author, category, quote, imgDataUrl, wordmark, pirataFontDataUrl }),
    [template, size, title, author, category, quote, imgDataUrl, wordmark, pirataFontDataUrl],
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

  async function shareIGStory() {
    setBusy(true);
    setShareError(null);
    try {
      const png = await svgToPng(svg, size.w, size.h);
      if (!png) {
        setShareError("Gagal bikin gambar kartu-nya. Coba download manual, lalu upload sendiri ke Instagram.");
        return;
      }
      const file = new File([png], `velvet-collapse-${article?.slug ?? "share"}.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean; share?: (d: ShareData) => Promise<void> };
      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title, text: title });
      } else {
        // No native file-share support on this browser (common on desktop) —
        // fall back to a plain download with clear instructions instead of
        // silently doing nothing.
        await download();
        setShareError("Browser ini belum support share langsung. Gambar udah ke-download — upload manual ke Instagram Story ya.");
      }
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      if (isAbort) {
        // User closed the native share sheet without picking anything — not
        // an error, don't show a message.
        return;
      }
      setShareError("Share gagal. Coba lagi, atau download manual di bawah.");
    } finally {
      setBusy(false);
    }
  }

  const previewRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-5 pt-10 text-muted">Loading article…</div>;
  }
  if (!article) {
    return <div className="max-w-3xl mx-auto px-5 pt-10 text-muted">Article not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 pt-6 md:pt-12 pb-16">
      <SEO title={`Share — ${article.title}`} description="Make a share card for Instagram Story or WhatsApp." />

      <header className="mb-10">
        <Link to={`/article/${article.slug}`} className="kicker text-muted hover-underline">← BACK TO ARTICLE</Link>
        <h1 className="headline-display text-3xl md:text-4xl mt-4 leading-[1.1]">Share card</h1>
        <p className="text-muted mt-2 text-sm max-w-xl">A quiet, typographic card for Instagram Story or anywhere else. Pick a layout, tweak the text, download.</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-14">
        {/* Preview */}
        <div className="flex items-start justify-center">
          <div
            ref={previewRef}
            className="w-full max-w-sm mx-auto border rule-soft overflow-hidden"
            style={{ aspectRatio: `${size.w} / ${size.h}` }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>

        {/* Controls */}
        <aside className="space-y-8">
          <section>
            <p className="kicker text-muted mb-3">LAYOUT</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  disabled={t.id === "cover" && !imgDataUrl}
                  className={`text-sm px-3 py-1.5 border transition-colors ${
                    template === t.id
                      ? "border-ink bg-ink text-paper"
                      : "rule-soft hover:border-ink disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {!imgDataUrl && (
              <p className="text-xs text-muted mt-2">Cover layout becomes available once the article image loads.</p>
            )}
          </section>

          <section>
            <p className="kicker text-muted mb-3">SIZE</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSizeIdx(i)}
                  className={`text-sm px-3 py-1.5 border transition-colors ${
                    sizeIdx === i ? "border-ink bg-ink text-paper" : "rule-soft hover:border-ink"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <label className="kicker text-muted mb-2 block">TITLE</label>
              <textarea
                className="w-full border-b rule-soft bg-transparent py-2 text-sm focus:outline-none focus:border-ink"
                rows={3}
                value={title}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </div>
            {template === "quote" && (
              <div>
                <label className="kicker text-muted mb-2 block">QUOTE</label>
                <textarea
                  className="w-full border-b rule-soft bg-transparent py-2 text-sm focus:outline-none focus:border-ink"
                  rows={4}
                  value={quote}
                  placeholder="Paste a sentence from the article."
                  onChange={(e) => setQuote(e.target.value)}
                />
              </div>
            )}
          </section>

          <section className="space-y-2 pt-2 border-t rule-soft">
            {shareError && (
              <p className="text-xs text-accent bg-accent/10 border border-accent/30 px-3 py-2" role="alert">
                {shareError}
              </p>
            )}
            <button
              onClick={shareIGStory}
              disabled={busy}
              className="w-full bg-ink text-paper px-4 py-3 kicker disabled:opacity-50"
            >
              {busy ? "PREPARING…" : "SHARE TO INSTAGRAM"}
            </button>
            <button
              onClick={download}
              disabled={busy}
              className="w-full border rule-soft px-4 py-3 kicker hover:border-ink"
            >
              DOWNLOAD PNG
            </button>
            <p className="text-xs text-muted pt-1">
              On mobile, "Share to Instagram" opens the native share sheet (Story / Feed / DM). On desktop, download the PNG and upload manually.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
