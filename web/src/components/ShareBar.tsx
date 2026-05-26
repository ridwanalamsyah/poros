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

  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} — ${fullUrl}`)}`;

  const btn = "inline-flex items-center gap-2 border rule-soft px-3 py-1.5 hover:bg-ink/[0.05] text-sm";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="kicker text-muted mr-1">SHARE</span>
      <a href={wa} target="_blank" rel="noopener noreferrer" className={btn}>
        <Icon d="M21 12a9 9 0 1 1-3.5-7.1L21 3l-1.2 3.5A9 9 0 0 1 21 12z" />
        WhatsApp
      </a>
      {slug && (
        <Link to={`/share/${slug}`} className={`${btn} bg-ink text-paper border-ink hover:opacity-80`}>
          <IGIcon />
          Instagram Story
        </Link>
      )}
    </div>
  );
}
