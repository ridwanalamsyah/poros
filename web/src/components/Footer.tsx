import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";

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
          POROS
        </Link>
        <p className="kicker text-paper/75 mt-1 tracking-[0.4em]">MAGAZINE</p>

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
          <a href="https://instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:opacity-70 transition-opacity"><InstagramIcon /></a>
          <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X / Twitter" className="hover:opacity-70 transition-opacity"><XIcon /></a>
          <a href="https://facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:opacity-70 transition-opacity"><FacebookIcon /></a>
          <a href="/rss.xml" aria-label="RSS feed" className="hover:opacity-70 transition-opacity"><RssIcon /></a>
        </div>

        <p className="stat text-paper/55 mt-8 tracking-[0.18em]">
          POROS · {new Date().getFullYear()} · BANDUNG
        </p>
      </div>
    </footer>
  );
}
