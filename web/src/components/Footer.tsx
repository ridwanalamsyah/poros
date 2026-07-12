import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getSettings } from "../data/api";
import { TipJar } from "./TipJar";

function InstagramIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function RssIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const { data: settings } = useAsync(() => getSettings(), []);

  const rawWordmark = settings?.brandWordmark?.trim() || settings?.siteTitle?.trim() || "Velvet Collapse";
  const wordmark = rawWordmark.replace(/\s*magazine\s*$/i, "").trim() || rawWordmark;
  const tagline = settings?.footerTagline?.trim() || "Built from the mess.";

  return (
    <footer className="relative bg-ink text-paper overflow-hidden mt-16 md:mt-24">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/gothic-pattern.jpg)",
          backgroundSize: "220px auto",
          backgroundRepeat: "repeat",
          opacity: 0.42,
        }}
      />
      <div aria-hidden className="absolute inset-0 pointer-events-none bg-ink/40" />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 py-10 md:py-14 text-center">
        <Link
          to="/"
          className="font-logo leading-none tracking-wide text-paper inline-block"
          style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}
        >
          {wordmark}
        </Link>
        <p aria-hidden="true" className="kicker text-paper/75 mt-1 tracking-[0.4em]">MAGAZINE</p>
        <p className="text-paper/55 italic mt-2 text-sm">{tagline}</p>

        <div className="mt-5">
          <TipJar placementOverride="button" />
        </div>

        <div className="mt-6 flex items-center justify-center gap-5 text-paper">
          <a
            href="https://instagram.com/velcolmagazine"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram — @velcolmagazine"
            className="hover:opacity-70 transition-opacity"
          >
            <InstagramIcon />
          </a>
          <a href="/rss.xml" aria-label="RSS feed" className="hover:opacity-70 transition-opacity"><RssIcon /></a>
        </div>
      </div>
    </footer>
  );
}
