import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { useTheme } from "../hooks/useTheme";
import { useCart } from "../hooks/useCart";
import { useArticleSearch } from "../hooks/useSearch";
import { useAsync } from "../hooks/useAsync";
import { getSettings } from "../data/api";

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
function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  );
}
function CartIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.5 3.5h2.4l.5 2.2h14.2l-2 9.6a1.5 1.5 0 0 1-1.47 1.2H9.04a1.5 1.5 0 0 1-1.47-1.2L5.4 4.5l-.4-1H3.5v0zm5.6 17.5a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2zm8.4 0a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2z" />
    </svg>
  );
}
function BookmarkIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <path d="M6 4h12v17l-6-4-6 4V4z" />
    </svg>
  );
}
function SunIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M19.5 4.5l-2 2M6.5 17.5l-2 2" />
    </svg>
  );
}
function MoonIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
    </svg>
  );
}
function GlobeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
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
  const { data: settings } = useAsync(() => getSettings(), []);
  const rawWordmark = settings?.brandWordmark?.trim() || settings?.siteTitle?.trim() || "Velvet Collapse";
  const wordmark = rawWordmark.replace(/\s*magazine\s*$/i, "").trim() || rawWordmark;

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
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Wordmark stays full size on scroll; only the MAGAZINE kicker collapses so
  // the header gets cleaner without making the brand jump or shrink. The kicker
  // collapses its margin-top as well so the wordmark lands exactly on the row
  // center (h-[72px]) once the kicker is hidden, instead of sitting slightly above.
  const kickerOpacity = scrolled ? 0 : 1;
  const kickerMaxHeight = scrolled ? "0px" : "16px";
  const kickerMarginTop = scrolled ? "0px" : "4px";

  const navLinkCls = ({ isActive }: { isActive: boolean }) =>
    `kicker tracking-[0.18em] py-1 transition-opacity ${isActive ? "opacity-100" : "opacity-80 hover:opacity-100"}`;

  const utilityIcon = "p-1.5 hover:opacity-60 transition-opacity";

  return (
    <>
      {/* Desktop header — Consumed layout, height-locked to avoid scroll jump */}
      <header className={`hidden md:block bg-paper sticky top-0 z-30 transition-shadow ${scrolled ? "shadow-sm" : ""}`}>
        <div className="max-w-[1280px] mx-auto px-8">
          {/* Row 1: wordmark center + utility icons right — fixed height, scaled wordmark on scroll */}
          <div className="relative grid grid-cols-3 items-center h-[72px]">
            <div /> {/* left spacer */}
            <Link
              to="/"
              className="text-center select-none whitespace-nowrap leading-none"
            >
              <span
                className="font-logo block leading-none"
                style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.3rem)", letterSpacing: "0.03em" }}
              >
                {wordmark}
              </span>
              <span
                aria-hidden="true"
                className="block tracking-[0.5em] text-[0.5rem] font-medium overflow-hidden"
                style={{
                  opacity: kickerOpacity,
                  marginTop: kickerMarginTop,
                  maxHeight: kickerMaxHeight,
                  transition: "opacity 0.32s ease-out, max-height 0.32s ease-out, margin-top 0.32s ease-out",
                }}
              >
                MAGAZINE
              </span>
            </Link>
            <div className="flex items-center justify-end gap-3">
              <a href="https://instagram.com/velcolmagazine" target="_blank" rel="noopener noreferrer" className="kicker tracking-[0.18em] opacity-80 hover:opacity-100">FOLLOW</a>
              <button onClick={toggleTheme} aria-label="Toggle theme" className={utilityIcon}>
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
              <Link to="/about" aria-label="About" className={utilityIcon}><GlobeIcon /></Link>
              <NavLink to="/saved" aria-label="Saved" className={utilityIcon}><BookmarkIcon /></NavLink>
              <button onClick={() => setSearchOpen(true)} aria-label="Search" className={utilityIcon}><SearchIcon /></button>
              <Link to="/cart" aria-label="Cart" className={`${utilityIcon} relative`}>
                <CartIcon />
                {totalCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-paper text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center">{totalCount}</span>
                )}
              </Link>
            </div>
          </div>

        </div>
        {/* Row 2 wrapper: full-bleed top + bottom rule */}
        <nav className="border-y rule">
          <div className="max-w-[1280px] mx-auto px-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 py-3">
              <div />
              <div className="flex items-center justify-center gap-6 lg:gap-9">
                <NavLink to="/" end className={navLinkCls}>HOME</NavLink>
                {categories?.map((c) => (
                  <NavLink key={c._id} to={`/category/${c.slug}`} className={navLinkCls}>{c.title.toUpperCase()}</NavLink>
                ))}
                <NavLink to="/editions" className={navLinkCls}>EDITIONS</NavLink>
                <NavLink to="/notes" className={navLinkCls}>NOTES</NavLink>
                <NavLink to="/about" className={navLinkCls}>ABOUT</NavLink>
              </div>
              <div className="flex justify-end">
                <NavLink to="/shop" className={navLinkCls}>SHOP</NavLink>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile header — Consumed mobile pattern: wordmark on top, icon row, then hamburger row */}
      <header className="md:hidden bg-paper sticky top-0 z-30 border-b rule">
        <div className="px-5 pt-3 pb-2 text-center">
          <Link to="/" className="inline-block leading-none">
            <span className="font-logo block leading-none" style={{ fontSize: "clamp(1.25rem, 5.5vw, 1.75rem)", letterSpacing: "0.03em" }}>{wordmark}</span>
            <span aria-hidden="true" className="block mt-1 tracking-[0.5em] text-[0.5rem] font-medium">MAGAZINE</span>
          </Link>
        </div>
        <div className="px-3 pb-2 flex items-center justify-center gap-2 flex-wrap">
          <a href="https://instagram.com/velcolmagazine" target="_blank" rel="noopener noreferrer" className="kicker tracking-[0.18em] opacity-80 px-1.5">FOLLOW</a>
          <button onClick={toggleTheme} aria-label="Toggle theme" className={utilityIcon}>
            {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
          <Link to="/about" aria-label="About" className={utilityIcon}><GlobeIcon size={18} /></Link>
          <NavLink to="/saved" aria-label="Saved" className={utilityIcon}><BookmarkIcon size={18} /></NavLink>
          <button onClick={() => setSearchOpen(true)} aria-label="Search" className={utilityIcon}><SearchIcon size={18} /></button>
          <Link to="/cart" aria-label="Cart" className={`${utilityIcon} relative`}>
            <CartIcon size={20} />
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-paper text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center">{totalCount}</span>
            )}
          </Link>
        </div>
        <div className="border-t rule py-1.5 flex items-center justify-center">
          <button onClick={() => setMenuOpen(true)} aria-label="Menu" className="border rule-soft px-5 py-1.5">
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* Full-screen drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-paper text-ink overflow-y-auto">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-3 md:px-8 h-16 md:h-[88px] border-b-[6px] rule">
            <div>
              <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="p-2 -ml-2"><CloseIcon /></button>
            </div>
            <Link to="/" className="text-center leading-none whitespace-nowrap">
              <span className="font-logo block leading-none" style={{ fontSize: "clamp(2rem, 5vw, 2.6rem)", letterSpacing: "0.03em" }}>{wordmark}</span>
              <span aria-hidden="true" className="block mt-1 tracking-[0.5em] text-[0.55rem] font-medium">MAGAZINE</span>
            </Link>
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
              <span className="text-muted">Velvet Collapse · Bandung</span>
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
              placeholder="Search articles, tags, or authors…"
              className="flex-1 bg-transparent outline-none headline-display text-2xl md:text-3xl"
              onKeyDown={(e) => { if (e.key === "Escape") setSearchOpen(false); }}
            />
            <button aria-label="Close search" onClick={() => setSearchOpen(false)} className="p-2 -mr-2"><CloseIcon /></button>
          </div>
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
            {query.length === 0 && <p className="text-muted text-sm">Type to start searching.</p>}
            {query.length > 0 && results.length === 0 && <p className="text-muted text-sm">No results for &ldquo;{query}&rdquo;.</p>}
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
