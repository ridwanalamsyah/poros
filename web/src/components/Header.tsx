import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { useTheme } from "../hooks/useTheme";
import { useCart } from "../hooks/useCart";
import { useArticleSearch } from "../hooks/useSearch";

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
      <path d="M5 7h14l-1.5 10.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M19.5 4.5l-2 2M6.5 17.5l-2 2" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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

  return (
    <>
      {/* Mobile header — Consumed style: hamburger | logo | search/cart */}
      <header className="md:hidden border-b rule-soft sticky top-0 z-30 bg-paper">
        <div className="flex items-center justify-between px-4 h-14">
          <button aria-label="Menu" onClick={() => setMenuOpen(true)} className="p-2 -ml-2">
            <MenuIcon />
          </button>
          <Link to="/" className="font-logo text-3xl tracking-wider">POROS</Link>
          <div className="flex items-center gap-1">
            <button aria-label="Search" onClick={() => setSearchOpen(true)} className="p-2"><SearchIcon /></button>
            <Link to="/shop" aria-label="Shop" className="p-2 relative">
              <CartIcon />
              {totalCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-paper text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center">{totalCount}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop header — Consumed style: big centered wordmark + tagline + horizontal nav. Compact sticky when scrolled. */}
      <header className={`hidden md:block bg-paper sticky top-0 z-30 transition-[padding] ${scrolled ? "border-b rule-soft" : ""}`}>
        <div className="max-w-[1440px] mx-auto px-8 lg:px-12">
          {/* Top utility row */}
          <div className={`flex items-center justify-between text-[0.7rem] tracking-[0.18em] uppercase text-muted ${scrolled ? "h-0 overflow-hidden opacity-0" : "py-2.5 opacity-100"} transition-all duration-200`}>
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · Bandung</span>
            <div className="flex items-center gap-4">
              <Link to="/submit" className="hover-underline">Submit Pitch</Link>
              <Link to="/letters" className="hover-underline">Letters</Link>
              <button onClick={toggleTheme} className="flex items-center gap-1.5 hover:opacity-80" aria-label="Toggle theme">
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                <span>{theme === "dark" ? "Light" : "Dark"}</span>
              </button>
            </div>
          </div>

          {/* Wordmark */}
          <div className={`text-center ${scrolled ? "py-3" : "pt-4 pb-2"} transition-[padding]`}>
            <Link to="/" className="inline-block">
              <span className="font-logo tracking-wider block leading-none" style={{ fontSize: scrolled ? "clamp(2.4rem, 4vw, 3.4rem)" : "clamp(4rem, 8vw, 7rem)" }}>
                POROS
              </span>
              {!scrolled && (
                <span className="kicker text-muted block mt-2 tracking-[0.45em]">LABOR · SOCIETY · CULTURE</span>
              )}
            </Link>
          </div>

          {/* Primary nav */}
          <nav className="border-t rule-soft">
            <div className="flex items-center justify-between gap-6 py-2.5">
              <div className="flex items-center gap-5 kicker">
                <NavLink to="/" end className={({ isActive }) => `hover-underline ${isActive ? "opacity-100" : "opacity-80"}`}>HOME</NavLink>
                {categories?.map((c) => (
                  <NavLink key={c._id} to={`/category/${c.slug}`} className={({ isActive }) => `hover-underline ${isActive ? "opacity-100" : "opacity-80"}`}>{c.title}</NavLink>
                ))}
                <NavLink to="/editions" className={({ isActive }) => `hover-underline ${isActive ? "opacity-100" : "opacity-80"}`}>EDITIONS</NavLink>
                <NavLink to="/notes" className={({ isActive }) => `hover-underline ${isActive ? "opacity-100" : "opacity-80"}`}>NOTES</NavLink>
                <NavLink to="/shop" className={({ isActive }) => `hover-underline ${isActive ? "opacity-100" : "opacity-80"}`}>SHOP</NavLink>
                <NavLink to="/about" className={({ isActive }) => `hover-underline ${isActive ? "opacity-100" : "opacity-80"}`}>ABOUT</NavLink>
              </div>
              <div className="flex items-center gap-1">
                <button aria-label="Search" onClick={() => setSearchOpen(true)} className="p-2 hover:opacity-70"><SearchIcon /></button>
                <NavLink to="/saved" aria-label="Saved" className="p-2 kicker hover:opacity-70">SAVED</NavLink>
                <Link to="/shop" aria-label="Shop" className="p-2 hover:opacity-70 relative">
                  <CartIcon />
                  {totalCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-paper text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center">{totalCount}</span>
                  )}
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-paper text-ink md:hidden">
          <div className="flex items-center justify-between px-4 h-14 border-b rule-soft">
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="p-2 -ml-2"><CloseIcon /></button>
            <Link to="/" className="font-logo text-3xl tracking-wider">POROS</Link>
            <div className="w-10" />
          </div>
          <nav className="flex flex-col px-6 pt-8 pb-12 gap-3 headline-display text-4xl">
            <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
            {categories?.map((c) => (
              <NavLink key={c._id} to={`/category/${c.slug}`} onClick={() => setMenuOpen(false)}>
                <span className="capitalize">{c.title.toLowerCase()}</span>
              </NavLink>
            ))}
            <NavLink to="/editions" onClick={() => setMenuOpen(false)}>Editions</NavLink>
            <NavLink to="/notes" onClick={() => setMenuOpen(false)}>Notes</NavLink>
            <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink to="/saved" onClick={() => setMenuOpen(false)}>Saved</NavLink>
            <NavLink to="/submit" onClick={() => setMenuOpen(false)}>Submit pitch</NavLink>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t rule-soft flex items-center justify-between stat">
            <span>Bandung</span>
            <button onClick={toggleTheme} className="flex items-center gap-2">{theme === "dark" ? <SunIcon /> : <MoonIcon />}{theme === "dark" ? "Light" : "Dark"}</button>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-paper text-ink">
          <div className="flex items-center gap-2 px-4 md:px-8 h-14 border-b rule-soft">
            <SearchIcon />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari artikel, tag, atau penulis…"
              className="flex-1 bg-transparent outline-none headline text-lg"
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
                    <span className="kicker text-muted shrink-0">{a.category?.title}</span>
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
