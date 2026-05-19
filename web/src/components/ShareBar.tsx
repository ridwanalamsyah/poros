import { useState } from "react";

function Icon({ d, fill = false }: { d: string; fill?: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d={d} /></svg>;
}

export function ShareBar({ url, title }: { url: string; title: string }) {
  const fullUrl = typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;
  const [copied, setCopied] = useState(false);

  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} — ${fullUrl}`)}`;
  const x = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="kicker text-muted mr-1">SHARE</span>
      <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border rule-soft px-3 py-1.5 hover:bg-ink/[0.05] text-sm">
        <Icon d="M21 12a9 9 0 1 1-3.5-7.1L21 3l-1.2 3.5A9 9 0 0 1 21 12z" />
        WhatsApp
      </a>
      <a href={x} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border rule-soft px-3 py-1.5 hover:bg-ink/[0.05] text-sm">
        <Icon d="M4 4l16 16M20 4L4 20" />
        X
      </a>
      <a href={tg} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border rule-soft px-3 py-1.5 hover:bg-ink/[0.05] text-sm">
        <Icon d="M21 4L3 11l5 2 2 6 3-3 5 4 3-16z" />
        Telegram
      </a>
      <a href={fb} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border rule-soft px-3 py-1.5 hover:bg-ink/[0.05] text-sm">
        <Icon d="M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3V3z" />
        Facebook
      </a>
      <button onClick={copy} className="inline-flex items-center gap-2 border rule-soft px-3 py-1.5 hover:bg-ink/[0.05] text-sm">
        <Icon d="M9 9h11v11H9zM5 5h11v3M5 5v11h3" />
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
