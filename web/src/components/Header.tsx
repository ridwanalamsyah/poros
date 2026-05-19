import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { useTheme } from "../hooks/useTheme";
import { useCart } from "../hooks/useCart";
import { useArticleSearch } from "../hooks/useSearch";

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <path d="M5 7h14l-1.5 10.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <path d="M6 4h12v17l-6-4-6 4V4z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M19.5 4.5l-2 2M6.5 17.5l-2 2" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
    </svg>
  );
}

export function Header() {
  const { data: categories } = useCategories();
  const { theme, toggle: toggleTheme } = useTheme();
  const { totalCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = useArticleSearch(query);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setQuery("");
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen || searchOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const iconBtn = "p-2 hover:opacity-60 transition-opacity";
  const iconBtnRel = `${iconBtn} relative`;

  return (
    <>
      {/* Unified header (mobile + desktop) — Consumed-style: hamburger | wordmark | icons. No text nav. */}
      <header className={`sticky top-0 z-30 bg-paper transition-shadow ${scrolled ? "border-b rule-soft shadow-sm" : ""}`}>
        <div className={`grid grid-cols-[1fr_auto_1fr] items-center px-3 md:px-8 ${scrolled ? "h-14 md:h-16" : "h-16 md:h-[88px]"} transition-[height] duration-200`}>
          {/* Left: hamburger */}
          <div className="flex items-center">
            <button aria-label="Menu" onClick={() => setMenuOpen(true)} className={`${iconBtn} -ml-2`}>
              <MenuIcon />
            </button>
          </div>

          {/* Center: wordmark */}
          <Link to="/" className="block text-center select-none whitespace-nowrap leading-none">
            <span
              className="font-logo tracking-wider block leading-none"
              style={{ fontSize: scrolled ? "clamp(1.6rem, 3.4vw, 2.2rem)" : "clamp(2.4rem, 5.4vw, 3.4rem)" }}
            >
              POROS
            </span>
          </Link>

          {/* Right: icons */}
          <div className="flex items-center justify-end -mr-2">
            <button aria-label="Search" onClick={() => setSearchOpen(true)} className={iconBtn}><SearchIcon /></button>
            <NavLink to="/saved" aria-label="Saved" className={`${iconBtn} hidden sm:inline-flex`}><BookmarkIcon /></NavLink>
            <button onClick={toggleTheme} aria-label="Toggle theme" className={`${iconBtn} hidden sm:inline-flex`}>
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link to="/shop" aria-label="Cart" className={iconBtnRel}>
              <CartIcon />
              {totalCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-accent text-paper text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center">{totalCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Tagline beneath wordmark — only when not scrolled */}
        {!scrolled && (
          <p className="text-center kicker tracking-[0.4em] text-muted pb-4 -mt-1 text-[0.65rem] md:text-[0.7rem]">
            LIFE · CITY · CULTURE
          </p>
        )}
      </header>

      {/* Full-screen drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-paper text-ink overflow-y-auto">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-3 md:px-8 h-16 md:h-[88px] border-b rule-soft">
            <div>
              <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="p-2 -ml-2"><CloseIcon /></button>
            </div>
            <Link to="/" className="font-logo tracking-wider whitespace-nowrap leading-none" style={{ fontSize: "clamp(2.4rem, 5.4vw, 3.4rem)" }}>POROS</Link>
            <div />
          </div>

          <div className="max-w-3xl mx-auto px-6 md:px-8 pt-10 pb-16">
            <p className="kicker text-accent mb-6">EXPLORE</p>
            <nav className="flex flex-col gap-2 headline-display text-4xl md:text-5xl leading-[1.05]">
              <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "" : "opacity-70 hover:opacity-100"}>Home</NavLink>
              {categories?.map((c) => (
                <NavLink key={c._id} to={`/category/${c.slug}`} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "" : "opacity-70 hover:opacity-100"}>
                  <span className="capitalize">{c.title.toLowerCase()}</span>
                </NavLink>
              ))}
              <NavLink to="/editions" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "" : "opacity-70 hover:opacity-100"}>Editions</NavLink>
              <NavLink to="/notes" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "" : "opacity-70 hover:opacity-100"}>Notes</NavLink>
              <NavLink to="/shop" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "" : "opacity-70 hover:opacity-100"}>Shop</NavLink>
              <NavLink to="/about" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "" : "opacity-70 hover:opacity-100"}>About</NavLink>
            </nav>

            <div className="border-t rule-soft mt-12 pt-6 grid grid-cols-2 gap-y-3 gap-x-8 kicker">
              <NavLink to="/saved" onClick={() => setMenuOpen(false)} className="hover-underline">Saved</NavLink>
              <NavLink to="/tags" onClick={() => setMenuOpen(false)} className="hover-underline">Tags</NavLink>
              <NavLink to="/submit" onClick={() => setMenuOpen(false)} className="hover-underline">Submit pitch</NavLink>
              <NavLink to="/letters" onClick={() => setMenuOpen(false)} className="hover-underline">Letters</NavLink>
              <button onClick={toggleTheme} className="text-left hover-underline">{theme === "dark" ? "Light mode" : "Dark mode"}</button>
              <span className="text-muted">POROS · Bandung</span>
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-paper text-ink overflow-y-auto">
          <div className="flex items-center gap-2 px-4 md:px-8 h-16 md:h-[88px] border-b rule-soft">
            <SearchIcon />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari artikel, tag, atau penulis…"
              className="flex-1 bg-transparent outline-none headline-display text-2xl md:text-3xl"
              onKeyDown={(e) => { if (e.key === "Escape") setSearchOpen(false); }}
            />
            <button aria-label="Close search" onClick={() => setSearchOpen(false)} className="p-2 -mr-2"><CloseIcon /></button>
          </div>
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
            {query.length === 0 && <p className="text-muted text-sm">Ketik untuk mulai mencari.</p>}
            {query.length > 0 && results.length === 0 && <p className="text-muted text-sm">Tidak ada hasil untuk &ldquo;{query}&rdquo;.</p>}
            <ul className="divide-y rule-soft">
              {results.map((a) => (
                <li key={a._id}>
                  <button
                    onClick={() => { navigate(`/article/${a.slug}`); setSearchOpen(false); }}
                    className="w-full text-left py-4 flex items-baseline gap-4 hover:opacity-70"
                  >
                    <span className="kicker text-muted shrink-0 w-24">{a.category?.title}</span>
                    <span className="flex-1">
                      <span className="headline-display text-2xl block">{a.title}</span>
                      {a.excerpt && <span className="text-sm text-muted block mt-1">{a.excerpt}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
