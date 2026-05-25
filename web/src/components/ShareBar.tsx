import { useState } from "react";
import { Link } from "react-router-dom";

function Icon({ d, fill = false }: { d: string; fill?: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d={d} /></svg>;
}

function IGIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ShareBar({ url, title, slug }: { url: string; title: string; slug?: string }) {
  const fullUrl = typeof window !== "undefined" ? new URL(url, window.location.origin).toString() : url;
  const [copied, setCopied] = useState(false);

  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} — ${fullUrl}`)}`;
  const x = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
  const threads = `https://www.threads.net/intent/post?text=${encodeURIComponent(`${title} ${fullUrl}`)}`;
  const bluesky = `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${fullUrl}`)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  const btn = "inline-flex items-center gap-2 border rule-soft px-3 py-1.5 hover:bg-ink/[0.05] text-sm";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="kicker text-muted mr-1">SHARE</span>
      <a href={wa} target="_blank" rel="noreferrer" className={btn}>
        <Icon d="M21 12a9 9 0 1 1-3.5-7.1L21 3l-1.2 3.5A9 9 0 0 1 21 12z" />
        WhatsApp
      </a>
      <a href={x} target="_blank" rel="noreferrer" className={btn}>
        <Icon d="M4 4l16 16M20 4L4 20" />
        X
      </a>
      <a href={tg} target="_blank" rel="noreferrer" className={btn}>
        <Icon d="M21 4L3 11l5 2 2 6 3-3 5 4 3-16z" />
        Telegram
      </a>
      <a href={fb} target="_blank" rel="noreferrer" className={btn}>
        <Icon d="M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3V3z" />
        Facebook
      </a>
      <a href={threads} target="_blank" rel="noreferrer" className={btn}>
        <Icon d="M12 4c4.5 0 7 2.7 7 6 0 2-1 3.6-2.7 4.4-1.4.6-3.3.6-4.3.6m0 0c-2.2 0-3.5-1.1-3.5-2.5 0-1.5 1.4-2.5 3.5-2.5 2 0 3.7.7 4.5 2.6.8 2-.4 4.4-3.6 4.4-3.2 0-5-2.4-5-5.5C7.9 7.4 9.5 4 12 4z" />
        Threads
      </a>
      <a href={bluesky} target="_blank" rel="noreferrer" className={btn}>
        <Icon d="M6 4c2.4 1.7 4.6 5 6 8 1.4-3 3.6-6.3 6-8 1.5-1 4-1 4 2 0 1-.2 3.6-.4 4.6-.3 1.5-1.5 2-3.4 2.2 2 .4 3.4 1.4 3.4 3.3 0 2-2 3.4-3.4 3.4-2.7 0-4.6-2.5-6.2-5-1.6 2.5-3.5 5-6.2 5-1.4 0-3.4-1.4-3.4-3.4 0-1.9 1.4-2.9 3.4-3.3-1.9-.2-3.1-.7-3.4-2.2C2.2 9.6 2 7 2 6c0-3 2.5-3 4-2z" fill />
        Bluesky
      </a>
      <a href={linkedin} target="_blank" rel="noreferrer" className={btn}>
        <Icon d="M4 4h4v16H4zM6 2.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM10 8h3.7v2.2c.5-1 1.9-2.4 4.3-2.4 4.6 0 5 2.9 5 6.7V20h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20h-4z" />
        LinkedIn
      </a>
      <button onClick={copy} className={btn}>
        <Icon d="M9 9h11v11H9zM5 5h11v3M5 5v11h3" />
        {copied ? "Copied" : "Copy link"}
      </button>
      {slug && (
        <Link to={`/share/${slug}`} className={`${btn} bg-ink text-paper border-ink hover:opacity-80`}>
          <IGIcon />
          Bikin kartu share
        </Link>
      )}
    </div>
  );
}
