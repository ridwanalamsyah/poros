import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getAuthors } from "../data/api";
import { SmartImage } from "../components/SmartImage";
import { SEO } from "../components/SEO";

export function AboutPage() {
  const { data: authors } = useAsync(() => getAuthors(), []);
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-0 pt-6 md:pt-14 pb-10">
      <SEO title="About" description="About Velvet Collapse — built from the mess. A magazine from Bandung." />
      <header className="border-b rule-soft pb-6 mb-10">
        <p className="kicker text-accent">ABOUT</p>
        <h1 className="headline-display text-4xl md:text-6xl mt-2">Built from the mess.</h1>
        <p className="text-muted mt-3 italic">Velvet Collapse — from Bandung, for the people who work.</p>
      </header>
      <div className="article-body">
        <p>Velvet Collapse is an independent online magazine based in Bandung. We write about labour, social conditions, and popular culture; about the people who are more often counted as data than as humans.</p>
        <p>We publish a themed edition every two months. In between, we run short pieces and Notes. The weekly newsletter is the fastest way to follow along.</p>
        <p>Not affiliated with any political party. Not affiliated with any large media company. Funding comes from print edition sales, reader contributions, and transparent editorial collaborations.</p>
        <p>Pitch a piece or photography: <Link to="/submit">submit a pitch</Link>. Feedback: <Link to="/letters">letters to editor</Link>.</p>
      </div>

      <section className="mt-12 pt-10 border-t rule-soft">
        <p className="kicker text-accent mb-2">MASTHEAD</p>
        <h2 className="headline-display text-3xl mt-1">Editors.</h2>
        <ul className="mt-6 grid sm:grid-cols-2 gap-6">
          <li>
            <p className="headline text-lg">Raditya Fitra</p>
            <p className="kicker text-muted mt-1">EDITOR</p>
          </li>
          <li>
            <p className="headline text-lg">Ridwan Alamsyah</p>
            <p className="kicker text-muted mt-1">EDITOR</p>
          </li>
        </ul>
      </section>

      {authors && authors.length > 0 && (
        <section className="mt-12 pt-10 border-t rule-soft">
          <h2 className="kicker mb-6">EDITORIAL & CONTRIBUTORS</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {authors.map((a) => (
              <Link key={a._id} to={`/author/${a.slug}`} className="flex gap-3 items-start hover:opacity-80">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-ink/[0.06] shrink-0">
                  <SmartImage image={a.image} className="w-full h-full" width={120} />
                </div>
                <div>
                  <p className="headline text-sm">{a.name}</p>
                  {a.bio && <p className="text-xs text-muted mt-1 line-clamp-3">{a.bio}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
