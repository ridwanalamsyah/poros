import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { useSettings } from "../hooks/useSettings";
import { TipJar } from "./TipJar";
import { NewsletterSignup } from "./NewsletterSignup";

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.6c0-.9.25-1.5 1.5-1.5h1.6V4.4C16.3 4.3 15.4 4.2 14.4 4.2c-2.1 0-3.5 1.3-3.5 3.6V10.5H8.4v3h2.5V21h2.6z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 3h4.7L12 9.4 16.3 3H21l-7 9.2L21.4 21h-4.6l-5-7-5.5 7H1.5l7.6-9.6L3 3z" />
    </svg>
  );
}
function ThreadsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <path d="M12 4c4.5 0 7 2.7 7 6 0 2-1 3.6-2.7 4.4-1.4.6-3.3.6-4.3.6m0 0c-2.2 0-3.5-1.1-3.5-2.5 0-1.5 1.4-2.5 3.5-2.5 2 0 3.7.7 4.5 2.6.8 2-.4 4.4-3.6 4.4-3.2 0-5-2.4-5-5.5C7.9 7.4 9.5 4 12 4z" />
    </svg>
  );
}
function BlueskyIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 4c2.4 1.7 4.6 5 6 8 1.4-3 3.6-6.3 6-8 1.5-1 4-1 4 2 0 1-.2 3.6-.4 4.6-.3 1.5-1.5 2-3.4 2.2 2 .4 3.4 1.4 3.4 3.3 0 2-2 3.4-3.4 3.4-2.7 0-4.6-2.5-6.2-5-1.6 2.5-3.5 5-6.2 5-1.4 0-3.4-1.4-3.4-3.4 0-1.9 1.4-2.9 3.4-3.3-1.9-.2-3.1-.7-3.4-2.2C2.2 9.6 2 7 2 6c0-3 2.5-3 4-2z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4h4v16H4zM6 2.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM10 8h3.7v2.2c.5-1 1.9-2.4 4.3-2.4 4.6 0 5 2.9 5 6.7V20h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20h-4z" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 9 2 12 2 12s0 3 .4 4.8a2.6 2.6 0 0 0 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8C22 15 22 12 22 12s0-3-.4-4.8zM10 15V9l5 3z" />
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
  const { data: categories } = useCategories();
  const settings = useSettings();
  const s = settings.socialLinks ?? {};
  const socials: { href?: string; label: string; node: JSX.Element }[] = [
    { href: s.instagram, label: "Instagram", node: <InstagramIcon /> },
    { href: s.twitter, label: "X / Twitter", node: <XIcon /> },
    { href: s.threads, label: "Threads", node: <ThreadsIcon /> },
    { href: s.bluesky, label: "Bluesky", node: <BlueskyIcon /> },
    { href: s.facebook, label: "Facebook", node: <FacebookIcon /> },
    { href: s.linkedin, label: "LinkedIn", node: <LinkedInIcon /> },
    { href: s.youtube, label: "YouTube", node: <YoutubeIcon /> },
  ];
  const activeSocials = socials.filter((x) => !!x.href);

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
          Velvet Collapse
        </Link>
        <p className="kicker text-paper/75 mt-1 tracking-[0.4em]">MAGAZINE — DEPARTMENT</p>
        <p className="text-paper/55 italic mt-2 text-sm">Built from the mess.</p>

        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 kicker text-paper">
          <Link to="/" className="hover:opacity-70 transition-opacity">HOME</Link>
          {categories?.map((c) => (
            <Link key={c._id} to={`/category/${c.slug}`} className="hover:opacity-70 transition-opacity">{c.title}</Link>
          ))}
          <Link to="/editions" className="hover:opacity-70 transition-opacity">EDITIONS</Link>
          <Link to="/notes" className="hover:opacity-70 transition-opacity">NOTES</Link>
          <Link to="/shop" className="hover:opacity-70 transition-opacity">SHOP</Link>
          <Link to="/about" className="hover:opacity-70 transition-opacity">ABOUT</Link>
        </nav>

        <div className="mt-5 flex items-center justify-center gap-5 text-paper">
          {activeSocials.map((soc) => (
            <a
              key={soc.label}
              href={soc.href}
              target="_blank"
              rel="noreferrer"
              aria-label={soc.label}
              className="hover:opacity-70 transition-opacity"
            >
              {soc.node}
            </a>
          ))}
          <a href="/rss.xml" aria-label="RSS feed" className="hover:opacity-70 transition-opacity"><RssIcon /></a>
        </div>

        <div className="mt-10 max-w-md mx-auto text-left">
          <NewsletterSignup variant="footer" />
        </div>

        <div className="mt-8 flex justify-center">
          <TipJar compact />
        </div>

        <p className="stat text-paper/55 mt-8 tracking-[0.18em]">
          VELVET COLLAPSE · {new Date().getFullYear()} · BANDUNG
        </p>
      </div>
    </footer>
  );
}
